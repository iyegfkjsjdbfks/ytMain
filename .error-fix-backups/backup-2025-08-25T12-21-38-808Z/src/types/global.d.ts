// Global type definitions
declare module '@/config/routes.tsx' {
  export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    exact?: boolean;
  }
  export const routes: RouteConfig[];
  export default routes;
}

declare module '../components/AccountLayout.tsx' {
  import React from 'react';
  export interface AccountLayoutProps {
    children?: React.ReactNode;
    className?: string;
  }
  export const AccountLayout: React.FC<AccountLayoutProps>;
  export default AccountLayout;
}

declare module '../components/ErrorBoundary.tsx' {
  import React from 'react';
  export interface ErrorBoundaryProps {
    children?: React.ReactNode;
    fallback?: React.ReactNode;
  }
  export const ErrorBoundary: React.FC<ErrorBoundaryProps>;
  export default ErrorBoundary;
}

declare module '../components/Layout.tsx' {
  import React from 'react';
  export interface LayoutProps {
    children?: React.ReactNode;
    className?: string;
  }
  export const Layout: React.FC<LayoutProps>;
  export default Layout;
}

declare module '../components/ProtectedRoute.tsx' {
  import React from 'react';
  export interface ProtectedRouteProps {
    children?: React.ReactNode;
    requireAuth?: boolean;
  }
  export const ProtectedRoute: React.FC<ProtectedRouteProps>;
  export default ProtectedRoute;
}

declare module '../components/StudioLayout.tsx' {
  import React from 'react';
  export interface StudioLayoutProps {
    children?: React.ReactNode;
    className?: string;
  }
  export const StudioLayout: React.FC<StudioLayoutProps>;
  export default StudioLayout;
}