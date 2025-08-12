import React, { useState, FC, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types';

interface LocationState {
  from?: {
    pathname: string;
  }}

/**
 * Login form component with validation and error handling
 */
export const LoginForm: React.FC = () => {
  return null;
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error } = useAuthStore();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
          password: '',
    rememberMe: false });

  const [formErrors, setFormErrors] = useState({
    email: '',
          password: '' });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm: any = (): boolean => {
    let isValid = true;
    const errors = {
      email: '',
          password: '' };

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange: any = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData as any,
      [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<any> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);

      // Redirect to the page the user was trying to access, or to home
      const state = location.state as LocationState;
      const destination = state.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err: any) {
      // Error is handled by the authStore and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Sign In</h2>

      {error && (
        <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
          {error}
        </div>
      )}

      <form onSubmit={(e: any) => handleSubmit(e)}>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='email'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            name='email'
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.email
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={formData.email}
            onChange={(e: any) => handleChange(e)}
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <p className='text-red-500 text-xs mt-1'>{formErrors.email}</p>
          )}
        </div>

        <div className='mb-6'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='password'
          >
            Password
          </label>
          <input
            id='password'
            type='password'
            name='password'
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.password
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={formData.password}
            onChange={(e: any) => handleChange(e)}
            disabled={isSubmitting}
          />
          {formErrors.password && (
            <p className='text-red-500 text-xs mt-1'>{formErrors.password}</p>
          )}
        </div>

        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center'>
            <input
              id='rememberMe'
              type='checkbox'
              name='rememberMe'
              checked={formData.rememberMe}
              onChange={(e: any) => handleChange(e)}
              className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              disabled={isSubmitting}
            />
            <label
              htmlFor='rememberMe'
              className='ml-2 block text-sm text-gray-700'
            >
              Remember me
            </label>
          </div>

          <div className='text-sm'>
            <a
              href='/forgot-password'
              className='text-blue-600 hover:text-blue-800'
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <button
          type='submit'
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className='text-center mt-4'>
          <span className='text-gray-600'>Don't have an account?</span>{' '}
          <a href='/register' className='text-blue-600 hover:text-blue-800'>
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
