import { Filter, Star, ChevronDown, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

export default function FilterSidebar() {
  const { categoryName } = useParams();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
  const shopTypes = ["Shopee Mall", "Preferred Shop", "Processed by Shopee"];
  const conditions = ["New", "Used"];

  // Dynamic filter mappings
  const filterData = useMemo(() => {
    const catLower = (categoryName || '').toLowerCase();
    
    const fashionKeywords = ['fashion', 'shoe', 'bag', 'apparel', 'beauty', 'watch'];
    const techKeywords = ['smart', 'phone', 'laptop', 'computer', 'electronic', 'audio', 'gaming', 'camera', 'appliance'];
    
    if (fashionKeywords.some(kw => catLower.includes(kw))) {
      return {
        subCategories: ["Jackets", "Suits & Blazers", "Hoodies & Sweaters", "Jeans", "Pants", "Shirts", "T-Shirts", "Shorts"],
        brands: ["Nike", "Adidas", "Puma", "Zara", "Uniqlo", "Under Armour", "Gucci", "Levis"]
      };
    }
    
    if (techKeywords.some(kw => catLower.includes(kw))) {
      return {
        subCategories: ["Smartphones", "Tablets", "Laptops", "Smartwatches", "Headphones", "Accessories", "Chargers", "Cases"],
        brands: ["Apple", "Samsung", "Sony", "Dell", "Asus", "Intel", "LG", "HP"]
      };
    }

    // Default generic filters
    return {
      subCategories: ["New Arrivals", "Best Sellers", "Clearance", "Trending Now", "Everyday Essentials"],
      brands: ["Ikea", "Target", "eBay", "Shopee", "Amazon", "Walmart"]
    };
  }, [categoryName]);

  const { subCategories, brands } = filterData;

  return (
    <div className="w-full bg-[#111] rounded-2xl border border-white/10 p-5 shadow-sm">
      {/* Category List */}
      <div className="mb-6">
        <h3 className="font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          All Categories
        </h3>
        <ul className="space-y-2.5 text-sm">
          <li>
            <button className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {categoryName || 'All Categories'}
            </button>
          </li>
          {subCategories.map((sub, idx) => (
            <li key={idx}><button className="text-slate-400 hover:text-slate-200 pl-3.5 text-left">{sub}</button></li>
          ))}
          <li><button className="text-slate-500 hover:text-slate-300 pl-3.5 flex items-center gap-1">More <ChevronDown className="w-3 h-3" /></button></li>
        </ul>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Filter Header */}
      <h3 className="font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Search Filter
      </h3>

      {/* Location */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Location</h4>
        <div className="space-y-2.5">
          {locations.map((loc, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                <Check className="w-3 h-3 text-transparent" />
              </div>
              <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{loc}</span>
            </label>
          ))}
          <button className="text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">More <ChevronDown className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Shipping */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Shipping Option</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-indigo-400 transition-colors"></div>
          <span className="text-slate-400 text-sm group-hover:text-slate-200">Express</span>
        </label>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Brand */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Brand</h4>
        <div className="space-y-2.5">
          {brands.map((brand, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-indigo-400 transition-colors"></div>
              <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{brand}</span>
            </label>
          ))}
          <button className="text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">More <ChevronDown className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Price Range</h4>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" 
            placeholder="$ MIN"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
          />
          <span className="text-slate-500">-</span>
          <input 
            type="number" 
            placeholder="$ MAX"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
          />
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md text-sm transition-colors uppercase tracking-wider">
          Apply
        </button>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Shop Type */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Shop Type</h4>
        <div className="space-y-2.5">
          {shopTypes.map((type, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-indigo-400 transition-colors"></div>
              <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{type}</span>
            </label>
          ))}
          <button className="text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">More <ChevronDown className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Condition */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Condition</h4>
        <div className="space-y-2.5">
          {conditions.map((cond, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-indigo-400 transition-colors"></div>
              <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{cond}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button key={rating} className="flex items-center gap-2 hover:bg-white/5 p-1 rounded transition-colors w-full">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                ))}
              </div>
              {rating < 5 && <span className="text-slate-400 text-xs">& Up</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Promotions */}
      <div className="mb-2">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Services & Promotions</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-indigo-400 transition-colors"></div>
          <span className="text-slate-400 text-sm group-hover:text-slate-200">On Sale</span>
        </label>
      </div>
    </div>
  );
}
