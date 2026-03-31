import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  brand: string;
  price: number;
}

export default function ProductCard({ image, name, brand, price }: ProductCardProps) {
  return (
    <div className="bg-[#FAFAFA] rounded-[1.5rem] p-4 border border-gray-100 flex flex-col hover:shadow-md transition-shadow relative">
      <button className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 z-10 text-gray-500 hover:text-[#4A6D50]">
        <ShoppingBag size={12} />
      </button>

      <div className="aspect-[4/3] rounded-2xl bg-white mb-4 overflow-hidden border border-gray-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-[14px] text-[#1F1F1F] tracking-tight">{name}</h4>
        <span className="font-bold text-[#4A6D50] text-[13px]">${price.toLocaleString()}</span>
      </div>
      <p className="text-[11px] text-gray-400 mb-6">{brand}</p>

      <div className="mt-auto">
        <button className="w-full bg-[#E5E8E6] text-[#4A6D50] py-2.5 rounded-xl text-xs font-bold uppercase transition-colors hover:bg-[#4A6D50] hover:text-white">
          Buy Now
        </button>
      </div>
    </div>
  );
}
