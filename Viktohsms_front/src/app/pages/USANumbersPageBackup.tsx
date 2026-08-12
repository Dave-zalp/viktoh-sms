import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Loader2, RefreshCw, Check, ChevronsUpDown, ShoppingCart, AlertCircle } from 'lucide-react';
import { api, DaisySMSService, DaisySMSRentError } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../components/ui/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Label } from '../components/ui/label';

export default function USANumbersPageBackup() {
  const navigate = useNavigate();
  const [services, setServices] = useState<DaisySMSService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<DaisySMSService | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchUserBalance();
  }, []);

  const fetchServices = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      setIsLoading(true);
      
      const response = await api.getDaisySMSServices(forceRefresh);
      
      if (response.success) {
        setServices(response.data);
        
        if (forceRefresh) {
          toast.success('Services refreshed successfully');
        }
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error(error.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.getBalance();
      if (response.success) {
        setUserBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      console.error('Error fetching user balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleRefresh = () => {
    fetchServices(true);
  };

  const handleBuyNumber = async () => {
    if (!selectedService) return;

    // Check if user has sufficient balance
    if (userBalance < selectedService.final_cost) {
      toast.error(
        `Insufficient balance! You need ${formatNaira(selectedService.final_cost)} but only have ${formatNaira(userBalance)}. Please fund your wallet.`,
        { duration: 5000 }
      );
      return;
    }

    try {
      setIsPurchasing(true);
      
      const response = await api.rentDaisySMSNumber(selectedService.service_code);
      
      if (response.success) {
        toast.success(`Number purchased successfully! ${response.data.phone_number}`);
        
        // Refresh balance after purchase
        await fetchUserBalance();
        
        // Navigate to numbers history page after a short delay
        setTimeout(() => {
          navigate('/dashboard/numbers-history');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error purchasing number:', error);
      
      const rentError = error as DaisySMSRentError;
      
      // Handle insufficient balance error
      if (rentError.required && rentError.available !== undefined) {
        toast.error(
          `Insufficient balance! Required: ${formatNaira(rentError.required)}, Available: ${formatNaira(rentError.available)}`,
          { duration: 5000 }
        );
      } else {
        toast.error(rentError.message || 'Failed to purchase number. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-gray-900 dark:text-white">
            United States <span className="text-sm">🇺🇸</span>
          </h1>
          <div className="flex items-center gap-3">
            {/* Balance Display */}
            {!isLoadingBalance && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-xs text-gray-600 dark:text-gray-400">Balance:</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatNaira(userBalance)}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a service to purchase a US phone number
        </p>
        
        {/* Mobile Balance Display */}
        {!isLoadingBalance && (
          <div className="sm:hidden flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mt-3">
            <span className="text-xs text-gray-600 dark:text-gray-400">Your Balance:</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatNaira(userBalance)}</span>
          </div>
        )}
      </div>

      {/* Services Card */}
      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-5">
          <CardTitle className="text-gray-900 dark:text-white">Select Service</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading services...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Service Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="service-select" className="text-sm text-gray-700 dark:text-gray-300">
                  Choose a service
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-auto py-3 px-3 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                      disabled={services.length === 0}
                    >
                      {selectedService ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1 sm:gap-4 text-left">
                          <span className="text-gray-900 dark:text-white truncate">{selectedService.service_name}</span>
                          <span className="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-medium whitespace-nowrap">{formatNaira(selectedService.final_cost)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Select service...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[95vw] sm:w-[600px] p-0 bg-white dark:bg-gray-900 dark:border-gray-700" 
                    align="start" 
                    side="bottom"
                    sideOffset={5}
                    avoidCollisions={false}
                  >
                    <Command className="bg-white dark:bg-gray-900">
                      <CommandInput 
                        placeholder="Search services..." 
                        className="h-10 border-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm sticky top-0 bg-white dark:bg-gray-900 z-10" 
                      />
                      <CommandEmpty className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">No service found.</CommandEmpty>
                      <CommandGroup className="max-h-[40vh] sm:max-h-[300px] overflow-auto p-1">
                        {services.map((service) => (
                          <CommandItem
                            key={service.service_code}
                            value={`${service.service_name} ${service.service_code}`}
                            onSelect={() => {
                              setSelectedService(service);
                              setOpen(false);
                            }}
                            className="flex items-center justify-between cursor-pointer px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 aria-selected:bg-blue-50 dark:aria-selected:bg-blue-950/30"
                          >
                            <span className="text-gray-900 dark:text-white text-sm flex-1 pr-4">{service.service_name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">{formatNaira(service.final_cost)}</span>
                              <Check
                                className={cn(
                                  "h-4 w-4 text-blue-600 dark:text-blue-400",
                                  selectedService?.service_code === service.service_code
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Buy Button - Only shows when service is selected */}
              {selectedService && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  {/* Insufficient Balance Warning */}
                  {userBalance < selectedService.final_cost && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          Insufficient balance! You need <span className="font-semibold">{formatNaira(selectedService.final_cost)}</span> but only have <span className="font-semibold">{formatNaira(userBalance)}</span>.
                        </p>
                        <button
                          onClick={() => navigate('/dashboard/fund-wallet')}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline mt-1"
                        >
                          Fund your wallet now
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleBuyNumber}
                    disabled={isPurchasing || userBalance < selectedService.final_cost}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Number for {formatNaira(selectedService.final_cost)}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Service Info */}
              {services.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {services.length} services available
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}