// Utility theo vết hành vi người dùng & Động cơ Gợi ý Cá nhân hóa Đan xen (Shopee / TikTok Interleaved Algorithm)
import { apiFetch } from '../services/api';
import { FALLBACK_PRODUCTS } from '../data/categoryProducts';
import { getSafeProductImage } from './productImages';

const RECENT_VIEWS_KEY = 'aurastore_recent_views';
const CATEGORY_WEIGHTS_KEY = 'aurastore_category_weights';
const RECENT_SEARCHES_KEY = 'aurastore_recent_searches';

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt & tiếng Anh chuyên sâu:
 * - Khử toàn bộ dấu thanh sắc huyền hỏi ngã nặng
 * - XỬ LÝ TRIỆT ĐỂ ký tự đ/Đ thành d/D (tránh lỗi font tiếng Việt nổi tiếng)
 * - Chuyển chữ thường và trim khoảng trắng
 */
export const normalizeText = (text) =>
  (text || '')
    .toString()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// TỪ ĐIỂN TỪ ĐỒNG NGHĨA VIỆT - ANH (QUERY SYNONYMS EXPANSION)
export const QUERY_SYNONYMS = {
  phone: ['dien thoai', 'smartphone', 'iphone', 'samsung'],
  'dien thoai': ['phone', 'smartphone', 'iphone', 'samsung'],
  smartphone: ['phone', 'dien thoai'],
  dt: ['dien thoai', 'phone'],
  laptop: ['may tinh', 'macbook'],
  'may tinh': ['laptop', 'pc', 'macbook'],
  computer: ['laptop', 'may tinh'],
  pc: ['may tinh', 'laptop'],
  'tai nghe': ['headphone', 'airpod', 'earphone'],
  headphone: ['tai nghe', 'airpod'],
  airpod: ['tai nghe', 'airpods'],
  loa: ['soundbar', 'speaker', 'marshall'],
  speaker: ['loa'],
  'dong ho': ['watch', 'smartwatch', 'apple watch'],
  watch: ['dong ho', 'smartwatch'],
  smartwatch: ['dong ho', 'watch'],
  giay: ['sneaker', 'shoes'],
  sneaker: ['giay'],
  shoes: ['giay'],
  ao: ['shirt', 'hoodie', 'polo', 'ao thun', 'ao so mi', 'ao khoac'],
  shirt: ['ao', 'ao thun', 'ao so mi'],
  quan: ['jean', 'pants', 'trousers', 'quan jean', 'quan tay'],
  pants: ['quan'],
  jean: ['quan jean', 'quan'],
  vay: ['dam', 'dress', 'skirt'],
  dam: ['vay', 'dress'],
  dress: ['dam', 'vay'],
  tui: ['bag', 'balo', 'backpack', 'tui xach', 'vi'],
  bag: ['tui', 'tui xach', 'vi'],
  balo: ['backpack', 'tui'],
  backpack: ['balo', 'tui'],
  son: ['son moi', 'lipstick'],
  lipstick: ['son', 'son moi'],
  'my pham': ['beauty', 'cosmetics', 'duong da', 'serum', 'kem'],
  cosmetics: ['my pham', 'beauty'],
  'nuoc hoa': ['perfume'],
  perfume: ['nuoc hoa']
};

