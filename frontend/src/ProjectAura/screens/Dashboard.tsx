import React from 'react';
import { Plus, ArrowRight, Sparkles, ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  onNewProject: () => void;
  onOpenProject: (design: any) => void;
  userProfile: any;
  setDesignData: (data: any) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

const INSPIRATION_STYLES = [
  { 
    style: 'Modern', 
    roomType: 'Living Room', 
    budget: '$5,000 - $8,000', 
    elements: ['Clean Lines', 'Neutral Palette', 'Statement Lighting'],
    image: 'https://images.unsplash.com/photo-1567016432779-094069958ad5?w=800&q=80'
  },
  { 
    style: 'Minimal', 
    roomType: 'Bedroom', 
    budget: '$3,000 - $5,000', 
    elements: ['Negative Space', 'Essential Furniture', 'Natural Textures'],
    image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80'
  },
  { 
    style: 'Traditional', 
    roomType: 'Dining Room', 
    budget: '$6,000 - $10,000', 
    elements: ['Rich Woodworking', 'Symmetrical Layout', 'Cultural Accents'],
    image: 'https://images.unsplash.com/photo-1582281980322-35b5c102b3fd?w=800&q=80'
  },
  { 
    style: 'Scandinavian', 
    roomType: 'Home Office', 
    budget: '$4,000 - $6,000', 
    elements: ['Hygge Comfort', 'Light Woods', 'Functional Decor'],
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&q=80'
  },
  { 
    style: 'Boho', 
    roomType: 'Living Room', 
    budget: '$2,500 - $4,500', 
    elements: ['Layered Textiles', 'Botanical Life', 'Eclectic Patterns'],
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
  },
  { 
    style: 'Luxury', 
    roomType: 'Main Hall', 
    budget: '$15,000 - $25,000', 
    elements: ['Marble Surfaces', 'Gold Accents', 'Velvet Upholstery'],
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'
  }
];

export default function Dashboard({ 
  onNavigate, 
  activePage, 
  onNewProject, 
  onOpenProject, 
  userProfile,
  setDesignData,
  showToast
}: DashboardProps) {
  const [recentProjects, setRecentProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    const history = localStorage.getItem('vastu_saved_designs');
    if (history) setRecentProjects(JSON.parse(history).slice(0, 3));
  }, []);

  const handleApplyStyle = (item: typeof INSPIRATION_STYLES[0]) => {
    setDesignData((prev: any) => ({
      ...prev,
      style: item.style,
      roomType: item.roomType
    }));
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showToast(`Style applied: ${item.style} ${item.roomType}. Upload your photo to start!`, 'success');
  };

  const initials = userProfile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#121212] font-sans text-[#1F1F1F] dark:text-white transition-colors duration-300">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56 p-12">
        {/* Welcome Header */}
        <header className="mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {userProfile ? `Welcome back, ${userProfile.name.split(' ')[0]}.` : 'Welcome to VastuVision.'}
            </h1>
            <p className="text-gray-500 text-sm">
              {userProfile 
                ? `You have ${recentProjects.length} designs in your workspace.` 
                : 'Sign in to save your design history and preferences.'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {userProfile ? (
              <button 
                onClick={() => onNavigate('profile')}
                className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white font-bold transition-transform hover:scale-110"
                style={{ backgroundColor: userProfile.avatarColor }}
              >
                {initials}
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('profile')}
                className="text-sm font-bold text-[#4A6D50] hover:underline"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={onNewProject}
              className="flex items-center gap-2 bg-[#4A6D50] text-white text-sm font-bold px-8 py-4 rounded-2xl hover:bg-[#3A5640] transition-all shadow-xl shadow-[#4A6D50]/20 active:scale-95"
            >
              <Plus size={20} /> Start New Vision
            </button>
          </div>
        </header>

        {/* Recent Projects Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock size={22} className="text-[#4A6D50]" /> Recent Activity
            </h2>
            <button 
              onClick={() => onNavigate('my-designs')}
              className="text-sm font-bold text-[#4A6D50] flex items-center gap-1 hover:text-[#3A5640] transition-colors"
            >
              View Library <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentProjects.length > 0 ? recentProjects.map((project, i) => (
              <div 
                key={i} 
                className="group cursor-pointer bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl" 
                onClick={() => onOpenProject(project)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={project.redesignedImage || project.image} 
                    alt={project.roomType} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white text-[#1F1F1F] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                       Open in Workspace <ArrowRight size={14} />
                     </span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A6D50] mb-2 block">{project.roomType}</span>
                  <h3 className="font-bold text-lg mb-1">{project.style}</h3>
                  <p className="text-xs text-gray-400 font-medium">{project.date}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-3 py-16 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Sparkles size={24} />
                </div>
                <p className="text-gray-400 font-medium italic">Your creative journey begins here.</p>
              </div>
            )}
          </div>
        </section>

        {/* Inspiration Grid */}
        <section>
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Curated Inspiration</h2>
            <p className="text-gray-500 text-sm">Select a style below to instantly pre-configure your next redesign.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INSPIRATION_STYLES.map((item, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.style} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md dark:bg-gray-900/90 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4A6D50]">
                    {item.style}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl">{item.roomType}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">
                      <ShoppingBag size={12} /> {item.budget}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {item.elements.map((el, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-md">
                        {el}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleApplyStyle(item)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-[#4A6D50] dark:text-[#6AB04C] py-4 rounded-2xl font-bold text-sm hover:bg-[#4A6D50] hover:text-white transition-all group/btn"
                  >
                    Use This Style <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
