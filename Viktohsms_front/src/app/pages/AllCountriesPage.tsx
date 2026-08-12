import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Check, ChevronsUpDown, Loader2, Globe, Search, RefreshCw, Wallet, AlertCircle } from 'lucide-react';
import { api, Country, Service } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { cn } from '../components/ui/utils';
import { Input } from '../components/ui/input';
import { formatNaira } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function AllCountriesPage() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingCountries, setIsFetchingCountries] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
    fetchUserBalance();
  }, []);

  const fetchCountries = async (forceRefresh: boolean = false) => {
    // Prevent redundant calls
    if (isFetchingCountries) return;
    
    try {
      setIsFetchingCountries(true);
      setIsLoadingCountries(true);
      if (forceRefresh) setIsRefreshing(true);
      const response = await api.getCountries(forceRefresh);
      setCountries(response.data.countries);
      if (forceRefresh) {
        toast.success('Countries refreshed successfully');
      }
    } catch (error) {
      toast.error('Failed to load countries');
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoadingCountries(false);
      setIsRefreshing(false);
      setIsFetchingCountries(false);
    }
  };

  // Fetch services when country is selected
  useEffect(() => {
    if (selectedCountry) {
      fetchServices();
    } else {
      setServices([]);
    }
  }, [selectedCountry]);

  const fetchServices = async (forceRefresh: boolean = false) => {
    if (!selectedCountry) return;
    
    // Prevent redundant calls
    if (isLoadingServices && !forceRefresh) return;

    try {
      setIsLoadingServices(true);
      if (forceRefresh) setIsRefreshing(true);
      const response = await api.getServicesByCountry(selectedCountry.id, forceRefresh);
      
      if (response.success && response.data?.services && Array.isArray(response.data.services)) {
        setServices(response.data.services);
        if (forceRefresh) {
          toast.success('Services refreshed successfully');
        }
      } else {
        console.warn('Invalid services response:', response);
        setServices([]);
      }
    } catch (error) {
      toast.error('Failed to load services for this country');
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
      setIsRefreshing(false);
    }
  };

  const handleCountrySelect = (countryId: number) => {
    const country = countries.find(c => c.id === countryId);
    if (country) {
      // Reset all related states when changing country
      setSelectedCountry(country);
      setSelectedService('');
      setServices([]);
      setPrice(null);
      setOriginalPrice(null);
      setPriceError(null);
      setOpen(false);
    }
  };

  const handleServiceSelect = (serviceCode: string) => {
    // Reset price states when changing service
    setSelectedService(serviceCode);
    setPrice(null);
    setOriginalPrice(null);
    setPriceError(null);
    setServiceOpen(false);
  };

  // Fetch price when both country and service are selected
  useEffect(() => {
    if (selectedCountry && selectedService) {
      fetchPrice();
    } else {
      setPrice(null);
      setOriginalPrice(null);
      setPriceError(null);
    }
  }, [selectedCountry, selectedService]);

  const fetchPrice = async (isManualRetry: boolean = false) => {
    if (!selectedCountry || !selectedService) return;

    try {
      setIsLoadingPrice(true);
      setPriceError(null);
      
      const response = await api.getServicePrice(selectedService, selectedCountry.id);
      
      if (response.success && response.data) {
        const countryData = response.data[selectedCountry.id.toString()];
        if (countryData && countryData[selectedService]) {
          // Cost is already in Naira (e.g., 6750 = ₦6,750)
          const costInNaira = countryData[selectedService].cost;
          const originalCostValue = parseFloat(countryData[selectedService].original_cost);
          
          setPrice(costInNaira);
          setOriginalPrice(originalCostValue);
          
          if (isManualRetry) {
            toast.success('Price loaded successfully');
          }
        } else {
          throw new Error('Price data not found in response');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error fetching price:', error);
      
      const errorMessage = 'No price was found for this item';
      setPriceError(errorMessage);
      setPrice(null);
      setOriginalPrice(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleBuyNumber = async () => {
    if (!selectedCountry || !selectedService || isPurchasing) {
      return;
    }

    // Check if price is available
    if (price === null) {
      toast.error('Please wait for the price to load');
      return;
    }

    // Check balance before making the purchase
    if (price > userBalance) {
      toast.error(
        `Insufficient balance. Required: ${formatNaira(price)}, Available: ${formatNaira(userBalance)}`,
        { duration: 6000 }
      );
      
      // Navigate to fund wallet page
      setTimeout(() => {
        const shouldFund = confirm('Would you like to fund your wallet now?');
        if (shouldFund) {
          navigate('/dashboard/fund-wallet');
        }
      }, 1500);
      return;
    }
    
    try {
      setIsPurchasing(true);
      
      // Call the purchase API
      const response = await api.purchaseNumber(selectedService, selectedCountry.id);
      
      if (response.success) {
        const { purchased_number, balance } = response.data;
        
        // Update the user balance immediately
        setUserBalance(balance.current);
        
        // Show success message with details
        toast.success(
          `Number purchased successfully! Phone: ${purchased_number.phone_number}`,
          { duration: 5000 }
        );
        
        // Navigate to number history or number details page
        navigate('/dashboard/numbers-history', {
          state: {
            newPurchase: purchased_number,
            balanceUpdate: balance
          }
        });
      }
    } catch (error: any) {
      console.error('Error purchasing number:', error);
      
      // Handle different error types
      if (error.message === 'Insufficient balance') {
        const required = error.required || 0;
        const available = error.available || 0;
        toast.error(
          `Insufficient balance. Required: ${formatNaira(required)}, Available: ${formatNaira(available)}`,
          { duration: 6000 }
        );
        
        // Optionally navigate to fund wallet page
        setTimeout(() => {
          const shouldFund = confirm('Would you like to fund your wallet now?');
          if (shouldFund) {
            navigate('/dashboard/fund-wallet');
          }
        }, 1500);
      } else if (error.errors) {
        // Validation errors
        const firstErrorKey = Object.keys(error.errors)[0];
        const firstError = error.errors[firstErrorKey][0];
        toast.error(firstError || 'Validation failed');
      } else if (error.error) {
        // API-specific errors
        const errorMessages: Record<string, string> = {
          'NO_NUMBERS': 'No numbers available for this service right now. Please try again later.',
          'BAD_SERVICE': 'This service is currently unavailable. Please try another service.',
          'NO_BALANCE': 'Insufficient balance. Please fund your wallet.',
          'TIMEOUT': 'Request timeout. Please check your connection and try again.',
        };
        
        const message = errorMessages[error.error] || `Purchase failed: ${error.error}`;
        toast.error(message, { duration: 5000 });
      } else {
        // Generic error
        toast.error(error.message || 'Failed to purchase number. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.getBalance();
      setUserBalance(response.data.wallet_balance);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#8B00FF] via-[#A020F0] to-[#8B00FF] dark:from-[#6B00CC] dark:via-[#8010D0] dark:to-[#6B00CC] shadow-xl shadow-purple-500/20 dark:shadow-purple-900/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl text-white mb-2">All Countries</h1>
              <p className="text-sm sm:text-base text-purple-100 dark:text-purple-200">
                Select a country and service to get your temporary phone number
              </p>
            </div>
            <Button
              onClick={() => {
                fetchCountries(true);
                if (selectedCountry) {
                  fetchServices(true);
                }
              }}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white dark:bg-white/5 dark:hover:bg-white/10 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Step 1: Country Selection */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] shadow-xl dark:shadow-gray-900/50 bg-white dark:bg-[#0A0612]">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#8B00FF] to-[#A020F0] dark:from-[#6B00CC] dark:to-[#8010D0] rounded-full flex items-center justify-center text-white font-semibold">
                      1
                    </div>
                    <h2 className="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Select Country</h2>
                  </div>

                  {/* Searchable Country Dropdown */}
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full h-12 justify-between border-2 border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] text-gray-900 dark:text-white hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] transition-colors"
                        disabled={isLoadingCountries}
                      >
                        {isLoadingCountries ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading countries...
                          </span>
                        ) : selectedCountry ? (
                          selectedCountry.name
                        ) : (
                          "Search and select a country..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 dark:bg-[#120D1E] dark:border-[#2E2050]" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <Command className="dark:bg-[#120D1E]">
                        <CommandInput placeholder="Search country..." className="dark:text-white dark:placeholder:text-gray-400 border-purple-200/50 dark:border-[#2E2050]" />
                        <CommandEmpty className="dark:text-gray-400 py-6 text-center">No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {countries.map((country) => (
                            <CommandItem
                              key={country.id}
                              value={country.name}
                              onSelect={() => handleCountrySelect(country.id)}
                              className="dark:text-gray-300 dark:hover:bg-[#2E2050] hover:bg-purple-50"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-[#8B00FF] dark:text-[#BF5FFF]",
                                  selectedCountry?.id === country.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Selected Country Display */}
                {selectedCountry && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Country</p>
                        <p className="text-lg text-gray-900 dark:text-white">{selectedCountry.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Service Selection */}
          <div className="lg:col-span-1">
            <Card className={cn(
              "border-2 shadow-xl dark:shadow-gray-900/50 sticky top-6",
              selectedCountry 
                ? 'border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#0A0612]' 
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#120D1E]'
            )}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold",
                    selectedCountry 
                      ? 'bg-gradient-to-br from-[#8B00FF] to-[#A020F0] dark:from-[#6B00CC] dark:to-[#8010D0]' 
                      : 'bg-gray-400 dark:bg-gray-600'
                  )}>
                    2
                  </div>
                  <h2 className="text-lg sm:text-xl text-gray-900 dark:text-white font-semibold">Select Service</h2>
                </div>

                {!selectedCountry ? (
                  <div className="py-12 text-center">
                    <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please select a country first
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Selected Country Display */}
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected Country</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base text-gray-900 dark:text-white">{selectedCountry.name}</span>
                      </div>
                    </div>

                    {/* Service Searchable Dropdown */}
                    <div className="space-y-3">
                      <Label htmlFor="service" className="text-gray-700 dark:text-gray-300">
                        Choose Service
                        {isLoadingServices && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Loading...)</span>
                        )}
                      </Label>

                      {/* Searchable Service Dropdown */}
                      <Popover open={serviceOpen} onOpenChange={setServiceOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={serviceOpen}
                            className="w-full h-12 justify-between border-2 border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] text-gray-900 dark:text-white hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] transition-colors"
                            disabled={isLoadingServices || services.length === 0}
                          >
                            {isLoadingServices ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading services...
                              </span>
                            ) : selectedService ? (
                              <span className="flex items-center justify-between w-full">
                                <span>{services.find(s => s.code === selectedService)?.name || selectedService}</span>
                                {services.find(s => s.code === selectedService)?.available_count !== undefined && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {services.find(s => s.code === selectedService)?.available_count?.toLocaleString()} available
                                  </span>
                                )}
                              </span>
                            ) : services.length === 0 ? (
                              "No services available"
                            ) : (
                              "Search services..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 dark:bg-[#120D1E] dark:border-[#2E2050]" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                          <Command className="dark:bg-[#120D1E]">
                            <CommandInput placeholder="Search services..." className="dark:text-white dark:placeholder:text-gray-400" />
                            <CommandEmpty className="dark:text-gray-400 py-6 text-center">No service found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {services.map((service) => (
                                <CommandItem
                                  key={service.code}
                                  value={`${service.name} ${service.code}`}
                                  onSelect={() => handleServiceSelect(service.code)}
                                  className="dark:text-gray-300 dark:hover:bg-[#2E2050] hover:bg-purple-50"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 shrink-0 text-[#8B00FF] dark:text-[#BF5FFF]",
                                      selectedService === service.code ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex items-center justify-between w-full gap-4">
                                    <span>{service.name}</span>
                                    {service.available_count !== undefined && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {service.available_count.toLocaleString()} available
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {!isLoadingServices && services.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {services.length} service{services.length !== 1 ? 's' : ''} available
                        </p>
                      )}
                    </div>

                    {/* Price Display */}
                    {selectedService && (
                      <div>
                        {isLoadingPrice ? (
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-[#2E2050]">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-[#8B00FF] dark:text-[#BF5FFF]" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Loading price...</span>
                            </div>
                          </div>
                        ) : priceError ? (
                          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-red-900 dark:text-red-300 mb-2">{priceError}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchPrice(true)}
                                  className="h-8 border-red-600 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300"
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Retry
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : price !== null ? (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Price</span>
                              </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] dark:from-[#BF5FFF] dark:to-[#D896FF] bg-clip-text text-transparent">
                                {formatNaira(price)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Per number purchase</p>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Buy Button */}
                    <Button
                      onClick={handleBuyNumber}
                      disabled={!selectedService || isLoadingServices || isLoadingPrice || !!priceError || isPurchasing}
                      className="w-full h-12 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7A00E6] hover:to-[#9010E0] text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {price !== null && !isLoadingPrice && !priceError ? `Buy Number - ${formatNaira(price)}` : 'Buy Number'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}