// TỪ ĐIỂN CỤM TỪ TÌM KIẾM PHỔ BIẾN (AUTOCOMPLETE SUGGESTIONS) TRÊN TOÀN SÀN
export const ALL_SEARCH_SUGGESTIONS = [
  // 1. Điện thoại & Phụ kiện công nghệ (Category 10)
  'điện thoại thông minh',
  'điện thoại iphone chính hãng',
  'điện thoại samsung galaxy',
  'điện thoại chơi game cấu hình cao',
  'điện thoại giá rẻ pin trâu',
  'điện thoại xiaomi redmi',
  'smartphone 5g cao cấp',
  'phone case ốp lưng điện thoại',
  'củ sạc nhanh type-c 45w samsung',
  'phụ kiện điện thoại thông minh',

  // 2. Thời trang nam (Category 16)
  'áo thun nam cotton thoáng mát',
  'áo hoodie unisex thể thao',
  'áo polo nam cao cấp chính hãng',
  'áo sơ mi nam công sở chống nhăn',
  'áo khoác gió nam chống nước',
  'áo khoác blazer nam lịch lãm',
  'quần jean nam slimfit co giãn',
  'quần tây âu nam công sở',
  'quần short nam thể thao',

  // 3. Thời trang nữ (Category 17)
  'áo sơ mi lụa nữ công sở',
  'áo blazer nữ thanh lịch',
  'áo len nữ cổ lọ giữ nhiệt',
  'áo kiểu nữ thời trang',
  'váy đầm dạ hội dự tiệc',
  'chân váy xếp ly midi dáng dài',
  'đầm maxi hoa nhí đi biển',
  'quần ống rộng nữ cạp cao',

  // 4. Máy tính & Laptop (Category 12)
  'laptop văn phòng mỏng nhẹ sinh viên',
  'laptop gaming đồ họa rtx',
  'macbook pro m3 space black',
  'chuột công thái học không dây logitech',
  'bàn phím cơ không dây bluetooth',
  'màn hình máy tính gaming 2k',

  // 5. Âm thanh (Category 14)
  'tai nghe bluetooth không dây',
  'tai nghe chống ồn chủ động sony',
  'tai nghe airpods pro 2 chính hãng',
  'loa bluetooth di động marshall',
  'loa soundbar phòng khách',

  // 6. Giày dép nam & nữ (Category 18 & 19)
  'giày sneaker thể thao nam',
  'giày chạy bộ êm chân thoáng khí',
  'giày tây da bò nam công sở',
  'giày cao gót nữ quai mảnh',
  'giày sneaker nữ thời trang',
  'dép sandal nữ quai ngang',

  // 7. Làm đẹp & Mỹ phẩm (Category 25)
  'son môi cao cấp chính hãng lì mịn',
  'son kem lì lâu trôi chính hãng',
  'kem chống nắng bảo vệ da quang phổ rộng',
  'serum dưỡng sáng mờ thâm loreal paris',
  'nước hoa nam nữ chính hãng cao cấp',
  'nước tẩy trang dịu nhẹ cho da nhạy cảm',

  // 8. Đồng hồ (Category 21)
  'đồng hồ thông minh apple watch',
  'đồng hồ nam casio chính hãng',
  'đồng hồ cơ nam rolex sang trọng',
  'smartwatch thể thao đo nhịp tim',

  // 9. Túi xách & Balo (Category 20)
  'túi xách nữ đeo chéo da thật',
  'balo laptop chống nước du lịch',
  'ví da nam cầm tay cao cấp',

  // 10. Gaming (Category 15)
  'máy chơi game playstation 5 ps5',
  'tay cầm chơi game không dây',
  'máy chơi game nintendo switch oled',
  'tai nghe gaming âm thanh vòm 7.1',

  // 11. Gia dụng thông minh & Nhà cửa (Category 22 & 23)
  'robot hút bụi lau nhà thông minh',
  'nồi chiên không dầu điện tử',
  'máy lọc không khí gia đình',
  'bộ chăn ga gối lụa tencel lock&lock',

  // 12. Mẹ & Bé (Category 27)
  'sữa bột phát triển chiều cao trí não cho bé',
  'tã bỉm dán sơ sinh chống tràn',
  'xe đẩy em bé gấp gọn du lịch',
  'đồ chơi trẻ em thông minh',

  // 13. Máy ảnh (Category 13)
  'máy ảnh mirrorless canon eos',
  'máy ảnh full-frame sony alpha a7',
  'ống kính chân dung lens kit',

  // 14. Thể thao & Sức khỏe (Category 26 & 28)
  'thảm tập yoga định tuyến chống trượt',
  'bộ tạ tay đa năng tập tại nhà',
  'viên uống dầu cá omega 3 nhập khẩu'
];

