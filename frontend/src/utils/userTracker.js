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

// Bản đồ từ khóa tìm kiếm (hỗ trợ cả tiếng Anh lẫn tiếng Việt) ánh xạ sang Category ID
export const KEYWORD_CATEGORY_MAP = [
  { keywords: ['tai nghe', 'airpod', 'headphone', 'earphone', 'loa', 'marshall', 'sony wh', 'am thanh', 'audio', 'loa bluetooth', 'soundbar'], catId: 16 },
  { keywords: ['phone', 'dien thoai', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'pixel', 'redmi', 'galaxy', 'op lung', 'cu sac', 'cap sac', 'phu kien dien thoai', 'sac nhanh', 'mobile', 'cellphone'], catId: 3 },
  { keywords: ['laptop', 'macbook', 'dell', 'asus', 'may tinh', 'pc', 'ban phim', 'chuot may tinh', 'thinkpad', 'acer', 'man hinh', 'computer'], catId: 7 },
  { keywords: ['game', 'gaming', 'ps5', 'tay cam', 'nintendo', 'playstation', 'xbox', 'chuot gaming', 'ban phim co'], catId: 21 },
  { keywords: ['ao', 'quan', 'hoodie', 'polo', 'jean', 'jacket', 'so mi', 'thoi trang nam', 'vest', 'nam', 'ao thun nam', 'shirt', 'men'], catId: 1 },
  { keywords: ['vay', 'dam', 'croptop', 'chan vay', 'thoi trang nu', 'nu', 'ao kieu', 'set do nu', 'dress', 'women'], catId: 2 },
  { keywords: ['giay nam', 'sneaker nam', 'giay da', 'giay the thao nam'], catId: 13 },
  { keywords: ['giay nu', 'cao got', 'sandal nu', 'sneaker nu', 'giay the thao nu'], catId: 12 },
  { keywords: ['giay', 'sneaker', 'nike', 'adidas', 'puma', 'jordan', 'shoes'], catId: 13 },
  { keywords: ['son', 'kem', 'serum', 'my pham', 'trang diem', 'duong da', 'beauty', 'nuoc hoa', 'chong nang', 'tay trang', 'phan phu', 'cosmetics', 'lipstick'], catId: 8 },
  { keywords: ['dong ho', 'watch', 'rolex', 'casio', 'apple watch', 'dong ho deo tay', 'smartwatch'], catId: 11 },
  { keywords: ['tui', 'balo', 'vi', 'clutch', 'tui xach', 'tui deo cheo', 'vi cam tay', 'backpack', 'bag'], catId: 14 },
  { keywords: ['me', 'be', 'sua', 'bim', 'ta', 'noi em be', 'tre em', 'do choi tre em', 'xe day', 'baby'], catId: 4 },
  { keywords: ['nha cua', 'noi', 'chao', 'den', 'giuong', 'nem', 'trang tri', 'noi that', 'khan', 'home'], catId: 6 },
  { keywords: ['thong minh', 'hut bui', 'robot', 'noi chien', 'may loc', 'gia dung', 'appliances', 'noi com'], catId: 15 },
  { keywords: ['may anh', 'camera', 'lens', 'ong kinh', 'canon', 'fujifilm', 'nikon', 'gopro'], catId: 9 },
  { keywords: ['suc khoe', 'vitamin', 'omega', 'thuc pham chuc nang', 'canxi', 'khau trang', 'may do huyet ap', 'health'], catId: 10 },
  { keywords: ['the thao', 'tap gym', 'ta', 'bong da', 'chay bo', 'yoga', 'vot', 'cau long', 'tennis', 'sport'], catId: 17 },
  { keywords: ['thuc pham', 'banh', 'keo', 'tra', 'ca phe', 'do an vat', 'groceries', 'mi goi', 'food'], catId: 18 },
  { keywords: ['xe', 'o to', 'xe may', 'mu bao hiem', 'nhot', 'phu tung xe', 'gat mua', 'auto'], catId: 19 },
  { keywords: ['sach', 'van phong pham', 'but', 'so', 'tieu thuyet', 'giao trinh', 'truyen', 'book'], catId: 20 },
  { keywords: ['thu cung', 'meo', 'cho', 'pate', 'chuong', 'cat ve sinh', 'thuc an cho meo', 'pet'], catId: 22 },
  { keywords: ['qua tang', 'gift', 'gau bong', 'hop qua', '8/3', 'valentine', 'qua luu niem'], catId: 23 },
  { keywords: ['voucher', 'ma giam gia', 'phieu mua hang', 'the cao'], catId: 24 }
];

