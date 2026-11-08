// Utility theo vết hành vi người dùng & tính toán gợi ý cá nhân hóa (Client + Server Hybrid)
import { apiFetch } from '../services/api';

const RECENT_VIEWS_KEY = 'aurastore_recent_views';
const CATEGORY_WEIGHTS_KEY = 'aurastore_category_weights';

/**
 * Ghi nhận tương tác của người dùng với sản phẩm (view, cart, purchase)
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
    ].slice(0, 8); // Giữ tối đa 8 sản phẩm gần nhất
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updatedViews));

    // 2. Tính toán điểm trọng số sở thích danh mục (Category Affinity Score)
    const weightDelta = interactionType === 'purchase' ? 5 : (interactionType === 'cart' ? 3 : 1);
    const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
    const catId = product.category_id;
    if (catId) {
      storedWeights[catId] = (storedWeights[catId] || 0) + weightDelta;
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }

    // 3. Gửi đồng bộ lên Backend API nếu có kết nối
    apiFetch('/products/track-interaction', {
      method: 'POST',
      body: JSON.stringify({
        productId: product.id,
        categoryId: product.category_id,
        interactionType
      })
    }).catch(() => {
      // Bỏ qua nếu offline hoặc API chưa sẵn sàng
    });
  } catch (error) {
    console.warn('[userTracker warning]:', error);
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
    return sorted.slice(0, 3);
  } catch {
    return [];
  }
}

/**
 * Thuật toán tính toán và trả về danh sách sản phẩm cá nhân hóa từ tập sản phẩm hiện có
 */
export function calculatePersonalizedRecommendations(catalog = [], limit = 6) {
  if (!catalog || catalog.length === 0) return [];

  const topCatIds = getTopCategoryInterests();
  const recentViews = getRecentlyViewedProducts();
  const recentIds = new Set(recentViews.map(p => p.id));

  // Nếu người dùng đã có lịch sử tương tác với ít nhất 1 danh mục
  if (topCatIds.length > 0) {
    // Lấy các sản phẩm thuộc các danh mục yêu thích, ưu tiên sản phẩm chưa xem
    const favoredProducts = catalog
      .filter(p => topCatIds.includes(p.category_id) && !recentIds.has(p.id))
      .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

    // Nếu đủ số lượng, trả về ngay
    if (favoredProducts.length >= limit) {
      return favoredProducts.slice(0, limit).map(p => ({
        ...p,
        personalized_reason: `Phù hợp với sở thích ${p.category_name || 'của bạn'}`
      }));
    }

    // Nếu chưa đủ, bổ sung thêm các sản phẩm bán chạy nhất sàn
    const remaining = catalog
      .filter(p => !topCatIds.includes(p.category_id) && !recentIds.has(p.id))
      .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

    const combined = [...favoredProducts, ...remaining].slice(0, limit);
    return combined.map(p => ({
      ...p,
      personalized_reason: topCatIds.includes(p.category_id)
        ? `Gợi ý theo danh mục bạn quan tâm`
        : `Sản phẩm xu hướng nổi bật`
    }));
  }

  // Khách hàng mới chưa có lịch sử tương tác: Gợi ý các sản phẩm có điểm rating và lượt bán cao nhất
  return [...catalog]
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    .slice(0, limit)
    .map(p => ({
      ...p,
      personalized_reason: 'Top thịnh hành trên sàn'
    }));
}