// Bản đồ từ khóa ngành hàng chuẩn xác 100% với Category ID trong Database & Fallback Catalog
export const CATEGORY_SYNONYMS = [
  {
    catId: 10,
    categoryName: 'Smartphones & Accessories',
    keywords: ['phone', 'dien thoai', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'pixel', 'redmi', 'galaxy', 'op lung', 'cu sac', 'cap sac', 'phu kien dien thoai', 'sac nhanh', 'mobile', 'cellphone', 'apple']
  },
  {
    catId: 14,
    categoryName: 'Audio',
    keywords: ['tai nghe', 'airpod', 'headphone', 'earphone', 'loa', 'marshall', 'sony wh', 'am thanh', 'audio', 'loa bluetooth', 'soundbar']
  },
  {
    catId: 12,
    categoryName: 'Laptops & Computers',
    keywords: ['laptop', 'macbook', 'dell', 'asus', 'may tinh', 'pc', 'ban phim', 'chuot may tinh', 'thinkpad', 'acer', 'man hinh', 'computer']
  },
  {
    catId: 15,
    categoryName: 'Gaming',
    keywords: ['game', 'gaming', 'ps5', 'tay cam', 'nintendo', 'playstation', 'xbox', 'chuot gaming', 'ban phim co']
  },
  {
    catId: 11,
    categoryName: 'Electronics',
    keywords: ['tivi', 'tv', 'lg oled', 'may chieu', 'man hinh oled', 'dien tu', 'electronics']
  },
  {
    catId: 16,
    categoryName: "Men's Fashion",
    keywords: ['ao', 'quan', 'hoodie', 'polo', 'jean', 'jacket', 'so mi', 'thoi trang nam', 'vest', 'nam', 'ao thun nam', 'shirt', 'men', 'that lung', 'quan jean', 'quan tay']
  },
  {
    catId: 17,
    categoryName: "Women's Fashion",
    keywords: ['vay', 'dam', 'croptop', 'chan vay', 'thoi trang nu', 'nu', 'ao kieu', 'set do nu', 'dress', 'women', 'blazer nu']
  },
  {
    catId: 25,
    categoryName: 'Beauty',
    keywords: ['son', 'kem', 'serum', 'my pham', 'trang diem', 'duong da', 'beauty', 'nuoc hoa', 'chong nang', 'tay trang', 'phan phu', 'cosmetics', 'lipstick']
  },
  {
    catId: 18,
    categoryName: "Men's Shoes",
    keywords: ['giay nam', 'sneaker nam', 'giay da', 'giay the thao nam', 'giay tay']
  },
  {
    catId: 19,
    categoryName: "Women's Shoes",
    keywords: ['giay nu', 'cao got', 'sandal nu', 'sneaker nu', 'giay the thao nu']
  },
  {
    catId: 21,
    categoryName: 'Watches',
    keywords: ['dong ho', 'watch', 'rolex', 'casio', 'apple watch', 'dong ho deo tay', 'smartwatch']
  },
  {
    catId: 20,
    categoryName: "Women's Bags",
    keywords: ['tui', 'balo', 'vi', 'clutch', 'tui xach', 'tui deo cheo', 'vi cam tay', 'backpack', 'bag']
  },
  {
    catId: 27,
    categoryName: 'Mom & Baby',
    keywords: ['me', 'be', 'sua', 'bim', 'ta', 'noi em be', 'tre em', 'do choi tre em', 'xe day', 'baby']
  },
  {
    catId: 22,
    categoryName: 'Home & Living',
    keywords: ['nha cua', 'noi', 'chao', 'den', 'giuong', 'nem', 'trang tri', 'noi that', 'khan', 'home']
  },
  {
    catId: 23,
    categoryName: 'Smart Home & Appliances',
    keywords: ['thong minh', 'hut bui', 'robot', 'noi chien', 'may loc', 'gia dung', 'appliances', 'noi com']
  },
  {
    catId: 13,
    categoryName: 'Cameras',
    keywords: ['may anh', 'camera', 'lens', 'ong kinh', 'canon', 'fujifilm', 'nikon', 'gopro']
  },
  {
    catId: 26,
    categoryName: 'Health',
    keywords: ['suc khoe', 'vitamin', 'omega', 'thuc pham chuc nang', 'canxi', 'khau trang', 'may do huyet ap', 'health']
  },
  {
    catId: 28,
    categoryName: 'Sports & Outdoors',
    keywords: ['the thao', 'tap gym', 'ta', 'bong da', 'chay bo', 'yoga', 'vot', 'cau long', 'tennis', 'sport']
  },
  {
    catId: 31,
    categoryName: 'Groceries',
    keywords: ['thuc pham', 'banh', 'keo', 'tra', 'ca phe', 'do an vat', 'groceries', 'mi goi', 'food']
  },
  {
    catId: 29,
    categoryName: 'Automotive',
    keywords: ['xe', 'o to', 'xe may', 'mu bao hiem', 'nhot', 'phu tung xe', 'gat mua', 'auto']
  },
  {
    catId: 30,
    categoryName: 'Books & Stationery',
    keywords: ['sach', 'van phong pham', 'but', 'so tay', 'tieu thuyet', 'giao trinh', 'truyen', 'book']
  },
  {
    catId: 24,
    categoryName: 'Pet Supplies',
    keywords: ['thu cung', 'meo', 'cho', 'pate', 'chuong', 'cat ve sinh', 'thuc an cho meo', 'pet']
  },
  {
    catId: 32,
    categoryName: 'Gifts',
    keywords: ['qua tang', 'gift', 'gau bong', 'hop qua', '8/3', 'valentine', 'qua luu niem', 'mo hinh']
  },
  {
    catId: 33,
    categoryName: 'Vouchers',
    keywords: ['voucher', 'ma giam gia', 'phieu mua hang', 'the cao']
  }
];

