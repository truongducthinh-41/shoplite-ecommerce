// Utility theo vết hành vi người dùng & Động cơ Gợi ý Cá nhân hóa Đan xen (Shopee / TikTok Interleaved Algorithm)
import { apiFetch } from '../services/api';
import { FALLBACK_PRODUCTS } from '../data/categoryProducts';
import { getSafeProductImage } from './productImages';

const RECENT_VIEWS_KEY = 'aurastore_recent_views';
const CATEGORY_WEIGHTS_KEY = 'aurastore_category_weights';
const RECENT_SEARCHES_KEY = 'aurastore_recent_searches';

// Hàm chuẩn hóa chuỗi tiếng Việt (bỏ dấu, chuyển chữ thường)
export const normalizeText = (text) =>
  (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Bản đồ từ khóa tìm kiếm (hỗ trợ cả tiếng Anh lẫn tiếng Việt) ánh xạ chính xác Category ID và Tên Category
export const KEYWORD_CATEGORY_MAP = [
  {
    categoryName: 'Smartphones & Accessories',
    catIds: [10, 3],
    keywords: ['phone', 'dien thoai', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'pixel', 'redmi', 'galaxy', 'op lung', 'cu sac', 'cap sac', 'phu kien dien thoai', 'sac nhanh', 'mobile', 'cellphone', 'apple'],
    querySuggestions: [
      'điện thoại thông minh',
      'điện thoại iphone',
      'điện thoại samsung galaxy',
      'điện thoại chơi game',
      'phụ kiện điện thoại & sạc nhanh',
      'ốp lưng điện thoại cao cấp'
    ]
  },
  {
    categoryName: 'Audio',
    catIds: [14, 16],
    keywords: ['tai nghe', 'airpod', 'headphone', 'earphone', 'loa', 'marshall', 'sony wh', 'am thanh', 'audio', 'loa bluetooth', 'soundbar'],
    querySuggestions: [
      'tai nghe bluetooth không dây',
      'tai nghe chống ồn sony',
      'tai nghe airpods pro',
      'loa bluetooth marshall'
    ]
  },
  {
    categoryName: 'Laptops & Computers',
    catIds: [12, 7],
    keywords: ['laptop', 'macbook', 'dell', 'asus', 'may tinh', 'pc', 'ban phim', 'chuot may tinh', 'thinkpad', 'acer', 'man hinh', 'computer'],
    querySuggestions: [
      'laptop văn phòng sinh viên',
      'laptop gaming đồ họa',
      'macbook pro m3',
      'chuột công thái học logitech'
    ]
  },
  {
    categoryName: 'Gaming',
    catIds: [15, 21],
    keywords: ['game', 'gaming', 'ps5', 'tay cam', 'nintendo', 'playstation', 'xbox', 'chuot gaming', 'ban phim co'],
    querySuggestions: [
      'máy chơi game playstation 5',
      'tay cầm chơi game không dây',
      'nintendo switch oled',
      'bàn phím cơ gaming rgb'
    ]
  },
  {
    categoryName: 'Electronics',
    catIds: [11, 5],
    keywords: ['tivi', 'tv', 'lg oled', 'may chieu', 'man hinh oled', 'dien tu', 'electronics'],
    querySuggestions: [
      'smart tv 4k oled',
      'máy chiếu mini thông minh',
      'màn hình máy tính gaming'
    ]
  },
  {
    categoryName: "Men's Fashion",
    catIds: [16, 1],
    keywords: ['ao', 'quan', 'hoodie', 'polo', 'jean', 'jacket', 'so mi', 'thoi trang nam', 'vest', 'nam', 'ao thun nam', 'shirt', 'men'],
    querySuggestions: [
      'áo thun nam cotton',
      'áo hoodie nỉ unisex',
      'áo polo nam cao cấp',
      'quần jean nam slimfit'
    ]
  },
  {
    categoryName: "Women's Fashion",
    catIds: [17, 2],
    keywords: ['vay', 'dam', 'croptop', 'chan vay', 'thoi trang nu', 'nu', 'ao kieu', 'set do nu', 'dress', 'women'],
    querySuggestions: [
      'váy đầm dạ hội dự tiệc',
      'set đồ nữ thời trang',
      'chân váy xếp ly dáng dài',
      'áo kiểu nữ công sở'
    ]
  },
  {
    categoryName: 'Beauty',
    catIds: [25, 8],
    keywords: ['son', 'kem', 'serum', 'my pham', 'trang diem', 'duong da', 'beauty', 'nuoc hoa', 'chong nang', 'tay trang', 'phan phu', 'cosmetics', 'lipstick'],
    querySuggestions: [
      'son môi cao cấp chính hãng',
      'kem chống nắng bảo vệ da',
      'serum dưỡng ẩm sáng da',
      'nước hoa nam nữ chính hãng'
    ]
  },
  {
    categoryName: "Men's Shoes",
    catIds: [18, 13],
    keywords: ['giay nam', 'sneaker nam', 'giay da', 'giay the thao nam'],
    querySuggestions: [
      'giày sneaker thể thao nam',
      'giày tây da bò công sở',
      'giày chạy bộ êm chân'
    ]
  },
  {
    categoryName: "Women's Shoes",
    catIds: [19, 12],
    keywords: ['giay nu', 'cao got', 'sandal nu', 'sneaker nu', 'giay the thao nu'],
    querySuggestions: [
      'giày cao gót nữ',
      'giày sneaker nữ thời trang',
      'sandal nữ quai mảnh'
    ]
  },
  {
    categoryName: 'Watches',
    catIds: [21, 11],
    keywords: ['dong ho', 'watch', 'rolex', 'casio', 'apple watch', 'dong ho deo tay', 'smartwatch'],
    querySuggestions: [
      'đồng hồ thông minh apple watch',
      'đồng hồ nam casio chính hãng',
      'đồng hồ cơ sang trọng'
    ]
  },
  {
    categoryName: "Women's Bags",
    catIds: [20, 14],
    keywords: ['tui', 'balo', 'vi', 'clutch', 'tui xach', 'tui deo cheo', 'vi cam tay', 'backpack', 'bag'],
    querySuggestions: [
      'túi xách nữ đeo chéo',
      'balo du lịch chống nước',
      'ví cầm tay nữ sang trọng'
    ]
  },
  {
    categoryName: 'Mom & Baby',
    catIds: [27, 4],
    keywords: ['me', 'be', 'sua', 'bim', 'ta', 'noi em be', 'tre em', 'do choi tre em', 'xe day', 'baby'],
    querySuggestions: [
      'sữa bột phát triển trí não cho bé',
      'tã bỉm sơ sinh cao cấp',
      'xe đẩy gấp gọn em bé'
    ]
  },
  {
    categoryName: 'Home & Living',
    catIds: [22, 6],
    keywords: ['nha cua', 'noi', 'chao', 'den', 'giuong', 'nem', 'trang tri', 'noi that', 'khan', 'home'],
    querySuggestions: [
      'chăn ga gối đệm cao cấp',
      'đèn ngủ trang trí phòng',
      'bộ nồi inox nhà bếp'
    ]
  },
  {
    categoryName: 'Smart Home & Appliances',
    catIds: [23, 15],
    keywords: ['thong minh', 'hut bui', 'robot', 'noi chien', 'may loc', 'gia dung', 'appliances', 'noi com'],
    querySuggestions: [
      'robot hút bụi lau nhà thông minh',
      'nồi chiên không dầu điện tử',
      'máy lọc không khí gia đình'
    ]
  },
  {
    categoryName: 'Cameras',
    catIds: [13, 9],
    keywords: ['may anh', 'camera', 'lens', 'ong kinh', 'canon', 'fujifilm', 'nikon', 'gopro'],
    querySuggestions: [
      'máy ảnh mirrorless canon',
      'ống kính chụp chân dung',
      'camera hành trình chống nước'
    ]
  },
  {
    categoryName: 'Health',
    catIds: [26, 10],
    keywords: ['suc khoe', 'vitamin', 'omega', 'thuc pham chuc nang', 'canxi', 'khau trang', 'may do huyet ap', 'health'],
    querySuggestions: [
      'viên uống bổ sung vitamin tổng hợp',
      'dầu cá omega 3 nhập khẩu',
      'máy đo huyết áp bắp tay'
    ]
  },
  {
    categoryName: 'Sports & Outdoors',
    catIds: [28, 17],
    keywords: ['the thao', 'tap gym', 'ta', 'bong da', 'chay bo', 'yoga', 'vot', 'cau long', 'tennis', 'sport'],
    querySuggestions: [
      'thảm tập yoga định tuyến',
      'bộ tạ tay đa năng tại nhà',
      'vợt cầu lông trợ lực'
    ]
  },
  {
    categoryName: 'Groceries',
    catIds: [31, 18],
    keywords: ['thuc pham', 'banh', 'keo', 'tra', 'ca phe', 'do an vat', 'groceries', 'mi goi', 'food'],
    querySuggestions: [
      'cà phê hạt rang mộc nguyên chất',
      'trà xanh ô long túi lọc',
      'bánh kẹo ăn vặt văn phòng'
    ]
  },
  {
    categoryName: 'Automotive',
    catIds: [29, 19],
    keywords: ['xe', 'o to', 'xe may', 'mu bao hiem', 'nhot', 'phu tung xe', 'gat mua', 'auto'],
    querySuggestions: [
      'mũ bảo hiểm 3/4 chính hãng',
      'nhớt xe máy tổng hợp cao cấp',
      'bơm lốp ô tô mini tự ngắt'
    ]
  },
  {
    categoryName: 'Books & Stationery',
    catIds: [30, 20],
    keywords: ['sach', 'van phong pham', 'but', 'so', 'tieu thuyet', 'giao trinh', 'truyen', 'book'],
    querySuggestions: [
      'sách phát triển tư duy kinh doanh',
      'tiểu thuyết văn học bán chạy',
      'bộ bút viết và sổ tay cao cấp'
    ]
  },
  {
    categoryName: 'Pet Supplies',
    catIds: [24, 22],
    keywords: ['thu cung', 'meo', 'cho', 'pate', 'chuong', 'cat ve sinh', 'thuc an cho meo', 'pet'],
    querySuggestions: [
      'thức ăn hạt cao cấp cho mèo',
      'pate dinh dưỡng cho chó mèo',
      'cát vệ sinh khử mùi thú cưng'
    ]
  },
  {
    categoryName: 'Gifts',
    catIds: [32, 23],
    keywords: ['qua tang', 'gift', 'gau bong', 'hop qua', '8/3', 'valentine', 'qua luu niem'],
    querySuggestions: [
      'hộp quà tặng sinh nhật ý nghĩa',
      'gấu bông teddy cao cấp',
      'quà tặng kỷ niệm độc đáo'
    ]
  },
  {
    categoryName: 'Vouchers',
    catIds: [33, 24],
    keywords: ['voucher', 'ma giam gia', 'phieu mua hang', 'the cao'],
    querySuggestions: [
      'phiếu quà tặng mua sắm 500k',
      'mã giảm giá freeship toàn quốc',
      'voucher ăn uống giải trí'
    ]
  }
];

// Hệ sinh thái ngành hàng bổ trợ (Companion Ecosystem Mapping)
export const COMPANION_CATEGORIES = {
  10: [14, 12, 21, 11, 15, 23], // Smartphones -> Audio, Laptops, Watches, Electronics, Gaming, Smart Home
  3:  [14, 12, 21, 11, 15, 23],
  14: [10, 12, 15, 21],         // Audio -> Smartphones, Laptops, Gaming, Watches
  12: [10, 14, 15, 11, 23],     // Laptops -> Smartphones, Audio, Gaming, Electronics
  11: [10, 12, 14, 15],         // Electronics -> Smartphones, Laptops, Audio
  15: [12, 14, 10, 11],         // Gaming -> Laptops, Audio, Smartphones
  16: [18, 21, 20, 28],         // Men's Fashion -> Men's Shoes, Watches, Bags, Sports
  17: [19, 20, 25, 21, 32],     // Women's Fashion -> Women's Shoes, Bags, Beauty, Watches, Gifts
  25: [26, 17, 32, 20],         // Beauty -> Health, Women's Fashion, Gifts
  21: [10, 16, 17, 12]          // Watches -> Smartphones, Fashion, Laptops
};

/**
 * Kiểm tra sản phẩm có khớp với từ khóa tìm kiếm (ĐẢM BẢO CHÍNH XÁC 100%, KHÔNG LỌT NGÀNH NGOÀI LỀ)
 */
export function matchProductSearch(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  const qNorm = normalizeText(rawQuery);
  const pName = normalizeText(product.name);
  const pBrand = normalizeText(product.brand_name);
  const pCat = normalizeText(product.category_name);

  // 1. Khớp theo tên sản phẩm hoặc tên thương hiệu
  if (pName.includes(qNorm) || pBrand.includes(qNorm)) {
    return true;
  }

  // 2. Khớp theo từ điển danh mục (ví dụ gõ "phone" hoặc "điện thoại" -> khớp Category 10 & 3)
  for (const item of KEYWORD_CATEGORY_MAP) {
    const isKeywordMatched = item.keywords.some(k => qNorm.includes(k) || k.includes(qNorm));
    if (isKeywordMatched) {
      if (item.catIds.includes(product.category_id) || normalizeText(product.category_name) === normalizeText(item.categoryName)) {
        return true;
      }
    }
  }

  // 3. Khớp tên danh mục chính xác
  if (pCat.includes(qNorm)) {
    return true;
  }

  return false;
}

/**
 * Gợi ý tìm kiếm thông minh đa tầng cho Dropdown Thanh Search (Navbar)
 * Trả về CẢ:
 * 1. queries: Các câu từ khóa gợi ý phổ biến (e.g. "điện thoại thông minh", "điện thoại samsung"...)
 * 2. products: Danh sách các thẻ sản phẩm cụ thể khớp tìm kiếm
 */
export function getSmartSearchSuggestions(rawQuery, customCatalog = [], limit = 6) {
  if (!rawQuery || !rawQuery.trim()) return { queries: [], products: [] };
  const qNorm = normalizeText(rawQuery);
  const catalog = (customCatalog && customCatalog.length > 0) ? customCatalog : FALLBACK_PRODUCTS;

  // 1. Tìm các câu từ khóa gợi ý (Query Autocomplete)
  let queries = [];
  for (const item of KEYWORD_CATEGORY_MAP) {
    if (item.keywords.some(k => qNorm.includes(k) || k.includes(qNorm))) {
      queries = [...queries, ...item.querySuggestions];
    }
  }
  // Lọc các query khớp tốt nhất
  const filteredQueries = Array.from(new Set(queries)).slice(0, 5);

  // 2. Tìm các sản phẩm cụ thể
  const directMatches = [];
  const categoryMatches = [];

  catalog.forEach(product => {
    if (matchProductSearch(product, rawQuery)) {
      const pName = normalizeText(product.name);
      if (pName.includes(qNorm)) {
        directMatches.push(product);
      } else {
        categoryMatches.push(product);
      }
    }
  });

  directMatches.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
  categoryMatches.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

  const map = new Map();
  [...directMatches, ...categoryMatches].forEach(p => {
    if (!map.has(p.id)) map.set(p.id, p);
  });

  return {
    queries: filteredQueries,
    products: Array.from(map.values()).slice(0, limit)
  };
}

/**
 * Ghi nhận tương tác chi tiết của người dùng với sản phẩm (view, cart, purchase)
 */
export function trackProductInteraction(product, interactionType = 'view') {
  if (!product || !product.id) return;

  try {
    // 1. Lưu vào danh sách Sản phẩm vừa xem gần đây (Recently Viewed)
    const storedViews = JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
    const filtered = storedViews.filter(p => p.id !== product.id);
    const updatedViews = [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        category_id: product.category_id,
        category_name: product.category_name,
        brand_name: product.brand_name,
        shop_name: product.shop_name,
        viewed_at: Date.now()
      },
      ...filtered
    ].slice(0, 10);
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updatedViews));

    // 2. Tính toán điểm trọng số sở thích danh mục (Category Affinity Score)
    const weightDelta = interactionType === 'purchase' ? 12 : (interactionType === 'cart' ? 8 : 4);
    const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
    const catId = product.category_id;
    if (catId) {
      storedWeights[catId] = (storedWeights[catId] || 0) + weightDelta;
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }

    // 3. Gửi đồng bộ lên Backend API
    apiFetch('/products/track-interaction', {
      method: 'POST',
      body: JSON.stringify({
        productId: product.id,
        categoryId: product.category_id,
        interactionType
      })
    }).catch(() => {});
  } catch (error) {
    console.warn('[userTracker warning]:', error);
  }
}

