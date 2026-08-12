import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Receipt, ShoppingCart, TrendingUp, DollarSign, Activity, XCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, RecentUser, RecentTransaction } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: '0',
    totalFailedOrders: 0,
    totalPassedOrders: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    fetchRecentStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAdminDashboardStats();
      
      console.log('Admin stats response:', response);
      
      if (response.success) {
        console.log('Setting stats:', {
          totalUsers: response.data.total_users,
          totalTransactions: response.data.total_transactions,
          totalRevenue: response.data.total_revenue,
          totalFailedOrders: response.data.total_failed_orders,
          totalPassedOrders: response.data.total_passed_orders
        });
        
        setStats({
          totalUsers: response.data.total_users || 0,
          totalTransactions: response.data.total_transactions || 0,
          totalRevenue: response.data.total_revenue || '0',
          totalFailedOrders: response.data.total_failed_orders || 0,
          totalPassedOrders: response.data.total_passed_orders || 0
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentStats = async () => {
    try {
      setIsLoadingRecent(true);
      const response = await api.getAdminRecentStats();
      
      console.log('Recent stats response:', response);
      
      if (response.success) {
        setRecentUsers(response.data.recent_users || []);
        setRecentTransactions(response.data.recent_transactions || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch recent stats:', error);
      toast.error('Failed to load recent activity');
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const totalOrders = (stats.totalFailedOrders || 0) + (stats.totalPassedOrders || 0);

  const statCards = [
    {
      title: 'Total Users',
      value: isLoading ? '...' : (stats.totalUsers || 0).toLocaleString(),
      subtitle: 'All registered users',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-gradient-to-br from-[#8B00FF] to-[#A020F0]',
      lightBg: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      title: 'Total Transactions',
      value: isLoading ? '...' : (stats.totalTransactions || 0).toLocaleString(),
      subtitle: 'All time',
      icon: Receipt,
      color: 'green',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      lightBg: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      title: 'Total Revenue',
      value: isLoading ? '...' : `₦${parseFloat(stats.totalRevenue || '0').toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'All time earnings',
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      lightBg: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Successful Orders',
      value: isLoading ? '...' : (stats.totalPassedOrders || 0).toLocaleString(),
      subtitle: 'Completed orders',
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-green-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      title: 'Failed Orders',
      value: isLoading ? '...' : (stats.totalFailedOrders || 0).toLocaleString(),
      subtitle: 'Unsuccessful orders',
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-gradient-to-br from-red-500 to-rose-500',
      lightBg: 'bg-red-50 dark:bg-red-950/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] border-b border-purple-300 dark:border-purple-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg text-white font-bold">Admin Dashboard</h1>
            <p className="text-xs text-purple-100">Welcome, {user?.username}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden lg:block mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl text-black dark:text-white mb-2 font-bold">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Here's what's happening with your platform today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`p-1.5 sm:p-2 lg:p-3 rounded-lg ${stat.lightBg}`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl text-black dark:text-white mb-0.5 sm:mb-1 truncate">{stat.value}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-0.5 truncate">{stat.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">{stat.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Users */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-black dark:text-white">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-2 sm:space-y-3">
                {isLoadingRecent ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs flex-shrink-0 animate-pulse">
                        ...
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ) : recentUsers.length > 0 ? (
                  recentUsers.map((recentUser) => (
                    <div key={recentUser.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs flex-shrink-0">
                          {recentUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-black dark:text-white truncate">{recentUser.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{recentUser.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">₦{parseFloat(recentUser.balance).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg text-black dark:text-white">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-2 sm:space-y-3">
                {isLoadingRecent ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
                    </div>
                  </div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-black dark:text-white truncate">{transaction.reference}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{transaction.email}</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className={`text-xs sm:text-sm ${transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{transaction.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}