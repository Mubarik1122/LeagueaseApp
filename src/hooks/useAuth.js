import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI } from '../services/supabaseApi';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authAPI.getSession();
        if (session && session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (() => {
          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        })();
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.signIn(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
      setIsAuthenticated(false);

      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberUntil');
      localStorage.removeItem('Username');
      localStorage.removeItem('Key');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (email, password, metadata = {}) => {
    try {
      const data = await authAPI.signUp(email, password, metadata);
      return { success: true, data };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await authAPI.resetPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    signup,
    resetPassword,
  };
};