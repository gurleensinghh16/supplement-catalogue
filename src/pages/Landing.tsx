import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Shield,
  Star,
  ChevronRight,
  Eye,
  Award,
  TrendingUp,
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
      "https://images.unsplash.com/photo-1622485831930-6961e42a6e9d?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Pre-Workout Ignite",
    brand: "C4 Original",
    price: "₹2,499",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Nitro-Tech Whey Gold",
    brand: "MuscleTech",
    price: "₹3,149",
    image:
      "https://images.unsplash.com/photo-1622485831930-6961e42a6e9d?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Electrolyte Hydration",
    brand: "LMNT",
    price: "₹2,999",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format",
  },
];

const categories = [
  {
    name: "Protein",
    count: "50+",
    image:
      "https://images.unsplash.com/photo-1622485831930-6961e42a6e9d?w=500&h=350&fit=crop&auto=format",
  },
  {
    name: "Pre-Workout",
    count: "30+",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=350&fit=crop&auto=format",
  },
  {
    name: "Creatine",
    count: "20+",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=350&fit=crop&auto=format",
  },
  {
    name: "Aminos",
    count: "25+",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=350&fit=crop&auto=format",
  },
  {
    name: "Mass Gainers",
    count: "15+",
    image:
      "https://images.unsplash.com/photo-1546782899-dfd58be99da0?w=500&h=350&fit=crop&auto=format",
  },
  {
    name: "Recovery",
    count: "20+",
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&h=350&fit=crop&auto=format",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Brands",
    description:
      "Every product sourced from authorized distributors with full traceability.",
  },
  {
    icon: Award,
    title: "Best Prices",
    description:
      "Competitive pricing with volume discounts on bulk orders.",
  },
  {
    icon: TrendingUp,
    title: "Trending Products",
    description:
      "Stay ahead with the latest supplements and top-selling products.",
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
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00ff66]">
              <Dumbbell className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">TheDietStore</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a
              href="#categories"
              className="hover:text-white transition-colors"
            >
              Categories
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Why Us
            </a>
            <a href="#brands" className="hover:text-white transition-colors">
              Brands
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-[#00ff66] text-black hover:bg-[#00e65c] font-semibold cursor-pointer"
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
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00ff66]/6 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-[#00ff66]/4 rounded-full blur-[120px] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="mx-auto max-w-7xl relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00ff66]/20 bg-[#00ff66]/5 px-4 py-1.5 text-sm text-[#00ff66]"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            #1 Supplement Catalogue
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.02] max-w-5xl"
          >
            Fuel Your
            <br />
            <span className="text-[#00ff66]">Performance</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mt-6 text-lg sm:text-xl text-white/40 max-w-xl leading-relaxed"
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
              className="bg-[#00ff66] text-black hover:bg-[#00e65c] font-semibold px-8 h-13 text-base cursor-pointer"
              onClick={() => navigate("/catalogue")}
            >
              View Catalogue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 h-13 px-8 text-base cursor-pointer"
              onClick={() => {
                document
                  .getElementById("categories")
                  ?.scrollIntoView({ behavior: "smooth" });
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
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-white/10 pt-10"
          >
            {[
              { label: "Products", value: "500+" },
              { label: "Brands", value: "20+" },
              { label: "Happy Clients", value: "1,200+" },
              { label: "Categories", value: "15+" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-[#00ff66]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/35 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 border-t border-white/5">
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
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Trending <span className="text-[#00ff66]">Products</span>
              </h2>
              <p className="mt-3 text-white/40">
                Our most popular supplements this month.
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-[#00ff66] hover:text-[#00ff66] hover:bg-[#00ff66]/5 cursor-pointer hidden sm:flex"
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
                <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-[#00ff66]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,102,0.08)]">
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-[#00ff66]/5 to-transparent">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#00ff66]/70 font-medium mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-semibold text-base text-white/90 mb-2 group-hover:text-[#00ff66] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-white">
                      {product.price}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories with images */}
      <section id="categories" className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Shop by <span className="text-[#00ff66]">Category</span>
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
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
                className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-[#00ff66]/30 transition-all duration-500 cursor-pointer"
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
                  <h3 className="font-bold text-xl">{cat.name}</h3>
                  <p className="text-base text-white/40">
                    {cat.count} products
                  </p>
                </div>
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Why <span className="text-[#00ff66]">TheDietStore</span>
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
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
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#00ff66]/20 hover:bg-[#00ff66]/[0.03] transition-all duration-300"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00ff66]/10 text-[#00ff66] group-hover:bg-[#00ff66]/15 transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{feature.title}</h3>
                <p className="text-base text-white/35 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section id="brands" className="py-20 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Trusted <span className="text-[#00ff66]">Brands</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-sm font-medium text-white/25 hover:text-[#00ff66]/60 transition-colors cursor-pointer"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="relative rounded-3xl border border-[#00ff66]/20 bg-[#00ff66]/[0.03] p-12 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#00ff66]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to stock up?
              </h2>
              <p className="mt-4 text-white/40 max-w-md mx-auto">
                Browse our full catalogue with wholesale pricing and real-time
                inventory.
              </p>
              <Button
                size="lg"
                className="mt-8 bg-[#00ff66] text-black hover:bg-[#00e65c] font-semibold px-10 h-13 text-base cursor-pointer"
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
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00ff66]">
              <Dumbbell className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-bold">TheDietStore</span>
          </div>
          <p className="text-xs text-white/25">
            © 2026 TheDietStore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
