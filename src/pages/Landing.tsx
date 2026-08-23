import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Zap,
  Star,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProductDetail from "@/components/ProductDetail";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const BASE = import.meta.env.BASE_URL || "/";

const heroSlides = [
  { image: `${BASE}hero-1.jpg` },
  { image: `${BASE}hero-2.jpg` },
  { image: `${BASE}gym_3.png` },
];

const features = [
  {
    title: "Genuine Products",
    description: "Every product sourced from authorized distributors with full traceability and authenticity.",
    icon: Shield,
  },
  {
    title: "Best Prices",
    description: "Competitive pricing with up to 40% off MRP on premium international brands.",
    icon: Award,
  },
  {
    title: "Wide Range",
    description: "879+ products from 50+ international brands across every supplement category.",
    icon: Zap,
  },
];

function formatINR(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  inStock: boolean;
  imageUrl?: string;
  tags: string[];
  servings?: string;
  weight?: string;
  featured?: boolean;
  stockQuantity?: number;
};

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Fetch featured products from Convex database
  const allProducts = useQuery(api.products.list, {}) as Product[] | undefined;
  const featuredFromDB = (allProducts ?? []).filter((p) => p.featured);

  // Selected product for detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);



  

  


  // Product carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.offsetWidth * 0.75;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  // Touch/drag support for carousel
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) scrollCarousel(diff > 0 ? 'right' : 'left');
  };

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Dropdown state

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-swipe
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);


  return (
    <div className="min-h-screen bg-black text-white w-full" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ── Hero Carousel — Full clickable images, no text overlay ── */}
      <section ref={heroRef} className="relative w-full h-[320px] sm:h-[420px] lg:h-[600px] mt-[168px] sm:mt-[80px] lg:mt-28" style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
<button
  onClick={() => navigate("/catalogue")}
  className="relative w-full h-full cursor-pointer block"
>
  <img
  src={heroSlides[currentSlide].image}
  alt="Hero banner"
  className="w-full h-full object-cover block"
  style={{ objectPosition: "center 15%" }}
