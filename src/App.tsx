import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditRaxLogo } from './components/Logo';
import { 
  BarChart3, 
  ShieldCheck, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  Lock, 
  Trash2, 
  Download, 
  Send, 
  AlertTriangle,
  Play,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Check,
  ChevronDown
} from 'lucide-react';

// Form interface
interface LeadForm {
  name: string;
  mobile: string;
  email: string;
  message: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  calculatorData?: {
    orders: number;
    aov: number;
    rto: number;
    estimatedLeakage: number;
  } | null;
  timestamp: string;
  emailStatus: string;
  emailError: string | null;
}

export default function App() {
  // Mobile / UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Dropdown menus state
  const [productDropdown, setProductDropdown] = useState(false);
  const [solutionsDropdown, setSolutionsDropdown] = useState(false);
  const [integrationsDropdown, setIntegrationsDropdown] = useState(false);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);

  // Calculator inputs
  const [orders, setOrders] = useState(20000);
  const [aov, setAov] = useState(1500);
  const [rto, setRto] = useState(18);

  // Form State
  const [formData, setFormData] = useState<LeadForm>({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<LeadForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastEmailStatus, setLastEmailStatus] = useState('');

  // Auto scroll utility
  const scrollToContact = (calcMessage?: string) => {
    setCalcOpen(false);
    if (calcMessage) {
      setFormData(prev => ({ ...prev, message: calcMessage }));
    }
    const element = document.getElementById('contact-sales');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculations
  const logisticsOverbilling = orders * aov * 0.015;
  const paymentGatewayLeaks = orders * aov * 0.005;
  const rtoClaimLosses = orders * (rto / 100) * aov * 0.10;
  const totalLeakage = logisticsOverbilling + paymentGatewayLeaks + rtoClaimLosses;

  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
  };

  // Handle Form Validations
  const validateField = (name: keyof LeadForm, value: string) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Full name is required.';
    } else if (name === 'mobile') {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!value) {
        error = 'Mobile number is required.';
      } else if (!phoneRegex.test(value)) {
        error = 'Enter a valid 10-digit mobile number (starting with 6-9).';
      }
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const forbiddenDomains = ['gmail.com', 'icloud.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'live.com', 'aol.com', 'zoho.com'];
      if (!value) {
        error = 'Business email address is required.';
      } else if (!emailRegex.test(value)) {
        error = 'Please enter a valid email structure.';
      } else {
        const domain = value.split('@')[1]?.toLowerCase();
        if (forbiddenDomains.includes(domain)) {
          error = 'Please use your company domain email. Free email providers are restricted.';
        }
      }
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;
    if (name === 'mobile') {
      cleanValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (formErrors[name as keyof LeadForm]) {
      validateField(name as keyof LeadForm, cleanValue);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = validateField('name', formData.name);
    const e2 = validateField('mobile', formData.mobile);
    const e3 = validateField('email', formData.email);

    if (e1 || e2 || e3) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          calculatorData: {
            orders,
            aov,
            rto,
            estimatedLeakage: totalLeakage
          }
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setSubmitSuccess(true);
        setLastEmailStatus(resData.emailStatus);
        setFormData({ name: '', mobile: '', email: '', message: '' });
      } else {
        alert(resData.error || 'Something went wrong. Please check your form fields.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert('Network error. Failed to connect to the backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-gray-800 antialiased bg-gray-50/50 min-h-screen selection:bg-cyan-500 selection:text-white">
      
      {/* HEADER NAVIGATION */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <AuditRaxLogo theme="light" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              
              {/* Product Dropdown */}
              <div className="relative" onMouseEnter={() => setProductDropdown(true)} onMouseLeave={() => setProductDropdown(false)}>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-500 rounded-lg flex items-center gap-1 transition duration-200 focus:outline-none">
                  Product <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${productDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {productDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 origin-top-left"
                    >
                      <a href="#features" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Overview</a>
                      <a href="#pipeline" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Reconciliation</a>
                      <a href="#workflow" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Disputes Hub</a>
                      <a href="#deepdive" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Analytics Engine</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Solutions Dropdown */}
              <div className="relative" onMouseEnter={() => setSolutionsDropdown(true)} onMouseLeave={() => setSolutionsDropdown(false)}>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-500 rounded-lg flex items-center gap-1 transition duration-200 focus:outline-none">
                  Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${solutionsDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {solutionsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 origin-top-left"
                    >
                      <a href="#pipeline" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Logistics & Courier</a>
                      <a href="#deepdive" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Payments Audit</a>
                      <a href="#features" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition">Marketplaces</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Integrations Nested Dropdown */}
              <div className="relative" onMouseEnter={() => setIntegrationsDropdown(true)} onMouseLeave={() => { setIntegrationsDropdown(false); setActiveSubDropdown(null); }}>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-500 rounded-lg flex items-center gap-1 transition duration-200 focus:outline-none">
                  Integrations <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${integrationsDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {integrationsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 origin-top-left"
                    >
                      {[
                        { key: 'market', label: 'Marketplaces', items: ['Amazon', 'Flipkart', 'Myntra', 'Meesho'] },
                        { key: 'gateways', label: 'Payment Gateways', items: ['Razorpay', 'Cashfree', 'PayU', 'CCAvenue'] },
                        { key: 'logistics', label: 'Logistics & Courier', items: ['Delhivery', 'Blue Dart', 'XpressBees', 'Ecom Express'] },
                        { key: 'checkout', label: 'Checkout Partners', items: ['GoKwik', 'Simpl', 'Razorpay Magic'] },
                        { key: 'store', label: 'Storefronts', items: ['Shopify', 'WooCommerce', 'Magento'] }
                      ].map(sub => (
                        <div 
                          key={sub.key} 
                          className="relative group"
                          onMouseEnter={() => setActiveSubDropdown(sub.key)}
                          onMouseLeave={() => setActiveSubDropdown(null)}
                        >
                          <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition text-left focus:outline-none">
                            {sub.label} <span className="text-xs text-gray-400">▸</span>
                          </button>
                          <AnimatePresence>
                            {activeSubDropdown === sub.key && (
                              <motion.div
                                initial={{ opacity: 0, x: -5, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -5, scale: 0.95 }}
                                transition={{ duration: 0.12 }}
                                className="absolute top-0 left-[98%] ml-0.5 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 origin-top-left"
                              >
                                {sub.items.map(item => (
                                  <span key={item} className="block px-4 py-1.5 text-sm text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 cursor-pointer">{item}</span>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a href="#pipeline" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-500 transition duration-200">Resources</a>
              <a href="#faq" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-cyan-500 transition duration-200">Company</a>
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button onClick={() => scrollToContact()} className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg hover:shadow-cyan-500/10 border border-gray-800">
                Book Enterprise Demo
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-cyan-500 focus:outline-none"
                aria-label="Toggle Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-6 space-y-2 shadow-xl absolute w-full left-0 z-50 overflow-hidden"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Product</a>
              <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Solutions</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Integrations</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">FAQ</a>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3 px-4">
                <button onClick={() => { setMobileMenuOpen(false); scrollToContact(); }} className="w-full bg-gray-900 text-white text-center py-3 rounded-lg font-bold shadow-md">
                  Book Enterprise Demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Background Ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-100/30 rounded-full blur-[130px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Copy */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-6 space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50/80 border border-cyan-100/50 text-cyan-700 text-xs font-semibold shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                ✨ AI-Powered Revenue Recovery Platform for Ecommerce
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900 tracking-tight">
                Revenue Loss Is Invisible.<br />
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Until AuditRax Finds It.</span>
              </h1>
              
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Continuous auditing across payments, courier settlements, returns, RTO leakage, and operational mismatches. Built for enterprise ecommerce operations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                <button 
                  onClick={() => scrollToContact()}
                  className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg hover:shadow-cyan-500/10 border border-gray-800 text-center"
                >
                  Book Enterprise Demo →
                </button>
                
                <button 
                  onClick={() => setCalcOpen(true)}
                  className="w-full sm:w-auto bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  See Revenue Calculator 🧮
                </button>
              </div>

              <div className="flex items-center gap-4 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-2.5">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center font-bold text-xs">U1</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center font-bold text-xs">U2</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center font-bold text-xs">U3</div>
                </div>
                <div className="text-sm text-left">
                  <p className="text-gray-500">Trusted by 120+ high-scale</p>
                  <p className="font-semibold text-gray-900">ecommerce brands <span className="text-amber-500">★★★★★</span></p>
                </div>
              </div>
            </motion.div>

            {/* Right Dashboard Mockup */}
<motion.div
  initial={{ opacity: 0, x: 30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, delay: 0.2 }}
  className="lg:col-span-6"
>
  <img
    src="/dashboard-preview.png"
    alt="AuditRax Dashboard"
    className="w-full rounded-[28px] shadow-[0_35px_80px_rgba(0,0,0,0.12)] border border-gray-200"
  />
</motion.div>
          </div>
        </div>
      </section>

      {/* BRAND INTEGRATIONS LOGO LAYER */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Integrates seamlessly with your tech stack</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500">
            <span className="text-xl md:text-2xl font-black text-emerald-600 tracking-tight">Shopify</span>
            <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tighter">amazon</span>
            <span className="text-xl md:text-2xl font-extrabold text-red-600 tracking-wide">DELHIVERY</span>
            <span className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">BLUE DART</span>
            <span className="text-xl md:text-2xl font-bold text-violet-600">Shiprocket</span>
            <span className="text-xl md:text-2xl font-extrabold text-blue-500">Razorpay</span>
          </div>
        </div>
      </section>

      {/* TRUST STATS BAR */}
      <section className="py-12 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "₹12Cr+", label: "Revenue monitored monthly" },
              { value: "98.2%", label: "Settlement accuracy" },
              { value: "12M+", label: "Orders audited monthly" },
              { value: "₹3.2Cr+", label: "Recovered revenue annually" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="space-y-2 group"
              >
                <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight group-hover:text-cyan-400 transition-colors duration-200">{stat.value}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM VS SOLUTION SECTION */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Why Enterprise Brands Choose AuditRax</h2>
            <p className="text-gray-600 text-base leading-relaxed">
              You sell on multiple platforms, ship with various couriers, and collect via different gateways. Manual spreadsheets can't keep up with the complexity. We fix that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* The Problem */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-red-50/50 border border-red-100 rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:shadow-lg transition duration-300"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm">✕</div>
                <h3 className="text-2xl font-extrabold text-gray-900">The Broken System</h3>
                <ul className="space-y-4 text-gray-600 text-sm">
                  {[
                    "Finance teams spend 100+ hours manually matching Excel files.",
                    "Missing claims window for RTO damages due to delayed data.",
                    "Invisible courier overcharging hidden in complex weight slabs.",
                    "1-3% of total GMV lost purely due to operational blind spots."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* The Solution */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="bg-cyan-50/50 border border-cyan-100 rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:shadow-lg transition duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/10 rounded-full blur-2xl" />
              <div className="space-y-6">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm">✓</div>
                <h3 className="text-2xl font-extrabold text-gray-900">The AuditRax Way</h3>
                <ul className="space-y-4 text-gray-700 text-sm">
                  {[
                    "API-first integrations pull data automatically across your stack.",
                    "Machine learning matches 99.9% of ledgers in real-time.",
                    "Automated dispute filing drops claims directly to courier portals.",
                    "Recovered revenue goes straight back to your bank account."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-cyan-600 mt-1 flex-shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* VISION BOX */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 pointer-events-none" />
            <div className="text-cyan-400 text-4xl mb-6 flex justify-center font-serif">“</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-100 leading-relaxed max-w-3xl mx-auto">
              Our vision is simple: To make enterprise e-commerce scale leak-proof. You focus on growing your GMV; we ensure every single rupee of that GMV reaches your bank account.
            </h2>
            <p className="text-cyan-400 mt-6 text-xs uppercase tracking-widest font-bold">— The AuditRax Promise</p>
          </motion.div>
        </div>
      </section>

      {/* PIPELINE INTEGRATION */}
      <section id="pipeline" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            <div className="lg:w-1/3 space-y-4">
              <p className="text-cyan-600 text-xs font-bold uppercase tracking-widest">How it works</p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">End-to-End Visibility. Intelligent Revenue Recovery.</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                AuditRax connects with your entire operations stack, detects leakage using AI, and recovers every rupee you're owed.
              </p>
              <button onClick={() => scrollToContact()} className="text-cyan-600 font-bold flex items-center gap-1.5 hover:gap-2 transition-all">
                Explore the platform <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:w-2/3 w-full">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
                {[
                  { step: "🛒", title: "Storefronts", desc: "Shopify, Amazon, Myntra & more" },
                  { step: "🚚", title: "Courier Layer", desc: "Delhivery, Blue Dart & more" },
                  { step: "💳", title: "Gateways", desc: "Razorpay, Cashfree & more" },
                  { step: "⚙️", title: "OMS / ERP", desc: "Shiprocket, Zoho & more" },
                  { step: "🧠", title: "AuditRax Engine", desc: "AI Matching & Dispute Claims", dark: true }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                    className={`p-5 rounded-2xl border transition duration-300 flex flex-col justify-between h-40 ${
                      item.dark 
                        ? 'bg-gray-900 border-gray-800 text-white shadow-xl shadow-cyan-500/10 md:scale-105' 
                        : 'bg-white border-gray-100 text-gray-800 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl">{item.step}</div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs">{item.title}</h4>
                      <p className={`text-[10px] leading-snug ${item.dark ? 'text-cyan-400' : 'text-gray-400'}`}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DETECT WHAT OTHERS MISS - AI DEEP DIVE */}
      <section id="deepdive" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-950 text-white py-12 px-6 sm:px-12 rounded-3xl grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-84 h-84 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Left Copy */}
            <div className="space-y-6">
              <span className="inline-block bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                AI-Powered
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Detect What Others Miss</h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Our machine learning models parse millions of data rows across multiple data streams to identify financial leakages — effortlessly and in real time.
              </p>
              
              <ul className="grid sm:grid-cols-2 gap-3 text-xs text-gray-300">
                {[
                  "Settlement mismatch detection",
                  "RTO & return policy violation",
                  "Undeclared charges identification",
                  "COD remittance delay detection",
                  "Duplicate shipment detection",
                  "Weight anomaly verification"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => scrollToContact()} className="inline-flex items-center gap-2 bg-transparent border border-gray-800 hover:border-gray-700 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition">
                See All Leakages →
              </button>
            </div>

            {/* Right Mismatch Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-glow relative transform hover:-translate-y-1 transition duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="bg-red-500/15 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 tracking-wider uppercase">High Priority</span>
                <span className="text-[10px] text-gray-500">2 min ago</span>
              </div>
              
              <h3 className="text-sm font-bold text-gray-200 mb-4">Delhivery Settlement Mismatch Detected</h3>
              
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  <p className="text-[9px] text-gray-500 font-semibold uppercase">Expected</p>
                  <p className="text-xs font-extrabold text-gray-200 mt-0.5">₹1,84,200</p>
                </div>
                <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  <p className="text-[9px] text-gray-500 font-semibold uppercase">Received</p>
                  <p className="text-xs font-extrabold text-gray-200 mt-0.5">₹1,76,900</p>
                </div>
                <div className="bg-red-950/20 p-2.5 rounded-xl border border-red-900/30">
                  <p className="text-[9px] text-red-400 font-semibold uppercase">Difference</p>
                  <p className="text-xs font-extrabold text-red-400 mt-0.5">₹7,300</p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-[10px] text-gray-400 mb-4">
                <div>
                  <span className="text-gray-500 block text-[8px] uppercase font-bold">Shipment ID</span>
                  <span className="font-semibold text-gray-300">DLV12345678</span>
                </div>
                <div className="text-right">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">● Dispute Filed</span>
                </div>
              </div>

              <div className="mb-4 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">AI Confidence Match Rate</span>
                  <span className="text-cyan-400 font-bold">96%</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-1" style={{ width: '96%' }} />
                </div>
              </div>

              <button onClick={() => scrollToContact()} className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition">
                View Dispute Details
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* AUTOMATED RECOVERY WORKFLOW */}
      <section id="workflow" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            
            <div className="lg:w-1/3 space-y-4 text-center lg:text-left">
              <p className="text-cyan-600 text-xs font-bold uppercase tracking-widest">Recovery Engine</p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">From Detection To Recovery. Fully Automated.</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                AuditRax doesn't just surface issues, it works automatically in the background to file and close disputes on your behalf.
              </p>
              <button onClick={() => scrollToContact()} className="text-cyan-600 font-bold text-sm hover:underline">
                See automation rules →
              </button>
            </div>

            <div className="lg:w-2/3 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { step: "🔍 Step 1", title: "Detect", desc: "AI parses data streams to flag anomalies immediately." },
                  { step: "⚖️ Step 2", title: "Validate", desc: "Cross-verifies mismatch with proof-of-delivery docs." },
                  { step: "📁 Step 3", title: "File Dispute", desc: "Auto-generates and drops claims into courier portals." },
                  { step: "💰 Step 4", title: "Recover", desc: "Funds directly clear back to your banking ledger accounts." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                    className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-300 text-center space-y-2"
                  >
                    <span className="text-[10px] font-bold text-cyan-600 uppercase bg-cyan-50 px-2.5 py-1 rounded-full">{item.step}</span>
                    <h4 className="font-extrabold text-sm text-gray-800 pt-1">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about integrating AuditRax into your operations.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How long does integration take?",
              a: "Our API-first architecture means integration is entirely plug-and-play. Connecting your Shopify, Amazon, Razorpay, or Logistics accounts takes under 48 hours, with absolutely zero coding required from your engineering team."
            },
            {
              q: "Is my customer and financial data secure?",
              a: "Yes. We operate on bank-grade 256-bit AES encryption. AuditRax is ISO 27001 and SOC-2 Type II compliant. We only require 'read-only' access to your financial ledgers to identify discrepancies, ensuring complete operational safety."
            },
            {
              q: "How does the pricing work?",
              a: "We believe in transparent, scalable costs. We charge a simple, predictable, and nominal flat fee per processed order (e.g., a few rupees per order). There are no hidden setup fees or unpredictable commission percentages."
            },
            {
              q: "Who files the disputes with couriers?",
              a: "AuditRax automatically generates all required documents and proof records needed to raise disputes with courier and payment partners. Simultaneously, the system creates an internal tracking ticket within AuditRax and continuously monitors the case until the disputed amount is successfully credited or the partner officially closes the case."
            }
          ].map((item, idx) => (
            <div key={idx} className="border border-gray-200/80 rounded-2xl bg-white overflow-hidden transition-all duration-200">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-4.5 flex justify-between items-center focus:outline-none"
              >
                <span className="font-bold text-gray-900 text-sm sm:text-base">{item.q}</span>
                <span className="text-cyan-500 font-bold text-xl ml-4">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 text-gray-500 text-xs sm:text-sm leading-relaxed border-t border-gray-50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* LEAD CAPTURE SECTION */}
      <section id="contact-sales" className="py-16 max-w-4xl mx-auto px-4 scroll-mt-24">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-6 sm:p-10 md:p-12 grid md:grid-cols-5 gap-10 items-center relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Info text */}
          <div className="md:col-span-2 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">
              🛡️ Enterprise Ready
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Connect With Our Revenue Experts
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              See exactly where your multi-channel storefronts are leaking capital. Get a tailored audit protocol built for your brand's scale.
            </p>
            
            <div className="space-y-3 text-xs text-gray-500 font-semibold">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" /> No personal emails accepted
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" /> Response within 12 business hours
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" /> NDA guaranteed data safety
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-3 bg-gray-50 border border-gray-100 p-5 sm:p-6 md:p-8 rounded-2xl">
            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs mb-5 space-y-1">
                <p className="font-bold">🎉 Request Received Successfully!</p>
                <p className="text-emerald-700 font-medium leading-relaxed">
                  Our enterprise onboarding engineer will contact your corporate domain address shortly. 
                  {lastEmailStatus === 'simulated_success' && ' (Submissions logged safely in leads file)'}
                </p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full text-sm text-gray-800 bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition ${
                    formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-500'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input 
                    type="text" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className={`w-full text-sm text-gray-800 bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition ${
                      formErrors.mobile ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-500'
                    }`}
                  />
                  {formErrors.mobile && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Work Email ID</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className={`w-full text-sm text-gray-800 bg-white border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition ${
                      formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-cyan-500'
                    }`}
                  />
                  {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</label>
                  <span className="text-[9px] text-gray-400 font-semibold italic">optional</span>
                </div>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3} 
                  placeholder="Tell us about your reconciliation volume..."
                  className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-xl text-sm transition-all shadow-md transform hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Submitting request...' : 'Submit Audit Request →'}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-12 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Logo, Bio */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
    src="/footer-logo.png"
    alt="AuditRax"
    className="h-12 w-auto"
/>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                The premier automated intelligence ledger system checking leaks for massive ecommerce platforms.
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-3 space-y-4 md:pl-8">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest">Product</h5>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="#features" className="hover:text-white transition">Overview</a></li>
                <li><a href="#pipeline" className="hover:text-white transition">Reconciliation</a></li>
                <li><a href="#workflow" className="hover:text-white transition">Disputes Hub</a></li>
                <li><a href="#deepdive" className="hover:text-white transition">Analytics Engine</a></li>
              </ul>
            </div>

            {/* Contact info */}
            <div className="md:col-span-4 space-y-4">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest">Contact Us</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="leading-relaxed">📍 Coimbatore, Tamil Nadu, India</li>
                <li>✉️ <a href="mailto:info@auditrax.in" className="hover:text-white transition">info@auditrax.in</a></li>
                <li>📞 +91 9082348560</li>
              </ul>
              
              <div className="pt-2">
                <div className="inline-flex items-center gap-3 bg-gray-800/40 border border-gray-800 p-3 rounded-xl max-w-xs">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <p className="text-[10px] leading-tight text-gray-400">
                    <span className="font-bold text-gray-200 block">Enterprise Secure</span>
                    ISO 27001 & SOC-2 Type II Compliant with 256-bit encryption.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© 2026 AuditRax Pvt. Ltd. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#features" className="hover:text-white transition">Privacy Policy</a>
              <a href="#pipeline" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>

        </div>
      </footer>

      {/* CALCULATOR MODAL */}
      <AnimatePresence>
        {calcOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row"
            >
              
              <button 
                onClick={() => setCalcOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Inputs Column */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 bg-white space-y-6">
                <div className="inline-flex p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 shadow-sm">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Revenue Leakage Calculator</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Adjust the sliders to evaluate your monthly operational metrics and trace leakages.</p>
                </div>

                <div className="space-y-6 pt-4">
                  {/* Orders Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>Monthly Orders</span>
                      <span className="text-gray-800 font-black">{formatCurrency(orders)}</span>
                    </div>
                    <input 
                      type="range" 
                      min={1000} 
                      max={200000} 
                      step={1000}
                      value={orders}
                      onChange={(e) => setOrders(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  {/* AOV Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>Avg. Order Value (AOV)</span>
                      <span className="text-gray-800 font-black">₹{formatCurrency(aov)}</span>
                    </div>
                    <input 
                      type="range" 
                      min={200} 
                      max={10000} 
                      step={100}
                      value={aov}
                      onChange={(e) => setAov(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  {/* RTO Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>Average RTO Rate</span>
                      <span className="text-gray-800 font-black">{rto}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={1} 
                      max={40} 
                      step={1}
                      value={rto}
                      onChange={(e) => setRto(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Live Outputs Column */}
              <div className="w-full md:w-1/2 bg-gray-900 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                
                <div className="space-y-6 relative z-10">
                  <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Live Estimation</span>
                    <span className="bg-gray-800 text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded border border-gray-700">
                      GMV: ₹{formatCurrency(orders * aov)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">●</span>
                        <span>Logistics Overbilling (Zone/Weight ~1.5%)</span>
                      </div>
                      <span className="font-bold">₹{formatCurrency(logisticsOverbilling)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">●</span>
                        <span>Gateway Leaks (TDR ~0.5%)</span>
                      </div>
                      <span className="font-bold">₹{formatCurrency(paymentGatewayLeaks)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">●</span>
                        <span>RTO Inventory Claim Losses (10% damage rate)</span>
                      </div>
                      <span className="font-bold text-red-400">₹{formatCurrency(rtoClaimLosses)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 relative z-10">
                  <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800">
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest mb-1">Total Monthly Revenue Leakage</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-cyan-400">₹{formatCurrency(totalLeakage)}</span>
                      <span className="text-xs text-gray-500">/ month</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => scrollToContact(`Our estimated monthly revenue leakage is ₹${formatCurrency(totalLeakage)} (Monthly Orders: ${orders}, AOV: ₹${aov}, RTO: ${rto}%). Please share our customized audit report.`)}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-lg hover:shadow-cyan-500/30 text-sm"
                  >
                    Stop This Leakage → Get Audit
                  </button>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
