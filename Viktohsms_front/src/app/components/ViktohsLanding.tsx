import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  DollarSign,
  Check,
  ChevronRight,
  Menu,
  X,
  Instagram,
  Mail,
  Phone,
  Copy,
  ChevronDown,
  Send,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

interface ViktohsLandingProps {
  onGetStarted: () => void;
}

export default function ViktohsLanding({ onGetStarted }: ViktohsLandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>("");

  const features = [
    { icon: Globe, title: "150+ Countries", desc: "Access numbers worldwide" },
    { icon: Zap, title: "Instant Delivery", desc: "Get numbers in seconds" },
    { icon: DollarSign, title: "Best Pricing", desc: "Affordable rates guaranteed" },
    { icon: Shield, title: "Complete Privacy", desc: "Your data stays secure" },
    { icon: Phone, title: "All Platforms", desc: "Verify any service" },
    { icon: Lock, title: "No Commitments", desc: "Pay as you go" }
  ];

  const platforms = [
    "WhatsApp", "Telegram", "Instagram", "Facebook", "Twitter/X", 
    "TikTok", "Snapchat", "Gmail", "Discord", "LinkedIn",
    "Netflix", "Amazon", "Uber", "PayPal", "Binance"
  ];

  const steps = [
    {
      number: "1",
      title: "Choose Country & Service",
      desc: "Select from 150+ countries and your preferred platform",
      icon: Globe
    },
    {
      number: "2", 
      title: "Get Your Number",
      desc: "Receive your temporary phone number instantly",
      icon: Phone
    },
    {
      number: "3",
      title: "Receive SMS Code",
      desc: "Get verification codes in real-time",
      icon: MessageSquare
    }
  ];

  const faqs = [
    {
      q: "How does Viktohs SMS work?",
      a: "Simply choose a country and service, get a temporary number, and receive SMS verification codes instantly. No registration required for browsing."
    },
    {
      q: "What platforms can I verify?",
      a: "We support 150+ platforms including WhatsApp, Telegram, Instagram, Facebook, TikTok, and many more popular services."
    },
    {
      q: "How much does it cost?",
      a: "Pricing varies by country and service. We offer competitive pay-as-you-go rates with no hidden fees or subscriptions."
    },
    {
      q: "Is my personal information safe?",
      a: "Absolutely. We don't store your personal data, and all temporary numbers are completely anonymous and secure."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F4FF] dark:bg-[#0A0710] transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#120D1E]/80 backdrop-blur-xl border-b border-purple-200/30 dark:border-[#2E2050] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B00FF] to-[#A020F0] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] bg-clip-text text-transparent">
                  Viktohs SMS
                </span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">
                FAQ
              </a>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white rounded-full px-6 shadow-lg shadow-purple-500/30 dark:shadow-purple-900/50"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="flex lg:hidden items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-[#120D1E] border-t border-purple-200/30 dark:border-[#2E2050]"
            >
              <div className="px-4 py-6 space-y-3">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-[#1C1530] rounded-lg">
                  Features
                </a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-[#1C1530] rounded-lg">
                  How It Works
                </a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-[#1C1530] rounded-lg">
                  Pricing
                </a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-[#1C1530] rounded-lg">
                  FAQ
                </a>
                <Button 
                  onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white rounded-full"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - Asymmetric */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#8B00FF]/20 to-[#A020F0]/20 dark:from-[#8B00FF]/10 dark:to-[#A020F0]/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - 55% */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Badge className="bg-[#EDE7FF] dark:bg-[#1C1530] text-[#8B00FF] dark:text-[#BF5FFF] border-0 px-4 py-2">
                ⚡ Trusted by 100,000+ users worldwide
              </Badge>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                  SMS Verification
                </h1>
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] bg-clip-text text-transparent leading-tight">
                  Without Limits
                </h1>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                Get temporary phone numbers from 150+ countries. Verify any account, protect your privacy, and receive SMS codes instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white rounded-full px-8 shadow-xl shadow-purple-500/30 dark:shadow-purple-900/50 text-lg h-14"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-[#8B00FF] text-[#8B00FF] dark:text-[#BF5FFF] hover:bg-[#8B00FF] hover:text-white dark:hover:bg-[#8B00FF] rounded-full px-8 text-lg h-14"
                >
                  See How It Works
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#8B00FF]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Instant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#8B00FF]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#8B00FF]" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Affordable</span>
                </div>
              </div>
            </motion.div>

            {/* Right - 45% */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B00FF]/30 to-[#A020F0]/30 dark:from-[#BF5FFF]/20 dark:to-[#8B00FF]/20 blur-3xl rounded-3xl" />
              
              {/* Dashboard Mockup */}
              <Card className="relative bg-white/90 dark:bg-[#1C1530]/90 backdrop-blur-xl border-2 border-purple-200/50 dark:border-[#2E2050] shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Service</h3>
                    <div className="w-2 h-2 bg-[#8B00FF] rounded-full animate-pulse" />
                  </div>
                  
                  {/* Country Dropdown Mockup */}
                  <div className="bg-[#F8F4FF] dark:bg-[#120D1E] rounded-xl p-4 border border-purple-200/50 dark:border-[#2E2050]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#8B00FF]" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">United States 🇺🇸</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Phone Number Display */}
                  <div className="bg-gradient-to-br from-[#8B00FF] to-[#A020F0] rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="text-xs text-purple-200">Your Number</div>
                      <div className="flex items-center justify-between">
                        <code className="text-xl text-white font-mono">+1 234 567 8900</code>
                        <Copy className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* SMS Code Box */}
                  <div className="bg-[#EDE7FF] dark:bg-[#1C1530] rounded-xl p-4 border-2 border-[#8B00FF]/30">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Verification Code</div>
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-mono font-bold text-[#8B00FF]">123456</code>
                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features - Horizontal Scroll */}
      <section id="features" className="py-20 bg-white dark:bg-[#120D1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <Badge className="bg-[#EDE7FF] dark:bg-[#1C1530] text-[#8B00FF] dark:text-[#BF5FFF] border-0">
              Why Viktohs SMS
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Everything You Need, Nothing You Don't
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="bg-[#EDE7FF]/50 dark:bg-[#1C1530]/50 backdrop-blur-xl border-2 border-purple-200/30 dark:border-[#2E2050] hover:border-[#8B00FF] dark:hover:border-[#BF5FFF] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30 h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B00FF] to-[#A020F0] flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms - Marquee */}
      <section className="py-16 bg-gradient-to-r from-[#8B00FF] to-[#A020F0] dark:from-[#6B00CF] dark:to-[#8010D0] overflow-hidden">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white">Works With 150+ Platforms</h3>
        </div>
        
        {/* First Row - Scroll Left */}
        <div className="flex gap-4 animate-marquee mb-4">
          {[...platforms, ...platforms].map((platform, idx) => (
            <div
              key={`row1-${idx}`}
              className="flex-shrink-0 bg-white dark:bg-[#1C1530] rounded-full px-6 py-3 text-gray-900 dark:text-white font-medium shadow-lg"
            >
              {platform}
            </div>
          ))}
        </div>

        {/* Second Row - Scroll Right */}
        <div className="flex gap-4 animate-marquee-reverse">
          {[...platforms.slice().reverse(), ...platforms.slice().reverse()].map((platform, idx) => (
            <div
              key={`row2-${idx}`}
              className="flex-shrink-0 bg-white/90 dark:bg-[#1C1530]/90 rounded-full px-6 py-3 text-gray-900 dark:text-white font-medium shadow-lg"
            >
              {platform}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section id="how-it-works" className="py-20 bg-[#F8F4FF] dark:bg-[#0A0710]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-[#EDE7FF] dark:bg-[#1C1530] text-[#8B00FF] dark:text-[#BF5FFF] border-0">
              Simple Process
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Get Started in 3 Easy Steps
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B00FF] via-[#A020F0] to-[#C77DFF] hidden lg:block" />

            <div className="space-y-12 lg:space-y-24">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${idx % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                    <Card className="bg-white dark:bg-[#1C1530] border-2 border-purple-200/30 dark:border-[#2E2050] p-6">
                      <div className="space-y-3">
                        <step.icon className="w-12 h-12 text-[#8B00FF] mx-auto lg:mx-0" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {step.desc}
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Timeline Node */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B00FF] to-[#A020F0] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/50">
                      {step.number}
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] hover:from-[#A020F0] hover:to-[#8B00FF] text-white rounded-full px-8 shadow-xl shadow-purple-500/30 dark:shadow-purple-900/50"
            >
              Start Verifying Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white dark:bg-[#120D1E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <Badge className="bg-[#EDE7FF] dark:bg-[#1C1530] text-[#8B00FF] dark:text-[#BF5FFF] border-0">
              Got Questions?
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-[#EDE7FF] dark:bg-[#1C1530] border-2 border-transparent data-[state=open]:border-[#8B00FF] dark:data-[state=open]:border-[#BF5FFF] rounded-xl px-6 transition-all"
              >
                <AccordionTrigger className="text-left text-gray-900 dark:text-white hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-[#8B00FF] via-[#A020F0] to-[#8B00FF] dark:from-[#6B00CF] dark:via-[#8010D0] dark:to-[#6B00CF] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <Send className="absolute top-10 left-10 w-32 h-32 text-white" />
          <Send className="absolute bottom-10 right-10 w-24 h-24 text-white rotate-180" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Verify Without Limits?
            </h2>
            <p className="text-xl text-purple-100">
              Join 100,000+ users. No credit card needed.
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-white text-[#8B00FF] hover:bg-purple-50 rounded-full px-8 shadow-xl text-lg h-14"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8F4FF] dark:bg-[#0A0710] border-t border-purple-200/30 dark:border-[#2E2050] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Col 1 - Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B00FF] to-[#A020F0] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#8B00FF] to-[#A020F0] bg-clip-text text-transparent">
                  Viktohs SMS
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Fast, secure, and reliable SMS verification for everyone.
              </p>
              <div className="flex gap-3">
                <a href="https://t.me/viktohs_store_customer_care" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#EDE7FF] dark:bg-[#1C1530] flex items-center justify-center hover:bg-[#8B00FF] hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
                <a href="https://wa.me/2348133218597" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#EDE7FF] dark:bg-[#1C1530] flex items-center justify-center hover:bg-[#8B00FF] hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Col 2 - Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#features" className="hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Col 3 - Legal */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#8B00FF] dark:hover:text-[#BF5FFF] transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Col 4 - Newsletter */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-[#1C1530] border border-purple-200/50 dark:border-[#2E2050] text-gray-900 dark:text-white focus:outline-none focus:border-[#8B00FF]"
                />
                <Button className="bg-gradient-to-r from-[#8B00FF] to-[#A020F0] text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-purple-200/30 dark:border-[#2E2050] text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Viktohs SMS. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        
        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }

        .animate-marquee:hover,
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}