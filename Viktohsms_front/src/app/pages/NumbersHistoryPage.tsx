import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCcw,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Ban,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';
import logoImage from 'figma:asset/71148f68085c2a8ea4e6f082d8049053ae46887c.png';

interface NumberHistory {
  id: number;
  phone_number: string;
  country_code: string;
  status: string;
  cost: string;
  created_at: string;
  otp_code?: string;
  sms_text?: string;
  code_received_at?: string;
  provider?: string;
  service?: {
    name: string;
  };
  daisy_service_name?: string;
}

export default function NumbersHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [numberHistory, setNumberHistory] = useState<NumberHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());
  const [pollingIds, setPollingIds] = useState<Set<number>>(new Set()); // Track which numbers are being polled
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchNumberHistory();
  }, []);

  // Polling effect - polls every 3 seconds for waiting numbers
  useEffect(() => {
    const waitingNumbers = numberHistory.filter(
      item => item.status.toLowerCase() === 'waiting' || item.status.toLowerCase() === 'pending'
    );

    // Start polling for waiting numbers
    if (waitingNumbers.length > 0) {
      const intervalId = setInterval(() => {
        waitingNumbers.forEach(number => {
          pollNumberStatus(number.id);
        });
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(intervalId);
    }
  }, [numberHistory]);

  const fetchNumberHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getNumberHistory();
      
      if (response.success) {
        setNumberHistory(response.data.numbers);
      }
    } catch (error: any) {
      console.error('Error fetching number history:', error);
      const errorMessage = error.message || 'Failed to load number history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get the display name for a service
  const getServiceDisplayName = (item: NumberHistory): string => {
    return item.daisy_service_name || item.service?.name || 'Unknown';
  };

  const pollNumberStatus = async (id: number) => {
    if (pollingIds.has(id)) return;
    
    setPollingIds(prev => new Set([...prev, id]));

    try {
      // Find the number to determine the provider
      const number = numberHistory.find(item => item.id === id);
      if (!number) return;

      // Use different API endpoint based on provider
      const response = number.provider === 'daisysms' 
        ? await api.getDaisySMSCode(id)
        : await api.getNumberStatus(id);
      
      if (response.success) {
        const { status, otp_code, sms_text, received_at } = response.data;
        
        // Show toast notification when OTP is received
        if (status.toLowerCase() === 'received' && otp_code) {
          toast.success(`OTP received for number! Code: ${otp_code}`, {
            duration: 10000 // Show for 10 seconds
          });
        }
        
        // Update the number in the list
        setNumberHistory(prev => 
          prev.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  status,
                  otp_code: otp_code || item.otp_code,
                  sms_text: sms_text || item.sms_text,
                  code_received_at: received_at || item.code_received_at
                } 
              : item
          )
        );
      } else {
        // Handle error responses
        const errorResponse = response as any;
        
        if (errorResponse.status === 'expired') {
          // Update status to expired
          setNumberHistory(prev => 
            prev.map(item => 
              item.id === id 
                ? { ...item, status: 'expired' } 
                : item
            )
          );
          toast.error(errorResponse.message || 'Activation expired');
        } else if (errorResponse.status === 'cancelled') {
          // Update status to cancelled
          setNumberHistory(prev => 
            prev.map(item => 
              item.id === id 
                ? { ...item, status: 'cancelled' } 
                : item
            )
          );
          toast.error('Activation cancelled by provider');
        }
      }
    } catch (error: any) {
      // Silently handle polling errors to avoid spamming the user
      console.error(`Error polling status for number ${id}:`, error);
    } finally {
      setPollingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const filteredHistory = numberHistory.filter(item =>
    getServiceDisplayName(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone_number.includes(searchQuery) ||
    item.country_code.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'completed' || normalizedStatus === 'success') {
      return (
        <Badge className="bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (normalizedStatus === 'received') {
      return (
        <Badge className="bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/20">
          <MessageSquare className="w-3 h-3 mr-1" />
          Received
        </Badge>
      );
    } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') {
      return (
        <Badge className="bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/20">
          <XCircle className="w-3 h-3 mr-1" />
          {normalizedStatus === 'cancelled' ? 'Cancelled' : 'Failed'}
        </Badge>
      );
    } else if (normalizedStatus === 'expired' || normalizedStatus === 'timeout') {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/20">
          <Clock className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    } else if (normalizedStatus === 'pending' || normalizedStatus === 'waiting') {
      return (
        <Badge className="bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/20">
          <Clock className="w-3 h-3 mr-1 animate-pulse" />
          Waiting
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-950/20">
          {status}
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

  const cancelActivation = async (id: number) => {
    if (cancellingIds.has(id)) return;
    
    setCancellingIds(prev => new Set([...prev, id]));

    try {
      // Find the number to determine the provider
      const number = numberHistory.find(item => item.id === id);
      if (!number) {
        toast.error('Number not found.');
        return;
      }

      // Use different API endpoint based on provider
      let response;
      if (number.provider === 'daisysms') {
        response = await api.cancelDaisySMSActivation(id);
      } else {
        response = await api.cancelActivation(id);
      }
      
      if (response.success) {
        const { refunded_amount, current_balance } = response.data;
        
        // Show success message with refund details
        toast.success(
          `Activation cancelled successfully! Refunded: ${formatNaira(refunded_amount)}. New balance: ${formatNaira(current_balance)}`,
          { duration: 5000 }
        );
        
        // Update the number status in the list
        setNumberHistory(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, status: 'cancelled' } 
              : item
          )
        );
        
        // Optionally refresh the entire list to get updated data
        await fetchNumberHistory();
      }
    } catch (error: any) {
      console.error('Error cancelling activation:', error);
      
      // Handle different error responses
      if (error.message === 'Number not found') {
        toast.error('Number not found. It may have already been cancelled.');
      } else if (error.message === 'Can only cancel waiting activations') {
        toast.error('This activation cannot be cancelled. Only waiting activations can be cancelled.');
      } else if (error.message === 'Failed to cancel activation') {
        const apiError = error.error || 'Unknown error';
        toast.error(`Failed to cancel activation: ${apiError}`, { duration: 5000 });
      } else {
        toast.error(error.message || 'Failed to cancel activation. Please try again.');
      }
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const completeActivation = async (id: number) => {
    if (completingIds.has(id)) return;
    
    setCompletingIds(prev => new Set([...prev, id]));

    try {
      // Find the number to determine the provider
      const number = numberHistory.find(item => item.id === id);
      if (!number) {
        toast.error('Number not found.');
        return;
      }

      // Use different API endpoint based on provider
      let response;
      if (number.provider === 'daisysms') {
        response = await api.markDaisySMSDone(id);
      } else {
        response = await api.completeActivation(id);
      }
      
      if (response.success) {
        // Show success message
        toast.success(
          response.message || 'Activation marked as completed successfully!',
          { duration: 5000 }
        );
        
        // Update the number status in the list
        setNumberHistory(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, status: 'completed' } 
              : item
          )
        );
        
        // Optionally refresh the entire list to get updated data
        await fetchNumberHistory();
      }
    } catch (error: any) {
      console.error('Error completing activation:', error);
      
      // Handle different error responses
      if (error.message === 'Number not found') {
        toast.error('Number not found.');
      } else if (error.message && error.message.includes('OTP')) {
        toast.error('Cannot complete activation without receiving OTP first.');
      } else {
        toast.error(error.message || 'Failed to complete activation. Please try again.');
      }
    } finally {
      setCompletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(text);
      toast.success('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy text.');
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#8B00FF] via-[#A020F0] to-[#8B00FF] dark:from-[#6B00CC] dark:via-[#8010D0] dark:to-[#6B00CC] shadow-xl shadow-purple-500/20 dark:shadow-purple-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Logo on mobile/tablet, hidden on desktop */}
            <img 
              src={logoImage} 
              alt="Viktohs SMS" 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:hidden rounded-lg flex-shrink-0"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl text-white mb-2 font-bold">Numbers History</h1>
              <p className="text-sm sm:text-base text-purple-100 dark:text-purple-200">
                View all your past number purchases and verification codes
              </p>
            </div>
          </div>
          <Button
            onClick={fetchNumberHistory}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 dark:bg-white/10 dark:hover:bg-white/20 w-full sm:w-auto"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6 border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#0A0612] shadow-lg dark:shadow-gray-900/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by phone number or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-12 border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] text-sm sm:text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Numbers List */}
      <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#0A0612] shadow-lg dark:shadow-gray-900/50">
        <CardHeader className="border-b border-purple-200/50 dark:border-[#2E2050] bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent p-4 sm:p-6">
          <CardTitle className="text-gray-900 dark:text-white text-lg sm:text-xl font-semibold">
            Purchase History {numberHistory.length > 0 && `(${numberHistory.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-[#8B00FF] dark:text-[#BF5FFF] animate-spin mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Loading number history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <AlertCircle className="w-12 h-12 text-red-400 dark:text-red-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{error}</p>
              <Button 
                onClick={fetchNumberHistory}
                className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7A00E6] hover:to-[#9010E0] text-white"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : numberHistory.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Phone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No number history yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Your number purchases will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Service</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Number</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Country</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">SMS Received</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Code</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Amount</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredHistory.map((item) => {
                      const { date, time } = formatDate(item.created_at);
                      const smsCount = item.otp_code ? 1 : 0;
                      const amount = parseFloat(item.cost);
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-gray-900 dark:text-white">{getServiceDisplayName(item)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-300">{item.phone_number}</span>
                              <button
                                onClick={() => {
                                  copyToClipboard(item.phone_number);
                                  setCopiedField(`phone-${item.id}`);
                                  setTimeout(() => setCopiedField(null), 2000);
                                }}
                                className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                                title="Copy phone number"
                              >
                                {copiedField === `phone-${item.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.country_code}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                              <MessageSquare className="w-4 h-4" />
                              <span>{smsCount}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            <div>{date}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-6 py-4">
                            {item.otp_code ? (
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400">
                                  {item.otp_code}
                                </code>
                                <button
                                  onClick={() => {
                                    copyToClipboard(item.otp_code!);
                                    setCopiedField(`otp-${item.id}`);
                                    setTimeout(() => setCopiedField(null), 2000);
                                  }}
                                  className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                                  title="Copy OTP code"
                                >
                                  {copiedField === `otp-${item.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {formatNaira(amount)}
                          </td>
                          <td className="px-6 py-4">
                            {item.status.toLowerCase() === 'waiting' && (
                              <Button
                                onClick={() => cancelActivation(item.id)}
                                variant="outline"
                                size="sm"
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 hover:border-red-400 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 dark:border-red-800 dark:hover:border-red-700"
                                disabled={cancellingIds.has(item.id)}
                              >
                                {cancellingIds.has(item.id) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4 mr-2" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            )}
                            {item.status.toLowerCase() === 'received' && (
                              <Button
                                onClick={() => completeActivation(item.id)}
                                variant="outline"
                                size="sm"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 hover:border-green-400 dark:bg-green-950/30 dark:hover:bg-green-950/50 dark:text-green-400 dark:border-green-800 dark:hover:border-green-700"
                                disabled={completingIds.has(item.id)}
                              >
                                {completingIds.has(item.id) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Completing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Complete
                                  </>
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHistory.map((item) => {
                  const { date, time } = formatDate(item.created_at);
                  const smsCount = item.otp_code ? 1 : 0;
                  const amount = parseFloat(item.cost);
                  
                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Service & Status Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white">{getServiceDisplayName(item)}</span>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>

                      {/* Phone Number */}
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Number: </span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">{item.phone_number}</span>
                        </div>
                        <button
                          onClick={() => {
                            copyToClipboard(item.phone_number);
                            setCopiedField(`phone-${item.id}`);
                            setTimeout(() => setCopiedField(null), 2000);
                          }}
                          className="flex-shrink-0 p-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 shadow-sm"
                          title="Copy phone number"
                        >
                          {copiedField === `phone-${item.id}` ? (
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Country Code */}
                      <div className="mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Country: </span>
                        <span className="text-sm text-gray-900 dark:text-white">{item.country_code}</span>
                      </div>

                      {/* SMS Count & Date */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{smsCount} SMS</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <span>{date}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">{time}</span>
                        </div>
                      </div>

                      {/* OTP Code */}
                      {item.otp_code && (
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Code: </span>
                            <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 text-sm">
                              {item.otp_code}
                            </code>
                          </div>
                          <button
                            onClick={() => {
                              copyToClipboard(item.otp_code!);
                              setCopiedField(`otp-${item.id}`);
                              setTimeout(() => setCopiedField(null), 2000);
                            }}
                            className="flex-shrink-0 p-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 shadow-sm"
                            title="Copy OTP code"
                          >
                            {copiedField === `otp-${item.id}` ? (
                              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Amount & Action Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNaira(amount)}
                        </div>
                        {item.status.toLowerCase() === 'waiting' && (
                          <Button
                            onClick={() => cancelActivation(item.id)}
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 hover:border-red-400 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 dark:border-red-800 dark:hover:border-red-700"
                            disabled={cancellingIds.has(item.id)}
                          >
                            {cancellingIds.has(item.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Cancel
                              </>
                            )}
                          </Button>
                        )}
                        {item.status.toLowerCase() === 'received' && (
                          <Button
                            onClick={() => completeActivation(item.id)}
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 hover:border-green-400 dark:bg-green-950/30 dark:hover:bg-green-950/50 dark:text-green-400 dark:border-green-800 dark:hover:border-green-700"
                            disabled={completingIds.has(item.id)}
                          >
                            {completingIds.has(item.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Complete
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredHistory.length === 0 && searchQuery && (
                <div className="text-center py-12 px-4">
                  <Phone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No numbers found matching your search.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}