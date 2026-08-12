import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Loader2,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Zap,
  ShoppingCart,
  MessageSquare,
  ChevronRight,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api, DaisySMSService, DaisySMSRentedNumber } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../components/ui/utils';

// ─── Countdown timer hook ──────────────────────────────────────────────────

function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpiring = secondsLeft > 0 && secondsLeft <= 120;
  const isExpired = secondsLeft === 0 && !!expiresAt;

  return { secondsLeft, minutes, seconds, isExpiring, isExpired };
}

// ─── Active number state ───────────────────────────────────────────────────

interface ActiveNumber extends DaisySMSRentedNumber {
  otp_code?: string;
  sms_text?: string;
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function DaisySMSBuyNumbersPage() {
  const navigate = useNavigate();
  const { updateBalance } = useAuth();

  const [services, setServices] = useState<DaisySMSService[]>([]);
  const [filteredServices, setFilteredServices] = useState<DaisySMSService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [rentingService, setRentingService] = useState<string | null>(null); // service_code being rented

  const [activeNumber, setActiveNumber] = useState<ActiveNumber | null>(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load services ────────────────────────────────────────────────────────

  const loadServices = useCallback(async (forceRefresh = false) => {
    setIsLoadingServices(true);
    setServicesError(null);
    try {
      const res = await api.getDaisySMSServices(forceRefresh);
      if (res.success) {
        const sorted = [...res.data].sort((a, b) => a.service_name.localeCompare(b.service_name));
        setServices(sorted);
        setFilteredServices(sorted);
      } else {
        setServicesError('Failed to load services');
      }
    } catch (err: any) {
      setServicesError(err.message || 'Failed to load services');
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  // ── Search filter ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredServices(services.filter(s =>
      s.service_name.toLowerCase().includes(q) ||
      s.service_code.toLowerCase().includes(q)
    ));
  }, [searchQuery, services]);

  // ── Polling ──────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPollingActive(false);
  }, []);

  const pollForCode = useCallback(async (numberId: number) => {
    try {
      const res = await api.getDaisySMSCode(numberId);

      if (res.success) {
        // Code received
        setActiveNumber(prev => prev ? {
          ...prev,
          status: 'received',
          otp_code: res.data.otp_code,
          sms_text: res.data.sms_text,
        } : prev);
        stopPolling();
        toast.success('OTP received!');
        return;
      }

      // Distinguish wait vs real error
      const errRes = res as { success: false; message: string; error?: string; status?: string };
      if (errRes.error === 'STATUS_WAIT_CODE') {
        return; // still waiting — keep polling silently
      }

      // Real terminal state
      stopPolling();
      if (errRes.status === 'expired') {
        setActiveNumber(prev => prev ? { ...prev, status: 'expired' } : prev);
        toast.info('Number expired — balance refunded automatically.');
      } else if (errRes.status === 'cancelled') {
        setActiveNumber(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      } else {
        toast.error(errRes.message || 'Activation ended.');
        setActiveNumber(null);
      }
    } catch {
      // Network hiccup — keep polling
    }
  }, [stopPolling]);

  const startPolling = useCallback((numberId: number) => {
    stopPolling();
    setPollingActive(true);
    pollIntervalRef.current = setInterval(() => pollForCode(numberId), 5000);
  }, [pollForCode, stopPolling]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Rent ─────────────────────────────────────────────────────────────────

  const handleRent = async (service: DaisySMSService) => {
    if (rentingService) return;
    setRentingService(service.service_code);
    try {
      const res = await api.rentDaisySMSNumber(service.service_code);
      if (res.success) {
        const rented = res.data.rented_number;
        setActiveNumber({ ...rented, status: 'waiting' });
        if (updateBalance) updateBalance(res.data.balance.current);
        startPolling(rented.id);
        toast.success('Number rented! Waiting for SMS code…');
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('insufficient') || err.message?.toLowerCase().includes('balance')) {
        toast.error(`Insufficient balance — need ₦${err.required ?? Number(service.final_cost).toFixed(2)}`);
      } else {
        toast.error(err.message || 'Failed to rent number');
      }
    } finally {
      setRentingService(null);
    }
  };

  // ── Mark done ────────────────────────────────────────────────────────────

  const handleMarkDone = async () => {
    if (!activeNumber || isMarkingDone) return;
    setIsMarkingDone(true);
    try {
      await api.markDaisySMSDone(activeNumber.id);
      setActiveNumber(prev => prev ? { ...prev, status: 'completed' } : prev);
      toast.success('Activation completed!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete activation');
    } finally {
      setIsMarkingDone(false);
    }
  };

  // ── Cancel ───────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!activeNumber || isCancelling) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelDaisySMSActivation(activeNumber.id);
      stopPolling();
      setActiveNumber(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      if (updateBalance) updateBalance(res.data.current_balance);
      toast.success(`Cancelled — ₦${res.data.refunded_amount} refunded`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Copy helpers ─────────────────────────────────────────────────────────

  const copyText = (text: string, kind: 'otp' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (kind === 'otp') {
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
    toast.success('Copied!');
  };

  const handleDismiss = () => {
    stopPolling();
    setActiveNumber(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0614] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

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
              Server 2
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Buy Numbers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a service to rent a temporary phone number and receive a verification code.
          </p>
        </div>

        {/* Active number panel */}
        {activeNumber && (
          <ActiveNumberPanel
            number={activeNumber}
            pollingActive={pollingActive}
            isMarkingDone={isMarkingDone}
            isCancelling={isCancelling}
            copiedOtp={copiedOtp}
            copiedPhone={copiedPhone}
            onMarkDone={handleMarkDone}
            onCancel={handleCancel}
            onCopyOtp={() => activeNumber.otp_code && copyText(activeNumber.otp_code, 'otp')}
            onCopyPhone={() => copyText(activeNumber.phone_number, 'phone')}
            onDismiss={handleDismiss}
          />
        )}

        {/* Services list */}
        <div className="bg-white dark:bg-[#1C1530] rounded-xl border border-purple-200/50 dark:border-[#2E2050] shadow-sm overflow-hidden">
          {/* Search header */}
          <div className="p-4 border-b border-purple-200/50 dark:border-[#2E2050] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">Available Services</h2>
              {!isLoadingServices && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {filteredServices.length} of {services.length} services
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B00FF]/30 focus:border-[#8B00FF] dark:focus:border-[#BF5FFF]"
                />
              </div>
              <button
                onClick={() => loadServices(true)}
                disabled={isLoadingServices}
                className="p-2 rounded-lg border border-purple-200/50 dark:border-[#2E2050] text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors disabled:opacity-50"
                title="Refresh services"
              >
                <RefreshCw className={cn("w-4 h-4", isLoadingServices && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Body */}
          {isLoadingServices ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#8B00FF] dark:text-[#BF5FFF] animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading services…</p>
            </div>
          ) : servicesError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{servicesError}</p>
              <button
                onClick={() => loadServices(true)}
                className="mt-1 text-sm text-[#8B00FF] dark:text-[#BF5FFF] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No services match "{searchQuery}"</p>
            </div>
          ) : (
            <div className="divide-y divide-purple-100/50 dark:divide-[#2E2050]">
              {filteredServices.map(service => {
                const isRenting = rentingService === service.service_code;
                const hasActive = !!activeNumber && activeNumber.status === 'waiting';
                const disabled = !!rentingService || (hasActive && activeNumber?.service !== service.service_code);

                return (
                  <div
                    key={service.service_code}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {service.service_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono uppercase">
                            {service.service_code}
                          </span>
                          {service.count > 0 ? (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {service.count.toLocaleString()} available
                            </span>
                          ) : (
                            <span className="text-xs text-red-500">Out of stock</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₦{Number(service.final_cost).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRent(service)}
                        disabled={disabled || service.count === 0 || isRenting}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          isRenting
                            ? "bg-purple-200 dark:bg-purple-900/40 text-purple-500 cursor-wait"
                            : disabled || service.count === 0
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white hover:from-[#7500DC] hover:to-[#8B00FF] shadow-sm"
                        )}
                      >
                        {isRenting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-3 h-3" />
                        )}
                        {isRenting ? 'Renting…' : 'Rent'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Active Number Panel ────────────────────────────────────────────────────

interface ActiveNumberPanelProps {
  number: ActiveNumber;
  pollingActive: boolean;
  isMarkingDone: boolean;
  isCancelling: boolean;
  copiedOtp: boolean;
  copiedPhone: boolean;
  onMarkDone: () => void;
  onCancel: () => void;
  onCopyOtp: () => void;
  onCopyPhone: () => void;
  onDismiss: () => void;
}

function ActiveNumberPanel({
  number,
  pollingActive,
  isMarkingDone,
  isCancelling,
  copiedOtp,
  copiedPhone,
  onMarkDone,
  onCancel,
  onCopyOtp,
  onCopyPhone,
  onDismiss,
}: ActiveNumberPanelProps) {
  const { minutes, seconds, isExpiring, isExpired } = useCountdown(
    number.status === 'waiting' ? number.expires_at : null
  );

  const isTerminal = ['completed', 'cancelled', 'expired'].includes(number.status);

  const statusConfig = {
    waiting: {
      label: 'Waiting for code',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      icon: <Loader2 className="w-4 h-4 animate-spin text-amber-500" />,
    },
    received: {
      label: 'Code received',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    },
    completed: {
      label: 'Completed',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
    },
    cancelled: {
      label: 'Cancelled — refunded',
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
      icon: <XCircle className="w-4 h-4 text-gray-400" />,
    },
    expired: {
      label: 'Expired — refunded',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      icon: <XCircle className="w-4 h-4 text-red-500" />,
    },
  };

  const cfg = statusConfig[number.status] ?? statusConfig.waiting;

  return (
    <div className={cn(
      "rounded-xl border-2 p-5 space-y-4 shadow-sm transition-all",
      cfg.bg
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {cfg.icon}
            <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
            {pollingActive && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                polling
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            Service: <span className="font-semibold uppercase">{number.service}</span>
            &nbsp;·&nbsp;Cost: ₦{Number(number.cost).toFixed(2)}
          </p>
        </div>

        {/* Countdown */}
        {number.status === 'waiting' && !isExpired && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border",
            isExpiring
              ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
              : "bg-white/60 dark:bg-black/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
          )}>
            <Timer className="w-3.5 h-3.5" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Phone number row */}
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
              : "bg-white/70 dark:bg-black/20 border-purple-200/30 dark:border-[#2E2050] text-gray-600 dark:text-gray-400 hover:border-[#8B00FF] dark:hover:border-[#BF5FFF]"
          )}
        >
          {copiedPhone ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* OTP row */}
      {number.otp_code && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            OTP Code
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border-2 border-green-300 dark:border-green-800 text-center">
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
                  : "bg-white/70 dark:bg-black/20 border-green-300 dark:border-green-800 text-gray-600 dark:text-gray-400 hover:border-green-500"
              )}
            >
              {copiedOtp ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {number.sms_text && (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1 italic">"{number.sms_text}"</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {number.status === 'waiting' && (
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 dark:bg-black/20 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            {isCancelling ? 'Cancelling…' : 'Cancel & Refund'}
          </button>
        )}

        {number.status === 'received' && (
          <button
            onClick={onMarkDone}
            disabled={isMarkingDone}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white hover:from-[#7500DC] hover:to-[#8B00FF] transition-all shadow-sm disabled:opacity-50"
          >
            {isMarkingDone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {isMarkingDone ? 'Completing…' : 'Mark Done'}
          </button>
        )}

        {isTerminal && (
          <button
            onClick={onDismiss}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white/70 dark:bg-black/20 border border-purple-200/50 dark:border-[#2E2050] text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Rent another
          </button>
        )}
      </div>
    </div>
  );
}
