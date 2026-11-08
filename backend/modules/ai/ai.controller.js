const pool = require('../../config/db');
let FALLBACK_PRODUCTS = [];
try {
  FALLBACK_PRODUCTS = require('../../../frontend/src/data/categoryProducts.js').FALLBACK_PRODUCTS || [];
} catch (e) {
  // Silent catch
}

// Danh sách kiến thức về nền tảng AuraStore
const PLATFORM_KNOWLEDGE = {
  name: 'AuraStore (ShopLite AI)',
  shipping: 'AuraStore hỗ trợ giao hàng hỏa tốc trong 2 giờ tại nội thành TP.HCM & Hà Nội, và 1-3 ngày trên toàn quốc. Đơn hàng từ $50 được miễn phí vận chuyển 100%.',
  warranty: 'Tất cả sản phẩm chính hãng Shopee Mall trên AuraStore được bảo hành chính hãng từ 12 đến 24 tháng theo đúng tiêu chuẩn nhà sản xuất.',
  returnPolicy: 'Chính sách đổi trả miễn phí trong vòng 7 ngày nếu có lỗi từ nhà sản xuất hoặc sản phẩm không đúng mô tả.',
  payment: 'Hỗ trợ đa dạng phương thức thanh toán an toàn: Thẻ tín dụng/ghi nợ (Visa, Mastercard), Ví ShopeePay, Chuyển khoản ngân hàng (QR Code) và Thanh toán khi nhận hàng (COD).'
};

// Hàm trích xuất ngân sách từ câu hỏi (vd: "dưới 1 triệu", "dưới $500", "khoảng 20 triệu")
function extractBudget(message) {
  const cleanMsg = message.toLowerCase();
  
  // Regex tìm số đô la: $500, 500$
  const dollarMatch = cleanMsg.match(/\$?\s*(\d+)\s*\$?|\$?(\d+)\s*usd/);
  if (dollarMatch && cleanMsg.includes('$')) {
    const amount = parseInt(dollarMatch[1] || dollarMatch[2]);
    if (amount) return { maxPrice: amount };
  }

  // Regex tìm triệu đồng: 1 triệu, 1.5tr, 20tr (tính tỷ giá ước tính $1 = 25.000 VNĐ)
  const millionMatch = cleanMsg.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|trieu|tr)/);
  if (millionMatch) {
    const millionVND = parseFloat(millionMatch[1].replace(',', '.'));
    const usd = Math.round((millionVND * 1000000) / 25000);
    return { maxPrice: usd };
  }

  // Regex tìm nghìn đồng: 500k, 500 nghìn, 500k
  const thousandMatch = cleanMsg.match(/(\d+)\s*(?:k|nghìn|nghin|ngàn)/);
  if (thousandMatch) {
    const k = parseInt(thousandMatch[1]);
    const usd = Math.round((k * 1000) / 25000);
    return { maxPrice: usd };
  }

  return null;
}

