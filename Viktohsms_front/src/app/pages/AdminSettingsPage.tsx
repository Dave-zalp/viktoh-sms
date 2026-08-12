import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { 
  DollarSign, 
  TrendingUp, 
  Save, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api, formatApiError } from '../utils/api';
import type { AdminSettings, UpdateAdminSettingsError } from '../utils/api';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AdminSettings | null>(null);
  
  // SMS Activate settings
  const [smsActivateExcRate, setSmsActivateExcRate] = useState('');
  const [smsActivateTopUp, setSmsActivateTopUp] = useState('');
  
  // Daisy SMS settings
  const [daisySmsExcRate, setDaisySmsExcRate] = useState('');
  const [daisySmsTopUp, setDaisySmsTopUp] = useState('');

  // Grizzly SMS settings
  const [grizzlySmsExcRate, setGrizzlySmsExcRate] = useState('');
  const [grizzlySmsTopUp, setGrizzlySmsTopUp] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAdminSettings();
      
      if (response.success) {
        const settings = response.data;
        setOriginalSettings(settings);
        setSmsActivateExcRate(settings.sms_activate_exc_rate);
        setSmsActivateTopUp(settings.sms_activate_top_up);
        setDaisySmsExcRate(settings.daisy_sms_exc_rate);
        setDaisySmsTopUp(settings.daisy_sms_top_up);
        setGrizzlySmsExcRate(settings.grizzly_sms_exc_rate);
        setGrizzlySmsTopUp(settings.grizzly_sms_top_up);
      }
    } catch (error: any) {
      toast.error(formatApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    const smsActivateExcRateNum = parseFloat(smsActivateExcRate);
    const smsActivateTopUpNum = parseFloat(smsActivateTopUp);
    const daisySmsExcRateNum = parseFloat(daisySmsExcRate);
    const daisySmsTopUpNum = parseFloat(daisySmsTopUp);
    const grizzlySmsExcRateNum = parseFloat(grizzlySmsExcRate);
    const grizzlySmsTopUpNum = parseFloat(grizzlySmsTopUp);

    if (isNaN(smsActivateExcRateNum) || smsActivateExcRateNum <= 0) {
      toast.error('Please enter a valid SMS Activate exchange rate');
      return;
    }

    if (isNaN(smsActivateTopUpNum) || smsActivateTopUpNum < 0) {
      toast.error('Please enter a valid SMS Activate top-up rate');
      return;
    }

    if (isNaN(daisySmsExcRateNum) || daisySmsExcRateNum <= 0) {
      toast.error('Please enter a valid Daisy SMS exchange rate');
      return;
    }

    if (isNaN(daisySmsTopUpNum) || daisySmsTopUpNum < 0) {
      toast.error('Please enter a valid Daisy SMS top-up rate');
      return;
    }

    if (isNaN(grizzlySmsExcRateNum) || grizzlySmsExcRateNum <= 0) {
      toast.error('Please enter a valid Grizzly SMS exchange rate');
      return;
    }

    if (isNaN(grizzlySmsTopUpNum) || grizzlySmsTopUpNum < 0) {
      toast.error('Please enter a valid Grizzly SMS top-up rate');
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await api.updateAdminSettings({
        sms_activate_exc_rate: smsActivateExcRateNum,
        sms_activate_top_up: smsActivateTopUpNum,
        daisy_sms_exc_rate: daisySmsExcRateNum,
        daisy_sms_top_up: daisySmsTopUpNum,
        grizzly_sms_exc_rate: grizzlySmsExcRateNum,
        grizzly_sms_top_up: grizzlySmsTopUpNum,
      });

      if (response.success) {
        const settings = response.data;
        setOriginalSettings(settings);
        setSmsActivateExcRate(settings.sms_activate_exc_rate);
        setSmsActivateTopUp(settings.sms_activate_top_up);
        setDaisySmsExcRate(settings.daisy_sms_exc_rate);
        setDaisySmsTopUp(settings.daisy_sms_top_up);
        setGrizzlySmsExcRate(settings.grizzly_sms_exc_rate);
        setGrizzlySmsTopUp(settings.grizzly_sms_top_up);
        toast.success(response.message || 'Settings updated successfully');
      }
    } catch (error: any) {
      const apiError = error as UpdateAdminSettingsError;
      toast.error(formatApiError(apiError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSmsActivateExcRate(originalSettings.sms_activate_exc_rate);
      setSmsActivateTopUp(originalSettings.sms_activate_top_up);
      setDaisySmsExcRate(originalSettings.daisy_sms_exc_rate);
      setDaisySmsTopUp(originalSettings.daisy_sms_top_up);
      setGrizzlySmsExcRate(originalSettings.grizzly_sms_exc_rate);
      setGrizzlySmsTopUp(originalSettings.grizzly_sms_top_up);
      toast.info('Settings reset to saved values');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden mb-4">
        <h1 className="text-xl text-black dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage platform settings
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl text-black dark:text-white mb-2">Settings</h1>
        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Configure platform-wide exchange rates and top-up percentages
        </p>
      </div>

      {/* Info Alert */}
      <Card className="border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 mb-4 lg:mb-6">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              These settings control the exchange rates and top-up percentages for the SMS Activate, Daisy SMS, and Grizzly SMS providers. Changes will take effect immediately for all new transactions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMS Activate Settings */}
      <div className="mb-6">
        <h2 className="text-lg text-black dark:text-white mb-3">SMS Activate Provider</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* SMS Activate Exchange Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Exchange Rate</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Dollar to Naira conversion rate for SMS Activate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsActivateExcRate" className="text-black dark:text-white">
                    Exchange Rate (₦/$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      ₦
                    </span>
                    <Input
                      id="smsActivateExcRate"
                      type="number"
                      placeholder="1600"
                      value={smsActivateExcRate}
                      onChange={(e) => setSmsActivateExcRate(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This rate will be used to calculate SMS Activate costs in Naira
                  </p>
                </div>

                {/* Preview */}
                {smsActivateExcRate && parseFloat(smsActivateExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{parseFloat(smsActivateExcRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(smsActivateExcRate) * 5).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(smsActivateExcRate) * 10).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SMS Activate Top-Up Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Top-Up Percentage</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Additional charge percentage for SMS Activate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsActivateTopUp" className="text-black dark:text-white">
                    Top-Up Percentage (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="smsActivateTopUp"
                      type="number"
                      placeholder="0"
                      value={smsActivateTopUp}
                      onChange={(e) => setSmsActivateTopUp(e.target.value)}
                      className="pr-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Additional percentage added to SMS Activate prices
                  </p>
                </div>

                {/* Preview */}
                {smsActivateTopUp && parseFloat(smsActivateTopUp) >= 0 && smsActivateExcRate && parseFloat(smsActivateExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview (with top-up)</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsActivateExcRate) * (1 + parseFloat(smsActivateTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsActivateExcRate) * 5 * (1 + parseFloat(smsActivateTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsActivateExcRate) * 10 * (1 + parseFloat(smsActivateTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daisy SMS Settings */}
      <div className="mb-6">
        <h2 className="text-lg text-black dark:text-white mb-3">Daisy SMS Provider</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Daisy SMS Exchange Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Exchange Rate</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Dollar to Naira conversion rate for Daisy SMS
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daisySmsExcRate" className="text-black dark:text-white">
                    Exchange Rate (₦/$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      ₦
                    </span>
                    <Input
                      id="daisySmsExcRate"
                      type="number"
                      placeholder="1600"
                      value={daisySmsExcRate}
                      onChange={(e) => setDaisySmsExcRate(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This rate will be used to calculate Daisy SMS costs in Naira
                  </p>
                </div>

                {/* Preview */}
                {daisySmsExcRate && parseFloat(daisySmsExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{parseFloat(daisySmsExcRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(daisySmsExcRate) * 5).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(daisySmsExcRate) * 10).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daisy SMS Top-Up Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Top-Up Percentage</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Additional charge percentage for Daisy SMS
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daisySmsTopUp" className="text-black dark:text-white">
                    Top-Up Percentage (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="daisySmsTopUp"
                      type="number"
                      placeholder="0"
                      value={daisySmsTopUp}
                      onChange={(e) => setDaisySmsTopUp(e.target.value)}
                      className="pr-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Additional percentage added to Daisy SMS prices
                  </p>
                </div>

                {/* Preview */}
                {daisySmsTopUp && parseFloat(daisySmsTopUp) >= 0 && daisySmsExcRate && parseFloat(daisySmsExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview (with top-up)</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(daisySmsExcRate) * (1 + parseFloat(daisySmsTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(daisySmsExcRate) * 5 * (1 + parseFloat(daisySmsTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(daisySmsExcRate) * 10 * (1 + parseFloat(daisySmsTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grizzly SMS Settings */}
      <div className="mb-6">
        <h2 className="text-lg text-black dark:text-white mb-3">Grizzly SMS Provider</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Grizzly SMS Exchange Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Exchange Rate</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Dollar to Naira conversion rate for Grizzly SMS
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grizzlySmsExcRate" className="text-black dark:text-white">
                    Exchange Rate (₦/$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      ₦
                    </span>
                    <Input
                      id="grizzlySmsExcRate"
                      type="number"
                      placeholder="1600"
                      value={grizzlySmsExcRate}
                      onChange={(e) => setGrizzlySmsExcRate(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This rate will be used to calculate Grizzly SMS costs in Naira
                  </p>
                </div>

                {/* Preview */}
                {grizzlySmsExcRate && parseFloat(grizzlySmsExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{parseFloat(grizzlySmsExcRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(grizzlySmsExcRate) * 5).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(grizzlySmsExcRate) * 10).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grizzly SMS Top-Up Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Top-Up Percentage</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Additional charge percentage for Grizzly SMS
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grizzlySmsTopUp" className="text-black dark:text-white">
                    Top-Up Percentage (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="grizzlySmsTopUp"
                      type="number"
                      placeholder="0"
                      value={grizzlySmsTopUp}
                      onChange={(e) => setGrizzlySmsTopUp(e.target.value)}
                      className="pr-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Additional percentage added to Grizzly SMS prices
                  </p>
                </div>

                {/* Preview */}
                {grizzlySmsTopUp && parseFloat(grizzlySmsTopUp) >= 0 && grizzlySmsExcRate && parseFloat(grizzlySmsExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview (with top-up)</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(grizzlySmsExcRate) * (1 + parseFloat(grizzlySmsTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(grizzlySmsExcRate) * 5 * (1 + parseFloat(grizzlySmsTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(grizzlySmsExcRate) * 10 * (1 + parseFloat(grizzlySmsTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Saved
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card className="border border-gray-200 dark:border-gray-800 mt-4 lg:mt-6">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <CardTitle className="text-base sm:text-lg text-black dark:text-white">How These Settings Work</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-black dark:text-white mb-2">Exchange Rates</h4>
              <p>
                Each provider has its own exchange rate that converts USD prices to Naira (₦). When a service returns prices in USD, 
                they will be converted using the respective provider's rate. A higher rate means users pay more in Naira for the same service.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-black dark:text-white mb-2">Top-Up Percentages</h4>
              <p>
                The top-up percentage is an additional markup applied to each provider's prices after exchange rate conversion. 
                For example, if a service costs $1.00, with an exchange rate of ₦1,600 and a 10% top-up, the final price would be ₦1,760.
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 border border-yellow-200 dark:border-yellow-900">
              <p className="text-yellow-900 dark:text-yellow-100">
                <strong>Important:</strong> Changes take effect immediately for all new transactions. Make sure to test the settings 
                carefully before making significant changes to avoid pricing errors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
