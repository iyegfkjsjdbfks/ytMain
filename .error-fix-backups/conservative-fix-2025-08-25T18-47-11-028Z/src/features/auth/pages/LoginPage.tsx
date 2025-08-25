import React from 'react';
// LoginPage - Simple Component;
import React from 'react';

export interface LoginPageProps {
  className?: string;
  children?: React.ReactNode, 

export const LoginPage = (props: LoginPageProps) => {
  return React.createElement('div', {)
    className: props.className, 
}
  }, props.children || 'Component ready');

export default LoginPage;