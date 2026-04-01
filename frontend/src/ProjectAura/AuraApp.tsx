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

export default function AuraApp() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [activePage, setActivePage] = useState<Page>('home');

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
    <div className="min-h-screen bg-[#FBFBF9] font-sans">
      {currentRoute === 'dashboard' && (
        <Dashboard 
          onNavigate={handleNavigate} 
          activePage={activePage} 
          onNewProject={handleNewProject} 
          onOpenProject={handleOpenSavedDesign}
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
        />
      )}

      {currentRoute === 'profile' && (
        <ProfileSection 
          activePage="profile"
          onOpenSavedDesign={handleOpenSavedDesign}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
