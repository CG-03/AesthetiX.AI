import React from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  brand: string;
  price: number;
  id: number;
  amazonLink?: string;
  indiaMartLink?: string;
  onClick3D?: () => void;
  onAddToCart?: (product: any) => void;
}

export default function ProductCard({ image, name, brand, price, id, amazonLink, indiaMartLink, onClick3D, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-[#FAFAFA] dark:bg-gray-900 rounded-[1.5rem] p-4 border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-md transition-shadow relative group/card">
      <button 
        onClick={() => onAddToCart?.({ image, name, brand, price, id })}
        className="absolute top-4 right-4 w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-100 dark:border-gray-700 z-10 text-gray-500 hover:text-[#4A6D50] hover:scale-110 transition-all"
      >
        <ShoppingCart size={14} />
      </button>

      <div 
        className="aspect-[4/3] rounded-2xl bg-white dark:bg-gray-800 mb-4 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer relative group"
        onClick={onClick3D}
      >
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">View in 3D</span>
        </div>
      </div>

      <div className="flex justify-between items-start mb-0.5">
        <h4 className="font-bold text-[13px] text-[#1F1F1F] dark:text-white tracking-tight truncate flex-1 pr-2">{name}</h4>
        <span className="font-bold text-[#4A6D50] text-[13px]">${price.toLocaleString()}</span>
      </div>
      <p className="text-[10px] text-gray-400 mb-4">{brand || 'VastuVision Select'}</p>

      <div className="mt-auto space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <a 
            href={amazonLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-[#FF9900]/10 text-[#FF9900] py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-[#FF9900] hover:text-white transition-colors"
          >
            Amazon <ExternalLink size={10} />
          </a>
          <a 
            href={indiaMartLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-[#BC2031]/10 text-[#BC2031] py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-[#BC2031] hover:text-white transition-colors"
          >
             IndiaMart <ExternalLink size={10} />
          </a>
        </div>
        <button 
          onClick={onClick3D}
          className="w-full bg-[#E5E8E6] dark:bg-gray-800 text-[#4A6D50] py-2.5 rounded-xl text-[10px] font-bold uppercase transition-colors hover:bg-[#4A6D50] hover:text-white"
        >
          Check 3D Fit
        </button>
      </div>
    </div>
  );
}
