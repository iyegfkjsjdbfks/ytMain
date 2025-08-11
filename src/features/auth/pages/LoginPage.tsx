/// <reference types="react/jsx-runtime" />
import React, { useEffect } from 'react';

import { LoginForm } from '../components/LoginForm';

import { useAuthStore } from '../store/authStore';

/**
 * Login page component
 */
const LoginPage: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status when component mounts
    checkAuth();
  }, [checkAuth]);

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <img
          className='mx-auto h-12 w-auto'
          src='/logo.svg'
          alt='YouTube Studio'
        />
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Sign in to your account
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Or{' '}
          <a
            href='/register'
            className='font-medium text-blue-600 hover:text-blue-500'
          >
            create a new account
          </a>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}
