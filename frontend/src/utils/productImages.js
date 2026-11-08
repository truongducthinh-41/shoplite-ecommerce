import { FALLBACK_PRODUCTS } from '../data/categoryProducts';

// List of known 404 / broken Unsplash IDs
const KNOWN_BROKEN_SUBSTRINGS = [
  'photo-1678911820864-e6c5bb5d2cf5',
  'photo-1527814050087-179f015b67e7',
  'photo-1542272604-780c96856592',
  'photo-1584990347449-34b7f7535b91',
  'photo-1556228722-d0b5ed0cd015',
  'photo-1610945265064-0e34e5519bbf',
  'photo-1608248597359-5f284e3',
  'placehold.co'
];

// Direct verified 200 OK image map for products that had broken URLs in remote database
const PRODUCT_EXACT_IMAGE_MAP = [
  {
    keywords: ['s24', 'galaxy s24'],
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800'
  },
  {
    keywords: ['magic mouse'],
    image: 'https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?auto=format&fit=crop&q=80&w=800'
  },
  {
    keywords: ['quần jeans', 'uniqlo slim fit'],
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'
  },
  {
    keywords: ['dyson', 'v15 detect', 'hút bụi'],
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800&h=800'
  },
  {
    keywords: ['nồi chảo', 'chảo chống dính', 'nồi chiên'],
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=800'
  },
  {
    keywords: ['tẩy trang', 'l\'oréal micellar', 'loreal micellar'],
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800'
  }
];

// Fallback hình ảnh theo từng ngành hàng chính xác (tránh bị lỗi hiển thị đồng hồ cho mọi sản phẩm)
export const CATEGORY_FALLBACK_IMAGES = {
  10: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800', // Điện thoại
  11: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800', // Tivi / Điện tử
  12: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800', // Laptop / Máy tính
  13: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', // Máy ảnh
  14: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800', // Loa / Âm thanh
  15: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800', // Gaming
  16: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800', // Thời trang nam
  17: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800', // Thời trang nữ
  18: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', // Giày nam
  19: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800', // Giày nữ
  20: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800', // Túi ví
  21: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', // Đồng hồ
  22: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800', // Nhà cửa & Đời sống
  23: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800', // Thiết bị thông minh
  24: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800', // Thú cưng
  25: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', // Mỹ phẩm
  26: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800', // Sức khỏe
  27: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800', // Mẹ & Bé
  28: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800', // Thể thao
  29: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800', // Ô tô xe máy
  30: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800', // Sách
  31: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800', // Bách hóa
  32: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=800', // Quà tặng
  33: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800'  // Voucher
};

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

export function getSafeProductImage(product) {
  if (!product) return DEFAULT_PRODUCT_IMAGE;

  const rawUrl = product.image_url || (product.images && product.images[0]) || '';
  const productName = (product.name || '').toLowerCase();

  // First, check if product name matches known problematic items
  for (const item of PRODUCT_EXACT_IMAGE_MAP) {
    if (item.keywords.some(kw => productName.includes(kw))) {
      return item.image;
    }
  }

  // Check if rawUrl is empty or contains broken patterns
  const isBroken = !rawUrl || KNOWN_BROKEN_SUBSTRINGS.some(sub => rawUrl.includes(sub));

  if (isBroken) {
    // Try to find a matching product in FALLBACK_PRODUCTS by name
    const match = FALLBACK_PRODUCTS.find(p => {
      const pName = (p.name || '').toLowerCase();
      if (!pName || !productName) return false;
      return (
        pName === productName ||
        pName.includes(productName.slice(0, 20)) ||
        productName.includes(pName.slice(0, 20))
      );
    });

    if (match && match.image_url && !KNOWN_BROKEN_SUBSTRINGS.some(sub => match.image_url.includes(sub))) {
      return match.image_url;
    }

    if (product.category_id && CATEGORY_FALLBACK_IMAGES[product.category_id]) {
      return CATEGORY_FALLBACK_IMAGES[product.category_id];
    }

    return DEFAULT_PRODUCT_IMAGE;
  }

  return rawUrl;
}

export function handleImageError(e) {
  if (!e || !e.target) return;
  const currentSrc = e.target.src || '';

  // Thử tải lại ảnh gốc 1 lần với cache-buster nếu bị gián đoạn mạng
  if (!currentSrc.includes('retry=1')) {
    const sep = currentSrc.includes('?') ? '&' : '?';
    e.target.src = currentSrc + sep + 'retry=1';
    return;
  }

  e.target.onerror = null;
  const catId = e.target.getAttribute('data-category-id');
  const fallback = (catId && CATEGORY_FALLBACK_IMAGES[catId]) || DEFAULT_PRODUCT_IMAGE;
  e.target.src = fallback;
}

export default getSafeProductImage;
