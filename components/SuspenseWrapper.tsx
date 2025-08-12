import React, { Suspense, ReactNode } from 'react';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;
