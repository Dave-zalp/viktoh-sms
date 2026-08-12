import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import viktohsLogo from 'figma:asset/9cdb36d4fd8c222cc2558eac22709b1e42f6b1cf.png';

export default function ResetPasswordViktohs() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.forgotPassword({ email });
      setSuccess('Password reset instructions have been sent to your email.');
      toast.success('Reset email sent! Check your inbox.');
      
      setTimeout(() => {
        setStep('reset');
      }, 2000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await api.resetPassword({
        email,
        token: resetToken,
        password: newPassword
      });
      
      setSuccess('Password reset successfully! Redirecting to sign in...');
      toast.success('Password reset successful!');
      
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
      toast.error(error.message || 'Failed to reset password');
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
                {step === 'email' ? 'Reset Password' : 'Create New Password'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {step === 'email' 
                  ? 'Enter your email to receive reset instructions' 
                  : 'Enter your reset token and new password'}
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

            {/* Success Alert */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
                    {success}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Step 1: Request Reset Email */}
            {step === 'email' && (
              <form onSubmit={handleSendResetEmail} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-900/50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Send Reset Email</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('reset')}
                    className="text-sm text-[#8B00FF] dark:text-[#BF5FFF] hover:underline"
                    disabled={isLoading}
                  >
                    Already have a reset token?
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Reset Password with Token */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-gray-700 dark:text-gray-300">
                    Reset Token
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="token"
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter reset token from email"
                      className="pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 h-12 bg-[#F8F4FF] dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-gray-900 dark:text-white"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-900/50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Reset Password</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-[#8B00FF] dark:text-[#BF5FFF] hover:underline flex items-center gap-1 mx-auto"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to email step
                  </button>
                </div>
              </form>
            )}

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/signin"
                  className="text-[#8B00FF] dark:text-[#BF5FFF] hover:underline font-medium"
                >
                  Sign in
                </Link>
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