// Hàm phân tích ý định (Intent Recognition) & Từ khóa sản phẩm
function analyzeIntent(message) {
  const text = message.toLowerCase();

  // 1. Chào hỏi
  if (/^(chào|hello|hi|xin chào|hey|alo)\b/i.test(text) && text.length < 25) {
    return { type: 'greeting' };
  }

  // 2. Hỏi về chính sách, bảo hành, vận chuyển, đổi trả
  if (text.includes('vận chuyển') || text.includes('giao hàng') || text.includes('ship') || text.includes('bao lâu')) {
    return { type: 'policy', answer: PLATFORM_KNOWLEDGE.shipping };
  }
  if (text.includes('bảo hành') || text.includes('đổi trả') || text.includes('trả hàng') || text.includes('lỗi')) {
    return { type: 'policy', answer: `${PLATFORM_KNOWLEDGE.warranty} ${PLATFORM_KNOWLEDGE.returnPolicy}` };
  }
  if (text.includes('thanh toán') || text.includes('trả tiền') || text.includes('cod') || text.includes('visa')) {
    return { type: 'policy', answer: PLATFORM_KNOWLEDGE.payment };
  }

  // 3. Tư vấn theo ngành hàng & nhu cầu cụ thể
  let matchedCategories = [];
  let keywords = [];

  if (text.includes('điện thoại') || text.includes('smartphone') || text.includes('iphone') || text.includes('samsung') || text.includes('pixel')) {
    matchedCategories.push(10); // Smartphones & Accessories
    keywords.push('điện thoại', 'iphone', 's24', 'pixel');
  }
  if (text.includes('laptop') || text.includes('máy tính') || text.includes('macbook') || text.includes('chuột') || text.includes('bàn phím')) {
    matchedCategories.push(12); // Laptops & Computers
    keywords.push('laptop', 'macbook', 'xps', 'chuột', 'keychron');
  }
  if (text.includes('tai nghe') || text.includes('loa') || text.includes('airpods') || text.includes('âm thanh') || text.includes('marshall') || text.includes('sony')) {
    matchedCategories.push(14); // Audio
    keywords.push('tai nghe', 'airpods', 'loa', 'marshall');
  }
  if (text.includes('chơi game') || text.includes('ps5') || text.includes('nintendo') || text.includes('switch') || text.includes('tay cầm') || text.includes('gaming')) {
    matchedCategories.push(15); // Gaming
    keywords.push('game', 'ps5', 'switch', 'tay cầm');
  }
  if (text.includes('nam') || text.includes('áo polo') || text.includes('sơ mi') || text.includes('quần jean') || text.includes('áo khoác nam')) {
    matchedCategories.push(16); // Men's Fashion
    keywords.push('sơ mi', 'polo', 'jeans', 'blazer');
  }
  if (text.includes('nữ') || text.includes('đầm') || text.includes('váy') || text.includes('áo kiểu') || text.includes('áo len')) {
    matchedCategories.push(17); // Women's Fashion
    keywords.push('đầm', 'váy', 'blouse', 'len');
  }
  if (text.includes('giày') || text.includes('sneaker') || text.includes('nike') || text.includes('chạy bộ') || text.includes('adidas')) {
    matchedCategories.push(18, 19); // Shoes
    keywords.push('giày', 'air force', 'ultraboost', 'pegasus');
  }
  if (text.includes('túi') || text.includes('balo') || text.includes('ví') || text.includes('clutch')) {
    matchedCategories.push(20); // Bags
    keywords.push('túi', 'balo', 'ví');
  }
  if (text.includes('đồng hồ') || text.includes('g-shock') || text.includes('casio')) {
    matchedCategories.push(21); // Watches
    keywords.push('đồng hồ', 'casio', 'g-shock');
  }
  if (text.includes('mỹ phẩm') || text.includes('son') || text.includes('serum') || text.includes('kem chống nắng') || text.includes('làm đẹp')) {
    matchedCategories.push(25); // Beauty
    keywords.push('son', 'serum', 'l\'oréal', 'maybelline');
  }
  if (text.includes('mẹ') || text.includes('bé') || text.includes('sữa') || text.includes('tã') || text.includes('xe đẩy') || text.includes('bình sữa')) {
    matchedCategories.push(27); // Mom & Baby
    keywords.push('sữa', 'bình sữa', 'xe đẩy');
  }
  if (text.includes('quà') || text.includes('tặng') || text.includes('lego') || text.includes('sinh nhật')) {
    matchedCategories.push(32); // Gifts
    keywords.push('lego', 'robot', 'quà');
  }

  const budget = extractBudget(message);

  return {
    type: 'shopping_query',
    categories: matchedCategories,
    keywords,
    budget
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
    const analysis = analyzeIntent(trimmed);

    // 1. Trả lời chào hỏi
    if (analysis.type === 'greeting') {
      return res.json({
        reply: 'Chào bạn! Mình là **Aura AI** - Trợ lý Mua sắm Thông minh của sàn AuraStore. Mình có thể giúp bạn tìm kiếm sản phẩm theo nhu cầu, so sánh giá cả, gợi ý quà tặng hoặc giải đáp chính sách bảo hành. Bạn đang cần tìm sản phẩm gì hôm nay?',
        products: [],
        suggestedQuestions: [
          'Tư vấn laptop sinh viên mỏng nhẹ',
          'Tìm giày chạy bộ Nike êm chân',
          'Gợi ý quà tặng sinh nhật dưới $50',
          'Chính sách giao hàng và đổi trả thế nào?'
        ]
      });
    }

    // 2. Trả lời chính sách sàn
    if (analysis.type === 'policy') {
      return res.json({
        reply: analysis.answer,
        products: [],
        suggestedQuestions: [
          'Các phương thức thanh toán hỗ trợ?',
          'Tư vấn điện thoại bán chạy nhất sàn',
          'Có ưu đãi voucher nào hôm nay không?'
        ]
      });
    }

    // 3. Tư vấn mua sắm & Tìm kiếm sản phẩm thông minh trong CSDL
    let query = `
      SELECT 
        p.id, p.name, p.price, p.original_price, p.sold_count, p.rating_avg,
        p.image_url, p.category_id, p.brand_id, p.shop_id,
        s.name as shop_name, s.is_official as shop_is_official,
        c.name as category_name,
        b.name as brand_name
      FROM Products p
      JOIN Shops s ON p.shop_id = s.id
      JOIN Categories c ON p.category_id = c.id
      LEFT JOIN Brands b ON p.brand_id = b.id
      WHERE p.status = 'active'
    `;
    const params = [];

    // Lọc theo danh mục nếu khớp
    if (analysis.categories && analysis.categories.length > 0) {
      params.push(analysis.categories);
      query += ` AND p.category_id = ANY($${params.length}::int[])`;
    }

    // Lọc theo ngân sách nếu người dùng có yêu cầu
    if (analysis.budget && analysis.budget.maxPrice) {
      params.push(analysis.budget.maxPrice * 1.15); // cho phép biên độ dôi dư 15%
      query += ` AND p.price <= $${params.length}`;
    }

    // Tìm kiếm theo từ khóa nếu có
    if (analysis.keywords && analysis.keywords.length > 0) {
      const keywordClauses = analysis.keywords.map(kw => {
        params.push(`%${kw}%`);
        return `(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
      });
      query += ` AND (${keywordClauses.join(' OR ')})`;
    }

    query += ` ORDER BY p.sold_count DESC, p.rating_avg DESC LIMIT 4`;

    let matchedProducts = [];
    try {
      const dbResult = await pool.query(query, params);
      matchedProducts = dbResult.rows;
    } catch (dbErr) {
      console.warn('[AI DB query warning]:', dbErr.message);
    }

    // Nếu không tìm thấy qua DB hoặc DB offline, tìm kiếm thông minh trong FALLBACK_PRODUCTS
    if (matchedProducts.length === 0 && FALLBACK_PRODUCTS.length > 0) {
      let filtered = [...FALLBACK_PRODUCTS];

      if (analysis.categories && analysis.categories.length > 0) {
        filtered = filtered.filter(p => analysis.categories.includes(p.category_id));
      }

      if (analysis.budget && analysis.budget.maxPrice) {
        filtered = filtered.filter(p => p.price <= analysis.budget.maxPrice * 1.15);
      }

      if (analysis.keywords && analysis.keywords.length > 0) {
        filtered = filtered.filter(p => {
          const fullText = `${p.name} ${p.description || ''}`.toLowerCase();
          return analysis.keywords.some(kw => fullText.includes(kw));
        });
      }

      if (filtered.length > 0) {
        matchedProducts = filtered.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 4);
      } else {
        // Nếu bộ lọc quá chặt, lấy theo category
        if (analysis.categories && analysis.categories.length > 0) {
          matchedProducts = FALLBACK_PRODUCTS
            .filter(p => analysis.categories.includes(p.category_id))
            .slice(0, 4);
        } else {
          matchedProducts = FALLBACK_PRODUCTS.slice(0, 4);
        }
      }
    }

    // Soạn thảo câu trả lời thông minh dựa trên ngữ cảnh
    let replyText = '';
    const budgetText = analysis.budget ? `trong phân khúc ngân sách phù hợp` : '';

    if (matchedProducts.length > 0) {
      replyText = `Dựa trên nhu cầu của bạn, Aura AI đã phân tích cơ sở dữ liệu sàn AuraStore và tuyển chọn được **${matchedProducts.length} sản phẩm** chính hãng nổi bật nhất ${budgetText}:\n\n` +
        matchedProducts.map((p, idx) => `**${idx + 1}. ${p.name}**\n` +
          `• Giá ưu đãi: **$${p.price}** ${p.original_price > p.price ? `*(Giá gốc: $${p.original_price})*` : ''}\n` +
          `• Đánh giá: ⭐ ${p.rating_avg}/5 (${p.sold_count} đã bán) - Gian hàng: *${p.shop_name}*`
        ).join('\n\n') +
        `\n\nBạn có thể bấm trực tiếp vào thẻ sản phẩm bên dưới để xem chi tiết và cho vào giỏ hàng nhé!`;
    } else {
      replyText = `Aura AI đã ghi nhận nhu cầu của bạn! Hiện tại sàn có rất nhiều sản phẩm thuộc các ngành công nghệ, thời trang, đồ gia dụng và làm đẹp. Bạn có thể cho mình biết cụ thể hơn về khoảng giá hoặc thương hiệu bạn mong muốn để mình tư vấn chính xác nhất nhé!`;
    }

    return res.json({
      reply: replyText,
      products: matchedProducts.map(p => ({
        ...p,
        recommend_reason: p.sold_count > 300 ? 'Sản phẩm bán chạy nhất phân khúc' : 'Đánh giá cao 5 sao từ người mua'
      })),
      suggestedQuestions: [
        'So sánh giá với các sản phẩm tương tự',
        'Có quà tặng hoặc voucher đi kèm không?',
        'Thời gian giao hàng đến nơi là bao lâu?'
      ]
    });
  } catch (error) {
    console.error('[ChatWithAI Error]:', error);
    return res.status(500).json({
      reply: 'Xin lỗi bạn, trợ lý Aura AI đang bận xử lý dữ liệu. Bạn hãy thử lại câu hỏi nhé!',
      products: [],
      suggestedQuestions: ['Gợi ý sản phẩm bán chạy', 'Chính sách bảo hành']
    });
  }
};

module.exports = {
  chatWithAI
};
