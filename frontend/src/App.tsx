import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Home,
  IndianRupee,
  Lightbulb,
  PaintBucket,
  Layout,
  ShoppingBag,
  Camera,
  X,
  Loader2,
  ChevronRight,
  Compass,
  MapPin,
  Moon,
  Sun,
  Share2,
  Layers,
  Box,
  Hammer,
  Link as LinkIcon,
  Download,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

// No direct AI initialization needed on frontend

interface DesignResult {
  text: string;
  depthMapImage: string | null;
  redesignedImage: string | null;
  loading: boolean;
  loadingMessage: string;
  error: string | null;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Basic Inputs
  const [style, setStyle] = useState('Modern');
  const [budget, setBudget] = useState('50000');
  const [ownership, setOwnership] = useState('Renter');
  const [roomType, setRoomType] = useState('Bedroom');

  // Advanced Inputs (New Features)
  const [direction, setDirection] = useState('North');
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [pinterestUrl, setPinterestUrl] = useState('');

  const [result, setResult] = useState<DesignResult>({
    text: '',
    depthMapImage: null,
    redesignedImage: null,
    loading: false,
    loadingMessage: '',
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToPortfolio = (e: React.MouseEvent) => {
    e.preventDefault();
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult({ text: '', depthMapImage: null, redesignedImage: null, loading: false, loadingMessage: '', error: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      files.slice(0, 6).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setInspirationImages(prev => [...prev, reader.result as string].slice(0, 6));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const analyzeRoom = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setResult({ text: '', depthMapImage: null, redesignedImage: null, loading: true, loadingMessage: 'Analyzing room structure...', error: null });

    // Simulate the two-step backend process timing for UX
    const timer = setTimeout(() => {
      setResult(prev => ({ ...prev, loadingMessage: 'Generating design...' }));
    }, 15000); 

    const analysisPrompt = `Expert AI Interior Designer: Analyze this ${roomType} in ${style} style. 
    Context: The room faces ${direction}, is located in ${location}, and has a budget of ₹${budget}. 
    The user is a ${ownership}. 
    ${pinterestUrl ? `Inspiration reference: ${pinterestUrl}` : ''}
    Please provide a detailed design analysis, layout suggestions, Vastu-compliant color palette, lighting recommendations, and a rough cost estimation breakdown.`;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          roomType,
          style,
          budget,
          ownership,
          direction,
          location,
          pinterestUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze room');
      }

      const data = await response.json();

      setResult({
        text: data.text || "I couldn't generate a design. Please try another image.",
        depthMapImage: data.depthMapImage,
        redesignedImage: data.redesignedImage,
        loading: false,
        loadingMessage: '',
        error: null
      });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B3541E', '#FFFBF5', '#2D2D2D']
      });

    } catch (err) {
      console.error(err);
      setResult({
        text: '',
        depthMapImage: null,
        redesignedImage: null,
        loading: false,
        loadingMessage: '',
        error: "Failed to analyze image. Please check your connection or try a different image."
      });
    } finally {
      clearTimeout(timer);
      setIsAnalyzing(false);
    }
  };


