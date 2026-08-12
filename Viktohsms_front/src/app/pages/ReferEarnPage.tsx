import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Gift, 
  DollarSign, 
  Copy, 
  Share2,
  Mail,
  Check
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ReferEarnPage() {
  const [referralCode] = useState('SMSL-XJ9K2P');
  const [copied, setCopied] = useState(false);

  const stats = [
    {
      label: 'Total Referrals',
      value: '12',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Earnings',
      value: '₦36.00',
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Pending',
      value: '3',
      icon: Gift,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const recentReferrals = [
    { name: 'John D.', date: '2 days ago', status: 'Active', earned: '₦3.00' },
    { name: 'Sarah M.', date: '5 days ago', status: 'Active', earned: '₦3.00' },
    { name: 'Mike R.', date: '1 week ago', status: 'Pending', earned: '₦0.00' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://viktohssms.com/ref/${referralCode}`);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 dark:from-blue-700 dark:via-blue-800 dark:to-blue-700 shadow-xl shadow-blue-500/20 dark:shadow-blue-900/30">
        <h1 className="text-3xl text-white mb-2">Refer & Earn</h1>
        <p className="text-blue-100 dark:text-blue-200">
          Invite friends and earn ₦3 for each successful referral
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 dark:border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <CardContent className="p-6 relative">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-2xl text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Link */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 shadow-lg dark:shadow-gray-900/50">
            <CardHeader className="border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
              <CardTitle className="text-gray-900 dark:text-white">Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={`https://viktohssms.com/ref/${referralCode}`}
                  readOnly
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <Button
                  onClick={handleCopy}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          <Card className="border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 shadow-lg dark:shadow-gray-900/50">
            <CardHeader className="border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
              <CardTitle className="text-gray-900 dark:text-white">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentReferrals.map((referral, index) => (
                  <div key={index} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-white mb-1">{referral.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{referral.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        referral.status === 'Active'
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                      }`}>
                        {referral.status}
                      </span>
                      <p className="text-gray-900 dark:text-white mt-1">{referral.earned}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
            <CardHeader className="border-b border-blue-200 dark:border-blue-800">
              <CardTitle className="text-blue-900 dark:text-blue-100">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="space-y-4 text-sm text-blue-800 dark:text-blue-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xs">1</span>
                  <span>Share your unique referral link with friends</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xs">2</span>
                  <span>They sign up and add ₦10+ to their wallet</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xs">3</span>
                  <span>You both get ₦3 in credits!</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 shadow-lg dark:shadow-gray-900/50">
            <CardHeader className="border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
              <CardTitle className="text-gray-900 dark:text-white">Terms</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Unlimited referrals</li>
                <li>• Credits added instantly</li>
                <li>• No expiration on earnings</li>
                <li>• Minimum ₦10 first deposit required</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}