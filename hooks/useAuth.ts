
import { useState, useEffect, useCallback } from 'react';
import { auth, getUserData, MockUser } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let reloadInterval: number | null = null;

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        
        // If user is unverified, start a background check to auto-detect confirmation
        if (!currentUser.emailVerified) {
          reloadInterval = window.setInterval(async () => {
            const reloaded = await auth.reloadUser();
            if (reloaded?.emailVerified && isMounted) {
              setUser(reloaded);
              if (reloadInterval) clearInterval(reloadInterval);
            }
          }, 5000); // Check every 5 seconds
        }

        // Background sync DB data
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
        if (reloadInterval) clearInterval(reloadInterval);
      }
      setIsChecking(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (reloadInterval) clearInterval(reloadInterval);
    };
  }, []);

  const logout = useCallback(async () => {
    await auth.signOut();
  }, []);

  return { user, isChecking, logout };
}
