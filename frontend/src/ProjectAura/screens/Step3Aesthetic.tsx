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
          className={`bg-[#4A6D50] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#3A5640] transition-colors shadow-xl shadow-[#4A6D50]/30 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} /> GENERATE MY DESIGN
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
