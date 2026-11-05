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

  // Dynamic subcategories & brands mapping tailored accurately for each category
  const filterData = useMemo(() => {
    const cat = categoryName || '';
    const catLower = cat.toLowerCase();
    
    // Category-specific subcategories
    const SUB_MAP = {
      "Men's Fashion": ["Áo Sơ Mi Nam", "Áo Polo Nam", "Áo Hoodie & Sweatshirt", "Quần Jeans Nam", "Áo Thun Thể Thao", "Áo Khoác Gió Nam"],
      "Women's Fashion": ["Đầm Dự Tiệc", "Chân Váy Xếp Ly", "Áo Sơ Mi Lụa Nữ", "Áo Blazer Nữ", "Áo Kiểu & Blouse", "Quần Ống Rộng Nữ"],
      "Men's Shoes": ["Sneaker Nam", "Giày Chạy Bộ", "Giày Tây Công Sở", "Giày Lười Loafer", "Sandal Nam"],
      "Women's Shoes": ["Giày Cao Gót", "Sneaker Nữ", "Giày Sandal Quai Mảnh", "Giày Búp Bê", "Boot Nữ"],
      "Women's Bags": ["Túi Xách Tay", "Túi Đeo Chéo", "Balo Nữ Mini", "Ví Cầm Tay", "Túi Kẹp Nách"],
      "Watches": ["Đồng Hồ Nam Thể Thao", "Đồng Hồ Cơ Automatic", "Smartwatch Thông Minh", "Đồng Hồ Nữ Đính Đá"],
      "Smartphones & Accessories": ["Flagship Smartphone", "Ốp Lưng MagSafe", "Củ Sạc & Cáp Nhanh", "Sạc Dự Phòng", "Kính Cường Lực"],
      "Electronics": ["Smart TV OLED/4K", "Màn Hình Gaming", "Máy Chiếu Mini", "Soundbar Gia Đình"],
      "Laptops & Computers": ["MacBook & Ultrabook", "Laptop Gaming", "Chuột Công Thái Học", "Bàn Phím Cơ PC", "Màn Hình Đồ Họa"],
      "Cameras": ["Máy Ảnh Mirrorless", "Máy Ảnh Full-Frame", "Ống Kính Chân Dung", "Gimbal Chống Rung", "Flycam & Drone"],
      "Audio": ["Tai Nghe Chống Ồn", "Loa Bluetooth Di Động", "Tai Nghe True Wireless", "Loa Phòng Khách"],
      "Gaming": ["Máy Game Console", "Tay Cầm Chơi Game", "Bàn Phím Cơ Gaming", "Chuột Gaming", "Tai Nghe Gaming"],
      "Home & Living": ["Chăn Ga Gối Lụa", "Bộ Nồi Chảo Inox", "Bình Giữ Nhiệt", "Hộp Đựng Thực Phẩm"],
      "Smart Home & Appliances": ["Máy Hút Bụi Cầm Tay", "Máy Xay Sinh Tố", "Máy Lọc Không Khí", "Nồi Chiên Không Dầu"],
      "Pet Supplies": ["Hạt Cho Mèo", "Hạt Cho Chó", "Pate Đóng Gói", "Cát Vệ Sinh", "Phụ Kiện Thú Cưng"],
      "Beauty": ["Serum Dưỡng Sáng", "Son Kem Lì", "Kem Chống Nắng", "Nước Tẩy Trang", "Kem Dưỡng Da"],
      "Health": ["Máy Đo Huyết Áp", "Gel Rửa Tay Khô", "Thực Phẩm Dinh Dưỡng", "Nước Súc Miệng", "Vitamin & Khoáng Chất"],
      "Mom & Baby": ["Tã Quần & Tã Dán", "Khăn Ướt Kháng Khuẩn", "Bình Sữa Kháng Khuẩn", "Sữa Bột Dinh Dưỡng", "Xe Đẩy Trẻ Em"],
      "Sports & Outdoors": ["Thảm Tập Yoga", "Tạ Tay Gym", "Túi Trống Thể Thao", "Lều Cắm Trại Dã Ngoại"],
      "Automotive": ["Cần Gạt Mưa Ô Tô", "Lốp Xe Du Lịch", "Bơm Lốp Điện Tử", "Nước Rửa Kính Ô Tô"],
      "Books & Stationery": ["Sách Kỹ Năng Sống", "Bút Ký Kim Loại", "Sổ Tay Vintage", "Hộp Màu & Bút Vẽ"],
      "Groceries": ["Cà Phê Hòa Tan", "Gia Vị & Hạt Nêm", "Sữa Lúa Mạch", "Bánh Kẹo & Bổ Sung"],
      "Gifts": ["Đồ Chơi LEGO", "Bó Hoa Sáp & Botanical", "Hộp Quà & Nến Thơm", "Mô Hình Nhân Vật", "Đồ Chơi Sáng Tạo"],
      "Vouchers": ["E-Voucher ShopeePay", "Thẻ Quà Tặng Starbucks", "Gói Shopee Xu", "Voucher Ẩm Thực"]
    };

    const subCats = SUB_MAP[cat] || [
      "Sản Phẩm Mới", "Bán Chạy Nhất", "Khuyến Mãi Hot", "Hàng Chính Hãng", "Combo Tiết Kiệm"
    ];

    const catBrands = (CATEGORY_BRANDS_DATA[cat] || []).map(b => b.name);
    const fallbackBrands = ["Nike", "Adidas", "Apple", "Samsung", "Sony", "Coolmate", "Uniqlo", "L'Oréal"];

    return {
      subCategories: subCats,
      brands: catBrands.length > 0 ? catBrands : fallbackBrands
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
