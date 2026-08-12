import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Menu,
  User,
  Settings,
  LogOut,
  Wallet,
  Smartphone,
  MonitorSmartphone,
  Loader2,
  Sun,
  Moon,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  Dialog,
  DialogContent,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import Sidebar from '../components/Sidebar';
import SocialFloatingButtons from '../components/SocialFloatingButtons';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api, MeResponse } from '../utils/api';
import logoImage from 'figma:asset/71148f68085c2a8ea4e6f082d8049053ae46887c.png';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutCurrentDevice, logoutAllDevices, updateBalance } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<MeResponse['data']['user'] | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Get wallet balance from user or default
  const walletBalance = user ? parseFloat(user.balance) : 0;

  // Show welcome popup once per 24 hours per user
  useEffect(() => {
    if (!user) return;
    const key = `viktohs_welcome_${user.id}`;
    const last = localStorage.getItem(key);
    const now = Date.now();
    if (!last || now - parseInt(last, 10) > 24 * 60 * 60 * 1000) {
      setShowWelcomeModal(true);
      localStorage.setItem(key, String(now));
    }
  }, [user?.id]);

  // Fetch balance on mount and when navigating to non-dashboard pages
  useEffect(() => {
    // Don't fetch balance on the dashboard home page (it will use stats endpoint)
    if (location.pathname !== '/dashboard') {
      fetchBalance();
    }
  }, [location.pathname]);

  const fetchBalance = async () => {
    try {
      const response = await api.getBalance();
      if (response.success) {
        updateBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      // Silently fail - keep showing current balance
    }
  };

  const handleOpenProfile = async () => {
    setShowProfileModal(true);
    if (profileData) return; // already loaded
    setIsLoadingProfile(true);
    try {
      const res = await api.getMe();
      setProfileData(res.data.user);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
      setShowProfileModal(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutCurrent = async () => {
    try {
      setIsLoggingOut(true);
      await logoutCurrentDevice();
      api.logout(); // Clear local storage
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAllDevices();
      api.logout(); // Clear local storage
      toast.success('Logged out from all devices successfully');
      navigate('/signin');
    } catch (error: any) {
      console.error('Logout all devices error:', error);
      toast.error(error.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 h-16 bg-white dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between px-4 lg:px-6 z-30 shadow-sm">
          {/* Left Side - Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden hover:bg-gray-100 dark:hover:bg-slate-600"
                >
                  <Menu className="w-6 h-6 text-gray-700 dark:text-slate-200" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar onLogout={handleLogout} isMobile onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3 lg:hidden">
              <img 
                src={logoImage} 
                alt="Viktohs SMS" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-lg text-gray-900 dark:text-slate-100">Viktohs SMS</span>
            </div>
          </div>

          {/* Right Side - Theme Switcher + Balance + User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher - Always Visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full flex-shrink-0 w-10 h-10 border-2 border-gray-300 dark:border-slate-500"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </Button>

            {/* Balance Display - Always Visible */}
            <div
              onClick={() => navigate('/dashboard/fund-wallet')}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 cursor-pointer transition-colors border border-gray-300 dark:border-slate-500 flex-shrink-0"
            >
              <span className="text-gray-900 dark:text-slate-100">₦</span>
              <span className="text-gray-900 dark:text-slate-100">{walletBalance.toFixed(0)}</span>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-600">
                  <Avatar className="w-9 h-9 border-2 border-blue-500">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-gray-900 dark:text-slate-100">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email || 'user@example.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer sm:hidden" onClick={() => navigate('/dashboard/fund-wallet')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet: ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-800">
          <Outlet />
        </div>
      </div>

      {/* Social Floating Buttons */}
      <SocialFloatingButtons />

      {/* Welcome Modal — shown once per 24 hours after login */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white dark:bg-[#1C1530] border border-purple-200/50 dark:border-[#2E2050]">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-purple-100 dark:border-[#2E2050]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Welcome to <span className="text-[#8B00FF] dark:text-[#BF5FFF]">ViktohSms</span>
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Telegram Channel */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Join Our Telegram Channel</p>
              <a
                href="https://t.me/+0v09JFhl1sZjYTlk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#8B00FF] dark:text-[#BF5FFF] hover:underline font-medium"
              >
                Join Channel
              </a>
            </div>

            {/* Support */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Message Support</p>
              <a
                href="https://t.me/viktohs_store_customer_care"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#8B00FF] dark:text-[#BF5FFF] hover:underline font-medium break-all"
              >
                t.me/viktohs_store_customer_care
              </a>
            </div>

            {/* How to buy */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">How to Buy SMS Units</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Go to the dashboard and click Fund Wallet. Choose your preferred payment method and follow the instructions to complete the purchase.
              </p>
            </div>

            {/* SMS Costs */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">SMS Costs</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Our SMS verification prices are affordable for all users and resellers. Get started today.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-purple-100 dark:border-[#2E2050]">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7500DC] hover:to-[#8B00FF] text-white text-sm font-semibold transition-all"
            >
              Get Started
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile / Settings Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#1C1530] border border-purple-200/50 dark:border-[#2E2050]">
          {/* Purple gradient header */}
          <div className="relative bg-gradient-to-br from-[#8B00FF] to-[#A020F0] px-6 pt-8 pb-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white text-2xl font-bold">
                {(profileData?.username ?? user?.username ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg leading-tight">
                  {isLoadingProfile ? '…' : (profileData?.username ?? user?.username ?? 'User')}
                </p>
                <p className="text-purple-200 text-sm mt-0.5">
                  {isLoadingProfile ? '…' : (profileData?.email ?? user?.email ?? '')}
                </p>
              </div>
            </div>
          </div>

          {/* Content card — floats over the purple header */}
          <div className="-mt-6 mx-4 mb-4 bg-white dark:bg-[#120D1E] rounded-xl border border-purple-100 dark:border-[#2E2050] shadow-sm overflow-hidden">
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 text-[#8B00FF] dark:text-[#BF5FFF] animate-spin" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading profile…</span>
              </div>
            ) : profileData ? (
              <dl className="divide-y divide-purple-100/60 dark:divide-[#2E2050]">
                <ProfileRow
                  icon={<User className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />}
                  label="Username"
                  value={profileData.username}
                />
                <ProfileRow
                  icon={<Mail className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />}
                  label="Email"
                  value={profileData.email}
                  badge={
                    profileData.is_email_verified ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )
                  }
                />
                <ProfileRow
                  icon={<Phone className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />}
                  label="Phone"
                  value={profileData.phone || '—'}
                />
                <ProfileRow
                  icon={<Wallet className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />}
                  label="Balance"
                  value={profileData.balance}
                />
                <ProfileRow
                  icon={<CalendarDays className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />}
                  label="Member since"
                  value={new Date(profileData.created_at).toLocaleDateString('en-NG', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                />
              </dl>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <LogOut className="w-5 h-5 text-red-600" />
              Logout Options
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-slate-400">
              Choose how you'd like to logout from your account
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            {/* Current Device Option */}
            <div 
              onClick={!isLoggingOut ? handleLogoutCurrent : undefined}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isLoggingOut 
                  ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-slate-100 mb-1">Logout Current Device</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    You'll be logged out from this device only
                  </p>
                </div>
              </div>
            </div>

            {/* All Devices Option */}
            <div 
              onClick={!isLoggingOut ? handleLogoutAll : undefined}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isLoggingOut 
                  ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                  <MonitorSmartphone className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-slate-100 mb-1">Logout All Devices</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    You'll be logged out from all devices
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isLoggingOut && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-slate-400">Logging out...</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
    </div>
  );
}