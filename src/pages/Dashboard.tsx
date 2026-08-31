import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase"; // adjust path to wherever your client lives
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import ProductDetail from "@/components/ProductDetail";

const BASE = import.meta.env.BASE_URL || "/";

const sectionCategories = [
  "Whey Protein",
  "Protein",
  "Isolate Protein",
  "Hydrolysed Protein",
  "Casein",
  "Pre-Workout",
  "BCAA",
  "BCAA / EAA",
  "EAA",
  "Amino",
  "Post-Workout",
  "Gainer",
  "Fat Burner",
  "Greens",
  "Collagen",
  "Creatine",
  "Glutamine",
  "L-Carnitine",
  "L-Arginine",
  "Omega 3",
  "Multivitamin",
  "Protein Bar",
  "Test Booster",
  "Growth Hormone",
  "Nitric Oxide",
];

// Matches actual Supabase "products" table columns (camelCase).
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  sku: string;
  inStock: boolean;
  imageUrl?: string;
  tags: string[];
  servings?: string;
  weight?: string;
  featured?: boolean;
  stockQuantity?: number;
};

function CategorySection({
  title,
  products,
  onSelectProduct,
}: {
  title: string;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-4">
          <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-normal tracking-[0.15em] uppercase text-white">
            {title}
          </h2>
          <span className="text-sm text-[#999999]">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 border border-[#2b2a27] flex items-center justify-center hover:border-[#c2202f] hover:text-[#c2202f] transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 border border-[#2b2a27] flex items-center justify-center hover:border-[#c2202f] hover:text-[#c2202f] transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => {              const msg = encodeURIComponent(`Hi TheDietStore 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n\n📋 SKU: ${product.sku}\n\nPlease share details about:\n• Availability & stock\n• Bulk/wholesale pricing\n• Delivery options\n\nThank you!`);
          return (
          <div
            key={product.id}
            className={`flex-shrink-0 w-[220px] sm:w-[240px] group ${!product.inStock ? 'opacity-60 grayscale' : ''}`}
            style={{ scrollSnapAlign: "start" }}
          >            {/* Product Image */}
            <div
              onClick={() => onSelectProduct(product)}
              className="relative aspect-square overflow-hidden mb-3 cursor-pointer group-hover:scale-[1.02] transition-transform duration-500"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 product-img"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-14 w-14 text-[#333]" />
                </div>
              )}

              {/* Sold out badge */}
              {!product.inStock && (
                <div className="absolute top-3 left-3">
                  <span className="bg-[#c2202f] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-['Orbitron']">
                    Sold out
                  </span>
                </div>
              )}

              {/* Quick View on hover */}
              <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => onSelectProduct(product)} className="w-full bg-[#c2202f] text-white py-2.5 font-['Orbitron'] text-sm tracking-wider uppercase cursor-pointer hover:bg-[#de3746] transition-colors">
                  Quick view
                </button>
              </div>
            </div>

            {/* Brand */}
            <p className="text-[10px] text-[#c2202f] font-medium uppercase tracking-wider mb-1">
              {product.brand}
            </p>

            {/* Product Name — Orbitron uppercase */}
            <h3
              onClick={() => onSelectProduct(product)}
              className="font-['Orbitron'] text-xs font-normal tracking-[0.15em] uppercase text-white mb-1 line-clamp-2 cursor-pointer hover:text-[#c2202f] transition-colors"
            >
              {product.name}
            </h3>

            {/* Description snippet */}
            <p className="text-[11px] text-[#999999] leading-relaxed mb-2 line-clamp-2">
              {product.description}
            </p>

            {/* WhatsApp Enquiry Button */}
            <a
              href={`https://wa.me/918295158184?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 text-xs font-medium tracking-wider"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Enquire on WhatsApp
            </a>
          </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<Product[] | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      let query = supabase.from("products").select("*").order("name", { ascending: true });

      if (search) {
        // Matches name, brand, or description containing the search term
        query = query.or(
          `name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      if (isMounted) setProducts(data as Product[]);
    }

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [search]);

  const allProducts = useMemo(() => products ?? [], [products]);

  // Group products by category
  const groupedProducts = sectionCategories.reduce(
    (acc, cat) => {
      acc[cat] = allProducts.filter(
        (p) => p.category?.toLowerCase() === cat.toLowerCase()
      );
      return acc;
    },
    {} as Record<string, Product[]>
  );

  // Categories not in our predefined list
  const uncategorized = allProducts.filter(
    (p) =>
      !sectionCategories.some(
        (sc) => sc.toLowerCase() === p.category?.toLowerCase()
      )
  );

  // Count total results
  const totalResults = allProducts.length;

  return (
    <div className="min-h-screen bg-black text-white">
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Search Bar */}
      <div className="border-b border-[#2b2a27]">
        <div className="mx-auto max-w-[1440px] px-6 py-5">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#999999]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands, or keywords..."
              className="pl-12 h-12 border border-[#2b2a27] text-white placeholder:text-[#999999] focus-visible:border-[#c2202f]/40 focus-visible:ring-[#c2202f]/20 text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results count */}
          {search && (
            <div className="mt-3 flex items-center gap-2">
              <p className="text-sm text-[#999999]">
                {products === undefined ? (
                  "Loading..."
                ) : (
                  <>
                    <span className="text-white font-medium">
                      {totalResults}
                    </span>{" "}
                    result{totalResults !== 1 ? "s" : ""} for "
                    <span className="text-[#c2202f]">{search}</span>"
                  </>
                )}
              </p>
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#c2202f] hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Sections */}
      <div className="mx-auto max-w-[1440px] px-6 py-10">
        {products === undefined ? (
          // Loading skeleton
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-8 border border-[#2b2a27]/50 w-48 mb-5 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex-shrink-0 w-[240px] animate-pulse">
                      <div className="aspect-square border border-[#2b2a27] rounded-lg mb-3" />
                      <div className="h-4 bg-[#2b2a27] w-3/4 mb-2" />
                      <div className="h-3 bg-[#2b2a27] w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-20 w-20 border border-[#2b2a27] flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-[#999999]" />
            </div>
            <h3 className="font-['Orbitron'] text-xl font-normal tracking-wider uppercase text-[#999999] mb-2">
              No products found
            </h3>
            <p className="text-base text-[#999999]/60 max-w-sm mb-6">
              Try adjusting your search or browse all categories.
            </p>
            <Button
              variant="outline"
              className="border-[#2b2a27] text-[#999999] hover:bg-[#111111] cursor-pointer"
              onClick={() => setSearch("")}
            >
              Clear search
            </Button>
          </div>
        ) : search ? (
          // Search results — flat grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {allProducts.map((product) => {
              const msg = encodeURIComponent(`Hi TheDietStore 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n\n📋 SKU: ${product.sku}\n\nPlease share details about:\n• Availability & stock\n• Bulk/wholesale pricing\n• Delivery options\n\nThank you!`);
              return (
              <div
                key={product.id}
                className={`group ${!product.inStock ? 'opacity-60 grayscale' : ''}`}
              >
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="relative aspect-square overflow-hidden mb-3 cursor-pointer group-hover:scale-[1.02] transition-transform duration-500"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"

                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-14 w-14 text-[#333]" />
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#c2202f] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider font-['Orbitron']">
                        Sold out
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setSelectedProduct(product)} className="w-full bg-[#c2202f] text-white py-2.5 font-['Orbitron'] text-sm tracking-wider uppercase cursor-pointer hover:bg-[#de3746] transition-colors">
                      Quick view
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-[#c2202f] font-medium uppercase tracking-wider mb-1">
                  {product.brand}
                </p>
                <h3
                  onClick={() => setSelectedProduct(product)}
                  className="font-['Orbitron'] text-xs font-normal tracking-[0.15em] uppercase text-white mb-1 line-clamp-2 cursor-pointer hover:text-[#c2202f] transition-colors"
                >
                  {product.name}
                </h3>
                <p className="text-[11px] text-[#999999] leading-relaxed mb-2 line-clamp-2">
                  {product.description}
                </p>
                
                <a
                  href={`https://wa.me/918295158184?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 text-xs font-medium tracking-wider"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Enquire on WhatsApp
                </a>
              </div>
              );
            })}
          </div>
        ) : (
          // Browse mode — horizontal scroll sections
          <>
            {sectionCategories.map((cat) => (
              <CategorySection
                key={cat}
                title={cat}
                products={groupedProducts[cat] || []}
                onSelectProduct={setSelectedProduct}
              />
            ))}

            {/* Uncategorized products */}
            {uncategorized.length > 0 && (
              <CategorySection
                title="Other Products"
                products={uncategorized}
                onSelectProduct={setSelectedProduct}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}