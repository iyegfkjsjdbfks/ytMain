import React, { FC } from 'react';
import { RegisterForm } from '../components/RegisterForm.tsx';

/**
 * Registration page component
 */
const RegisterPage: React.FC = () => {
 return (
 <div className='min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
 <div className='sm:mx-auto sm:w-full sm:max-w-md'>
 <img
// FIXED:  className='mx-auto h-12 w-auto'
// FIXED:  src='/logo.svg'
// FIXED:  alt='YouTube Studio' />
 />
 <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
 Create your account
// FIXED:  </h2>
 <p className='mt-2 text-center text-sm text-gray-600'>
 Or{' '}
 <a
// FIXED:  href='/login'
// FIXED:  className='font-medium text-blue-600 hover:text-blue-500' />
 >
 sign in to your existing account
// FIXED:  </a>
// FIXED:  </p>
// FIXED:  </div>

 <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
 <RegisterForm />
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default RegisterPage;
