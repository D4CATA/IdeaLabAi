
/**
 * FIREBASE REST SERVICE LAYER
 * Uses REST API to avoid SDK environment issues in AI Studio.
 */
import { AppIdea } from '../types';

export interface MockUser {
  uid: string;
  email: string;
  isPro: boolean;
  emailVerified?: boolean;
  generationsLeft: number;
  createdAt: number;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

const FIREBASE_API_KEY = "AIzaSyBqaMQx9gjG5b6uBeZAevPcmARf07w_arE";
const DB_URL = "https://idealabai-973a0-default-rtdb.firebaseio.com";
const AUTH_KEY = 'idealab_auth_session_v4';

type AuthCallback = (user: MockUser | null) => void;
const listeners: AuthCallback[] = [];

const notifyListeners = (user: MockUser | null) => {
  listeners.forEach(cb => cb(user));
};

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
             } else {
               auth.signOut();
             }
           });
        }
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
        callback(null);
      }
    } else {
      callback(null);
    }

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

    const dbData = await getUserData(data.localId, data.idToken);
    
    const user: MockUser = {
      uid: data.localId,
      email: data.email,
      emailVerified: data.registered, // registered is often returned as true if existing
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (parseInt(data.expiresIn) * 1000),
      isPro: dbData?.isPro || false,
      generationsLeft: dbData?.generationsLeft ?? 3,
      createdAt: dbData?.createdAt || Date.now()
    };

    auth.currentUser = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    notifyListeners(user);
    return { user };
  },

  signUp: async (email: string, password?: string) => {
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: { 'Content-Type': 'application/json' }
    });

    const authData = await authResponse.json();
    if (authData.error) throw new Error(authData.error.message);

    const newUser: MockUser = {
      uid: authData.localId,
      email: authData.email,
      emailVerified: false,
      idToken: authData.idToken,
      refreshToken: authData.refreshToken,
      expiresAt: Date.now() + (parseInt(authData.expiresIn) * 1000),
      isPro: false,
      generationsLeft: 3,
      createdAt: Date.now()
    };

    // Save to DB
    await createOrUpdateUser(newUser.uid, {
      uid: newUser.uid,
      email: newUser.email,
      isPro: false,
      generationsLeft: 3,
      createdAt: newUser.createdAt
    }, authData.idToken);

    // Trigger Verification
    try {
      await auth.sendEmailVerification(authData.idToken);
    } catch (e) {
      console.warn("Failed to send initial verification email:", e);
    }

    auth.currentUser = newUser;
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    notifyListeners(newUser);
    return { user: newUser };
  },

  signOut: async () => {
    auth.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
    notifyListeners(null);
  },

  resetPassword: async (email: string) => {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  },

  sendEmailVerification: async (idToken?: string) => {
    const token = idToken || auth.currentUser?.idToken;
    if (!token) throw new Error("Authentication required to verify email.");

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        requestType: 'VERIFY_EMAIL',
        idToken: token
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  },

  signInWithGoogle: async () => {
    // Note: In a pure REST environment without SDK, this usually requires an OAuth token from a client side picker
    // This is a placeholder for the integration pattern
    throw new Error("Google Sign-In requires browser-side OAuth integration. Use Email/Password for this session.");
  }
};

export const getUserData = async (uid: string, token?: string) => {
  const authToken = token || auth.currentUser?.idToken;
  if (!authToken) return null;
  try {
    const response = await fetch(`${DB_URL}/users/${uid}.json?auth=${authToken}`);
    return response.ok ? await response.json() : null;
  } catch { return null; }
};

export const createOrUpdateUser = async (uid: string, data: any, token?: string) => {
  const authToken = token || auth.currentUser?.idToken;
  if (!authToken) return;
  try {
    const response = await fetch(`${DB_URL}/users/${uid}.json?auth=${authToken}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok && auth.currentUser?.uid === uid) {
      const updated = { ...auth.currentUser, ...data };
      auth.currentUser = updated;
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    }
  } catch (e) { console.error(e); }
};

export const setUserProStatus = async (uid: string, status: boolean) => {
  await createOrUpdateUser(uid, { isPro: status });
};

// --- SAVED IDEAS METHODS ---

export const saveIdeaToVault = async (uid: string, idea: AppIdea) => {
  const authToken = auth.currentUser?.idToken;
  if (!authToken) return;
  await fetch(`${DB_URL}/savedIdeas/${uid}/${idea.id}.json?auth=${authToken}`, {
    method: 'PUT',
    body: JSON.stringify({ ...idea, savedAt: Date.now() }),
    headers: { 'Content-Type': 'application/json' }
  });
};

export const deleteIdeaFromVault = async (uid: string, ideaId: string) => {
  const authToken = auth.currentUser?.idToken;
  if (!authToken) return;
  await fetch(`${DB_URL}/savedIdeas/${uid}/${ideaId}.json?auth=${authToken}`, {
    method: 'DELETE'
  });
};

export const getSavedIdeas = async (uid: string): Promise<AppIdea[]> => {
  const authToken = auth.currentUser?.idToken;
  if (!authToken) return [];
  try {
    const response = await fetch(`${DB_URL}/savedIdeas/${uid}.json?auth=${authToken}`);
    const data = await response.json();
    return data ? Object.values(data) : [];
  } catch { return []; }
};
