import React, { useState } from 'react';
import Dashboard from './screens/Dashboard';
import Step1Space from './screens/Step1Space';
import Step2Constraints from './screens/Step2Constraints';
import Step3Aesthetic from './screens/Step3Aesthetic';
import MyDesigns from './screens/MyDesigns';
import SavedProducts from './screens/SavedProducts';
import ProjectWorkspace from './screens/ProjectWorkspace';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';
type Route = 'dashboard' | 'step1' | 'step2' | 'step3' | 'my-designs' | 'saved-products' | 'project-workspace';

export default function AuraApp() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [activePage, setActivePage] = useState<Page>('home');

  // Shared state for onboarding flow
  const [designData, setDesignData] = useState({
    image: null as string | null,
    vastu: 'North',
    ownership: 'own',
    location: '',
    budget: 4500,
    style: 'Modern Minimalist',
    roomType: 'Bedroom', // Default
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResult, setApiResult] = useState<{
    text: string;
    image: string;
    redesignedImage: string;
    depthMapImage: string | null;
  } | null>(null);

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    if (page === 'home') setCurrentRoute('dashboard');
    else if (page === 'my-designs') setCurrentRoute('my-designs');
    else if (page === 'saved-products') setCurrentRoute('saved-products');
    // other pages like settings/profile can just show a placeholder or dashboard for now
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
      setApiResult({
        text: data.text,
        image: data.image,
        redesignedImage: data.redesignedImage,
        depthMapImage: data.depthMapImage
      });

      setCurrentRoute('project-workspace');
    } catch (err) {
      console.error(err);
      alert('Failed to generate design. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] font-sans">
      {currentRoute === 'dashboard' && (
        <Dashboard 
          onNavigate={handleNavigate} 
          activePage={activePage} 
          onNewProject={handleNewProject} 
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
          onOpenWorkspace={(id) => setCurrentRoute('project-workspace')}
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
        />
      )}
    </div>
  );
}
