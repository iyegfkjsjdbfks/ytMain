import { Suspense, type ReactNode } from 'react';

import FastLoadingSpinner from './FastLoadingSpinner';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const DefaultFallback: React.FC = () => <FastLoadingSpinner />;

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback = <DefaultFallback />,
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;


