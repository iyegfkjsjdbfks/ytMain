/// <reference types="react/jsx-runtime" />
import React from "react";
import { useState  } from 'react';

import { useNavigate } from 'react-router-dom';
import type * as React from 'react';

import { useAuthStore } from '../store/authStore';
import type { RegisterData } from '../types';

/**
 * Registration form component with validation and error handling
 */
export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, error } = useAuthStore();

  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    };

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Display name validation
    if (!formData.displayName) {
      errors.displayName = 'Display name is required';
      isValid = false;
    }

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
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      // Error is handled by the authStore and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={formData.username}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formErrors.username && (
            <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            name="displayName"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.displayName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={formData.displayName}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formErrors.displayName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.displayName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              formErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            }`}
            value={confirmPassword}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {formErrors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

