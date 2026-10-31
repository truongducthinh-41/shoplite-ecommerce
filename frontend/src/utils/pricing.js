/**
 * Helper tính toán giá bán, giá gốc và tỷ lệ giảm giá theo chuẩn E-commerce (Shopee)
 */
export function calculatePricing(product) {
  if (!product || !product.price) {
    return { salePrice: '0.00', originalPrice: null, discountPercent: 0, hasDiscount: false };
  }

  const rawSale = parseFloat(product.price);
  const salePrice = rawSale.toFixed(2);
  let originalPrice = null;
  let discountPercent = 0;
  let hasDiscount = false;

  const rawOrig = product.original_price ? parseFloat(product.original_price) : null;

  if (rawOrig && rawOrig > rawSale) {
    originalPrice = rawOrig.toFixed(2);
    discountPercent = Math.round(((rawOrig - rawSale) / rawOrig) * 100);
    hasDiscount = discountPercent > 0;
  } else if (!product.original_price) {
    // Nếu API/DB chưa truyền original_price, tạo discount mẫu để giao diện luôn sống động
    discountPercent = (product.id % 35) + 10;
    const computed = rawSale / (1 - discountPercent / 100);
    originalPrice = computed.toFixed(2);
    hasDiscount = true;
  }

  return { salePrice, originalPrice, discountPercent, hasDiscount };
}

