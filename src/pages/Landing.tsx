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
} from "lucide-react";
import { useNavigate } from "react-router";
import { useRef, useState, useEffect, useCallback } from "react";

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

const featuredProducts = [
  {
    name: "Whey Protein Isolate",
    price: "₹7,499",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394",
    rating: 4.8,
    reviews: 13,
  },
  {
    name: "Blood & Guts Pre-Workout",
    price: "₹3,299",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500.jpg?v=1721899129",
    rating: 4.6,
    reviews: 8,
  },
  {
    name: "Stim Reaper Black",
    price: "₹2,599",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81dVpMvgXLL._AC_SL1500.jpg?v=1721899130",
    rating: 4.9,
    reviews: 21,
  },
  {
    name: "Napalm Pre-Workout",
    price: "₹4,999",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/tango-foxtrot.webp?v=1741765326",
    rating: 4.7,
    reviews: 15,
  },
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

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

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
    <div className="min-h-screen bg-black text-white overflow-x-hidden w-full max-w-full">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2b2a27] bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          {/* Top row — tall like Unmatched Supps */}
          <div className="h-28 flex items-center justify-between">
            {/* Left — search + supplements */}
            <div className="hidden lg:flex items-center gap-8">
              <button className="w-10 h-10 flex items-center justify-center hover:text-[#c2202f] transition-colors cursor-pointer">
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
      <section ref={heroRef} className="relative w-full h-[60vh] min-h-[400px] max-h-[650px] overflow-hidden mt-28">
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
              className="w-full h-full cursor-pointer block"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt="Hero banner"
                className="w-full h-full object-cover"
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

      {/* ── Featured Products ── */}
      <section id="featured" className="py-24 px-6">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0}
            className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
                Hot Selling <span className="text-[#c2202f]">Products</span>
              </h2>
              <p className="mt-3 text-[#999999] text-lg">Our most popular supplements this month.</p>
            </div>
            <Button variant="ghost" className="text-[#c2202f] hover:text-[#de3746] hover:bg-[#c2202f]/5 cursor-pointer hidden sm:flex" onClick={() => navigate("/catalogue")}>
              View All <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, i) => (
              <motion.div key={product.name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn} custom={i} onClick={() => navigate("/catalogue")} className="group cursor-pointer">
                {/* Product card — Unmatched Supps style: black bg, no border */}
                <div className="relative aspect-square bg-black overflow-hidden mb-4">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                  {/* Quick View overlay */}
                  <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full bg-[#c2202f] text-white py-3 font-['Orbitron'] text-sm tracking-wider uppercase text-center cursor-pointer">
                      Quick view
                    </div>
                  </div>
                </div>
                {/* Star rating */}
                <StarRating rating={product.rating} reviews={product.reviews} />
                {/* Product name — uppercase Orbitron */}
                <h3 className="font-['Orbitron'] text-sm font-normal tracking-[0.15em] uppercase text-white mb-1">
                  {product.name}
                </h3>
                {/* Price */}
                <p className="text-base font-semibold text-white">{product.price}</p>
              </motion.div>
            ))}
          </div>
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
