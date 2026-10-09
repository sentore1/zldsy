/**
 * Authentication and Authorization Hook
 * Manages user authentication and role-based permissions
 */

import { useState, useEffect } from 'react';
import { StaffRole, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  employment_type?: string;
  can_login: boolean;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isStaff: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Authentication Hook
 * Provides authentication state and permission checking
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // TODO: Implement session check with your auth provider (Supabase, etc.)
      // For now, check localStorage
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual login logic with your auth provider
      // This is a placeholder implementation
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.system_role || 'staff',
        employment_type: data.user.employment_type,
        can_login: data.user.can_login,
      };

      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: Implement actual logout logic
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSupervisor: user?.role === 'supervisor',
    isStaff: user?.role === 'staff',
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    login,
    logout,
  };
}

/**
 * Mock user for development/testing
 * Remove this in production
 */
export function useMockAuth(role: StaffRole = 'admin'): UseAuthReturn {
  const mockUser: AuthUser = {
    id: 'mock-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: role,
    employment_type: 'permanent',
    can_login: true,
  };

  return {
    user: mockUser,
    loading: false,
    isAuthenticated: true,
    isAdmin: role === 'admin',
    isSupervisor: role === 'supervisor',
    isStaff: role === 'staff',
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    login: async () => {},
    logout: async () => {},
  };
}
