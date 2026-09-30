import { Filter, Star, ChevronDown, Check } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CATEGORY_BRANDS_DATA from '../data/brands.json';

export default function FilterSidebar({ onApplyFilter }) {
  const { categoryName } = useParams();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  
  // Visual states for other filters
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedShopTypes, setSelectedShopTypes] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [isExpress, setIsExpress] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllShopTypes, setShowAllShopTypes] = useState(false);

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
        brands: CATEGORY_BRANDS_DATA[categoryName] 
          ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
          : ["YaMe", "Coolmate", "Zara", "H&M", "Uniqlo", "Aristino", "Gucci", "Adidas"]
      };
    }
    
    if (techKeywords.some(kw => catLower.includes(kw))) {
      return {
        subCategories: ["Smartphones", "Tablets", "Laptops", "Smartwatches", "Headphones", "Accessories", "Chargers", "Cases"],
        brands: CATEGORY_BRANDS_DATA[categoryName] 
          ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
          : ["Apple", "Samsung", "Sony", "Dell", "Baseus", "Anker", "Logitech", "Asus"]
      };
    }

    // Default generic filters
    return {
      subCategories: ["New Arrivals", "Best Sellers", "Clearance", "Trending Now", "Everyday Essentials"],
      brands: CATEGORY_BRANDS_DATA[categoryName] 
        ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
        : ["Shopee", "Amazon", "eBay", "Walmart", "Target", "AliExpress"]
    };
  }, [categoryName]);

  const { subCategories, brands } = filterData;

  const toggleArrayItem = (setter, item) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  useEffect(() => {
    if (onApplyFilter) {
      onApplyFilter({
        minPrice: priceMin,
        maxPrice: priceMax,
        brandsFilter: selectedBrands,
        ratingFilter: selectedRating,
        subCategory: selectedSubCategory
      });
    }
  }, [priceMin, priceMax, selectedBrands, selectedRating, selectedSubCategory, onApplyFilter]);

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
          {(showAllCategories ? subCategories : subCategories.slice(0, 4)).map((sub, idx) => (
            <li key={idx}>
              <button 
                onClick={() => setSelectedSubCategory(selectedSubCategory === sub ? '' : sub)}
                className={`pl-3.5 text-left transition-colors font-medium flex items-center gap-2 ${selectedSubCategory === sub ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {selectedSubCategory === sub && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                {sub}
              </button>
            </li>
          ))}
          {subCategories.length > 4 && (
            <li>
              <button 
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-slate-500 hover:text-slate-300 pl-3.5 flex items-center gap-1"
              >
                {showAllCategories ? 'Less' : 'More'} <ChevronDown className={`w-3 h-3 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
              </button>
            </li>
          )}
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
          {(showAllLocations ? locations : locations.slice(0, 3)).map((loc, idx) => {
            const isSelected = selectedLocations.includes(loc);
            return (
              <div key={idx} onClick={() => toggleArrayItem(setSelectedLocations, loc)} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{loc}</span>
              </div>
            );
          })}
          {locations.length > 3 && (
            <button onClick={() => setShowAllLocations(!showAllLocations)} className="text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">
              {showAllLocations ? 'Less' : 'More'} <ChevronDown className={`w-3 h-3 transition-transform ${showAllLocations ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Shipping */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Shipping Option</h4>
        <div onClick={() => setIsExpress(!isExpress)} className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isExpress ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'}`}>
             {isExpress && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-slate-400 text-sm group-hover:text-slate-200">Express</span>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Brand */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Brand</h4>
        <div className="space-y-2.5">
          {(showAllBrands ? brands : brands.slice(0, 5)).map((brand, idx) => {
            const isSelected = selectedBrands.includes(brand);
            return (
              <div 
                key={idx} 
                onClick={() => toggleArrayItem(setSelectedBrands, brand)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{brand}</span>
              </div>
            );
          })}
          {brands.length > 5 && (
            <button onClick={() => setShowAllBrands(!showAllBrands)} className="text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">
              {showAllBrands ? 'Less' : 'More'} <ChevronDown className={`w-3 h-3 transition-transform ${showAllBrands ? 'rotate-180' : ''}`} />
            </button>
          )}
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
        <button 
          onClick={() => onApplyFilter && onApplyFilter(priceMin, priceMax, selectedBrands, selectedRating)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md text-sm transition-colors uppercase tracking-wider"
        >
          Apply
        </button>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Shop Type */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Shop Type</h4>
        <div className="space-y-2.5">
          {(showAllShopTypes ? shopTypes : shopTypes.slice(0, 2)).map((type, idx) => {
            const isSelected = selectedShopTypes.includes(type);
            return (
              <div key={idx} onClick={() => toggleArrayItem(setSelectedShopTypes, type)} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{type}</span>
              </div>
            );
          })}
          {shopTypes.length > 2 && (
            <button onClick={() => setShowAllShopTypes(!showAllShopTypes)} className="text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">
              {showAllShopTypes ? 'Less' : 'More'} <ChevronDown className={`w-3 h-3 transition-transform ${showAllShopTypes ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Condition */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Condition</h4>
        <div className="space-y-2.5">
          {conditions.map((cond, idx) => {
            const isSelected = selectedConditions.includes(cond);
            return (
              <div key={idx} onClick={() => toggleArrayItem(setSelectedConditions, cond)} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{cond}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-medium mb-3 text-sm">Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button 
              key={rating} 
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-2 p-1.5 rounded transition-colors w-full ${selectedRating === rating ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'}`}
            >
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
        <div onClick={() => setIsOnSale(!isOnSale)} className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isOnSale ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'}`}>
             {isOnSale && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-slate-400 text-sm group-hover:text-slate-200">On Sale</span>
        </div>
      </div>
    </div>
  );
}
