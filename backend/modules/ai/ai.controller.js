const pool = require('../../config/db');
let FALLBACK_PRODUCTS = [];
try {
  FALLBACK_PRODUCTS = require('../../../frontend/src/data/categoryProducts.js').FALLBACK_PRODUCTS || [];
} catch (e) {
  try {
    FALLBACK_PRODUCTS = require('../../data/categoryProducts.js').FALLBACK_PRODUCTS || [];
  } catch (err) {
    // Silent catch
  }
}

// Hàm chuẩn hóa chuỗi tiếng Việt & tiếng Anh chuyên sâu
function cleanText(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Danh sách từ dừng tiếng Việt (Stop words) để tránh khớp sai vào các từ vụn vặt
const STOP_WORDS = new Set([
  'co', 'ban', 'khong', 'gi', 'nao', 'nay', 'shop', 'san', 'toi', 'minh',
  'em', 'anh', 'chi', 'cho', 'voi', 'duoc', 'hay', 'la', 'o', 'va', 'de',
  'cua', 'trong', 'nhu', 'the', 'hoi', 'tim', 'muon', 'can', 'xin', 'nhung',
  'mot', 'cac', 'nhe', 'nha', 'a', 'ha', 'oi', 'giup', 'tu', 'van', 'bao', 'nhieu', 'tien'
]);

// BẢN ĐỒ TỪ ĐỒNG NGHĨA KHO SẢN PHẨM (SYNONYMS EXPANSION)
const SYNONYMS = [
  { trigger: ['tivi', 'ti vi', 'tv', 'smart tv', 'oled'], keywords: ['tivi', 'tv', 'oled', 'lg oled', 'c3'], categoryIds: [11] },
  { trigger: ['may chieu', 'chieu phim', 'freestyle', 'projector'], keywords: ['may chieu', 'freestyle'], categoryIds: [11] },
  { trigger: ['dien thoai', 'phone', 'smartphone', 'dt'], keywords: ['dien thoai', 'iphone', 'samsung', 'pixel', 'redmi', 'titanium'], categoryIds: [10] },
  { trigger: ['laptop', 'may tinh', 'pc', 'macbook'], keywords: ['laptop', 'macbook', 'dell', 'xps', 'thinkpad'], categoryIds: [12] },
  { trigger: ['tai nghe', 'airpod', 'airpods', 'headphone'], keywords: ['tai nghe', 'airpods', 'wh 1000xm5', 'sony'], categoryIds: [14] },
  { trigger: ['loa', 'speaker', 'soundbar', 'marshall'], keywords: ['loa', 'marshall', 'emberton', 'soundbar', 'sony'], categoryIds: [14] },
  { trigger: ['dong ho', 'watch', 'smartwatch'], keywords: ['dong ho', 'apple watch', 'rolex', 'casio', 'edifice'], categoryIds: [21] },
  { trigger: ['hut bui', 'robot', 'roborock'], keywords: ['robot hut bui', 'roborock'], categoryIds: [23] },
  { trigger: ['noi chien', 'noi chien khong dau'], keywords: ['noi chien', 'philips'], categoryIds: [23] },
  { trigger: ['loc khong khi', 'may loc'], keywords: ['may loc khong khi', 'xiaomi'], categoryIds: [23] },
  { trigger: ['pate', 'meo', 'thu cung', 'cho meo', 'cat ve sinh'], keywords: ['pate', 'royal canin', 'cat ve sinh', 'cature'], categoryIds: [24] },
  { trigger: ['sua', 'bim', 'ta', 'meiji', 'moony', 'xe day', 'em be', 'tre em'], keywords: ['sua bot', 'meiji', 'ta quan', 'moony', 'xe day'], categoryIds: [27] },
  { trigger: ['son', 'son moi', 'lipstick', 'son kem'], keywords: ['son', 'black rouge', 'mac', 'lipstick'], categoryIds: [25] },
  { trigger: ['serum', 'duong da', 'mo tham', 'trang da'], keywords: ['serum', 'loreal', 'glycolic'], categoryIds: [25] },
  { trigger: ['kem chong nang', 'chong nang', 'anessa'], keywords: ['kem chong nang', 'anessa'], categoryIds: [25] },
  { trigger: ['dau ca', 'omega', 'huyet ap', 'omron'], keywords: ['dau ca', 'omega 3', 'kirkland', 'may do huyet ap', 'omron'], categoryIds: [26] },
  { trigger: ['ao polo', 'ao so mi', 'ao khoac nam', 'blazer nam', 'quan jean nam', 'thoi trang nam'], keywords: ['polo', 'aristino', 'so mi', 'canifa', 'blazer', 'levis', 'the north face'], categoryIds: [16] },
  { trigger: ['dam', 'vay', 'chan vay', 'thoi trang nu'], keywords: ['dam', 'vay', 'chan vay', 'chanel', 'zara', 'mango'], categoryIds: [17] },
  { trigger: ['giay', 'sneaker', 'giay the thao', 'giay tay'], keywords: ['sneaker', 'nike', 'air force', 'air jordan', 'ultraboost', 'oxford'], categoryIds: [18, 19] },
  { trigger: ['tui xach', 'balo', 'vi', 'clutch'], keywords: ['tui xach', 'gucci', 'charles keith', 'marmont', 'balo'], categoryIds: [20] },
  { trigger: ['sach', 'dac nhan tam', 'but ky', 'parker'], keywords: ['sach', 'dac nhan tam', 'but ky', 'parker'], categoryIds: [30] },
  { trigger: ['hat nem', 'ca phe', 'thuc pham', 'an vat', 'knorr', 'trung nguyen'], keywords: ['hat nem', 'knorr', 'ca phe', 'trung nguyen'], categoryIds: [31] },
  { trigger: ['lego', 'gau bong', 'qua tang', 'qua', 'tang', 'do choi', 'sinh nhat'], keywords: ['lego', 'porsche', 'gau bong', 'qua tang', 'sinh nhat'], categoryIds: [32] },
  { trigger: ['camera hanh trinh', 'mu bao hiem', 'o to', 'xe may', '70mai'], keywords: ['camera hanh trinh', '70mai', 'mu bao hiem', 'royal'], categoryIds: [29] },
  { trigger: ['yoga', 'ta tay', 'the thao', 'tap gym'], keywords: ['tham tap yoga', 'lululemon', 'ta tay'], categoryIds: [28] }
];

// BỘ KIẾN THỨC NỀN TẢNG TOÀN DIỆN VỀ SÀN AURASTORE
const PLATFORM_KNOWLEDGE = {
  name: 'AuraStore (ShopLite AI)',
  about: 'AuraStore là sàn thương mại điện tử thế hệ mới đa ngành hàng cao cấp, được thiết kế theo phong cách Dark Glassmorphism hiện đại. Hiện sàn quy tụ hơn **100+ sản phẩm chính hãng** phân phối thuộc **24 ngành hàng** (Điện thoại, Tivi & Màn hình, Laptop, Máy ảnh, Âm thanh, Gaming, Thời trang Nam/Nữ, Mỹ phẩm, Sức khỏe, Thú cưng, Sách, Thực phẩm, Mẹ & Bé, Đồ gia dụng thông minh...) từ hơn 44 thương hiệu quốc tế uy tín.',
  creator: 'Dự án sàn AuraStore và trợ lý **Aura AI** được nghiên cứu, thiết kế và phát triển bởi đội ngũ sinh viên/kỹ sư phần mềm của đồ án. Hệ thống được xây dựng trên kiến trúc Full-Stack chuẩn mực: React 18, Tailwind CSS, Node.js, Express, PostgreSQL kết hợp Động cơ Gợi ý Cá nhân hóa & Trợ lý Mua sắm Ngữ cảnh (Context-aware AI Shopping Assistant).',
  shipping: '• **Giao hỏa tốc 2 giờ:** Áp dụng cho đơn hàng nội thành Hà Nội & TP.HCM.\n• **Giao tiêu chuẩn:** 1 - 3 ngày làm việc trên toàn quốc.\n• **Chính sách Freeship:** Miễn phí vận chuyển 100% cho mọi đơn hàng có giá trị từ **$50** trở lên.',
  warranty: 'Tất cả sản phẩm bán trên sàn AuraStore đều là hàng chính hãng 100% chuẩn Shopee Mall / LazMall, được kích hoạt **Bảo hành điện tử từ 12 đến 24 tháng** theo đúng tiêu chuẩn nhà sản xuất tại các trung tâm bảo hành ủy quyền trên toàn quốc.',
  returnPolicy: 'Chính sách **Đổi trả dễ dàng trong vòng 30 ngày** (miễn phí 100% phí hoàn hàng) nếu phát sinh lỗi kỹ thuật từ nhà sản xuất hoặc sản phẩm giao không đúng với mô tả trên sàn.',
  payment: 'Hỗ trợ đa dạng và tuyệt đối an toàn với các phương thức thanh toán hàng đầu:\n1. Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard, JCB)\n2. Chuyển khoản ngân hàng qua mã VietQR thông minh\n3. Ví điện tử tiện lợi (ShopeePay, MoMo)\n4. Thanh toán khi nhận hàng (COD kiểm tra hàng trước khi trả tiền).',
  vouchers: 'Hôm nay sàn AuraStore đang áp dụng các chương trình ưu đãi cực hot:\n• **AURA20:** Giảm ngay 20% cho đơn hàng đầu tiên của khách hàng mới.\n• **FREESHIP50:** Miễn phí vận chuyển toàn quốc cho đơn từ $50.\n• **VIPMEMBER:** Tặng voucher $10 cho đơn hàng từ $100 khi tích lũy điểm thành viên.'
};

// Hàm trích xuất ngân sách thông minh (Hỗ trợ tiền Việt, Đô la, k, tr...)
function extractBudget(message) {
  const cleanMsg = message.toLowerCase();

  const dollarMatch = cleanMsg.match(/\$?\s*(\d+)\s*\$?|\$?(\d+)\s*usd/);
  if (dollarMatch && cleanMsg.includes('$')) {
    const amount = parseInt(dollarMatch[1] || dollarMatch[2]);
    if (amount) return { maxPrice: amount };
  }

  const millionMatch = cleanMsg.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|trieu|tr)/);
  if (millionMatch) {
    const millionVND = parseFloat(millionMatch[1].replace(',', '.'));
    const usd = Math.round((millionVND * 1000000) / 25000);
    return { maxPrice: usd };
  }

  const thousandMatch = cleanMsg.match(/(\d+)\s*(?:k|nghìn|nghin|ngàn)/);
  if (thousandMatch) {
    const k = parseInt(thousandMatch[1]);
    const usd = Math.round((k * 1000) / 25000);
    return { maxPrice: usd };
  }

  return null;
}