/**
 * Ghi nhận hành vi TÌM KIẾM của người dùng (Search Intent Tracking - "Nghe lén" từ khóa)
 */
export function trackSearchQuery(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return;
  const query = rawQuery.trim();
  const qNorm = normalizeText(query);

  try {
    const matchedCatIds = [];
    for (const item of KEYWORD_CATEGORY_MAP) {
      if (item.keywords.some(k => qNorm.includes(k) || k.includes(qNorm))) {
        matchedCatIds.push(...item.catIds);
      }
    }

    // Tăng điểm trọng số cực cao cho danh mục tìm kiếm (+18 điểm)
    if (matchedCatIds.length > 0) {
      const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
      matchedCatIds.forEach(catId => {
        storedWeights[catId] = (storedWeights[catId] || 0) + 18;
      });
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }

    // Lưu từ khóa tìm kiếm gần đây
    const storedSearches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    const filteredSearches = storedSearches.filter(s => s.query.toLowerCase() !== query.toLowerCase());
    const updatedSearches = [
      {
        query,
        normalized: qNorm,
        matchedCatIds,
        timestamp: Date.now()
      },
      ...filteredSearches
    ].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));

    // Đồng bộ lên API nếu có category
    if (matchedCatIds.length > 0) {
      apiFetch('/products/track-interaction', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: matchedCatIds[0],
          interactionType: 'search'
        })
      }).catch(() => {});
    }
  } catch (error) {
    console.warn('[trackSearchQuery error]:', error);
  }
}

