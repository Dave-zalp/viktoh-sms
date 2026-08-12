import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { api, Transaction } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';

export default function TransactionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      console.log('Auth token:', api.getToken() ? 'Present' : 'Missing');
      console.log('User:', api.getUser());
      
      setIsLoading(true);
      setError(null);
      
      const response = await api.getTransactions();
      console.log('Transactions response:', response);
      
      if (response.success) {
        // Use data.numbers instead of data.transactions
        setTransactions(response.data.numbers || []);
        console.log('Transactions set:', response.data.numbers?.length || 0, 'items');
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      const errorMessage = error.message || 'Failed to load transaction history';
      setError(errorMessage);
      setTransactions([]); // Set to empty array on error
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure transactions is always an array before filtering
  const filteredTransactions = (transactions || []).filter(tx =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    if (normalizedType.includes('deposit') || normalizedType.includes('credit') || normalizedType.includes('refund')) {
      return <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />;
    } else if (normalizedType.includes('purchase') || normalizedType.includes('debit') || normalizedType.includes('withdrawal')) {
      return <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />;
    } else {
      return <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    if (normalizedType.includes('deposit') || normalizedType.includes('credit')) {
      return (
        <Badge className="bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/20">
          Deposit
        </Badge>
      );
    } else if (normalizedType.includes('purchase') || normalizedType.includes('debit')) {
      return (
        <Badge className="bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/20">
          Purchase
        </Badge>
      );
    } else if (normalizedType.includes('refund')) {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/20">
          Refund
        </Badge>
      );
    } else if (normalizedType.includes('referral') || normalizedType.includes('bonus')) {
      return (
        <Badge className="bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/20">
          Bonus
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-950/20">
          {type}
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toLocaleDateString();
    const todayOnly = today.toLocaleDateString();
    const yesterdayOnly = yesterday.toLocaleDateString();

    if (dateOnly === todayOnly) {
      return {
        date: 'Today',
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } else if (dateOnly === yesterdayOnly) {
      return {
        date: 'Yesterday',
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
  };

  // Calculate totals - with safety checks
  const totalDeposits = (transactions || [])
    .filter(tx => tx && tx.type?.toLowerCase() === 'credit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  const totalSpent = (transactions || [])
    .filter(tx => tx && tx.type?.toLowerCase() === 'debit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  const totalRefunds = (transactions || [])
    .filter(tx => tx && tx.type?.toLowerCase() === 'refund')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#8B00FF] via-[#A020F0] to-[#8B00FF] dark:from-[#6B00CC] dark:via-[#8010D0] dark:to-[#6B00CC] shadow-xl shadow-purple-500/20 dark:shadow-purple-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl text-white mb-1 sm:mb-2 font-bold">Transaction History</h1>
            <p className="text-xs sm:text-sm md:text-base text-purple-100 dark:text-purple-200">
              View all your wallet transactions
            </p>
          </div>
          <Button
            onClick={fetchTransactions}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 dark:bg-white/10 dark:hover:bg-white/20 w-full sm:w-auto"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-4 sm:mb-6 border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#0A0612] shadow-lg dark:shadow-gray-900/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-12 border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-sm sm:text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#0A0612] shadow-lg dark:shadow-gray-900/50">
        <CardHeader className="border-b border-purple-200/50 dark:border-[#2E2050] bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent p-4 sm:p-6">
          <CardTitle className="text-gray-900 dark:text-white text-lg sm:text-xl font-semibold">
            All Transactions {transactions.length > 0 && `(${transactions.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B00FF] dark:text-[#BF5FFF] animate-spin mb-3" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 dark:text-red-500 mb-3" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 text-center">{error}</p>
              <Button 
                onClick={fetchTransactions}
                className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7A00E6] hover:to-[#9010E0] text-white"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">No transactions yet</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-blue-100 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Type</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Description</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Reference</th>
                      <th className="px-6 py-3 text-right text-xs tracking-wider text-gray-700 dark:text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredTransactions.map((tx) => {
                      const { date, time } = formatDate(tx.created_at);
                      const amount = parseFloat(tx.amount);
                      // For debit transactions, show as negative
                      const displayAmount = tx.type.toLowerCase() === 'debit' ? -amount : amount;
                      
                      return (
                        <tr key={tx.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(tx.type)}
                              {getTypeBadge(tx.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 dark:text-white">{tx.description}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            <div>{date}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                              {tx.reference}
                            </code>
                          </td>
                          <td className={`px-6 py-4 text-right ${
                            displayAmount > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {displayAmount > 0 ? '+' : ''}{formatNaira(displayAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tx) => {
                  const { date, time } = formatDate(tx.created_at);
                  const amount = parseFloat(tx.amount);
                  // For debit transactions, show as negative
                  const displayAmount = tx.type.toLowerCase() === 'debit' ? -amount : amount;
                  
                  return (
                    <div key={tx.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Type & Date Row */}
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="flex-shrink-0">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div className="flex-shrink-0">
                            {getTypeBadge(tx.type)}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right flex-shrink-0">
                          <div className="whitespace-nowrap">{date}</div>
                          <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-2 sm:mb-3">
                        <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-snug">{tx.description}</p>
                      </div>

                      {/* Reference & Amount Row */}
                      <div className="flex items-end justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                          <code className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-1.5 sm:px-2 py-1 rounded block break-all">
                            {tx.reference}
                          </code>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                          <p className={`text-base sm:text-lg font-semibold whitespace-nowrap ${
                            displayAmount > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {displayAmount > 0 ? '+' : ''}{formatNaira(displayAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTransactions.length === 0 && searchQuery && (
                <div className="text-center py-12 px-4">
                  <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No transactions found matching your search.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}