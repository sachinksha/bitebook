import { useState, useEffect, PropsWithChildren } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import { AuthContext } from './contexts';
import { auth } from '../firebase';

const provider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const configurePersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.warn('browserLocalPersistence unavailable, trying indexedDB persistence', error);
        try {
          await setPersistence(auth, indexedDBLocalPersistence);
        } catch (nestedError) {
          console.warn('indexedDBLocalPersistence unavailable, auth persistence may be limited', nestedError);
        }
      }
    };

    configurePersistence();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError('Login failed because this domain is not authorized in Firebase. Add your app domain in Firebase Authentication settings.');
      } else if (error.code === 'auth/operation-not-supported-in-this-environment' || error.code === 'auth/invalid-persistence-type' || error.code === 'auth/unauthorized-continue-uri') {
        setAuthError('Login failed because the browser is blocking storage or the auth flow cannot save initial state. Try normal/private browsing settings or allow site storage.');
      } else {
        setAuthError('Login failed. If you are on iOS or Safari, please make sure browser storage is enabled.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};