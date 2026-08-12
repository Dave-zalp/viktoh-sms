import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Phone,
  Globe,
  CheckCircle2,
  XCircle,
  Copy,
  Loader2,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ShoppingCart,
  MessageSquare,
  Timer,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  api,
  GrizzlyCountry,
  GrizzlyService,
  GrizzlyPurchasedNumber,
} from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../components/ui/utils';

// ─── Countdown hook ────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return {
    secondsLeft,
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
    isExpiring: secondsLeft > 0 && secondsLeft <= 120,
    isExpired: secondsLeft === 0 && !!expiresAt,
  };
}

// ─── Active-number state ───────────────────────────────────────────────────

interface ActiveNumber extends GrizzlyPurchasedNumber {
  otp_code?: string;
  sms_text?: string;
}

// ─── Step type ─────────────────────────────────────────────────────────────

type Step = 'select' | 'active';

export default function GrizzlySMSBuyNumbersPage() {
  const navigate = useNavigate();
  const { updateBalance } = useAuth();

  // ── Selection state ──────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('select');

  const [countries, setCountries] = useState<GrizzlyCountry[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<GrizzlyCountry[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<GrizzlyCountry | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const [services, setServices] = useState<GrizzlyService[]>([]);
  const [filteredServices, setFilteredServices] = useState<GrizzlyService[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<GrizzlyService | null>(null);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [price, setPrice] = useState<number | null>(null);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const [isPurchasing, setIsPurchasing] = useState(false);

  // ── Active number state ──────────────────────────────────────────────────
  const [activeNumber, setActiveNumber] = useState<ActiveNumber | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRequestingSms, setIsRequestingSms] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load countries ────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setIsLoadingCountries(true);
      try {
        const res = await api.getGrizzlyCountries();
        const sorted = [...res.data.countries].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
        setFilteredCountries(sorted);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load countries');
      } finally {
        setIsLoadingCountries(false);
      }
    })();
  }, []);

  // ── Country search filter ─────────────────────────────────────────────────

  useEffect(() => {
    const q = countrySearch.toLowerCase();
    setFilteredCountries(q ? countries.filter(c => c.name.toLowerCase().includes(q)) : countries);
  }, [countrySearch, countries]);

  // ── Load services when country chosen ────────────────────────────────────

  useEffect(() => {
    if (!selectedCountry) return;
    setSelectedService(null);
    setServices([]);
    setPrice(null);
    setStockCount(null);
    setIsLoadingServices(true);
    (async () => {
      try {
        const res = await api.getGrizzlyServices(selectedCountry.id);
        const sorted = [...res.data.services].sort((a, b) => a.name.localeCompare(b.name));
        setServices(sorted);
        setFilteredServices(sorted);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load services');
      } finally {
        setIsLoadingServices(false);
      }
    })();
  }, [selectedCountry]);

  // ── Service search filter ─────────────────────────────────────────────────

  useEffect(() => {
    const q = serviceSearch.toLowerCase();
    setFilteredServices(q ? services.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) : services);
  }, [serviceSearch, services]);

  // ── Fetch live price when both are selected ───────────────────────────────

  useEffect(() => {
    if (!selectedCountry || !selectedService) { setPrice(null); setStockCount(null); return; }
    setIsLoadingPrice(true);
    setPrice(null);
    setStockCount(null);
    (async () => {
      try {
        const res = await api.getGrizzlyPrice(selectedService.code, selectedCountry.id);
        const row = res.data[String(selectedCountry.id)]?.[selectedService.code];
        if (row) {
          setPrice(Number(row.cost));
          setStockCount(row.count);
        } else {
          setPrice(null);
          setStockCount(0);
        }
      } catch {
        setPrice(null);
      } finally {
        setIsLoadingPrice(false);
      }
    })();
  }, [selectedCountry, selectedService]);

  // ── Polling ───────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setIsPolling(false);
  }, []);

  const pollStatus = useCallback(async (id: number) => {
    try {
      const res = await api.getGrizzlyStatus(id);
      if (!res.success) {
        const err = res as { success: false; status?: string; message: string };
        stopPolling();
        if (err.status === 'expired') {
          setActiveNumber(prev => prev ? { ...prev, status: 'expired' } : prev);
          toast.info('Number expired — balance refunded automatically.');
        } else if (err.status === 'cancelled') {
          setActiveNumber(prev => prev ? { ...prev, status: 'cancelled' } : prev);
        }
        return;
      }
      const data = res.data;
      if (data.status === 'received') {
        stopPolling();
        setActiveNumber(prev => prev ? {
          ...prev,
          status: 'received',
          otp_code: (data as any).otp_code,
          sms_text: (data as any).sms_text,
        } : prev);
        toast.success('OTP received!');
      }
      // status === 'waiting' → keep polling silently
    } catch {
      // network hiccup — keep polling
    }
  }, [stopPolling]);

  const startPolling = useCallback((id: number) => {
    stopPolling();
    setIsPolling(true);
    pollRef.current = setInterval(() => pollStatus(id), 5000);
  }, [pollStatus, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Purchase ──────────────────────────────────────────────────────────────

  const handlePurchase = async () => {
    if (!selectedCountry || !selectedService || isPurchasing) return;
    setIsPurchasing(true);
    try {
      const res = await api.purchaseGrizzlyNumber(selectedService.code, selectedCountry.id);
      const num = res.data.purchased_number;
      setActiveNumber({ ...num });
      updateBalance(res.data.balance.current);
      setStep('active');
      startPolling(num.id);
      toast.success('Number purchased! Waiting for SMS code…');
    } catch (err: any) {
      if (err.required !== undefined) {
        toast.error(`Insufficient balance — need ₦${Number(err.required).toFixed(2)}`);
      } else if (err.error?.includes('No numbers') || err.message?.includes('No numbers')) {
        toast.error('No numbers available for this combination. Try a different country or service.');
      } else {
        toast.error(err.message || 'Purchase failed');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // ── Complete ──────────────────────────────────────────────────────────────

  const handleComplete = async () => {
    if (!activeNumber || isCompleting) return;
    setIsCompleting(true);
    try {
      await api.completeGrizzlyActivation(activeNumber.id);
      setActiveNumber(prev => prev ? { ...prev, status: 'completed' } : prev);
      toast.success('Activation completed!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete');
    } finally {
      setIsCompleting(false);
    }
  };

  // ── Cancel ────────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!activeNumber || isCancelling) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelGrizzlyActivation(activeNumber.id);
      stopPolling();
      setActiveNumber(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      updateBalance(res.data.current_balance);
      toast.success(`Cancelled — ₦${Number(res.data.refunded_amount).toFixed(2)} refunded`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Request another SMS ───────────────────────────────────────────────────

  const handleRequestSms = async () => {
    if (!activeNumber || isRequestingSms) return;
    setIsRequestingSms(true);
    try {
      await api.requestGrizzlySms(activeNumber.id);
      startPolling(activeNumber.id);
      toast.success('Another SMS requested — polling for new code…');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request SMS');
    } finally {
      setIsRequestingSms(false);
    }
  };

  // ── Copy ──────────────────────────────────────────────────────────────────

  const copy = (text: string, kind: 'otp' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (kind === 'otp') { setCopiedOtp(true); setTimeout(() => setCopiedOtp(false), 2000); }
    else { setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000); }
    toast.success('Copied!');
  };

  const handleNewPurchase = () => {
    stopPolling();
    setActiveNumber(null);
    setStep('select');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0614] p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-[#8B00FF] dark:text-[#BF5FFF] border border-purple-200 dark:border-[#2E2050]">
              Server 3
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Active</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Buy Numbers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pick a country and service to purchase a temporary verification number.
          </p>
        </div>

        {step === 'select' ? (
          <SelectionPanel
            // countries
            countries={filteredCountries}
            countrySearch={countrySearch}
            setCountrySearch={setCountrySearch}
            selectedCountry={selectedCountry}
            countryOpen={countryOpen}
            setCountryOpen={setCountryOpen}
            isLoadingCountries={isLoadingCountries}
            onSelectCountry={c => { setSelectedCountry(c); setCountryOpen(false); setCountrySearch(''); }}
            // services
            services={filteredServices}
            serviceSearch={serviceSearch}
            setServiceSearch={setServiceSearch}
            selectedService={selectedService}
            serviceOpen={serviceOpen}
            setServiceOpen={setServiceOpen}
            isLoadingServices={isLoadingServices}
            onSelectService={s => { setSelectedService(s); setServiceOpen(false); setServiceSearch(''); }}
            // price
            price={price}
            stockCount={stockCount}
            isLoadingPrice={isLoadingPrice}
            // purchase
            isPurchasing={isPurchasing}
            onPurchase={handlePurchase}
          />
        ) : (
          activeNumber && (
            <ActiveNumberPanel
              number={activeNumber}
              isPolling={isPolling}
              isCompleting={isCompleting}
              isCancelling={isCancelling}
              isRequestingSms={isRequestingSms}
              copiedOtp={copiedOtp}
              copiedPhone={copiedPhone}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onRequestSms={handleRequestSms}
              onCopyOtp={() => activeNumber.otp_code && copy(activeNumber.otp_code, 'otp')}
              onCopyPhone={() => copy(activeNumber.phone_number, 'phone')}
              onNewPurchase={handleNewPurchase}
            />
          )
        )}
      </div>
    </div>
  );
}

// ─── Selection Panel ─────────────────────────────────────────────────────────

interface SelectionPanelProps {
  countries: GrizzlyCountry[];
  countrySearch: string;
  setCountrySearch: (v: string) => void;
  selectedCountry: GrizzlyCountry | null;
  countryOpen: boolean;
  setCountryOpen: (v: boolean) => void;
  isLoadingCountries: boolean;
  onSelectCountry: (c: GrizzlyCountry) => void;
  services: GrizzlyService[];
  serviceSearch: string;
  setServiceSearch: (v: string) => void;
  selectedService: GrizzlyService | null;
  serviceOpen: boolean;
  setServiceOpen: (v: boolean) => void;
  isLoadingServices: boolean;
  onSelectService: (s: GrizzlyService) => void;
  price: number | null;
  stockCount: number | null;
  isLoadingPrice: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
}

function SelectionPanel({
  countries, countrySearch, setCountrySearch, selectedCountry, countryOpen, setCountryOpen,
  isLoadingCountries, onSelectCountry, services, serviceSearch, setServiceSearch,
  selectedService, serviceOpen, setServiceOpen, isLoadingServices, onSelectService,
  price, stockCount, isLoadingPrice, isPurchasing, onPurchase,
}: SelectionPanelProps) {
  const outOfStock = stockCount === 0;
  const canBuy = !!selectedCountry && !!selectedService && price !== null && !outOfStock;

  return (
    <div className="bg-white dark:bg-[#1C1530] rounded-xl border border-purple-200/50 dark:border-[#2E2050] shadow-sm overflow-hidden">
      <div className="p-5 border-b border-purple-100/60 dark:border-[#2E2050]">
        <h2 className="font-semibold text-gray-900 dark:text-white text-base">Select Country &amp; Service</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Country picker */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Country
          </label>
          <div className="relative">
            <button
              onClick={() => setCountryOpen(!countryOpen)}
              disabled={isLoadingCountries}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] text-sm text-left transition-colors hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] disabled:opacity-50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF] flex-shrink-0" />
                <span className={cn("truncate", selectedCountry ? "text-gray-900 dark:text-white font-medium" : "text-gray-400")}>
                  {isLoadingCountries ? 'Loading countries…' : selectedCountry ? selectedCountry.name : 'Select a country'}
                </span>
              </div>
              {isLoadingCountries
                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                : <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", countryOpen && "rotate-180")} />
              }
            </button>

            {countryOpen && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-[#1C1530] border border-purple-200/50 dark:border-[#2E2050] rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-purple-100/60 dark:border-[#2E2050]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search countries…"
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#120D1E] rounded-md border border-purple-100 dark:border-[#2E2050] focus:outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {countries.length === 0
                    ? <p className="p-3 text-sm text-gray-400 text-center">No countries found</p>
                    : countries.map(c => (
                        <button
                          key={c.id}
                          onClick={() => onSelectCountry(c)}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors",
                            selectedCountry?.id === c.id && "bg-purple-50 dark:bg-purple-950/30 text-[#8B00FF] dark:text-[#BF5FFF] font-medium"
                          )}
                        >
                          {c.name}
                        </button>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service picker */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            Service
          </label>
          <div className="relative">
            <button
              onClick={() => selectedCountry && setServiceOpen(!serviceOpen)}
              disabled={!selectedCountry || isLoadingServices}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] text-sm text-left transition-colors hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF] flex-shrink-0" />
                <span className={cn("truncate", selectedService ? "text-gray-900 dark:text-white font-medium" : "text-gray-400")}>
                  {isLoadingServices ? 'Loading services…' : selectedService ? selectedService.name : selectedCountry ? 'Select a service' : 'Select a country first'}
                </span>
              </div>
              {isLoadingServices
                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                : <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", serviceOpen && "rotate-180")} />
              }
            </button>

            {serviceOpen && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-[#1C1530] border border-purple-200/50 dark:border-[#2E2050] rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-purple-100/60 dark:border-[#2E2050]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search services…"
                      value={serviceSearch}
                      onChange={e => setServiceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#120D1E] rounded-md border border-purple-100 dark:border-[#2E2050] focus:outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {services.length === 0
                    ? <p className="p-3 text-sm text-gray-400 text-center">No services found</p>
                    : services.map(s => (
                        <button
                          key={s.code}
                          onClick={() => onSelectService(s)}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors",
                            selectedService?.code === s.code && "bg-purple-50 dark:bg-purple-950/30 text-[#8B00FF] dark:text-[#BF5FFF] font-medium"
                          )}
                        >
                          {s.name}
                          <span className="ml-1.5 text-xs text-gray-400 font-mono uppercase">{s.code}</span>
                        </button>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live price box */}
        {selectedCountry && selectedService && (
          <div className={cn(
            "rounded-lg border-2 p-4 transition-all",
            isLoadingPrice
              ? "border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E]"
              : outOfStock
              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
              : "border-purple-300 dark:border-[#4B2080] bg-purple-50 dark:bg-purple-950/20"
          )}>
            {isLoadingPrice ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B00FF] dark:text-[#BF5FFF]" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Fetching live price…</span>
              </div>
            ) : outOfStock ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Out of stock for this combination</span>
              </div>
            ) : price !== null ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                  <p className="text-2xl font-bold text-[#8B00FF] dark:text-[#BF5FFF]">₦{price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Available</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{stockCount?.toLocaleString()}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Buy button */}
        <button
          onClick={onPurchase}
          disabled={!canBuy || isPurchasing}
          className={cn(
            "w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
            canBuy && !isPurchasing
              ? "bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7500DC] hover:to-[#8B00FF] text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          )}
        >
          {isPurchasing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Purchasing…</>
            : <><ShoppingCart className="w-4 h-4" /> Buy Number</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Active Number Panel ──────────────────────────────────────────────────────

interface ActiveNumberPanelProps {
  number: ActiveNumber;
  isPolling: boolean;
  isCompleting: boolean;
  isCancelling: boolean;
  isRequestingSms: boolean;
  copiedOtp: boolean;
  copiedPhone: boolean;
  onComplete: () => void;
  onCancel: () => void;
  onRequestSms: () => void;
  onCopyOtp: () => void;
  onCopyPhone: () => void;
  onNewPurchase: () => void;
}

function ActiveNumberPanel({
  number, isPolling, isCompleting, isCancelling, isRequestingSms,
  copiedOtp, copiedPhone, onComplete, onCancel, onRequestSms,
  onCopyOtp, onCopyPhone, onNewPurchase,
}: ActiveNumberPanelProps) {
  const { minutes, seconds, isExpiring } = useCountdown(
    number.status === 'waiting' ? number.expires_at : null
  );

  const isTerminal = ['completed', 'cancelled', 'expired'].includes(number.status);

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    waiting: {
      label: 'Waiting for code',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20',
      icon: <Loader2 className="w-4 h-4 animate-spin text-amber-500" />,
    },
    received: {
      label: 'Code received',
      color: 'text-green-600 dark:text-green-400',
      bg: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    },
    completed: {
      label: 'Completed',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20',
      icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
    },
    cancelled: {
      label: 'Cancelled — refunded',
      color: 'text-gray-500 dark:text-gray-400',
      bg: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20',
      icon: <XCircle className="w-4 h-4 text-gray-400" />,
    },
    expired: {
      label: 'Expired — refunded',
      color: 'text-red-600 dark:text-red-400',
      bg: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20',
      icon: <XCircle className="w-4 h-4 text-red-500" />,
    },
  };

  const cfg = statusConfig[number.status] ?? statusConfig.waiting;

  return (
    <div className={cn("rounded-xl border-2 p-5 space-y-4 shadow-sm", cfg.bg)}>
      {/* Status row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
          {isPolling && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              polling
            </span>
          )}
        </div>

        {number.status === 'waiting' && (
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-mono font-semibold border",
            isExpiring
              ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
              : "bg-white/60 dark:bg-black/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400"
          )}>
            <Timer className="w-3.5 h-3.5" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Meta */}
      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
        Service: <span className="font-semibold">{number.service}</span>
        &nbsp;·&nbsp;Cost: ₦{Number(number.cost).toFixed(2)}
        &nbsp;·&nbsp;ID: {number.activation_id}
      </p>

      {/* Phone number */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/70 dark:bg-black/20 rounded-lg border border-purple-200/30 dark:border-[#2E2050]">
          <Phone className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF] flex-shrink-0" />
          <span className="font-mono font-bold text-gray-900 dark:text-white text-lg tracking-wide select-all">
            +{number.phone_number}
          </span>
        </div>
        <button
          onClick={onCopyPhone}
          className={cn(
            "p-3 rounded-lg border transition-all",
            copiedPhone
              ? "bg-green-500 border-green-500 text-white"
              : "bg-white/70 dark:bg-black/20 border-purple-200/30 dark:border-[#2E2050] text-gray-500 hover:border-[#8B00FF] dark:hover:border-[#BF5FFF]"
          )}
        >
          {copiedPhone ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* OTP */}
      {number.otp_code && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">OTP Code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border-2 border-green-300 dark:border-green-700 text-center">
              <span className="font-mono font-bold text-3xl text-green-700 dark:text-green-300 tracking-widest select-all">
                {number.otp_code}
              </span>
            </div>
            <button
              onClick={onCopyOtp}
              className={cn(
                "p-3 rounded-lg border transition-all",
                copiedOtp
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white/70 dark:bg-black/20 border-green-300 dark:border-green-700 text-gray-500 hover:border-green-500"
              )}
            >
              {copiedOtp ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {number.sms_text && number.sms_text !== number.otp_code && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic px-1">"{number.sms_text}"</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {number.status === 'waiting' && (
          <>
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 dark:bg-black/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              {isCancelling ? 'Cancelling…' : 'Cancel & Refund'}
            </button>
            {number.can_request_another_sms && (
              <button
                onClick={onRequestSms}
                disabled={isRequestingSms}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 dark:bg-black/20 border border-purple-300 dark:border-[#2E2050] text-[#8B00FF] dark:text-[#BF5FFF] hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors disabled:opacity-50"
              >
                {isRequestingSms ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {isRequestingSms ? 'Requesting…' : 'Request SMS'}
              </button>
            )}
          </>
        )}

        {number.status === 'received' && (
          <>
            <button
              onClick={onComplete}
              disabled={isCompleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white hover:from-[#7500DC] hover:to-[#8B00FF] transition-all shadow-sm disabled:opacity-50"
            >
              {isCompleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {isCompleting ? 'Completing…' : 'Mark Done'}
            </button>
            {number.can_request_another_sms && (
              <button
                onClick={onRequestSms}
                disabled={isRequestingSms}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 dark:bg-black/20 border border-purple-300 dark:border-[#2E2050] text-[#8B00FF] dark:text-[#BF5FFF] hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors disabled:opacity-50"
              >
                {isRequestingSms ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {isRequestingSms ? 'Requesting…' : 'Another Code'}
              </button>
            )}
          </>
        )}

        {isTerminal && (
          <button
            onClick={onNewPurchase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 dark:bg-black/20 border border-purple-200/50 dark:border-[#2E2050] text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Buy another
          </button>
        )}
      </div>
    </div>
  );
}
