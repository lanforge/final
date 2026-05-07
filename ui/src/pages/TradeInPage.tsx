import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

interface TradeInData {
  _id: string;
  tradeCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  components: {
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    motherboard?: string;
    psu?: string;
    case?: string;
    cooler?: string;
    other?: string;
  };
  tradeInValue?: number;
  status: 'pending' | 'evaluated' | 'accepted' | 'declined' | 'completed';
  notes?: string;
  scannerReport?: {
    reportMetadata?: {
      reportId?: string;
      generatedAt?: string;
      customerInputCode?: string;
      version?: string;
    };
    system?: {
      manufacturer?: string;
      model?: string;
      computerName?: string;
      systemType?: string;
    };
    windows?: {
      caption?: string;
      version?: string;
      buildNumber?: string;
      architecture?: string;
    };
    motherboard?: { manufacturer?: string; product?: string };
    bios?: { manufacturer?: string; version?: string; releaseDate?: string };
    cpu?: Array<{
      name?: string;
      cores?: number;
      logicalProcessors?: number;
      maxClockMHz?: number;
    }>;
    gpu?: Array<{
      name?: string;
      vramGuessGB?: string | number;
      driverVersion?: string;
    }>;
    ram?: {
      totalGB?: number;
      dimmCount?: number;
      memoryTypes?: string[];
      primaryMemoryType?: string;
      moduleLayout?: string;
      ratedSpeedMHz?: number | string;
      configuredSpeedMHz?: number | string;
      modules?: Array<{
        manufacturer?: string;
        partNumber?: string;
        serialNumber?: string;
        capacityGB?: number;
        speedMHz?: number;
        configuredMHz?: number;
        memoryType?: string;
        smbiosMemoryType?: number;
        formFactor?: number;
        slot?: string;
        bank?: string;
      }>;
    };
    storage?: {
      internalStorageTotalGB?: number;
      diskCount?: number;
      internalDiskCount?: number;
      physicalDisks?: Array<{
        model?: string;
        manufacturer?: string;
        serialNumber?: string;
        interfaceType?: string;
        mediaType?: string;
        sizeGB?: number;
        sizeTB?: number;
        status?: string;
        firmware?: string;
        isUSB?: boolean;
        isRemovable?: boolean;
        pnpDeviceId?: string;
      }>;
    };
    warnings?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const TradeInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [step, setStep] = useState<'contact' | 'code' | 'result'>(initialCode ? 'code' : 'contact');
  const [tradeCode, setTradeCode] = useState(initialCode);
  const [tradeInData, setTradeInData] = useState<TradeInData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate a new trade code
  const generateTradeCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TRADE-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setError(null);
    setLoading(true);
    const code = generateTradeCode();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const endpoint = apiUrl.endsWith('/trade-ins') || apiUrl.endsWith('/trade-ins/')
        ? apiUrl
        : `${apiUrl}/trade-ins`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeCode: code,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create trade-in');
      }
      setTradeCode(code);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to create trade-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trade-in data
  const fetchTradeIn = async (code: string, isRefresh = false) => {
    if (!code) return;
    if (!isRefresh) setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const endpoint = apiUrl.endsWith('/trade-ins') || apiUrl.endsWith('/trade-ins/')
        ? `${apiUrl}/${code}`
        : `${apiUrl}/trade-ins/${code}`;
      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched trade-in data:', data);
          setTradeInData(data);
          // Pre-fill extra components from existing data
          if (data.components) {
            setExtraComponents(prev => ({
              psu: data.components.psu || prev.psu,
              case: data.components.case || prev.case,
              cooler: data.components.cooler || prev.cooler,
              other: data.components.other || prev.other,
            }));
          }
          if (data.components && Object.values(data.components).some(v => v)) {
            setStep('result');
          }
          return data;
      } else if (response.status === 404 && !isRefresh) {
        setError('Trade-in not found. Please check your code.');
      }
    } catch (err) {
      if (!isRefresh) setError('An error occurred while fetching trade-in data.');
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    if (tradeCode) {
      navigator.clipboard.writeText(tradeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-refresh when waiting for scanner data
  useEffect(() => {
    if (step === 'code' && tradeCode) {
      if (refreshInterval.current) clearInterval(refreshInterval.current);

      refreshInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchTradeIn(tradeCode, true);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      // Also do an immediate fetch
      fetchTradeIn(tradeCode, true);
    }

    if (step === 'result' && tradeCode && tradeInData) {
      if (refreshInterval.current) clearInterval(refreshInterval.current);

      refreshInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchTradeIn(tradeCode, true);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    };
  }, [step, tradeCode]);

  // Manual component editing state
  const [extraComponents, setExtraComponents] = useState({
    psu: '',
    case: '',
    cooler: '',
    other: '',
  });
  const [componentSaveLoading, setComponentSaveLoading] = useState(false);
  const [componentSaveSuccess, setComponentSaveSuccess] = useState(false);

  // Safely extract a display string from deeply nested WMI data
  const safeString = (val: any): string => {
    if (val === null || val === undefined) return '';
    // Already a primitive
    if (typeof val !== 'object') return String(val);
    
    // Array: dig into first element that has useful data
    if (Array.isArray(val)) {
      for (const item of val) {
        const result = safeString(item);
        if (result) return result;
      }
      return '';
    }
    
    // Object: try common keys in priority order
    const keys = ['name', 'product', 'manufacturer', 'caption', 'description', 'model'];
    for (const key of keys) {
      if (val[key]) {
        const result = safeString(val[key]);
        if (result) return result;
      }
    }
    
    // Last resort: join all primitive values
    const parts = Object.values(val).filter(v => typeof v !== 'object' && v !== null && v !== undefined);
    return parts.join(' ').trim() || '';
  };

  // Handle saving manual component fields
  const handleSaveComponents = async () => {
    setComponentSaveLoading(true);
    setComponentSaveSuccess(false);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const endpoint = apiUrl.endsWith('/trade-ins') || apiUrl.endsWith('/trade-ins/')
        ? apiUrl
        : `${apiUrl}/trade-ins`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeCode,
          components: {
            psu: extraComponents.psu.trim(),
            case: extraComponents.case.trim(),
            cooler: extraComponents.cooler.trim(),
            other: extraComponents.other.trim(),
          },
        }),
      });
      if (!response.ok) throw new Error('Failed to save');
      const data = await response.json();
      setTradeInData(data.tradeIn);
      setComponentSaveSuccess(true);
      setTimeout(() => setComponentSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save components. Please try again.');
    } finally {
      setComponentSaveLoading(false);
    }
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'evaluated': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="container-narrow max-w-3xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Trade-In
              </span>
              {' '}Your PC
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Trade in your PC for credit toward your next build. Start by entering your contact info, then run our scanner to auto-detect your components.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`flex items-center gap-2 ${step === 'contact' ? 'text-cyan-400' : 'text-green-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 'contact' ? 'border-cyan-400 bg-cyan-400/10' : 'border-green-400 bg-green-400/10'}`}>
                {step === 'contact' ? '1' : '✓'}
              </div>
              <span className="text-sm font-medium uppercase tracking-wider">Info</span>
            </div>
            <div className={`w-12 h-[1px] ${step === 'code' ? 'bg-cyan-500' : step === 'result' ? 'bg-green-500' : 'bg-gray-700'}`} />
            <div className={`flex items-center gap-2 ${step === 'code' ? 'text-cyan-400' : step === 'result' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 'code' ? 'border-cyan-400 bg-cyan-400/10' : step === 'result' ? 'border-green-400 bg-green-400/10' : 'border-gray-700'}`}>
                {step === 'result' ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium uppercase tracking-wider">Scan</span>
            </div>
            <div className={`w-12 h-[1px] ${step === 'result' ? 'bg-cyan-500' : 'bg-gray-700'}`} />
            <div className={`flex items-center gap-2 ${step === 'result' ? 'text-cyan-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === 'result' ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-700'}`}>
                3
              </div>
              <span className="text-sm font-medium uppercase tracking-wider">Value</span>
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#0a0a0a] border border-gray-800 rounded-none p-8 mb-8"
          >
            {/* Step 1: Contact Info */}
            {step === 'contact' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Enter Your Information</h2>
                <p className="text-gray-400 text-sm text-center mb-8">We'll need this before generating your trade-in code</p>

                <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-5">
                  <div>
                    <label className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#111] border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111] border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Phone Number (optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#111] border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 text-center">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300 text-lg"
                  >
                    Generate My Code
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Code + Download */}
            {step === 'code' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Your Trade-In Code</h2>
                <p className="text-gray-400 text-sm text-center mb-8">
                  Download the scanner and enter this code to auto-detect your components
                </p>

                {/* Code Display */}
                <div className="bg-[#111] border border-gray-800 p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Trade Code</p>
                      <p className="text-4xl font-mono font-bold text-cyan-400 tracking-wider">{tradeCode}</p>
                    </div>
                    <button
                      onClick={copyCode}
                      className="ml-4 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-white transition-colors duration-300"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Download + Waiting */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <a
                    href="/LANForge-Trade-In.ps1"
                    download
                    className="px-8 py-4 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 text-center text-lg"
                  >
                    Download Scanner
                  </a>
                </div>

                {/* Waiting indicator */}
                <div className="bg-[#111] border border-gray-800 p-6 text-center">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-300 font-medium mb-1">Waiting for Scanner Data...</p>
                  <p className="text-gray-500 text-sm mb-3">
                    Run the scanner, enter code <span className="text-cyan-400 font-mono font-bold">{tradeCode}</span>, and click submit. Auto-refreshes every 10 seconds.
                  </p>
                  <p className="text-gray-500 text-xs">Checking again in {countdown}s</p>
                  <button
                    onClick={() => {
                      setCountdown(10);
                      fetchTradeIn(tradeCode, true);
                    }}
                    className="mt-3 px-4 py-2 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-white transition-colors"
                  >
                    Refresh Now
                  </button>
                </div>

                {/* Info */}
                <div className="mt-6 bg-cyan-500/5 border border-cyan-500/20 p-4">
                  <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2">How to use the scanner:</h4>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Download and run the PowerShell scanner (right-click → Run with PowerShell)</li>
                    <li>Enter trade code <span className="text-cyan-400 font-mono">{tradeCode}</span> in the "Trade / Order Code" field</li>
                    <li>Fill in the same name (<span className="text-cyan-400">{name}</span>) and email (<span className="text-cyan-400">{email}</span>)</li>
                    <li>Click "Scan + Create Reports" then "Submit to API"</li>
                    <li>This page will auto-detect your submission!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 'result' && tradeInData && (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Your Trade-In</h2>
                    <p className="text-gray-400 text-sm">
                      {tradeInData.customerName} &middot; Submitted {new Date(tradeInData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-gray-400">{countdown}s</span>
                    <button
                      onClick={() => {
                        setCountdown(10);
                        fetchTradeIn(tradeCode, true);
                      }}
                      className="ml-2 px-3 py-1 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-white transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Trade Code */}
                <div className="bg-[#111] border border-gray-800 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trade Code</p>
                      <p className="text-2xl font-mono font-bold text-cyan-400">{tradeInData.tradeCode}</p>
                    </div>
                    <button
                      onClick={copyCode}
                      className="px-3 py-1.5 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-white transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-6 text-center">
                  <span className={`inline-block px-5 py-2 border font-bold uppercase tracking-wider ${getStatusColor(tradeInData.status)}`}>
                    {tradeInData.status}
                  </span>
                </div>

                {/* Value */}
                {tradeInData.tradeInValue !== undefined && (
                  <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 p-6 mb-6 text-center">
                    <p className="text-sm text-cyan-400 uppercase tracking-wider mb-1">Estimated Value</p>
                    <p className="text-5xl font-black text-white">${tradeInData.tradeInValue.toFixed(2)}</p>
                  </div>
                )}

                {/* System Report */}
                {(tradeInData.scannerReport) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-center border-t border-gray-800 pt-6 mb-4">System Report</h3>

                    {/* Overview */}
                    <div className="bg-[#111] border border-gray-800 p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {tradeInData.scannerReport.reportMetadata?.reportId && (
                          <div><span className="text-xs text-gray-500 block">Report</span><span className="text-sm text-gray-300">{String(tradeInData.scannerReport.reportMetadata.reportId)}</span></div>
                        )}
                        {tradeInData.scannerReport.system?.computerName && (
                          <div><span className="text-xs text-gray-500 block">Computer</span><span className="text-sm text-gray-300">{String(tradeInData.scannerReport.system.computerName)}</span></div>
                        )}
                        {tradeInData.scannerReport.system?.manufacturer && (
                          <div><span className="text-xs text-gray-500 block">System</span><span className="text-sm text-gray-300">{String(tradeInData.scannerReport.system.manufacturer)} {tradeInData.scannerReport.system.model ? String(tradeInData.scannerReport.system.model) : ''}</span></div>
                        )}
                        {tradeInData.scannerReport.windows?.caption && (
                          <div><span className="text-xs text-gray-500 block">Windows</span><span className="text-sm text-gray-300">{String(tradeInData.scannerReport.windows.caption)}</span></div>
                        )}
                        {tradeInData.scannerReport.bios?.version && (
                          <div><span className="text-xs text-gray-500 block">BIOS</span><span className="text-sm text-gray-300">{tradeInData.scannerReport.bios.manufacturer ? String(tradeInData.scannerReport.bios.manufacturer) : ''} v{String(tradeInData.scannerReport.bios.version)}</span></div>
                        )}
                      </div>
                    </div>

                    {/* CPU */}
                    {(tradeInData.scannerReport.cpu && typeof tradeInData.scannerReport.cpu === 'object' && !Array.isArray(tradeInData.scannerReport.cpu)) ? (
                      // Handle case where cpu is a non-array object
                      <div className="bg-[#111] border border-gray-800 p-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">CPU</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="col-span-2"><span className="text-xs text-gray-500 block">Name</span><span className="text-sm text-gray-300">{safeString((tradeInData.scannerReport.cpu as any) || (tradeInData.scannerReport.cpu as any))}</span></div>
                        </div>
                      </div>
                    ) : tradeInData.scannerReport.cpu?.[0] ? (
                      <div className="bg-[#111] border border-gray-800 p-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">CPU</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="col-span-2"><span className="text-xs text-gray-500 block">Name</span><span className="text-sm text-gray-300">{safeString(tradeInData.scannerReport.cpu[0].name || tradeInData.scannerReport.cpu[0])}</span></div>
                          {tradeInData.scannerReport.cpu[0].cores !== undefined && <div><span className="text-xs text-gray-500 block">Cores / Threads</span><span className="text-sm text-gray-300">{Number(tradeInData.scannerReport.cpu[0].cores)} / {tradeInData.scannerReport.cpu[0].logicalProcessors ?? '?'}</span></div>}
                          {tradeInData.scannerReport.cpu[0].maxClockMHz !== undefined && <div><span className="text-xs text-gray-500 block">Max Clock</span><span className="text-sm text-gray-300">{Number(tradeInData.scannerReport.cpu[0].maxClockMHz)} MHz</span></div>}
                        </div>
                      </div>
                    ) : null}

                    {/* GPU */}
                    {(() => {
                      const gpuList = tradeInData.scannerReport!.gpu;
                      if (!gpuList || gpuList.length === 0) return null;
                      return (
                        <div className="bg-[#111] border border-gray-800 p-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">GPU</h4>
                          {gpuList.map((g, i) => (
                            <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2 last:mb-0">
                              {g.name && <div className="col-span-2"><span className="text-xs text-gray-500 block">Name</span><span className="text-sm text-gray-300">{safeString(g.name)}</span></div>}
                              {g.vramGuessGB !== undefined && <div><span className="text-xs text-gray-500 block">VRAM</span><span className="text-sm text-gray-300">{safeString(g.vramGuessGB)} GB</span></div>}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* RAM */}
                    {(() => {
                      const ramData = tradeInData.scannerReport!.ram;
                      const rawRamText = tradeInData.components?.ram;
                      if (!ramData && !rawRamText) return null;
                      const ramGB = ramData?.totalGB || '';
                      const dimmCount = ramData?.dimmCount || ramData?.modules?.length || 0;
                      return (
                        <div className="bg-[#111] border border-gray-800 p-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            RAM {ramGB ? `- ${safeString(ramGB)} GB` : rawRamText ? `- ${rawRamText}` : ''}
                            {dimmCount > 0 && <span className="ml-2 text-gray-500 font-normal">({dimmCount} DIMM{dimmCount !== 1 ? 's' : ''})</span>}
                          </h4>
                          {ramData?.modules?.map((m, i) => (
                            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/30 p-3 border border-gray-800/50 mb-2 last:mb-0">
                              {m.manufacturer && <div><span className="text-xs text-gray-500 block">Manufacturer</span><span className="text-sm text-gray-300">{safeString(m.manufacturer)}</span></div>}
                              {m.partNumber && <div><span className="text-xs text-gray-500 block">Model</span><span className="text-sm text-gray-300 font-mono text-xs">{safeString(m.partNumber)}</span></div>}
                              {m.capacityGB !== undefined && <div><span className="text-xs text-gray-500 block">Size</span><span className="text-sm text-gray-300">{safeString(m.capacityGB)} GB</span></div>}
                              {m.speedMHz !== undefined && <div><span className="text-xs text-gray-500 block">Speed</span><span className="text-sm text-gray-300">{safeString(m.speedMHz)} MHz</span></div>}
                              {m.slot && <div className="col-span-2"><span className="text-xs text-gray-500 block">Slot</span><span className="text-sm text-gray-300">{safeString(m.slot)}</span></div>}
                            </div>
                          ))}
                          {(!ramData || !ramData.modules || ramData.modules.length === 0) && rawRamText && (
                            <p className="text-sm text-gray-300">{rawRamText}</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Storage */}
                    {(() => {
                      const storageData = tradeInData.scannerReport!.storage;
                      const rawStorageText = tradeInData.components?.storage;
                      if (!storageData && !rawStorageText) return null;
                      const storageGB = storageData?.internalStorageTotalGB || '';
                      return (
                        <div className="bg-[#111] border border-gray-800 p-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Storage {storageGB ? `- ${safeString(Math.round(Number(storageData!.internalStorageTotalGB)))} GB` : rawStorageText ? `- ${rawStorageText}` : ''}</h4>
                          {storageData?.physicalDisks?.map((d, i) => (
                            <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-black/30 p-3 border border-gray-800/50 mb-2 last:mb-0">
                              {d.model && <div><span className="text-xs text-gray-500 block">Model</span><span className="text-sm text-gray-300">{safeString(d.model)}</span></div>}
                              {d.sizeGB !== undefined && <div><span className="text-xs text-gray-500 block">Size</span><span className="text-sm text-gray-300">{d.sizeGB >= 1000 ? `${safeString((d.sizeGB / 1000).toFixed(1))} TB` : `${safeString(Math.round(d.sizeGB))} GB`}</span></div>}
                              {d.mediaType && <div><span className="text-xs text-gray-500 block">Type</span><span className="text-sm text-gray-300">{safeString(d.mediaType)}</span></div>}
                            </div>
                          ))}
                          {(!storageData || !storageData.physicalDisks || storageData.physicalDisks.length === 0) && rawStorageText && (
                            <p className="text-sm text-gray-300">{rawStorageText}</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Motherboard */}
                    {(() => {
                      const mb = tradeInData.scannerReport!.motherboard;
                      if (!mb) return null;
                      const mbText = safeString(mb.manufacturer || '') + (mb.manufacturer && mb.product ? ' ' : '') + safeString(mb.product || '');
                      if (!mbText.trim()) return null;
                      return (
                        <div className="bg-[#111] border border-gray-800 p-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Motherboard</h4>
                          <p className="text-sm text-gray-300">{mbText}</p>
                        </div>
                      );
                    })()}

                    {/* Warnings */}
                    {(() => {
                      const warnings = tradeInData.scannerReport!.warnings;
                      if (!warnings || warnings.length === 0) return null;
                      return (
                        <div className="bg-yellow-500/5 border border-yellow-500/20 p-4">
                          <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">Scanner Warnings</h4>
                          {warnings.map((w, i) => (
                            <p key={i} className="text-sm text-yellow-300/80 mb-1">⚠ {safeString(w)}</p>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Notes */}
                {tradeInData.notes && (
                  <div className="bg-[#111] border border-gray-800 p-4 mt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes from LANForge</h4>
                    <p className="text-sm text-gray-300">{tradeInData.notes}</p>
                  </div>
                )}

                {/* Missing Parts - Manual Input */}
                <div className="border-t border-gray-800 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider text-center mb-1">Missing Parts</h3>
                  <p className="text-gray-500 text-xs text-center mb-6">Add components the scanner couldn't detect</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Power Supply</label>
                      <input
                        type="text"
                        value={extraComponents.psu}
                        onChange={(e) => setExtraComponents(prev => ({ ...prev, psu: e.target.value }))}
                        placeholder="e.g. Corsair RM850x"
                        className="w-full bg-[#111] border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Case</label>
                      <input
                        type="text"
                        value={extraComponents.case}
                        onChange={(e) => setExtraComponents(prev => ({ ...prev, case: e.target.value }))}
                        placeholder="e.g. NZXT H7 Flow"
                        className="w-full bg-[#111] border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">CPU Cooler</label>
                      <input
                        type="text"
                        value={extraComponents.cooler}
                        onChange={(e) => setExtraComponents(prev => ({ ...prev, cooler: e.target.value }))}
                        placeholder="e.g. Noctua NH-D15"
                        className="w-full bg-[#111] border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Other / Notes</label>
                      <input
                        type="text"
                        value={extraComponents.other}
                        onChange={(e) => setExtraComponents(prev => ({ ...prev, other: e.target.value }))}
                        placeholder="e.g. Custom cables, fans..."
                        className="w-full bg-[#111] border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-4">
                    <button
                      onClick={handleSaveComponents}
                      disabled={componentSaveLoading}
                      className="px-6 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {componentSaveLoading ? 'Saving...' : componentSaveSuccess ? '✓ Saved' : 'Save Parts'}
                    </button>
                  </div>
                </div>

                {/* Reset */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => {
                      setStep('contact');
                      setTradeInData(null);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setTradeCode('');
                    }}
                    className="text-gray-500 hover:text-white text-sm uppercase tracking-wider transition-colors"
                  >
                    Start a New Trade-In
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TradeInPage;