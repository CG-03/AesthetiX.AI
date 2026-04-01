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
    const history = localStorage.getItem('vastu_saved_designs');
    if (history) {
      const parsed = JSON.parse(history);
      setSavedDesigns(parsed);
      
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
    if (userProfile) setEditName(userProfile.name);
  }, [userProfile]);

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
      avatarColor: '#4A6D50'
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDesigns.filter(d => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem('vastu_saved_designs', JSON.stringify(updated));
    showToast('Design removed from history', 'info');
  };

  if (!userProfile) {
    return (
      <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#121212] font-sans text-[#1F1F1F] dark:text-white transition-colors duration-300">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <div className="flex-1 ml-56 flex items-center justify-center p-12">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-[#4A6D50]/10 rounded-2xl flex items-center justify-center text-[#4A6D50] mb-8 mx-auto">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">VastuVision AI</h1>
            <p className="text-gray-500 text-center mb-10 text-sm">Sign in to save your designs and preferences.</p>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
              <button 
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white dark:bg-gray-700 shadow-sm text-[#4A6D50]' : 'text-gray-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white dark:bg-gray-700 shadow-sm text-[#4A6D50]' : 'text-gray-400'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#4A6D50] outline-none"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#4A6D50] outline-none"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#4A6D50] outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#4A6D50] outline-none"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-[#4A6D50] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#4A6D50]/30 mt-6 hover:bg-[#3A5640] transition-colors"
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
    <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#121212] font-sans text-[#1F1F1F] dark:text-white transition-colors duration-300">
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
                <button onClick={() => setShowEditModal(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-[#4A6D50] hover:bg-[#4A6D50]/10 transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> Member since {userProfile.memberSince}</span>
                <span className="flex items-center gap-1.5"><Mail size={14}/> {userProfile.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
          <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#4A6D50]/10 rounded-2xl text-[#4A6D50]"><Camera size={24} /></div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Designs</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl"><Box size={24} /></div>
            <div>
              <p className="text-lg font-bold">{Object.keys(stats.roomCounts).length > 0 ? Object.keys(stats.roomCounts)[0] : 'Bedroom'}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Primary Room</p>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
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
                  className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all cursor-pointer relative"
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
            <h3 className="text-2xl font-bold tracking-tight mb-2 dark:text-white">Edit Profile</h3>
            <p className="text-gray-500 text-sm mb-8">Personalize your VastuVision AI presence.</p>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#4A6D50]" 
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
