import { useState, useEffect, useRef } from 'react'; // useRef kept for script element tracking
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Wallet,
  CreditCard,
  Loader2,
  Info,
  CheckCircle2,
  ArrowLeft,
  Zap,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const KORAPAY_NOTIFICATION_URL = 'https://app.viktohs-sms.com/api/webhook/korapay';
const KORAPAY_SCRIPT_URL = 'https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js';

interface KorapaySuccessData {
  amount: string;
  reference: string;
  status: string;
}

interface KorapayFailedData {
  amount?: string;
  reference?: string;
  status?: string;
}

interface KorapayConfig {
  key: string;
  reference: string;
  amount: number;
  currency: string;
  customer: { name: string; email: string };
  notification_url: string;
  merchant_bears_cost?: boolean;
  onClose?: () => void;
  onSuccess?: (data: KorapaySuccessData) => void;
  onFailed?: (data: KorapayFailedData) => void;
  onPending?: () => void;
  onTokenized?: () => void;
}

declare global {
  interface Window {
    Korapay?: {
      initialize: (config: KorapayConfig) => void;
      close: () => void;
    };
  }
}


export default function FundWalletPage() {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed' | 'pending'>('idle');
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const walletBalance = user ? parseFloat(user.balance) : 0;

  // Load Korapay script once
  useEffect(() => {
    if (document.querySelector(`script[src="${KORAPAY_SCRIPT_URL}"]`)) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = KORAPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => toast.error('Failed to load payment gateway. Please refresh.');
    document.body.appendChild(script);
    scriptRef.current = script;
  }, []);

  const refreshBalance = async () => {
    try {
      const res = await api.getBalance();
      if (res.success) updateBalance(res.data.wallet_balance);
    } catch {}
  };

  const handlePay = async () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      toast.error('Minimum deposit is ₦100');
      return;
    }
    if (!scriptLoaded || !window.Korapay) {
      toast.error('Payment gateway not ready. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('idle');

    // 1. Ask the backend to create the payment session.
    //    Backend owns the reference so the webhook can identify the user.
    let sessionData: Awaited<ReturnType<typeof api.initializeKorapay>>['data'];
    try {
      const res = await api.initializeKorapay(Math.round(numericAmount));
      sessionData = res.data;
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err.message || 'Failed to initialize payment. Please try again.');
      return;
    }

    // 2. Feed the backend response directly into Korapay — no frontend-invented values.
    let settled = false;

    window.Korapay.initialize({
      key: sessionData.public_key,
      reference: sessionData.reference,
      amount: sessionData.amount,
      currency: sessionData.currency,
      customer: sessionData.customer,
      notification_url: KORAPAY_NOTIFICATION_URL,
      merchant_bears_cost: true,

      onSuccess: (_data: KorapaySuccessData) => {
        settled = true;
        setIsProcessing(false);
        setPaymentStatus('success');
        setAmount('');
        toast.success('Payment successful! Your wallet will be credited shortly.');
        // Re-fetch real balance from backend — don't trust the callback amount
        refreshBalance();
      },

      onFailed: (_data: KorapayFailedData) => {
        settled = true;
        setIsProcessing(false);
        setPaymentStatus('failed');
        toast.error('Payment failed. Please try again.');
      },

      onPending: () => {
        settled = true;
        setIsProcessing(false);
        setPaymentStatus('pending');
        toast.info('Bank transfer is being processed. Your wallet will be credited once confirmed.');
      },

      // onClose fires in ALL cases (success, failure, user dismiss).
      // Only act when no terminal callback already fired.
      onClose: () => {
        if (!settled) {
          setIsProcessing(false);
        }
      },
    });
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const formatBalance = (val: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0614] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">Fund Wallet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add funds securely via card or bank transfer powered by Korapay
          </p>
        </div>

        {/* Balance card */}
        <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-gradient-to-br from-[#8B00FF] to-[#A020F0] shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Current Balance</p>
                <p className="text-3xl lg:text-4xl font-bold text-white">
                  {formatBalance(walletBalance)}
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status banners */}
        {paymentStatus === 'success' && (
          <Alert className="border-green-400 bg-green-50 dark:bg-green-950/30">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              Payment successful! Your wallet balance has been updated.
            </AlertDescription>
          </Alert>
        )}
        {paymentStatus === 'failed' && (
          <Alert className="border-red-400 bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              Payment failed or was cancelled. No charge was made.
            </AlertDescription>
          </Alert>
        )}
        {paymentStatus === 'pending' && (
          <Alert className="border-amber-400 bg-amber-50 dark:bg-amber-950/30">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Your bank transfer is being processed. Credit may take a few minutes.
            </AlertDescription>
          </Alert>
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Payment form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530] shadow-lg">
              <CardHeader className="border-b border-purple-200/50 dark:border-[#2E2050] pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                    <CreditCard className="w-5 h-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  </div>
                  <CardTitle className="text-lg">Enter Amount</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Quick amounts */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map(val => (
                      <button
                        key={val}
                        onClick={() => setAmount(String(val))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          amount === String(val)
                            ? 'bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white border-transparent shadow-sm'
                            : 'bg-gray-50 dark:bg-[#120D1E] border-purple-200/50 dark:border-[#2E2050] text-gray-700 dark:text-gray-300 hover:border-[#8B00FF] dark:hover:border-[#BF5FFF]'
                        }`}
                      >
                        ₦{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount input */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    Custom Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                      ₦
                    </span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3.5 text-xl font-bold rounded-lg border-2 border-purple-200/50 dark:border-[#2E2050] bg-gray-50 dark:bg-[#120D1E] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-[#8B00FF] dark:focus:border-[#BF5FFF] transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Minimum deposit: ₦100</p>
                </div>

                {/* Pay button */}
                <Button
                  onClick={handlePay}
                  disabled={isProcessing || !scriptLoaded || !amount}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#7500DC] hover:to-[#8B00FF] text-white shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Opening payment…
                    </>
                  ) : !scriptLoaded ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading gateway…
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Pay {amount ? `₦${parseFloat(amount).toLocaleString()}` : 'Now'}
                    </>
                  )}
                </Button>

                {/* Powered by */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Secured &amp; powered by</span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-wide">Korapay</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* How it works */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: '1', title: 'Enter Amount', desc: 'Choose or type an amount' },
                  { step: '2', title: 'Choose Method', desc: 'Card or bank transfer' },
                  { step: '3', title: 'Auto Credit', desc: 'Wallet funded instantly' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#8B00FF] to-[#A020F0] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1.5 text-xs text-green-800 dark:text-green-300">
                    <p className="font-semibold text-sm text-green-900 dark:text-green-200">Benefits</p>
                    <ul className="space-y-1">
                      <li>• Pay by card or bank transfer</li>
                      <li>• Instant credit on success</li>
                      <li>• 256-bit SSL encrypted</li>
                      <li>• Min. deposit: ₦100</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-2 border-purple-200/50 dark:border-[#2E2050] bg-white dark:bg-[#1C1530]">
              <CardContent className="p-4 text-center">
                <div className="mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Info className="w-5 h-5 text-[#8B00FF] dark:text-[#BF5FFF]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Need Help?</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Contact support if needed
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-300 dark:border-[#2E2050] hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] hover:bg-purple-50 dark:hover:bg-purple-950/30 text-sm"
                  onClick={() => window.open('https://t.me/viktohsms', '_blank')}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
