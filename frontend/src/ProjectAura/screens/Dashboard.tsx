import React from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  onNewProject: () => void;
  onOpenProject: (design: any) => void;
}

export default function Dashboard({ onNavigate, activePage, onNewProject, onOpenProject }: DashboardProps) {
  const [userName, setUserName] = React.useState('Sarah');
  const [recentProjects, setRecentProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('vastu_user');
    if (savedUser) setUserName(JSON.parse(savedUser).name.split(' ')[0]);

    const history = localStorage.getItem('vastu_saved_designs');
    if (history) setRecentProjects(JSON.parse(history).slice(0, 3));
  }, []);

  const inspiration = [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600607687931-570a2fbdba2f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=400&h=400&fit=crop',
  ];

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F]">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56 p-8">
        {/* Welcome Header */}
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {userName}.</h1>
            <p className="text-gray-500 text-sm">You have {recentProjects.length} active projects in your workspace.</p>
          </div>
          <button 
            onClick={onNewProject}
            className="flex items-center gap-2 bg-[#4A6D50] text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-[#3A5640] transition-colors shadow-lg shadow-[#4A6D50]/20"
          >
            <Plus size={18} /> Start New Design
          </button>
        </header>

        {/* Recent Projects Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Recent Projects</h2>
            <button 
              onClick={() => onNavigate('my-designs')}
              className="text-sm font-semibold text-[#4A6D50] flex items-center gap-1 hover:text-[#3A5640] transition-colors"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {recentProjects.length > 0 ? recentProjects.map((project, i) => (
              <div key={i} className="group cursor-pointer" onClick={() => onOpenProject(project)}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-100 dark:border-gray-800 shadow-sm group-hover:shadow-md transition-all">
                  <img 
                    src={project.redesignedImage || project.image} 
                    alt={project.roomType || project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <h3 className="font-bold text-sm mb-1">{project.style || project.title}</h3>
                <p className="text-xs text-gray-400 font-medium">{project.roomType || project.date}</p>
              </div>
            )) : (
              <div className="col-span-3 py-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 font-medium">No recent projects yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Inspiration Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Curated Inspiration</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {inspiration.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 group cursor-pointer">
                <img 
                  src={img} 
                  alt="Inspiration" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
