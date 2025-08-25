import React, { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/forms/Button';
import Input from '../components/forms/Input';
import YouTubeLogo from '../components/icons/YouTubeLogo';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: any, React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: any, FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: any, true });
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (): Promise<void> => {
    setError('');
    setIsLoading(true);

    try {
      const success = await login('demo@example.com', 'demo123');
      if (success) {
        navigate(from, { replace: any, true });
      } else {
        setError('Demo login failed. Please try again.');
      }
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark: any,bg-gray-900 flex flex-col justify-center py-12 sm: any,px-6 lg: any,px-8">
      <div className="sm: any,mx-auto sm: any,w-full sm: any,max-w-md">
        <div className="flex justify-center">
          <YouTubeLogo className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark: any,text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark: any,text-gray-400">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-red-600 hover: any,text-red-500 dark: any,text-red-400 dark: any,hover: any,text-red-300"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm: any,mx-auto sm: any,w-full sm: any,max-w-md">
        <div className="bg-white dark: any,bg-gray-800 py-8 px-4 shadow sm: any,rounded-lg sm: any,px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark: any,bg-red-900/20 p-4">
                <div className="text-sm text-red-700 dark: any,text-red-400">
                  {error}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark: any,text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark: any,border-gray-600 rounded-md placeholder-gray-400 dark: any,placeholder-gray-500 focus: any,outline-none focus: any,ring-red-500 focus: any,border-red-500 dark: any,bg-gray-700 dark: any,text-white sm: any,text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark: any,text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark: any,border-gray-600 rounded-md placeholder-gray-400 dark: any,placeholder-gray-500 focus: any,outline-none focus: any,ring-red-500 focus: any,border-red-500 dark: any,bg-gray-700 dark: any,text-white sm: any,text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus: any,ring-red-500 border-gray-300 dark: any,border-gray-600 rounded dark: any,bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark: any,text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-red-600 hover: any,text-red-500 dark: any,text-red-400 dark: any,hover: any,text-red-300">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover: any,bg-red-700 focus: any,outline-none focus: any,ring-2 focus: any,ring-offset-2 focus: any,ring-red-500 disabled: any,opacity-50 disabled: any,cursor-not-allowed dark: any,bg-red-700 dark: any,hover: any,bg-red-800"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark: any,border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark: any,bg-gray-800 text-gray-500 dark: any,text-gray-400">Or</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark: any,border-gray-600 rounded-md shadow-sm bg-white dark: any,bg-gray-700 text-sm font-medium text-gray-700 dark: any,text-gray-300 hover: any,bg-gray-50 dark: any,hover: any,bg-gray-600 focus: any,outline-none focus: any,ring-2 focus: any,ring-offset-2 focus: any,ring-red-500 disabled: any,opacity-50 disabled: any,cursor-not-allowed"
            >
              Try Demo Account
            </Button>
          </div>

          <div className="mt-6">
            <div className="text-center text-xs text-gray-500 dark: any,text-gray-400">
              By signing in, you agree to our{' '}
              <a href="/terms-of-service" className="text-red-600 hover: any,text-red-500 dark: any,text-red-400 dark: any,hover: any,text-red-300">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy-policy" className="text-red-600 hover: any,text-red-500 dark: any,text-red-400 dark: any,hover: any,text-red-300">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;