import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import CATEGORY_BRANDS_DATA from '../data/brands.json';
export const CATEGORY_BRANDS = CATEGORY_BRANDS_DATA;

// Fallback brands for unspecified categories
const FALLBACK_BRANDS = [
  { name: "Shopee", url: "https://cdn.simpleicons.org/shopee/white" },
  { name: "Amazon", url: "https://cdn.simpleicons.org/amazon/white" },
  { name: "eBay", url: "https://cdn.simpleicons.org/ebay/white" },
  { name: "Walmart", url: "https://cdn.simpleicons.org/walmart/white" },
  { name: "Target", url: "https://cdn.simpleicons.org/target/white" },
  { name: "AliExpress", url: "https://cdn.simpleicons.org/aliexpress/white" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export default function BrandsPage() {
  const { categoryName } = useParams();
  const [activeLetter, setActiveLetter] = useState(null);

  const brands = useMemo(() => {
    let list = CATEGORY_BRANDS[categoryName];
    if (!list) {
      list = FALLBACK_BRANDS;
    }
    
    // Sort alphabetically
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryName]);

  const groupedBrands = useMemo(() => {
    const groups = {};
    brands.forEach(brand => {
      let firstChar = brand.name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(firstChar)) firstChar = "#";
      
      if (!groups[firstChar]) groups[firstChar] = [];
      groups[firstChar].push(brand);
    });
    return groups;
  }, [brands]);

  const filteredGroups = activeLetter 
    ? { [activeLetter]: groupedBrands[activeLetter] || [] }
    : groupedBrands;

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 mt-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-400 hover:text-indigo-400">Home</Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <Link to={`/category/${encodeURIComponent(categoryName)}`} className="text-slate-400 hover:text-indigo-400">{categoryName}</Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-white font-medium">All Brands</span>
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/10 shadow-sm overflow-hidden min-h-[500px]">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">
            Brands in {categoryName}
          </h1>
          <p className="text-slate-400 text-sm mb-6">Showing {brands.length} brands</p>

          {/* Alphabet Index (Like Shopee) */}
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center items-center py-4 border-t border-b border-white/5">
             <button 
                onClick={() => setActiveLetter(null)}
                className={`w-8 h-8 flex items-center justify-center rounded-md font-semibold transition-colors ${!activeLetter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
             >
                All
             </button>
            {ALPHABET.map(letter => {
              const hasBrands = groupedBrands[letter] && groupedBrands[letter].length > 0;
              return (
                <button
                  key={letter}
                  disabled={!hasBrands}
                  onClick={() => setActiveLetter(letter)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md font-semibold transition-colors
                    ${activeLetter === letter ? 'bg-indigo-600 text-white' : ''}
                    ${!hasBrands ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="p-6 space-y-12">
          {Object.keys(filteredGroups).sort().map(letter => {
            if (filteredGroups[letter].length === 0) return null;
            return (
              <div key={letter} className="relative">
                {/* Letter Header */}
                <h2 className="text-3xl font-bold text-white mb-6 pl-4 border-l-4 border-indigo-500">
                  {letter}
                </h2>
                
                {/* Brand Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredGroups[letter].map((brand, idx) => (
                    <div key={idx} className="group flex flex-col items-center">
                      <div className="w-full aspect-[4/3] bg-white/5 rounded-xl border border-white/10 group-hover:border-indigo-500 transition-all cursor-pointer shadow-md flex items-center justify-center p-4 mb-3 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] relative overflow-hidden">
                        <img 
                           src={brand.url} 
                           alt={brand.name} 
                           className="max-w-full max-h-full object-contain filter group-hover:scale-110 transition-transform opacity-90 group-hover:opacity-100" 
                           onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/222222/FFFFFF?text=' + encodeURIComponent(brand.name.charAt(0)) }}
                        />
                      </div>
                      <span className="text-slate-300 font-medium text-sm text-center group-hover:text-indigo-400 transition-colors line-clamp-1">{brand.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
