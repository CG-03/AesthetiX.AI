import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ArrowLeft, ArrowRight, Search, Loader2 } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import StepIndicator from '../components/StepIndicator';

interface Step2ConstraintsProps {
  onNext?: () => void;
  onBack?: () => void;
  onDataChange?: (data: { 
    ownership: string; 
    location: string; 
    lat: number | null; 
    lng: number | null; 
    budget: number 
  }) => void;
  showToast?: (message: string, type: 'success' | 'info') => void;
}

export default function Step2Constraints({ onNext, onBack, onDataChange, showToast }: Step2ConstraintsProps) {
  const [ownership, setOwnership] = useState<'own' | 'rent'>('own');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [budget, setBudget] = useState(4500);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const minBudget = 500;
  const maxBudget = 10000;

  // Debounced Autocomplete Search
  useEffect(() => {
    if (!location || location.length < 3 || isDetecting) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&countrycodes=in&limit=5`);
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [location, isDetecting]);

  // Handle Click Outside Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            
            const city = data.address.city || data.address.town || data.address.village || "";
            const state = data.address.state || "";
            const displayName = city && state ? `${city}, ${state}` : data.display_name.split(',').slice(0, 2).join(', ');
            
            setLocation(displayName);
            onDataChange?.({ ownership, location: displayName, lat: latitude, lng: longitude, budget });
            showToast?.(`Location detected: ${displayName}`, 'success');
          } catch (err) {
            console.error("Reverse geocoding error", err);
            showToast?.("Location access granted, but failed to resolve address.", 'info');
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          console.error("Geolocation error", error);
          showToast?.("Location access denied. Please enter manually.", 'info');
          setIsDetecting(false);
        },
        { timeout: 10000 }
      );
    } else {
      showToast?.("Geolocation not supported by your browser.", 'info');
      setIsDetecting(false);
    }
  };

  const handleSelectSuggestion = (sug: any) => {
    const displayName = sug.display_name.split(',').slice(0, 2).join(', ');
    setLocation(displayName);
    const newLat = parseFloat(sug.lat);
    const newLng = parseFloat(sug.lon);
    setLat(newLat);
    setLng(newLng);
    onDataChange?.({ ownership, location: displayName, lat: newLat, lng: newLng, budget });
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBudget(val);
    onDataChange?.({ ownership, location, lat, lng, budget: val });
  };

  const pct = ((budget - minBudget) / (maxBudget - minBudget)) * 100;

  return (
    <div className="min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F] flex flex-col">
      <TopNavigation variant="onboarding" title="Tell us about your constraints." />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10 flex flex-col">

        {/* Step Indicator */}
        <div className="mb-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Onboarding</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Tell us about your constraints.</h1>
        </div>
        <StepIndicator currentStep={2} totalSteps={3} variant="full" />

        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 mt-8 space-y-10">

          {/* Residential Status */}
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-4">Residential Status</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setOwnership('own'); onDataChange?.({ ownership: 'own', location, lat, lng, budget }); }}
                className={`flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 font-semibold text-sm transition-all ${
                  ownership === 'own'
                    ? 'bg-[#4A6D50] text-white border-[#4A6D50] shadow-lg shadow-[#4A6D50]/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                I own
              </button>
              <button
                onClick={() => { setOwnership('rent'); onDataChange?.({ ownership: 'rent', location, lat, lng, budget }); }}
                className={`flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 font-semibold text-sm transition-all ${
                  ownership === 'rent'
                    ? 'bg-[#4A6D50] text-white border-[#4A6D50] shadow-lg shadow-[#4A6D50]/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                I rent
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="relative" ref={dropdownRef}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-4">Preferred Location</p>
            <div className="relative">
              <MapPin size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-[#4A6D50] animate-pulse' : 'text-gray-400'}`} />
              <input
                type="text"
                value={location}
                onChange={(e) => { 
                  setLocation(e.target.value); 
                  onDataChange?.({ ownership, location: e.target.value, lat: null, lng: null, budget }); 
                }}
                placeholder="Search city in India (e.g. Mumbai)"
                className="w-full bg-[#F8F8F7] border border-gray-200 rounded-2xl pl-10 pr-28 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6D50]/30 focus:border-[#4A6D50] transition-all"
              />
              <button 
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-[#F0F0EE] text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isDetecting ? (
                  <Loader2 size={12} className="animate-spin text-[#4A6D50]" />
                ) : (
                  <Navigation size={12} /> 
                )}
                {isDetecting ? 'Detecting...' : 'Detect'}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (suggestions.length > 0) && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                  >
                    <Search size={14} className="text-gray-300 group-hover:text-[#4A6D50] transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {sug.display_name.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {sug.display_name.split(',').slice(1, 3).join(', ')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showDropdown && suggestions.length === 0 && location.length >= 3 && !isSearching && !isDetecting && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-6 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-medium text-gray-400 italic">No results found for "{location}"</p>
              </div>
            )}
          </div>

          {/* Budget Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Monthly Budget</p>
              <span className="bg-[#4A6D50] text-white text-xs font-bold px-3 py-1 rounded-full">
                up to ${budget.toLocaleString()}
              </span>
            </div>
            <div className="relative mb-3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-[#4A6D50] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <input
                type="range"
                min={minBudget}
                max={maxBudget}
                step={100}
                value={budget}
                onChange={handleBudgetChange}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                style={{ height: '6px', top: 0 }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#4A6D50] rounded-full shadow-lg border-2 border-white pointer-events-none transition-all"
                style={{ left: `calc(${pct}% - 10px)` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>${minBudget.toLocaleString()}</span>
              <span>${maxBudget.toLocaleString()}+</span>
            </div>
          </div>

          {/* Aura Promise */}
          <div className="flex items-center gap-4 bg-[#FFF8F5] border border-[#FFE4D4] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop"
              alt="Aura Promise"
              className="w-28 h-full object-cover shrink-0"
            />
            <div className="p-4">
              <p className="text-[#B3541E] font-bold text-sm flex items-center gap-1.5 mb-1">
                <span>✦</span> The Aura Promise
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                We tailor every recommendation to your specific landscape and budget constraints.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex items-center justify-between border-t border-gray-100 bg-[#FBFBF9]">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1F1F1F] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          className="bg-[#4A6D50] text-white px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#3A5640] transition-colors shadow-lg shadow-[#4A6D50]/20"
        >
          Next Step <ArrowRight size={16} />
        </button>
      </footer>
    </div>
  );
}
