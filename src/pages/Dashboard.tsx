import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
    <div className="min-h-screen bg-black text-white">
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#2b2a27] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Dumbbell className="h-5 w-5 text-[#c2202f]" />
            <span className="font-['Orbitron'] text-base font-normal tracking-[0.15em] uppercase">
              TheDietStore
            </span>
            <span className="hidden sm:inline text-xs text-[#999999] ml-2 border-l border-[#2b2a27] pl-3 tracking-wider uppercase">
              Product Catalogue
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#c2202f] hover:text-[#de3746] hover:bg-[#c2202f]/5 cursor-pointer text-xs font-medium tracking-wider uppercase"
              onClick={() => navigate("/admin")}
            >
              Admin Panel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#999999] hover:text-white hover:bg-[#111111] cursor-pointer"
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, or keywords..."
                className="pl-10 h-11 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999] focus-visible:border-[#c2202f]/40 focus-visible:ring-[#c2202f]/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={cn(
                "border-[#2b2a27] hover:bg-[#111111] h-11 px-4 gap-2 cursor-pointer",
                showFilters && "border-[#c2202f]/30 bg-[#c2202f]/[0.06] text-[#c2202f]",
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-[#c2202f] text-white text-[10px] font-bold">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <div className="hidden sm:flex items-center border border-[#2b2a27] overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 transition-colors cursor-pointer",
                  viewMode === "grid" ? "bg-[#111111] text-white" : "text-[#999999] hover:text-white",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 transition-colors cursor-pointer",
                  viewMode === "list" ? "bg-[#111111] text-white" : "text-[#999999] hover:text-white",
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#999999] font-medium mr-1 uppercase tracking-wider">Category:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-all cursor-pointer border",
                  !selectedCategory
                    ? "bg-[#c2202f] text-white border-[#c2202f]"
                    : "bg-[#111111] text-[#999999] border-[#2b2a27] hover:border-[#3a3a37] hover:text-white",
                )}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-all cursor-pointer border",
                    selectedCategory === cat
                      ? "bg-[#c2202f] text-white border-[#c2202f]"
                      : "bg-[#111111] text-[#999999] border-[#2b2a27] hover:border-[#3a3a37] hover:text-white",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand filter */}
          {showFilters && (
            <div className="p-4 border border-[#2b2a27] bg-[#111111]">
              <p className="text-xs font-medium text-[#999999] uppercase tracking-wider mb-3">
                Brand
              </p>
              <div className="flex flex-wrap gap-2">
                {brands?.map((brand) => (
                  <button
                    key={brand}
                    onClick={() =>
                      setSelectedBrand(selectedBrand === brand ? null : brand)
                    }
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-all cursor-pointer border",
                      selectedBrand === brand
                        ? "bg-[#c2202f] text-white border-[#c2202f]"
                        : "bg-[#111111] text-[#999999] border-[#2b2a27] hover:border-[#3a3a37] hover:text-white",
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
              <span className="text-xs text-[#999999]">Active:</span>
              {search && (
                <Badge
                  variant="outline"
                  className="border-[#2b2a27] text-[#999999] gap-1 pr-1 cursor-pointer hover:bg-[#111111]"
                  onClick={() => setSearch("")}
                >
                  &quot;{search}&quot;
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedCategory && (
                <Badge
                  variant="outline"
                  className="border-[#2b2a27] text-[#999999] gap-1 pr-1 cursor-pointer hover:bg-[#111111]"
                  onClick={() => setSelectedCategory(null)}
                >
                  {selectedCategory}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedBrand && (
                <Badge
                  variant="outline"
                  className="border-[#2b2a27] text-[#999999] gap-1 pr-1 cursor-pointer hover:bg-[#111111]"
                  onClick={() => setSelectedBrand(null)}
                >
                  {selectedBrand}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#c2202f] hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#999999]">
            {products === undefined ? (
              "Loading products..."
            ) : (
              <>
                <span className="text-white font-medium">
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
                className="border border-[#2b2a27] bg-[#111111] overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-[#0a0a0a]" />
                <div className="p-5">
                  <div className="h-4 bg-[#2b2a27] w-20 mb-3" />
                  <div className="h-5 bg-[#2b2a27] w-3/4 mb-2" />
                  <div className="h-3 bg-[#2b2a27] w-1/2 mb-4" />
                  <div className="h-4 bg-[#2b2a27] w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 bg-[#111111] border border-[#2b2a27] flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-[#999999]" />
            </div>
            <h3 className="font-['Orbitron'] text-lg font-normal tracking-wider uppercase text-[#999999] mb-1">
              No products found
            </h3>
            <p className="text-sm text-[#999999]/60 max-w-sm">
              Try adjusting your search or filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-[#2b2a27] text-[#999999] hover:bg-[#111111] cursor-pointer"
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
                className="group cursor-pointer border border-[#2b2a27] bg-[#111111] overflow-hidden hover:border-[#c2202f]/40 hover:shadow-[0_15px_45px_rgba(194,32,47,0.08)] transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden bg-[#0a0a0a]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-[#999999]/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      variant="outline"
                      className="border-[#2b2a27] bg-black/80 text-[#999999] text-xs font-medium"
                    >
                      {product.category}
                    </Badge>
                    {product.featured && (
                      <Badge className="bg-[#c2202f] text-white border-0 text-xs font-bold">
                        ★ Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-[#999999] font-semibold uppercase tracking-wider mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-['Orbitron'] text-sm font-normal tracking-wider uppercase text-white mb-2 leading-snug group-hover:text-[#c2202f] transition-colors duration-300 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#999999]/60 leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-[#999999]/40 mb-4 flex-wrap">
                    {product.weight && (
                      <span className="px-2 py-0.5 bg-[#0a0a0a] border border-[#2b2a27]">
                        {product.weight}
                      </span>
                    )}
                    {product.servings && (
                      <span className="px-2 py-0.5 bg-[#0a0a0a] border border-[#2b2a27]">
                        {product.servings}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-[#2b2a27]">
                    <div>
                      <p className="text-xl font-medium text-white">
                        {formatINR(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {product.stockQuantity !== undefined &&
                        product.stockQuantity !== null && (
                          <span className="text-xs text-[#999999]/40">
                            {product.stockQuantity} units
                          </span>
                        )}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            product.inStock ? "bg-[#57a256]" : "bg-[#c2202f]",
                          )}
                        />
                        <span className="text-sm text-[#999999]">
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
          <div className="border border-[#2b2a27] overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_120px_100px_100px_80px] gap-4 px-6 py-3 bg-[#111111] text-xs text-[#999999] uppercase tracking-wider font-medium border-b border-[#2b2a27]">
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
                className="grid grid-cols-[auto_1fr_120px_100px_100px_80px] gap-4 px-6 py-3 border-t border-[#2b2a27] hover:bg-[#111111] transition-colors items-center cursor-pointer"
              >
                <div className="h-10 w-10 overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-[#999999]/30" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-[#999999]/60">{product.brand}</p>
                </div>
                <span className="text-sm text-[#999999]">
                  {product.category}
                </span>
                <span className="text-sm text-[#999999]/60 font-mono">
                  {product.sku}
                </span>
                <span className="text-base font-medium text-white text-right">
                  {formatINR(product.price)}
                </span>
                <div className="flex items-center justify-end gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      product.inStock ? "bg-[#57a256]" : "bg-[#c2202f]",
                    )}
                  />
                  <span className="text-sm text-[#999999]">
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