/**
 * Ghi nhận khi người dùng vào xem danh mục cụ thể (Category View Intent)
 */
export function trackCategoryInteraction(categoryNameOrId) {
  if (!categoryNameOrId) return;
  try {
    const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
    let targetCatIds = [];

    if (!isNaN(parseInt(categoryNameOrId))) {
      targetCatIds.push(parseInt(categoryNameOrId));
    } else {
      const norm = normalizeText(categoryNameOrId);
      const matched = KEYWORD_CATEGORY_MAP.find(item =>
        normalizeText(item.categoryName) === norm || item.keywords.some(k => norm.includes(k))
      );
      if (matched) targetCatIds.push(...matched.catIds);
    }

    targetCatIds.forEach(cId => {
      storedWeights[cId] = (storedWeights[cId] || 0) + 6;
    });
    localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
  } catch (error) {
    console.warn('[trackCategoryInteraction error]:', error);
  }
}

export function getRecentlyViewedProducts() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getTopCategoryInterests() {
  try {
    const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
    const sorted = Object.entries(storedWeights)
      .sort((a, b) => b[1] - a[1])
      .map(entry => parseInt(entry[0]))
      .filter(Boolean);
    return sorted;
  } catch {
    return [];
  }
}

export function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * GIẢI THUẬT ĐAN XEN CÁ NHÂN HÓA SHOPEE / TIKTOK SHOP (Interleaved Recommendation Stream)
 * 
 * ĐÁP ỨNG TRỌN VẸN YÊU CẦU:
 * 1. Khi người dùng vừa tìm kiếm/xem sản phẩm ("nghe lén"): Các sản phẩm này PHẢI ĐẬP VÀO MẶT USER
 *    ngay tại các hàng đầu tiên (Row 1 & Row 2), và xuất hiện liên tục xuyên suốt danh sách!
 * 2. Tự động xáo trộn ngẫu nhiên (Randomized) giữa các sản phẩm cùng ngành trên mỗi lần F5
 *    hoặc quay về trang chủ (lần này iPhone lên trước, lần sau Samsung hay tai nghe lên trước).
 * 3. Đưa đầy đủ 108 sản phẩm vào dòng hiển thị, không bị thiếu sản phẩm.
 * 4. Không gắn bất kỳ tag vàng/đỏ nào (giao diện sạch sẽ 100%).
 */
