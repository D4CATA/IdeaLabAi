/**
 * FIREBASE REST SERVICE LAYER - PRODUCTION HARDENED
 */
import { AppIdea } from '../types';

export interface MockUser {
  uid: string;
  email: string;
  isPro: boolean;
  plan?: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  emailVerified?: boolean;
  generationsLeft: number;
  lastDailyBonusDate?: string;
  createdAt: number;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

const FIREBASE_API_KEY = "AIzaSyBqaMQx9gjG5b6uBeZAevPcmARf07w_arE";
const GOOGLE_CLIENT_ID = "559431938164-8ti9pt8ekpgf9hkr2svgonnve8pn07lm.apps.googleusercontent.com";
const DB_URL = "https://idealabai-973a0-default-rtdb.firebaseio.com";
const AUTH_KEY = 'idealab_auth_session_v4';

type AuthCallback = (user: MockUser | null) => void;
const listeners: AuthCallback[] = [];

const notifyListeners = (user: MockUser | null) => {
  listeners.forEach(cb => cb(user));
};

async function secureRequest(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.status === 401 && auth.currentUser) {
      const refreshed = await refreshSession(auth.currentUser.refreshToken);
      if (refreshed) {
        const newUrl = new URL(url);
        newUrl.searchParams.set('auth', refreshed.idToken);
        return secureRequest(newUrl.toString(), options, retries - 1);
      }
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return secureRequest(url, options, retries - 1);
    }
    throw error;
  }
}

const refreshSession = async (refreshToken: string): Promise<MockUser | null> => {
  try {
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (!savedAuth) return null;
    
    const existingUser = JSON.parse(savedAuth);
    const updatedUser: MockUser = {
      ...existingUser,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (parseInt(data.expires_in) * 1000)
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (e) {
    console.error("Session refresh failed:", e);
    return null;
  }
};

const finalizeSignIn = async (data: any): Promise<MockUser> => {
  const dbData = await getUserData(data.localId, data.idToken);
  
  const user: MockUser = {
    uid: data.localId,
    email: data.email,
    emailVerified: data.emailVerified || false,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + (parseInt(data.expiresIn) * 1000),
    isPro: dbData?.isPro || false,
    plan: dbData?.plan || 'free',
    generationsLeft: dbData?.generationsLeft ?? 5,
    lastDailyBonusDate: dbData?.lastDailyBonusDate,
    createdAt: dbData?.createdAt || Date.now()
  };

  if (!dbData) {
    await createOrUpdateUser(user.uid, {
      uid: user.uid,
      email: user.email,
      isPro: false,
      plan: 'free',
      generationsLeft: 5,
      createdAt: user.createdAt
    }, data.idToken);
  }

  auth.currentUser = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  notifyListeners(user);
  return user;
};

export const auth = {
  currentUser: null as MockUser | null,

  onAuthStateChanged: (callback: AuthCallback) => {
    listeners.push(callback);
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        let user = JSON.parse(savedAuth) as MockUser;
        auth.currentUser = user;
        callback(user);
        if (Date.now() > (user.expiresAt - 300000)) {
           refreshSession(user.refreshToken).then(refreshed => {
             if (refreshed) {
               auth.currentUser = refreshed;
               notifyListeners(refreshed);
             } else { auth.signOut(); }
           });
        }
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
        callback(null);
      }
    } else { callback(null); }
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  signIn: async (email: string, password?: string) => {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const user = await finalizeSignIn(data);
    return { user };
  },

  signUp: async (email: string, password?: string) => {
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: { 'Content-Type': 'application/json' }
    });
    const authData = await authResponse.json();
    if (authData.error) throw new Error(authData.error.message);
    const user = await finalizeSignIn(authData);
    try { await auth.sendEmailVerification(authData.idToken); } catch (e) { console.warn(e); }
    return { user };
  },

  signOut: async () => {
    auth.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
    notifyListeners(null);
  },

  resetPassword: async (email: string) => {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  },

  sendEmailVerification: async (idToken?: string) => {
    const token = idToken || auth.currentUser?.idToken;
    if (!token) throw new Error("Auth required.");
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken: token }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  },

  reloadUser: async (): Promise<MockUser | null> => {
    if (!auth.currentUser) return null;
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        body: JSON.stringify({ idToken: auth.currentUser.idToken }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const userData = data.users[0];
      
      const dbData = await getUserData(auth.currentUser.uid, auth.currentUser.idToken);
      
      const updatedUser: MockUser = { 
        ...auth.currentUser, 
        ...dbData,
        emailVerified: userData.emailVerified 
      };
      auth.currentUser = updatedUser;
      localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      notifyListeners(updatedUser);
      return updatedUser;
    } catch (e) { return auth.currentUser; }
  },

  signInWithGoogle: async (): Promise<{ user: MockUser }> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !(window as any).google) {
        return reject(new Error("Google Identity Services not loaded."));
      }
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const firebaseRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`, {
              method: 'POST',
              body: JSON.stringify({
                postBody: `id_token=${response.credential}&providerId=google.com`,
                requestUri: window.location.origin,
                returnIdpCredential: true,
                returnSecureToken: true
              }),
              headers: { 'Content-Type': 'application/json' }
            });
            const data = await firebaseRes.json();
            if (data.error) throw new Error(data.error.message);
            const user = await finalizeSignIn(data);
            resolve({ user });
          } catch (e) { reject(e); }
        },
        use_fedcm_for_prompt: false,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup'
      });
      google.accounts.id.prompt();
    });
  }
};

export const getUserData = async (uid: string, token?: string) => {
  const authToken = token || auth.currentUser?.idToken;
  if (!authToken) return null;
  try {
    const response = await secureRequest(`${DB_URL}/users/${uid}.json?auth=${authToken}`);
    return response.ok ? await response.json() : null;
  } catch { return null; }
};

export const createOrUpdateUser = async (uid: string, data: any, token?: string) => {
  const authToken = token || auth.currentUser?.idToken;
  if (!authToken) return;
  try {
    const response = await secureRequest(`${DB_URL}/users/${uid}.json?auth=${authToken}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok && auth.currentUser?.uid === uid) {
      const updated = { ...auth.currentUser, ...data };
      auth.currentUser = updated;
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      notifyListeners(updated);
    }
  } catch (e) { console.error(e); }
};

export const setUserPlan = async (uid: string, plan: MockUser['plan']) => {
  const isPro = plan !== 'free';
  await createOrUpdateUser(uid, { plan, isPro });
};

export const saveIdeaToVault = async (uid: string, idea: AppIdea) => {
  const authToken = auth.currentUser?.idToken;
  if (!authToken) return;
  await secureRequest(`${DB_URL}/savedIdeas/${uid}/${idea.id}.json?auth=${authToken}`, {
    method: 'PUT',
    body: JSON.stringify({ ...idea, savedAt: Date.now() }),
    headers: { 'Content-Type': 'application/json' }
  });
};

export const deleteIdeaFromVault = async (uid: string, ideaId: string) => {
  const authToken = auth.currentUser?.idToken;
  if (!authToken) return;
  await secureRequest(`${DB_URL}/savedIdeas/${uid}/${ideaId}.json?auth=${authToken}`, {
    method: 'DELETE'
  });
};

export const getSavedIdeas = async (uid: string): Promise<AppIdea[]> => {
  const authToken = auth.currentUser?.idToken;
  if (!authToken) return [];
  try {
    const response = await secureRequest(`${DB_URL}/savedIdeas/${uid}.json?auth=${authToken}`);
    const data = await response.json();
    return data ? Object.values(data) : [];
  } catch { return []; }
};