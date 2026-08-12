import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  ShoppingCart,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/71148f68085c2a8ea4e6f082d8049053ae46887c.png';
import { useState } from 'react';

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin' 
    },
    { 
      icon: Users, 
      label: 'User Management', 
      path: '/admin/users' 
    },
    { 
      icon: Receipt, 
      label: 'Transaction Management', 
      path: '/admin/transactions' 
    },
    { 
      icon: ShoppingCart, 
      label: 'Order Management', 
      path: '/admin/orders' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/admin/settings' 
    }
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 right-4 z-50 p-2.5 rounded-lg bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white shadow-lg hover:from-[#7A00E6] hover:to-[#9010E0] transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-white dark:bg-[#0A0612] border-r border-purple-200/50 dark:border-[#2E2050]
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Brand */}
        <div className="p-6 border-b border-purple-200/50 dark:border-[#2E2050]">
          <div className="flex items-center gap-3">
            <ImageWithFallback 
              src={logoImage} 
              alt="Viktohs SMS Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-[#8B00FF] to-[#A020F0] bg-clip-text text-transparent">Viktohs SMS</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-purple-200/50 dark:border-[#2E2050] bg-purple-50 dark:bg-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B00FF] to-[#A020F0] flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-xs text-[#8B00FF] dark:text-[#BF5FFF]">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white shadow-lg shadow-purple-500/30' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Link to User Dashboard */}
        <div className="px-3 pb-4">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-gray-100 dark:bg-[#120D1E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1A1426] border border-purple-200/50 dark:border-[#2E2050]"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">User Dashboard</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-purple-200/50 dark:border-[#2E2050]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}