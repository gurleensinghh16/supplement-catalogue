import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase"; // adjust path to wherever your client lives
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router";
import {
  Search,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductDetail from "@/components/ProductDetail";
import PriceAndBuy from "@/components/PriceAndBuy";

const sectionCategories = [
  "Essential",
  "Whey",
  "Iso",
  "Hydrolysed",
  "Casein",
  "Mass Gainer",
  "Pre-Workout",
  "BCAA",
  "EAA",
  "Amino",
  "Creatine",
  "Glutamine",
  "Fat Burner",
  "Greens",
  "Collagen",
  "L-Carnitine",
  "L-Arginine",
  "Omega 3",
  "Multivitamin",
  "Protein Bar",
  "Test Booster",
  "Shaker",
  "Other Products",
];

// Shape the UI works with (mapped from the Supabase "keep_products" table).
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
  price?: string;
  mrp?: string;
  longDescription?: string;
};

// Raw row shape of the Supabase "keep_products" table.
type KeepProductRow = {
  productID: string;
  productName: string | null;
  categoryName: string | null;
  brandName: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  description: string | null;
  all_images_url: string | null;
  in_stock: boolean | null;
  stock_quantity: number | null;
  sku: string | null;
  featured: boolean | null;
  "100475-The Diet Store-Price": string | null;
  "100475-The Diet Store-MRP": string | null;
};


