import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { api, formatApiError } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/b077b0a8da7b0daf28666392632927d24eb0ebd0.png';

// Reset Password Component
interface ResetPasswordProps {
  onSignIn: () => void;
}

export default function ResetPassword({ onSignIn }: ResetPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.forgotPassword({ email });
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (err: any) {
      setError(formatApiError(err));
      toast.error('Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center px-4 py-12">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
                <ImageWithFallback 
                  src={logoImage} 
                  alt="Viktohs SMS Logo" 
                  className="h-32 w-auto object-contain"
                />
              </Link>
            </div>
          </div>

          {/* Success Card */}
          <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
            <CardContent className="p-8 sm:p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl text-black dark:text-white mb-3">Check Your Email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                We've sent password reset instructions to
              </p>
              <p className="text-blue-600 dark:text-blue-400 mb-6">{email}</p>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Click the link in the email to reset your password. The link will expire in 1 hour for security reasons.
                </p>
              </div>

              <Button
                onClick={onSignIn}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 group mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Button>

              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Didn't receive the email? Resend
              </button>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Need help?{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center px-4 py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-6"
          >
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <ImageWithFallback 
                src={logoImage} 
                alt="Viktohs SMS Logo" 
                className="h-32 w-auto object-contain"
              />
            </Link>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl text-black dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you instructions
          </p>
        </div>

        {/* Reset Password Card */}
        <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Forgot your password? No problem!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    We'll email you a secure link to reset your password and regain access to your account.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="pl-10 h-12 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Enter the email address associated with your account
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 group disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Sending instructions...</span>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* Back to Sign In */}
              <Button
                type="button"
                onClick={onSignIn}
                variant="outline"
                className="w-full h-12 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center space-y-4">
          <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <h3 className="text-sm text-black dark:text-white mb-2">Need immediate help?</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Our support team is available 24/7 to help you recover your account
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Contact Support
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-600">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Secure Process</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Link expires in 1 hour</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}