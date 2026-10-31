
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Package,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const BASE = import.meta.env.BASE_URL || "/";

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
  "Travel Pack",
];

type SuggestionProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Cart
  const { itemCount } = useCart();

  // Products fetched from Supabase
  const [allProducts, setAllProducts] = useState<
    SuggestionProduct[] | undefined
  >(undefined);

  useEffect(() => {
    supabase
      .from("keep_products")
      .select("productID, productName, brandName, categoryName, all_images_url")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch products:", error.message);
          setAllProducts([]);
          return;
        }

        setAllProducts(
          (data ?? []).map((row) => ({
            id: String(row.productID),
            name: (row.productName ?? "").trim(),
            brand: (row.brandName ?? "").trim(),
            category: row.categoryName ?? "",
            imageUrl: row.all_images_url?.match(
              /https?:\/\/[^\s,|;"'[\]]+/,
            )?.[0],
          })),
        );
      });
  }, []);

  // Search
  const [mobileSuppsOpen, setMobileSuppsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !searchOpen &&
        !(e.target instanceof HTMLInputElement)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }

      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  const searchSuggestions = (allProducts ?? [])
    .filter((p) => {
      if (!searchQuery.trim()) return false;

      const q = searchQuery.toLowerCase();

      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const selectSuggestion = (product: SuggestionProduct) => {
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
    dropdownTimer.current = setTimeout(
      () => setSupplementsOpen(false),
      200,
    );
  };

  // Cart navigation button
  const CartButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      type="button"
      onClick={() => {
        setMobileSuppsOpen(false);
        navigate("/cart");
      }}
      aria-label={`Shopping cart, ${itemCount} items`}
      className={`relative flex items-center justify-center text-white transition-colors hover:text-[#c2202f] ${
        mobile ? "h-9 w-9" : "h-10 w-10"
      }`}
    >
      <ShoppingCart className={mobile ? "h-5 w-5" : "h-5 w-5"} />

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c2202f] px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 pt-32 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSearch}
              className="mx-6 w-full max-w-xl"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#999999]" />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="h-16 w-full border border-[#2b2a27] bg-[#111111] pl-14 pr-20 font-['Orbitron'] text-lg tracking-wider text-white placeholder:text-[#999999] focus:border-[#c2202f]/40 focus:outline-none"
                />

                <button
                  type="submit"
                  className="absolute right-3 top-1/2 h-10 -translate-y-1/2 cursor-pointer bg-[#c2202f] px-5 font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746]"
                >
                  Search
                </button>
              </div>

              {searchQuery.trim() && searchSuggestions.length > 0 && (
                <div className="mt-2 max-h-[300px] w-full overflow-y-auto border border-[#2b2a27] bg-[#111111]">
                  {searchSuggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectSuggestion(product)}
                      className="flex w-full cursor-pointer items-center gap-3 border-b border-[#2b2a27] px-5 py-3 text-left transition-colors last:border-0 hover:bg-white/5"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 object-contain"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-[#2b2a27]">
                          <Package className="h-4 w-4 text-[#999999]/30" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#999999]">
                          {product.brand}
                        </p>
                      </div>

                      <Package className="h-4 w-4 flex-shrink-0 text-[#999999]/30" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim() && searchSuggestions.length === 0 && (
                <p className="mt-2 text-center text-xs text-[#999999]">
                  No products found for "{searchQuery}"
                </p>
              )}

              {!searchQuery.trim() && (
                <p className="mt-3 text-center text-xs text-[#999999]">
                  Press{" "}
                  <kbd className="border border-[#2b2a27] bg-[#111111] px-1.5 py-0.5 text-[#999999]">
                    ESC
                  </kbd>{" "}
                  to close
                </p>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#2b2a27] bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center lg:h-28">
            {/* Left */}
            <div className="flex items-center gap-4 lg:gap-8">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-[#c2202f]"
              >
                <Search className="h-5 w-5" />
              </button>

              <div
                className="relative hidden lg:block"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="group relative flex cursor-pointer items-center gap-2 py-8 font-['Orbitron'] text-[16px] font-normal uppercase tracking-[0.15em] text-white transition-colors hover:text-[#c2202f]">
                  SUPPLEMENTS
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      supplementsOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-6 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#c2202f] transition-transform duration-300 group-hover:scale-x-100" />
                </button>

                <AnimatePresence>
                  {supplementsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full z-50 w-72 border border-[#2b2a27] bg-black py-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="mb-2 border-b border-[#2b2a27] px-6 pb-3">
                        <button
                          onClick={() => {
                            navigate("/catalogue");
                            setSupplementsOpen(false);
                          }}
                          className="cursor-pointer font-['Orbitron'] text-xs uppercase tracking-[0.2em] text-[#c2202f] transition-colors hover:text-white"
                        >
                          Browse All
                        </button>
                      </div>

                      {navCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSupplementsOpen(false);
                            navigate(
                              `/catalogue?category=${encodeURIComponent(cat)}`,
                            );
                          }}
                          className="group/item flex w-full cursor-pointer items-center justify-between px-6 py-3 text-left text-[15px] tracking-wide text-[#999999] transition-all duration-200 hover:bg-white/5 hover:text-white"
                        >
                          <span>{cat}</span>
                          <ArrowRight className="h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center logo */}
            <button
              onClick={() => navigate("/")}
              className="flex cursor-pointer items-center"
            >
              <img
                id="site-logo"
                src={`${BASE}logoo.png`}
                alt="TheDietStore"
                className="h-12 w-auto object-contain lg:h-16"
              />
            </button>

            {/* Right */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-10">
              <button
                onClick={() => navigate("/")}
                className={`group/link relative hidden cursor-pointer py-8 font-['Orbitron'] text-[16px] font-normal uppercase tracking-[0.15em] transition-colors lg:block ${
                  location.pathname === "/"
                    ? "text-[#c2202f]"
                    : "text-white hover:text-[#c2202f]"
                }`}
              >
                HOME
                <span className="absolute bottom-6 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#c2202f] transition-transform duration-300 group-hover/link:scale-x-100" />
              </button>

              <a
                href="#featured"
                className="group/link relative hidden py-8 font-['Orbitron'] text-[16px] font-normal uppercase tracking-[0.15em] text-white transition-colors hover:text-[#c2202f] lg:block"
              >
                FEATURED
                <span className="absolute bottom-6 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#c2202f] transition-transform duration-300 group-hover/link:scale-x-100" />
              </a>

              <a
                href="#features"
                className="group/link relative hidden py-8 font-['Orbitron'] text-[16px] font-normal uppercase tracking-[0.15em] text-white transition-colors hover:text-[#c2202f] lg:block"
              >
                WHY US
                <span className="absolute bottom-6 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#c2202f] transition-transform duration-300 group-hover/link:scale-x-100" />
              </a>

              <button
                onClick={() => navigate("/admin")}
                className={`group/link relative hidden cursor-pointer py-8 font-['Orbitron'] text-[16px] font-normal uppercase tracking-[0.15em] transition-colors lg:block ${
                  location.pathname === "/admin"
                    ? "text-[#c2202f]"
                    : "text-white hover:text-[#c2202f]"
                }`}
              >
                ADMIN
                <span className="absolute bottom-6 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#c2202f] transition-transform duration-300 group-hover/link:scale-x-100" />
              </button>

              {/* Cart icon */}
              <button
                type="button"
                onClick={() => navigate("/cart")}
                aria-label={`Shopping cart, ${itemCount} items`}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center text-white transition-colors hover:text-[#c2202f]"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c2202f] px-1 text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              <Button
                className="hidden h-12 cursor-pointer bg-[#c2202f] px-8 font-['Orbitron'] text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#de3746] lg:inline-flex"
                onClick={() => navigate("/catalogue")}
              >
                View Catalogue
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="border-t border-[#2b2a27] lg:hidden">
            <button
              onClick={() => setMobileSuppsOpen((p) => !p)}
              className="flex w-full cursor-pointer items-center justify-between px-1 py-1.5 text-sm text-[#999999] transition-colors hover:text-white"
            >
              <span className="font-['Orbitron'] text-xs uppercase tracking-[0.15em]">
                Supplements
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  mobileSuppsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

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
                    <button
                      onClick={() => {
                        setMobileSuppsOpen(false);
                        navigate("/catalogue");
                      }}
                      className="col-span-2 rounded px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#c2202f] hover:bg-white/5"
                    >
                      Browse All
                    </button>

                    {navCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setMobileSuppsOpen(false);
                          navigate(
                            `/catalogue?category=${encodeURIComponent(cat)}`,
                          );
                        }}
                        className="cursor-pointer rounded px-2 py-2 text-left text-xs tracking-wide text-[#999999] transition-all hover:bg-white/5 hover:text-white"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile primary links and cart */}
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-[#2b2a27] py-2.5">
              {[
                { label: "Home", path: "/" },
                { label: "Catalogue", path: "/catalogue" },
                { label: "Admin", path: "/admin" },
              ].map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`group relative cursor-pointer pb-1.5 font-['Orbitron'] text-[10px] uppercase tracking-wider transition-colors ${
                      isActive
                        ? "text-[#c2202f]"
                        : "text-[#999999] hover:text-white"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="mobileNavIndicator"
                        className="absolute -bottom-0 left-0 right-0 h-[2px] bg-[#c2202f]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => navigate("/cart")}
                aria-label={`Shopping cart, ${itemCount} items`}
                className="relative flex h-9 w-9 items-center justify-center text-white hover:text-[#c2202f]"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c2202f] px-1 text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="pt-24 lg:pt-28">{children}</div>

      {/* Footer */}
      <footer className="border-t border-[#2b2a27] bg-black">
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <button
                onClick={() => navigate("/")}
                className="mb-5 cursor-pointer"
              >
                <img
                  src={`${BASE}logoo.png`}
                  alt="TheDietStore"
                  className="h-10 w-auto object-contain lg:h-12"
                />
              </button>

              <p className="max-w-xs font-['Barlow'] text-[15px] leading-relaxed text-[#999999]">
                Your trusted source for genuine international supplement brands
                and premium nutrition products.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-5 font-['Orbitron'] text-sm font-normal uppercase tracking-[0.15em] text-white">
                Quick Links
              </h4>

              <ul className="space-y-3">
                {[
                  { label: "Home", path: "/" },
                  { label: "Catalogue", path: "/catalogue" },
                  { label: "Cart", path: "/cart" },
                  { label: "Admin", path: "/admin" },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="cursor-pointer font-['Barlow'] text-[15px] text-[#999999] transition-colors hover:text-[#c2202f]"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-5 font-['Orbitron'] text-sm font-normal uppercase tracking-[0.15em] text-white">
                Categories
              </h4>

              <ul className="space-y-3">
                {[
                  "Protein",
                  "Pre-Workout",
                  "Creatine",
                  "BCAA",
                  "Mass Gainer",
                  "Fat Burner",
                ].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => navigate("/catalogue")}
                      className="cursor-pointer font-['Barlow'] text-[15px] text-[#999999] transition-colors hover:text-[#c2202f]"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-5 font-['Orbitron'] text-sm font-normal uppercase tracking-[0.15em] text-white">
                Get in Touch
              </h4>

              <ul className="space-y-3">
                <li className="font-['Barlow'] text-[15px] text-[#999999]">
                  <span className="mb-1 block text-sm text-[#999999]/60">
                    WhatsApp
                  </span>
                  <a
                    href="https://wa.me/918295158184"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#25D366]"
                  >
                    +91 82951 58184
                  </a>
                </li>

                <li className="font-['Barlow'] text-[15px] text-[#999999]">
                  <span className="mb-1 block text-sm text-[#999999]/60">
                    Email
                  </span>
                  <a
                    href="mailto:info@thedietstore.in"
                    className="transition-colors hover:text-[#c2202f]"
                  >
                    info@thedietstore.in
                  </a>
                </li>

                <li>
                  <a
                    href="https://wa.me/918295158184?text=Hi%20TheDietStore%20%F0%9F%91%8B%0A%0AI%27m%20interested%20in%20your%20supplements.%20Please%20share%20details%20about%20availability%20and%20pricing."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 border border-[#25D366]/30 bg-[#25D366]/10 px-5 py-2.5 font-['Orbitron'] text-xs font-medium uppercase tracking-wider text-[#25D366] transition-all duration-300 hover:bg-[#25D366] hover:text-white"
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
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row lg:px-10">
            <p className="font-['Barlow'] text-[13px] tracking-wide text-[#999999]">
              © 2026 TheDietStore. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <span className="font-['Barlow'] text-[13px] text-[#999999]/50">
                100% Authentic Products
              </span>
              <span className="font-['Barlow'] text-[13px] text-[#999999]/50">
                |
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
