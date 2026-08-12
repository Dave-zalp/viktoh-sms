import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Bell,
  User,
  Wallet,
  Phone,
  Globe,
  Receipt,
  ArrowUpRight,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { api } from '../utils/api';
import { DashboardStats, NumberHistory } from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Mock data for charts - in a real app, this would come from API
const generateMockChartData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    sms: Math.floor(Math.random() * 50) + 10,
    spending: Math.floor(Math.random() * 5000) + 1000,
  }));
};

export default function DashboardPage() {
  const { updateBalance, user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPurchases, setRecentPurchases] = useState<NumberHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [chartData] = useState(generateMockChartData());

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentPurchases();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
        updateBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchRecentPurchases = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await api.getNumberHistory();
      if (response.success) {
        setRecentPurchases(response.data.numbers.slice(0, 5));
      }
    } catch (error: any) {
      console.error('Error fetching number history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'completed' || normalizedStatus === 'success' || normalizedStatus === 'received') {
      return (
        <Badge className="bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/20 border-0">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') {
      return (
        <Badge className="bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/20 border-0">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    } else if (normalizedStatus === 'expired' || normalizedStatus === 'timeout') {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/20 border-0">
          <Clock className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/20 border-0">
          <Clock className="w-3 h-3 mr-1 animate-pulse" />
          Pending
        </Badge>
      );
    }
  };

  const quickActions = [
    {
      icon: Wallet,
      label: 'Recharge Wallet',
      description: 'Add funds to your account',
      onClick: () => navigate('/dashboard/fund-wallet'),
      gradient: 'from-[#8B00FF] to-[#A020F0]'
    },
    // Server 1 (SMS-Activate/herosms) — disabled, only GrizzlySMS in use
    // {
    //   icon: Phone,
    //   label: 'Buy USA Number',
    //   description: 'Get instant verification',
    //   onClick: () => navigate('/dashboard/usa-numbers'),
    //   gradient: 'from-blue-500 to-blue-600'
    // },
    // {
    //   icon: Globe,
    //   label: 'All Countries',
    //   description: 'Browse all services',
    //   onClick: () => navigate('/dashboard/all-countries'),
    //   gradient: 'from-green-500 to-green-600'
    // },
    {
      icon: Receipt,
      label: 'Transactions',
      description: 'View payment history',
      onClick: () => navigate('/dashboard/transaction-history'),
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0614]">
        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* 1. Quick Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wallet Balance */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/30">
                    <DollarSign className="w-5 h-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : formatNaira(dashboardStats?.wallet_balance || 0)}
                </p>
              </CardContent>
            </Card>

            {/* SMS Purchased */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">SMS Purchased</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : `${dashboardStats?.total_sms_purchases || 0}`}
                </p>
              </CardContent>
            </Card>

            {/* Total Recharge */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/30">
                    <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Zap className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Recharge</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : formatNaira(dashboardStats?.total_recharge || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Fund Wallet */}
            <Card
              className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate('/dashboard/fund-wallet')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-950/30">
                    <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fund Wallet</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">
                  Add funds
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 2. Analytics & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics Section */}
            <Card className="lg:col-span-2 border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg">
              <CardHeader className="border-b border-purple-200/50 dark:border-[#2E2050] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white">SMS Usage Trend</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B00FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B00FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1C1530', 
                        border: '1px solid #2E2050',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sms" 
                      stroke="#8B00FF" 
                      fillOpacity={1} 
                      fill="url(#colorSms)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Actions Section */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg">
              <CardHeader className="border-b border-purple-200/50 dark:border-[#2E2050] p-5">
                <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white hover:shadow-lg transition-all group`}
                      >
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{action.label}</p>
                          <p className="text-xs text-white/80">{action.description}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Recent Activity Section */}
          <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] rounded-2xl shadow-lg">
            <CardHeader className="border-b border-purple-200/50 dark:border-[#2E2050] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                    <Activity className="w-5 h-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/numbers-history')}
                  className="text-[#8B00FF] dark:text-[#BF5FFF] hover:text-[#7500DC] dark:hover:text-[#A020F0] hover:bg-purple-50 dark:hover:bg-purple-950/30"
                >
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#8B00FF]/20 blur-xl rounded-full" />
                    <Loader2 className="w-8 h-8 text-[#8B00FF] dark:text-[#BF5FFF] animate-spin relative z-10" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading activity...</p>
                </div>
              ) : recentPurchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#120D1E] border-b border-purple-200/50 dark:border-[#2E2050]">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Service</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">OTP Code</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200/50 dark:divide-[#2E2050]">
                      {recentPurchases.map((purchase) => {
                        const serviceName = purchase.daisy_service_name || purchase.service?.name || 'Unknown';
                        return (
                          <tr key={purchase.id} className="hover:bg-purple-50/50 dark:hover:bg-[#120D1E]/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{serviceName}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{purchase.phone_number}</p>
                                <button
                                  onClick={() => handleCopy(purchase.phone_number, 'Phone number')}
                                  className="text-gray-400 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors"
                                >
                                  {copiedField === `phone-${purchase.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {purchase.otp_code ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#8B00FF] dark:text-[#BF5FFF]">{purchase.otp_code}</span>
                                  <button
                                    onClick={() => handleCopy(purchase.otp_code!, 'OTP code')}
                                    className="text-gray-400 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors"
                                  >
                                    {copiedField === `otp-${purchase.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {getStatusBadge(purchase.status)}
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(purchase.created_at)}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-purple-100 dark:bg-purple-950/30 rounded-full mb-3">
                    <AlertCircle className="w-8 h-8 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No activity yet</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Start by purchasing a number</p>
                  <Button
                    onClick={() => navigate('/dashboard/server3/buy-numbers')}
                    className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7500DC] hover:to-[#8B00FF] text-white"
                  >
                    Buy Number
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </>
  );
}