function getDisplayCategory(row: KeepProductRow): string {
  const nameAndDescription = [
    row.productName,
    row.shortDescription,
    row.longDescription,
    row.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const category = (row.categoryName ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  // Identify specific product types from their names first.
  if (/\b(isolate|iso protein|whey isolate)\b/.test(nameAndDescription)) {
    return "Iso";
  }

  if (/\bwhey\b/.test(nameAndDescription)) return "Whey";

  if (/\bcreatine\b/.test(nameAndDescription)) return "Creatine";

  if (/\b(mass gainer|weight gainer|lean mass gainer)\b/.test(nameAndDescription)) {
    return "Mass Gainer";
  }

  if (/\b(pre[\s-]*workout)\b/.test(nameAndDescription)) {
    return "Pre-Workout";
  }

  if (/\b(bcaa|eaa|bcaas|eaas)\b/.test(nameAndDescription)) {
    return "BCAA / EAA";
  }

  if (/\b(fat burner|fatburner)\b/.test(nameAndDescription)) {
    return "Fat Burner";
  }

  if (/\bcollagen\b/.test(nameAndDescription)) return "Collagen";
  if (/\bgreens\b/.test(nameAndDescription)) return "Greens";
  if (/\bomega[\s-]*3\b/.test(nameAndDescription)) return "Omega 3";
  if (/\bmultivitamin\b/.test(nameAndDescription)) return "Multivitamin";
  if (/\bglutamine\b/.test(nameAndDescription)) return "Glutamine";
  if (/\bl[\s-]*carnitine\b/.test(nameAndDescription)) return "L-Carnitine";
  if (/\bl[\s-]*arginine\b/.test(nameAndDescription)) return "L-Arginine";
  if (/\bshaker\b/.test(nameAndDescription)) return "Shaker";
  if (/\bprotein bar\b/.test(nameAndDescription)) return "Protein Bar";

  if (
    /\b(vitamin|magnesium|zinc|calcium|electrolytes?|iron|selenium)\b/.test(
      nameAndDescription
    )
  ) {
    return "Vitamins & Minerals";
  }

  // Map existing Supabase category names to the new display categories.
  
  // Map existing Supabase category names to display categories.
  if (category === "whey protein" || category === "whey") return "Whey";

  if (
    category === "isolate protein" ||
    category === "iso" ||
    category === "isolate"
  ) {
    return "Iso";
  }

  if (category === "pre workout" || category === "pre-workout") {
    return "Pre-Workout";
  }

  if (category === "mass gainer" || category === "gainer") {
    return "Mass Gainer";
  }

  if (category === "creatine") return "Creatine";
  if (category === "shaker") return "Shaker";

  // Preserve other existing categories rather than sending everything
  // that doesn't match a keyword to "Other Products".
  if (category === "essential") return "Essential";

  if (category === "bcaa" || category === "eaa" ||
      category === "bcaa / eaa") return "BCAA / EAA";

  if (category === "fat burner") return "Fat Burner";
  if (category === "collagen") return "Collagen";
  if (category === "greens") return "Greens";
  if (category === "omega 3") return "Omega 3";
  if (category === "multivitamin") return "Multivitamin";
  if (category === "glutamine") return "Glutamine";
  if (category === "l-carnitine") return "L-Carnitine";
  if (category === "l-arginine") return "L-Arginine";
  if (category === "protein bar") return "Protein Bar";

  return "Other Products";
  }


function toProduct(row: KeepProductRow): Product {
  return {
    id: row.productID,
    name: row.productName ?? "",
    brand: row.brandName ?? "",
    category: getDisplayCategory(row),
    description: row.description ?? row.shortDescription ?? "",
    longDescription: row.longDescription ?? "",
    sku: row.sku ?? "",
    inStock: row.in_stock ?? true,
    // all_images_url may hold several URLs, so take the first one
    imageUrl: row.all_images_url?.match(/https?:\/\/[^\s,|;"'[\]]+/)?.[0],
    tags: [],
    stockQuantity: row.stock_quantity ?? 0,
    featured: row.featured ?? false,
        price: row["100475-The Diet Store-Price"] ?? undefined,
    mrp: row["100475-The Diet Store-MRP"] ?? undefined,
  };
}

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
        {products.map((product) => {
          return (
            <div
              key={product.id}
              className={`flex-shrink-0 w-[220px] sm:w-[240px] group ${!product.inStock ? "opacity-60 grayscale" : ""}`}
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Product Image */}
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

              {/* Price + Buy */}
              <PriceAndBuy
                product={{
                  ...product,
                  productId: product.id,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const selectedCategory = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[] | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      let query = supabase
        .from("keep_products")
        .select("*")
        .order("productName", { ascending: true });

      // Strip characters that would break the PostgREST .or() filter string
      const term = search.replace(/[,()%]/g, " ").trim();

      if (term) {
        // Matches name, brand, or description containing the search term
        query = query.or(
          `productName.ilike.%${term}%,brandName.ilike.%${term}%,description.ilike.%${term}%,shortDescription.ilike.%${term}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      if (isMounted) setProducts((data ?? []).map(toProduct));

    }

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [search]);

  const allProducts = useMemo(() => products ?? [], [products]);

  
const normalizeCategory = (category: string | null | undefined) =>
  (category ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const groupedProducts = sectionCategories.reduce(
  (acc, cat) => {
    acc[cat] = allProducts.filter(
      (p) => normalizeCategory(p.category) === normalizeCategory(cat)
    );
    return acc;
  },
  {} as Record<string, Product[]>
);


const uncategorized = allProducts.filter(
  (p) =>
    !sectionCategories.some(
      (cat) => normalizeCategory(cat) === normalizeCategory(p.category)
    )
);


const menuCategoryMap: Record<string, string[]> = {
  "Browse All": [],
  Stacks: ["Stacks"],
  Protein: ["Whey", "Iso", "Mass Gainer", "Protein Bar"],
  "Pre-Workout": ["Pre-Workout"],
  Creatine: ["Creatine"],
  "Muscle Building": ["Whey", "Iso", "Creatine", "Mass Gainer"],
  Hydration: ["Hydration"],
  "Post-Workout": ["Post-Workout"],
  "Immunity & Wellness": [
    "Immunity & Wellness",
    "Vitamins & Minerals",
    "Multivitamin",
    "Greens",
  ],
  "Weight Management": ["Fat Burner", "L-Carnitine"],
  "Digestion & Gut Health": ["Digestion & Gut Health"],
  Longevity: ["Longevity"],
  Recovery: ["Recovery", "Glutamine"],
  "Amino Acids": [
    "BCAA / EAA",
    "Amino",
    "Glutamine",
    "L-Arginine",
    "L-Carnitine",
  ],
  "Travel Pack": ["Travel Pack"],
};
const selectedCategoryProducts = allProducts.filter((product) => {
  if (!selectedCategory) return false;

  const targetCategories = menuCategoryMap[selectedCategory] ?? [
    selectedCategory,
  ];

  return targetCategories.some(
    (category) =>
      normalizeCategory(product.category) === normalizeCategory(category)
  );
});



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
              return (
                <div
                  key={product.id}
                  className={`group ${!product.inStock ? "opacity-60 grayscale" : ""}`}
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

                  
                  <PriceAndBuy
                    product={{
                      ...product,
                      productId: product.id,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : selectedCategory ? (
          selectedCategoryProducts.length > 0 ? (
            <CategorySection
              title={selectedCategory}
              products={selectedCategoryProducts}
              onSelectProduct={setSelectedProduct}
            />
          ) : (
            <div className="py-20 text-center text-[#999999]">
              No products found in {selectedCategory}.
            </div>
          )
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
          </>
        )}
      </div>
    </div>
  );
}
