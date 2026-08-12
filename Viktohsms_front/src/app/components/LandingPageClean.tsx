import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/b077b0a8da7b0daf28666392632927d24eb0ebd0.png';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Clock,
  CheckCircle2,
  MessageSquare,
  Lock,
  Sparkles,
  DollarSign,
  Play,
  Check,
  ChevronRight,
  Menu,
  Twitter,
  Facebook,
  Instagram,
  Mail
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <ImageWithFallback 
                src={logoImage} 
                alt="SMS Legit Logo" 
                className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">How It Works</a>
              <a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">FAQ</a>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
              <ThemeToggle />
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Access all sections and features of SMS Legit
                  </SheetDescription>
                  
                  <div className="flex flex-col gap-4 mt-8">
                    <a 
                      href="#features" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Features</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </a>
                    <a 
                      href="#how-it-works" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      <Play className="w-5 h-5" />
                      <span>How It Works</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </a>
                    <a 
                      href="#faq" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>FAQ</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </a>
                    
                    <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>
                    
                    <Button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onGetStarted();
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-black dark:to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 mb-6 sm:mb-8"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Trusted by 100,000+ users worldwide</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 sm:mb-6 text-black dark:text-white"
            >
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2">SMS Verification</span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                Without Limits
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
            >
              Get temporary phone numbers from <span className="text-black dark:text-white">150+ countries</span>. 
              Verify any account, protect your privacy, and receive SMS codes instantly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
            >
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl shadow-blue-500/30 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Hero Visual - Social Media Icons Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-5xl mx-auto mb-8 sm:mb-12"
            >
              <div className="relative p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900/50 dark:to-blue-950/30 border-2 border-blue-100 dark:border-blue-900/50 shadow-2xl">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}></div>
                </div>

                {/* Main Content */}
                <div className="relative grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                  {[
                    { icon: Twitter, name: 'Twitter', color: 'from-[#1DA1F2] to-[#0d8bd9]' },
                    { icon: Facebook, name: 'Facebook', color: 'from-[#1877F2] to-[#0e5fc7]' },
                    { icon: Instagram, name: 'Instagram', color: 'from-pink-500 to-purple-600' },
                    { icon: MessageSquare, name: 'WhatsApp', color: 'from-green-500 to-green-600' },
                    { icon: Mail, name: 'Telegram', color: 'from-blue-500 to-blue-600' },
                    { icon: MessageSquare, name: 'Discord', color: 'from-indigo-500 to-indigo-600' },
                    { icon: Globe, name: 'TikTok', color: 'from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300' },
                    { icon: MessageSquare, name: 'Signal', color: 'from-blue-600 to-blue-700' },
                    { icon: Globe, name: 'LinkedIn', color: 'from-[#0077B5] to-[#005a8a]' },
                    { icon: Mail, name: 'Gmail', color: 'from-red-500 to-red-600' },
                    { icon: Globe, name: 'Yahoo', color: 'from-purple-600 to-purple-700' },
                    { icon: MessageSquare, name: 'Viber', color: 'from-purple-500 to-purple-600' },
                    { icon: Globe, name: 'Amazon', color: 'from-orange-500 to-orange-600' },
                    { icon: Globe, name: 'eBay', color: 'from-yellow-500 to-yellow-600' },
                    { icon: MessageSquare, name: 'WeChat', color: 'from-green-600 to-green-700' },
                  ].map((platform, index) => {
                    const Icon = platform.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.7 + (index * 0.05),
                          type: "spring",
                          stiffness: 100
                        }}
                        className="group"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${platform.color} p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer`}>
                            <Icon className="w-full h-full text-white" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {platform.name}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Center Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-full p-4 sm:p-6 shadow-2xl border-4 border-blue-500 dark:border-blue-400">
                    <div className="flex flex-col items-center gap-1">
                      <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">150+</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Services</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Free trial</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No credit card</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Setup in</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">60 seconds</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cancel</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">anytime</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50">
                Why Choose SMS Legit
              </Badge>
              <h2 className="mb-3 sm:mb-4 text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl">
                Everything You Need for SMS Verification
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Fast, secure, and affordable phone verification for all your needs
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Globe,
                title: "150+ Countries",
                description: "Access phone numbers from virtually every country worldwide.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Zap,
                title: "Instant Delivery",
                description: "Receive SMS codes in seconds, not minutes.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: DollarSign,
                title: "Best Pricing",
                description: "Up to 60% cheaper than competitors. Pay only for what you use.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Complete Privacy",
                description: "Your personal number stays private and protected.",
                gradient: "from-purple-500 to-indigo-500"
              },
              {
                icon: MessageSquare,
                title: "All Platforms",
                description: "Verify Twitter, Facebook, Instagram, WhatsApp, and 145+ more apps.",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                icon: CheckCircle2,
                title: "No Commitments",
                description: "Free trial with no credit card required. Cancel anytime.",
                gradient: "from-teal-500 to-cyan-500"
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-gray-100 dark:border-gray-900 hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:shadow-xl group">
                    <CardContent className="p-5 sm:p-6">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl text-black dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50">
                Simple Process
              </Badge>
              <h2 className="mb-3 sm:mb-4 text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl">
                Get Started in 3 Easy Steps
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Start verifying accounts in less than a minute
              </p>
            </motion.div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {[
              {
                step: "1",
                title: "Choose a Country & Service",
                description: "Select from 150+ countries and the platform you want to verify (Twitter, WhatsApp, etc.)",
                icon: Globe
              },
              {
                step: "2",
                title: "Get Your Number",
                description: "Receive a temporary phone number instantly. Use it for verification on your chosen platform.",
                icon: MessageSquare
              },
              {
                step: "3",
                title: "Receive SMS Code",
                description: "Your verification code appears in your dashboard within seconds. Copy and verify!",
                icon: CheckCircle2
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-2 border-gray-100 dark:border-gray-900 hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:shadow-lg overflow-hidden">
                    <CardContent className="p-5 sm:p-6 flex items-start gap-4 sm:gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xl sm:text-2xl shadow-lg">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                          <h3 className="text-lg sm:text-xl text-black dark:text-white">{step.title}</h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-8 sm:ml-9">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-8 sm:mt-10"
          >
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl shadow-blue-500/30 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
            >
              Start Verifying Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50">
                Got Questions?
              </Badge>
              <h2 className="mb-3 sm:mb-4 text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Everything you need to know about SMS Legit
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              <AccordionItem value="item-1" className="border-2 border-gray-100 dark:border-gray-900 rounded-xl px-4 sm:px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <AccordionTrigger className="text-base sm:text-lg text-black dark:text-white hover:no-underline py-4 sm:py-5">
                  How does SMS Legit work?
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pb-4 sm:pb-5">
                  SMS Legit provides temporary phone numbers from 150+ countries. You select a country and service (like Twitter or WhatsApp), 
                  receive a number instantly, use it for verification, and the SMS code appears in your dashboard within seconds.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-2 border-gray-100 dark:border-gray-900 rounded-xl px-4 sm:px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <AccordionTrigger className="text-base sm:text-lg text-black dark:text-white hover:no-underline py-4 sm:py-5">
                  What platforms can I verify?
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pb-4 sm:pb-5">
                  You can verify 150+ platforms including Twitter, Facebook, Instagram, WhatsApp, Telegram, TikTok, Discord, Google, 
                  Microsoft, dating apps, crypto exchanges, and many more. We support virtually all major online services.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-2 border-gray-100 dark:border-gray-900 rounded-xl px-4 sm:px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <AccordionTrigger className="text-base sm:text-lg text-black dark:text-white hover:no-underline py-4 sm:py-5">
                  How much does it cost?
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pb-4 sm:pb-5">
                  We use a pay-as-you-go wallet system. You only pay for the numbers you use, with prices starting from as low as ₦50. 
                  There are no monthly fees, subscriptions, or hidden charges. We're up to 60% cheaper than competitors.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-2 border-gray-100 dark:border-gray-900 rounded-xl px-4 sm:px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <AccordionTrigger className="text-base sm:text-lg text-black dark:text-white hover:no-underline py-4 sm:py-5">
                  Is my personal information safe?
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pb-4 sm:pb-5">
                  Absolutely! SMS Legit is designed to protect your privacy. We don't require your personal phone number, and all temporary 
                  numbers are completely separate from your identity. We use bank-level encryption to protect all data.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-2 border-gray-100 dark:border-gray-900 rounded-xl px-4 sm:px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <AccordionTrigger className="text-base sm:text-lg text-black dark:text-white hover:no-underline py-4 sm:py-5">
                  Can I get a refund if the number doesn't work?
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pb-4 sm:pb-5">
                  Yes! If you don't receive an SMS code within the valid period, you can cancel the activation and receive a full refund 
                  to your wallet automatically. We only charge for successful verifications.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-2 border-gray-100 dark:border-gray-900 rounded-xl px-4 sm:px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                <AccordionTrigger className="text-base sm:text-lg text-black dark:text-white hover:no-underline py-4 sm:py-5">
                  How long does it take to receive SMS codes?
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 pb-4 sm:pb-5">
                  Most SMS codes arrive within 10-30 seconds. In rare cases, it may take up to 2-3 minutes depending on the service provider. 
                  Our dashboard automatically checks for new codes every 3 seconds, so you'll see them instantly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-600 dark:from-blue-700 dark:via-blue-800 dark:to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 sm:mb-6 text-white text-2xl sm:text-3xl lg:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join 100,000+ users who trust SMS Legit for their verification needs. 
              Start your free trial today, no credit card required.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-600 shadow-xl px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 bg-black dark:bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <ImageWithFallback 
              src={logoImage} 
              alt="SMS Legit Logo" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <span className="text-gray-700">•</span>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <span className="text-gray-700">•</span>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <span className="text-gray-700">•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-gray-700">•</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p className="mb-1">© 2025 SMS Legit. All rights reserved.</p>
              <p className="text-xs">Instant SMS verification for 150+ countries and platforms.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
