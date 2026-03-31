import React, { useState } from 'react';
import { Search, SlidersHorizontal, Heart, ShoppingBag, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';

type Page = 'home' | 'my-designs' | 'saved-products' | 'settings' | 'profile';

interface SavedProductsProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
}

const categories = ['All', 'Seating', 'Lighting', 'Tables', 'Storage', 'Decor', 'Rugs', 'Art'];

const products = [
  { id: 1, name: 'Aura Velvet Chair', brand: 'Atelier Studio', price: 1240, category: 'Seating', saved: true, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop' },
  { id: 2, name: 'Arched Brass Floor Lamp', brand: 'Lumino Co.', price: 850, category: 'Lighting', saved: true, image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop' },
  { id: 3, name: 'Nordic Oak Coffee Table', brand: 'Hygge Living', price: 490, category: 'Tables', saved: true, image: 'https://images.unsplash.com/photo-1533090368676-1fd2548ae20a?w=400&h=300&fit=crop' },
  { id: 4, name: 'Earthen Triptych Art', brand: 'Aura Fine Arts', price: 320, category: 'Art', saved: true, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop' },
  { id: 5, name: 'Rattan Pendant Light', brand: 'Boho Casa', price: 210, category: 'Lighting', saved: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { id: 6, name: 'Minimalist Accent Rug', brand: 'Nordic Weave', price: 380, category: 'Rugs', saved: true, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
  { id: 7, name: 'Marble Side Table', brand: 'Stone & Co.', price: 560, category: 'Tables', saved: false, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop' },
  { id: 8, name: 'Geometric Bookshelf', brand: 'Form Studio', price: 720, category: 'Storage', saved: false, image: 'https://images.unsplash.com/photo-1558618048-fbd7cda8d6a5?w=400&h=300&fit=crop' },
];

export default function SavedProducts({ onNavigate, activePage }: SavedProductsProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedState, setSavedState] = useState<Record<number, boolean>>(
    Object.fromEntries(products.map(p => [p.id, p.saved]))
  );

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const toggleSave = (id: number) => {
    setSavedState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBF9] font-sans text-[#1F1F1F]">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <div className="flex-1 ml-56">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#FBFBF9] border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Saved Products</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search products..."
                className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A6D50]/30 w-56 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={15} /> Filter
            </button>
          </div>
        </header>

        <main className="px-8 py-8">
          {/* Category Filters */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#4A6D50] text-white shadow-md shadow-[#4A6D50]/20'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Save Button */}
                  <button
                    onClick={() => toggleSave(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={14}
                      className={savedState[product.id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-bold text-[14px] text-[#1F1F1F] tracking-tight leading-snug">{product.name}</h4>
                    <span className="font-bold text-[#4A6D50] text-[13px] shrink-0 ml-2">${product.price.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1">{product.brand}</p>
                  <span className="inline-block bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-4">
                    {product.category}
                  </span>
                  <button className="mt-auto w-full bg-[#E5E8E6] text-[#4A6D50] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors hover:bg-[#4A6D50] hover:text-white flex items-center justify-center gap-2">
                    <ShoppingBag size={13} /> Buy Now
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Card */}
            <div className="bg-white rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:border-[#4A6D50] hover:bg-[#4A6D50]/5 transition-all cursor-pointer group aspect-auto min-h-[280px]">
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#4A6D50]/20 flex items-center justify-center mb-3 transition-colors">
                <Plus size={20} className="text-gray-400 group-hover:text-[#4A6D50]" />
              </div>
              <p className="font-semibold text-sm text-gray-500 group-hover:text-[#4A6D50] transition-colors">Explore More</p>
              <p className="text-[11px] text-gray-400 mt-1">Browse the full catalog</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
