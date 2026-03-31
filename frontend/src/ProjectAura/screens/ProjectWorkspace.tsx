import React from 'react';
import { PenTool, LayoutTemplate, Tag, ArrowLeft, Download, Share2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface ProjectWorkspaceProps {
  onBack: () => void;
  apiResult?: {
    text: string;
    image: string;
    redesignedImage: string;
    depthMapImage: string | null;
  } | null;
}

const products = [
  { id: 1, name: 'Aura Velvet Chair', brand: 'Atelier Studio', price: 1240, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop' },
  { id: 2, name: 'Arched Brass Floor Lamp', brand: 'Lumino Co.', price: 850, image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop' },
  { id: 3, name: 'Nordic Oak Coffee Table', brand: 'Hygge Living', price: 490, image: 'https://images.unsplash.com/photo-1533090368676-1fd2548ae20a?w=400&h=300&fit=crop' },
  { id: 4, name: 'Earthen Triptych Art', brand: 'Aura Fine Arts', price: 320, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop' },
];

export default function ProjectWorkspace({ onBack, apiResult }: ProjectWorkspaceProps) {
  return (
    <div className="min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F]">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between py-6 px-8 md:px-12 bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Master Bedroom Redo</h1>
            <p className="text-xs text-gray-400 font-medium">Generated Oct 12, 2023</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A6D50] text-white text-sm font-semibold hover:bg-[#3A5640] transition-colors shadow-md shadow-[#4A6D50]/20">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Vision & Renders */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Main Rendering */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <LayoutTemplate size={18} className="text-[#4A6D50]" /> AI Vision Render
              </h2>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button className="px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Original</button>
                <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-sm font-bold text-[#1F1F1F]">Redesign</button>
              </div>
            </div>

            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group">
              <img 
                src={apiResult?.redesignedImage || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop"} 
                alt="AI Redesign" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Floating Action Button on Image */}
              <button className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
                <PenTool size={16} /> Remediate with AI
              </button>
            </div>
          </div>

          {/* Collage / Moodboard Preview */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Tag size={18} className="text-[#4A6D50]" /> AI Analysis & Concept
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
              {apiResult?.text || "Our AI is analyzing your space to provide Vastu-compliant layout suggestions, color palettes, and lighting recommendations. Traditional principles meet modern aesthetics to create your perfect sanctuary."}
            </div>
            <div className="grid grid-cols-3 gap-4 h-64">
              <div className="col-span-2 rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop" className="w-full h-full object-cover" alt="texture" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-2xl overflow-hidden bg-[#E5E8E6] p-4 flex flex-col justify-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#4A6D50]">Palette</span>
                  <div className="flex gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-[#E5E8E6] border border-gray-300" />
                    <div className="w-6 h-6 rounded-full bg-[#4A6D50] border border-gray-300" />
                    <div className="w-6 h-6 rounded-full bg-[#A89F95] border border-gray-300" />
                  </div>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop" className="w-full h-full object-cover" alt="furniture" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Investment & Shoppable List */}
        <div className="lg:col-span-4 flex flex-col gap-8">

          {/* Investment Summary */}
          <div className="bg-[#4A6D50] text-white rounded-[2rem] p-8 shadow-lg shadow-[#4A6D50]/20 relative overflow-hidden">
            {/* Background flourish */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Estimated Investment</h3>
            <p className="text-4xl font-bold tracking-tight mb-8">$3,200</p>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-white/80">Furniture & Decor</span>
                <span className="font-semibold">$2,900</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-white/80">Paint & Materials</span>
                <span className="font-semibold">$150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Contingency</span>
                <span className="font-semibold">$150</span>
              </div>
            </div>

            <button className="w-full mt-8 bg-white text-[#4A6D50] py-3.5 rounded-xl font-bold shadow-md hover:bg-gray-50 transition-colors text-sm">
              View Detailed Breakdown
            </button>
          </div>

          {/* Sourcing List */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Top Picks</h2>
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">4 Items</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
