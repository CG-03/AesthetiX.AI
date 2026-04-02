import React, { useState, useEffect } from 'react';
import { 
  PenTool, LayoutTemplate, Tag, ArrowLeft, Download, Share2, X, 
  Maximize2, ShoppingCart, Loader2, Sofa, Lamp, Layers, 
  Paintbrush, Wrench, MoreHorizontal, BarChart3, ChevronDown, ChevronUp, KeyRound, HardHat, ExternalLink, Sparkles 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import ProductCard from '../components/ProductCard';
import AnalysisCards from '../components/AnalysisCards';

interface ProjectWorkspaceProps {
  onBack: () => void;
  budget?: number;
  apiResult?: {
    text: string;
    image: string;
    redesignedImage: string;
    nighttimeImage?: string | null;
    products?: any[];
    depthMapImage: string | null;
  } | null;
  cartItems: any[];
  onAddToCart: (product: any) => void;
  onOpenCart: () => void;
  detectedObjects?: any[];
  isDetectingObjects?: boolean;
}

const products = [
  { id: 1, name: 'Vastu AI Velvet Chair', brand: 'Atelier Studio', price: 1240, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop' },
  { id: 2, name: 'Arched Brass Floor Lamp', brand: 'Lumino Co.', price: 850, image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop' },
  { id: 3, name: 'Nordic Oak Coffee Table', brand: 'Hygge Living', price: 490, image: 'https://images.unsplash.com/photo-1533090368676-1fd2548ae20a?w=400&h=300&fit=crop' },
  { id: 4, name: 'Earthen Triptych Art', brand: 'Vastu AI Fine Arts', price: 320, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop' },
];

export default function ProjectWorkspace({ onBack, apiResult, budget = 4500, cartItems, onAddToCart, onOpenCart, detectedObjects = [], isDetectingObjects = false }: ProjectWorkspaceProps) {
  const [renderMode, setRenderMode] = useState<'original' | 'daylight' | 'nighttime'>('daylight');
  const [costMode, setCostMode] = useState<'retail' | 'custom'>('retail');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCollageOpen, setIsCollageOpen] = useState(false);
  const collageRef = React.useRef<HTMLDivElement>(null);
  
  const [remediatePrompt, setRemediatePrompt] = useState("");
  const [isRemediating, setIsRemediating] = useState(false);
  const [showRemediateInput, setShowRemediateInput] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);

  useEffect(() => {
    if (apiResult?.redesignedImage) {
      setActiveImage(apiResult.redesignedImage);
    }
  }, [apiResult]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Vastu AI Redesign',
        text: 'Check out my new room redesign!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCollage = async () => {
    if (!collageRef.current) return;
    try {
      const canvas = await html2canvas(collageRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FBFBF9'
      });
      const link = document.createElement('a');
      link.download = `VastuVision-BeforeAfter-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const executeRemediate = async () => {
    if (!remediatePrompt.trim() || !activeImage) return;
    setIsRemediating(true);
    try {
      const res = await fetch("/api/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: activeImage, // Fix: Send the current redesigned image instead of original
          promptOverrides: remediatePrompt 
        })
      });
      const data = await res.json();
      if (data.redesignedImage) {
        setActiveImage(data.redesignedImage);
      }
    } catch (err) {
      console.error(err);
      alert("Remediation failed. Check console.");
    } finally {
      setIsRemediating(false);
      setShowRemediateInput(false);
      setRemediatePrompt("");
    }
  };

  const getRenderImageStyle = () => {
    // We only rely on CSS fallback if real nighttime rendering payload is missing
    if (renderMode === 'nighttime' && !apiResult?.nighttimeImage) {
      return { filter: 'brightness(0.5) contrast(1.2)' };
    }
    return {};
  };

  const getRenderSrc = () => {
    if (renderMode === 'original') return apiResult?.image || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop";
    if (renderMode === 'nighttime' && apiResult?.nighttimeImage) return apiResult.nighttimeImage;
    return activeImage || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop";
  };

  let displayProducts = apiResult?.products && apiResult.products.length > 0 ? apiResult.products : products;
  
  if (selectedObjectId) {
    const obj = detectedObjects.find(o => o.id === selectedObjectId);
    if (obj) {
      const keywords = obj.label.toLowerCase().split(' ');
      displayProducts = displayProducts.filter(p => 
        p.name.toLowerCase().includes(obj.category.toLowerCase()) || 
        keywords.some(k => k.length > 3 && p.name.toLowerCase().includes(k))
      );
      
      if (displayProducts.length === 0) {
        displayProducts = [{
          id: obj.id * 1000,
          name: `Custom ${obj.style || 'Modern'} ${obj.label}`,
          searchQuery: `${obj.style !== 'matching' ? obj.style : ''} ${obj.color !== 'unknown' ? obj.color : ''} ${obj.label}`.trim(),
          brand: 'Vastu AI Matches',
          price: Math.floor(Math.random() * 400) + 80,
          image: "https://plus.unsplash.com/premium_photo-1661765796030-cf2f4a5fbb5c?w=400&h=300&fit=crop"
        }];
      }
    }
  }

  const selectedObjectLabel = selectedObjectId ? detectedObjects.find(o => o.id === selectedObjectId)?.label : null;

  return (
    <div className="min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F]">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between py-6 px-8 md:px-12 bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Master Bedroom Redo</h1>
            <p className="text-xs text-gray-400 font-medium">Generated Oct 12, 2023</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCollageOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors print:hidden">
            <Tag size={16} /> Before & After
          </button>
          <div className="relative print:hidden">
            <button onClick={onOpenCart} className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <ShoppingCart size={18} />
            </button>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4A6D50] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{cartItems.length}</span>
            )}
          </div>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors print:hidden">
            <Share2 size={16} /> Share
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A6D50] text-white text-sm font-semibold hover:bg-[#3A5640] transition-colors shadow-md print:hidden">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Vision & Renders */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Main Rendering */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <LayoutTemplate size={18} className="text-[#4A6D50]" /> AI Vision Render
              </h2>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setRenderMode('original')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${renderMode === 'original' ? 'bg-white shadow-sm text-[#1F1F1F]' : 'text-gray-500 hover:text-gray-800'}`}>Original</button>
                <button 
                  onClick={() => setRenderMode('daylight')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${renderMode === 'daylight' ? 'bg-white shadow-sm text-[#1F1F1F]' : 'text-gray-500 hover:text-gray-800'}`}>Daylight</button>
                 <button 
                  onClick={() => setRenderMode('nighttime')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${renderMode === 'nighttime' ? 'bg-white shadow-sm text-[#1F1F1F]' : 'text-gray-500 hover:text-gray-800'}`}>Nighttime</button>
              </div>
            </div>

            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group">
              {isRemediating && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 size={32} className="animate-spin mb-4" />
                  <p className="font-bold tracking-widest uppercase text-sm">Applying AI Edits...</p>
                </div>
              )}
              <img 
                src={getRenderSrc()} 
                alt="AI Redesign" 
                className={`w-full h-full object-cover transition-all duration-500 ${isRemediating ? 'scale-105 blur-sm' : ''}`}
                style={getRenderImageStyle()}
                referrerPolicy="no-referrer"
              />

              {/* Render Hotspots */}
              {renderMode !== 'original' && detectedObjects && detectedObjects.length > 0 && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {detectedObjects.map((obj: any) => (
                    <button 
                      key={obj.id}
                      onClick={() => setSelectedObjectId(obj.id === selectedObjectId ? null : obj.id)}
                      className={`absolute border-2 border-dashed transition-all duration-300 cursor-pointer group/hotspot pointer-events-auto rounded-lg
                        ${selectedObjectId === obj.id 
                          ? 'border-[#4A6D50] bg-[#4A6D50]/20 z-20 shadow-[0_0_15px_rgba(74,109,80,0.5)] border-solid' 
                          : 'border-white/50 hover:border-white hover:bg-white/10 z-10'}`}
                      style={{
                        left: `${obj.boundingBox.x}%`,
                        top: `${obj.boundingBox.y}%`,
                        width: `${obj.boundingBox.width}%`,
                        height: `${obj.boundingBox.height}%`
                      }}
                    >
                      <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap transition-opacity duration-300 pointer-events-none
                        ${selectedObjectId === obj.id ? 'opacity-100' : 'opacity-0 group-hover/hotspot:opacity-100'}`}>
                        {obj.label}
                      </div>

                      {selectedObjectId === obj.id && (
                        <div className="absolute top-2 right-2 bg-white text-[#4A6D50] p-1.5 rounded-full shadow-md animate-bounce">
                           <Sparkles size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Detect Objects Loading state overlay */}
              {isDetectingObjects && (
                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> Scanning items...
                </div>
              )}

              {/* Floating Action Button for Remediation */}
              {renderMode !== 'original' && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md print:hidden">
                  {showRemediateInput ? (
                     <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex gap-2 w-full animate-in slide-in-from-bottom-5">
                       <input 
                         type="text" 
                         value={remediatePrompt}
                         onChange={e => setRemediatePrompt(e.target.value)}
                         placeholder="e.g. Change walls to dark blue..." 
                         className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
                         onKeyDown={e => e.key === 'Enter' && executeRemediate()}
                       />
                       <button onClick={executeRemediate} className="bg-[#4A6D50] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                         Update
                       </button>
                       <button onClick={() => setShowRemediateInput(false)} className="text-gray-400 p-2 hover:bg-gray-100 rounded-xl">
                         <X size={16} />
                       </button>
                     </div>
                  ) : (
                    <button 
                      onClick={() => setShowRemediateInput(true)}
                      className="mx-auto bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform text-[#1F1F1F]"
                    >
                      <PenTool size={16} className="text-[#4A6D50]" /> Remediate with AI
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Tag size={18} className="text-[#4A6D50]" /> AI Analysis & Concept
            </h2>
            
            <div className="mb-10">
              {apiResult?.text ? (
                <AnalysisCards text={apiResult.text} />
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 animate-pulse">
                      <Sparkles size={20} className="text-[#4A6D50]" />
                   </div>
                   <p className="text-gray-400 font-medium max-w-[280px] leading-relaxed">
                     Our AI is synthesizing your space... Your Vastu-compliant transformation will appear here shortly.
                   </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Investment & Shoppable List */}
        <div className="lg:col-span-4 flex flex-col gap-8">

          {/* Investment Summary */}
          <div className="bg-[#4A6D50] text-white rounded-[2rem] p-8 shadow-lg shadow-[#4A6D50]/20 relative overflow-hidden transition-all h-[340px] flex flex-col justify-between">
            {/* Background flourish */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Estimated Budget Distribution</h3>
                <p className="text-4xl font-bold tracking-tight">${budget.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1 rounded-lg flex text-[10px] font-bold uppercase shrink-0 print:hidden shadow-inner">
                <button 
                  onClick={() => setCostMode('retail')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300 ${costMode === 'retail' ? 'bg-white text-[#4A6D50] shadow-sm' : 'text-white hover:bg-white/10'}`}>
                    <KeyRound size={12} /> Turnkey
                </button>
                <button 
                  onClick={() => setCostMode('custom')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300 ${costMode === 'custom' ? 'bg-white text-[#4A6D50] shadow-sm' : 'text-white hover:bg-white/10'}`}>
                    <HardHat size={12} /> Material+Labor
                </button>
              </div>
            </div>

            <div className={`space-y-3 overflow-y-auto max-h-[160px] pr-2 transition-all duration-500 ease-in-out relative z-10 custom-scrollbar ${isBreakdownOpen ? 'opacity-100 mb-6' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="pt-2" />
              {costMode === 'retail' ? (
                <>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Sofa size={14} /></div>
                      <span className="text-white/80">Furniture & Decor</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.40).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Layers size={14} /></div>
                      <span className="text-white/80">Flooring</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.20).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Lamp size={14} /></div>
                      <span className="text-white/80">Lighting</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Paintbrush size={14} /></div>
                      <span className="text-white/80">Wall Paint</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.10).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Wrench size={14} /></div>
                      <span className="text-white/80">Labor Costs</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.10).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><MoreHorizontal size={14} /></div>
                      <span className="text-white/80">Miscellaneous</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.05).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                 <>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><BarChart3 size={14} /></div>
                      <span className="text-white/80">Raw Materials</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.45).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Wrench size={14} /></div>
                      <span className="text-white/80">Carpenter & Civil</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.40).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg"><Tag size={14} /></div>
                      <span className="text-white/80">Contingency</span>
                    </div>
                    <span className="font-semibold">${(budget * 0.15).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
              className="w-full bg-white text-[#4A6D50] py-3.5 rounded-xl font-bold shadow-md hover:bg-gray-50 transition-all active:scale-95 text-sm relative z-10 mt-auto flex items-center justify-center gap-2"
            >
              <BarChart3 size={16} />
              {isBreakdownOpen ? 'Hide Detail Breakdown' : 'View Detailed Breakdown'}
              {isBreakdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Sourcing List */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h2 className="font-bold text-lg flex items-center gap-2">
                   {selectedObjectLabel ? `Sourcing: ${selectedObjectLabel}` : 'Top Picks & Sourcing'}
                </h2>
                {selectedObjectLabel && (
                  <button onClick={() => setSelectedObjectId(null)} className="text-xs text-[#4A6D50] hover:underline text-left mt-1 font-bold">
                    Clear SAM Selection &times;
                  </button>
                )}
              </div>
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{displayProducts.length} Items</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {displayProducts.map((p: any) => (
                <ProductCard 
                  key={p.id || Math.random()} 
                  {...p} 
                  amazonLink={`https://www.amazon.in/s?k=${encodeURIComponent(p.searchQuery || p.name)}`}
                  indiaMartLink={`https://www.indiamart.com/search.mp?ss=${encodeURIComponent(p.searchQuery || p.name)}`}
                  onClick3D={() => setSelectedProduct(p)} 
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* 3D Product View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full text-gray-600 hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
              <div className="w-full h-64 md:h-full md:w-1/2 bg-[#FAFAFA] flex items-center justify-center relative group">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                    <Maximize2 size={12} /> Drag to rotate 360°
                  </div>
                </div>
              </div>
              <div className="p-8 w-full md:w-1/2 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A6D50] mb-2">{selectedProduct.brand}</span>
                <h3 className="text-2xl font-bold tracking-tight mb-2">{selectedProduct.name}</h3>
                <p className="text-xl font-bold text-gray-500 mb-6">${selectedProduct.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  Interactive 3D model generated via SAM. Rotate, zoom, and inspect details to ensure it fits perfectly into your space.
                </p>
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => { onAddToCart(selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 bg-[#4A6D50] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#3A5640] transition-colors text-xs uppercase tracking-wider"
                  >
                    Add to Cart
                  </button>
                  <button onClick={() => setSelectedProduct(null)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3.5 rounded-xl hover:border-gray-300 transition-colors text-xs uppercase tracking-wider">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Before & After Collage Modal */}
      {isCollageOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsCollageOpen(false)}>
          <div className="max-w-4xl w-full relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsCollageOpen(false)} 
              className="absolute -top-12 right-0 md:-right-12 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div ref={collageRef} className="bg-white p-6 rounded-[2rem] shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">VastuVision Transformation</h2>
                <p className="text-gray-500 text-sm">Master Bedroom Redo</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <div className="flex-1 aspect-video rounded-xl overflow-hidden relative border border-gray-100">
                  <img src={apiResult?.image || ""} alt="Before" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">Before</div>
                </div>
                <div className="flex-1 aspect-video rounded-xl overflow-hidden relative border border-[#4A6D50]/30">
                  <img src={activeImage || ""} alt="After" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute top-4 left-4 bg-[#4A6D50] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">After</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button className="flex justify-center items-center gap-2 px-8 py-3.5 rounded-xl bg-[#4A6D50] text-white text-sm font-bold shadow-md hover:bg-[#3A5640] transition-all active:scale-95" onClick={handleShare}>
                <Share2 size={16} /> Share Collage
              </button>
              <button className="flex justify-center items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-gray-700 border-2 border-white/20 text-sm font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95" onClick={handleDownloadCollage}>
                <Download size={16} /> Download High-Res
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
