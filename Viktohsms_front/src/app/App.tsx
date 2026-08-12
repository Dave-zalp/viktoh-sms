import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import FundWalletPage from './pages/FundWalletPage';
// Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use
// import USANumbersPage from './pages/USANumbersPage';
// import AllCountriesPage from './pages/AllCountriesPage';
import ReferEarnPage from './pages/ReferEarnPage';
import FAQsPage from './pages/FAQsPage';
import NumbersHistoryPage from './pages/NumbersHistoryPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
// Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use
// import NumberSelectionPage from './pages/NumberSelectionPage';
// import ActiveNumberPage from './pages/ActiveNumberPage';
// Server 2 (DaisySMS) — disabled, only GrizzlySMS in use
// import DaisySMSBuyNumbersPage from './pages/DaisySMSBuyNumbersPage';
import GrizzlySMSBuyNumbersPage from './pages/GrizzlySMSBuyNumbersPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { cache } from './utils/cache';
import SocialFloatingButtons from './components/SocialFloatingButtons';

function AppContent() {
  // Define route guards INSIDE AppContent so they're within AuthProvider context
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#8B00FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
  }

  function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#8B00FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      // Redirect admins to admin panel, regular users to dashboard
      return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
    }

    return <>{children}</>;
  }

  function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#8B00FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/signin" replace />;
    }

    // Redirect non-admin users to dashboard
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/signin" 
          element={
            <PublicRoute>
              <SignInPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          } 
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="fund-wallet" element={<FundWalletPage />} />
          {/* Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use */}
          {/* <Route path="usa-numbers" element={<USANumbersPage />} /> */}
          {/* <Route path="all-countries" element={<AllCountriesPage />} /> */}
          <Route path="refer" element={<ReferEarnPage />} />
          <Route path="faqs" element={<FAQsPage />} />
          <Route path="numbers-history" element={<NumbersHistoryPage />} />
          <Route path="transaction-history" element={<TransactionHistoryPage />} />
          {/* Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use */}
          {/* <Route path="numbers/:countryId" element={<NumberSelectionPage />} /> */}
          {/* <Route path="active/:numberId" element={<ActiveNumberPage />} /> */}
          {/* Server 2 (DaisySMS) — disabled, only GrizzlySMS in use */}
          {/* <Route path="server2/buy-numbers" element={<DaisySMSBuyNumbersPage />} /> */}
          <Route path="server3/buy-numbers" element={<GrizzlySMSBuyNumbersPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <SocialFloatingButtons />
    </div>
  );
}

export default function App() {
  // Clear expired cache on app startup
  useEffect(() => {
    cache.clearExpired();
    
    // Set document title and meta description
    document.title = 'Viktohs SMS - Instant Virtual Phone Numbers for SMS Verification';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Get instant virtual phone numbers from 150+ countries. Verify any account, protect your privacy, and receive SMS codes instantly with Viktohs SMS.');
    
    // Ensure robots meta tag allows indexing (remove any noindex)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'index, follow');
    
    // Add googlebot specific meta tag
    let metaGooglebot = document.querySelector('meta[name="googlebot"]');
    if (!metaGooglebot) {
      metaGooglebot = document.createElement('meta');
      metaGooglebot.setAttribute('name', 'googlebot');
      document.head.appendChild(metaGooglebot);
    }
    metaGooglebot.setAttribute('content', 'index, follow');
    
    // Add Open Graph meta tags for better social sharing
    const ogTags = [
      { property: 'og:title', content: 'Viktohs SMS - Instant Virtual Phone Numbers for SMS Verification' },
      { property: 'og:description', content: 'Get instant virtual phone numbers from 150+ countries. Verify any account, protect your privacy, and receive SMS codes instantly.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://smslegit.com' },
      { property: 'og:site_name', content: 'Viktohs SMS' }
    ];
    
    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
    
    // Add Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Viktohs SMS - Instant Virtual Phone Numbers for SMS Verification' },
      { name: 'twitter:description', content: 'Get instant virtual phone numbers from 150+ countries. Verify any account, protect your privacy, and receive SMS codes instantly.' }
    ];
    
    twitterTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', tag.name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
    
    // Add canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', window.location.origin + window.location.pathname);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <CustomThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
