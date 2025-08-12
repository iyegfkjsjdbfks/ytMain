import React, { useEffect, FC, ReactNode } from 'react';
import { useLocation, Navigate, useLocation } from 'react-router-dom';

import LoadingSpinner from '@components/LoadingSpinner';

import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
 children?: React.ReactNode;
 requireAuth?: boolean;
 redirectTo?: string;
}

/**
 * Component to protect routes based on authentication status
 * Can be used to protect authenticated routes or to prevent
 * authenticated users from accessing auth pages (login/register)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
 children,
 requireAuth = true,
 redirectTo }) => {
 const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
 const location = useLocation();

 useEffect(() => {
 checkAuth();
 }, [checkAuth]);

 if (isLoading as any) {
 return <LoadingSpinner />;
 }

 // For routes that require authentication (most app routes)
 if (requireAuth && !isAuthenticated) {
 return (
 <Navigate
 to={redirectTo || '/login'}
 state={{ from: location }
 replace />
 />
 );
 }

 // For routes that should NOT be accessible when authenticated (login/register)
 if (!requireAuth && isAuthenticated) {
 return <Navigate to={redirectTo || '/'} replace />;
 }

 return <>{children}</>;
};

export default ProtectedRoute;