// Hệ sinh thái ngành hàng bổ trợ liên quan (Companion Ecosystem Mapping)
export const COMPANION_CATEGORIES = {
  10: [14, 12, 21, 11, 15], // Điện thoại -> Âm thanh, Laptop, Đồng hồ, Điện tử, Gaming
  14: [10, 12, 15, 21],     // Âm thanh -> Điện thoại, Laptop, Gaming, Đồng hồ
  12: [10, 14, 15, 11],     // Laptop -> Điện thoại, Âm thanh, Gaming, Điện tử
  11: [10, 12, 14, 15],     // Điện tử -> Điện thoại, Laptop, Âm thanh
  15: [12, 14, 10, 11],     // Gaming -> Laptop, Âm thanh, Điện thoại
  16: [18, 21, 20, 28],     // Thời trang nam -> Giày nam, Đồng hồ, Túi ví, Thể thao
  17: [19, 20, 25, 21, 32], // Thời trang nữ -> Giày nữ, Túi xách, Mỹ phẩm, Đồng hồ, Quà tặng
  25: [26, 17, 32, 20],     // Mỹ phẩm -> Sức khỏe, Thời trang nữ, Quà tặng
  21: [10, 16, 17, 12]      // Đồng hồ -> Điện thoại, Thời trang, Laptop
};

/**
 * Hàm so khớp sản phẩm tìm kiếm:
 * - CHÍNH XÁC 100%, KHÔNG BAO GIỜ BỊ LẪN NGÀNH KHÁC (Áo ra áo, Điện thoại ra điện thoại, Quần ra quần)
 * - Hỗ trợ đa từ (Multi-word intersection) để các cụm gợi ý dài luôn khớp đúng sản phẩm
 * - Hỗ trợ ký tự đơn để khi người dùng vừa gõ chữ cái đầu (như c, d, p...) sản phẩm đã hiện ngay trong dropdown
 */
