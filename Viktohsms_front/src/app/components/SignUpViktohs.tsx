import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, Phone, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import viktohsLogo from 'figma:asset/9cdb36d4fd8c222cc2558eac22709b1e42f6b1cf.png';

interface SignUpProps {
  onSignIn: () => void;
}

export default function SignUpViktohs({ onSignIn }: SignUpProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register({
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });

      toast.success('Account created successfully! Welcome to Viktohs SMS!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.errors) {
        const apiErrors: { [key: string]: string } = {};
        Object.entries(error.errors).forEach(([key, value]: [string, any]) => {
          const errorMessage = Array.isArray(value) ? value[0] : value;
          
          const fieldMap: { [key: string]: string } = {
            'username': 'username',
            'email': 'email',
            'phone_number': 'phone',
            'password': 'password',
            'password_confirmation': 'confirmPassword'
          };
          
          const formFieldName = fieldMap[key] || key;
          apiErrors[formFieldName] = errorMessage;
        });
        setErrors(apiErrors);
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F4FF] via-white to-[#EDE7FF] dark:from-[#0A0710] dark:via-[#120D1E] dark:to-[#0A0710] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#8B00FF]/10 to-[#A020F0]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#C77DFF]/10 to-[#BF5FFF]/10 rounded-full blur-3xl" />

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
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Join Viktohs SMS today
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className={`pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white ${
                      errors.username ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white ${
                      errors.email ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    className={`pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white ${
                      errors.phone ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={`pl-10 pr-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white ${
                      errors.password ? 'border-red-500 dark:border-red-500' : ''
                    }`}
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
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white ${
                      errors.confirmPassword ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-900/50 disabled:opacity-50 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={onSignIn}
                  className="text-[#8B00FF] dark:text-[#BF5FFF] hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign in
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