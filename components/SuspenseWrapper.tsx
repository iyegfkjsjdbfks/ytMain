import React, { Suspense, type ReactNode, FC, ReactNode } from 'react';

import FastLoadingSpinner from './FastLoadingSpinner';

interface SuspenseWrapperProps {
 children?: React.ReactNode;
 fallback?: ReactNode;
}

const DefaultFallback: React.FC = () => <FastLoadingSpinner />;

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
 children,
 fallback = <DefaultFallback /> }) => {
 return (
 <Suspense fallback={fallback}>
 {children}
 </Suspense>
 );
};

export default SuspenseWrapper;
