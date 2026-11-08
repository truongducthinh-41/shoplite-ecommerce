import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, StarHalf, ArrowLeft, Truck, Shield, RotateCcw, Sparkles, MessageSquare } from 'lucide-react';
import { calculatePricing } from '../utils/pricing';
import { FALLBACK_PRODUCTS } from '../data/categoryProducts';
import { trackProductInteraction, COMPANION_CATEGORIES } from '../utils/userTracker';
import { getSafeProductImage, handleImageError } from '../utils/productImages';

// Tạo bình luận thực tế, tự nhiên và đặc thù riêng cho từng loại sản phẩm
function generateContextualReviews(product) {
  if (!product) return [];
  const pName = product.name || 'sản phẩm';
  const catId = Number(product.category_id);

  const reviewPools = {
    // 10: Điện thoại & Phụ kiện
    10: [
      {
        username: 'Trần Hoàng Long',
        rating: 5,
        comment: `Máy ${pName} nguyên seal chính hãng, kích hoạt bảo hành điện tử ngay. Dùng rất mượt, camera chụp đêm cực nét và pin trâu cả ngày.`,
        daysAgo: 2
      },
      {
        username: 'Lê Phương Thảo',
        rating: 5,
        comment: 'Shop đóng gói 3 lớp chống sốc cẩn thận, giao hỏa tốc 2 tiếng. Máy cầm đầm tay, màn hình 120Hz lướt mượt mà không bị nóng máy.',
        daysAgo: 4
      },
      {
        username: 'Nguyễn Tiến Dũng',
        rating: 5,
        comment: 'Đã dùng được 1 tuần, mọi tác vụ đa nhiệm và chơi game đều mượt đỉnh. Hàng Mall chuẩn chỉ, chấm 10/10.',
        daysAgo: 7
      }
    ],

    // 11: Thiết bị điện tử, Tivi, Màn hình, Máy chiếu
    11: [
      {
        username: 'Vũ Đức Thịnh',
        rating: 5,
        comment: `Màu sắc của ${pName} rất sâu và sống động. Chiếu/hiển thị màn lớn cực kỳ sắc nét, góc nhìn rộng và loa tích hợp to rõ ngoài mong đợi.`,
        daysAgo: 1
      },
      {
        username: 'Nguyễn Minh Châu',
        rating: 5,
        comment: 'Đóng thùng gỗ bọc xốp cẩn thận. Dễ dàng kết nối với điện thoại và laptop qua wifi/bluetooth, setup rạp phim tại gia cực chill.',
        daysAgo: 3
      },
      {
        username: 'Phạm Quốc Huy',
        rating: 5,
        comment: 'Hàng chính hãng bảo hành điện tử kích hoạt nhanh. Độ sáng tốt, xem phim 4K HDR nét căng từng chi tiết.',
        daysAgo: 6
      }
    ],

    // 12: Máy tính & Laptop
    12: [
      {
        username: 'Đặng Quốc Huy',
        rating: 5,
        comment: `Vỏ kim loại của ${pName} build chắc chắn, bàn phím gõ êm, màn hình chuẩn màu làm đồ họa và code rất sướng. Pin trâu dùng cả ngày.`,
        daysAgo: 2
      },
      {
        username: 'Hoàng Thị Mai',
        rating: 5,
        comment: 'Khởi động máy chỉ mất vài giây, quạt tản nhiệt êm ái không bị rú khi mở nhiều tab nặng. Đóng gói chuyên nghiệp, shop phục vụ chu đáo.',
        daysAgo: 5
      }
    ],

    // 13: Máy ảnh & Ống kính
    13: [
      {
        username: 'Lâm Hoàng Phong',
        rating: 5,
        comment: `Lấy nét mắt và khuôn mặt siêu nhanh, màu ảnh gốc của ${pName} trong trẻo không cần hậu kỳ nhiều. Cầm vừa vặn tay chụp cả ngày không mỏi.`,
        daysAgo: 3
      },
      {
        username: 'Nguyễn Thùy Trang',
        rating: 5,
        comment: 'Chất lượng quang học xuất sắc, chụp chân dung xóa phông bokeh lung linh. Shop bọc chống sốc siêu dày, an tâm tuyệt đối.',
        daysAgo: 8
      }
    ],

    // 14: Âm thanh & Tai nghe, Loa
    14: [
      {
        username: 'Phạm Minh Tuấn',
        rating: 5,
        comment: `Âm bass của ${pName} đánh lực và sâu, dải mid/treble ngọt ngào không bị chói. Chống ồn chủ động ANC cực đỉnh khi đi xe buýt.`,
        daysAgo: 1
      },
      {
        username: 'Trần Thu Hà',
        rating: 5,
        comment: 'Thiết kế đẹp tinh tế, đeo liên tục 4-5 tiếng không bị đau tai. Kết nối Bluetooth nhanh ổn định, pin dùng cả tuần mới sạc.',
        daysAgo: 4
      }
    ],

    // 15: Máy chơi game & Gaming Gear
    15: [
      {
        username: 'Bùi Anh Dũng',
        rating: 5,
        comment: `Máy ${pName} chơi game mượt mà, tốc độ load game tức thì, tay cầm rung phản hồi xúc giác siêu chân thực. Trải nghiệm game đỉnh cao!`,
        daysAgo: 2
      },
      {
        username: 'Nguyễn Hải Nam',
        rating: 5,
        comment: 'Hàng nguyên seal chuẩn phân phối chính hãng. Chơi liên tục máy vẫn êm mát, shop tặng kèm phụ kiện rất có tâm.',
        daysAgo: 5
      }
    ],

    // 16: Thời trang Nam
    16: [
      {
        username: 'Đỗ Thùy Trang',
        rating: 5,
        comment: `Chất vải của ${pName} sờ vào rất mềm mịn, đường kim mũi chỉ tỉ mỉ không hề có chỉ thừa. Form lên dáng chuẩn như mẫu, giặt không bai dão.`,
        daysAgo: 2
      },
      {
        username: 'Nguyễn Văn Hùng',
        rating: 5,
        comment: 'Vải cotton thoáng mát, thấm hút mồ hôi tốt khi vận động. Màu sắc nhã nhặn dễ phối đồ đi làm hoặc đi dạo phố.',
        daysAgo: 6
      }
    ],

    // 17: Thời trang Nữ
    17: [
      {
        username: 'Trần Bích Ngọc',
        rating: 5,
        comment: `Váy/áo ${pName} mặc lên tôn dáng lắm ạ, chất vải mềm rũ sang chảnh. Đóng gói hộp rất chỉnh chu thơm phức, chấm shop 10 điểm!`,
        daysAgo: 1
      },
      {
        username: 'Lê Thu Thảo',
        rating: 5,
        comment: 'Đúng chuẩn form chuẩn size, cạp cao hack dáng cực kỳ. Chất vải dày dặn không bị lộ, đi tiệc hay đi làm đều đẹp.',
        daysAgo: 4
      }
    ],

    // 18 & 19: Giày Nam, Nữ
    18: [
      {
        username: 'Trịnh Gia Huy',
        rating: 5,
        comment: `Đế giày của ${pName} êm chân bất ngờ, đi bộ cả ngày không bị đau gót hay cấn ngón. Chuẩn form, phối quần tây hay jeans đều đẹp.`,
        daysAgo: 3
      },
      {
        username: 'Phan Quốc Đạt',
        rating: 5,
        comment: 'Da xịn bóng đẹp, đường may chắc chắn. Hộp giày còn nguyên vẹn không móp méo, giao nhanh đúng hẹn.',
        daysAgo: 7
      }
    ],
    19: [
      {
        username: 'Vũ Ngọc Hân',
        rating: 5,
        comment: `Giày ${pName} mang êm chân, gót vững chắc không bị tròng trành. Thiết kế thanh lịch tôn chân thon dài, rất ưng ý!`,
        daysAgo: 2
      },
      {
        username: 'Đinh Mai Phương',
        rating: 5,
        comment: 'Form ôm chân chuẩn size, lót đệm êm ái. Mang đi làm đứng nhiều vẫn thoải mái, sẽ ủng hộ shop tiếp.',
        daysAgo: 5
      }
    ],

    // 20: Túi ví thời trang
    20: [
      {
        username: 'Lê Thanh Hằng',
        rating: 5,
        comment: `Chất da cao cấp của ${pName} không bị mùi khó chịu, khóa kim loại mạ sáng bóng mượt mà. Ngăn trong rộng rãi đựng vừa nhiều đồ.`,
        daysAgo: 2
      },
      {
        username: 'Nguyễn Thảo My',
        rating: 5,
        comment: 'Túi form cứng cáp sang trọng, đóng gói hộp cứng kèm túi chống bụi chính hãng. Đi làm hay đi tiệc đều rất sang.',
        daysAgo: 4
      }
    ],

    // 21: Đồng hồ
    21: [
      {
        username: 'Nguyễn Thành Nam',
        rating: 5,
        comment: `Đồng hồ ${pName} đeo lên tay nhìn rất sang trọng và đẳng cấp. Mặt kính sapphire chống trầy xước tốt, dây đeo ôm tay êm ái.`,
        daysAgo: 1
      },
      {
        username: 'Hoàng Kim Ngân',
        rating: 5,
        comment: 'Hàng chính hãng fullbox tem chống hàng giả đầy đủ. Các tính năng đo sức khỏe và nhịp tim hoạt động rất chính xác.',
        daysAgo: 5
      }
    ],

    // 22 & 23: Nhà cửa đời sống & Thiết bị thông minh
    22: [
      {
        username: 'Trần Đình Khang',
        rating: 5,
        comment: `Sản phẩm ${pName} hoàn thiện rất tỉ mỉ, chất liệu cao cấp dùng thích mê. Nhà cửa nhìn gọn gàng và hiện đại hẳn lên.`,
        daysAgo: 3
      },
      {
        username: 'Hồ Thanh Trúc',
        rating: 5,
        comment: 'Vải mềm mịn mát lạnh, đường trần chỉ kỹ lưỡng. Giặt máy không bị phai màu hay xù lông, rất hài lòng!',
        daysAgo: 6
      }
    ],
    23: [
      {
        username: 'Phạm Quang Minh',
        rating: 5,
        comment: `Thiết bị ${pName} hoạt động rất êm, kết nối điều khiển qua app trên điện thoại cực kỳ nhạy. Tiết kiệm thời gian dọn dẹp nấu nướng cho gia đình.`,
        daysAgo: 2
      },
      {
        username: 'Lê Mỹ Dung',
        rating: 5,
        comment: 'Hàng chính hãng bảo hành 2 năm tận nhà. Thiết kế hiện đại sang trọng, gia đình mình ai cũng thích.',
        daysAgo: 4
      }
    ],

    // 25: Mỹ phẩm & Làm đẹp
    25: [
      {
        username: 'Ngô Khánh Linh',
        rating: 5,
        comment: `Chất serum/kem của ${pName} mỏng nhẹ thấm nhanh, không hề gây nhờn rít hay bí da. Dùng 1 tuần thấy da ẩm mịn và căng bóng hơn hẳn.`,
        daysAgo: 1
      },
      {
        username: 'Trần Ngọc Bích',
        rating: 5,
        comment: 'Mùi hương dịu nhẹ thư giãn, thành phần lành tính không châm chích da nhạy cảm. Chuẩn hàng Mall yên tâm dùng lâu dài.',
        daysAgo: 3
      }
    ],

    // 26: Sức khỏe
    26: [
      {
        username: 'Võ Văn Kiệt',
        rating: 5,
        comment: `Sản phẩm ${pName} date còn rất xa, có tem phụ tiếng Việt và mã QR truy xuất nguồn gốc. Uống đều đặn thấy cơ thể nhẹ nhõm khỏe khoắn hơn.`,
        daysAgo: 2
      },
      {
        username: 'Lương Thị Hoa',
        rating: 5,
        comment: 'Đóng gói kín đáo kỹ càng, hướng dẫn sử dụng chi tiết. Mua cho bố mẹ dùng rất an tâm về chất lượng.',
        daysAgo: 5
      }
    ],

    // 31: Bách hóa & Thực phẩm
    31: [
      {
        username: 'Dương Mỹ Uyên',
        rating: 5,
        comment: `Gia vị/thực phẩm ${pName} date mới tinh, mùi vị thơm ngon chuẩn vị gia đình. Đóng gói chống sốc kỹ, giao nhanh trong 2h.`,
        daysAgo: 1
      },
      {
        username: 'Nguyễn Tấn Đạt',
        rating: 5,
        comment: 'Mua online trên shop vừa được giá tốt vừa freeship tận cửa. Hàng chuẩn công ty đóng gói sạch sẽ.',
        daysAgo: 4
      }
    ]
  };

  const pool = reviewPools[catId] || [
    {
      username: 'Trần Hoàng Nam',
      rating: 5,
      comment: `Sản phẩm ${pName} thực tế đẹp hơn trên hình, độ hoàn thiện tinh xảo. Nhân viên tư vấn nhiệt tình, giao hàng đúng hẹn.`,
      daysAgo: 2
    },
    {
      username: 'Đặng Mai Anh',
      rating: 5,
      comment: 'Hàng chuẩn chính hãng tem mác đầy đủ. Rất xứng đáng với giá tiền, chấm 5 sao cho chất lượng dịch vụ của shop!',
      daysAgo: 5
    }
  ];

  return pool.map((r, i) => ({
    id: 1000 + i + (Number(product.id) * 10),
    username: r.username,
    rating: r.rating,
    comment: r.comment,
    created_at: new Date(Date.now() - (86400000 * r.daysAgo)).toISOString()
  }));
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({ type: '', items: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    // 1. Luôn cuộn lên đỉnh trang ngay lập tức khi mở bất kỳ sản phẩm nào
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodData, recData, reviewsData] = await Promise.all([
          apiFetch(`/products/${id}`).catch(() => null),
          apiFetch(`/products/${id}/recommendations`).catch(() => ({ type: '', recommendations: [] })),
          apiFetch(`/reviews/product/${id}`).catch(() => [])
        ]);

        let activeProduct = prodData;
        let activeRecs = recData?.recommendations || [];
        let activeReviews = reviewsData || [];

        // Fallback to local catalog if cloud DB does not have this product yet
        if (!activeProduct) {
          activeProduct = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id));
        }

        if (activeProduct) {
          // Gợi ý SẢN PHẨM TƯƠNG TỰ: Ưu tiên cùng danh mục (sameCategory) 100%
          const sameCategory = FALLBACK_PRODUCTS.filter(
            p => p.category_id === activeProduct.category_id && String(p.id) !== String(activeProduct.id)
          );
          let recList = [...sameCategory];
          if (recList.length < 4) {
            const companionCatIds = COMPANION_CATEGORIES[activeProduct.category_id] || [];
            const companions = FALLBACK_PRODUCTS.filter(
              p => companionCatIds.includes(p.category_id) && String(p.id) !== String(activeProduct.id)
            );
            recList = [...recList, ...companions];
          }
          activeRecs = recList.slice(0, 4);

          // Đánh giá thiết thực theo từng loại sản phẩm cụ thể
          if (!activeReviews || activeReviews.length === 0 || activeReviews.every(r => r.username === 'Nguyễn Văn Anh' || r.username === 'Bành Thị Tòn Tén')) {
            activeReviews = generateContextualReviews(activeProduct);
          }
        }

        setProduct(activeProduct);
        if (activeProduct) {
          trackProductInteraction(activeProduct, 'view');
        }
        setActiveImageIndex(0);
        setRecommendations({ type: 'similar', items: activeRecs });
        setReviews(activeReviews);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        const fallbackItem = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id));
        setProduct(fallbackItem || null);
        if (fallbackItem) {
          trackProductInteraction(fallbackItem, 'view');
          const sameCat = FALLBACK_PRODUCTS.filter(
            p => p.category_id === fallbackItem.category_id && String(p.id) !== String(fallbackItem.id)
          ).slice(0, 4);
          setRecommendations({ type: 'similar', items: sameCat });
          setReviews(generateContextualReviews(fallbackItem));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-12 text-slate-500">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    trackProductInteraction(product, 'cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    if (!newReview.comment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      const result = await apiFetch(`/reviews/product/${id}`, {
        method: 'POST',
        body: JSON.stringify(newReview)
      }).catch(() => null);

      const reviewItem = result || {
        id: Date.now(),
        product_id: Number(id),
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: new Date().toISOString()
      };
      // Add mock username since backend doesn't return it on POST
      reviewItem.username = user.name || user.username || 'You';
      setReviews(prev => [reviewItem, ...prev]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : (product.rating_avg ? parseFloat(product.rating_avg).toFixed(1) : 4.8);

  const { salePrice, originalPrice, discountPercent, hasDiscount } = calculatePricing(product);

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh mục
      </Link>

      <div className="bg-[#111] rounded-3xl shadow-sm border border-white/10 overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Product Image Gallery */}
          <div className="bg-white/5 p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 relative">
            {product.images && product.images.length > 0 ? (
              <>
                <div
                  className="w-full mb-6 flex-grow flex items-center justify-center h-64 md:h-80 overflow-hidden cursor-zoom-in relative"
                  onMouseMove={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (!img) return;
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    img.style.transformOrigin = `${x}% ${y}%`;
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(2)';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('img');
                    if (img) {
                      img.style.transform = 'scale(1)';
                      img.style.transformOrigin = 'center center';
                    }
                  }}
                >
                  <img
                    src={product.images[activeImageIndex] || getSafeProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-xl transition-transform duration-200 pointer-events-none"
                    referrerPolicy="no-referrer"
                    data-category-id={product.category_id}
                    onError={handleImageError}
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 w-full max-w-md justify-start md:justify-center scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            ) : product.image_url ? (
              <div
                className="w-full max-w-md h-auto overflow-hidden cursor-zoom-in"
                onMouseMove={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (!img) return;
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  img.style.transformOrigin = `${x}% ${y}%`;
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(2)';
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) {
                    img.style.transform = 'scale(1)';
                    img.style.transformOrigin = 'center center';
                  }
                }}
              >
                <img
                  src={getSafeProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-xl transition-transform duration-200 pointer-events-none"
                  referrerPolicy="no-referrer"
                  data-category-id={product.category_id}
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="w-full max-w-md aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
                <span className="text-3xl font-bold opacity-50">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 md:p-12 flex flex-col text-white">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                {product.category_path || product.category_name || `Category #${product.category_id}`}
              </span>
              {product.stock > 0 && product.stock < 15 && (
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                  Only {product.stock} left in stock!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                {averageRating % 1 !== 0 ? <StarHalf className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
              </div>
              <span className="text-sm text-slate-400 font-medium">({averageRating}) • {reviews.length} reviews</span>
            </div>

            {/* Price Box with Clear Discount Tag */}
            <div className="flex items-end gap-3 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-3xl sm:text-4xl font-extrabold text-rose-400">${salePrice}</p>
              {hasDiscount && (
                <>
                  <p className="text-xl text-slate-500 line-through mb-1">${originalPrice}</p>
                  <span className="text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-500 px-2.5 py-1 rounded-md mb-1.5 shadow-sm">
                    GIẢM {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/10 rounded-xl bg-black/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors rounded-l-xl"
                  >-</button>
                  <span className="w-12 text-center font-medium text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors rounded-r-xl"
                  >+</button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-slate-400 font-medium">Giao Hàng Nhanh Toàn Quốc</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-slate-400 font-medium">Cam Kết Chính Hãng 100%</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs text-slate-400 font-medium">Đổi Trả Dễ Dàng 30 Ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-[#111] rounded-3xl shadow-sm border border-white/10 overflow-hidden mb-12 p-8 md:p-12 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white/10 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Đánh Giá Từ Khách Hàng</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a Review */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-4">Viết Đánh Giá</h3>
            {reviewError && <p className="text-rose-400 text-sm mb-4 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{reviewError}</p>}

            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Đánh giá sao</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} hover:scale-110 transition-transform`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nhận xét của bạn</label>
                  <textarea
                    rows="4"
                    value={newReview.comment}
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full border border-white/10 bg-black/50 text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                    placeholder="Chia sẻ cảm nhận chi tiết của bạn về sản phẩm này..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 flex justify-center shadow-lg shadow-indigo-600/30"
                >
                  {submittingReview ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Gửi Đánh Giá'}
                </button>
              </form>
            ) : (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                <p className="text-slate-400 mb-4">Vui lòng đăng nhập để gửi đánh giá sản phẩm.</p>
                <Link to="/auth" className="inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors">Đăng nhập / Đăng ký</Link>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{review.username || review.user_name || 'Khách hàng'}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {recommendations.items && recommendations.items.length > 0 && (
        <div className="mb-12">
          <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Sản Phẩm Tương Tự
                </h2>
                <p className="text-xs text-slate-400">Các sản phẩm cùng ngành hàng bạn có thể quan tâm</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendations.items.map((rec, idx) => {
                const recPricing = calculatePricing(rec);
                return (
                  <Link
                    key={rec.id}
                    to={`/product/${rec.id}`}
                    className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/5 hover:border-indigo-500/50 hover:shadow-lg transition-all group flex flex-col h-full relative"
                  >
                    <div className="aspect-square w-full bg-black/40 rounded-xl mb-3 overflow-hidden relative">
                      {rec.image_url ? (
                        <img
                          src={getSafeProductImage(rec)}
                          alt={rec.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          data-category-id={rec.category_id}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform duration-300">
                          <span className="font-bold text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-medium text-slate-200 text-xs mb-1 line-clamp-2 min-h-[32px] group-hover:text-indigo-400 transition-colors">{rec.name}</h3>
                      <div className="mt-auto">
                        <div className="flex flex-col">
                          {recPricing.hasDiscount ? (
                            <span className="text-[10px] text-slate-500 line-through">${recPricing.originalPrice}</span>
                          ) : null}
                          <span className="text-indigo-400 font-bold text-sm">${recPricing.salePrice}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
