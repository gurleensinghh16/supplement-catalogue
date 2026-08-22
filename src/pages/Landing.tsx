import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  Award,
  Zap,
  Star,
  MessageCircle,
  Package,
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
  { image: `${BASE}hero-3.jpg` },
];

const navCategories = [
  "Stacks",
  "Protein",
  "Pre-Workout",
  "Creatine",
  "Muscle Building",
  "Hydration",
  "Post-Workout",
  "Immunity & Wellness",
  "Weight Management",
  "Digestion & Gut Health",
  "Longevity",
  "Recovery",
  "Amino Acids",
  "Samples",
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

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < Math.floor(rating) ? "fill-[#c2202f] text-[#c2202f]" : "text-[#333]"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-[#999999]">{reviews} reviews</span>
    </div>
  );
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Fetch featured products from Convex database
  const allProducts = useQuery(api.products.list, {}) as Product[] | undefined;
  const featuredFromDB = (allProducts ?? []).filter((p) => p.featured);

  // Selected product for detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !searchOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && searchOpen) setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  // Search suggestions - filter from loaded products
  const searchSuggestions = (allProducts ?? []).filter((p) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const selectSuggestion = (product: Product) => {
    setSelectedProduct(product);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Product carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const cardsPerView = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 4 : typeof window !== 'undefined' && window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = Math.max(0, (featuredFromDB.length || 12) - cardsPerView);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const cardWidth = 300;
    const newIndex = dir === 'left' ? Math.max(0, carouselIndex - 1) : Math.min(maxIndex, carouselIndex + 1);
    setCarouselIndex(newIndex);
    carouselRef.current.scrollTo({ left: newIndex * (cardWidth + 24), behavior: 'smooth' });
  };

  // Touch/drag support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) scrollCarousel(diff > 0 ? 'right' : 'left');
  };
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const handleMouseDown = (e: React.MouseEvent) => { isDragging.current = true; dragStartX.current = e.clientX; };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging.current) return; e.preventDefault(); };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 50) scrollCarousel(diff > 0 ? 'right' : 'left');
  };

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Dropdown state
  const [supplementsOpen, setSupplementsOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleDropdownEnter = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setSupplementsOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setSupplementsOpen(false), 200);
  };

  return (
    <div className="min-h-screen bg-black text-white w-full" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSearch}
              className="w-full max-w-xl mx-6"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999999]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full h-16 pl-14 pr-20 bg-[#111111] border border-[#2b2a27] text-white text-lg placeholder:text-[#999999] focus:outline-none focus:border-[#c2202f]/40 font-['Orbitron'] tracking-wider"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-5 bg-[#c2202f] text-white font-['Orbitron'] text-xs tracking-wider uppercase hover:bg-[#de3746] transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Suggestions dropdown */}
              {searchQuery.trim() && searchSuggestions.length > 0 && (
                <div className="w-full mt-2 bg-[#111111] border border-[#2b2a27] max-h-[300px] overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => selectSuggestion(product)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer border-b border-[#2b2a27] last:border-0"
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-10 w-10 object-contain flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 bg-[#2b2a27] flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-[#999999]/30" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{product.name}</p>
                        <p className="text-xs text-[#999999]">{product.brand} · {formatINR(product.price)}</p>
                      </div>
                      <Package className="h-4 w-4 text-[#999999]/30 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.trim() && searchSuggestions.length === 0 && (
                <p className="text-xs text-[#999999] mt-2 text-center">No products found for "{searchQuery}"</p>
              )}
              {!searchQuery.trim() && (
                <p className="text-xs text-[#999999] mt-3 text-center">Press <kbd className="px-1.5 py-0.5 bg-[#111111] border border-[#2b2a27] text-[#999999]">ESC</kbd> to close</p>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2b2a27] bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          {/* Top row — tall like Unmatched Supps */}
          <div className="h-28 flex items-center justify-between">
            {/* Left — search + supplements */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center hover:text-[#c2202f] transition-colors cursor-pointer">
                <Search className="h-5 w-5" />
              </button>

              {/* Supplements dropdown */}
              <div
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="group flex items-center gap-2 font-['Orbitron'] text-[16px] font-normal tracking-[0.15em] uppercase text-white hover:text-[#c2202f] transition-colors cursor-pointer py-8">
                  SUPPLEMENTS
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${supplementsOpen ? "rotate-180" : ""}`} />
                  {/* Underline on hover */}
                  <span className="absolute bottom-6 left-0 w-full h-[2px] bg-[#c2202f] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {supplementsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-72 bg-black border border-[#2b2a27] shadow-[0_20px_60px_rgba(0,0,0,0.8)] py-4 z-50"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="px-6 pb-3 mb-2 border-b border-[#2b2a27]">
                        <span className="font-['Orbitron'] text-xs tracking-[0.2em] uppercase text-[#c2202f]">Browse All</span>
                      </div>
                      {navCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSupplementsOpen(false);
                            navigate("/catalogue");
                          }}
                          className="w-full text-left px-6 py-3 text-[15px] text-[#999999] hover:text-white hover:bg-white/5 transition-all duration-200 tracking-wide cursor-pointer flex items-center justify-between group/item"
                        >
                          <span>{cat}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all duration-200" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center — logo */}
            <button onClick={() => navigate("/")} className="flex items-center cursor-pointer">
              <img src={`${BASE}logoo.png`} alt="TheDietStore" className="h-16 w-auto object-contain" />
            </button>

            {/* Right — nav links + CTA */}
            <div className="hidden lg:flex items-center gap-10">
              <a href="#featured" className="relative font-['Orbitron'] text-[16px] font-normal tracking-[0.15em] uppercase text-white hover:text-[#c2202f] transition-colors group/link py-8">
                FEATURED
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-[#c2202f] scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#features" className="relative font-['Orbitron'] text-[16px] font-normal tracking-[0.15em] uppercase text-white hover:text-[#c2202f] transition-colors group/link py-8">
                WHY US
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-[#c2202f] scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            </div>

            {/* Right — catalogue button */}
            <Button className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium text-[14px] h-12 px-8 cursor-pointer tracking-wider font-['Orbitron'] uppercase" onClick={() => navigate("/catalogue")}>
              View Catalogue
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="lg:hidden pb-4 flex items-center gap-6 text-sm text-[#999999]">
            <button onClick={() => navigate("/catalogue")} className="hover:text-white transition-colors cursor-pointer">Catalogue</button>
            <a href="#featured" className="hover:text-white transition-colors">Featured</a>
            <a href="#features" className="hover:text-white transition-colors">Why Us</a>
          </div>
        </div>
      </nav>

      {/* ── Hero Carousel — Full clickable images, no text overlay ── */}
      <section ref={heroRef} className="relative w-full h-[75vh] min-h-[500px] max-h-[850px] mt-28" style={{ overflow: 'hidden', clipPath: 'inset(0)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-hidden"
          >
            <button
              onClick={() => navigate("/catalogue")}
              className="w-full h-full cursor-pointer block overflow-hidden"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt="Hero banner"
                className="w-full h-full object-cover object-top block"
              />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <div className="absolute bottom-8 right-8 lg:right-10 flex items-center gap-3 z-10">
          <button
            onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
            className="w-12 h-12 border border-[#2b2a27] bg-black/60 backdrop-blur-sm flex items-center justify-center hover:border-[#c2202f] hover:bg-[#c2202f]/10 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
            className="w-12 h-12 border border-[#2b2a27] bg-black/60 backdrop-blur-sm flex items-center justify-center hover:border-[#c2202f] hover:bg-[#c2202f]/10 transition-all cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
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
      <section id="featured" className="py-24 px-6">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0}
            className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
                Hot Selling <span className="text-[#c2202f]">Products</span>
              </h2>
              <p className="mt-3 text-[#999999] text-lg">Our most popular supplements — all from our catalogue.</p>
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
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { isDragging.current = false; }}
              >
              {featuredFromDB.slice(0, 12).map((product, i) => {
                const msg = encodeURIComponent(`Hi TheDietStore 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n💰 Price: ${formatINR(product.price)}\n📋 SKU: ${product.sku}\n\nPlease share details about:\n• Availability & stock\n• Bulk/wholesale pricing\n• Delivery options\n\nThank you!`);
                return (
                <motion.div key={product._id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                  variants={scaleIn} custom={i} className={`group flex-shrink-0 w-[260px] sm:w-[280px] ${!product.inStock ? 'opacity-60 grayscale' : ''}`}>
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
      <section id="features" className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
              Why <span className="text-[#c2202f]">TheDietStore</span>
            </h2>
            <p className="mt-4 text-[#999999] max-w-lg mx-auto text-lg">We make supplement browsing simple, fast, and reliable.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp} custom={i} className="group border border-[#2b2a27] bg-[#111111] p-10 hover:border-[#c2202f]/30 transition-all duration-300">
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
      <section className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0}
            className="relative border border-[#2b2a27] bg-[#111111] p-12 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#c2202f]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">Ready to stock up?</h2>
              <p className="mt-4 text-[#999999] max-w-md mx-auto text-lg">Browse our full catalogue with wholesale pricing and real-time inventory.</p>
              <Button size="lg" className="mt-8 bg-[#c2202f] text-white hover:bg-[#de3746] font-medium px-10 h-13 text-[15px] cursor-pointer tracking-wide" onClick={() => navigate("/catalogue")}>
                View Catalogue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#2b2a27] py-12 px-6">
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
