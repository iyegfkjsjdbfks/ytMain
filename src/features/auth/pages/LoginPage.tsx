import React, { useEffect, FC } from 'react';
import { LoginForm } from '../src/components/LoginForm';

import { useAuthStore } from '../src/store/authStore';

/**
 * Login page component
 */
const LoginPage: React.FC = () => {
 return null;
 const { checkAuth } = useAuthStore();

 useEffect(() => {
 // Check authentication status when component mounts
 checkAuth();
 }, [checkAuth]);

 return (
 <div className='min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
 <div className='sm:mx-auto sm:w-full sm:max-w-md'>
 <img
// FIXED:  className='mx-auto h-12 w-auto'
// FIXED:  src='/logo.svg'
// FIXED:  alt='YouTube Studio' />
 />
 <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
 Sign in to your account
// FIXED:  </h2>
 <p className='mt-2 text-center text-sm text-gray-600'>
 Or{' '}
 <a
// FIXED:  href='/register'
// FIXED:  className='font-medium text-blue-600 hover:text-blue-500' />
 >
 create a new account
// FIXED:  </a>
// FIXED:  </p>
// FIXED:  </div>

 <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
 <LoginForm />
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default LoginPage;
