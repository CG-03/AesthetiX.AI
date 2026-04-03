import React, { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Trash2, Box } from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface MyDesignsProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  onNewProject: () => void;
  onOpenWorkspace: (design: any) => void;
}

export default function MyDesigns({ onNavigate, activePage, onNewProject, onOpenWorkspace }: MyDesignsProps) {
  const [designs, setDesigns] = React.useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const filters = ['All Projects', 'Residential', 'Commercial'];

  React.useEffect(() => {
    const history = localStorage.getItem('vastu_saved_designs');
    if (history) setDesigns(JSON.parse(history));
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = designs.filter(d => d.id !== id);
    setDesigns(updated);
    localStorage.setItem('vastu_saved_designs', JSON.stringify(updated));
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#0F0E0D] font-sans text-[#1F1F1F] dark:text-[#F5F0E8] transition-colors duration-300">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#FBFBF9] dark:bg-[#1A1816] border-b border-gray-100 dark:border-[#3A3632] px-8 py-5 flex items-center justify-between transition-colors">
          <h1 className="text-xl font-bold tracking-tight">My Designs</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B6460]" />
              <input
                placeholder="Search projects..."
                className="bg-white dark:bg-[#242220] border border-gray-200 dark:border-[#3A3632] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1F1F1F] dark:text-[#F5F0E8] placeholder-gray-400 dark:placeholder-[#6B6460] focus:outline-none focus:ring-2 focus:ring-[#B3541E]/30 w-56 transition-all"
              />
            </div>
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 bg-[#B3541E] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#8E4318] transition-colors shadow-md shadow-[#B3541E]/20"
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
                      ? 'bg-[#B3541E] text-white shadow-md shadow-[#B3541E]/20'
                      : 'bg-white dark:bg-[#242220] border border-gray-200 dark:border-[#3A3632] text-gray-500 dark:text-[#A89F94] hover:border-gray-300 dark:hover:border-[#6B6460]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {designs.length > 0 ? (
              designs.map((design) => (
                <div 
                  key={design.id} 
                  className="group cursor-pointer bg-white dark:bg-[#1A1816] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-[#3A3632] shadow-sm hover:shadow-xl transition-all"
                  onClick={() => onOpenWorkspace(design)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 dark:bg-[#1A1816] flex items-center justify-center border-b border-gray-100 dark:border-[#3A3632]">
                    {(design.redesignedImage || design.image) ? (
                      <img src={design.redesignedImage || design.image} alt={design.roomType} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-200 dark:text-gray-700">
                        <Box size={48} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Metadata Only</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleDelete(design.id, e)}
                        className="p-2 bg-[#B3541E] text-white rounded-xl shadow-lg hover:bg-[#8E4318] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#B3541E] text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">{design.date}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B3541E]">
                        {design.roomType || 'Design'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-[#6B6460]">ID: {design.id.substring(design.id.length - 4)}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#B3541E] dark:group-hover:text-[#D4621F] transition-colors dark:text-[#F5F0E8]">
                      {design.style || 'Custom Vision'}
                    </h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-24 text-center bg-white dark:bg-[#1A1816] rounded-[2rem] border border-dashed border-gray-200 dark:border-[#3A3632]">
                <p className="text-gray-400 dark:text-[#6B6460] font-medium italic">No recent projects yet.</p>
              </div>
            )}
            
            {/* Start a New Vision Card */}
            <button
              onClick={onNewProject}
              className="bg-white dark:bg-[#1A1816] rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-[#3A3632] flex flex-col items-center justify-center p-8 text-center hover:border-[#B3541E] hover:bg-[#B3541E]/5 dark:hover:bg-[#B3541E]/10 transition-all group min-h-[300px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#B3541E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#B3541E]/30">
                <Plus size={22} className="text-white" />
              </div>
              <p className="font-bold text-[15px] text-gray-700 dark:text-[#F5F0E8] mb-1">Start a New Vision</p>
              <p className="text-xs text-gray-400 dark:text-[#6B6460] leading-relaxed max-w-[160px]">
                Upload a photo to see your space transformed in seconds.
              </p>
            </button>
          </div>

          {/* Pagination + Stats Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#3A3632] pt-6">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460] mb-1">Total Renders</p>
                <p className="text-2xl font-bold text-[#1F1F1F] dark:text-[#F5F0E8]">{designs.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full border border-gray-200 dark:border-[#3A3632] flex items-center justify-center text-gray-400 dark:text-[#6B6460] hover:bg-gray-100 dark:hover:bg-[#242220] transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#1F1F1F] dark:bg-[#B3541E] text-white flex items-center justify-center text-sm font-bold">
                1
              </button>
              <button className="w-9 h-9 rounded-full border border-gray-200 dark:border-[#3A3632] flex items-center justify-center text-gray-400 dark:text-[#6B6460] hover:bg-gray-100 dark:hover:bg-[#242220] transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
