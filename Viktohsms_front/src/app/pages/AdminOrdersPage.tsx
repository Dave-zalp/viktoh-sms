import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Download, 
  Filter,
  Calendar,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
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
import { api, AdminOrder, formatApiError } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAdminOrders(currentPage, searchTerm || undefined);
      
      if (response.status) {
        setOrders(response.data.data);
        setTotalPages(response.data.last_page);
        setTotalOrders(response.data.total);
        setFrom(response.data.from);
        setTo(response.data.to);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error(formatApiError(error));
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

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'received':
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      case 'waiting':
      case 'active':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900">
            <Clock className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      case 'cancelled':
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getOrderStats = () => {
    const total = totalOrders;
    const received = orders.filter(o => o.status?.toLowerCase() === 'received' || o.status?.toLowerCase() === 'completed').length;
    const waiting = orders.filter(o => o.status?.toLowerCase() === 'waiting' || o.status?.toLowerCase() === 'active').length;
    const cancelled = orders.filter(o => o.status?.toLowerCase() === 'cancelled' || o.status?.toLowerCase() === 'canceled').length;

    return { total, received, waiting, cancelled };
  };

  const stats = getOrderStats();

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-black dark:text-white mb-2">Order Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage all number purchases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="border-2 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
            <p className="text-2xl text-black dark:text-white">{stats.total.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-6">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Waiting</p>
            <p className="text-2xl text-blue-700 dark:text-blue-300">{stats.waiting}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-6">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Received</p>
            <p className="text-2xl text-green-700 dark:text-green-300">{stats.received}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-6">
            <p className="text-sm text-red-600 dark:text-red-400 mb-1">Cancelled</p>
            <p className="text-2xl text-red-700 dark:text-red-300">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="border-2 border-gray-200 dark:border-gray-800 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by email, phone, service, country, status, provider..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-2 border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-black dark:text-white">
              All Orders ({totalOrders.toLocaleString()})
            </CardTitle>
            {totalOrders > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {from} to {to} of {totalOrders.toLocaleString()} orders
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No orders found matching your search' : 'No orders found'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>OTP</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-black dark:text-white">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs">
                              {order.user.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-900 dark:text-white">{order.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {order.phone_number}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          {order.service_code.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Globe className="w-4 h-4" />
                            {order.country_code}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          ₦{parseFloat(order.cost).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {order.otp_code ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900 font-mono">
                              {order.otp_code}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {order.provider}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}