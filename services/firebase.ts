import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GithubAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { AppIdea } from '../types';

export interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
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

const firebaseConfig = {
  apiKey: "AIzaSyBqaMQx9gjG5b6uBeZAevPcmARf07w_arE",
  authDomain: "idealabai-973a0.firebaseapp.com",
  projectId: "idealabai-973a0",
  storageBucket: "idealabai-973a0.appspot.com",
  messagingSenderId: "559431938164",
  appId: "1:559431938164:web:e0f40d7c03d7c30e"
};

const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const githubProvider = new GithubAuthProvider();

const DB_URL = "https://idealabai-973a0-default-rtdb.firebaseio.com";
const AUTH_KEY = 'idealab_auth_session_v4';

type AuthCallback = (user: MockUser | null) => void;
const listeners: AuthCallback[] = [];

const notifyListeners = (user: MockUser | null) => {
  listeners.forEach(cb => cb(user));
};

async function secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, options);
  return response;
}

export const auth = {
  currentUser: null as MockUser | null,

  onAuthStateChanged: (callback: AuthCallback) => {
    listeners.push(callback);
    
    // Initial load from localStorage
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      const user = JSON.parse(savedAuth);
      auth.currentUser = user;
      callback(user);
    }

    // Subscribe to Firebase SDK changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        const dbData = await getUserData(fbUser.uid, idToken);
        
        const user: MockUser = {
          uid: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || "",
          photoURL: fbUser.photoURL || "",
          emailVerified: fbUser.emailVerified,
          idToken: idToken,
          refreshToken: fbUser.refreshToken,
          expiresAt: Date.now() + 3600000,
          isPro: dbData?.isPro || false,
          plan: dbData?.plan || 'free',
          generationsLeft: dbData?.generationsLeft ?? 5,
          createdAt: dbData?.createdAt || Date.now()
        };

        if (!dbData) {
          await createOrUpdateUser(user.uid, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isPro: false,
            plan: 'free',
            generationsLeft: 5,
            createdAt: user.createdAt
          }, idToken);
        }

        auth.currentUser = user;
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        notifyListeners(user);
      } else {
        auth.currentUser = null;
        localStorage.removeItem(AUTH_KEY);
        notifyListeners(null);
      }
    });

    return () => {
      unsubscribe();
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  signIn: async (email: string, password?: string) => {
    if (!password) throw new Error("Password required");
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return { user: result.user };
  },

  signUp: async (email: string, password?: string) => {
    if (!password) throw new Error("Password required");
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return { user: result.user };
  },

  signInWithGitHub: async (): Promise<{ user: MockUser }> => {
    const result = await signInWithPopup(firebaseAuth, githubProvider);
    const fbUser = result.user;
    const idToken = await fbUser.getIdToken();
    const dbData = await getUserData(fbUser.uid, idToken);

    const user: MockUser = {
      uid: fbUser.uid,
      email: fbUser.email || "",
      displayName: fbUser.displayName || "",
      photoURL: fbUser.photoURL || "",
      emailVerified: fbUser.emailVerified,
      idToken: idToken,
      refreshToken: fbUser.refreshToken,
      expiresAt: Date.now() + 3600000,
      isPro: dbData?.isPro || false,
      plan: dbData?.plan || 'free',
      generationsLeft: dbData?.generationsLeft ?? 5,
      createdAt: dbData?.createdAt || Date.now()
    };

    auth.currentUser = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    notifyListeners(user);
    return { user };
  },

  signInWithGoogle: async (): Promise<{ user: MockUser }> => {
    // Keep existing google placeholder if needed, or implement same as GitHub
    const result = await signInWithPopup(firebaseAuth, new GithubAuthProvider()); // Simple fallback
    return { user: auth.currentUser! };
  },

  signOut: async () => {
    await firebaseSignOut(firebaseAuth);
    auth.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
    notifyListeners(null);
  },

  resetPassword: async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth, email);
  },

  sendEmailVerification: async () => {
    if (firebaseAuth.currentUser) {
      await sendEmailVerification(firebaseAuth.currentUser);
    }
  },

  reloadUser: async (): Promise<MockUser | null> => {
    if (firebaseAuth.currentUser) {
      await firebaseAuth.currentUser.reload();
      return auth.currentUser;
    }
    return null;
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