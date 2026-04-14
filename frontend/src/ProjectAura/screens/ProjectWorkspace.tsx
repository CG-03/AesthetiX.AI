import React, { useState, useEffect } from 'react';
import {
  PenTool, LayoutTemplate, Tag, ArrowLeft, Download, Share2, X,
  Maximize2, ShoppingCart, Loader2, Sofa, Lamp, Layers,
  Paintbrush, Wrench, MoreHorizontal, BarChart3, ChevronDown, ChevronUp, ChevronRight, KeyRound, HardHat, ExternalLink, Sparkles, Image as ImageIcon, Sun, Moon, Scan, Save, Check
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
  onSaveProject: () => void;
  geoCity?: string;
}

const products = [
  { id: 1, name: 'Vastu AI Velvet Chair', brand: 'Atelier Studio', price: 1240, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop' },
  { id: 2, name: 'Arched Brass Floor Lamp', brand: 'Lumino Co.', price: 850, image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop' },
  { id: 3, name: 'Nordic Oak Coffee Table', brand: 'Hygge Living', price: 490, image: 'https://images.unsplash.com/photo-1533090368676-1fd2548ae20a?w=400&h=300&fit=crop' },
  { id: 4, name: 'Earthen Triptych Art', brand: 'Vastu AI Fine Arts', price: 320, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop' },
];

export default function ProjectWorkspace({ onBack, apiResult, budget = 4500, cartItems, onAddToCart, onOpenCart, detectedObjects = [], isDetectingObjects = false, onSaveProject, geoCity }: ProjectWorkspaceProps) {
  const [renderMode, setRenderMode] = useState<'original' | 'daylight' | 'nighttime' | 'labelled'>('daylight');
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

  // Product Search States
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [activeLabel, setActiveLabel] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

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

  const handleLabelClick = async (e: React.MouseEvent, obj: any) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setSelectedObjectId(obj.id);
      setActiveLabel(obj);
      setShowProductPopup(true);
      setIsSearchingProduct(true);
      setSearchResult(null);

      const res = await fetch("/api/search-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: obj.label,
          color: obj.color,
          style: obj.style,
          material: obj.material || "standard",
          location: geoCity || "India"
        })
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      console.error("Label Click/Search failed:", err);
      alert(`Label Click Error: ${err.message}`);
    } finally {
      setIsSearchingProduct(false);
    }
  };

  const formatImageSrc = (src?: string | null) => {
    if (!src) return "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop";
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    return `data:image/jpeg;base64,${src}`;
  };

  const getRenderImageStyle = () => {
    // We only rely on CSS fallback if real nighttime rendering payload is missing
    if (renderMode === 'nighttime' && !apiResult?.nighttimeImage) {
      return { filter: 'brightness(0.5) contrast(1.2)' };
    }
    return {};
  };

  const getRenderSrc = () => {
    if (renderMode === 'original') return formatImageSrc(apiResult?.image);
    if (renderMode === 'nighttime' && apiResult?.nighttimeImage) return formatImageSrc(apiResult.nighttimeImage);
    return formatImageSrc(activeImage);
  };

  let displayProducts = apiResult?.products && apiResult.products.length > 0 ? apiResult.products : products;

  if (selectedObjectId) {
    const obj = detectedObjects.find(o => o.id === selectedObjectId);
    if (obj) {
      const keywords = (obj.label || "").toLowerCase().split(' ');
      const category = (obj.category || "").toLowerCase();
      displayProducts = displayProducts.filter(p => {
        const pName = (p.name || "").toLowerCase();
        return (category && pName.includes(category)) ||
          keywords.some((k: string) => k.length > 3 && pName.includes(k));
      });

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
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F0E0D] font-sans text-[#1F1F1F] dark:text-[#F5F0E8] transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between py-6 px-8 md:px-12 bg-white dark:bg-[#1A1816] sticky top-0 z-50 border-b border-gray-100 dark:border-[#3A3632] transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-gray-200 dark:border-[#3A3632] flex items-center justify-center text-gray-400 dark:text-[#6B6460] hover:bg-gray-50 dark:hover:bg-[#2E2B28] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#F5F0E8]">Master Bedroom Redo</h1>
            <p className="text-xs text-gray-400 dark:text-[#6B6460] font-medium">Generated Oct 12, 2023</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCollageOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#3A3632] text-sm font-semibold text-gray-500 dark:text-[#A89F94] hover:bg-gray-50 dark:hover:bg-[#2E2B28] transition-colors print:hidden">
            <Tag size={16} /> Before & After
          </button>
          <div className="relative print:hidden">
            <button onClick={onOpenCart} className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-[#3A3632] text-gray-500 dark:text-[#A89F94] hover:bg-gray-50 dark:hover:bg-[#2E2B28] transition-colors">
              <ShoppingCart size={18} />
            </button>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B3541E] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{cartItems.length}</span>
            )}
          </div>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#3A3632] text-sm font-semibold text-gray-500 dark:text-[#A89F94] hover:bg-gray-50 dark:hover:bg-[#2E2B28] transition-colors print:hidden">
            <Share2 size={16} /> Share
          </button>
          <button 
            onClick={async () => {
              setIsSaving(true);
              await onSaveProject();
              setIsSaving(false);
              setHasSaved(true);
              setTimeout(() => setHasSaved(false), 3000);
            }}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm print:hidden ${hasSaved ? 'bg-green-500 text-white' : 'bg-white dark:bg-[#1A1816] text-[#B3541E] border border-gray-100 dark:border-[#3A3632] hover:bg-gray-50 dark:hover:bg-[#2E2B28]'}`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : hasSaved ? <Check size={16} /> : <Save size={16} />}
            {hasSaved ? 'Saved to Cloud' : 'Save Project'}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B3541E] text-white text-sm font-semibold hover:bg-[#8E4318] transition-colors shadow-lg shadow-[#B3541E]/20 print:hidden">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Vision & Renders */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Main Rendering */}
          <div className="bg-white dark:bg-[#1A1816] rounded-[2rem] p-6 border border-gray-100 dark:border-[#3A3632] shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-[#F5F0E8]">
                <LayoutTemplate size={18} className="text-[#B3541E]" /> AI Vision Render
              </h2>
              <div className="flex bg-gray-100 dark:bg-[#0F0E0D] p-1 rounded-xl">
                <button
                  onClick={() => setRenderMode('original')}
                  className={`p-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${renderMode === 'original' ? 'bg-white dark:bg-[#1A1816] shadow-sm text-[#1F1F1F] dark:text-[#F5F0E8]' : 'text-gray-500 hover:text-gray-800 dark:text-[#6B6460] dark:hover:text-[#A89F94]'}`}
                  title="Original Image"
                >
                  <ImageIcon size={16} /> <span className="font-semibold hidden sm:inline">Original</span>
                </button>
                <button
                  onClick={() => setRenderMode('daylight')}
                  className={`p-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${renderMode === 'daylight' ? 'bg-white dark:bg-[#1A1816] shadow-sm text-[#1F1F1F] dark:text-[#F5F0E8]' : 'text-gray-500 hover:text-gray-800 dark:text-[#6B6460] dark:hover:text-[#A89F94]'}`}
                  title="Daylight Render"
                >
                  <Sun size={16} /> <span className="font-semibold hidden sm:inline">Daylight</span>
                </button>
                <button
                  onClick={() => setRenderMode('nighttime')}
                  className={`p-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${renderMode === 'nighttime' ? 'bg-white dark:bg-[#1A1816] shadow-sm text-[#1F1F1F] dark:text-[#F5F0E8]' : 'text-gray-500 hover:text-gray-800 dark:text-[#6B6460] dark:hover:text-[#A89F94]'}`}
                  title="Nighttime Render"
                >
                  <Moon size={16} /> <span className="font-semibold hidden sm:inline">Nightlight</span>
                </button>
                <button
                  onClick={() => setRenderMode('labelled')}
                  className={`p-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${renderMode === 'labelled' ? 'bg-white dark:bg-[#1A1816] shadow-sm text-[#B3541E]' : 'text-gray-500 hover:text-gray-800 dark:text-[#6B6460] dark:hover:text-[#A89F94]'}`}
                  title="Labelled Objects"
                >
                  <Scan size={16} /> <span className="font-semibold hidden sm:inline">Labelled</span>
                </button>
              </div>
            </div>

            <div className="aspect-video bg-gray-100 dark:bg-[#0F0E0D] rounded-2xl overflow-hidden relative group transition-colors border border-transparent dark:border-[#3A3632]">
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

              {/* Floating Labels (Replacing SAM Hotspots) */}
              {renderMode !== 'original' && detectedObjects && detectedObjects.length > 0 && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {detectedObjects.map((obj: any, index: number) => {
                    const isSelected = selectedObjectId === obj.id;
                    // Simple offset logic for overlapping labels
                    const offset = (index % 3) * 5;

                    return (
                      <div
                        key={obj.id}
                        className="absolute pointer-events-auto transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${obj.boundingBox.x}%`,
                          top: `${obj.boundingBox.y + (isSelected ? 0 : offset)}%`,
                          zIndex: isSelected ? 50 : 30
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleLabelClick(e, obj)}
                          className={`group flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 shadow-lg whitespace-nowrap
                            ${isSelected
                              ? 'bg-[#B3541E] border-[#B3541E] text-white scale-110 shadow-[0_0_20px_rgba(179,84,30,0.6)]'
                              : 'bg-white dark:bg-[#242220] border-[#B3541E] text-[#1F1F1F] dark:text-[#F5F0E8] hover:scale-105 hover:shadow-[0_0_15px_rgba(179,84,30,0.4)]'}`}
                        >
                          <div className={`w-2 h-2 rounded-full animate-pulse ${isSelected ? 'bg-white' : 'bg-[#B3541E]'}`} />
                          <span className="text-[11px] font-bold uppercase tracking-wider">{obj.label}</span>
                          <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                        </button>
                      </div>
                    );
                  })}
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
                    <div className="bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex gap-2 w-full animate-in slide-in-from-bottom-5 border border-gray-100 dark:border-[#3A3632]">
                      <input
                        type="text"
                        value={remediatePrompt}
                        onChange={e => setRemediatePrompt(e.target.value)}
                        placeholder="e.g. Change walls to dark blue..."
                        className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none dark:text-[#F5F0E8] placeholder:dark:text-[#6B6460]"
                        onKeyDown={e => e.key === 'Enter' && executeRemediate()}
                      />
                      <button onClick={executeRemediate} className="bg-[#B3541E] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#8E4318]">
                        Update
                      </button>
                      <button onClick={() => setShowRemediateInput(false)} className="text-gray-400 dark:text-[#A89F94] p-2 hover:bg-gray-100 dark:hover:bg-[#2E2B28] rounded-xl">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRemediateInput(true)}
                      className="mx-auto bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all text-[#1F1F1F] dark:text-[#F5F0E8] border border-gray-100 dark:border-[#3A3632]"
                    >
                      <PenTool size={16} className="text-[#B3541E]" /> Remediate with AI
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1816] rounded-[2rem] p-6 border border-gray-100 dark:border-[#3A3632] shadow-sm transition-colors">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-[#F5F0E8]">
              <Tag size={18} className="text-[#B3541E]" /> AI Analysis & Concept
            </h2>

            <div className="mb-10">
              {apiResult?.text ? (
                <AnalysisCards text={apiResult.text} />
              ) : (
                <div className="p-12 text-center bg-gray-50 dark:bg-[#0F0E0D]/30 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-[#3A3632] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-white dark:bg-[#1A1816] rounded-full flex items-center justify-center shadow-sm mb-4 animate-pulse">
                    <Sparkles size={20} className="text-[#B3541E]" />
                  </div>
                  <p className="text-gray-400 dark:text-[#6B6460] font-medium max-w-[280px] leading-relaxed">
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
          <div className="bg-[#B3541E] text-white rounded-[2rem] p-8 shadow-lg shadow-[#B3541E]/20 relative overflow-hidden transition-all h-[340px] flex flex-col justify-between">
            {/* Background flourish */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Estimated Budget Distribution</h3>
                <p className="text-4xl font-bold tracking-tight">${budget.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1 rounded-lg flex text-[10px] font-bold uppercase shrink-0 print:hidden shadow-inner backdrop-blur-sm">
                <button
                  onClick={() => setCostMode('retail')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300 ${costMode === 'retail' ? 'bg-white text-[#B3541E] shadow-sm' : 'text-white hover:bg-white/10'}`}>
                  <KeyRound size={12} /> Turnkey
                </button>
                <button
                  onClick={() => setCostMode('custom')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-300 ${costMode === 'custom' ? 'bg-white text-[#B3541E] shadow-sm' : 'text-white hover:bg-white/10'}`}>
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
                      <div className="p-2 bg-white/10 rounded-lg shadow-inner"><Sofa size={14} /></div>
                      <span className="text-white/80 font-medium">Furniture & Decor</span>
                    </div>
                    <span className="font-bold text-white">${(budget * 0.40).toLocaleString()}</span>
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
              className="w-full bg-white dark:bg-[#242220] text-[#B3541E] py-3.5 rounded-xl font-bold shadow-md hover:bg-gray-50 dark:hover:bg-[#3A3632] transition-all active:scale-95 text-sm relative z-10 mt-auto flex items-center justify-center gap-2"
            >
              <BarChart3 size={16} />
              {isBreakdownOpen ? 'Hide Detail Breakdown' : 'View Detailed Breakdown'}
              {isBreakdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Sourcing List */}
          <div className="bg-white dark:bg-[#1A1816] rounded-[2rem] p-6 border border-gray-100 dark:border-[#3A3632] shadow-sm flex-1 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-[#F5F0E8]">
                  {selectedObjectLabel ? `Sourcing: ${selectedObjectLabel}` : 'Top Picks & Sourcing'}
                </h2>
                {selectedObjectLabel && (
                  <button onClick={() => setSelectedObjectId(null)} className="text-xs text-[#B3541E] hover:underline text-left mt-1 font-bold">
                    Clear Selection &times;
                  </button>
                )}
              </div>
              <span className="bg-gray-100 dark:bg-[#0F0E0D] text-gray-500 dark:text-[#6B6460] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{displayProducts.length} Items</span>
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

      {/* Product Discovery Popup */}
      {showProductPopup && activeLabel && activeLabel.id && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-300" onClick={() => setShowProductPopup(false)}>
          <div className="bg-white dark:bg-[#1A1816] rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-gray-100 dark:border-[#3A3632] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowProductPopup(false)}
              className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-[#2E2B28]/90 backdrop-blur-sm rounded-full text-gray-500 dark:text-[#A89F94] hover:text-black dark:hover:text-[#F5F0E8] hover:scale-110 transition-all shadow-md"
            >
              <X size={20} />
            </button>

            {/* Header Content */}
            <div className="p-8 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#B3541E]/10 text-[#B3541E] text-[10px] font-bold uppercase tracking-widest rounded-full">Detected Item</span>
                <span className="text-gray-300 dark:text-[#3A3632]">•</span>
                <span className="text-gray-400 dark:text-[#6B6460] text-[10px] font-bold uppercase tracking-widest">{activeLabel.style} • {activeLabel.color}</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1F1F1F] dark:text-[#F5F0E8] capitalize">{activeLabel.label}</h2>
            </div>

            {/* Main Content Area */}
            <div className="px-8 pb-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

              {/* Product Visuals (Serper Images) */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 dark:text-[#6B6460] uppercase tracking-widest mb-4">Visual Matches & Inspo</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {isSearchingProduct ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="min-w-[240px] h-48 bg-gray-100 dark:bg-[#0F0E0D] rounded-2xl animate-pulse border border-transparent dark:border-[#3A3632]" />
                    ))
                  ) : searchResult?.products?.length > 0 ? (
                    searchResult.products.map((prod: any, i: number) => (
                      <div key={i} className="min-w-[240px] group relative h-48 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-[11px] font-bold line-clamp-1">{prod.name}</p>
                          <p className="text-[#B3541E] text-xs font-bold">{prod.price}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-50 dark:bg-[#0F0E0D]/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-[#3A3632] text-gray-400 dark:text-[#6B6460] text-xs italic">
                      Searching premium matches...
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Specifics / Details */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-50 dark:bg-[#0F0E0D]/50 rounded-2xl border border-gray-100 dark:border-[#3A3632]">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-[#6B6460] uppercase tracking-widest mb-1">Category</p>
                  <p className="text-sm font-bold text-[#1F1F1F] dark:text-[#F5F0E8] capitalize">{activeLabel.category || 'Interior Element'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#0F0E0D]/50 rounded-2xl border border-gray-100 dark:border-[#3A3632]">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-[#6B6460] uppercase tracking-widest mb-1">Aesthetic</p>
                  <p className="text-sm font-bold text-[#1F1F1F] dark:text-[#F5F0E8] capitalize">{activeLabel.style || 'Matching'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#0F0E0D]/50 rounded-2xl border border-gray-100 dark:border-[#3A3632]">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-[#6B6460] uppercase tracking-widest mb-1">Palette</p>
                  <p className="text-sm font-bold text-[#1F1F1F] dark:text-[#F5F0E8] capitalize">{activeLabel.color || 'Dynamic'}</p>
                </div>
              </div>

              {/* Shopping Platforms */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ExternalLink size={14} /> Shoppable Platforms
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <a href={searchResult?.platformLinks?.amazon || "#"} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-[11px] transition-all ${searchResult?.platformLinks?.amazon ? 'bg-[#F3D14D]/10 border-[#F3D14D]/30 text-[#846C00] hover:bg-[#F3D14D] hover:text-black' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed text-opacity-50'}`}>
                    Amazon India
                  </a>
                  <a href={searchResult?.platformLinks?.flipkart || "#"} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-[11px] transition-all ${searchResult?.platformLinks?.flipkart ? 'bg-[#2874F0]/10 border-[#2874F0]/30 text-[#2874F0] hover:bg-[#2874F0] hover:text-white' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                    Flipkart
                  </a>
                  <a href={searchResult?.platformLinks?.pepperfry || "#"} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-[11px] transition-all ${searchResult?.platformLinks?.pepperfry ? 'bg-[#FF4F00]/10 border-[#FF4F00]/30 text-[#FF4F00] hover:bg-[#FF4F00] hover:text-white' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                    Pepperfry
                  </a>
                  <a href={searchResult?.platformLinks?.urbanladder || "#"} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-[11px] transition-all ${searchResult?.platformLinks?.urbanladder ? 'bg-[#B3541E]/10 border-[#B3541E]/30 text-[#B3541E] hover:bg-[#B3541E] hover:text-white' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                    Urban Ladder
                  </a>
                  <a href={searchResult?.platformLinks?.indiamart || "#"} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-[11px] transition-all ${searchResult?.platformLinks?.indiamart ? 'bg-[#002F6C]/10 border-[#002F6C]/30 text-[#002F6C] hover:bg-[#002F6C] hover:text-white' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                    IndiaMart
                  </a>
                  <a href={searchResult?.platformLinks?.nearby || "#"} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-[11px] transition-all ${searchResult?.platformLinks?.nearby ? 'bg-[#EA4335]/10 border-[#EA4335]/30 text-[#EA4335] hover:bg-[#EA4335] hover:text-white' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                    Nearby Stores
                  </a>
                </div>
              </div>

              {/* Action */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const firstProd = searchResult?.products?.[0];
                    if (firstProd) {
                      onAddToCart({
                        id: activeLabel.id,
                        name: firstProd.name,
                        brand: firstProd.seller,
                        price: parseInt(firstProd.price.replace(/[^0-9]/g, '')) || 0,
                        image: firstProd.image
                      });
                      setShowProductPopup(false);
                    }
                  }}
                  disabled={!searchResult?.products?.length}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95
                    ${searchResult?.products?.length
                      ? 'bg-[#B3541E] text-white hover:bg-[#8E4318] shadow-[#B3541E]/20'
                      : 'bg-gray-100 dark:bg-[#0F0E0D] text-gray-400 dark:text-[#6B6460] cursor-not-allowed'}`}
                >
                  <ShoppingCart size={18} /> Add Top Match to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Before & After Collage Modal */}
      {isCollageOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0F0E0D] rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsCollageOpen(false)}
              className="absolute top-8 right-8 z-20 w-12 h-12 flex items-center justify-center bg-white/90 dark:bg-[#1A1816]/90 backdrop-blur-sm rounded-full text-gray-500 dark:text-[#A89F94] hover:text-black dark:hover:text-[#F5F0E8] transition-all shadow-lg"
            >
              <X size={24} />
            </button>

            <div className="p-12">
              <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-[#F5F0E8]">Design Transformation</h2>
                  <p className="text-gray-500 dark:text-[#A89F94] font-medium mt-1">A visual comparison of your Vastu-compliant redesign.</p>
                </div>
                <button
                  onClick={handleDownloadCollage}
                  className="bg-[#B3541E] text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#8E4318] transition-all shadow-xl shadow-[#B3541E]/20 active:scale-95"
                >
                  <Download size={18} /> Download Comparison
                </button>
              </div>

              <div
                ref={collageRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FBFBF9] dark:bg-[#1A1816] p-6 rounded-[2rem] border border-gray-100 dark:border-[#3A3632]"
              >
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3632]">
                    <img
                      src={formatImageSrc(apiResult?.image)}
                      alt="Original"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Original Space
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3632]">
                    <img
                      src={formatImageSrc(activeImage)}
                      alt="Redesign"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-[#B3541E] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Vastu Redesign
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#B3541E]/10 flex items-center justify-center text-[#B3541E] mb-2 font-bold text-sm">1</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">Captured Vision</p>
                </div>
                <div className="w-20 h-[1px] bg-gray-200 dark:bg-[#3A3632] mb-6"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#B3541E]/10 flex items-center justify-center text-[#B3541E] mb-2 font-bold text-sm">2</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">AI Synthesized</p>
                </div>
                <div className="w-20 h-[1px] bg-gray-200 dark:bg-[#3A3632] mb-6"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#B3541E] flex items-center justify-center text-white mb-2 font-bold text-sm">3</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#B3541E]">Vastu Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
