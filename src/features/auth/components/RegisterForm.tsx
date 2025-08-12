import React, { useState, FC, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import type { RegisterData } from '../types';

/**
 * Registration form component with validation and error handling
 */
export const RegisterForm: React.FC = () => {
 return null;
 const navigate = useNavigate();
 const { register, error } = useAuthStore();

 const [formData, setFormData] = useState<RegisterData>({
 username: '',
 email: '',
 password: '',
 displayName: '' });

 const [confirmPassword, setConfirmPassword] = useState<string>('');

 const [formErrors, setFormErrors] = useState({
 username: '',
 email: '',
 password: '',
 confirmPassword: '',
 displayName: '' });

 const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

 const validateForm: any = (): boolean => {
 let isValid = true;
 const errors = {
 username: '',
 email: '',
 password: '',
 confirmPassword: '',
 displayName: '' };

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

 const handleChange: any = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;

 if (name === 'confirmPassword') {
 setConfirmPassword(value);
 } else {
 setFormData({
 ...formData as any,
 [name]: value });
 };

 const handleSubmit = async (e: React.FormEvent): Promise<any> => {
 e.preventDefault();

 if (!validateForm()) {
 return;
 }

 setIsSubmitting(true);

 try {
 await register(formData);
 navigate('/');
 } catch (err: any) {
 // Error is handled by the authStore and displayed below
 } finally {
 setIsSubmitting(false);
 };

 return (
 <div className='w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
 <h2 className='text-2xl font-bold mb-6 text-center'>Create an Account</h2>

 {error && (
 <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
 {error}
// FIXED:  </div>
 )}

 <form onSubmit={(e: any) => handleSubmit(e)}>
 <div className='mb-4'>
 <label
// FIXED:  className='block text-gray-700 text-sm font-bold mb-2'
// FIXED:  htmlFor='username' />
 >
 Username
// FIXED:  </label>
 <input
// FIXED:  id='username'
// FIXED:  type='text'
// FIXED:  name='username'
// FIXED:  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
 formErrors.username
 ? 'border-red-500 focus:ring-red-200'
 : 'border-gray-300 focus:ring-blue-200'
 }`}
// FIXED:  value={formData.username} />
// FIXED:  onChange={(e: any) => handleChange(e)}
// FIXED:  disabled={isSubmitting}
 />
 {formErrors.username && (
 <p className='text-red-500 text-xs mt-1'>{formErrors.username}</p>
 )}
// FIXED:  </div>

 <div className='mb-4'>
 <label
// FIXED:  className='block text-gray-700 text-sm font-bold mb-2'
// FIXED:  htmlFor='displayName' />
 >
 Display Name
// FIXED:  </label>
 <input
// FIXED:  id='displayName'
// FIXED:  type='text'
// FIXED:  name='displayName'
// FIXED:  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
 formErrors.displayName
 ? 'border-red-500 focus:ring-red-200'
 : 'border-gray-300 focus:ring-blue-200'
 }`}
// FIXED:  value={formData.displayName} />
// FIXED:  onChange={(e: any) => handleChange(e)}
// FIXED:  disabled={isSubmitting}
 />
 {formErrors.displayName && (
 <p className='text-red-500 text-xs mt-1'>
 {formErrors.displayName}
// FIXED:  </p>
 )}
// FIXED:  </div>

 <div className='mb-4'>
 <label
// FIXED:  className='block text-gray-700 text-sm font-bold mb-2'
// FIXED:  htmlFor='email' />
 >
 Email
// FIXED:  </label>
 <input
// FIXED:  id='email'
// FIXED:  type='email'
// FIXED:  name='email'
// FIXED:  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
 formErrors.email
 ? 'border-red-500 focus:ring-red-200'
 : 'border-gray-300 focus:ring-blue-200'
 }`}
// FIXED:  value={formData.email} />
// FIXED:  onChange={(e: any) => handleChange(e)}
// FIXED:  disabled={isSubmitting}
 />
 {formErrors.email && (
 <p className='text-red-500 text-xs mt-1'>{formErrors.email}</p>
 )}
// FIXED:  </div>

 <div className='mb-4'>
 <label
// FIXED:  className='block text-gray-700 text-sm font-bold mb-2'
// FIXED:  htmlFor='password' />
 >
 Password
// FIXED:  </label>
 <input
// FIXED:  id='password'
// FIXED:  type='password'
// FIXED:  name='password'
// FIXED:  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
 formErrors.password
 ? 'border-red-500 focus:ring-red-200'
 : 'border-gray-300 focus:ring-blue-200'
 }`}
// FIXED:  value={formData.password} />
// FIXED:  onChange={(e: any) => handleChange(e)}
// FIXED:  disabled={isSubmitting}
 />
 {formErrors.password && (
 <p className='text-red-500 text-xs mt-1'>{formErrors.password}</p>
 )}
// FIXED:  </div>

 <div className='mb-6'>
 <label
// FIXED:  className='block text-gray-700 text-sm font-bold mb-2'
// FIXED:  htmlFor='confirmPassword' />
 >
 Confirm Password
// FIXED:  </label>
 <input
// FIXED:  id='confirmPassword'
// FIXED:  type='password'
// FIXED:  name='confirmPassword'
// FIXED:  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
 formErrors.confirmPassword
 ? 'border-red-500 focus:ring-red-200'
 : 'border-gray-300 focus:ring-blue-200'
 }`}
// FIXED:  value={confirmPassword} />
// FIXED:  onChange={(e: any) => handleChange(e)}
// FIXED:  disabled={isSubmitting}
 />
 {formErrors.confirmPassword && (
 <p className='text-red-500 text-xs mt-1'>
 {formErrors.confirmPassword}
// FIXED:  </p>
 )}
// FIXED:  </div>

 <button
// FIXED:  type='submit'
// FIXED:  className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
 isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
 }`}
// FIXED:  disabled={isSubmitting} />
 >
 {isSubmitting ? 'Creating Account...' : 'Create Account'}
// FIXED:  </button>

 <div className='text-center mt-4'>
 <span className='text-gray-600'>Already have an account?</span>{' '}
 <a href='/login' className='text-blue-600 hover:text-blue-800'>
 Sign in
// FIXED:  </a>
// FIXED:  </div>
// FIXED:  </form>
// FIXED:  </div>
 );
};

export default RegisterForm;
