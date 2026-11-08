import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, Bot, ArrowRight, ShoppingCart, RefreshCw } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { getSafeProductImage, handleImageError } from '../utils/productImages';

const QUICK_PROMPTS = [
  'Tư vấn laptop sinh viên mỏng nhẹ',
  'Tìm giày chạy bộ Nike êm chân',
  'Gợi ý quà tặng sinh nhật dưới $50',
  'Điện thoại chụp ảnh đẹp nhất sàn',
  'Chính sách bảo hành và đổi trả'
];

export default function AuraAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Chào bạn! Mình là **Aura AI** - Trợ lý Mua sắm Bá Khí nhất của sàn AuraStore. Bạn đang cần tư vấn gì? Hãy nhắn cho mình nhé! ✨',
      products: [],
      suggestedQuestions: QUICK_PROMPTS
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Ban đầu chưa có tin mới -> Không hiện noti đỏ
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const { addToCart } = useCart();

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0); // Đã mở xem tin nhắn -> Xóa chấm đỏ noti
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Tự động đóng cửa sổ chat khi click chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || loading) return;

    // 1. Thêm tin nhắn của User vào giao diện
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageContent
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // 2. Gửi yêu cầu đến Backend AI API đồng thời tạo độ trễ tự nhiên 2.3 giây
      const delayPromise = new Promise(resolve => setTimeout(resolve, 2300));
      const fetchPromise = apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: messageContent,
          conversationHistory: messages.slice(-4)
        })
      });

      const [response] = await Promise.all([fetchPromise, delayPromise]);

      // 3. Nhận phản hồi và thêm vào giao diện
      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.reply || 'Dưới đây là một số sản phẩm phù hợp với nhu cầu của bạn:',
        products: response.products || [],
        suggestedQuestions: response.suggestedQuestions || []
      };
      setMessages(prev => [...prev, aiReply]);

      // Nếu tại thời điểm AI phản hồi, cửa sổ chat đang đóng -> Bật chấm đỏ thông báo noti!
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('[AuraAIChatbot error]:', error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Fallback nếu mất mạng hoặc lỗi server
      const fallbackReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Aura AI đang gặp chút gián đoạn kết nối. Bạn có thể tham khảo trực tiếp các danh mục nổi bật hoặc các sản phẩm bán chạy nhất tại trang chủ nhé!',
        products: [],
        suggestedQuestions: ['Điện thoại bán chạy', 'Laptop sinh viên', 'Giày thể thao']
      };
      setMessages(prev => [...prev, fallbackReply]);
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Nút Floating kích hoạt Chatbot AI ở góc dưới bên phải */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Hiệu ứng sóng radar phát tín hiệu lan tỏa */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-[3px] animate-signal-beacon pointer-events-none"></span>

          <button
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="group relative flex items-center h-11 sm:h-12 px-3 group-hover:px-4 rounded-full bg-gradient-to-r from-indigo-600/40 via-purple-600/35 to-pink-500/40 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-500 backdrop-blur-md hover:backdrop-blur-none text-white border border-white/20 hover:border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer select-none"
            aria-label="Aura AI"
          >
            {/* Icon Robot thông minh với hiệu ứng rung nhẹ (wiggle) và chấm phát tín hiệu */}
            <div className="relative flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-aura-wiggle group-hover:animate-none group-hover:rotate-12 transition-transform duration-300 drop-shadow" />
              {/* Chấm xanh phát tín hiệu online */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c0d14] animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c0d14] shadow-sm"></span>
            </div>

            {/* Dòng chữ 'Aura AI' thu gọn mặc định, mở dài mượt mà và hết trong suốt khi hover */}
            <div className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 overflow-hidden transition-all duration-300 ease-out whitespace-nowrap">
              <span className="pl-2 font-bold text-xs sm:text-sm tracking-wide text-white drop-shadow">
                Aura AI
              </span>
            </div>

            {/* Chấm đỏ thông báo số tin nhắn chưa đọc (Red Notification Badge) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-extrabold rounded-full border-2 border-[#020204] shadow-lg shadow-rose-500/70 animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. Cửa sổ Chatbot Popup hiện đại, nhỏ gọn & trong suốt thanh lịch */}
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[530px] max-h-[82vh] bg-[#0a0b12]/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/70 via-purple-900/50 to-slate-900/70 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-md">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0b12]"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-white text-xs sm:text-sm">Aura AI - Trợ lý Mua sắm Bá Khí nhất</h3>
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-semibold px-1 py-0.5 rounded border border-indigo-500/40">VIP</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Trực tuyến • Tư vấn mua sắm 24/7
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble Text */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-[#181926] text-slate-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Thẻ sản phẩm gợi ý đính kèm nếu có */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 w-full space-y-2">
                    <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Gợi ý dành cho bạn:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#151622] hover:bg-[#1a1b2b] border border-white/10 hover:border-indigo-500/50 p-2.5 rounded-xl transition-all flex items-center gap-3 group"
                        >
                          <div className="w-14 h-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img
                              src={getSafeProductImage(prod)}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={handleImageError}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-medium text-white hover:text-indigo-400 line-clamp-1 block transition-colors"
                            >
                              {prod.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-rose-400">${prod.price}</span>
                              {prod.original_price > prod.price && (
                                <span className="text-[10px] text-slate-500 line-through">${prod.original_price}</span>
                              )}
                              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                • {prod.shop_name}
                              </span>
                            </div>
                            {prod.recommend_reason && (
                              <span className="text-[9px] text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/20 inline-block mt-0.5">
                                {prod.recommend_reason}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addToCart(prod, 1)}
                              className="p-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-colors"
                              title="Thêm vào giỏ hàng"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/product/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Câu hỏi gợi ý nhanh sau phản hồi */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-[10px] sm:text-[11px] bg-white/5 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/40 px-2.5 py-1 rounded-full transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2.5 text-indigo-300 text-xs bg-indigo-950/40 border border-indigo-500/20 px-3.5 py-2.5 rounded-2xl w-fit animate-pulse">
                <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Aura AI đang soạn câu trả lời...</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-[#0c0d14] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#181926] border border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500/60 transition-colors"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi Aura AI về sản phẩm, ngân sách, quà tặng..."
                className="flex-1 bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-slate-500 py-1.5"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

