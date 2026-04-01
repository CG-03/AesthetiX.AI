import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Type, Home, Layout, DollarSign, MapPin, 
  Compass, Mail, Bell, Lock, Trash2, Check, Cpu, Image as ImageIcon,
  X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface SettingsSectionProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
  designData: any;
  setDesignData: (data: any) => void;
}

export default function SettingsSection({ 
  onNavigate, 
  activePage, 
  theme, 
  setTheme, 
  fontSize, 
  setFontSize, 
  showToast,
  designData,
  setDesignData
}: SettingsSectionProps) {
  const [localSettings, setLocalSettings] = useState({
    defaultRoom: designData.roomType || 'Living Room',
    defaultStyle: designData.style || 'Modern Minimalist',
    defaultBudget: designData.budget || 4500,
    defaultLocation: designData.location || 'Mumbai, India',
    defaultDirection: designData.vastu || 'North',
    emailNotifications: true,
    designAlerts: true
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = () => {
    const finalSettings = {
      ...localSettings,
      theme,
      fontSize
    };
    localStorage.setItem('vastu_settings', JSON.stringify(finalSettings));
    
    // Update global design data to reflect defaults immediately
    setDesignData((prev: any) => ({
      ...prev,
      roomType: localSettings.defaultRoom,
      style: localSettings.defaultStyle,
      budget: localSettings.defaultBudget,
      location: localSettings.defaultLocation,
      vastu: localSettings.defaultDirection
    }));

    showToast('Preferences saved successfully!', 'success');
  };

  const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
      <div className="p-2 bg-[#4A6D50]/10 rounded-lg text-[#4A6D50]">
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-bold tracking-tight dark:text-white">{title}</h2>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] dark:bg-[#121212] font-sans text-[#1F1F1F] transition-colors duration-300">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56 p-12 max-w-5xl">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure your personal Vastu AI workspace preferences.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 1. Appearance */}
          <section>
            <SectionHeader title="Appearance" icon={Sun} />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm dark:text-white">Theme Mode</p>
                  <p className="text-xs text-gray-400">Switch between light and dark visual styles.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white shadow-sm text-[#4A6D50]' : 'text-gray-400'}`}>
                    <Sun size={18} />
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-[#4A6D50] text-white shadow-sm' : 'text-gray-400'}`}>
                    <Moon size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm dark:text-white">Font Size</p>
                  <p className="text-xs text-gray-400">Adjust the interface text scaling.</p>
                </div>
                <select 
                  value={fontSize}
                  onChange={e => setFontSize(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 focus:ring-[#4A6D50] focus:border-[#4A6D50] dark:text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. Design Preferences */}
          <section>
            <SectionHeader title="Design Preferences" icon={Home} />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Default Room</label>
                  <select 
                    value={localSettings.defaultRoom}
                    onChange={e => setLocalSettings(s => ({ ...s, defaultRoom: e.target.value }))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 dark:text-white"
                  >
                    <option>Living Room</option>
                    <option>Bedroom</option>
                    <option>Kitchen</option>
                    <option>Dining Room</option>
                    <option>Study</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Design Style</label>
                  <select 
                    value={localSettings.defaultStyle}
                    onChange={e => setLocalSettings(s => ({ ...s, defaultStyle: e.target.value }))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 dark:text-white"
                  >
                    <option>Modern Minimalist</option>
                    <option>Traditional Indian</option>
                    <option>Boho Chic</option>
                    <option>Industrial</option>
                    <option>Mid-Century Modern</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Default Budget ($)</label>
                  <input 
                    type="number"
                    value={localSettings.defaultBudget}
                    onChange={e => setLocalSettings(s => ({ ...s, defaultBudget: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Default Direction</label>
                  <select 
                    value={localSettings.defaultDirection}
                    onChange={e => setLocalSettings(s => ({ ...s, defaultDirection: e.target.value }))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 dark:text-white"
                  >
                    <option>North</option>
                    <option>East</option>
                    <option>South</option>
                    <option>West</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="w-full bg-[#4A6D50] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#3A5640] transition-colors mt-2"
              >
                Save Preferences
              </button>
            </div>
          </section>

          {/* 3. AI Model Info */}
          <section>
            <SectionHeader title="AI Model Info" icon={Cpu} />
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center">
                    <Type size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Analysis Model</p>
                    <p className="text-sm font-bold dark:text-white">NVIDIA Nemotron Nano 12B VL</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Vision Render Model</p>
                    <p className="text-sm font-bold dark:text-white">Gemini 2.5 Flash Image</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Notifications */}
          <section>
            <SectionHeader title="Notifications" icon={Bell} />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400"><Mail size={16} /></div>
                  <p className="text-sm font-semibold dark:text-white">Email Notifications</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={localSettings.emailNotifications}
                  onChange={e => setLocalSettings(s => ({ ...s, emailNotifications: e.target.checked }))}
                  className="w-5 h-5 rounded text-[#4A6D50] focus:ring-[#4A6D50]"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400"><Bell size={16} /></div>
                  <p className="text-sm font-semibold dark:text-white">Design Alerts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={localSettings.designAlerts}
                  onChange={e => setLocalSettings(s => ({ ...s, designAlerts: e.target.checked }))}
                  className="w-5 h-5 rounded text-[#4A6D50] focus:ring-[#4A6D50]"
                />
              </div>
            </div>
          </section>

          {/* 5. Account */}
          <section className="md:col-span-2">
            <SectionHeader title="Account Management" icon={Lock} />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                <Lock size={16} /> Change Password
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-2xl font-bold tracking-tight mb-2 dark:text-white">Change Password</h3>
            <p className="text-gray-500 text-sm mb-8">Update your security credentials for VastuVision AI.</p>
            <div className="space-y-4">
              <input type="password" placeholder="Current Password" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#4A6D50]" />
              <input type="password" placeholder="New Password" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#4A6D50]" />
              <input type="password" placeholder="Confirm New Password" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#4A6D50]" />
              <button className="w-full bg-[#4A6D50] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#4A6D50]/30 mt-4">Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2 dark:text-white">Delete Account?</h3>
            <p className="text-gray-500 text-sm mb-10">This action is permanent and will delete all your generated designs and profile data. We'll miss you!</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">Cancel</button>
              <button className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20">Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