export function matchProductSearch(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  const qNorm = normalizeText(rawQuery);
  const pName = normalizeText(product.name);
  const pBrand = normalizeText(product.brand_name);
  const pCat = normalizeText(product.category_name);
  const pWords = pName.split(/\s+/).concat(pBrand.split(/\s+/));
  const qWords = qNorm.split(/\s+/).filter(w => w.length >= 1);

  // 1. Phân loại theo ngành hàng & từ khóa chuyên biệt (Tránh lẫn lộn 100%)
  // ĐIỆN THOẠI & PHỤ KIỆN
  const isPhoneQuery = ['phone', 'dien thoai', 'dt', 'smartphone', 'iphone', 'samsung', 'pixel', 'op lung', 'cu sac'].some(k =>
    qNorm === k || (k.includes(' ') && qNorm.includes(k)) || (k.length >= 4 && qNorm.includes(k))
  );
  if (isPhoneQuery) {
    return product.category_id === 10 || pCat.includes('smartphone') || pCat.includes('dien thoai');
  }

  // ÁO (CHỈ LẤY ÁO, KHÔNG LẤY QUẦN, KHÔNG LẤY ĐẦM, KHÔNG LẤY ĐIỆN THOẠI)
  if (qNorm === 'ao' || qNorm.startsWith('ao ') || qNorm === 'shirt') {
    return (product.category_id === 16 || product.category_id === 17) &&
      pWords.some(w => ['ao', 'shirt', 'polo', 'hoodie', 'khoac', 'blazer', 'len'].includes(w));
  }

  // QUẦN (CHỈ LẤY QUẦN, KHÔNG LẤY ÁO)
  if (qNorm === 'quan' || qNorm.startsWith('quan ') || qNorm === 'jean' || qNorm === 'pants') {
    return (product.category_id === 16 || product.category_id === 17) &&
      pWords.some(w => ['quan', 'jean', 'jeans', 'short'].includes(w));
  }

  // VÁY & ĐẦM (CHỈ LẤY VÁY/ĐẦM)
  if (qNorm === 'vay' || qNorm === 'dam' || qNorm === 'dress' || qNorm === 'chan vay') {
    return product.category_id === 17 &&
      pWords.some(w => ['vay', 'dam', 'dress', 'maxi'].includes(w));
  }

  // GIÀY DÉP
  if (qNorm === 'giay' || qNorm === 'sneaker' || qNorm === 'sandal' || qNorm === 'shoes') {
    return product.category_id === 18 || product.category_id === 19;
  }

  // ÂM THANH
  if (qNorm === 'tai nghe' || qNorm === 'loa' || qNorm === 'headphone' || qNorm === 'airpod' || qNorm === 'audio') {
    return product.category_id === 14;
  }

  // MÁY TÍNH & LAPTOP
  if (qNorm === 'laptop' || qNorm === 'may tinh' || qNorm === 'macbook' || qNorm === 'pc' || qNorm === 'computer') {
    return product.category_id === 12;
  }

  // ĐỒNG HỒ
  if (qNorm === 'dong ho' || qNorm === 'watch' || qNorm === 'smartwatch') {
    return product.category_id === 21;
  }

  // SON MÔI (KHÔNG BAO GIỜ KHỚP VỚI THƯƠNG HIỆU SONY)
  if (qNorm === 'son' || qNorm === 'son moi' || qNorm === 'lipstick') {
    return product.category_id === 25 && pWords.some(w => w === 'son' || w === 'lipstick');
  }

  // MỸ PHẨM CHUNG
  if (qNorm === 'my pham' || qNorm === 'kem' || qNorm === 'serum' || qNorm === 'nuoc hoa') {
    return product.category_id === 25;
  }

  // 2. So khớp trực tiếp chuỗi con (nếu tên sản phẩm chứa cụm từ)
  if (pName.includes(qNorm) || pBrand.includes(qNorm)) {
    if (qNorm === 'ao' && !pWords.includes('ao')) return false;
    if (qNorm === 'son' && pBrand === 'sony') return false;
    return true;
  }

  // 3. So khớp đa từ (Multi-word intersection) cho các cụm gợi ý dài
  if (qWords.length >= 2) {
    const matchCount = qWords.filter(w => pWords.some(pw => pw === w || (w.length >= 3 && pw.startsWith(w)))).length;
    if (matchCount >= Math.ceil(qWords.length * 0.6)) {
      return true;
    }
  }

  // 4. So khớp tiền tố từ đơn hoặc ký tự đầu
  if (qWords.length === 1) {
    if (qNorm.length === 1) {
      return pWords.some(w => w.startsWith(qNorm));
    }
    return pWords.some(w => w === qNorm || (qNorm.length >= 3 && w.startsWith(qNorm)));
  }

  return false;
}

/**
 * Gợi ý tìm kiếm thông minh đa tầng cho Dropdown Thanh Search (Navbar)
 * KHÔNG BAO GIỜ GỢI Ý ĐIỆN THOẠI KHI NGƯỜI DÙNG GÕ "ÁO"!
 */
