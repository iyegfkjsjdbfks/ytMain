// RegisterPage - Simple Component;
import React from 'react';

export interface RegisterPageProps {
  className?: string;
  children?: React.ReactNode;
}

export const RegisterPage = (props: RegisterPageProps) => {
  return React.createElement('div', {
    className: props.className;
  }, props.children || 'Component ready');
};

export default RegisterPage;