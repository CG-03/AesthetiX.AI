import React from 'react';
import { HelpCircle, User } from 'lucide-react';

interface TopNavigationProps {
  variant?: 'onboarding' | 'dashboard';
  title?: string;
}

export default function TopNavigation({ variant = 'onboarding', title }: TopNavigationProps) {
  return (
    <header className="w-full flex items-center justify-between py-6 px-8 md:px-12 bg-[#FBFBF9] sticky top-0 z-50">
        {variant === 'dashboard' ? 'Vastu AI' : 'Vastu AI'}

      {variant === 'onboarding' ? (
        <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <span className="hidden sm:inline">{title || 'Define your aesthetic.'}</span>
          <button className="text-gray-500 hover:text-[#4A6D50] transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[#4A6D50] focus:ring-offset-2">
            <HelpCircle size={20} className="fill-gray-500 text-white" />
          </button>
        </div>
      ) : (
        <>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <button className="hover:text-gray-700 transition-colors">Inspiration</button>
            <button className="text-[#4A6D50] border-b-2 border-[#4A6D50] pb-1">Projects</button>
            <button className="hover:text-gray-700 transition-colors">Collections</button>
          </nav>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <User size={16} />
            </button>
          </div>
        </>
      )}
    </header>
  );
}
