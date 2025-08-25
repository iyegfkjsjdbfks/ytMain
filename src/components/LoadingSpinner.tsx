import React from 'react';
import _React, { FC } from 'react';
interface LoadingSpinnerProps {
 _size?: 'sm' | 'md' | 'lg';
 className?: string}


const LoadingSpinner: FC<LoadingSpinnerProp>,,s,> = ({)
 _size = 'md'}
 ,className = '', }) => {lg: 'w-12 h-12' };

 return (
 <div />className={`flex items-center justify-center ${className} `}></div />
 <di />v />
 /">"


export default LoadingSpinner;