// Bản đồ ngành hàng bổ trợ / hệ sinh thái liên quan (Companion Categories)
// Giúp gợi ý không bị giới hạn trong 1 category duy nhất mà mở rộng sang các món tương thích
export const COMPANION_CATEGORIES = {
  3: [16, 7, 11, 15, 21], // Điện thoại -> Âm thanh, Laptop, Đồng hồ, Nhà thông minh, Gaming
  16: [3, 7, 21, 11],     // Âm thanh -> Điện thoại, Laptop, Gaming, Đồng hồ
  7: [3, 16, 21, 15],     // Laptop -> Điện thoại, Âm thanh, Gaming, Nhà thông minh
  1: [13, 11, 14, 17],    // Thời trang nam -> Giày nam, Đồng hồ, Túi ví, Thể thao
  2: [12, 14, 8, 11, 23], // Thời trang nữ -> Giày nữ, Túi xách, Mỹ phẩm, Đồng hồ, Quà tặng
  8: [10, 2, 23, 14],     // Làm đẹp -> Sức khỏe, Thời trang nữ, Quà tặng, Túi ví
  21: [7, 16, 3, 5],      // Gaming -> Laptop, Âm thanh, Điện thoại, Điện tử
  11: [3, 1, 2, 7],       // Đồng hồ -> Điện thoại, Thời trang
  15: [6, 3, 7],          // Gia dụng thông minh -> Nhà cửa, Điện thoại, Laptop
};

/**
 * Kiểm tra xem sản phẩm có khớp với từ khóa tìm kiếm hay không (hỗ trợ từ đồng nghĩa)
 * Dùng cho cả Search Page để ĐẢM BẢO CHỈ HIỂN THỊ ĐÚNG SẢN PHẨM KHỚP TÌM KIẾM
 */
export function matchProductSearch(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  const qNorm = normalizeText(rawQuery);
  const pName = normalizeText(product.name);
  const pDesc = normalizeText(product.description);
  const pCat = normalizeText(product.category_name);
  const pBrand = normalizeText(product.brand_name);

  // 1. Khớp chuỗi trực tiếp
  if (pName.includes(qNorm) || pBrand.includes(qNorm) || pDesc.includes(qNorm) || pCat.includes(qNorm)) {
    return true;
  }

  // 2. Khớp theo bản đồ từ khóa đồng nghĩa (ví dụ: gõ "phone" -> ra tất cả điện thoại và phụ kiện)
  for (const item of KEYWORD_CATEGORY_MAP) {
    const isQueryMatched = item.keywords.some(k => qNorm.includes(k) || k.includes(qNorm));
    if (isQueryMatched && product.category_id === item.catId) {
      return true;
    }
  }

  return false;
}

/**
 * Gợi ý tìm kiếm thông minh và phong phú cho Dropdown Thanh Search (Navbar)
 * Tìm kiếm cả tên, thương hiệu, danh mục và từ khóa đồng nghĩa
 */
