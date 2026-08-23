import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Package,
  Search,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL || "/";

const navCategories = [
  "Stacks", "Protein", "Pre-Workout", "Creatine", "Muscle Building",
  "Hydration", "Post-Workout", "Immunity & Wellness", "Weight Management",
  "Digestion & Gut Health", "Longevity", "Recovery", "Amino Acids", "Samples",
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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const allProducts = useQuery(api.products.list, {}) as Product[] | undefined;

  // Search
  const [mobileSuppsOpen, setMobileSuppsOpen] = useState(false);
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
    navigate(`/catalogue?search=${encodeURIComponent(product.name)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Supplements dropdown
  const [supplementsOpen, setSupplementsOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDropdownEnter = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setSupplementsOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimer.current = setTimeout(() => setSupplementsOpen(false), 200);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
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
                <p className="text-xs text-[#999999] mt-3 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-[#111111] border border-[#2b2a27] text-[#999999]">ESC</kbd> to close
                </p>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2b2a27] bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="h-14 lg:h-28 grid grid-cols-[1fr_auto_1fr] items-center">
            {/* Left */}
            <div className="flex items-center gap-4 lg:gap-8">
              <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center hover:text-[#c2202f] transition-colors cursor-pointer">
                <Search className="h-5 w-5" />
              </button>

              <div
                className="hidden lg:block relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="group flex items-center gap-2 font-['Orbitron'] text-[16px] font-normal tracking-[0.15em] uppercase text-white hover:text-[#c2202f] transition-colors cursor-pointer py-8">
                  SUPPLEMENTS
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${supplementsOpen ? "rotate-180" : ""}`} />
                  <span className="absolute bottom-6 left-0 w-full h-[2px] bg-[#c2202f] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>

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
                          onClick={() => { setSupplementsOpen(false); navigate("/catalogue"); }}
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
              <img id="site-logo" src={`${BASE}logoo.png`} alt="TheDietStore" className="h-12 lg:h-16 w-auto object-contain" />
            </button>

            {/* Right */}
            <div className="flex items-center justify-end gap-4 lg:gap-10">
                {/* Invisible placeholder on mobile to balance the search icon */}
              <a href="#featured" className="hidden lg:block relative font-['Orbitron'] text-[16px] font-normal tracking-[0.15em] uppercase text-white hover:text-[#c2202f] transition-colors group/link py-8">
                FEATURED
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-[#c2202f] scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#features" className="hidden lg:block relative font-['Orbitron'] text-[16px] font-normal tracking-[0.15em] uppercase text-white hover:text-[#c2202f] transition-colors group/link py-8">
                WHY US
                <span className="absolute bottom-6 left-0 w-full h-[2px] bg-[#c2202f] scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <Button className="hidden lg:inline-flex bg-[#c2202f] text-white hover:bg-[#de3746] font-medium text-[14px] h-12 px-8 cursor-pointer tracking-wider font-['Orbitron'] uppercase" onClick={() => navigate("/catalogue")}>
                View Catalogue
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
<div className="lg:hidden border-t border-[#2b2a27]">
  {/* Supplements expandable row */}
  <button
    onClick={() => setMobileSuppsOpen((p) => !p)}
    className="w-full flex items-center justify-between px-1 py-1.5 text-sm text-[#999999] hover:text-white transition-colors cursor-pointer"
  >
    <span className="font-['Orbitron'] tracking-[0.15em] uppercase text-xs">Supplements</span>
    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileSuppsOpen ? "rotate-180" : ""}`} />
  </button>

  {/* Category list */}
  <AnimatePresence>
    {mobileSuppsOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-2 gap-1 pb-3">
          {navCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setMobileSuppsOpen(false); navigate("/catalogue"); }}
              className="text-left px-2 py-2 text-xs text-[#999999] hover:text-white hover:bg-white/5 transition-all rounded tracking-wide cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Other links */}
  <div className="flex items-center gap-6 py-1.5 border-t border-[#2b2a27] text-sm text-[#999999]">
    <a href="#featured" className="hover:text-white transition-colors font-['Orbitron'] text-xs tracking-wider uppercase">Featured</a>
    <a href="#features" className="hover:text-white transition-colors font-['Orbitron'] text-xs tracking-wider uppercase">Why Us</a>
    <button onClick={() => navigate("/catalogue")} className="hover:text-white transition-colors font-['Orbitron'] text-xs tracking-wider uppercase cursor-pointer ml-auto text-[#c2202f]">
      View Catalogue →
    </button>
  </div>
</div>
        </div>
      </nav>

            {/* Page content */}
      {children}

      {/* ── Footer ── */}
      <footer className="border-t border-[#2b2a27] bg-black">
        {/* Main footer */}
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <button onClick={() => navigate("/")} className="cursor-pointer mb-5">
                <img src={`${BASE}logoo.png`} alt="TheDietStore" className="h-10 lg:h-12 w-auto object-contain" />
              </button>
              <p className="text-[15px] text-[#999999] leading-relaxed font-['Barlow'] max-w-xs">
                Your trusted source for genuine international supplement brands at the best prices.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="https://wa.me/918295158184" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 border border-[#2b2a27] bg-[#111111] flex items-center justify-center hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all">
                  <MessageCircle className="h-4.5 w-4.5 text-[#25D366]" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-['Orbitron'] text-sm font-normal tracking-[0.15em] uppercase text-white mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: "Home", path: "/" },
                  { label: "Catalogue", path: "/catalogue" },
                  { label: "Admin", path: "/admin" },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-[15px] text-[#999999] hover:text-[#c2202f] transition-colors font-['Barlow'] cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-['Orbitron'] text-sm font-normal tracking-[0.15em] uppercase text-white mb-5">Categories</h4>
              <ul className="space-y-3">
                {["Protein", "Pre-Workout", "Creatine", "BCAA", "Mass Gainer", "Fat Burner"].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => navigate("/catalogue")}
                      className="text-[15px] text-[#999999] hover:text-[#c2202f] transition-colors font-['Barlow'] cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-['Orbitron'] text-sm font-normal tracking-[0.15em] uppercase text-white mb-5">Get in Touch</h4>
              <ul className="space-y-3">
                <li className="text-[15px] text-[#999999] font-['Barlow']">
                  <span className="text-[#999999]/60 text-sm block mb-1">WhatsApp</span>
                  <a href="https://wa.me/918295158184" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">
                    +91 82951 58184
                  </a>
                </li>
                <li className="text-[15px] text-[#999999] font-['Barlow']">
                  <span className="text-[#999999]/60 text-sm block mb-1">Email</span>
                  <a href="mailto:info@thedietstore.in" className="hover:text-[#c2202f] transition-colors">
                    info@thedietstore.in
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/918295158184?text=Hi%20TheDietStore%20%F0%9F%91%8B%0A%0AI%27m%20interested%20in%20your%20supplements.%20Please%20share%20details%20about%20availability%20and%20pricing."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 text-xs font-medium tracking-wider font-['Orbitron'] uppercase"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat on WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2b2a27]">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[13px] text-[#999999] font-['Barlow'] tracking-wide">
              © 2026 TheDietStore. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[13px] text-[#999999]/50 font-['Barlow']">100% Authentic Products</span>
              <span className="text-[13px] text-[#999999]/50 font-['Barlow']">|</span>
              <span className="text-[13px] text-[#999999]/50 font-['Barlow']">Pan-India Delivery</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}