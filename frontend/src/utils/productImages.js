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
    keywords: ['nồi chảo', 'lock&lock'],
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=800'
  },
  {
    keywords: ['tẩy trang', 'l\'oréal micellar', 'loreal micellar'],
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800'
  }
];

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

    return DEFAULT_PRODUCT_IMAGE;
  }

  return rawUrl;
}

export function handleImageError(e) {
  if (!e || !e.target) return;
  e.target.onerror = null;
  e.target.src = DEFAULT_PRODUCT_IMAGE;
}

export default getSafeProductImage;
