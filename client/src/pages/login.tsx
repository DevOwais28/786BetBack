// login.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Your login logic here
    // For example, you might want to make an API call to authenticate the user
    // and then navigate to the dashboard if successful.
    console.log('Logging in with:', username, password);
    setLocation('/dashboard'); // Navigate to the dashboard
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* <Header showBackButton showFullNavigation={false} onBackClick={() => setLocation('/')} /> */}
      <div className="max-w-md mx-auto mt-16 p-8 bg-gray-800 rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Login</h1>
          <p className="text-gray-400">Welcome back! Please login to your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-3">
              Username
            </Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-3">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-2xl bg-gold hover:bg-emerald text-black font-bold px-6 py-4 shadow-md text-lg"
          >
            Login
          </Button>
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register">
                <span className="text-gold hover:underline">Register here</span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;