export function generateBlendedDiscoverFeed(rawProducts = []) {
  if (!rawProducts || rawProducts.length === 0) return [];

  const categoryWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
  const recentSearches = getRecentSearches();
  const recentViews = getRecentlyViewedProducts();
  const recentCatIds = new Set(recentViews.map(p => p.category_id).filter(Boolean));

  // Top danh mục quan tâm
  const topCatIds = getTopCategoryInterests();
  const searchCatIds = new Set(recentSearches.flatMap(s => s.matchedCatIds || []));

  // Danh mục mục tiêu chính ("bị nghe lén")
  const primaryCatIds = new Set([...topCatIds, ...searchCatIds, ...recentCatIds]);

  // Danh mục hệ sinh thái bổ trợ
  const expandedCatIds = new Set(primaryCatIds);
  primaryCatIds.forEach(catId => {
    const companions = COMPANION_CATEGORIES[catId] || [];
    companions.forEach(c => expandedCatIds.add(c));
  });

  const hasUserIntent = primaryCatIds.size > 0 || recentSearches.length > 0 || recentViews.length > 0;

  // Hàm xáo trộn mảng Fisher-Yates
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // NẾU LÀ KHÁCH MỚI (CHƯA CÓ LỊCH SỬ): Xáo trộn ngẫu nhiên toàn bộ 108 sản phẩm
  if (!hasUserIntent) {
    return shuffleArray(rawProducts);
  }

  // NẾU ĐÃ CÓ LỊCH SỬ TÌM KIẾM / XEM HÀNG ("BỊ NGHE LÉN"):
  const poolRetargetedPrimary = [];   // Đúng ngành hàng tìm kiếm / vừa xem (Điện thoại, phụ kiện)
  const poolRetargetedCompanion = []; // Hệ sinh thái tương thích (Tai nghe, Laptop, Smartwatch)
  const poolTrendingOutside = [];     // Các ngành hàng ngoài lề khác toàn sàn (Thời trang, Gia dụng...)

  rawProducts.forEach(product => {
    const pNameNorm = normalizeText(product.name);
    const pCatNorm = normalizeText(product.category_name);

    let isExactSearchMatch = false;
    for (const search of recentSearches.slice(0, 3)) {
      if (search.normalized && (pNameNorm.includes(search.normalized) || pCatNorm.includes(search.normalized))) {
        isExactSearchMatch = true;
        break;
      }
      if (search.matchedCatIds && search.matchedCatIds.includes(product.category_id)) {
        isExactSearchMatch = true;
        break;
      }
    }

    const isPrimaryCat = primaryCatIds.has(product.category_id);
    const isCompanionCat = expandedCatIds.has(product.category_id);

    // Random Jitter để mỗi lần F5 thứ tự các món lại đổi mới sinh động
    const rnd = Math.random() * 50;

    if (isExactSearchMatch || isPrimaryCat) {
      poolRetargetedPrimary.push({ ...product, _score: 150 + rnd });
    } else if (isCompanionCat) {
      poolRetargetedCompanion.push({ ...product, _score: 80 + rnd });
    } else {
      poolTrendingOutside.push({ ...product, _score: (product.sold_count || 0) + (rnd * 2) });
    }
  });

  // Xáo trộn ngẫu nhiên bên trong từng pool
  poolRetargetedPrimary.sort((a, b) => b._score - a._score);
  poolRetargetedCompanion.sort((a, b) => b._score - a._score);
  poolTrendingOutside.sort((a, b) => b._score - a._score);

  // Đan xen theo tiêu chuẩn:
  // - 6 ĐẾN 12 SẢN PHẨM ĐẦU TIÊN (HÀNG 1 & HÀNG 2): 100% ĐẬP VÀO MẶT USER BẰNG SẢN PHẨM LIÊN QUAN!
  // - CÁC HÀNG TIẾP THEO: Đan xen liên tục (2 món liên quan : 1 món thịnh hành khác)
  const blendedFeed = [];

  // Gom toàn bộ nhóm sản phẩm liên quan ("nghe lén")
  const allRetargeted = [...poolRetargetedPrimary, ...poolRetargetedCompanion];

  let rIdx = 0;
  let oIdx = 0;

  // 1. Hai hàng đầu tiên (10-12 sản phẩm đầu): Ưu tiên tuyệt đối toàn bộ sản phẩm nghe lén
  while (rIdx < Math.min(12, allRetargeted.length)) {
    blendedFeed.push(allRetargeted[rIdx++]);
  }

  // 2. Từ hàng thứ 3 trở đi: Đan xen liên tục (2 sản phẩm nghe lén : 1 sản phẩm ngoài lề)
  while (rIdx < allRetargeted.length || oIdx < poolTrendingOutside.length) {
    if (rIdx < allRetargeted.length) blendedFeed.push(allRetargeted[rIdx++]);
    if (rIdx < allRetargeted.length) blendedFeed.push(allRetargeted[rIdx++]);
    if (oIdx < poolTrendingOutside.length) blendedFeed.push(poolTrendingOutside[oIdx++]);

    // Nếu nhóm retargeted đã hết, đẩy tiếp toàn bộ các sản phẩm còn lại của sàn
    if (rIdx >= allRetargeted.length && oIdx < poolTrendingOutside.length) {
      blendedFeed.push(poolTrendingOutside[oIdx++]);
    }
  }

  return blendedFeed;
}
