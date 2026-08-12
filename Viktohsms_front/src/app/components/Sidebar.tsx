import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { cn } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/71148f68085c2a8ea4e6f082d8049053ae46887c.png';
import {
  LayoutDashboard,
  Wallet,
  Phone,
  Globe,
  HelpCircle,
  FileText,
  Receipt,
  LogOut,
  ShoppingBag,
  Shield,
  ChevronDown,
  ChevronRight,
  Server,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onLogout: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ onLogout, isMobile = false, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use
  // const [server1Open, setServer1Open] = useState(
  //   location.pathname.startsWith('/dashboard/usa-numbers') ||
  //   location.pathname.startsWith('/dashboard/all-countries') ||
  //   location.pathname.startsWith('/dashboard/numbers/')
  // );
  // Server 2 (DaisySMS) — disabled, only GrizzlySMS in use
  // const [server2Open, setServer2Open] = useState(
  //   location.pathname.startsWith('/dashboard/server2')
  // );
  const [server3Open, setServer3Open] = useState(
    location.pathname.startsWith('/dashboard/server3')
  );

  const handleNavClick = (path: string) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (onNavigate) onNavigate();
  };

  const handleLogoutClick = () => {
    onLogout();
    if (onNavigate) onNavigate();
  };

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  // Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use
  // const server1Active =
  //   isActive('/dashboard/usa-numbers') ||
  //   isActive('/dashboard/all-countries') ||
  //   isActive('/dashboard/numbers/');

  // Server 2 (DaisySMS) — disabled, only GrizzlySMS in use
  // const server2Active = isActive('/dashboard/server2');
  const server3Active = isActive('/dashboard/server3');

  const navBtn = (
    path: string,
    Icon: React.ElementType,
    label: string,
    exact = false,
    isExternal = false,
    indent = false
  ) => {
    const active = !isExternal && (exact ? location.pathname === path : isActive(path));
    return (
      <button
        key={path}
        onClick={() => isExternal ? handleExternalLink(path) : handleNavClick(path)}
        className={cn(
          "w-full flex items-center gap-3 rounded-lg text-left transition-all text-sm",
          indent ? "px-4 py-2" : "px-3 py-2.5",
          active && !isExternal
            ? "bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{label}</span>
      </button>
    );
  };

  const serverToggle = (
    label: string,
    isOpen: boolean,
    isAnyChildActive: boolean,
    onToggle: () => void
  ) => (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-medium",
        isAnyChildActive && !isOpen
          ? "bg-purple-50 dark:bg-purple-950/30 text-[#8B00FF] dark:text-[#BF5FFF]"
          : "text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <Server className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {isOpen
        ? <ChevronDown className="w-3.5 h-3.5" />
        : <ChevronRight className="w-3.5 h-3.5" />
      }
    </button>
  );

  return (
    <div className={cn(
      "w-64 h-screen flex flex-col bg-white dark:bg-[#1C1530]",
      isMobile ? "border-0" : "border-r border-purple-200/50 dark:border-[#2E2050] shadow-sm"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530]">
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src={logoImage}
            alt="Viktohs SMS Logo"
            className={cn("object-contain", isMobile ? "h-16 w-16" : "h-14 w-14")}
          />
          <span className={cn("font-bold text-[#8B00FF] dark:text-[#BF5FFF]", isMobile ? "text-2xl" : "text-xl")}>
            Viktohs SMS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className={cn(
        "flex-1 overflow-y-auto bg-white dark:bg-[#1C1530]",
        isMobile ? "py-4 px-2" : "py-5 px-3"
      )}>
        <nav className="space-y-0.5">
          {navBtn('/dashboard', LayoutDashboard, 'Dashboard', true)}
          {navBtn('/dashboard/fund-wallet', Wallet, 'Fund Wallet')}

          {/* Server 3 (GrizzlySMS) — shown first */}
          <div className="pt-1">
            {serverToggle('Server 3', server3Open, server3Active, () => setServer3Open(o => !o))}
            {server3Open && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-purple-200/50 dark:border-[#2E2050] space-y-0.5">
                {navBtn('/dashboard/server3/buy-numbers', ShoppingCart, 'Buy Numbers', false, false, true)}
              </div>
            )}
          </div>

          {/* Server 2 (DaisySMS) — disabled, only GrizzlySMS in use */}
          {/* <div className="pt-1">
            {serverToggle('Server 2', server2Open, server2Active, () => setServer2Open(o => !o))}
            {server2Open && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-purple-200/50 dark:border-[#2E2050] space-y-0.5">
                {navBtn('/dashboard/server2/buy-numbers', ShoppingCart, 'Buy Numbers', false, false, true)}
              </div>
            )}
          </div> */}

          {/* Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use */}
          {/* <div className="pt-1">
            {serverToggle('Server 1', server1Open, server1Active, () => setServer1Open(o => !o))}
            {server1Open && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-purple-200/50 dark:border-[#2E2050] space-y-0.5">
                {navBtn('/dashboard/usa-numbers', Phone, 'USA Numbers', false, false, true)}
                {navBtn('/dashboard/all-countries', Globe, 'All Countries', false, false, true)}
              </div>
            )}
          </div> */}

          <div className="pt-1 space-y-0.5">
            {navBtn('https://viktohsstore.com', ShoppingBag, 'Buy Logs', false, true)}
            {navBtn('/dashboard/faqs', HelpCircle, 'FAQs')}
          </div>
        </nav>

        {/* History Section */}
        <div className="mt-6">
          <h3 className="px-3 mb-1.5 text-xs tracking-wider text-gray-500 dark:text-gray-400">
            HISTORY
          </h3>
          <nav className="space-y-0.5">
            {navBtn('/dashboard/numbers-history', FileText, 'Numbers History')}
            {navBtn('/dashboard/transaction-history', Receipt, 'Transaction History')}
          </nav>
        </div>
      </div>

      {/* Admin Panel Quick Link */}
      {user?.role === 'admin' && (
        <div className={cn(
          "border-t border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530]",
          isMobile ? "p-2" : "p-3"
        )}>
          <button
            onClick={() => handleNavClick('/admin')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left bg-purple-50 dark:bg-purple-950/30 text-[#8B00FF] dark:text-[#BF5FFF] hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-all text-sm border border-purple-200 dark:border-[#2E2050]"
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Admin Panel</span>
          </button>
        </div>
      )}

      {/* Logout */}
      <div className={cn(
        "border-t border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530]",
        isMobile ? "p-2" : "p-3"
      )}>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
