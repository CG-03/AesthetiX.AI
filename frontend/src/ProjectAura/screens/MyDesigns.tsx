import React, { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface MyDesignsProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  onNewProject: () => void;
  onOpenWorkspace: (id: number) => void;
}

const designs = [
  {
    id: 1,
    title: 'Master Bedroom Redo',
    roomType: 'Living Room',
    budget: '$3,200',
    date: 'Oct 12, 2023',
    before: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Sage Kitchen Concept',
    roomType: 'Kitchen',
    budget: '$8,500',
    date: 'Sep 28, 2023',
    before: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Reading Nook Retreat',
    roomType: 'Living Room',
    budget: '$1,450',
    date: 'Nov 02, 2023',
    before: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=400&fit=crop',
  },
  {
    id: 4,
    title: 'Home Office Studio',
    roomType: 'Office',
    budget: '$2,100',
    date: 'Dec 15, 2023',
    before: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
  },
  {
    id: 5,
    title: 'Scandi-Boho Guest Suite',
    roomType: 'Bedroom',
    budget: '$4,800',
    date: 'Jan 05, 2024',
    before: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop',
  },
];

export default function MyDesigns({ onNavigate, activePage, onNewProject, onOpenWorkspace }: MyDesignsProps) {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const filters = ['All Projects', 'Residential', 'Commercial'];

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F]">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#FBFBF9] border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">My Designs</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search projects..."
                className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6D50]/30 w-56 transition-all"
              />
            </div>
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 bg-[#4A6D50] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3A5640] transition-colors shadow-md shadow-[#4A6D50]/20"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </header>

        <main className="px-8 py-8">
          {/* Filter + Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeFilter === f
                      ? 'bg-[#4A6D50] text-white shadow-md shadow-[#4A6D50]/20'
                      : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {designs.map(design => (
              <button
                key={design.id}
                onClick={() => onOpenWorkspace(design.id)}
                className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-lg transition-all text-left group"
              >
                {/* Before / After split image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Before (left half, greyscale) */}
                  <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                    <img
                      src={design.before}
                      alt="Before"
                      className="w-[200%] h-full object-cover grayscale"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Before
                    </span>
                  </div>
                  {/* After (right half, colour) */}
                  <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                    <img
                      src={design.after}
                      alt="After"
                      className="w-[200%] h-full object-cover -translate-x-full group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#4A6D50] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      After
                    </span>
                  </div>
                  {/* Divider line */}
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/80 z-10" />
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-[15px] leading-snug">{design.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {design.roomType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <div>
                      <span className="uppercase tracking-widest font-bold text-[9px] text-gray-400 block mb-0.5">Budget</span>
                      <span className="font-bold text-[#1F1F1F] text-sm">Est. {design.budget}</span>
                    </div>
                    <div className="text-right">
                      <span className="uppercase tracking-widest font-bold text-[9px] text-gray-400 block mb-0.5">Generated</span>
                      <span className="font-semibold text-[#1F1F1F] text-[12px]">{design.date}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Start a New Vision Card */}
            <button
              onClick={onNewProject}
              className="bg-white rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:border-[#4A6D50] hover:bg-[#4A6D50]/5 transition-all group min-h-[280px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#4A6D50] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#4A6D50]/30">
                <Plus size={22} className="text-white" />
              </div>
              <p className="font-bold text-[15px] text-gray-700 mb-1">Start a New Vision</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[160px]">
                Upload a photo to see your space transformed in seconds.
              </p>
            </button>
          </div>

          {/* Pagination + Stats Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Renders</p>
                <p className="text-2xl font-bold text-[#1F1F1F]">42</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Budget Est.</p>
                <p className="text-2xl font-bold text-[#1F1F1F]">$21.4k</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-sm font-bold">
                1
              </button>
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