/>
</button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 flex items-center gap-3 z-10">
          <button
            onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
            className="w-10 h-10 md:w-12 md:h-12 border border-[#2b2a27] bg-black/60 backdrop-blur-sm flex items-center justify-center hover:border-[#c2202f] hover:bg-[#c2202f]/10 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
            className="w-10 h-10 md:w-12 md:h-12 border border-[#2b2a27] bg-black/60 backdrop-blur-sm flex items-center justify-center hover:border-[#c2202f] hover:bg-[#c2202f]/10 transition-all cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 flex items-center gap-3 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { goToSlide(i); setIsAutoPlaying(false); }}
              className={`h-1 transition-all duration-500 cursor-pointer ${
                i === currentSlide
                  ? "w-10 bg-[#c2202f]"
                  : "w-5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        {isAutoPlaying && (
          <div className="absolute top-4 right-8 lg:right-10 z-10">
            <div className="flex items-center gap-2 text-[10px] text-[#999999] uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c2202f] animate-pulse" />
              Auto
            </div>
          </div>
        )}
      </section>

      {/* ── Featured Products — from database ── */}
      <section id="featured" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0}
            className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-['Orbitron'] text-2xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
                Hot Selling <span className="text-[#c2202f]">Products</span>
              </h2>
              <p className="mt-3 text-[#999999] text-base sm:text-lg">Our most popular supplements — all from our catalogue.</p>
            </div>
            <Button variant="ghost" className="text-[#c2202f] hover:text-[#de3746] hover:bg-[#c2202f]/5 cursor-pointer hidden sm:flex" onClick={() => navigate("/catalogue")}>
              View All <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>

          {featuredFromDB.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#999999] text-lg">Loading products from catalogue...</p>
            </div>
          ) : (
            <div className="relative">
              {/* Scroll buttons */}
              <button onClick={() => scrollCarousel("left")} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-[#2b2a27] bg-black/80 backdrop-blur-sm flex items-center justify-center hover:border-[#c2202f] transition-all cursor-pointer hidden sm:flex">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button onClick={() => scrollCarousel("right")} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-[#2b2a27] bg-black/80 backdrop-blur-sm flex items-center justify-center hover:border-[#c2202f] transition-all cursor-pointer hidden sm:flex">
                <ChevronRight className="h-5 w-5 text-white" />
              </button>

              {/* Horizontal scroll carousel */}
              <div
                ref={carouselRef}
                className="flex gap-3 sm:gap-6 overflow-x-auto scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
              {featuredFromDB.slice(0, 12).map((product, i) => {
                const msg = encodeURIComponent(`Hi TheDietStore 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n💰 Price: ${formatINR(product.price)}\n📋 SKU: ${product.sku}\n\nPlease share details about:\n• Availability & stock\n• Bulk/wholesale pricing\n• Delivery options\n\nThank you!`);
                return (
                <motion.div key={product._id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                  variants={scaleIn} custom={i} className={`group flex-shrink-0 w-[42vw] xs:w-[180px] sm:w-[260px] md:w-[280px] lg:w-[280px] ${!product.inStock ? 'opacity-60 grayscale' : ''}`}>
                  {/* Product card — clickable, opens detail modal */}
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="relative aspect-square overflow-hidden mb-4 cursor-pointer group-hover:scale-[1.02] transition-transform duration-500"
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2 product-img" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#999999]">No Image</div>
                    )}
                    {/* Sold out badge */}
                    {!product.inStock && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#c2202f] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-['Orbitron']">
                          Sold out
                        </span>
                      </div>
                    )}
                    {/* Quick View overlay */}
                    <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-full bg-[#c2202f] text-white py-3 font-['Orbitron'] text-sm tracking-wider uppercase text-center cursor-pointer">
                        Quick view
                      </div>
                    </div>
                  </div>

                  {/* Brand */}
                  <p className="text-[10px] text-[#c2202f] font-medium uppercase tracking-wider mb-1">
                    {product.brand}
                  </p>

                  {/* Product name — uppercase Orbitron */}
                  <h3
                    onClick={() => setSelectedProduct(product)}
                    className="font-['Orbitron'] text-sm font-normal tracking-[0.15em] uppercase text-white mb-1 line-clamp-2 cursor-pointer hover:text-[#c2202f] transition-colors"
                  >
                    {product.name}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-[#999999] leading-relaxed mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-base font-semibold text-white">{formatINR(product.price)}</p>
                    {product.compareAtPrice && (
                      <p className="text-sm text-[#999999] line-through">{formatINR(product.compareAtPrice)}</p>
                    )}
                  </div>

                  {/* WhatsApp Enquiry Button */}
                  <a
                    href={`https://wa.me/918295158184?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 text-xs font-medium tracking-wider font-['Orbitron'] uppercase"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Enquire on WhatsApp
                  </a>
                </motion.div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="font-['Orbitron'] text-2xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
              Why <span className="text-[#c2202f]">TheDietStore</span>
            </h2>
            <p className="mt-4 text-[#999999] max-w-lg mx-auto text-base sm:text-lg">We make supplement browsing simple, fast, and reliable.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp} custom={i} className="group border border-[#2b2a27] bg-[#111111] p-6 sm:p-10 hover:border-[#c2202f]/30 transition-all duration-300">
                  <Icon className="h-8 w-8 text-[#c2202f] mb-5" strokeWidth={1.5} />
                  <h3 className="font-['Orbitron'] text-base font-normal tracking-[0.15em] uppercase mb-3 text-white">{feature.title}</h3>
                  <p className="text-sm text-[#999999] leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0}
            className="relative border border-[#2b2a27] bg-[#111111] p-8 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#c2202f]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="font-['Orbitron'] text-2xl sm:text-4xl font-normal tracking-[0.15em] uppercase">Ready to stock up?</h2>
              <p className="mt-4 text-[#999999] max-w-md mx-auto text-base sm:text-lg">Browse our full catalogue with wholesale pricing and real-time inventory.</p>
              <Button size="lg" className="mt-8 bg-[#c2202f] text-white hover:bg-[#de3746] font-medium px-10 h-13 text-[15px] cursor-pointer tracking-wide" onClick={() => navigate("/catalogue")}>
                View Catalogue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#2b2a27] py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`${BASE}logoo.png`} alt="TheDietStore" className="h-8 w-auto object-contain" />
          </div>
          <p className="text-sm text-[#999999] tracking-wide">© 2026 TheDietStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}