export function getSmartSearchSuggestions(rawQuery, customCatalog = [], limit = 6) {
  if (!rawQuery || !rawQuery.trim()) return { queries: [], products: [] };
  const qNorm = normalizeText(rawQuery);
  const catalog = (customCatalog && customCatalog.length > 0) ? customCatalog : FALLBACK_PRODUCTS;

  // Danh sách từ khóa mở rộng (hỗ trợ từ đồng nghĩa tiếng Anh <-> tiếng Việt)
  const queryKeys = [qNorm, ...(QUERY_SYNONYMS[qNorm] || [])];

  const matchedSet = new Set();
  const queryMatches = [];

  // 1. Tìm các câu từ khóa gợi ý (Query Autocomplete) CHÍNH XÁC theo tiền tố từ
  for (const item of ALL_SEARCH_SUGGESTIONS) {
    const itemNorm = normalizeText(item);
    const words = itemNorm.split(/\s+/);

    for (const key of queryKeys) {
      // a. Toàn bộ câu bắt đầu bằng từ khóa (ví dụ "áo" -> "áo thun nam", "quần" -> "quần jean")
      const matchStart = itemNorm.startsWith(key);
      // b. Một từ trong câu KHỚP CHÍNH XÁC từ khóa (ví dụ "iphone" -> "điện thoại iphone chính hãng")
      const matchExactWord = words.some(w => w === key);
      // c. Người dùng đang gõ dở một từ dài >= 4 ký tự (ví dụ "sams" -> "samsung", "macb" -> "macbook")
      const matchPrefixWord = (key.length >= 4 && words.some(w => w.startsWith(key) && !['quan', 'dong', 'chong', 'thong', 'bong'].includes(key)));

      if (matchStart || matchExactWord || matchPrefixWord) {
        if (!matchedSet.has(item)) {
          matchedSet.add(item);
          queryMatches.push(item);
        }
        break;
      }
    }
    if (queryMatches.length >= 5) break;
  }

  // 2. Tìm các sản phẩm cụ thể khớp đúng tiêu chí
  const matchedProducts = catalog.filter(product => matchProductSearch(product, rawQuery));
  matchedProducts.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));

  return {
    queries: queryMatches,
    products: matchedProducts.slice(0, limit)
  };
}

/**
 * Ghi nhận tương tác chi tiết của người dùng với sản phẩm (view, cart, purchase)
 */
