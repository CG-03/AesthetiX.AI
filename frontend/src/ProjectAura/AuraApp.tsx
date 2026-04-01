import React, { useState } from 'react';
import Dashboard from './screens/Dashboard';
import Step1Space from './screens/Step1Space';
import Step2Constraints from './screens/Step2Constraints';
import Step3Aesthetic from './screens/Step3Aesthetic';
import MyDesigns from './screens/MyDesigns';
import SavedProducts from './screens/SavedProducts';
import ProjectWorkspace from './screens/ProjectWorkspace';
import SettingsSection from './screens/SettingsSection';
import ProfileSection from './screens/ProfileSection';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';
type Route = 'dashboard' | 'step1' | 'step2' | 'step3' | 'my-designs' | 'saved-products' | 'project-workspace' | 'settings' | 'profile';

import { CheckCircle2, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info', onClose: () => void }) => (
  <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-top-8">
    {type === 'success' ? (
      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
        <CheckCircle2 size={18} />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full bg-[#4A6D50]/10 flex items-center justify-center text-[#4A6D50]">
        <Info size={18} />
      </div>
    )}
    <p className="text-sm font-bold dark:text-white">{message}</p>
    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <X size={16} />
    </button>
  </div>
);

export default function AuraApp() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [activePage, setActivePage] = useState<Page>('home');

  // New Global States
  const [theme, setTheme] = useState(() => localStorage.getItem('vastu_theme') || 'light');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('vastu_fontSize') || 'medium');
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('vastu_userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  // Apply Theme and Font Size
  React.useEffect(() => {
    // Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('vastu_theme', theme);

    // Font Size
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[fontSize as keyof typeof sizes] || '16px';
    localStorage.setItem('vastu_fontSize', fontSize);
  }, [theme, fontSize]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Shared state for onboarding flow
  const [designData, setDesignData] = useState(() => {
    const saved = localStorage.getItem('vastu_settings');
    const settings = saved ? JSON.parse(saved) : {};
    return {
      image: null as string | null,
      vastu: settings.defaultDirection || 'North',
      ownership: 'own',
      location: settings.defaultLocation || 'Mumbai, India',
      budget: settings.defaultBudget || 4500,
      style: settings.defaultStyle || 'Modern Minimalist',
      roomType: settings.defaultRoom || 'Living Room',
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResult, setApiResult] = useState<{
    text: string;
    image: string;
    redesignedImage: string;
    nighttimeImage: string | null;
    products: any[];
    depthMapImage: string | null;
  } | null>(null);

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    if (page === 'home') setCurrentRoute('dashboard');
    else if (page === 'my-designs') setCurrentRoute('my-designs');
    else if (page === 'saved-products') setCurrentRoute('saved-products');
    else if (page === 'settings') setCurrentRoute('settings');
    else if (page === 'profile') setCurrentRoute('profile');
    else setCurrentRoute('dashboard'); 
  };

  const handleNewProject = () => {
    setCurrentRoute('step1');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: designData.image,
          roomType: designData.roomType,
          style: designData.style,
          budget: designData.budget,
          ownership: designData.ownership,
          direction: designData.vastu,
          location: designData.location,
          pinterestUrl: ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze room');
      }

      const data = await response.json();
      const result = {
        text: data.text,
        image: data.image,
        redesignedImage: data.redesignedImage,
        nighttimeImage: data.nighttimeImage || null,
        products: data.products || [],
        depthMapImage: data.depthMapImage
      };
      
      setApiResult(result);

      // Save to History
      const history = localStorage.getItem('vastu_saved_designs');
      const parsedHistory = history ? JSON.parse(history) : [];
      const newDesign = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        roomType: designData.roomType,
        style: designData.style,
        ...result
      };
      localStorage.setItem('vastu_saved_designs', JSON.stringify([newDesign, ...parsedHistory]));

      setCurrentRoute('project-workspace');
    } catch (err) {
      console.error(err);
      alert('Failed to generate design. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSavedDesign = (design: any) => {
    setApiResult({
      text: design.text,
      image: design.image,
      redesignedImage: design.redesignedImage,
      nighttimeImage: design.nighttimeImage,
      products: design.products,
      depthMapImage: design.depthMapImage
    });
    setDesignData(prev => ({
      ...prev,
      roomType: design.roomType,
      style: design.style
    }));
    setCurrentRoute('project-workspace');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#121212] font-sans transition-colors duration-300 text-[#1F1F1F] dark:text-white">
      {currentRoute === 'dashboard' && (
        <Dashboard 
          onNavigate={handleNavigate} 
          activePage={activePage} 
          onNewProject={handleNewProject} 
          onOpenProject={handleOpenSavedDesign}
          userProfile={userProfile}
          setDesignData={setDesignData}
          showToast={showToast}
        />
      )}

      {currentRoute === 'step1' && (
        <Step1Space
          onNext={() => setCurrentRoute('step2')}
          onBack={() => setCurrentRoute('dashboard')}
          onDataChange={(data) => setDesignData(prev => ({ ...prev, ...data }))}
        />
      )}

      {currentRoute === 'step2' && (
        <Step2Constraints
          onNext={() => setCurrentRoute('step3')}
          onBack={() => setCurrentRoute('step1')}
          onDataChange={(data) => setDesignData(prev => ({ ...prev, ...data }))}
        />
      )}

      {currentRoute === 'step3' && (
        <Step3Aesthetic
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onBack={() => setCurrentRoute('step2')}
          onDataChange={(data) => setDesignData(prev => ({ ...prev, ...data }))}
        />
      )}

      {currentRoute === 'my-designs' && (
        <MyDesigns 
          onNavigate={handleNavigate} 
          activePage={activePage} 
          onNewProject={handleNewProject}
          onOpenWorkspace={handleOpenSavedDesign}
        />
      )}

      {currentRoute === 'saved-products' && (
        <SavedProducts 
          onNavigate={handleNavigate} 
          activePage={activePage} 
        />
      )}

      {currentRoute === 'project-workspace' && (
        <ProjectWorkspace 
          onBack={() => setCurrentRoute('dashboard')} 
          apiResult={apiResult}
          budget={designData.budget}
        />
      )}

      {currentRoute === 'settings' && (
        <SettingsSection 
          onNavigate={handleNavigate}
          activePage={activePage}
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          showToast={showToast}
          designData={designData}
          setDesignData={setDesignData}
        />
      )}

      {currentRoute === 'profile' && (
        <ProfileSection 
          activePage="profile"
          onOpenSavedDesign={handleOpenSavedDesign}
          onNavigate={handleNavigate}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          showToast={showToast}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
