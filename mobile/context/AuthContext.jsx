import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginRequest, signupRequest } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';

const SESSION_KEY = 'truthlens_mobile_session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync(SESSION_KEY)
      .then((saved) => {
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (parsed?.token && parsed?.user && active) setSession(parsed);
      })
      .catch(async (error) => {
        console.error('Could not restore the saved TruthLens session:', error);
        await SecureStore.deleteItemAsync(SESSION_KEY);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  const saveSession = async (result) => {
    if (!result?.token || !result?.user) {
      throw new Error('The server returned an incomplete sign-in response.');
    }
    const nextSession = { token: result.token, user: result.user };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return result.user;
  };

  const login = async (email, password) => {
    if (!email.trim() || !password) throw new Error('Enter your email and password.');
    const result = await loginRequest(email.trim(), password);
    return saveSession(result);
  };

  const signup = async (name, email, password) => {
    if (!name.trim() || !email.trim() || !password) {
      throw new Error('Complete all fields to create your account.');
    }
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const result = await signupRequest(name.trim(), email.trim(), password);
    return saveSession(result);
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isLoading,
      login,
      signup,
      logout: clearSession,
    }),
    [session, isLoading, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
