import React, { useState } from 'react';
import { Sparkles, Plus, ArrowLeft } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import StepIndicator from '../components/StepIndicator';

interface Step3AestheticProps {
  onBack?: () => void;
  onGenerate?: () => void;
  onDataChange?: (data: { style: string }) => void;
  isGenerating?: boolean;
}

export default function Step3Aesthetic({ onBack, onGenerate, onDataChange, isGenerating }: Step3AestheticProps) {
  const [activePill, setActivePill] = useState('Minimalist');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [loadingStage, setLoadingStage] = useState(0);
  const loadingStages = [
    "Analyzing your room geometry...",
    "Detecting furniture and layout...",
    "Applying your design style...",
    "Rendering lighting & materials...",
    "Generating your redesign...",
    "Adding finishing touches...",
    "Almost ready..."
  ];

  React.useEffect(() => {
    if (isGenerating) {
      setLoadingStage(0);
      const interval = setInterval(() => {
        setLoadingStage((prev) => Math.min(prev + 1, loadingStages.length - 1));
      }, 3000); // Progress every 3s
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handlePillClick = (pill: string) => {
    setActivePill(pill);
    onDataChange?.({ style: pill });
  };

  const pills = [
    'Minimalist',
    'Bohemian',
    'Mid-Century Modern',
    'Industrial',
    'Traditional'
  ];

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 5 - referenceImages.length;
      const filesToProcess = files.slice(0, remainingSlots);
      
      const newImages: string[] = [];
      let processed = 0;
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processed += 1;
          if (processed === filesToProcess.length) {
             const updatedImages = [...referenceImages, ...newImages].slice(0, 5);
             setReferenceImages(updatedImages);
             onDataChange?.({ style: activePill }); // Just an example, maybe pass referenceImages too
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F] flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in duration-500">
        {/* Subtle animated background shapes */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#4A6D50]/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#A89F95]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        
        <div className="z-10 flex flex-col items-center max-w-md w-full px-8 animate-in slide-in-from-bottom-10 duration-700">
          <div className="w-24 h-24 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center mb-10 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-[#4A6D50] border-t-transparent animate-spin" />
            <Sparkles className="text-[#4A6D50] w-10 h-10 animate-pulse" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center text-[#1F1F1F]">
            Crafting your space
          </h2>
          
          <div className="h-8 mb-10 flex items-center justify-center">
            <p className="text-gray-500 font-medium text-[15px] animate-in fade-in slide-in-from-bottom-2 duration-500" key={loadingStage}>
              {loadingStages[loadingStage]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-[#4A6D50] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(100, ((loadingStage + 1) / loadingStages.length) * 100)}%` }}
            >
               <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            </div>
          </div>
          
          <p className="text-xs text-gray-400 font-medium mt-6 uppercase tracking-[0.2em]">
            This takes about 20-30 seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F] flex flex-col">
      <TopNavigation variant="onboarding" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <StepIndicator currentStep={3} totalSteps={3} variant="full" />

        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Sparkles className="text-[#4A6D50] w-8 h-8 md:w-10 md:h-10" /> Define your aesthetic.
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Let's curate your vision. Connect your inspiration sources to help Aura
            understand your unique design language.
          </p>
        </div>

        {/* Pinterest Button */}
        <button className="bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-100 rounded-2xl py-4 px-8 flex items-center gap-3 font-semibold text-[#1F1F1F] text-sm mb-12">
          <div className="w-6 h-6 bg-[#E60023] rounded-full flex items-center justify-center text-white font-bold text-xs">
            {/* Simple CSS Pinterest logo approximation */}
            P
          </div>
          Connect Pinterest Board
        </button>

        {/* Separator */}
        <div className="w-full max-w-lg flex items-center gap-4 mb-12 opacity-50">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        {/* Upload References */}
        <div className="text-center mb-16 w-full">
          <p className="font-medium text-[15px] mb-6">Upload style references (up to 5)</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                onClick={triggerFileInput}
                className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 overflow-hidden flex items-center justify-center transition-colors ${
                  referenceImages[i] 
                    ? 'border-transparent shadow-sm' 
                    : 'border-dashed border-gray-200 text-gray-400 hover:text-[#4A6D50] hover:border-[#4A6D50] hover:bg-[#4A6D50]/5'
                }`}
                aria-label="Upload reference image"
              >
                {referenceImages[i] ? (
                  <img src={referenceImages[i]} alt="Reference" className="w-full h-full object-cover" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            ))}
          </div>
          {referenceImages.length > 0 && (
            <button 
              onClick={() => setReferenceImages([])} 
              className="mt-4 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Clear Images
            </button>
          )}
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-3xl">
          {pills.map((pill) => (
            <button
              key={pill}
              onClick={() => handlePillClick(pill)}
              className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
                activePill === pill
                  ? 'bg-[#4A6D50] text-white shadow-md shadow-[#4A6D50]/20'
                  : 'bg-[#EDEDEB] text-gray-600 hover:bg-[#E5E5E2]'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full bg-transparent py-6 px-8 flex items-center justify-between pb-12 max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1F1F1F] uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> BACK
        </button>
        <button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="bg-[#4A6D50] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#3A5640] transition-colors shadow-xl shadow-[#4A6D50]/30"
        >
          <Sparkles size={16} /> GENERATE MY DESIGN
        </button>
      </footer>
    </div>
  );
}
