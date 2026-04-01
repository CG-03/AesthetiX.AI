import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, BarChart3, Grid, Trash2, ExternalLink, 
  Edit3, Camera, Palette, X, Box, Mail
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface ProfileSectionProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  onOpenSavedDesign: (design: any) => void;
}

export default function ProfileSection({ onNavigate, activePage, onOpenSavedDesign }: ProfileSectionProps) {
  const [user, setUser] = useState({
    name: 'Sarah Jenkins',
    email: 'sarah.j@vastu-ai.com',
    memberSince: 'Oct 2023',
    avatarColor: '#4A6D50'
  });

  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    topStyle: 'Modern Minimalist',
    roomCounts: {} as Record<string, number>
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editColor, setEditColor] = useState(user.avatarColor);

  useEffect(() => {
    const history = localStorage.getItem('vastu_saved_designs');
    if (history) {
      const parsed = JSON.parse(history);
      setSavedDesigns(parsed);
      
      // Calculate Stats
      const counts: Record<string, number> = {};
      const styles: Record<string, number> = {};
      parsed.forEach((d: any) => {
        counts[d.roomType] = (counts[d.roomType] || 0) + 1;
        styles[d.style] = (styles[d.style] || 0) + 1;
      });

      const topStyle = Object.entries(styles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Modern Minimalist';

      setStats({
        total: parsed.length,
        topStyle,
        roomCounts: counts
      });
    }

    const savedUser = localStorage.getItem('vastu_user');
    if (savedUser) {
      setUser(prev => ({ ...prev, ...JSON.parse(savedUser) }));
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDesigns.filter(d => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem('vastu_saved_designs', JSON.stringify(updated));
  };

  const handleUpdateProfile = () => {
    const updated = { ...user, name: editName, avatarColor: editColor };
    setUser(updated);
    localStorage.setItem('vastu_user', JSON.stringify(updated));
    setShowEditModal(false);
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#121212] font-sans text-[#1F1F1F] dark:text-white transition-colors duration-300">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56 p-12 max-w-6xl">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20 shadow-xl"
              style={{ backgroundColor: user.avatarColor }}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 group">
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                <button onClick={() => setShowEditModal(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-[#4A6D50] hover:bg-[#4A6D50]/10 transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> Member since {user.memberSince}</span>
                <span className="flex items-center gap-1.5"><Mail size={14}/> {user.email}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Edit Profile
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#4A6D50]/10 rounded-2xl text-[#4A6D50]"><Camera size={24} /></div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Designs</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl"><Box size={24} /></div>
            <div>
              <p className="text-lg font-bold">{Object.keys(stats.roomCounts).length > 0 ? Object.keys(stats.roomCounts)[0] : 'Bedroom'}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Primary Room</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><Palette size={24} /></div>
            <div>
              <p className="text-lg font-bold truncate max-w-[150px]">{stats.topStyle}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Most Used Style</p>
            </div>
          </div>
        </div>

        {/* Saved Designs Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Grid size={20} className="text-[#4A6D50]" /> Saved Design History
            </h2>
          </div>

          {savedDesigns.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-16 text-center border border-dashed border-gray-200 dark:border-gray-700">
               <Camera size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-medium">Your design history is empty. Start a project to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDesigns.map((design) => (
                <div 
                  key={design.id} 
                  onClick={() => onOpenSavedDesign(design)}
                  className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all cursor-pointer relative"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={design.redesignedImage} alt={design.roomType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={(e) => handleDelete(design.id, e)}
                        className="p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A6D50]">{design.roomType}</span>
                      <span className="text-[10px] font-bold text-gray-400">{design.date}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#4A6D50] transition-colors">{design.style}</h3>
                    <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-gray-400">
                       <ExternalLink size={12} /> Click to open in Workspace
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Edit Profile</h3>
            <p className="text-gray-500 text-sm mb-8">Personalize your VastuVision AI presence.</p>
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/20 shadow-lg"
                  style={{ backgroundColor: editColor }}
                >
                  {editName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex gap-2">
                   {['#4A6D50', '#6D4A4A', '#4A5B6D', '#6D4A66', '#616D4A'].map(color => (
                     <button 
                       key={color} 
                       onClick={() => setEditColor(color)}
                       className={`w-6 h-6 rounded-full border-2 transition-transform ${editColor === color ? 'scale-125 border-gray-400' : 'border-transparent'}`}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4A6D50]" 
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                className="w-full bg-[#4A6D50] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#4A6D50]/30 mt-4"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
