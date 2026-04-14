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

import { CheckCircle2, Info, X, ShoppingCart, Trash2, ExternalLink } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose, items, onRemove }: { isOpen: boolean, onClose: () => void, items: any[], onRemove: (id: number) => void }) => {
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#1A1816] shadow-2xl z-[1001] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-transparent dark:border-[#3A3632]`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gray-100 dark:border-[#3A3632] flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ShoppingCart className="text-[#B3541E]" /> Your Cart
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2E2B28] rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-[#242220] rounded-full flex items-center justify-center text-gray-300 dark:text-[#6B6460] mb-4">
                  <ShoppingCart size={24} />
                </div>
                <p className="font-medium text-gray-400 dark:text-[#6B6460] italic">Your cart is currently empty.</p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-[#242220] rounded-xl overflow-hidden border border-gray-100 dark:border-[#3A3632]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-400 dark:text-[#6B6460] mb-2 truncate">{item.brand || 'VastuVision Select'}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#B3541E] text-sm">${item.price?.toLocaleString()}</span>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-red-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-gray-50 dark:bg-[#0F0E0D]/50 border-t border-gray-100 dark:border-[#3A3632]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 dark:text-[#A89F94] font-medium">Total Investment</span>
              <span className="text-2xl font-bold tracking-tight">${total.toLocaleString()}</span>
            </div>
            <button
              disabled={items.length === 0}
              className="w-full bg-[#B3541E] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#B3541E]/20 hover:bg-[#8E4318] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              Checkout Project Items
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info', onClose: () => void }) => (
  <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white dark:bg-[#1A1816] border border-gray-100 dark:border-[#3A3632] rounded-2xl px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-top-8">
    {type === 'success' ? (
      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
        <CheckCircle2 size={18} />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full bg-[#B3541E]/10 flex items-center justify-center text-[#B3541E]">
        <Info size={18} />
      </div>
    )}
    <p className="text-sm font-bold dark:text-[#F5F0E8]">{message}</p>
    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-[#A89F94]">
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

  // Cart State
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: any) => {
    setCartItems(prev => [...prev, product]);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

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

  // Cleanup/Validate localStorage on load
  React.useEffect(() => {
    try {
      const history = localStorage.getItem('vastu_saved_designs');
      if (history) {
        JSON.parse(history);
      }
    } catch (e) {
      console.error('Corrupted design history detected. Clearing storage.', e);
      localStorage.removeItem('vastu_saved_designs');
    }
  }, []);

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
      lat: settings.defaultLat || null,
      lng: settings.defaultLng || null,
      budget: settings.defaultBudget || 4500,
      style: settings.defaultStyle || 'Modern Minimalist',
      roomType: settings.defaultRoom || 'Bedroom',
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDetectingObjects, setIsDetectingObjects] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);

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
    if (!designData.image) {
      showToast('Please upload a room photo first.', 'info');
      setCurrentRoute('step1');
      return;
    }
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
          lat: designData.lat,
          lng: designData.lng,
          pinterestUrl: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to analyze room');
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

      // --- Object Detection (Phase 1) ---
      detectObjects(result.redesignedImage, result.text);

      // --- Automated Cloudinary Sync ---
      saveProject(result);

      setCurrentRoute('project-workspace');
    } catch (err: any) {
      console.error(err);
      showToast(err.message, 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveProject = async (overrideResult?: any) => {
    const resultToSave = overrideResult || apiResult;
    if (!resultToSave) return;

    try {
      console.log("[Cloudinary] Syncing project...");
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redesignedImage: resultToSave.redesignedImage,
          originalImage: resultToSave.image,
          roomType: designData.roomType,
          style: designData.style,
          location: designData.location,
          budget: designData.budget,
          textAnalysis: resultToSave.text,
          detectedObjects: detectedObjects
        })
      });

      if (response.ok) {
        showToast('Project synced with Cloudinary', 'success');
      } else {
        throw new Error('Cloudinary sync failed');
      }
    } catch (e) {
      console.error('Save error:', e);
      // Fallback to local storage if backend fails
      try {
        const history = localStorage.getItem('vastu_saved_designs');
        const parsedHistory = history ? JSON.parse(history) : [];
        const newDesign = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          ...designData,
          ...resultToSave
        };
        localStorage.setItem('vastu_saved_designs', JSON.stringify([newDesign, ...parsedHistory]));
      } catch (localErr) {
        console.warn('LocalStorage fallback failed', localErr);
      }
    }
  };
      setIsGenerating(false);
    }
  };

  const detectObjects = async (redesignedImage: string, analysisText: string) => {
    setIsDetectingObjects(true);
    console.log("[SAM] Starting object detection...");
    try {
      const response = await fetch('/api/detect-objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redesignedImage, analysisText })
      });
      if (!response.ok) throw new Error('Detection failed');
      const data = await response.json();
      setDetectedObjects(data);
      console.log("[SAM] Detected objects:", data);
    } catch (err) {
      console.error("[SAM] Error detecting objects:", err);
    } finally {
      setIsDetectingObjects(false);
    }
  };

  const handleOpenSavedDesign = (design: any) => {
    setApiResult({
      text: design.text || "",
      image: design.image || "",
      redesignedImage: design.redesignedImage || "",
      nighttimeImage: null,
      products: [],
      depthMapImage: null
    });

    setDesignData({
      image: design.image || null,
      vastu: design.direction || 'North',
      ownership: design.ownership || 'own',
      location: design.location || 'Mumbai, India',
      lat: null,
      lng: null,
      budget: design.budget || 4500,
      style: design.style || 'Modern',
      roomType: design.roomType || 'Bedroom',
    });

    showToast(`Loaded: ${design.roomType || 'Project'} from ${design.date}`, 'success');
    setCurrentRoute('project-workspace');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F0E0D] font-sans transition-colors duration-300 text-[#1F1F1F] dark:text-[#F5F0E8]">
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
          showToast={showToast}
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
          geoCity={designData.location}
          cartItems={cartItems}
          onAddToCart={addToCart}
          onOpenCart={() => setIsCartOpen(true)}
          detectedObjects={detectedObjects}
          isDetectingObjects={isDetectingObjects}
          onSaveProject={() => saveProject()}
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

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {isDetectingObjects && (
        <div className="fixed bottom-8 left-8 z-[1000] flex items-center gap-3 bg-white dark:bg-[#1A1816] border border-gray-100 dark:border-[#3A3632] rounded-2xl px-6 py-4 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
          <div className="w-5 h-5 border-2 border-[#B3541E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold dark:text-[#F5F0E8]">Detecting interior objects...</p>
        </div>
      )}
    </div>
  );
}
