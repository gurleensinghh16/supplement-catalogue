import { useCallback, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Search,
  Package,
  X,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import ProductDetail from "@/components/ProductDetail";

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
  sku: string;
  inStock: boolean;
  imageUrl?: string;
  tags: string[];
  servings?: string;
  weight?: string;
  featured?: boolean;
  stockQuantity?: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const categories = useQuery(api.products.categories);
  const brands = useQuery(api.products.brands);
  const products = useQuery(api.products.list, {
    search: search || undefined,
    category: selectedCategory || undefined,
  });

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedBrand ? 1 : 0);

  const filteredProducts = selectedBrand
    ? (products ?? []).filter((p) => p.brand === selectedBrand)
    : (products ?? []);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <button
  onClick={() => navigate("/")}
  className="flex items-center gap-2.5 cursor-pointer"
>
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00ff66]">
    <Dumbbell className="h-4 w-4 text-black" />
  </div>
  <span className="text-base font-bold tracking-tight">TheDietStore</span>
  <span className="hidden sm:inline text-xs text-white/30 ml-2 border-l border-white/10 pl-3">
    Product Catalogue
  </span>
</button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#00ff66] hover:text-[#00ff66] hover:bg-[#00ff66]/5 cursor-pointer text-xs font-medium"
              onClick={() => navigate("/admin")}
            >
              Admin Panel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, or keywords..."
                className="pl-10 h-11 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#00ff66]/40 focus-visible:ring-[#00ff66]/20 rounded-xl"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={cn(
                "border-white/10 hover:bg-white/5 h-11 px-4 gap-2 cursor-pointer rounded-xl",
                showFilters && "border-[#00ff66]/30 bg-[#00ff66]/[0.06] text-[#00ff66]",
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-[#00ff66] text-black text-[10px] font-bold">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <div className="hidden sm:flex items-center border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 transition-colors cursor-pointer",
                  viewMode === "list"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60",
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category chips - always visible */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/30 font-medium mr-1">Category:</span>
              <button
                onClick={() => setSelectedCategory(null)}                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border",
                      !selectedCategory
                    ? "bg-[#00ff66] text-black border-[#00ff66]"
                    : "bg-white/[0.04] text-white/60 border-white/5 hover:border-white/15 hover:text-white/80",
                )}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat ? null : cat,
                    )
                  }                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border",
                        selectedCategory === cat
                      ? "bg-[#00ff66] text-black border-[#00ff66]"
                      : "bg-white/[0.04] text-white/60 border-white/5 hover:border-white/15 hover:text-white/80",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand filter - toggleable */}
          {showFilters && (
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                Brand
              </p>
              <div className="flex flex-wrap gap-2">
                {brands?.map((brand) => (
                  <button
                    key={brand}
                    onClick={() =>
                      setSelectedBrand(
                        selectedBrand === brand ? null : brand,
                      )
                    }
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border",
                      selectedBrand === brand
                        ? "bg-[#00ff66] text-black border-[#00ff66]"
                        : "bg-white/[0.04] text-white/60 border-white/5 hover:border-white/15 hover:text-white/80",
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(selectedCategory || selectedBrand || search) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white/30">Active:</span>
              {search && (
                <Badge
                  variant="outline"
                  className="border-white/10 text-white/60 gap-1 pr-1 cursor-pointer hover:bg-white/5"
                  onClick={() => setSearch("")}
                >
                  &quot;{search}&quot;
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedCategory && (
                <Badge
                  variant="outline"
                  className="border-white/10 text-white/60 gap-1 pr-1 cursor-pointer hover:bg-white/5"
                  onClick={() => setSelectedCategory(null)}
                >
                  {selectedCategory}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedBrand && (
                <Badge
                  variant="outline"
                  className="border-white/10 text-white/60 gap-1 pr-1 cursor-pointer hover:bg-white/5"
                  onClick={() => setSelectedBrand(null)}
                >
                  {selectedBrand}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#00ff66] hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base text-white/40">
            {products === undefined ? (
              "Loading products..."
            ) : (
              <>
                <span className="text-white/80 font-medium">
                  {filteredProducts.length}
                </span>{" "}
                product{filteredProducts.length !== 1 ? "s" : ""} found
              </>
            )}
          </p>
        </div>

        {/* Product Grid */}
        {products === undefined ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-white/[0.04]" />
                <div className="p-5">
                  <div className="h-4 bg-white/5 rounded w-20 mb-3" />
                  <div className="h-5 bg-white/5 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-white/5 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/70 mb-1">
              No products found
            </h3>
            <p className="text-sm text-white/30 max-w-sm">
              Try adjusting your search or filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-white/10 text-white/60 hover:bg-white/5 cursor-pointer"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-[#00ff66]/30 hover:shadow-[0_0_40px_rgba(0,255,102,0.06)] transition-all duration-500 cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-white/10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-black/60 backdrop-blur-sm text-white/70 text-xs font-medium"
                    >
                      {product.category}
                    </Badge>
                    {product.featured && (
                      <Badge className="bg-[#00ff66]/90 text-black border-0 text-xs font-bold">
                        ★ Featured
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-5">
                  <p className="text-xs text-[#00ff66]/70 font-semibold uppercase tracking-wider mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold text-base text-white/90 mb-2 leading-snug group-hover:text-[#00ff66] transition-colors duration-300 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-white/30 leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-white/25 mb-4 flex-wrap">
                    {product.weight && (
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">
                        {product.weight}
                      </span>
                    )}
                    {product.servings && (
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04]">
                        {product.servings}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xl font-bold text-white">
                        {formatINR(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {product.stockQuantity !== undefined &&
                        product.stockQuantity !== null && (
                          <span className="text-xs text-white/25">
                            {product.stockQuantity} units
                          </span>
                        )}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            product.inStock
                              ? "bg-emerald-400"
                              : "bg-red-400",
                          )}
                        />
                        <span className="text-sm text-white/40">
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_120px_100px_100px_80px] gap-4 px-6 py-3 bg-white/[0.03] text-xs text-white/30 uppercase tracking-wider font-medium">
              <span></span>
              <span>Product</span>
              <span>Category</span>
              <span>SKU</span>
              <span className="text-right">Price</span>
              <span className="text-right">Stock</span>
            </div>
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="grid grid-cols-[auto_1fr_120px_100px_100px_80px] gap-4 px-6 py-3 border-t border-white/5 hover:bg-white/[0.02] transition-colors items-center cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/[0.04] flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-white/10" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    {product.name}
                  </p>
                  <p className="text-sm text-white/35">{product.brand}</p>
                </div>
                <span className="text-sm text-white/50">
                  {product.category}
                </span>
                <span className="text-sm text-white/35 font-mono">
                  {product.sku}
                </span>
                <span className="text-base font-semibold text-white/80 text-right">
                  {formatINR(product.price)}
                </span>
                <div className="flex items-center justify-end gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      product.inStock ? "bg-emerald-400" : "bg-red-400",
                    )}
                  />
                  <span className="text-sm text-white/40">
                    {product.inStock ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