// Hàm phân tích câu hỏi toàn diện
function analyzeUserQuery(rawMessage) {
  const norm = cleanText(rawMessage);

  // 1. Chào hỏi
  if (/^(chao|hello|hi|xin chao|hey|alo)\b/i.test(norm) && norm.length < 25) {
    return { type: 'greeting' };
  }

  // 2. Hỏi về tác giả, đồ án, ai làm ra sàn
  if (norm.includes('ai lam') || norm.includes('ai sang lap') || norm.includes('tac gia') || norm.includes('do an') || norm.includes('giang vien') || norm.includes('thay giao') || norm.includes('nguoi phat trien')) {
    return {
      type: 'direct_answer',
      answer: PLATFORM_KNOWLEDGE.creator,
      suggestedQuestions: ['Sàn AuraStore là gì?', 'Sản phẩm nào đắt nhất sàn?', 'Chính sách bảo hành và đổi trả 30 ngày']
    };
  }

  // 3. Hỏi về sàn AuraStore nói chung (quy mô, có những gì)
  if (norm.includes('aurastore la gi') || norm.includes('san la gi') || norm.includes('gioi thieu') || norm.includes('shop ban gi') || norm.includes('san ban gi') || norm.includes('co nhung san pham gi') || norm.includes('co bao nhieu san pham') || norm.includes('quy mo')) {
    return {
      type: 'direct_answer',
      answer: PLATFORM_KNOWLEDGE.about,
      suggestedQuestions: ['Sản phẩm bán chạy nhất sàn', 'Top sản phẩm cao cấp nhất', 'Chính sách giao hàng và freeship']
    };
  }

  // 4. Các câu hỏi chính sách vận chuyển / giao hàng
  if (norm.includes('van chuyen') || norm.includes('giao hang') || norm.includes('ship') || norm.includes('bao lau') || norm.includes('hoa toc') || norm.includes('freeship')) {
    return {
      type: 'direct_answer',
      answer: `🚚 **Chính Sách Vận Chuyển Của AuraStore:**\n\n${PLATFORM_KNOWLEDGE.shipping}`,
      suggestedQuestions: ['Chính sách bảo hành ra sao?', 'Các phương thức thanh toán', 'Có mã giảm giá nào hôm nay?']
    };
  }

  // 5. Chính sách bảo hành
  if (norm.includes('bao hanh') || norm.includes('chinh hang') || norm.includes('hang mall') || norm.includes('hu hong') || norm.includes('bi hong')) {
    return {
      type: 'direct_answer',
      answer: `🛡️ **Cam Kết Chính Hãng & Bảo Hành:**\n\n${PLATFORM_KNOWLEDGE.warranty}`,
      suggestedQuestions: ['Chính sách đổi trả trong bao lâu?', 'Thời gian giao hàng bao lâu?', 'Tìm điện thoại chính hãng']
    };
  }

  // 6. Chính sách đổi trả
  if (norm.includes('doi tra') || norm.includes('tra hang') || norm.includes('hoan tien') || norm.includes('doi san pham')) {
    return {
      type: 'direct_answer',
      answer: `🔄 **Chính Sách Đổi Trả 30 Ngày:**\n\n${PLATFORM_KNOWLEDGE.returnPolicy}`,
      suggestedQuestions: ['Chính sách giao hàng freeship', 'Hướng dẫn thanh toán', 'Gợi ý quà tặng sinh nhật']
    };
  }

  // 7. Phương thức thanh toán
  if (norm.includes('thanh toan') || norm.includes('tra tien') || norm.includes('cod') || norm.includes('visa') || norm.includes('qr') || norm.includes('chuyen khoan')) {
    return {
      type: 'direct_answer',
      answer: `💳 **Phương Thức Thanh Toán Linh Hoạt:**\n\n${PLATFORM_KNOWLEDGE.payment}`,
      suggestedQuestions: ['Chính sách đổi trả 30 ngày', 'Mã giảm giá hôm nay', 'Top sản phẩm bán chạy']
    };
  }

  // 8. Khuyến mãi / Voucher
  if (norm.includes('voucher') || norm.includes('giam gia') || norm.includes('khuyen mai') || norm.includes('ma giam') || norm.includes('uu dai') || norm.includes('sale')) {
    return {
      type: 'direct_answer',
      answer: `🎟️ **Mã Giảm Giá & Ưu Đãi Độc Quyền:**\n\n${PLATFORM_KNOWLEDGE.vouchers}`,
      suggestedQuestions: ['Tư vấn laptop sinh viên', 'Điện thoại bán chạy nhất', 'Chính sách vận chuyển']
    };
  }

  // 9. Câu hỏi so sánh đặc biệt: Đắt nhất sàn
  if (norm.includes('dat nhat') || norm.includes('gia cao nhat') || norm.includes('vip nhat') || norm.includes('sang nhat') || norm.includes('xa xi')) {
    return { type: 'special_filter', mode: 'most_expensive' };
  }

  // 10. Rẻ nhất sàn
  if (norm.includes('re nhat') || norm.includes('gia thap nhat') || norm.includes('it tien nhat') || norm.includes('gia re nhat')) {
    return { type: 'special_filter', mode: 'cheapest' };
  }

  // 11. Bán chạy nhất / Hot nhất
  if (norm.includes('ban chay') || norm.includes('hot nhat') || norm.includes('mua nhieu nhat') || norm.includes('top seller') || norm.includes('xu huong') || norm.includes('trend')) {
    return { type: 'special_filter', mode: 'best_sellers' };
  }

  // 12. Đánh giá tốt nhất / 5 sao
  if (norm.includes('danh gia cao') || norm.includes('tot nhat') || norm.includes('5 sao') || norm.includes('uy tin nhat')) {
    return { type: 'special_filter', mode: 'top_rated' };
  }

  // 13. Mở rộng từ đồng nghĩa & Danh mục
  let expandedKeywords = [];
  let matchedCategories = [];

  for (const s of SYNONYMS) {
    if (s.trigger.some(trig => norm.includes(trig))) {
      expandedKeywords.push(...s.keywords);
      matchedCategories.push(...s.categoryIds);
    }
  }

  // Lọc từ khóa có nghĩa từ câu hỏi (loại bỏ stop words)
  const meaningfulWords = norm
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));

  expandedKeywords.push(...meaningfulWords);

  const budget = extractBudget(rawMessage);

  return {
    type: 'product_search',
    categories: [...new Set(matchedCategories)],
    keywords: [...new Set(expandedKeywords)],
    meaningfulWords,
    budget,
    rawQuery: rawMessage,
    normQuery: norm
  };
}

