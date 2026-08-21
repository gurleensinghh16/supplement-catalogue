import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Eye,
  Zap,
  Shield,
  Award,
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

const heroSlides = [
  {
    title: "POWER YOUR\nPERFORMANCE",
    subtitle: "STACKS AVAILABLE",
    description: "Maximize muscle growth, explosive energy, enhanced endurance & cellular recovery.",
    cta: "Shop Performance Stacks",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500.jpg?v=1721899129",
    bgGradient: "from-[#c2202f]/20 via-black/80 to-black",
  },
  {
    title: "FUEL YOUR\nPERFORMANCE",
    subtitle: "PREMIUM SUPPLEMENTS",
    description: "Powerful nutrition for every goal. Build muscle, boost energy and become your best.",
    cta: "View Catalogue",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71Cp2-51wxL._AC_SX679.jpg?v=1721901541",
    bgGradient: "from-black/90 via-black/70 to-black",
  },
  {
    title: "BUILD LEAN\nMUSCLE",
    subtitle: "WHEY PROTEIN ISOLATE",
    description: "28g protein per serving. Grass-fed, no artificial sweeteners. The gold standard of protein.",
    cta: "Explore Protein",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394",
    bgGradient: "from-[#111111]/95 via-black/80 to-black",
  },
  {
    title: "EXTREME\nPUMPS",
    subtitle: "PRE-WORKOUT FORMULA",
    description: "350mg caffeine, 6g citrulline, 5.5g beta-alanine. Zero crash. Maximum intensity.",
    cta: "Shop Pre-Workout",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81dVpMvgXLL._AC_SL1500.jpg?v=1721899130",
    bgGradient: "from-[#c2202f]/15 via-black/85 to-black",
  },
];

const featuredProducts = [
  {
    name: "Transparent Labs Whey Isolate",
    price: "₹7,499",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/01_chocolate.png?v=1776397394",
    soldOut: true,
  },
  {
    name: "DY Blood & Guts Pre-Workout",
    price: "₹3,299",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/71oGlDLF5dL._AC_SL1500.jpg?v=1721899129",
    soldOut: false,
  },
  {
    name: "Killer Labz Stim Reaper Black",
    price: "₹2,599",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/81dVpMvgXLL._AC_SL1500.jpg?v=1721899130",
    soldOut: false,
  },
  {
    name: "Merica Labz Napalm",
    price: "₹4,999",
    image: "https://cdn.shopify.com/s/files/1/0021/4302/7249/files/tango-foxtrot.webp?v=1741765326",
    soldOut: true,
  },
];

