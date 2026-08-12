import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Loader2, Wallet, AlertCircle, TrendingUp, Zap, ArrowLeft, ChevronDown, DollarSign, Clock, Shield, CheckCircle } from 'lucide-react';
import { api, Country, Service } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ServiceCombobox from '../components/ServiceCombobox';

export default function USANumbersPage() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  const USA_COUNTRY_ID = 187;
  const CANADA_COUNTRY_ID = 36;

  // Helper function to get the correct country ID based on selected service
  const getActiveCountryId = () => {
    // If WhatsApp is selected, use Canada (36), otherwise use USA (187)
    if (selectedService?.code?.toLowerCase() === 'wa') {
      return CANADA_COUNTRY_ID;
    }
    return USA_COUNTRY_ID;
  };

  useEffect(() => {
    fetchCountryAndServices();
    fetchUserBalance();
  }, []);

  useEffect(() => {
    if (selectedService && selectedCountry) {
      fetchPrice();
    } else {
      setPrice(null);
      setPriceError(null);
    }
  }, [selectedService, selectedCountry]);

  const fetchCountryAndServices = async () => {
    try {
      setIsLoadingServices(true);

      const response = await api.getCountries();
      const allCountries = response.data.countries;
      const usaCountry = allCountries.find(c => c.id === USA_COUNTRY_ID);

      if (usaCountry) {
        const displayCountry: Country = {
          id: USA_COUNTRY_ID,
          name: 'United States',
          retry_available: usaCountry.retry_available,
          rent_available: usaCountry.rent_available,
          multi_service_available: usaCountry.multi_service_available
        };
        setSelectedCountry(displayCountry);
        await fetchServices(displayCountry.id);
      } else {
        toast.error('Service temporarily unavailable');
      }
    } catch (error) {
      toast.error('Failed to load services');
      console.error('Error:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchServices = async (countryId: number) => {
    try {
      const response = await api.getServicesByCountry(countryId);
      
      if (response.success && response.data?.services && Array.isArray(response.data.services)) {
        setServices(response.data.services);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchPrice = async () => {
    if (!selectedCountry || !selectedService) return;

    try {
      setIsLoadingPrice(true);
      setPriceError(null);
      
      // Use the correct country ID based on service
      const targetCountryId = getActiveCountryId();
      
      const response = await api.getServicePrice(selectedService.code, targetCountryId);
      
      if (response.success && response.data) {
        const countryData = response.data[targetCountryId.toString()];
        if (countryData && countryData[selectedService.code]) {
          const costInNaira = countryData[selectedService.code].cost;
          setPrice(costInNaira);
        } else {
          throw new Error('Price not found');
        }
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('Error fetching price:', error);
      setPriceError('Price unavailable');
      setPrice(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleBuyNumber = async () => {
    if (!selectedCountry || !selectedService || isPurchasing || !price) {
      return;
    }

    if (price > userBalance) {
      toast.error(
        `Insufficient balance. Required: ${formatNaira(price)}, Available: ${formatNaira(userBalance)}`,
        { duration: 6000 }
      );
      
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
      
      // Use the correct country ID based on service
      const targetCountryId = getActiveCountryId();
      
      const response = await api.purchaseNumber(selectedService.code, targetCountryId);
      
      if (response.success) {
        const { purchased_number, balance } = response.data;
        setUserBalance(balance.current);
        
        toast.success(
          `Number purchased successfully! Phone: ${purchased_number.phone_number}`,
          { duration: 5000 }
        );
        
        navigate('/dashboard/numbers-history', {
          state: {
            newPurchase: purchased_number,
            balanceUpdate: balance
          }
        });
      }
    } catch (error: any) {
      console.error('Error purchasing number:', error);
      
      if (error.message === 'Insufficient balance') {
        toast.error('Insufficient balance. Please fund your wallet.');
        setTimeout(() => {
          const shouldFund = confirm('Would you like to fund your wallet now?');
          if (shouldFund) {
            navigate('/dashboard/fund-wallet');
          }
        }, 1500);
      } else if (error.error) {
        const errorMessages: Record<string, string> = {
          'NO_NUMBERS': 'No numbers available for this service right now. Please try again later.',
          'BAD_SERVICE': 'This service is currently unavailable. Please try another service.',
          'NO_BALANCE': 'Insufficient balance. Please fund your wallet.',
          'TIMEOUT': 'Request timeout. Please check your connection and try again.',
        };
        
        const message = errorMessages[error.error] || `Purchase failed: ${error.error}`;
        toast.error(message, { duration: 5000 });
      } else {
        toast.error(error.message || 'Failed to purchase number. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const response = await api.getBalance();
      setUserBalance(response.data.wallet_balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleServiceChange = (serviceCode: string) => {
    const service = services.find(s => s.code === serviceCode);
    if (service) {
      setSelectedService(service);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0614] pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-[#1C1530] border-b border-gray-200 dark:border-[#2E2050] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">USA Numbers 🇺🇸</h1>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] rounded-lg">
              <Wallet className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">{formatNaira(userBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Selection Area */}
          <div className="lg:col-span-3 space-y-5">
            {/* Service Selection Card */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] shadow-sm">
              <CardHeader className="border-b border-gray-200 dark:border-[#2E2050] pb-4">
                <CardTitle className="text-base">Select Service</CardTitle>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Choose the platform you need a verification number for
                </p>
              </CardHeader>
              <CardContent className="p-5">
                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-[#8B00FF] dark:text-[#BF5FFF] animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ServiceCombobox
                      services={services}
                      selectedService={selectedService}
                      onSelectService={setSelectedService}
                      disabled={services.length === 0}
                    />

                    {services.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {services.length} services available
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Service Details */}
            {selectedService && (
              <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Selected Service
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {selectedService.name}
                      </h3>
                      {selectedService.available_count !== undefined && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          {selectedService.available_count.toLocaleString()} numbers available
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      {isLoadingPrice ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#8B00FF]" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                        </div>
                      ) : priceError ? (
                        <p className="text-sm text-red-600 dark:text-red-400">{priceError}</p>
                      ) : price !== null ? (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] bg-clip-text text-transparent">
                            {formatNaira(price)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Button */}
            {selectedService && (
              <Button
                onClick={handleBuyNumber}
                disabled={!price || isLoadingPrice || !!priceError || isPurchasing}
                className="w-full h-12 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7500DC] hover:to-[#8B00FF] text-white shadow-lg disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Purchase...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Number Now
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* How It Works */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { 
                    icon: <ChevronDown className="w-4 h-4" />, 
                    title: 'Select Service', 
                    desc: 'Choose your platform from the dropdown' 
                  },
                  { 
                    icon: <DollarSign className="w-4 h-4" />, 
                    title: 'Check Price', 
                    desc: 'View the cost and confirm balance' 
                  },
                  { 
                    icon: <ShoppingCart className="w-4 h-4" />, 
                    title: 'Buy Number', 
                    desc: 'Get your USA number instantly' 
                  },
                  { 
                    icon: <Clock className="w-4 h-4" />, 
                    title: 'Receive SMS', 
                    desc: 'OTP arrives in 1-2 minutes' 
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#120D1E] rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#8B00FF] to-[#A020F0] rounded-lg flex items-center justify-center text-white">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-green-900 dark:text-green-200">Why Choose Us?</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-green-800 dark:text-green-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Instant delivery of phone numbers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Real USA phone numbers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Fast SMS code delivery (1-2 min)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Pay-as-you-go pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>24/7 automated service</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1.5 text-xs text-orange-800 dark:text-orange-300">
                    <p className="font-semibold text-sm text-orange-900 dark:text-orange-200">Important</p>
                    <ul className="space-y-1">
                      <li>• One number per service order</li>
                      <li>• Valid for single SMS verification</li>
                      <li>• Check Numbers History for codes</li>
                      <li>• No refunds after purchase</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}