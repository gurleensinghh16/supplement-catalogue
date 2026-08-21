import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useRef } from "react";

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

const featuredProducts = [
  {
    name: "Gold Standard Whey",
    brand: "Optimum Nutrition",
    price: "₹2,999",
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=400&h=400&fit=crop&auto=format&q=80",
  },
  {
    name: "Pre-Workout Ignite",
    brand: "C4 Original",
    price: "₹2,499",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format&q=80",
  },
  {
    name: "Nitro-Tech Whey Gold",
    brand: "MuscleTech",
    price: "₹3,149",
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop&auto=format&q=80",
  },
  {
    name: "Electrolyte Hydration",
    brand: "LMNT",
    price: "₹2,999",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format&q=80",
  },
];

const categories = [
  { name: "Protein", count: "50+", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2c129?w=500&h=350&fit=crop&auto=format&q=80" },
  { name: "Pre-Workout", count: "30+", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=350&fit=crop&auto=format&q=80" },
  { name: "Creatine", count: "20+", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=350&fit=crop&auto=format&q=80" },
  { name: "Aminos", count: "25+", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=350&fit=crop&auto=format&q=80" },
  { name: "Mass Gainers", count: "15+", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&h=350&fit=crop&auto=format&q=80" },
  { name: "Recovery", count: "20+", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=350&fit=crop&auto=format&q=80" },
];

const features = [
  {
    title: "Verified Brands",
    description: "Every product sourced from authorized distributors with full traceability.",
  },
  {
    title: "Best Prices",
    description: "Competitive pricing with volume discounts on bulk orders.",
  },
  {
    title: "Trending Products",
    description: "Stay ahead with the latest supplements and top-selling products.",
  },
];

const brands = [
  "Optimum Nutrition",
  "MuscleTech",
  "C4 Original",
  "Kaged Muscle",
  "Garden of Life",
  "Xtend",
  "Myprotein",
  "BSN",
  "LMNT",
  "MusclePharm",
];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2b2a27] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Dumbbell className="h-5 w-5 text-[#c2202f]" />
            <span className="font-['Orbitron'] text-lg font-normal tracking-[0.15em] uppercase">
              TheDietStore
            </span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#999999]">
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#features" className="hover:text-white transition-colors">Why Us</a>
            <a href="#brands" className="hover:text-white transition-colors">Brands</a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium cursor-pointer"
              onClick={() => navigate("/catalogue")}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View Catalogue
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#c2202f]/5 rounded-full blur-[150px] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="mx-auto max-w-7xl relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6 inline-flex items-center gap-2 border border-[#2b2a27] bg-[#111111] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#999999]"
          >
            #1 Supplement Catalogue
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-[5.5rem] font-normal tracking-[0.15em] uppercase leading-[1.1] max-w-5xl"
          >
            Fuel Your
            <br />
            <span className="text-[#c2202f]">Performance</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mt-6 text-lg text-[#999999] max-w-xl leading-relaxed font-normal tracking-wide"
          >
            Premium gym supplements from the world's top brands. Browse our
            full catalogue with pricing and availability details.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium px-10 h-12 cursor-pointer"
              onClick={() => navigate("/catalogue")}
            >
              View Catalogue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#2b2a27] text-[#999999] hover:bg-[#111111] hover:text-white hover:border-[#3a3a37] h-12 px-10 cursor-pointer"
              onClick={() => {
                document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Categories
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-[#2b2a27] pt-10"
          >
            {[
              { label: "Products", value: "500+" },
              { label: "Brands", value: "20+" },
              { label: "Happy Clients", value: "1,200+" },
              { label: "Categories", value: "15+" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-['Orbitron'] text-2xl sm:text-3xl font-normal tracking-wider text-[#c2202f]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#999999] mt-1 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
                Trending <span className="text-[#c2202f]">Products</span>
              </h2>
              <p className="mt-3 text-[#999999]">
                Our most popular supplements this month.
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-[#c2202f] hover:text-[#de3746] hover:bg-[#c2202f]/5 cursor-pointer hidden sm:flex"
              onClick={() => navigate("/catalogue")}
            >
              View All
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                custom={i}
                onClick={() => navigate("/catalogue")}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden bg-[#111111] border border-[#2b2a27] hover:border-[#c2202f]/40 transition-all duration-500 hover:shadow-[0_15px_45px_rgba(194,32,47,0.1)]">
                  <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#999999] font-medium uppercase tracking-wider mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-['Orbitron'] text-sm font-normal tracking-wider uppercase text-white mb-3 group-hover:text-[#c2202f] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-medium text-white">
                      {product.price}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
              Shop by <span className="text-[#c2202f]">Category</span>
            </h2>
            <p className="mt-4 text-[#999999] max-w-lg mx-auto">
              Find exactly what your customers need across our full range.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                custom={i}
                onClick={() => navigate("/catalogue")}
                className="group relative overflow-hidden border border-[#2b2a27] hover:border-[#c2202f]/40 transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-['Orbitron'] text-lg font-normal tracking-[0.15em] uppercase">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-[#999999]">
                    {cat.count} products
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
              Why <span className="text-[#c2202f]">TheDietStore</span>
            </h2>
            <p className="mt-4 text-[#999999] max-w-lg mx-auto">
              We make supplement browsing simple, fast, and reliable.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group border border-[#2b2a27] bg-[#111111] p-8 hover:border-[#c2202f]/30 transition-all duration-300"
              >
                <h3 className="font-['Orbitron'] text-base font-normal tracking-[0.15em] uppercase mb-3 text-[#c2202f]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#999999] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section id="brands" className="py-20 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-10"
          >
            <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-normal tracking-[0.15em] uppercase">
              Trusted <span className="text-[#c2202f]">Brands</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-sm font-medium text-[#999999] hover:text-[#c2202f] transition-colors cursor-pointer tracking-wider uppercase"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[#2b2a27]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="relative border border-[#2b2a27] bg-[#111111] p-12 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#c2202f]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase">
                Ready to stock up?
              </h2>
              <p className="mt-4 text-[#999999] max-w-md mx-auto">
                Browse our full catalogue with wholesale pricing and real-time
                inventory.
              </p>
              <Button
                size="lg"
                className="mt-8 bg-[#c2202f] text-white hover:bg-[#de3746] font-medium px-10 h-12 cursor-pointer"
                onClick={() => navigate("/catalogue")}
              >
                View Catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2b2a27] py-10 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-4 w-4 text-[#c2202f]" />
            <span className="font-['Orbitron'] text-sm font-normal tracking-[0.15em] uppercase">
              TheDietStore
            </span>
          </div>
          <p className="text-xs text-[#999999] tracking-wide">
            © 2026 TheDietStore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
