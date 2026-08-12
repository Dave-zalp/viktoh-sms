import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { api, AdminUser, AdminUsersData, UpdateBalanceError } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export default function AdminUsersPage() {
  const [usersData, setUsersData] = useState<AdminUsersData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Balance adjustment dialog state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [balanceType, setBalanceType] = useState<'credit' | 'debit'>('credit');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

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

  // Fetch users when page or search term changes
  useEffect(() => {
    fetchUsers(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const fetchUsers = async (page: number, search: string) => {
    try {
      setIsLoading(true);
      const response = await api.getAdminUsers(page, search || undefined);
      
      console.log('Admin users response:', response);
      
      if (response.status) {
        setUsersData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustBalance = (user: AdminUser) => {
    setSelectedUser(user);
    setBalanceType('credit');
    setBalanceAmount('');
    setIsBalanceDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsUpdatingBalance(true);
      const response = await api.updateBalance({
        user_id: selectedUser.id,
        amount: amount,
        type: balanceType,
      });

      if ('status' in response && response.status) {
        toast.success(response.message);
        setIsBalanceDialogOpen(false);
        setBalanceAmount('');
        // Refresh users list
        fetchUsers(currentPage, debouncedSearchTerm);
      }
    } catch (error: any) {
      console.error('Failed to update balance:', error);
      
      // Handle validation errors
      if (error.errors) {
        const firstErrorKey = Object.keys(error.errors)[0];
        toast.error(error.errors[firstErrorKey][0]);
      } else {
        toast.error(error.message || 'Failed to update balance');
      }
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const handlePreviousPage = () => {
    if (usersData && usersData.current_page > 1) {
      setCurrentPage(usersData.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (usersData && usersData.current_page < usersData.last_page) {
      setCurrentPage(usersData.current_page + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate visible page numbers
  const getVisiblePages = () => {
    if (!usersData) return [];
    
    const total = usersData.last_page;
    const current = usersData.current_page;
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden mb-4">
        <h1 className="text-xl text-black dark:text-white mb-1">User Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage all users
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl text-black dark:text-white mb-2">User Management</h1>
        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Manage all users and their accounts
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="border border-gray-200 dark:border-gray-800 mb-4 lg:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-base sm:text-lg text-black dark:text-white">
            All Users ({usersData?.total || 0})
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
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : !usersData || usersData.data.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {debouncedSearchTerm ? 'No users found matching your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {usersData.data.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-black dark:text-white truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">₦{parseFloat(user.balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAdjustBalance(user)}>
                              Adjust Balance
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.phone_number}</span>
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
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-black dark:text-white">{user.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {user.phone_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-black dark:text-white">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ₦{parseFloat(user.balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAdjustBalance(user)}>
                                Adjust Balance
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        {usersData && usersData.last_page > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              {/* Showing info */}
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                Showing <span className="font-medium text-black dark:text-white">{usersData.from}</span> to{' '}
                <span className="font-medium text-black dark:text-white">{usersData.to}</span> of{' '}
                <span className="font-medium text-black dark:text-white">{usersData.total}</span> users
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={usersData.current_page === 1}
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
                      variant={page === usersData.current_page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageClick(page)}
                      className={`h-8 min-w-[2rem] px-2 text-xs sm:text-sm ${
                        page === usersData.current_page 
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
                  disabled={usersData.current_page === usersData.last_page}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Balance Adjustment Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Adjust User Balance</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {selectedUser && `Update balance for ${selectedUser.username}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              {/* Current Balance */}
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Balance</p>
                <p className="text-2xl text-black dark:text-white">
                  ₦{parseFloat(selectedUser.balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* Transaction Type */}
              <div className="space-y-2">
                <Label className="text-black dark:text-white">Transaction Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={balanceType === 'credit' ? 'default' : 'outline'}
                    className={balanceType === 'credit' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setBalanceType('credit')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Credit
                  </Button>
                  <Button
                    type="button"
                    variant={balanceType === 'debit' ? 'default' : 'outline'}
                    className={balanceType === 'debit' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => setBalanceType('debit')}
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Debit
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-black dark:text-white">
                  Amount (₦)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Preview */}
              {balanceAmount && parseFloat(balanceAmount) > 0 && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Balance</p>
                  <p className="text-xl text-black dark:text-white">
                    ₦{(
                      balanceType === 'credit'
                        ? parseFloat(selectedUser.balance) + parseFloat(balanceAmount)
                        : parseFloat(selectedUser.balance) - parseFloat(balanceAmount)
                    ).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsBalanceDialogOpen(false)}
                  disabled={isUpdatingBalance}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${
                    balanceType === 'credit' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={handleUpdateBalance}
                  disabled={isUpdatingBalance || !balanceAmount || parseFloat(balanceAmount) <= 0}
                >
                  {isUpdatingBalance ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `${balanceType === 'credit' ? 'Credit' : 'Debit'} Account`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}