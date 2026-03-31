import React, { useState } from 'react';
import { Upload, Camera, Wind, ArrowUp, Droplets, Mountain, Circle, Sun, Home, Flame, Leaf, ArrowLeft, ArrowRight } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import StepIndicator from '../components/StepIndicator';

interface Step1SpaceProps {
  onNext?: () => void;
  onBack?: () => void;
  onDataChange?: (data: { vastu?: string; image?: string | null; roomType?: string }) => void;
}

export default function Step1Space({ onNext, onBack, onDataChange }: Step1SpaceProps) {
  const [selectedDirection, setSelectedDirection] = useState('N');
  const [roomType, setRoomType] = useState('Bedroom');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onDataChange?.({ vastu: selectedDirection, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const vastuDirections = [
    { id: 'NW', icon: Wind, label: 'NW' },
    { id: 'N', icon: ArrowUp, label: 'N' },
    { id: 'NE', icon: Droplets, label: 'NE' },
    { id: 'W', icon: Mountain, label: 'W' },
    { id: 'CENTER', icon: Circle, label: '' },
    { id: 'E', icon: Sun, label: 'E' },
    { id: 'SW', icon: Home, label: 'SW' },
    { id: 'S', icon: Flame, label: 'S' },
    { id: 'SE', icon: Leaf, label: 'SE' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F] flex flex-col">
      <TopNavigation variant="onboarding" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col">
        <StepIndicator currentStep={1} totalSteps={3} variant="minimal" />

        <div className="text-center max-w-xl mx-auto mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Let's see your space.</h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Upload a clear photo of your room to begin the Aura analysis.
            We use natural lighting and spatial geometry to curate your
            personalized palette.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 mb-8">
          {/* Room Type Selector */}
          <div className="mb-10">
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-4 ml-2">What room are we designing?</h3>
            <div className="flex flex-wrap gap-3">
              {['Bedroom', 'Living Room', 'Kitchen', 'Study', 'Office'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setRoomType(type);
                    onDataChange?.({ roomType: type });
                  }}
                  className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    roomType === type
                      ? 'bg-[#4A6D50] text-white shadow-md shadow-[#4A6D50]/20'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Left: Spatial Capture */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 ml-2">Spatial Capture</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-[340px] bg-[#FAFAFA] relative overflow-hidden">
                {preview ? (
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-[#EFEFEF] text-[#4A6D50] rounded-full flex items-center justify-center mb-4">
                      <Upload size={20} />
                    </div>
                    <h4 className="font-semibold text-[#1F1F1F] mb-1">Drop image here</h4>
                    <p className="text-[11px] text-gray-400 mb-6">PNG, JPG up to 10MB</p>
                  </>
                )}
                
                <div className="space-y-3 w-full max-w-[200px] relative z-10">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <button 
                    onClick={triggerFileInput}
                    className="w-full bg-[#EFEFEF]/90 backdrop-blur-sm hover:bg-white text-[#1F1F1F] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Upload size={14} /> {preview ? 'Change Photo' : 'Browse Files'}
                  </button>
                  {!preview && (
                    <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#4A6D50] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                      <Camera size={14} /> Open Camera
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Vastu Alignment */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 ml-2">Vastu Alignment</h3>
              <div className="bg-[#FAFAFA] rounded-3xl p-8 h-[340px] flex flex-col justify-center border border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  {vastuDirections.map((dir, i) => {
                    const Icon = dir.icon;
                    const isActive = selectedDirection === dir.id;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedDirection(dir.id);
                          onDataChange?.({ vastu: dir.id });
                        }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                          isActive 
                            ? 'bg-white border-2 border-[#4A6D50] shadow-sm text-[#4A6D50]' 
                            : 'bg-white border border-gray-100 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {dir.label && <span className="text-[10px] font-bold tracking-wider">{dir.label}</span>}
                        <Icon size={16} className={isActive ? 'text-[#4A6D50]' : 'text-gray-400'} />
                      </button>
                    );
                  })}
                </div>
                <p className="mt-8 text-[10px] text-center text-gray-400 italic max-w-xs mx-auto leading-relaxed">
                  Orientation influences the energetic flow and primary color
                  resonance of your room.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Why this matters */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="space-y-3 pl-4 md:pl-10">
            <h3 className="text-lg font-bold tracking-tight">Why this matters?</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              By understanding the light entry point (Direction) and the existing
              architectural textures (Photo), our AI determines the optimal
              "Balance Points" for your interior design.
            </p>
          </div>
          <div className="h-40 rounded-[1.5rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800" 
              alt="Room lighting example" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </main>

      {/* Footer Navigation */}
      <footer className="w-full bg-[#F5F5F3] py-6 px-8 md:px-12 flex items-center justify-between border-t border-gray-200">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1F1F1F] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="bg-[#4A6D50] text-white px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#3A5640] transition-colors shadow-lg shadow-[#4A6D50]/20">
          Next Step <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
}
