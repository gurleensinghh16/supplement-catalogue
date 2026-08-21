import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Shield,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Zap,
    title: "Trusted Brands",
    description:
      "Curated selection from Optimum Nutrition, MuscleTech, C4, and 20+ verified suppliers.",
  },
  {
    icon: Shield,
    title: "Wholesale Pricing",
    description:
      "Competitive bulk pricing built for retail buyers. Volume discounts on all product lines.",
  },
  {
    icon: Flame,
    title: "Fast Turnaround",
    description:
      "Streamlined ordering with real-time stock visibility and rapid delivery across the US.",
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

const categories = [
  { name: "Protein", count: "50+" },
  { name: "Pre-Workout", count: "30+" },
  { name: "Creatine", count: "20+" },
  { name: "Aminos", count: "25+" },
  { name: "Mass Gainers", count: "15+" },
  { name: "Fat Burners", count: "20+" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c3f73a]">
              <Dumbbell className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              IRONFUEL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
              onClick={() => navigate("/auth")}
            >
              Sign in
            </Button>
            <Button
              className="bg-[#c3f73a] text-black hover:bg-[#b3e830] font-semibold cursor-pointer"
              onClick={() => navigate("/auth")}
            >
              Browse Catalogue
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#c3f73a]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c3f73a]/20 bg-[#c3f73a]/5 px-4 py-1.5 text-sm text-[#c3f73a]"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            Built for Retail Buyers
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl"
          >
            Wholesale Gym
            <br />
            Supplements{" "}
            <span className="text-[#c3f73a]">Simplified</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mt-6 text-lg text-white/50 max-w-xl leading-relaxed"
          >
            Browse, search, and source premium supplements from top brands.
            Real-time inventory, competitive pricing, and a catalogue built
            for professional buyers.
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
              className="bg-[#c3f73a] text-black hover:bg-[#b3e830] font-semibold px-8 h-12 text-base cursor-pointer"
              onClick={() => navigate("/auth")}
            >
              Enter Catalogue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 h-12 px-8 text-base cursor-pointer"
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-10"
          >
            {[
              { label: "Products", value: "500+" },
              { label: "Brands", value: "20+" },
              { label: "Retail Partners", value: "1,200+" },
              { label: "Avg. Delivery", value: "3 days" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-[#c3f73a]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand logos strip */}
      <section className="border-y border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs uppercase tracking-widest text-white/30 mb-8">
            Featured brands in our catalogue
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-sm font-medium text-white/30 hover:text-white/60 transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
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
              Why Retail Buyers Choose{" "}
              <span className="text-[#c3f73a]">IRONFUEL</span>
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
              Everything you need to source, compare, and order supplements at
              wholesale prices.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-[#c3f73a]/20 hover:bg-[#c3f73a]/[0.03] transition-all duration-300"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#c3f73a]/10 text-[#c3f73a] group-hover:bg-[#c3f73a]/15 transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 border-t border-white/5">
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
              Browse by Category
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
              From proteins and pre-workouts to vitamins and hydration — find
              exactly what your customers need.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                onClick={() => navigate("/auth")}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-6 text-left hover:border-[#c3f73a]/30 hover:bg-[#c3f73a]/[0.04] transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-base">{cat.name}</div>
                  <div className="text-sm text-white/30 mt-0.5">
                    {cat.count} products
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-[#c3f73a] group-hover:translate-x-0.5 transition-all" />
              </motion.button>
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
            className="relative rounded-3xl border border-[#c3f73a]/20 bg-[#c3f73a]/[0.04] p-12 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#c3f73a]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to stock your shelves?
              </h2>
              <p className="mt-4 text-white/40 max-w-md mx-auto">
                Create your free account and start browsing wholesale pricing
                today.
              </p>
              <Button
                size="lg"
                className="mt-8 bg-[#c3f73a] text-black hover:bg-[#b3e830] font-semibold px-10 h-13 text-base cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
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
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#c3f73a]">
              <Dumbbell className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-bold">IRONFUEL</span>
          </div>
          <p className="text-xs text-white/30">
            © 2026 IronFuel Supply Co. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