const categories = [
  { name: "Protein", count: "8+", icon: "💪" },
  { name: "Pre-Workout", count: "10+", icon: "⚡" },
  { name: "Aminos", count: "4+", icon: "🔬" },
  { name: "Recovery", count: "4+", icon: "🛡️" },
  { name: "Fat Burners", count: "2+", icon: "🔥" },
  { name: "Vitamins", count: "2+", icon: "💊" },
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

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-swipe to the right
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation — Unmatched Supps Large Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2b2a27] bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-20 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
            <Dumbbell className="h-6 w-6 text-[#c2202f]" />
            <span className="font-['Orbitron'] text-xl font-normal tracking-[0.15em] uppercase">TheDietStore</span>
          </button>
          <div className="hidden md:flex items-center gap-10 text-[15px] text-[#999999]">
            <a href="#categories" className="hover:text-white transition-colors tracking-wide">Categories</a>
            <a href="#featured" className="hover:text-white transition-colors tracking-wide">Featured</a>
            <a href="#features" className="hover:text-white transition-colors tracking-wide">Why Us</a>
          </div>
          <Button className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium text-[15px] h-11 px-6 cursor-pointer tracking-wide" onClick={() => navigate("/catalogue")}>
            <Eye className="h-5 w-5 mr-2" /> View Catalogue
          </Button>
        </div>
      </nav>

      {/* Hero Carousel */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <img
                src={heroSlides[currentSlide].image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].bgGradient}`} />
            </div>

            {/* Content */}
            <div className="relative h-full mx-auto max-w-[1440px] px-6 lg:px-10 flex items-center">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-4 inline-flex items-center gap-2 border border-[#c2202f]/40 bg-[#c2202f]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#c2202f]"
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="font-['Orbitron'] text-5xl sm:text-6xl lg:text-[5rem] font-normal tracking-[0.12em] uppercase leading-[1.05] whitespace-pre-line"
                >
                  {heroSlides[currentSlide].title.split("\n").map((line, i) => (
                    <span key={i}>
                      {i === 1 ? <span className="text-[#c2202f]">{line}</span> : line}
                      {i === 0 && <br />}
                    </span>
                  ))}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-6 text-lg text-[#999999] max-w-lg leading-relaxed font-normal tracking-wide"
                >
                  {heroSlides[currentSlide].description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-8"
                >
                  <Button size="lg" className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium px-10 h-13 text-[15px] cursor-pointer tracking-wide" onClick={() => navigate("/catalogue")}>
                    {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
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
          <div className="absolute top-24 right-8 lg:right-10 z-10">
            <div className="flex items-center gap-2 text-[10px] text-[#999999] uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c2202f] animate-pulse" />
              Auto
            </div>
          </div>
        )}
      </section>

      {/* Trust Bar */}
      <section className="border-y border-[#2b2a27] bg-[#0a0a0a] py-5 px-6">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {[
            { icon: "✓", text: "100% Authentic Products" },
            { icon: "🔬", text: "Lab Tested" },
            { icon: "✓", text: "No Banned Substances" },
            { icon: "🏆", text: "Trusted by Athletes" },
            { icon: "📊", text: "Science Backed" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-xs sm:text-sm text-[#999999] tracking-wide uppercase">
              <span className="text-[#c2202f]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 px-6 border-t border-[#2b2a27]">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div key={product.name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn} custom={i} onClick={() => navigate("/catalogue")} className="group cursor-pointer">
                <div className="relative aspect-square bg-[#f0f0f0] rounded-lg overflow-hidden mb-3">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                  {product.soldOut && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#c2202f] text-white text-[11px] font-bold px-3 py-1 rounded">Sold out</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full bg-[#c2202f] text-white py-3 font-['Orbitron'] text-xs tracking-wider uppercase text-center">Quick View</div>
                  </div>
                </div>
                <h3 className="text-sm text-[#999999] mb-1.5 group-hover:text-[#c2202f] transition-colors line-clamp-2">{product.name}</h3>
                <p className="text-base font-semibold text-white">{product.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-[1440px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
              Shop by <span className="text-[#c2202f]">Category</span>
            </h2>
            <p className="mt-4 text-[#999999] max-w-lg mx-auto text-lg">Find exactly what you need across our full range.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((cat, i) => (
              <motion.button key={cat.name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn} custom={i} onClick={() => navigate("/catalogue")}
                className="group border border-[#2b2a27] bg-[#111111] p-10 hover:border-[#c2202f]/30 transition-all duration-300 cursor-pointer text-center">
                <span className="text-3xl mb-4 block">{cat.icon}</span>
                <h3 className="font-['Orbitron'] text-base font-normal tracking-[0.15em] uppercase text-white group-hover:text-[#c2202f] transition-colors mb-2">{cat.name}</h3>
                <p className="text-sm text-[#999999]">{cat.count} products</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
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

      {/* CTA */}
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

      {/* Footer */}
      <footer className="border-t border-[#2b2a27] py-12 px-6">
        <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-5 w-5 text-[#c2202f]" />
            <span className="font-['Orbitron'] text-base font-normal tracking-[0.15em] uppercase">TheDietStore</span>
          </div>
          <p className="text-sm text-[#999999] tracking-wide">© 2026 TheDietStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
