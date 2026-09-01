import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

// Matches the actual Supabase `products` table columns (camelCase).
// NOTE: this table has no `created_at` and no `compare_at_price` column —
// those were removed here since they don't exist in the schema.
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  sku: string | null;
  imageUrl: string | null;
  weight: string | null;
  servings: string | null;
  stockQuantity: number | null;
  inStock: boolean;
  featured: boolean;
  tags: string[] | null;
};

export default function Admin() {
  const BASE = import.meta.env.BASE_URL || "/";
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated, signIn, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [products, setProducts] = useState<Product[] | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImage, setEditImage] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);

  // Add product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newServings, setNewServings] = useState("");
  const [newStock, setNewStock] = useState("0");
  const [newFeatured, setNewFeatured] = useState(false);
  const [newTags, setNewTags] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from Supabase (re-runs whenever refreshKey changes)
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        return;
      }
      setProducts(data as Product[]);
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [refreshKey, isAuthenticated]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Filtered list for the table — searches name, brand, category, and SKU
  const filteredProducts = useMemo(() => {
    if (!products) return products;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.brand, p.category, p.sku ?? ""].some((field) =>
        field.toLowerCase().includes(q),
      ),
    );
  }, [products, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setLoginError("");
    try {
      await signIn(email, password);
    } catch (err) {
      console.error("Sign-in error:", err);
      setLoginError("Invalid email or password.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditImage(product.imageUrl || "");
    setEditStock(String(product.stockQuantity ?? ""));
    setEditFeatured(product.featured);
  };

  const saveEdit = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({
        imageUrl: editImage || null,
        stockQuantity: editStock ? Number(editStock) : null,
        featured: editFeatured,
      })
      .eq("id", productId);

    if (error) {
      console.error("Error updating product:", error);
      alert(`Failed to update product: ${error.message}`);
      return;
    }

    setEditingId(null);
    refetch();
  };

  const resetAddForm = () => {
    setNewName(""); setNewBrand(""); setNewCategory(""); setNewDescription("");
    setNewImageUrl(""); setNewWeight(""); setNewServings("");
    setNewStock("0"); setNewFeatured(false); setNewTags("");
    setShowAddForm(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBrand || !newCategory) return;

    const { error } = await supabase.from("products").insert({
      name: newName,
      brand: newBrand,
      category: newCategory,
      description: newDescription || null,
      sku: newSku || null,
      imageUrl: newImageUrl || null,
      weight: newWeight || null,
      servings: newServings || null,
      stockQuantity: Number(newStock),
      featured: newFeatured,
      tags: newTags ? newTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });

    if (error) {
      console.error("Error creating product:", error);
      alert(`Failed to create product: ${error.message}`);
      return;
    }

    resetAddForm();
    refetch();
  };

  const handleUnfeature = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .update({ featured: false })
      .eq("id", productId);

    if (error) {
      console.error("Error removing product from Hot Selling:", error);
      alert(`Failed to remove from Hot Selling: ${error.message}`);
      return;
    }

    refetch();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      alert(`Failed to delete product: ${error.message}`);
      return;
    }

    refetch();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-sm text-[#999999]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
                        <img
              src={`${BASE}logoo.png`}
              alt="TheDietStore"
              className="h-14 w-auto mx-auto mb-4 object-contain"
            />
            <h1 className="font-['Orbitron'] text-2xl font-normal tracking-[0.15em] uppercase">
              Admin Panel
            </h1>
            <p className="text-sm text-[#999999] mt-2">
              Sign in to manage products
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999] focus-visible:border-[#c2202f]/40"
                disabled={isSigningIn}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999] focus-visible:border-[#c2202f]/40"
                disabled={isSigningIn}
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-[#c2202f]">{loginError}</p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-[#c2202f] text-white hover:bg-[#de3746] font-medium cursor-pointer"
              disabled={isSigningIn}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isSigningIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-xs text-[#999999] hover:text-white cursor-pointer w-full text-center"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-[#2b2a27] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={`${BASE}logoo.png`}
              alt="TheDietStore"
              className="h-8 w-auto object-contain"
            />
            <Badge className="bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20 text-[10px] ml-1">
              Admin
            </Badge>
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#999999] hover:text-white hover:bg-[#111111] cursor-pointer"
              onClick={() => navigate("/catalogue")}
            >
              View Catalogue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#999999] hover:text-white hover:bg-[#111111] cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header + Add Product button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-['Orbitron'] text-2xl font-normal tracking-[0.15em] uppercase">
              Product Management
            </h1>
            <p className="text-sm text-[#999999] mt-1">
              Edit images, stock quantities, and availability for all products.
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#c2202f] text-white hover:bg-[#de3746] font-medium cursor-pointer font-['Orbitron'] text-xs tracking-wider uppercase h-10 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Add Product Form — renders right below the button, above Hot Selling */}
        {showAddForm && (
          <form onSubmit={handleAddProduct} className="mb-8 border border-[#2b2a27] bg-[#0a0a0a] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-['Orbitron'] text-base tracking-[0.15em] uppercase text-white">New Product</h2>
              <button type="button" onClick={resetAddForm} className="text-[#999999] hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input placeholder="Product Name *" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" required />
              <Input placeholder="Brand *" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" required />
              <Input placeholder="Category *" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" required />
              <Input placeholder="SKU" value={newSku} onChange={(e) => setNewSku(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" />
              <Input placeholder="Image URL" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" />
              <Input placeholder="Weight" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" />
              <Input placeholder="Servings" value={newServings} onChange={(e) => setNewServings(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" />
              <Input placeholder="Stock Quantity" type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50" />
              <Input placeholder="Tags (comma-separated)" value={newTags} onChange={(e) => setNewTags(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50 sm:col-span-2 lg:col-span-1" />
              <textarea placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="h-10 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50 px-3 py-2 text-sm resize-none sm:col-span-2 lg:col-span-3" rows={2} />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-[11px] text-[#999999]/60 italic">
                In Stock is set automatically from Stock Quantity
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button" onClick={() => setNewFeatured(!newFeatured)} className={cn("h-6 w-10 transition-colors cursor-pointer relative rounded-full", newFeatured ? "bg-[#c2202f]" : "bg-[#2b2a27]")}>
                  <span className={cn("absolute top-0.5 h-5 w-5 bg-white transition-transform rounded-full shadow", newFeatured ? "translate-x-[20px]" : "translate-x-0.5")} />
                </button>
                <span className="text-xs text-[#999999]">Featured on Home</span>
              </label>
              <Button type="submit" className="bg-[#c2202f] text-white hover:bg-[#de3746] cursor-pointer font-['Orbitron'] text-xs tracking-wider uppercase ml-auto">
                <Save className="h-3.5 w-3.5 mr-2" /> Create Product
              </Button>
            </div>
          </form>
        )}

        {/* Hot Selling Products panel */}
        {products !== undefined && (
          <div className="mb-8 border border-[#c2202f]/30 bg-[#0a0a0a]">
            <div className="px-6 py-4 border-b border-[#2b2a27] flex items-center justify-between">
              <h2 className="font-['Orbitron'] text-sm tracking-[0.15em] uppercase text-white">
                Hot Selling Products
              </h2>
              <span className="text-[10px] text-[#999999] uppercase tracking-wider">
                {products.filter((p) => p.featured).length} featured
              </span>
            </div>
            {products.filter((p) => p.featured).length === 0 ? (
              <p className="px-6 py-6 text-sm text-[#999999]">
                No products marked as Hot Selling yet. Use the pencil icon below to feature one.
              </p>
            ) : (
              <div>
                {products
                  .filter((p) => p.featured)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 border-t border-[#2b2a27] first:border-t-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 overflow-hidden bg-[#111111] flex-shrink-0">
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
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#999999]/60">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnfeature(product.id)}
                        className="flex-shrink-0 h-8 px-3 bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20 text-[10px] font-bold uppercase tracking-wider hover:bg-[#c2202f]/20 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Search bar for the product table */}
        {products !== undefined && products.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                type="text"
                placeholder="Search by name, brand, category, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 bg-[#111111] border-[#2b2a27] text-white placeholder:text-[#999999]/50 focus-visible:border-[#c2202f]/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <span className="text-xs text-[#999999] whitespace-nowrap">
                {filteredProducts?.length ?? 0} of {products.length} products
              </span>
            )}
          </div>
        )}

        {products === undefined ? (
          <div className="text-center py-20 text-[#999999]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[#999999]">
            No products yet. Add one above.
          </div>
        ) : filteredProducts && filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-[#999999]">
            No products match "{searchQuery}".
          </div>
        ) : (
          <div className="border border-[#2b2a27] overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_90px_100px_70px_70px_70px_70px] gap-2 px-3 py-3 bg-[#111111] text-[10px] text-[#999999] uppercase tracking-wider font-medium border-b border-[#2b2a27]">
              <span></span>
              <span>Product</span>
              <span>Category</span>
              <span>Image URL</span>
              <span className="text-right">Stock</span>
              <span className="text-center">In Stock</span>
              <span className="text-center">Featured</span>
              <span className="text-center">Actions</span>
            </div>

            {(filteredProducts ?? products).map((product) => {
              const isEditing = editingId === product.id;
              return (
                <div
                  key={product.id}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-[auto_1fr_90px_100px_70px_70px_70px_70px] gap-2 px-3 py-3 border-t border-[#2b2a27] items-center transition-colors",
                    isEditing && "bg-[#c2202f]/[0.03]",
                  )}
                >
                  <div className="h-10 w-10 overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                    {(isEditing ? editImage : product.imageUrl) ? (
                      <img
                        src={isEditing ? editImage : product.imageUrl ?? ""}
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
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#999999]/60">{product.brand}</p>
                  </div>

                  <span className="text-xs text-[#999999] hidden md:block">
                    {product.category}
                  </span>

                  <div className="hidden md:block">
                    {isEditing ? (
                      <Input
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        className="h-8 text-xs bg-[#111111] border-[#2b2a27] text-white"
                        placeholder="Image URL"
                      />
                    ) : (
                      <span className="text-xs text-[#999999]/40 truncate block max-w-[120px]">
                        {product.imageUrl || "—"}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        type="number"
                        className="h-8 text-xs bg-[#111111] border-[#2b2a27] text-white w-full text-right"
                      />
                    ) : (
                      <span className="text-xs text-[#999999]">
                        {product.stockQuantity ?? "—"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span
                      title="Derived automatically from Stock Quantity"
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 uppercase tracking-wider",
                        product.inStock
                          ? "bg-[#57a256]/10 text-[#57a256] border border-[#57a256]/20"
                          : "bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20",
                      )}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    {isEditing ? (
                      <button
                        onClick={() => setEditFeatured(!editFeatured)}
                        title="Toggle hot-selling / featured on home"
                        className={cn(
                          "h-7 w-12 transition-colors cursor-pointer relative rounded-full",
                          editFeatured ? "bg-[#c2202f]" : "bg-[#2b2a27]",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-6 w-6 bg-white transition-transform rounded-full shadow",
                            editFeatured ? "translate-x-[25px]" : "translate-x-0.5",
                          )}
                        />
                      </button>
                    ) : product.featured ? (
                      <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20">
                        Hot
                      </span>
                    ) : (
                      <span className="text-xs text-[#999999]/40">—</span>
                    )}
                  </div>

                  <div className="flex justify-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(product.id)}
                          className="h-7 w-7 bg-[#c2202f]/10 text-[#c2202f] flex items-center justify-center hover:bg-[#c2202f]/20 cursor-pointer transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="h-7 w-7 bg-[#111111] text-[#999999] flex items-center justify-center hover:bg-[#2b2a27] cursor-pointer transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(product)}
                          className="h-7 w-7 bg-[#111111] text-[#999999] flex items-center justify-center hover:bg-[#2b2a27] hover:text-white cursor-pointer transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-7 w-7 bg-[#111111] text-[#999999] flex items-center justify-center hover:bg-[#c2202f]/10 hover:text-[#c2202f] cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}