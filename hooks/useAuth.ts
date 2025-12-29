
import { useState, useEffect, useCallback } from 'react';
import { auth, getUserData, MockUser } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        // Background sync
        try {
          const dbData = await getUserData(currentUser.uid, currentUser.idToken);
          if (isMounted && dbData) {
            setUser(prev => prev ? { ...prev, ...dbData } : null);
          }
        } catch (error) {
          console.error('Failed to sync user data:', error);
        }
      } else {
        setUser(null);
      }
      setIsChecking(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await auth.signOut();
  }, []);

  return { user, isChecking, logout };
}