export function getSmartSearchSuggestions(rawQuery, customCatalog = [], limit = 8) {
  if (!rawQuery || !rawQuery.trim()) return [];
  const qNorm = normalizeText(rawQuery);

  const catalog = (customCatalog && customCatalog.length > 0) ? customCatalog : FALLBACK_PRODUCTS;

  // Lấy các categoryId khớp với từ khóa
  const matchedCats = [];
  for (const item of KEYWORD_CATEGORY_MAP) {
    if (item.keywords.some(k => qNorm.includes(k) || k.includes(qNorm))) {
      matchedCats.push(item.catId);
    }
  }

  const directMatches = [];
  const semanticMatches = [];

  catalog.forEach(product => {
    const pName = normalizeText(product.name);
    const pBrand = normalizeText(product.brand_name);
    const pCat = normalizeText(product.category_name);

    if (pName.includes(qNorm) || pBrand.includes(qNorm)) {
      directMatches.push(product);
    } else if (matchedCats.includes(product.category_id) || pCat.includes(qNorm)) {
      semanticMatches.push(product);
    }
  });

  // Ưu tiên sản phẩm khớp trực tiếp, sau đó tới sản phẩm cùng danh mục, sắp xếp theo lượt bán
  directMatches.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
  semanticMatches.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

  const map = new Map();
  [...directMatches, ...semanticMatches].forEach(p => {
    if (!map.has(p.id)) map.set(p.id, p);
  });

  return Array.from(map.values()).slice(0, limit);
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
    const weightDelta = interactionType === 'purchase' ? 10 : (interactionType === 'cart' ? 6 : 3);
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
    // Tìm các danh mục khớp với từ khóa tìm kiếm
    const matchedCatIds = [];
    for (const item of KEYWORD_CATEGORY_MAP) {
      if (item.keywords.some(k => qNorm.includes(k) || k.includes(qNorm))) {
        matchedCatIds.push(item.catId);
      }
    }

    // Tăng điểm trọng số cho các danh mục liên quan (trọng số rất cao: +12 điểm)
    if (matchedCatIds.length > 0) {
      const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
      matchedCatIds.forEach(catId => {
        storedWeights[catId] = (storedWeights[catId] || 0) + 12;
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
    let targetCatId = null;

    if (!isNaN(parseInt(categoryNameOrId))) {
      targetCatId = parseInt(categoryNameOrId);
    } else {
      const norm = normalizeText(categoryNameOrId);
      const matched = KEYWORD_CATEGORY_MAP.find(item => item.keywords.some(k => norm.includes(k)));
      if (matched) targetCatId = matched.catId;
    }

    if (targetCatId) {
      storedWeights[targetCatId] = (storedWeights[targetCatId] || 0) + 5;
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }
  } catch (error) {
    console.warn('[trackCategoryInteraction error]:', error);
  }
}

/**
 * Lấy danh sách sản phẩm vừa xem gần đây
 */
export function getRecentlyViewedProducts() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Lấy top các danh mục được người dùng tương tác nhiều nhất
 */
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

/**
 * Lấy danh sách các từ khóa tìm kiếm gần đây
 */
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
 * Khi người dùng về lại trang chủ:
 * - Hệ thống gom tất cả sản phẩm thuộc danh mục đã tìm kiếm ("nghe lén"), danh mục đã xem
 *   và các danh mục hệ sinh thái bổ trợ (Companion Categories).
 * - Gợi ý NHIỀU VÀ LIÊN TỤC xuyên suốt dòng sản phẩm "GỢI Ý HÔM NAY", xen kẽ với các sản phẩm
 *   thịnh hành ngoài lề khác đúng chuẩn Retargeting Cadence.
 */
export function generateBlendedDiscoverFeed(rawProducts = []) {
  if (!rawProducts || rawProducts.length === 0) return [];

  const categoryWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
  const recentSearches = getRecentSearches();
  const recentViews = getRecentlyViewedProducts();
  const recentViewIds = new Set(recentViews.map(p => p.id));
  const recentCatIds = new Set(recentViews.map(p => p.category_id).filter(Boolean));

  // Top các danh mục người dùng tương tác nhiều nhất
  const topCatIds = getTopCategoryInterests();
  const searchCatIds = new Set(recentSearches.flatMap(s => s.matchedCatIds || []));

  // Tập hợp tất cả các danh mục mục tiêu (bao gồm cả danh mục tìm kiếm + vừa xem)
  const primaryCatIds = new Set([...topCatIds, ...searchCatIds, ...recentCatIds]);

  // Mở rộng ra các danh mục bổ trợ (Companion Categories) để có nhiều sản phẩm gợi ý liên tục
  const expandedCatIds = new Set(primaryCatIds);
  primaryCatIds.forEach(catId => {
    const companions = COMPANION_CATEGORIES[catId] || [];
    companions.forEach(c => expandedCatIds.add(c));
  });

  const hasUserIntent = primaryCatIds.size > 0 || recentSearches.length > 0 || recentViews.length > 0;

  // Nếu người dùng hoàn toàn mới (Cold-Start): Trả về sản phẩm bán chạy cân bằng đa ngành
  if (!hasUserIntent) {
    return [...rawProducts]
      .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
      .map((p, idx) => ({
        ...p,
        feed_badge: (p.sold_count > 1500 && idx % 4 === 0) ? 'Bán chạy' : null
      }));
  }

  // 1. Phân loại và tính điểm cho từng sản phẩm trong kho
  const scoredProducts = rawProducts.map(product => {
    let affinityScore = 0;
    let isRetargeted = false;
    let badge = null;

    const pNameNorm = normalizeText(product.name);
    const pCatNorm = normalizeText(product.category_name);

    // Nhân tố 1: Khớp từ khóa tìm kiếm gần đây ("Nghe lén" trực tiếp)
    for (const search of recentSearches.slice(0, 3)) {
      if (search.normalized && (pNameNorm.includes(search.normalized) || pCatNorm.includes(search.normalized))) {
        affinityScore += 120;
        isRetargeted = true;
        badge = 'Gợi ý tìm kiếm';
        break;
      }
      if (search.matchedCatIds && search.matchedCatIds.includes(product.category_id)) {
        affinityScore += 100;
        isRetargeted = true;
        badge = 'Tài trợ';
        break;
      }
    }

    // Nhân tố 2: Điểm số trọng số tích lũy danh mục chính
    if (primaryCatIds.has(product.category_id)) {
      const catWeight = categoryWeights[product.category_id] || 1;
      affinityScore += Math.min(catWeight * 8, 90);
      isRetargeted = true;
      if (!badge) {
        badge = recentCatIds.has(product.category_id) ? 'Tương tự vừa xem' : 'Gợi ý cho bạn';
      }
    }

    // Nhân tố 3: Thuộc danh mục hệ sinh thái bổ trợ (Companion Ecosystem)
    if (!primaryCatIds.has(product.category_id) && expandedCatIds.has(product.category_id)) {
      affinityScore += 50;
      isRetargeted = true;
      if (!badge) badge = 'Phù hợp với bạn';
    }

    // Nhân tố 4: Điểm bán chạy cơ bản trên sàn
    const soldBonus = Math.min((product.sold_count || 0) / 100, 20);
    const ratingBonus = ((product.rating_avg || 4.5) - 4) * 10;
    affinityScore += soldBonus + ratingBonus;

    // Giảm nhẹ điểm nếu chính sản phẩm đó vừa mới click xem xong (để ưu tiên các mẫu khác cùng loại hiển thị trước)
    if (recentViewIds.has(product.id)) {
      affinityScore -= 20;
    }

    return {
      ...product,
      _affinityScore: affinityScore,
      _isRetargeted: isRetargeted,
      feed_badge: badge
    };
  });

  // 2. Chia thành 2 nhóm:
  // - Pool Retargeted: Các sản phẩm được nhắm mục tiêu (nhiều sản phẩm từ danh mục chính + bổ trợ)
  // - Pool Trending: Các sản phẩm ngoài lề khác toàn sàn
  const poolRetargeted = scoredProducts
    .filter(p => p._isRetargeted)
    .sort((a, b) => b._affinityScore - a._affinityScore);

  const poolTrending = scoredProducts
    .filter(p => !p._isRetargeted)
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

  // 3. Đan xen liên tục (Continuous Interleaving Cadence):
  // Nhịp: [Retargeted, Retargeted, Trending, Retargeted, Retargeted, Trending...]
  // Đảm bảo các sản phẩm liên quan xuất hiện NHIỀU VÀ LIÊN TỤC xuyên suốt danh sách
  const blendedFeed = [];
  let rIdx = 0;
  let tIdx = 0;
  const totalItems = scoredProducts.length;

  for (let i = 0; i < totalItems; i++) {
    // Tỷ lệ 2 retargeted : 1 trending
    const isRetargetedSlot = (i % 3 !== 2);

    if (isRetargetedSlot && rIdx < poolRetargeted.length) {
      blendedFeed.push(poolRetargeted[rIdx++]);
    } else if (tIdx < poolTrending.length) {
      blendedFeed.push(poolTrending[tIdx++]);
    } else if (rIdx < poolRetargeted.length) {
      blendedFeed.push(poolRetargeted[rIdx++]);
    }
  }

  // Nếu poolRetargeted còn thừa thì đẩy tiếp vào cuối
  while (rIdx < poolRetargeted.length) {
    blendedFeed.push(poolRetargeted[rIdx++]);
  }

  return blendedFeed;
}
