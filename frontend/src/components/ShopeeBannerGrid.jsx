import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const mainBanners = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop", // Sale 1
  "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=2070&auto=format&fit=crop", // Sale 2
  "https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=2070&auto=format&fit=crop"  // Apparel
];

const sideBanners = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop", // Shoes
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"  // Audio
];

export default function ShopeeBannerGrid() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === mainBanners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === mainBanners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? mainBanners.length - 1 : prev - 1));
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-2 mt-4 mb-8">
      {/* Main Carousel (Left - 66%) */}
      <div className="relative w-full md:w-2/3 aspect-[21/9] md:aspect-[2.2/1] rounded-xl overflow-hidden group border border-white/10 shadow-lg bg-[#111]">
        {mainBanners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img 
              src={banner} 
              alt={`Banner ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay for text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {mainBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentSlide ? "bg-white scale-125" : "bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Side Static Banners (Right - 33%) */}
      <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-2">
        {sideBanners.map((banner, idx) => (
          <div key={idx} className="relative w-1/2 md:w-full flex-1 rounded-xl overflow-hidden group border border-white/10 shadow-lg bg-[#111]">
            <img 
              src={banner} 
              alt={`Side Banner ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
