/**
 * Permission Guard Component
 * Controls visibility and access based on user permissions
 */

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Permission } from '@/lib/constants/roles';

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  roles?: ('admin' | 'supervisor' | 'staff')[];
}

/**
 * Guards content based on user permissions
 * 
 * @param permissions - Array of permissions to check
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @param fallback - Content to show when user lacks permission
 * @param roles - Alternative: Check by role instead of permission
 */
export function PermissionGuard({
  children,
  permissions = [],
  requireAll = false,
  fallback = null,
  roles,
}: PermissionGuardProps) {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // If no user, deny access
  if (!user) {
    return <>{fallback}</>;
  }

  // Check by role if provided
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // If no permissions specified, allow access
  if (permissions.length === 0) {
    return <>{children}</>;
  }

  // Check permissions
  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook-based permission check
 */
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Hook-based role check
 */
export function useRole() {
  const { user, isAdmin, isSupervisor, isStaff } = useAuth();
  
  return {
    role: user?.role,
    isAdmin,
    isSupervisor,
    isStaff,
    hasRole: (role: 'admin' | 'supervisor' | 'staff') => user?.role === role,
  };
}

/**
 * Button with permission guard
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permissions?: Permission[];
  requireAll?: boolean;
  roles?: ('admin' | 'supervisor' | 'staff')[];
  children: ReactNode;
}

export function PermissionButton({
  permissions = [],
  requireAll = false,
  roles,
  children,
  ...props
}: PermissionButtonProps) {
  return (
    <PermissionGuard permissions={permissions} requireAll={requireAll} roles={roles}>
      <button {...props}>{children}</button>
    </PermissionGuard>
  );
}

/**
 * Unauthorized Access Component
 */
export function UnauthorizedAccess({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          {message || 'You do not have permission to access this resource.'}
        </p>
      </div>
    </div>
  );
}
