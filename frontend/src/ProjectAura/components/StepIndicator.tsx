import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title?: string;
  variant?: 'minimal' | 'full';
}

export default function StepIndicator({ 
  currentStep, 
  totalSteps, 
  title, 
  variant = 'minimal' 
}: StepIndicatorProps) {
  
  if (variant === 'full') {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 mb-16">
        <div className="flex justify-between items-end mb-2 text-xs md:text-sm tracking-widest uppercase text-gray-500 font-medium">
          <span>{title || 'ONBOARDING WIZARD'}</span>
          <span>STEP {currentStep} OF {totalSteps}</span>
        </div>
        <div className="w-full h-1 bg-gray-200 overflow-hidden">
          <div 
            className="h-full bg-[#4A6D50] transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[280px] mx-auto mb-16">
      <div className="flex justify-between items-end mb-3 text-[10px] md:text-xs tracking-widest uppercase font-bold text-gray-500">
        <span className="text-[#4A6D50]">STEP 0{currentStep}</span>
        <span>0{totalSteps}</span>
      </div>
      <div className="w-full h-[2px] bg-gray-200">
        <div 
          className="h-full bg-[#4A6D50] transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
