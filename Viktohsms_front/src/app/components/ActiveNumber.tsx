import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { ChevronLeft, Copy, RefreshCw, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PhoneNumber {
  id: string;
  number: string;
  service: string;
  price: number;
}

interface Country {
  id: string;
  name: string;
  flag: string;
  available: number;
}

interface SMS {
  id: string;
  from: string;
  message: string;
  timestamp: string;
}

interface ActiveNumberProps {
  number: PhoneNumber;
  country: Country;
  onBack: () => void;
}

export default function ActiveNumber({ number, country, onBack }: ActiveNumberProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [messages, setMessages] = useState<SMS[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate receiving messages
  useEffect(() => {
    const mockMessages: SMS[] = [
      {
        id: "1",
        from: number.service,
        message: `Your ${number.service} verification code is: 789456`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: "2",
        from: number.service,
        message: `Verification code: 123987. Do not share this code.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    // Simulate message arrival after 3 seconds
    const timeout = setTimeout(() => {
      setMessages(mockMessages);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [number.service]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(number.number);
    toast.success("Phone number copied to clipboard!");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    toast.info("Refreshing messages...");
  };

  const progressValue = (timeLeft / 300) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={onBack} 
                  className="cursor-pointer flex items-center gap-1 text-[#2563EB] hover:text-[#1d4ed8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Active Number</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Active Number Card */}
        <Card className="mb-6 border-2 border-[#2563EB] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{country.flag}</span>
                <span className="text-[#6B7280]">{country.name}</span>
              </div>
              <Badge className="bg-[#2563EB] text-white">
                {number.service}
              </Badge>
            </div>

            {/* Phone Number Display */}
            <div className="bg-[#DBEAFE] rounded-lg p-4 sm:p-6 mb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#2563EB] text-lg sm:text-2xl break-all">{number.number}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="hover:bg-white flex-shrink-0"
                >
                  <Copy className="w-5 h-5 text-[#2563EB]" />
                </Button>
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Clock className="w-4 h-4" />
                  <span>Time Remaining</span>
                </div>
                <span className="text-[#2563EB]">{formatTime(timeLeft)}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* SMS Inbox */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-black">SMS Inbox</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Messages */}
          {messages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <MessageSquare className="w-12 h-12 text-[#6B7280] mx-auto mb-3 opacity-50" />
              <p className="text-[#6B7280] mb-2">Waiting for SMS...</p>
              <p className="text-sm text-[#6B7280]">Messages will appear here when received</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((sms) => (
                <Card key={sms.id} className="border border-gray-200 bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-[#6B7280]">From: {sms.from}</span>
                      <span className="text-sm text-[#6B7280]">{sms.timestamp}</span>
                    </div>
                    <p className="text-black">{sms.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-[#FEF3C7] border-[#F59E0B]">
          <CardContent className="pt-4">
            <p className="text-sm text-[#92400E]">
              <strong>Note:</strong> This number will remain active for {formatTime(timeLeft)}. 
              Make sure to complete your verification before the timer expires.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
