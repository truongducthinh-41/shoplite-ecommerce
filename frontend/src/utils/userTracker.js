// Utility theo vết hành vi người dùng & Động cơ Gợi ý Cá nhân hóa Đan xen (Shopee / TikTok Interleaved Algorithm)
import { apiFetch } from '../services/api';

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

// Bản đồ từ khóa tìm kiếm ánh xạ sang Category ID
const KEYWORD_CATEGORY_MAP = [
  { keywords: ['tai nghe', 'airpod', 'headphone', 'loa', 'marshall', 'sony wh', 'am thanh', 'audio', 'earphone'], catId: 16 },
  { keywords: ['dien thoai', 'iphone', 'samsung', 'xiaomi', 'oppo', 'smartphone', 'op lung', 'cu sac', 'cap sac', 'phu kien dien thoai'], catId: 3 },
  { keywords: ['laptop', 'macbook', 'dell', 'asus', 'may tinh', 'pc', 'ban phim', 'chuot may tinh', 'thinkpad', 'acer'], catId: 7 },
  { keywords: ['game', 'gaming', 'ps5', 'tay cam', 'nintendo', 'playstation', 'xbox'], catId: 21 },
  { keywords: ['ao', 'quan', 'hoodie', 'polo', 'jean', 'jacket', 'so mi', 'thoi trang nam', 'vest', 'nam'], catId: 1 },
  { keywords: ['vay', 'dam', 'croptop', 'chan vay', 'thoi trang nu', 'nu', 'ao kieu'], catId: 2 },
  { keywords: ['giay nam', 'sneaker nam', 'giay da'], catId: 13 },
  { keywords: ['giay nu', 'cao got', 'sandal nu', 'sneaker nu'], catId: 12 },
  { keywords: ['giay', 'sneaker', 'nike', 'adidas', 'puma', 'jordan'], catId: 13 },
  { keywords: ['son', 'kem', 'serum', 'my pham', 'trang diem', 'duong da', 'beauty', 'nuoc hoa', 'chong nang', 'tay trang'], catId: 8 },
  { keywords: ['dong ho', 'watch', 'rolex', 'casio', 'apple watch', 'dong ho deo tay'], catId: 11 },
  { keywords: ['tui', 'balo', 'vi', 'clutch', 'tui xach', 'tui deo cheo'], catId: 14 },
  { keywords: ['me', 'be', 'sua', 'bim', 'ta', 'noi em be', 'tre em', 'do choi tre em'], catId: 4 },
  { keywords: ['nha cua', 'noi', 'chao', 'den', 'giuong', 'nem', 'trang tri', 'noi that'], catId: 6 },
  { keywords: ['thong minh', 'hut bui', 'robot', 'noi chien', 'may loc', 'gia dung', 'appliances'], catId: 15 },
  { keywords: ['may anh', 'camera', 'lens', 'ong kinh', 'canon', 'fujifilm', 'nikon'], catId: 9 },
  { keywords: ['suc khoe', 'vitamin', 'omega', 'thuc pham chuc nang', 'canxi', 'khau trang'], catId: 10 },
  { keywords: ['the thao', 'tap gym', 'ta', 'bong da', 'chay bo', 'yoga', 'vot'], catId: 17 },
  { keywords: ['thuc pham', 'banh', 'keo', 'tra', 'ca phe', 'do an vat', 'groceries'], catId: 18 },
  { keywords: ['xe', 'o to', 'xe may', 'mu bao hiem', 'nhot', 'phu tung xe'], catId: 19 },
  { keywords: ['sach', 'van phong pham', 'but', 'so', 'tieu thuyet', 'giao trinh'], catId: 20 },
  { keywords: ['thu cung', 'meo', 'cho', 'pate', 'chuong', 'cat ve sinh'], catId: 22 },
  { keywords: ['qua tang', 'gift', 'gau bong', 'hop qua', '8/3', 'valentine'], catId: 23 },
  { keywords: ['voucher', 'ma giam gia', 'phieu mua hang'], catId: 24 }
];

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
    const weightDelta = interactionType === 'purchase' ? 8 : (interactionType === 'cart' ? 5 : 2);
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
 * Tương tự cơ chế của Shopee / TikTok Shop: Khi người dùng tìm "tai nghe" hay "áo thun",
 * hệ thống ghi nhận từ khóa để ngay sau đó "len lỏi" sản phẩm liên quan vào trang chủ!
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

    // Tăng điểm trọng số cho các danh mục liên quan đến từ khóa tìm kiếm
    if (matchedCatIds.length > 0) {
      const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
      matchedCatIds.forEach(catId => {
        // Tương tác tìm kiếm mang trọng số ý định rất cao (+6 điểm)
        storedWeights[catId] = (storedWeights[catId] || 0) + 6;
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
    ].slice(0, 5); // Giữ 5 từ khóa tìm kiếm gần nhất
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
      storedWeights[targetCatId] = (storedWeights[targetCatId] || 0) + 3;
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
 * Thay vì hiển thị một khối "Gợi ý AI" lộ liễu và thô kệch, thuật toán này tích hợp thẳng
 * vào dòng sản phẩm "GỢI Ý HÔM NAY" của Trang Chủ:
 * - Tự động phát hiện các danh mục và từ khóa mà người dùng vừa tìm kiếm/vừa xem.
 * - Tính điểm phù hợp đa nhân tố (Multi-Factor Relevance Score).
 * - Đan xen (Interleave) các sản phẩm "được nghe lén" một cách tinh tế và tự nhiên vào feed (tỷ lệ 60/40),
 *   kèm theo các huy hiệu thương mại thực tế như "Tài trợ" (Sponsored), "Gợi ý" hoặc "Yêu thích".
 * - Khi người dùng chưa có lịch sử (khách mới): Feed tự động duy trì sự cân bằng đa dạng từ top bán chạy toàn sàn.
 */
export function generateBlendedDiscoverFeed(rawProducts = []) {
  if (!rawProducts || rawProducts.length === 0) return [];

  const categoryWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
  const recentSearches = getRecentSearches();
  const recentViews = getRecentlyViewedProducts();
  const recentViewIds = new Set(recentViews.map(p => p.id));
  const recentCatIds = new Set(recentViews.map(p => p.category_id).filter(Boolean));

  // Tập hợp các Category ID được người dùng quan tâm cao nhất
  const topCatIds = getTopCategoryInterests();
  const searchCatIds = new Set(recentSearches.flatMap(s => s.matchedCatIds || []));

  // Kiểm tra xem người dùng đã có lịch sử tương tác ("dữ liệu nghe lén") hay chưa
  const hasUserIntent = topCatIds.length > 0 || recentSearches.length > 0 || recentViews.length > 0;

  // Nếu là người dùng hoàn toàn mới: Trả về danh sách bán chạy chuẩn với phân bổ đa ngành
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

    // Nhân tố 1: Khớp từ khóa tìm kiếm gần đây (Tín hiệu ý định mạnh nhất!)
    for (const search of recentSearches.slice(0, 3)) {
      if (search.normalized && (pNameNorm.includes(search.normalized) || pCatNorm.includes(search.normalized))) {
        affinityScore += 80;
        isRetargeted = true;
        badge = 'Gợi ý tìm kiếm';
        break;
      }
      if (search.matchedCatIds && search.matchedCatIds.includes(product.category_id)) {
        affinityScore += 60;
        isRetargeted = true;
        badge = 'Tài trợ';
        break;
      }
    }

    // Nhân tố 2: Điểm số trọng số tích lũy danh mục (Category Affinity)
    const catWeight = categoryWeights[product.category_id] || 0;
    if (catWeight > 0) {
      affinityScore += Math.min(catWeight * 5, 70);
      if (topCatIds.slice(0, 2).includes(product.category_id)) {
        isRetargeted = true;
        if (!badge) badge = 'Gợi ý';
      }
    }

    // Nhân tố 3: Cùng ngành hàng với sản phẩm vừa xem
    if (recentCatIds.has(product.category_id) && !recentViewIds.has(product.id)) {
      affinityScore += 40;
      isRetargeted = true;
      if (!badge) badge = 'Tương tự vừa xem';
    }

    // Nhân tố 4: Sản phẩm bán chạy cơ bản trên sàn
    const soldBonus = Math.min((product.sold_count || 0) / 100, 20);
    const ratingBonus = ((product.rating_avg || 4.5) - 4) * 10;
    affinityScore += soldBonus + ratingBonus;

    // Giảm nhẹ điểm nếu chính sản phẩm đó vừa mới click xem cách đây vài giây (để hiển thị các sản phẩm khác cùng loại trước)
    if (recentViewIds.has(product.id)) {
      affinityScore -= 25;
    }

    return {
      ...product,
      _affinityScore: affinityScore,
      _isRetargeted: isRetargeted,
      feed_badge: badge
    };
  });

  // 2. Chia thành 2 nhóm sản phẩm:
  // - Nhóm A: Sản phẩm khớp sở thích / "nghe lén" (Retargeted Pool)
  // - Nhóm B: Sản phẩm thịnh hành chung toàn sàn (Trending / Exploration Pool)
  const poolRetargeted = scoredProducts
    .filter(p => p._isRetargeted)
    .sort((a, b) => b._affinityScore - a._affinityScore);

  const poolTrending = scoredProducts
    .filter(p => !p._isRetargeted)
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

  // 3. Đan xen tự nhiên (Cadence Interleaving) theo nhịp Shopee:
  // Nhịp: [Retargeted, Retargeted, Trending, Retargeted, Trending, Retargeted...]
  const blendedFeed = [];
  let rIdx = 0;
  let tIdx = 0;
  const totalItems = scoredProducts.length;

  for (let i = 0; i < totalItems; i++) {
    // Vị trí 0, 1, 3, 5 ưu tiên đưa sản phẩm liên quan sở thích vào
    const shouldPickRetargeted = (i % 3 !== 2) && (rIdx < poolRetargeted.length);

    if (shouldPickRetargeted) {
      blendedFeed.push(poolRetargeted[rIdx++]);
    } else if (tIdx < poolTrending.length) {
      blendedFeed.push(poolTrending[tIdx++]);
    } else if (rIdx < poolRetargeted.length) {
      blendedFeed.push(poolRetargeted[rIdx++]);
    }
  }

  return blendedFeed;
}
