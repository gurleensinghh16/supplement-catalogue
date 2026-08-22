import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Lock,
  LogOut,
  Package,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "admin@thedietstore.com";
const ADMIN_PASSWORD = "admin123";

function formatINR(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCompareAtPrice, setEditCompareAtPrice] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editInStock, setEditInStock] = useState(true);

  const products = useQuery(api.products.list, {});
  const updateProduct = useMutation(api.products.updateProduct);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Try demo credentials below.");
    }
  };

  const startEditing = (product: (typeof products extends (infer T)[] | undefined ? T : never)) => {
    setEditingId(product._id);
    setEditPrice(String(product.price));
    setEditCompareAtPrice(String(product.compareAtPrice ?? ""));
    setEditImage(product.imageUrl || "");
    setEditStock(String(product.stockQuantity ?? ""));
    setEditInStock(product.inStock);
  };

  const saveEdit = async (productId: string) => {
    await updateProduct({
      productId: productId as any,
      price: Number(editPrice),
      compareAtPrice: editCompareAtPrice ? Number(editCompareAtPrice) : undefined,
      imageUrl: editImage || undefined,
      stockQuantity: editStock ? Number(editStock) : undefined,
      inStock: editInStock,
    });
    setEditingId(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center bg-[#c2202f] mx-auto mb-4">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
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
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-[#c2202f]">{loginError}</p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-[#c2202f] text-white hover:bg-[#de3746] font-medium cursor-pointer"
            >
              <Lock className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 border border-[#2b2a27] bg-[#111111]">
            <p className="text-xs text-[#999999] mb-2 font-medium">Demo Credentials:</p>
            <p className="text-xs text-[#999999] font-mono">{ADMIN_EMAIL}</p>
            <p className="text-xs text-[#999999] font-mono">{ADMIN_PASSWORD}</p>
          </div>

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
            <Dumbbell className="h-5 w-5 text-[#c2202f]" />
            <span className="font-['Orbitron'] text-base font-normal tracking-[0.15em] uppercase">
              TheDietStore
            </span>
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
              onClick={() => setIsLoggedIn(false)}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="font-['Orbitron'] text-2xl font-normal tracking-[0.15em] uppercase">
            Product Management
          </h1>
          <p className="text-sm text-[#999999] mt-1">
            Edit prices, MRP, images, stock quantities, and availability for all products.
          </p>
        </div>

        {products === undefined ? (
          <div className="text-center py-20 text-[#999999]">Loading products...</div>
        ) : (
          <div className="border border-[#2b2a27] overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_90px_80px_80px_100px_70px_70px_70px] gap-2 px-3 py-3 bg-[#111111] text-[10px] text-[#999999] uppercase tracking-wider font-medium border-b border-[#2b2a27]">
              <span></span>
              <span>Product</span>
              <span>Category</span>
              <span className="text-right">Price</span>
              <span className="text-right">MRP</span>
              <span>Image URL</span>
              <span className="text-right">Stock</span>
              <span className="text-center">In Stock</span>
              <span className="text-center">Actions</span>
            </div>

            {products.map((product) => {
              const isEditing = editingId === product._id;
              return (
                <div
                  key={product._id}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-[auto_1fr_90px_80px_80px_100px_70px_70px_70px] gap-2 px-3 py-3 border-t border-[#2b2a27] items-center transition-colors",
                    isEditing && "bg-[#c2202f]/[0.03]",
                  )}
                >
                  <div className="h-10 w-10 overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                    {(isEditing ? editImage : product.imageUrl) ? (
                      <img
                        src={isEditing ? editImage : product.imageUrl}
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

                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        type="number"
                        className="h-8 text-xs bg-[#111111] border-[#2b2a27] text-white w-full text-right"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {formatINR(product.price)}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        value={editCompareAtPrice}
                        onChange={(e) => setEditCompareAtPrice(e.target.value)}
                        type="number"
                        className="h-8 text-xs bg-[#111111] border-[#2b2a27] text-white w-full text-right"
                        placeholder="MRP"
                      />
                    ) : (
                      <span className="text-xs text-[#999999] line-through">
                        {product.compareAtPrice ? formatINR(product.compareAtPrice) : "—"}
                      </span>
                    )}
                  </div>

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
                    {isEditing ? (
                      <button
                        onClick={() => setEditInStock(!editInStock)}
                        className={cn(
                          "h-7 w-12 transition-colors cursor-pointer relative rounded-full",
                          editInStock ? "bg-[#57a256]" : "bg-[#2b2a27]",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-6 w-6 bg-white transition-transform rounded-full shadow",
                            editInStock ? "translate-x-[25px]" : "translate-x-0.5",
                          )}
                        />
                      </button>
                    ) : (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 uppercase tracking-wider",
                          product.inStock
                            ? "bg-[#57a256]/10 text-[#57a256] border border-[#57a256]/20"
                            : "bg-[#c2202f]/10 text-[#c2202f] border border-[#c2202f]/20",
                        )}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(product._id)}
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
                      <button
                        onClick={() => startEditing(product)}
                        className="h-7 w-7 bg-[#111111] text-[#999999] flex items-center justify-center hover:bg-[#2b2a27] hover:text-white cursor-pointer transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
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
