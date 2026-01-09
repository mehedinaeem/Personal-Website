/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setAccessToken, clearAccessToken } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to refresh token on initial load
                await authApi.refreshToken();
                const profile = await authApi.getProfile();
                setUser(profile);
                setIsAuthenticated(true);
            } catch (error) {
                // Not authenticated - this is expected for public users
                setUser(null);
                setIsAuthenticated(false);
                clearAccessToken();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Listen for logout events from axios interceptor
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const { user: userData } = await authApi.login(email, password);
            const profile = await authApi.getProfile();
            setUser(profile);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.displayMessage || 'Login failed'
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const updateProfile = useCallback(async (data) => {
        try {
            const updatedProfile = await authApi.updateProfile(data);
            setUser(updatedProfile);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.displayMessage || 'Failed to update profile'
            };
        }
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
