import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, BarChart3, Grid, Trash2, ExternalLink, 
  Edit3, Camera, Palette, X, Box, Mail, LogOut, Lock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface ProfileSectionProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  onOpenSavedDesign: (design: any) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

export default function ProfileSection({ 
  onNavigate, 
  activePage, 
  onOpenSavedDesign,
  userProfile,
  setUserProfile,
  showToast
}: ProfileSectionProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    topStyle: 'Modern Minimalist',
    roomCounts: {} as Record<string, number>
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchProjects();
    if (userProfile) setEditName(userProfile.name);
  }, [userProfile]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const parsed = await res.json();
        setSavedDesigns(parsed);
        
        const counts: Record<string, number> = {};
        const styles: Record<string, number> = {};
        parsed.forEach((d: any) => {
          counts[d.roomType] = (counts[d.roomType] || 0) + 1;
          styles[d.designStyle || d.style] = (styles[d.designStyle || d.style] || 0) + 1;
        });

        const topStyle = Object.entries(styles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Modern Minimalist';

        setStats({
          total: parsed.length,
          topStyle,
          roomCounts: counts
        });
      }
    } catch (err) {
      console.error("Failed to fetch projects for profile", err);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const newUser = {
      name: formData.name || (userProfile?.name || 'User'),
      email: formData.email,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      avatarColor: '#B3541E'
    };

    localStorage.setItem('vastu_userProfile', JSON.stringify(newUser));
    setUserProfile(newUser);
    showToast(isSignUp ? 'Account created successfully!' : 'Signed in successfully!', 'success');
  };

  const handleSignOut = () => {
    localStorage.removeItem('vastu_userProfile');
    setUserProfile(null);
    showToast('Signed out successfully', 'info');
  };

  const handleUpdateProfile = () => {
    const updated = { ...userProfile, name: editName };
    setUserProfile(updated);
    localStorage.setItem('vastu_userProfile', JSON.stringify(updated));
    setShowEditModal(false);
    showToast('Profile updated', 'success');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = savedDesigns.filter(d => d.id !== id);
        setSavedDesigns(updated);
        showToast('Design removed from history', 'info');
      }
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const handleOpenProjectClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const fullProject = await res.json();
        const mappedData = {
          ...fullProject,
          image: fullProject.originalImageUrl,
          redesignedImage: fullProject.daylightImageUrl,
          nighttimeImage: fullProject.nightlightImageUrl,
          text: fullProject.textAnalysis,
          products: [],
          depthMapImage: null
        };
        onOpenSavedDesign(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch full project details", err);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#0F0E0D] font-sans text-[#1F1F1F] dark:text-[#F5F0E8] transition-colors duration-300">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <div className="flex-1 ml-56 flex items-center justify-center p-12">
          <div className="bg-white dark:bg-[#1A1816] rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border border-gray-100 dark:border-[#3A3632]">
            <div className="w-16 h-16 bg-[#B3541E]/10 rounded-2xl flex items-center justify-center text-[#B3541E] mb-8 mx-auto">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">VastuVision AI</h1>
            <p className="text-gray-500 dark:text-[#A89F94] text-center mb-10 text-sm">Sign in to save your designs and preferences.</p>
            
            <div className="flex bg-gray-100 dark:bg-[#0F0E0D] p-1 rounded-xl mb-8">
              <button 
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white dark:bg-[#1A1816] shadow-sm text-[#B3541E]' : 'text-gray-400 dark:text-[#6B6460]'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white dark:bg-[#1A1816] shadow-sm text-[#B3541E]' : 'text-gray-400 dark:text-[#6B6460]'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 dark:bg-[#242220] border border-transparent dark:border-[#3A3632] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#B3541E] outline-none dark:text-[#F5F0E8] placeholder-gray-400 dark:placeholder-[#6B6460]"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-gray-50 dark:bg-[#242220] border border-transparent dark:border-[#3A3632] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#B3541E] outline-none dark:text-[#F5F0E8] placeholder-gray-400 dark:placeholder-[#6B6460]"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-gray-50 dark:bg-[#242220] border border-transparent dark:border-[#3A3632] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#B3541E] outline-none dark:text-[#F5F0E8] placeholder-gray-400 dark:placeholder-[#6B6460]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-gray-50 dark:bg-[#242220] border border-transparent dark:border-[#3A3632] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#B3541E] outline-none dark:text-[#F5F0E8] placeholder-gray-400 dark:placeholder-[#6B6460]"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-[#B3541E] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#B3541E]/30 mt-6 hover:bg-[#8E4318] transition-colors"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const initials = userProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#0F0E0D] font-sans text-[#1F1F1F] dark:text-[#F5F0E8] transition-colors duration-300">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56 p-12 max-w-6xl">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20 shadow-xl"
              style={{ backgroundColor: userProfile.avatarColor }}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 group">
                <h1 className="text-3xl font-bold tracking-tight">{userProfile.name}</h1>
                <button onClick={() => setShowEditModal(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-[#B3541E] hover:bg-[#B3541E]/10 transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 dark:text-[#6B6460]">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> Member since {userProfile.memberSince}</span>
                <span className="flex items-center gap-1.5"><Mail size={14}/> {userProfile.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3632] text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#242220] transition-colors"
            >
              Edit Profile
            </button>
            <button 
              onClick={handleSignOut}
              className="px-6 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-[#1A1816] rounded-3xl border border-gray-100 dark:border-[#3A3632] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#B3541E]/10 rounded-2xl text-[#B3541E]"><Camera size={24} /></div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Designs</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-[#1A1816] rounded-3xl border border-gray-100 dark:border-[#3A3632] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl"><Box size={24} /></div>
            <div>
              <p className="text-lg font-bold">{Object.keys(stats.roomCounts).length > 0 ? Object.keys(stats.roomCounts)[0] : 'Bedroom'}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Primary Room</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-[#1A1816] rounded-3xl border border-gray-100 dark:border-[#3A3632] shadow-sm flex items-center gap-4">
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
              <Grid size={20} className="text-[#B3541E]" /> Saved Design History
            </h2>
          </div>

          {savedDesigns.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1816] rounded-[2rem] p-16 text-center border border-dashed border-gray-200 dark:border-[#3A3632]">
               <Camera size={48} className="mx-auto text-gray-200 dark:text-[#2E2B28] mb-4" />
               <p className="text-gray-400 dark:text-[#6B6460] font-medium italic">No recent projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDesigns.map((design) => (
                <div 
                  key={design.id} 
                  onClick={(e) => handleOpenProjectClick(design.id, e)}
                  className="group bg-white dark:bg-[#1A1816] rounded-3xl overflow-hidden border border-gray-100 dark:border-[#3A3632] shadow-sm hover:shadow-xl transition-all cursor-pointer relative"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                    {(design.daylightImageUrl) ? (
                      <img src={design.daylightImageUrl} alt={design.roomType} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-200 dark:text-gray-700">
                        <Box size={48} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Metadata Only</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={(e) => handleDelete(design.id, e)}
                        className="p-2 bg-[#B3541E] text-white rounded-xl shadow-lg hover:bg-[#8E4318]"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#B3541E] text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">{design.createdAt ? new Date(design.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B3541E]">{design.roomType}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#B3541E] transition-colors">{design.designStyle || design.style}</h3>
                    <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-gray-400">
                       <ExternalLink size={12} /> Open in Workspace
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1816] rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl border border-gray-100 dark:border-[#3A3632]">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-2xl font-bold tracking-tight mb-2 dark:text-[#F5F0E8]">Edit Profile</h3>
            <p className="text-gray-500 dark:text-[#A89F94] text-sm mb-8">Personalize your VastuVision AI presence.</p>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6B6460]">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#242220] border border-transparent dark:border-[#3A3632] rounded-xl px-4 py-3 text-sm dark:text-[#F5F0E8] outline-none focus:ring-2 focus:ring-[#B3541E]" 
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                className="w-full bg-[#B3541E] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#B3541E]/30 mt-4 hover:bg-[#8E4318]"
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