  const downloadCollage = async () => {
    if (collageRef.current) {
      const canvas = await html2canvas(collageRef.current);
      const link = document.createElement('a');
      link.download = `VastuVision-BeforeAfter-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const reset = () => {
    setImage(null);
    setInspirationImages([]);
    setResult({ text: '', depthMapImage: null, redesignedImage: null, loading: false, loadingMessage: '', error: null });
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] font-sans text-[#2D2D2D]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#F3EFE0]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2D2D2D] rounded-xl flex items-center justify-center shadow-lg">
              <Home className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl tracking-tight">VastuVision <span className="accent-gold">AI</span></h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Virtual Interior Designer</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
            <a href="#" className="text-[#2D2D2D] border-b-2 border-[#B3541E] pb-1">Designer</a>
            <a href="#portfolio" onClick={scrollToPortfolio} className="hover:text-[#2D2D2D] transition-colors pb-1">Portfolio</a>
            <a href="#pricing" onClick={scrollToPricing} className="hover:text-[#2D2D2D] transition-colors pb-1">Pricing</a>
          </nav>
          <button className="bg-[#2D2D2D] text-white text-xs px-6 py-2.5 rounded-full font-bold hover:bg-[#B3541E] transition-all shadow-md hover:shadow-lg active:scale-95">
            Get Pro
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight"
          >
            Design your <br />
            <span className="accent-gold italic">Dream Space</span> independently.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg md:text-xl font-light leading-relaxed"
          >
            A SaaS-based AI virtual designer for homeowners and renters.
            Highly personalized, budget-friendly, and trend-aware design plans.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Controls & Upload */}
          <div className="lg:col-span-5 space-y-8">
            {/* Input Controls Panel */}
            <div className="premium-card p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Layout size={12} className="accent-gold" /> Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="input-premium font-medium"
                  >
                    <option>Bedroom</option>
                    <option>Living Room</option>
                    <option>Kitchen</option>
                    <option>Study Room</option>
                    <option>Office Space</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <PaintBucket size={12} className="accent-gold" /> Design Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="input-premium font-medium"
                  >
                    <option>Modern</option>
                    <option>Minimal</option>
                    <option>Traditional</option>
                    <option>Scandinavian</option>
                    <option>Boho</option>
                    <option>Luxury</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <IndianRupee size={12} className="accent-gold" /> Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50,000"
                    className="input-premium font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Home size={12} className="accent-gold" /> Ownership
                  </label>
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    className="input-premium font-medium"
                  >
                    <option>Renter</option>
                    <option>Owner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Compass size={12} className="accent-gold" /> Facing Direction
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="input-premium font-medium"
                  >
                    <option>North</option>
                    <option>South</option>
                    <option>East</option>
                    <option>West</option>
                    <option>North-East</option>
                    <option>North-West</option>
                    <option>South-East</option>
                    <option>South-West</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <MapPin size={12} className="accent-gold" /> Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="input-premium font-medium"
                  />
                </div>
              </div>

              {/* Aesthetic Taste */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <LinkIcon size={12} className="accent-gold" /> Pinterest Board (Optional)
                  </label>
                  <input
                    type="url"
                    value={pinterestUrl}
                    onChange={(e) => setPinterestUrl(e.target.value)}
                    placeholder="https://pinterest.com/your-board"
                    className="input-premium font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Layers size={12} className="accent-gold" /> Inspiration Images (Up to 6)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {inspirationImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#F3EFE0]">
                        <img src={img} className="w-full h-full object-cover" alt="Inspiration" />
                        <button
                          onClick={() => setInspirationImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {inspirationImages.length < 6 && (
                      <button
                        onClick={() => inspirationInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-[#F3EFE0] flex items-center justify-center text-gray-300 hover:border-[#B3541E] hover:text-[#B3541E] transition-all"
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={inspirationInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleInspirationUpload}
                  />
                </div>
              </div>

              {/* Upload Area */}
              <div className="relative">
                {!image ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video w-full border-2 border-dashed border-[#F3EFE0] rounded-2xl flex flex-col items-center justify-center gap-4 bg-[#FFFCF8] hover:border-[#B3541E] hover:bg-[#B3541E]/5 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Camera className="text-gray-400 group-hover:accent-gold" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700">Upload current room photo</p>
                      <p className="text-xs text-gray-400">JPG, PNG up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-[#F3EFE0]">
                    <img src={image} alt="Room preview" className="w-full h-full object-cover" />
                    <button
                      onClick={reset}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={analyzeRoom}
                disabled={isAnalyzing || !image}
                className="w-full btn-premium flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Processing AI Renders...
                  </>
                ) : (
                  <>
                    <Sparkles className="accent-gold w-5 h-5" />
                    Generate Full Design Package
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 lg:sticky lg:top-32">
            <AnimatePresence mode="wait">
              {result.loading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="premium-card p-12 min-h-[600px] flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-[#F3EFE0] border-t-[#B3541E] rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 accent-gold w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-serif font-bold">{result.loadingMessage || 'Generating Renders...'}</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">We are mapping the physical geometry of your room to ensure original walls, windows, and structures are strictly preserved while generating your new {style}-style overlay.</p>
                  </div>
                  <div className="w-full max-w-xs bg-[#F3EFE0] h-1 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#B3541E]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 20, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              ) : result.text ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="premium-card overflow-hidden"
                >
                  <div className="bg-[#2D2D2D] p-8 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#B3541E] rounded-lg flex items-center justify-center">
                        <Sparkles className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-xl">Design Package</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{style} • {location} • ₹{budget}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                        title="Print Package"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                        title="Share"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-12">
                    {/* Visual Renderings Section */}
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-2xl font-bold flex items-center gap-3">
                          <Camera className="accent-gold w-6 h-6" />
                          Visual Renderings
                        </h4>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {result.depthMapImage && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                              <Box size={14} className="text-blue-400" /> Structure Map (Depth)
                            </div>
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#F3EFE0] shadow-lg">
                              <img src={result.depthMapImage} className="w-full h-full object-cover grayscale" alt="Depth Map" />
                            </div>
                          </div>
                        )}
                        {result.redesignedImage && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                              <Sparkles size={14} className="text-orange-400" /> Final Redesign
                            </div>
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#F3EFE0] shadow-lg group">
                              <img src={result.redesignedImage} className="w-full h-full object-cover" alt="Redesign" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-white text-[#2D2D2D] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                  <Box size={14} /> 3D View (SAM)
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Before & After Collage Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-2xl font-bold flex items-center gap-3">
                          <Layers className="accent-gold w-6 h-6" />
                          Before & After
                        </h4>
                        <button
                          onClick={downloadCollage}
                          className="text-xs font-bold text-[#B3541E] hover:underline flex items-center gap-1"
                        >
                          <Download size={14} /> Download Collage
                        </button>
                      </div>
                      <div ref={collageRef} className="bg-white p-4 rounded-2xl border border-[#F3EFE0] shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <img src={image!} className="w-full h-full object-cover" alt="Before" />
                            <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">Before</div>
                          </div>
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <img src={result.redesignedImage!} className="w-full h-full object-cover" alt="After" />
                            <div className="absolute top-2 left-2 bg-[#B3541E] text-white px-2 py-1 rounded text-[10px] font-bold uppercase">After</div>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Designed by VastuVision AI</p>
                        </div>
                      </div>
                    </div>

                    {/* Cost Estimation Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-[#FFFCF8] rounded-2xl border border-[#F3EFE0] space-y-4">
                        <div className="flex items-center gap-2 font-bold text-[#2D2D2D]">
                          <ShoppingBag className="accent-gold w-5 h-5" /> Ready-Made Route
                        </div>
                        <p className="text-xs text-gray-500">Retail products + local labor (IndiaMart indices).</p>
                        <div className="text-2xl font-serif font-bold text-[#B3541E]">₹{budget}</div>
                        <ul className="text-[10px] space-y-1 text-gray-400">
                          <li>• 70% Furniture & Decor</li>
                          <li>• 20% Labor & Installation</li>
                          <li>• 10% Shipping & Misc</li>
                        </ul>
                      </div>
                      <div className="p-6 bg-[#FFFCF8] rounded-2xl border border-[#F3EFE0] space-y-4">
                        <div className="flex items-center gap-2 font-bold text-[#2D2D2D]">
                          <Hammer className="accent-gold w-5 h-5" /> Custom-Built Route
                        </div>
                        <p className="text-xs text-gray-500">Local carpenter estimate (Material + Labor).</p>
                        <div className="text-2xl font-serif font-bold text-[#2D2D2D]">₹{Math.round(parseInt(budget) * 0.85)}</div>
                        <ul className="text-[10px] space-y-1 text-gray-400">
                          <li>• 60% Raw Materials (Plywood/Laminate)</li>
                          <li>• 40% Carpenter Labor Costs</li>
                          <li>• 15% Savings vs Retail</li>
                        </ul>
                      </div>
                    </div>

                    <div className="prose prose-slate prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#2D2D2D] prose-p:text-gray-600 prose-li:text-gray-600 max-w-none">
                      <ReactMarkdown>{result.text}</ReactMarkdown>
                    </div>

                    <div className="p-8 bg-[#2D2D2D] rounded-3xl text-white space-y-6">
                      <div className="flex items-center gap-3 font-bold text-lg">
                        <CheckCircle2 className="accent-gold w-6 h-6" />
                        Next Steps
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white text-[#2D2D2D] px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#B3541E] hover:text-white transition-all flex items-center justify-center gap-2">
                          <ShoppingBag size={14} /> Buy All Items
                        </button>
                        <button className="bg-white/10 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                          <Share2 size={14} /> Share Design
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : result.error ? (
                <div className="premium-card p-12 text-center space-y-6 border-red-100 bg-red-50/30">
                  <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <X size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-red-900">Analysis Failed</h3>
                    <p className="text-red-700/80 max-w-xs mx-auto">{result.error}</p>
                  </div>
                  <button
                    onClick={reset}
                    className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-all shadow-lg active:scale-95"
                  >
                    Try Another Image
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-16 border-2 border-dashed border-[#F3EFE0] rounded-[2.5rem] bg-white/30 backdrop-blur-sm">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-8 border border-[#F3EFE0]">
                    <Camera className="text-gray-200 w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-400">Design preview</h3>
                  <p className="text-gray-400 mt-3 max-w-xs leading-relaxed">Upload a photo of your room to see your personalized Indian modern redesign plan with Daylight & Nighttime renders.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Portfolio Section */}
      <section ref={portfolioRef} id="portfolio" className="max-w-7xl mx-auto mt-32 space-y-16 px-6">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Design Portfolio</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-light">
            Explore real transformations curated for Indian homes. Budget-friendly, renter-approved, and Vastu-compliant.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {[
            {
              room: "Compact Living Room",
              location: "Mumbai",
              style: "Modern Boho",
              budget: "₹35,000",
              image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
              improvements: ["Vertical storage optimization", "Multi-functional seating", "Natural light enhancement"],
              furniture: ["Jute rug", "Floor cushions", "Wall-mounted bamboo shelves"],
              lighting: ["Warm LED strips", "Rattan floor lamp"],
              decor: ["Macrame wall hanging", "Areca palms in terracotta pots"]
            },
            {
              room: "Renter's Bedroom",
              location: "Bangalore",
              style: "Scandinavian Minimal",
              budget: "₹25,000",
              image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
              improvements: ["Peel-and-stick accent wall", "Modular wardrobe system", "Layered textile strategy"],
              furniture: ["IKEA metal bed frame", "Slim-leg oak bedside table"],
              lighting: ["Pendant light with Edison bulb", "Smart dimmable bulbs"],
              decor: ["Abstract line art", "Neutral linen curtains", "Cotton waffle throw"]
            },
            {
              room: "Small Balcony Garden",
              location: "Delhi",
              style: "Traditional Zen",
              budget: "₹12,000",
              image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
              improvements: ["Artificial turf installation", "Vertical herb garden", "Weatherproof seating"],
              furniture: ["Foldable acacia wood chairs", "Compact bistro table"],
              lighting: ["Solar-powered fairy lights", "Brass hanging lanterns"],
              decor: ["Terracotta planters", "Bamboo privacy screen", "Colorful ethnic cushions"]
            },
            {
              room: "Home Office Nook",
              location: "Pune",
              style: "Industrial Modern",
              budget: "₹20,000",
              image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&q=80&w=800",
              improvements: ["Ergonomic zone definition", "Integrated cable management", "Task-focused lighting"],
              furniture: ["Minimalist metal desk", "High-back ergonomic mesh chair"],
              lighting: ["Adjustable swing-arm desk lamp", "Warm track lighting"],
              decor: ["Metal grid mood board", "Concrete desk organizers", "Framed motivational typography"]
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="premium-card overflow-hidden group"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.image}
                  alt={item.room}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#B3541E]">
                  {item.style}
                </div>
                <div className="absolute bottom-4 right-4 bg-[#2D2D2D]/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Budget: {item.budget}
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">{item.room}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.location}</p>
                  </div>
                  <button className="accent-gold hover:scale-110 transition-transform">
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#B3541E] flex items-center gap-2">
                      <Sparkles size={12} /> Improvements
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {item.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#B3541E]">•</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#B3541E] flex items-center gap-2">
                      <ShoppingBag size={12} /> Furniture
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {item.furniture.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#B3541E]">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#B3541E] flex items-center gap-2">
                      <Lightbulb size={12} /> Lighting
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {item.lighting.map((l, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#B3541E]">•</span> {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#B3541E] flex items-center gap-2">
                      <PaintBucket size={12} /> Decor
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {item.decor.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#B3541E]">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="max-w-7xl mx-auto mt-32 space-y-16 px-6">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-light">
            Choose the plan that fits your design journey. From quick inspiration to full-scale home transformations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Free Plan",
              price: "₹0",
              period: "/month",
              bestFor: "Casual explorers and quick inspiration.",
              features: [
                "1 Room redesign per month",
                "Basic AI layout recommendations",
                "Furniture & decor suggestions",
                "Renter-friendly modification guidance",
                "Shopping checklist generation"
              ],
              cta: "Get Started",
              highlight: false
            },
            {
              name: "Smart Plan",
              price: "₹199",
              period: "/month",
              bestFor: "Homeowners and serious renters.",
              features: [
                "5 Room redesigns per month",
                "Advanced AI layout recommendations",
                "Budget optimization insights",
                "Vastu-aware placement suggestions",
                "Downloadable PDF report export",
                "All Free features included"
              ],
              cta: "Upgrade to Smart",
              highlight: true
            },
            {
              name: "Pro Plan",
              price: "₹499",
              period: "/month",
              bestFor: "Design enthusiasts and professionals.",
              features: [
                "Unlimited Room redesigns",
                "Before/after visual preview support",
                "Priority AI processing",
                "Detailed budget optimization insights",
                "Premium Vastu-aware placement suggestions",
                "All Smart features included"
              ],
              cta: "Go Pro",
              highlight: false
            }
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`premium-card p-10 flex flex-col space-y-8 relative ${plan.highlight ? 'border-[#B3541E] ring-1 ring-[#B3541E]/20' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B3541E] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold">{plan.name}</h3>
                <p className="text-gray-400 text-xs font-medium">{plan.bestFor}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm font-medium">{plan.period}</span>
              </div>

              <div className="flex-grow space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">What's included</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle2 size={18} className="text-[#B3541E] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-4 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 ${plan.highlight ? 'bg-[#B3541E] text-white hover:bg-[#2D2D2D]' : 'bg-[#2D2D2D] text-white hover:bg-[#B3541E]'}`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center p-8 bg-[#FFFCF8] rounded-[2rem] border border-[#F3EFE0]">
          <p className="text-gray-600 font-medium">
            Transform your home with professional-grade AI design tools.
            <span className="text-[#B3541E] ml-2 font-bold cursor-pointer hover:underline">Upgrade to unlock the full potential of VastuVision AI.</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F3EFE0] py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2D2D2D] rounded-xl flex items-center justify-center shadow-md">
              <Home className="text-white w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight">VastuVision AI</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">© 2026 VastuVision AI. Modern Indian Living.</p>
          <div className="flex gap-10 text-gray-400 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-[#2D2D2D] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#2D2D2D] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#2D2D2D] transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #F3EFE0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B3541E;
        }
      `}</style>
    </div>
  );
}
