import React from 'react';
import { HelpCircle, User } from 'lucide-react';

interface TopNavigationProps {
  variant?: 'onboarding' | 'dashboard';
  title?: string;
}

export default function TopNavigation({ variant = 'onboarding', title }: TopNavigationProps) {
  return (
    <header className="w-full flex items-center justify-between py-6 px-8 md:px-12 bg-[#FBFBF9] dark:bg-[#0F0E0D] sticky top-0 z-50 border-b border-transparent dark:border-[#3A3632] transition-colors duration-300">
        <div className="text-xl font-black tracking-tighter text-[#B3541E] flex items-center gap-2">
           <div className="w-8 h-8 bg-[#B3541E] rounded-lg shadow-[0_0_15px_rgba(179,84,30,0.3)]"></div>
           {variant === 'dashboard' ? 'Vastu AI' : 'Vastu AI'}
        </div>

      {variant === 'onboarding' ? (
        <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-[#A89F94]">
          <span className="hidden sm:inline">{title || 'Define your aesthetic.'}</span>
          <button className="text-gray-500 hover:text-[#B3541E] dark:text-[#6B6460] dark:hover:text-[#B3541E] transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[#B3541E] focus:ring-offset-2">
            <HelpCircle size={20} className="fill-gray-500 text-white dark:fill-[#6B6460] dark:text-[#0F0E0D]" />
          </button>
        </div>
      ) : (
        <>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 dark:text-[#6B6460]">
            <button className="hover:text-gray-700 dark:hover:text-[#F5F0E8] transition-colors">Inspiration</button>
            <button className="text-[#B3541E] border-b-2 border-[#B3541E] pb-1">Projects</button>
            <button className="hover:text-gray-700 dark:hover:text-[#F5F0E8] transition-colors">Collections</button>
          </nav>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-[#3A3632] flex items-center justify-center text-gray-500 dark:text-[#A89F94] hover:bg-gray-100 dark:hover:bg-[#1A1816] transition-colors">
              <User size={16} />
            </button>
          </div>
        </>
      )}
    </header>
  );
}
