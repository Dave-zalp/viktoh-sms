import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Download, 
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { api, AdminTransactionsData } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export default function AdminTransactionsPage() {
  const [transactionsData, setTransactionsData] = useState<AdminTransactionsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch transactions when page or search term changes
  useEffect(() => {
    fetchTransactions(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const fetchTransactions = async (page: number, search: string) => {
    try {
      setIsLoading(true);
      const response = await api.getAdminTransactions(page, search || undefined);
      
      console.log('Admin transactions response:', response);
      
      if (response.status) {
        setTransactionsData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalStats = () => {
    if (!transactionsData) return { totalCredit: 0, totalDebit: 0, totalRefund: 0 };
    
    const totalCredit = transactionsData.data
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalDebit = transactionsData.data
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalRefund = transactionsData.data
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return { totalCredit, totalDebit, totalRefund };
  };

  const handlePreviousPage = () => {
    if (transactionsData && transactionsData.current_page > 1) {
      setCurrentPage(transactionsData.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (transactionsData && transactionsData.current_page < transactionsData.last_page) {
      setCurrentPage(transactionsData.current_page + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate visible page numbers
  const getVisiblePages = () => {
    if (!transactionsData) return [];
    
    const total = transactionsData.last_page;
    const current = transactionsData.current_page;
    const pages: number[] = [];

    if (total <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // Ellipsis
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // Ellipsis
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  };

  const { totalCredit, totalDebit, totalRefund } = getTotalStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden mb-4">
        <h1 className="text-xl text-black dark:text-white mb-1">Transaction Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor all platform transactions
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl text-black dark:text-white mb-2">Transaction Management</h1>
        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Monitor and manage all platform transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Credits</p>
                <p className="text-lg sm:text-xl lg:text-2xl text-black dark:text-white">₦{totalCredit.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Debits</p>
                <p className="text-lg sm:text-xl lg:text-2xl text-black dark:text-white">₦{totalDebit.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Refunds</p>
                <p className="text-lg sm:text-xl lg:text-2xl text-black dark:text-white">₦{totalRefund.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="border border-gray-200 dark:border-gray-800 mb-4 lg:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by email, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none text-sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none text-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-base sm:text-lg text-black dark:text-white">
            All Transactions ({transactionsData?.total || 0})
            {debouncedSearchTerm && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                - Search results for "{debouncedSearchTerm}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : !transactionsData || transactionsData.data.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {debouncedSearchTerm ? 'No transactions found matching your search' : 'No transactions found'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {transactionsData.data.map((txn) => (
                    <div key={txn.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs flex-shrink-0">
                            {txn.user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-black dark:text-white truncate">{txn.user.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {txn.id}</p>
                          </div>
                        </div>
                        {txn.type === 'credit' ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900 flex-shrink-0 ml-2">
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                            Credit
                          </Badge>
                        ) : txn.type === 'refund' ? (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900 flex-shrink-0 ml-2">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refund
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900 flex-shrink-0 ml-2">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Debit
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Amount</span>
                          <span className={`text-sm ${txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : txn.type === 'refund' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {txn.type === 'credit' ? '+' : txn.type === 'refund' ? '+' : '-'}₦{parseFloat(txn.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {txn.description}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(txn.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.data.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-black dark:text-white">
                          #{txn.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs">
                              {txn.user.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-900 dark:text-white">{txn.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {txn.type === 'credit' ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900">
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                              Credit
                            </Badge>
                          ) : txn.type === 'refund' ? (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Refund
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              Debit
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`${txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : txn.type === 'refund' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {txn.type === 'credit' ? '+' : txn.type === 'refund' ? '+' : '-'}₦{parseFloat(txn.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {txn.description}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(txn.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>

        {/* Pagination */}
        {transactionsData && transactionsData.last_page > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              {/* Showing info */}
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                Showing <span className="font-medium text-black dark:text-white">{transactionsData.from}</span> to{' '}
                <span className="font-medium text-black dark:text-white">{transactionsData.to}</span> of{' '}
                <span className="font-medium text-black dark:text-white">{transactionsData.total}</span> transactions
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={transactionsData.current_page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {getVisiblePages().map((page, index) => (
                  page === -1 ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === transactionsData.current_page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageClick(page)}
                      className={`h-8 min-w-[2rem] px-2 text-xs sm:text-sm ${
                        page === transactionsData.current_page 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : ''
                      }`}
                    >
                      {page}
                    </Button>
                  )
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={transactionsData.current_page === transactionsData.last_page}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
