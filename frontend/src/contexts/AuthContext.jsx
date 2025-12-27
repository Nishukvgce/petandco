
import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children, setError }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage (from backend login)
    const sessionData = localStorage.getItem('user');
    console.log('AuthContext initialization - sessionData:', sessionData);
    if (sessionData) {
      try {
        const user = JSON.parse(sessionData);
        console.log('AuthContext initialization - parsed user:', user);
        setUser(user);
        setUserProfile(user);
      } catch (error) {
        console.error('AuthContext initialization - error parsing session data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await apiClient.post('/auth/login', { 
        email, 
        password 
      });
      
      if (response.data) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          // Add default values for fields not returned by backend
          phone: response.data.phone || '',
          memberSince: response.data.memberSince || new Date().toISOString().split('T')[0],
          totalOrders: response.data.totalOrders || 0,
          loyaltyPoints: response.data.loyaltyPoints || 0,
          isActive: response.data.isActive !== false
        };
        
        console.log('Login successful, user data:', userData);
        setUser(userData);
        setUserProfile(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { user: userData, error: null };
      } else {
        return { user: null, error: { message: 'Invalid response from server' } };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data || error.message || 'Login failed';
      return { user: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('user');
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration for:', userData.email);
      
      const response = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        role: 'customer' // Default role for new users
      });
      
      if (response.data) {
        console.log('Registration successful:', response.data);
        
        // After successful registration, automatically sign in the user
        const loginResult = await signIn(userData.email, userData.password);
        if (loginResult.user) {
          return { user: loginResult.user, error: null };
        } else {
          return { 
            user: null, 
            error: { 
              message: 'Registration successful but automatic login failed. Please sign in manually.' 
            } 
          };
        }
      } else {
        return { user: null, error: { message: 'Registration failed' } };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data || error.message || 'Registration failed';
      return { user: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) return { error: { message: 'No user logged in' } };
      
      // Update local state immediately for better UX
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setUserProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // TODO: Add backend API call to update user profile when endpoint is available
      // const response = await apiClient.put(`/auth/profile/${user.id}`, updates);
      
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
