import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import viktohsLogo from 'figma:asset/9cdb36d4fd8c222cc2558eac22709b1e42f6b1cf.png';

interface SignInProps {
  onSignUp: () => void;
  onResetPassword: () => void;
}

export default function SignInViktohs({ onSignUp, onResetPassword }: SignInProps) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.login({
        login,
        password,
        remember: rememberMe
      });
      
      toast.success('Welcome back!');
      
      if (response.data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F4FF] via-white to-[#EDE7FF] dark:from-[#0A0710] dark:via-[#120D1E] dark:to-[#0A0710] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#8B00FF]/10 to-[#A020F0]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#C77DFF]/10 to-[#BF5FFF]/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/90 dark:bg-[#1C1530]/90 backdrop-blur-xl border-2 border-purple-200/50 dark:border-[#2E2050] shadow-2xl">
          <CardContent className="p-8">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={viktohsLogo} 
                  alt="Viktohs SMS" 
                  className="h-16 w-auto"
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sign in to your Viktohs SMS account
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Username Field */}
              <div className="space-y-2">
                <Label htmlFor="login" className="text-gray-700 dark:text-gray-300">
                  Email or Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Enter your email or username"
                    className="pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                    className="border-purple-300 dark:border-[#2E2050] data-[state=checked]:bg-[#8B00FF] data-[state=checked]:border-[#8B00FF]"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="text-sm text-[#8B00FF] dark:text-[#BF5FFF] hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-900/50 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={onSignUp}
                  className="text-[#8B00FF] dark:text-[#BF5FFF] hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}