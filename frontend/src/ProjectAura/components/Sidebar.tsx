import React, { useState } from 'react';
import { Home, LayoutGrid, Heart, Settings, User } from 'lucide-react';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; icon: React.FC<any>; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'my-designs', icon: LayoutGrid, label: 'My Designs' },
  { id: 'saved-products', icon: Heart, label: 'Saved Products' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 min-h-screen bg-white dark:bg-[#1A1816] border-r border-gray-100 dark:border-[#3A3632] flex flex-col py-8 px-4 fixed left-0 top-0 z-40 transition-colors duration-300 font-sans">
      {/* Logo */}
      <div className="px-3 mb-10">
        <p className="text-[#B3541E] font-bold text-xl tracking-tight">VastuVision AI</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 dark:text-[#6B6460] mt-0.5">
          Interior Design Portal
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#B3541E]/10 text-[#B3541E] font-bold'
                  : 'text-gray-500 dark:text-[#A89F94] hover:bg-gray-50 dark:hover:bg-[#2E2B28] hover:text-gray-800 dark:hover:text-[#F5F0E8]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#B3541E]' : 'text-gray-400 dark:text-[#6B6460]'} />
              {label}
              {isActive && (
                <span className="ml-auto w-1 h-5 bg-[#B3541E] rounded-full shadow-[0_0_8px_rgba(179,84,30,0.4)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Badge */}
      <div className="mt-6 mx-1 bg-[#B3541E]/5 border border-[#B3541E]/20 dark:border-[#3A3632] rounded-2xl px-4 py-4">
        <p className="text-[#B3541E] font-bold text-xs uppercase tracking-tight">Pro Plan Active</p>
        <p className="text-gray-500 dark:text-[#6B6460] text-[10px] mt-0.5">Unlimited AI renders included.</p>
      </div>
    </aside>
  );
}
