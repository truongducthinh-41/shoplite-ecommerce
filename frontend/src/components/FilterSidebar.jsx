import { Filter, Star, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CATEGORY_BRANDS_DATA from '../data/brands.json';

export default function FilterSidebar({
  minPrice = '',
  setMinPrice,
  maxPrice = '',
  setMaxPrice,
  brandsFilter = [],
  setBrandsFilter,
  ratingFilter = null,
  setRatingFilter,
  subCategoryFilter = '',
  setSubCategoryFilter,
  onApplyFilter
}) {
  const { categoryName } = useParams();
  const [localMin, setLocalMin] = useState(minPrice || '');
  const [localMax, setLocalMax] = useState(maxPrice || '');

  // Keep local price inputs in sync with props
  useEffect(() => {
    setLocalMin(minPrice || '');
  }, [minPrice]);

  useEffect(() => {
    setLocalMax(maxPrice || '');
  }, [maxPrice]);

  // Visual decorative states
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedShopTypes, setSelectedShopTypes] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [isExpress, setIsExpress] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllShopTypes, setShowAllShopTypes] = useState(false);

  const locations = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
  const shopTypes = ["Shopee Mall", "Shop Yêu Thích", "ShopLite Global"];
  const conditions = ["Mới 100%", "Đã sử dụng"];

  // Dynamic subcategories & brands mapping
  const filterData = useMemo(() => {
    const catLower = (categoryName || '').toLowerCase();
    
    // Fashion categories
    if (catLower.includes('fashion') || catLower.includes('shoe') || catLower.includes('bag') || catLower.includes('apparel')) {
      return {
        subCategories: ["Áo Khoác & Blazer", "Hoodie & Sweater", "Quần Jeans", "Áo Thun Polo", "Sơ Mi Công Sở", "Váy & Đầm Dự Tiệc", "Sneaker", "Giày Cao Gót"],
        brands: CATEGORY_BRANDS_DATA[categoryName] 
          ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
          : ["Nike", "Adidas", "Coolmate", "Uniqlo", "Aristino", "Charles & Keith", "Gucci", "Chanel"]
      };
    }
    
    // Tech & Electronics categories
    if (catLower.includes('smart') || catLower.includes('phone') || catLower.includes('laptop') || catLower.includes('computer') || catLower.includes('electronic') || catLower.includes('audio') || catLower.includes('gaming') || catLower.includes('camera')) {
      return {
        subCategories: ["Flagship Phone", "Phụ Kiện & Cáp Sạc", "Laptop Văn Phòng", "Laptop Gaming", "Tai Nghe Chống Ồn", "Loa Bluetooth", "Máy Ảnh Mirrorless", "Máy Game Console"],
        brands: CATEGORY_BRANDS_DATA[categoryName] 
          ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
          : ["Apple", "Samsung", "Sony", "Dell", "Asus", "Logitech", "Canon", "Nintendo", "Marshall", "JBL"]
      };
    }

    // Home, Appliances & Others
    if (catLower.includes('home') || catLower.includes('living') || catLower.includes('appliance')) {
      return {
        subCategories: ["Máy Hút Bụi", "Nồi Chiên Không Dầu", "Bộ Nồi Chảo", "Chăn Ga Gối Đệm", "Lọc Không Khí"],
        brands: CATEGORY_BRANDS_DATA[categoryName] 
          ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
          : ["Dyson", "Bosch", "LG", "Lock&Lock", "Philips"]
      };
    }

    // Beauty & Health
    if (catLower.includes('beauty') || catLower.includes('health') || catLower.includes('baby')) {
      return {
        subCategories: ["Serum & Dưỡng Ẩm", "Kem Chống Nắng", "Son Môi Lì", "Nước Tẩy Trang", "Tã Quần & Tã Dán", "Máy Đo Huyết Áp"],
        brands: CATEGORY_BRANDS_DATA[categoryName] 
          ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
          : ["L'Oreal", "Maybelline", "Pampers", "Huggies", "Bosch", "Unilever"]
      };
    }

    // Default generic fallback
    return {
      subCategories: ["Sản Phẩm Mới", "Bán Chạy Nhất", "Khuyến Mãi Hot", "Hàng Chính Hãng", "Combo Tiết Kiệm"],
      brands: CATEGORY_BRANDS_DATA[categoryName] 
        ? CATEGORY_BRANDS_DATA[categoryName].slice(0, 15).map(b => b.name)
        : ["Apple", "Samsung", "Nike", "Sony", "L'Oreal", "Casio", "Bosch", "LEGO", "ShopeePay"]
    };
  }, [categoryName]);

  const { subCategories, brands } = filterData;

  const toggleArrayItem = (setter, item) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleToggleBrand = (brand) => {
    if (setBrandsFilter) {
      if (brandsFilter.includes(brand)) {
        setBrandsFilter(brandsFilter.filter(b => b !== brand));
      } else {
        setBrandsFilter([...brandsFilter, brand]);
      }
    }
  };

  const handleToggleSubCategory = (sub) => {
    if (setSubCategoryFilter) {
      setSubCategoryFilter(subCategoryFilter === sub ? '' : sub);
    }
  };

  const handleToggleRating = (rating) => {
    if (setRatingFilter) {
      setRatingFilter(ratingFilter === rating ? null : rating);
    }
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    if (setMinPrice) setMinPrice(localMin);
    if (setMaxPrice) setMaxPrice(localMax);
    if (onApplyFilter) {
      onApplyFilter({
        minPrice: localMin,
        maxPrice: localMax,
        brandsFilter,
        ratingFilter,
        subCategory: subCategoryFilter
      });
    }
  };

  const handleClearAll = () => {
    setLocalMin('');
    setLocalMax('');
    if (setMinPrice) setMinPrice('');
    if (setMaxPrice) setMaxPrice('');
    if (setBrandsFilter) setBrandsFilter([]);
    if (setRatingFilter) setRatingFilter(null);
    if (setSubCategoryFilter) setSubCategoryFilter('');
    setIsOnSale(false);
    setIsExpress(false);
    setSelectedLocations([]);
    setSelectedShopTypes([]);
    setSelectedConditions([]);
    if (onApplyFilter) {
      onApplyFilter({
        minPrice: '',
        maxPrice: '',
        brandsFilter: [],
        ratingFilter: null,
        subCategory: ''
      });
    }
  };

  const hasActiveFilters = Boolean(
    minPrice || maxPrice || (brandsFilter && brandsFilter.length > 0) || ratingFilter || subCategoryFilter
  );

  return (
    <div className="w-full lg:w-64 bg-[#111] rounded-2xl border border-white/10 p-5 shadow-sm text-slate-300 h-fit">
      {/* Category List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
            Categories
          </h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline"
              title="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
        
        <ul className="space-y-2 text-sm">
          <li>
            <button className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-2 text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
              <span className="line-clamp-1">{categoryName || 'All Categories'}</span>
            </button>
          </li>
          {(showAllCategories ? subCategories : subCategories.slice(0, 4)).map((sub, idx) => {
            const isSubSelected = subCategoryFilter === sub;
            return (
              <li key={idx}>
                <button 
                  onClick={() => handleToggleSubCategory(sub)}
                  className={`pl-3.5 text-left transition-colors font-medium text-xs flex items-center gap-2 ${
                    isSubSelected ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSubSelected && <span className="w-1 h-1 rounded-full bg-indigo-400"></span>}
                  {sub}
                </button>
              </li>
            );
          })}
          {subCategories.length > 4 && (
            <li>
              <button 
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-slate-500 hover:text-slate-300 pl-3.5 text-xs flex items-center gap-1 mt-1"
              >
                {showAllCategories ? 'Thu gọn' : 'Xem thêm'} <ChevronDown className={`w-3 h-3 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Filter Header */}
      <h3 className="font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2 text-sm">
        <Filter className="w-4 h-4 text-indigo-400" />
        Search Filter
      </h3>

      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wide flex items-center justify-between">
          <span>Brand</span>
          {brandsFilter.length > 0 && (
            <span className="text-[10px] text-indigo-400 font-normal">({brandsFilter.length} chọn)</span>
          )}
        </h4>
        <div className="space-y-2">
          {(showAllBrands ? brands : brands.slice(0, 6)).map((brand, idx) => {
            const isSelected = brandsFilter.includes(brand);
            return (
              <div 
                key={idx} 
                onClick={() => handleToggleBrand(brand)}
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                  isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-xs transition-colors ${
                  isSelected ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {brand}
                </span>
              </div>
            );
          })}
          {brands.length > 6 && (
            <button 
              onClick={() => setShowAllBrands(!showAllBrands)} 
              className="text-slate-500 text-xs hover:text-slate-300 flex items-center gap-1 pt-1"
            >
              {showAllBrands ? 'Thu gọn' : `Xem thêm (${brands.length - 6})`} 
              <ChevronDown className={`w-3 h-3 transition-transform ${showAllBrands ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Price Range Filter */}
      <form onSubmit={handleApplyPrice} className="mb-6">
        <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wide">Price Range ($)</h4>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" 
            placeholder="$ MIN"
            value={localMin}
            onChange={e => setLocalMin(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
          />
          <span className="text-slate-500 text-xs">-</span>
          <input 
            type="number" 
            placeholder="$ MAX"
            value={localMax}
            onChange={e => setLocalMax(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md text-xs transition-colors uppercase tracking-wider shadow-sm"
        >
          Apply Filter
        </button>
      </form>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wide">Rating</h4>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => {
            const isRatingSelected = ratingFilter === rating;
            return (
              <button 
                key={rating} 
                type="button"
                onClick={() => handleToggleRating(rating)}
                className={`flex items-center justify-between p-1.5 rounded transition-colors w-full text-left ${
                  isRatingSelected ? 'bg-indigo-500/20 border border-indigo-500/50' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex gap-1 items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  ))}
                  {rating < 5 && <span className="text-slate-400 text-xs ml-1">& Up</span>}
                </div>
                {isRatingSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* Services & Promotions */}
      <div className="mb-4">
        <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wide">Promotions</h4>
        <div 
          onClick={() => setIsOnSale(!isOnSale)} 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            isOnSale ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 bg-white/5 group-hover:border-indigo-400'
          }`}>
             {isOnSale && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-slate-300 text-xs group-hover:text-white">Đang giảm giá (On Sale)</span>
        </div>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="w-full mt-2 py-2 border border-white/10 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" /> Clear All Filters
        </button>
      )}
    </div>
  );
}
