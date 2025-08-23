import React, { useState, FC, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Button from '../components/forms/Button.tsx';
import Input from '../components/forms/Input.tsx';
import YouTubeLogo from '../components/icons/YouTubeLogo.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const RegisterPage: React.FC = () => {
 return null;
 const [username, setUsername] = useState<string>('');
 const [email, setEmail] = useState<string>('');
 const [password, setPassword] = useState<string>('');
 const [confirmPassword, setConfirmPassword] = useState<string>('');
 const [isLoading, setIsLoading] = useState<boolean>(false);
 const [error, setError] = useState<string>('');
 const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

 const { register } = useAuth();
 const navigate = useNavigate();

 const validateForm = () => {
 if (!username.trim()) {
 setError('Username is required');
 return false;
 }
 if (username.length < 3) {
 setError('Username must be at least 3 characters long');
 return false;
 }
 if (!email.trim()) {
 setError('Email is required');
 return false;
 }
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
 setError('Please enter a valid email address');
 return false;
 }
 if (!password) {
 setError('Password is required');
 return false;
 }
 if (password.length < 6) {
 setError('Password must be at least 6 characters long');
 return false;
 }
 if (password !== confirmPassword) {
 setError('Passwords do not match');
 return false;
 }
 if (!acceptTerms) {
 setError('You must accept the Terms of Service and Privacy Policy');
 return false;
 }
 return true;
 };

 const handleSubmit = async (e: React.FormEvent): Promise<any> => {
 e.preventDefault();
 setError('');

 if (!validateForm()) {
 return;
 }

 setIsLoading(true);

 try {
 const success = await register(username, email, password);
 if (success as any) {
 navigate('/', { replace: true });
 } else {
 setError('Registration failed. Please try again.');
 }
 } catch (err) {
 setError('An error occurred. Please try again.');
 } finally {
 setIsLoading(false);
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="flex justify-center">
 <YouTubeLogo className="h-12 w-auto" />
// FIXED:  </div>
<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
 Create your account
// FIXED:  </h2>
 <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
 Already have an account?{' '}
 <Link
 to="/login"
// FIXED:  className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300" />
 >
 Sign in here
// FIXED:  </Link>
// FIXED:  </p>
// FIXED:  </div>

 <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
 <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
 <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
 {error && (
 <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
 <div className="text-sm text-red-700 dark:text-red-400">
 {error}
// FIXED:  </div>
// FIXED:  </div>
 )}

 <div>
 <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
 Username
// FIXED:  </label>
 <div className="mt-1">
 <Input
// FIXED:  id="username"
// FIXED:  name="username"
// FIXED:  type="text"
 autoComplete="username"
 required
// FIXED:  value={username} />
// FIXED:  onChange={(e) => setUsername(e.target.value)}
// FIXED:  className="block w-full"
// FIXED:  placeholder="Choose a username"
 />
// FIXED:  </div>
<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
 This will be your channel name
// FIXED:  </p>
// FIXED:  </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
 Email address
// FIXED:  </label>
 <div className="mt-1">
 <Input
// FIXED:  id="email"
// FIXED:  name="email"
// FIXED:  type="email"
 autoComplete="email"
 required
// FIXED:  value={email} />
// FIXED:  onChange={(e) => setEmail(e.target.value)}
// FIXED:  className="block w-full"
// FIXED:  placeholder="Enter your email"
 />
// FIXED:  </div>
// FIXED:  </div>

 <div>
 <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
 Password
// FIXED:  </label>
 <div className="mt-1">
 <Input
// FIXED:  id="password"
// FIXED:  name="password"
// FIXED:  type="password"
 autoComplete="new-password"
 required
// FIXED:  value={password} />
// FIXED:  onChange={(e) => setPassword(e.target.value)}
// FIXED:  className="block w-full"
// FIXED:  placeholder="Create a password"
 />
// FIXED:  </div>
<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
 Must be at least 6 characters long
// FIXED:  </p>
// FIXED:  </div>

 <div>
 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
 Confirm Password
// FIXED:  </label>
 <div className="mt-1">
 <Input
// FIXED:  id="confirmPassword"
// FIXED:  name="confirmPassword"
// FIXED:  type="password"
 autoComplete="new-password"
 required
// FIXED:  value={confirmPassword} />
// FIXED:  onChange={(e) => setConfirmPassword(e.target.value)}
// FIXED:  className="block w-full"
// FIXED:  placeholder="Confirm your password"
 />
// FIXED:  </div>
// FIXED:  </div>

 <div className="flex items-start">
 <div className="flex items-center h-5">
 <input
// FIXED:  id="accept-terms"
// FIXED:  name="accept-terms"
// FIXED:  type="checkbox"
// FIXED:  checked={acceptTerms} />
// FIXED:  onChange={(e) => setAcceptTerms(e.target.checked)}
// FIXED:  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
 required
 />
// FIXED:  </div>
 <div className="ml-3 text-sm">
 <label htmlFor="accept-terms" className="text-gray-700 dark:text-gray-300">
 I agree to the{' '}
 <Link
 to="/terms-of-service"
// FIXED:  className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300" />
 >
 Terms of Service
// FIXED:  </Link>{' '}
 and{' '}
 <Link
 to="/privacy-policy"
// FIXED:  className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300" />
 >
 Privacy Policy
// FIXED:  </Link>
// FIXED:  </label>
// FIXED:  </div>
// FIXED:  </div>

 <div>
 <Button
// FIXED:  type="submit"
// FIXED:  disabled={isLoading}
// FIXED:  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed" />
 >
 {isLoading ? 'Creating account...' : 'Create account'}
// FIXED:  </Button>
// FIXED:  </div>
// FIXED:  </form>

 <div className="mt-6">
 <div className="text-center text-xs text-gray-500 dark:text-gray-400">
 By creating an account, you can upload videos, subscribe to channels, and interact with the community.
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default RegisterPage;