// Controller chính xử lý tin nhắn Chatbot AI
const chatWithAI = async (req, res) => {
  const { message = '', conversationHistory = [] } = req.body;
  const trimmed = message.trim();

  if (!trimmed) {
    return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
  }

  try {
    const analysis = analyzeUserQuery(trimmed);

    // 1. Trả lời chào hỏi
    if (analysis.type === 'greeting') {
      return res.json({
        reply: 'Chào bạn! Mình là **Aura AI** - Trợ lý Mua sắm Bá Khí nhất của sàn AuraStore. Bạn đang cần tư vấn gì? Hãy nhắn cho mình nhé! ✨',
        products: [],
        suggestedQuestions: [
          'Sản phẩm nào đắt nhất sàn?',
          'Sản phẩm nào bán chạy nhất sàn?',
          'Có bán Tivi hoặc Máy chiếu không?',
          'Chính sách bảo hành và đổi trả 30 ngày'
        ]
      });
    }

    // 2. Trả lời các câu hỏi kiến thức trực tiếp về sàn / tác giả / chính sách
    if (analysis.type === 'direct_answer') {
      return res.json({
        reply: analysis.answer,
        products: [],
        suggestedQuestions: analysis.suggestedQuestions || [
          'Top sản phẩm bán chạy nhất sàn',
          'Sản phẩm cao cấp nhất trên sàn',
          'Tư vấn đồ công nghệ & thời trang'
        ]
      });
    }

    // 3. Xử lý các câu hỏi thống kê đặc biệt (Đắt nhất, Rẻ nhất, Bán chạy nhất, Rating cao nhất)
    if (analysis.type === 'special_filter') {
      let catalog = [...FALLBACK_PRODUCTS];
      let replyTitle = '';
      let products = [];

      if (analysis.mode === 'most_expensive') {
        products = catalog.sort((a, b) => b.price - a.price).slice(0, 4);
        replyTitle = '👑 Đây là **Top 4 sản phẩm cao cấp & đắt giá nhất** trên sàn AuraStore hiện nay:';
      } else if (analysis.mode === 'cheapest') {
        products = catalog.sort((a, b) => a.price - b.price).slice(0, 4);
        replyTitle = '🏷️ Đây là **Top 4 sản phẩm có mức giá tiết kiệm & dễ tiếp cận nhất** trên sàn AuraStore:';
      } else if (analysis.mode === 'best_sellers') {
        products = catalog.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 4);
        replyTitle = '🔥 Đây là **Top 4 sản phẩm bán chạy nhất & được khách hàng săn đón nhiều nhất** trên sàn:';
      } else if (analysis.mode === 'top_rated') {
        products = catalog.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0)).slice(0, 4);
        replyTitle = '⭐ Đây là **Top 4 sản phẩm đạt đánh giá sao cao nhất (chuẩn 5 sao)** từ người mua thực tế:';
      }

      const text = `${replyTitle}\n\n` +
        products.map((p, i) => `**${i + 1}. ${p.name}**\n` +
          `• Giá: **$${p.price}** ${p.original_price > p.price ? `*(Gốc: $${p.original_price})*` : ''}\n` +
          `• ⭐ ${p.rating_avg}/5 (${p.sold_count} đã bán) • Gian hàng: *${p.shop_name}*`
        ).join('\n\n') +
        `\n\nBạn có thể nhấn vào từng thẻ sản phẩm bên dưới để xem chi tiết đầy đủ nhé!`;

      return res.json({
        reply: text,
        products: products.map(p => ({
          ...p,
          recommend_reason: analysis.mode === 'most_expensive' ? 'Phân khúc Luxury cao cấp nhất sàn' : (analysis.mode === 'best_sellers' ? 'Bán chạy số 1 toàn sàn' : 'Đánh giá 5 sao tuyệt đối')
        })),
        suggestedQuestions: [
          'Chính sách giao hàng và đổi trả 30 ngày',
          'Có mã giảm giá nào áp dụng được không?',
          'Tư vấn thêm sản phẩm công nghệ'
        ]
      });
    }

    // 4. Tìm kiếm sản phẩm thông minh dựa trên Điểm số ngữ nghĩa (Relevance Scoring)
    const normQ = analysis.normQuery;
    const meaningful = analysis.meaningfulWords;
    const keywords = analysis.keywords;
    const targetCats = analysis.categories;

    let scoredList = FALLBACK_PRODUCTS.map(product => {
      let score = 0;
      const pNameClean = cleanText(product.name);
      const pDescClean = cleanText(product.description || '');
      const pBrandClean = cleanText(product.brand_name || '');
      const pCatClean = cleanText(product.category_name || '');

      // 1. Trùng chính xác toàn bộ cụm tìm kiếm (nếu khách gõ tên sản phẩm)
      if (pNameClean.includes(normQ)) score += 150;
      if (pBrandClean && normQ.includes(pBrandClean)) score += 80;
      if (pDescClean.includes(normQ)) score += 50;

      // 2. Khớp theo ngành hàng đã được nhận diện
      if (targetCats.includes(product.category_id)) {
        score += 70;
      }

      // Ưu tiên đặc biệt chuẩn ngành hàng chính (Ví dụ: Giày là phải ra Giày 18/19, Áo ra Áo 16/17)
      if ((normQ.includes('giay') || normQ.includes('sneaker')) && (product.category_id === 18 || product.category_id === 19)) {
        score += 100;
      }
      if ((normQ.includes('ao') || normQ.includes('quan')) && (product.category_id === 16 || product.category_id === 17)) {
        score += 100;
      }
      if ((normQ.includes('dien thoai') || normQ.includes('phone') || normQ.includes('smartphone')) && product.category_id === 10) {
        score += 100;
      }

      // 3. Khớp các từ khóa mở rộng (Synonyms)
      for (const kw of keywords) {
        if (pNameClean.includes(kw)) score += 30;
        if (pBrandClean.includes(kw)) score += 25;
        if (pDescClean.includes(kw)) score += 10;
      }

      // 4. Khớp các từ có nghĩa từ câu hỏi (đã lọc stop words)
      for (const w of meaningful) {
        if (pNameClean.split(/\s+/).includes(w)) score += 55;
        else if (pNameClean.includes(w)) score += 20;

        if (pBrandClean === w) score += 40;
        else if (pBrandClean.includes(w)) score += 20;

        if (pDescClean.includes(w)) score += 10;
      }

      // 5. Ngân sách người dùng yêu cầu
      if (analysis.budget && analysis.budget.maxPrice) {
        if (product.price <= analysis.budget.maxPrice * 1.15) {
          score += 30;
        } else {
          score -= 60; // Trừ điểm nặng nếu sản phẩm vượt ngân sách
        }
      }

      return { product, score };
    });

    scoredList = scoredList.filter(item => item.score >= 20);
    scoredList.sort((a, b) => b.score - a.score);

    let matchedProducts = [];
    if (scoredList.length > 0) {
      matchedProducts = scoredList.slice(0, 4).map(item => item.product);
    } else if (targetCats.length > 0) {
      matchedProducts = FALLBACK_PRODUCTS
        .filter(p => targetCats.includes(p.category_id))
        .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
        .slice(0, 4);
    } else {
      matchedProducts = FALLBACK_PRODUCTS.slice(0, 4);
    }

    // Soạn thảo câu trả lời thông minh, bá khí & tự nhiên
    let replyText = '';
    const topItem = matchedProducts[0];
    const budgetNote = analysis.budget ? `trong tầm giá yêu cầu (dưới $${analysis.budget.maxPrice})` : '';

    if (scoredList.length > 0 && scoredList[0].score >= 50) {
      // Khớp cực kỳ chính xác sản phẩm khách tìm
      replyText = `Aura AI đã tra cứu trực tiếp trong kho sàn AuraStore và tìm thấy sản phẩm chuẩn xác cho bạn:\n\n` +
        `**${topItem.name}**\n` +
        `• **Giá ưu đãi:** **$${topItem.price}** ${topItem.original_price > topItem.price ? `*(Giá gốc: $${topItem.original_price} - Tiết kiệm $${topItem.original_price - topItem.price})*` : ''}\n` +
        `• **Đánh giá:** ⭐ **${topItem.rating_avg}/5** (${topItem.sold_count} lượt bán thành công)\n` +
        `• **Gian hàng:** *${topItem.shop_name}* (Cam kết chính hãng Mall 100%)\n` +
        `• **Mô tả & Tính năng:** ${topItem.description}\n\n` +
        (matchedProducts.length > 1 ? `Ngoài ra, sàn còn có thêm các lựa chọn tương tự cùng ngành hàng bên dưới:` : `Bạn có thể bấm ngay vào thẻ sản phẩm để cho vào giỏ hàng nhé!`);
    } else {
      replyText = `Aura AI đã phân tích toàn bộ kho sản phẩm của sàn AuraStore ${budgetNote} và tuyển chọn **${matchedProducts.length} sản phẩm chính hãng** phù hợp nhất cho bạn:\n\n` +
        matchedProducts.map((p, idx) => `**${idx + 1}. ${p.name}**\n` +
          `• Giá: **$${p.price}** | ⭐ ${p.rating_avg}/5 (${p.sold_count} đã bán) • *${p.shop_name}*`
        ).join('\n\n') +
        `\n\nBạn có thể click trực tiếp vào thẻ sản phẩm bên dưới để xem hình ảnh chi tiết và cho vào giỏ hàng nhé! ✨`;
    }

    return res.json({
      reply: replyText,
      products: matchedProducts.map(p => ({
        ...p,
        recommend_reason: p.sold_count > 300 ? 'Sản phẩm bán chạy nhất phân khúc' : 'Đánh giá 5 sao từ người mua thực tế'
      })),
      suggestedQuestions: [
        'So sánh giá với các sản phẩm tương tự',
        'Sản phẩm này có được freeship không?',
        'Chính sách bảo hành và đổi trả 30 ngày'
      ]
    });

  } catch (error) {
    console.error('[ChatWithAI Error]:', error);
    return res.status(500).json({
      reply: 'Aura AI đang cập nhật lại dữ liệu kho hàng. Bạn hãy thử lại câu hỏi trong giây lát nhé!',
      products: [],
      suggestedQuestions: ['Sản phẩm bán chạy nhất sàn', 'Chính sách bảo hành và đổi trả']
    });
  }
};

module.exports = {
  chatWithAI
};