export function trackProductInteraction(product, interactionType = 'view') {
  if (!product || !product.id) return;

  try {
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

    // Tính toán điểm trọng số sở thích danh mục
    const weightDelta = interactionType === 'purchase' ? 12 : (interactionType === 'cart' ? 8 : 4);
    const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
    const catId = product.category_id;
    if (catId) {
      storedWeights[catId] = (storedWeights[catId] || 0) + weightDelta;
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }

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
 * Tự động suy luận Category IDs từ từ khóa tìm kiếm (kể cả tiếng Việt, tiếng Anh, viết tắt)
 */
export function detectCategoryIdsFromQuery(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return [];
  const qNorm = normalizeText(rawQuery);
  const words = qNorm.split(/\s+/);

  const matchedCatSet = new Set();

  // 1. Dò theo sản phẩm thực tế trong kho (Catalog Product Matching)
  FALLBACK_PRODUCTS.forEach(p => {
    if (matchProductSearch(p, rawQuery)) {
      matchedCatSet.add(p.category_id);
    }
  });

  // 2. Dò theo từ khóa ngành hàng (Category Synonyms)
  for (const item of CATEGORY_SYNONYMS) {
    const isMatched = item.keywords.some(k => {
      if (qNorm === k) return true;
      if (k.split(/\s+/).includes(qNorm)) return true;
      if (words.length > 1 && qNorm.includes(k) && k.length >= 3) return true;
      return false;
    });
    if (isMatched) {
      matchedCatSet.add(item.catId);
    }
  }

  // 3. Dò theo từ điển từ đồng nghĩa QUERY_SYNONYMS (chính xác từng từ, không dùng substring lung tung)
  const synonyms = QUERY_SYNONYMS[qNorm] || [];
  for (const syn of synonyms) {
    for (const item of CATEGORY_SYNONYMS) {
      if (item.keywords.some(k => k === syn || k.split(/\s+/).includes(syn))) {
        matchedCatSet.add(item.catId);
      }
    }
  }

  return Array.from(matchedCatSet);
}

/**
 * Ghi nhận hành vi TÌM KIẾM của người dùng (Search Intent Tracking - "Nghe lén" từ khóa)
 */
export function trackSearchQuery(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return;
  const query = rawQuery.trim();
  const qNorm = normalizeText(query);

  try {
    const matchedCatIds = detectCategoryIdsFromQuery(query);

    if (matchedCatIds.length > 0) {
      const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
      matchedCatIds.forEach(catId => {
        storedWeights[catId] = (storedWeights[catId] || 0) + 50; // Trọng số cực cao khi tìm kiếm
      });
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }

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

export function trackCategoryInteraction(categoryNameOrId) {
  if (!categoryNameOrId) return;
  try {
    const storedWeights = JSON.parse(localStorage.getItem(CATEGORY_WEIGHTS_KEY) || '{}');
    let targetCatId = null;

    if (!isNaN(parseInt(categoryNameOrId))) {
      targetCatId = parseInt(categoryNameOrId);
    } else {
      const norm = normalizeText(categoryNameOrId);
      const matched = CATEGORY_SYNONYMS.find(item =>
        normalizeText(item.categoryName) === norm || item.keywords.some(k => k === norm)
      );
      if (matched) targetCatId = matched.catId;
    }

    if (targetCatId) {
      storedWeights[targetCatId] = (storedWeights[targetCatId] || 0) + 6;
      localStorage.setItem(CATEGORY_WEIGHTS_KEY, JSON.stringify(storedWeights));
    }
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
      .map(([catId]) => parseInt(catId));
    return sorted.slice(0, 3);
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
 * XÓA TOÀN BỘ LỊCH SỬ THEO VẾT ĐỂ PHỤC VỤ DEMO TỪ ĐẦU (RESET DEMO DATA)
 */
export function resetTrackingHistory() {
  try {
    localStorage.removeItem(RECENT_VIEWS_KEY);
    localStorage.removeItem(CATEGORY_WEIGHTS_KEY);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    console.log('[Aura AI] Đã đặt lại toàn bộ lịch sử theo vết về trạng thái ban đầu.');
  } catch (e) {
    console.error('Failed to reset tracking history', e);
  }
}

if (typeof window !== 'undefined') {
  window.resetAuraDemo = resetTrackingHistory;
}

/**
 * GIẢI THUẬT ĐAN XEN CÁ NHÂN HÓA SHOPEE / TIKTOK SHOP (Interleaved Recommendation Stream)
 * 
 * - AI TỰ ĐỘNG TẬP TRUNG VÀO Ý ĐỊNH GẦN NHẤT (LATEST INTENT) CỦA NGƯỜI DÙNG:
 *   Dù người dùng có nghịch nhiều, click xem nhiều sản phẩm khác nhau đi nữa,
 *   thì sản phẩm / từ khóa VỪA MỚI TÌM HOẶC VỪA MỚI XEM GẦN NHẤT sẽ luôn được ưu tiên tuyệt đối!
 * - 12 SẢN PHẨM ĐẦU TIÊN (HÀNG 1 & HÀNG 2) 100% ĐẬP VÀO MẶT USER BẰNG SẢN PHẨM GẦN NHẤT & HỆ SINH THÁI!
 * - Xáo trộn ngẫu nhiên (Fisher-Yates) giữa các sản phẩm cùng ngành trên mỗi lần F5 / về Home.
 * - Từ hàng 3 trở đi: Đan xen liên tục (2 món liên quan : 1 món thịnh hành khác) trên toàn bộ 108 sản phẩm.
 */
export function generateBlendedDiscoverFeed(rawProducts = []) {
  if (!rawProducts || rawProducts.length === 0) return [];

  const recentSearches = getRecentSearches();
  const recentViews = getRecentlyViewedProducts();

  // 1. TÌM Ý ĐỊNH GẦN ĐÂY NHẤT (LATEST INTENT):
  // So sánh giữa lần Tìm Kiếm gần nhất và lần Xem Sản Phẩm gần nhất
  const latestSearch = recentSearches[0];
  const latestView = recentViews[0];

  let targetCatIds = [];
  let targetQuery = null;

  if (latestSearch && latestView) {
    const searchTime = latestSearch.timestamp || 0;
    const viewTime = latestView.viewed_at || 0;
    if (searchTime >= viewTime) {
      targetQuery = latestSearch.query || latestSearch.normalized;
      targetCatIds = (latestSearch.matchedCatIds && latestSearch.matchedCatIds.length > 0)
        ? latestSearch.matchedCatIds
        : detectCategoryIdsFromQuery(targetQuery);
    } else {
      targetCatIds = [latestView.category_id];
      targetQuery = latestView.name;
    }
  } else if (latestSearch) {
    targetQuery = latestSearch.query || latestSearch.normalized;
    targetCatIds = (latestSearch.matchedCatIds && latestSearch.matchedCatIds.length > 0)
      ? latestSearch.matchedCatIds
      : detectCategoryIdsFromQuery(targetQuery);
  } else if (latestView) {
    targetCatIds = [latestView.category_id];
    targetQuery = latestView.name;
  }

  // Nếu targetCatIds rỗng nhưng có targetQuery, tự động tìm danh mục của sản phẩm khớp trong kho
  if ((!targetCatIds || targetCatIds.length === 0) && targetQuery) {
    const matchedP = rawProducts.find(p => matchProductSearch(p, targetQuery));
    if (matchedP) {
      targetCatIds = [matchedP.category_id];
    }
  }

  // Hàm Fisher-Yates xáo trộn mảng ngẫu nhiên
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // NẾU LÀ KHÁCH MỚI (CHƯA CÓ LỊCH SỬ NÀO): Xáo trộn ngẫu nhiên toàn bộ 108 sản phẩm trên mỗi lần F5 / về Home
  if ((!targetCatIds || targetCatIds.length === 0) && !targetQuery) {
    return shuffleArray(rawProducts);
  }

  // 2. TẬP TRUNG TOÀN LỰC VÀO SẢN PHẨM / NGÀNH HÀNG GẦN NHẤT VỪA TÌM HOẶC VỪA XEM:
  const primaryCatSet = new Set(targetCatIds || []);
  const companionCatSet = new Set();
  primaryCatSet.forEach(catId => {
    (COMPANION_CATEGORIES[catId] || []).forEach(comp => companionCatSet.add(comp));
  });

  const poolPrimary = [];
  const poolCompanion = [];
  const poolOutside = [];

  rawProducts.forEach(product => {
    const rnd = Math.random() * 50;
    const isPrimaryCat = primaryCatSet.has(product.category_id);
    const isDirectMatch = targetQuery && matchProductSearch(product, targetQuery);

    if (isDirectMatch || isPrimaryCat) {
      poolPrimary.push({ ...product, _score: 500 + rnd });
    } else if (companionCatSet.has(product.category_id)) {
      poolCompanion.push({ ...product, _score: 250 + rnd });
    } else {
      poolOutside.push({ ...product, _score: (product.sold_count || 0) + (rnd * 2) });
    }
  });

  // Xáo trộn ngẫu nhiên bên trong từng nhóm để mỗi lần F5 thứ tự các món lại đổi mới sinh động
  poolPrimary.sort((a, b) => b._score - a._score);
  poolCompanion.sort((a, b) => b._score - a._score);
  poolOutside.sort((a, b) => b._score - a._score);

  const allRetargeted = [...poolPrimary, ...poolCompanion];
  const blendedFeed = [];
  let rIdx = 0;
  let oIdx = 0;

  // 1. HAI HÀNG ĐẦU TIÊN (12 sản phẩm đầu): 100% ĐẬP VÀO MẶT USER BẰNG SẢN PHẨM GẦN NHẤT VÀ HỆ SINH THÁI!
  while (rIdx < Math.min(12, allRetargeted.length)) {
    blendedFeed.push(allRetargeted[rIdx++]);
  }

  // 2. TỪ HÀNG THỨ 3 TRỞ ĐI: Đan xen liên tục theo nhịp 2 món liên quan : 1 món thịnh hành ngoài lề
  while (rIdx < allRetargeted.length || oIdx < poolOutside.length) {
    if (rIdx < allRetargeted.length) blendedFeed.push(allRetargeted[rIdx++]);
    if (rIdx < allRetargeted.length) blendedFeed.push(allRetargeted[rIdx++]);
    if (oIdx < poolOutside.length) blendedFeed.push(poolOutside[oIdx++]);

    if (rIdx >= allRetargeted.length && oIdx < poolOutside.length) {
      blendedFeed.push(poolOutside[oIdx++]);
    }
  }

  return blendedFeed;
}
