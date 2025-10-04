import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, listenToUserProfile, persistUserRole, markProfileCompleted } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { USER_ROLES } from '../constants';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setLoading(true);
    let unsubscribeProfile = null;
    // Fallback: if listeners don't respond (e.g., offline/tunnel), exit loading state
    const loadingTimeoutMs = 10000; // 10 seconds
    let loadingTimeoutId = setTimeout(() => {
      console.log('[Auth] Loading timeout reached, exiting loading state');
      setLoading(false);
    }, loadingTimeoutMs);
    // Optimistically hydrate from cache to improve perceived performance
    (async () => {
      try {
        const [cachedRole, cachedCompleted, cachedProfile] = await Promise.all([
          storage.get('auth:userRole', null),
          storage.get('auth:profileCompleted', false),
          storage.get('auth:userProfile', null),
        ]);
        if (cachedRole != null) setUserRole(cachedRole);
        if (cachedCompleted != null) setProfileCompleted(Boolean(cachedCompleted));
        if (cachedProfile != null) setUserProfile(cachedProfile);
      } catch (e) {
        console.log('[Auth] cache hydrate error', e);
      }
    })();

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged fired. User:', !!firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listen to user profile/role updates
        unsubscribeProfile = listenToUserProfile(firebaseUser.uid, (data) => {
          const safe = data || {};
          setUserRole(safe.role || null);
          setProfileCompleted(Boolean(safe.profileCompleted));
          setUserProfile(safe.profile || null);
          // Persist to cache for offline usage
          storage.set('auth:userRole', safe.role || null);
          storage.set('auth:profileCompleted', Boolean(safe.profileCompleted));
          storage.set('auth:userProfile', safe.profile || null);
          setLoading(false);
          if (loadingTimeoutId) {
            clearTimeout(loadingTimeoutId);
            loadingTimeoutId = null;
          }
        });
      } else {
        setUserRole(null);
        setProfileCompleted(false);
        setUserProfile(null);
        // Clear cache on logout
        storage.set('auth:userRole', null);
        storage.set('auth:profileCompleted', false);
        storage.set('auth:userProfile', null);
        setLoading(false);
        if (loadingTimeoutId) {
          clearTimeout(loadingTimeoutId);
          loadingTimeoutId = null;
        }
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeAuth) unsubscribeAuth();
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        loadingTimeoutId = null;
      }
    };
  }, []);

  const setRole = (role) => {
    setUserRole(role);
    storage.set('auth:userRole', role);
    if (user?.uid) {
      persistUserRole(user.uid, role).catch((e) => console.error('Persist role error:', e));
    }
  };

  const completeProfile = () => {
    setProfileCompleted(true);
    storage.set('auth:profileCompleted', true);
    if (user?.uid) {
      markProfileCompleted(user.uid).catch((e) => console.error('Mark profile completed error:', e));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setProfileCompleted(false);
      setUserProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    userRole,
    profileCompleted,
    userProfile,
    setRole,
    completeProfile,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 