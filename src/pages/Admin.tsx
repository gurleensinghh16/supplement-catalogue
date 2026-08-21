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
  Check,
  X,
  Save,
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
    setEditImage(product.imageUrl || "");
    setEditStock(String(product.stockQuantity ?? ""));
    setEditInStock(product.inStock);
  };

  const saveEdit = async (productId: string) => {
    await updateProduct({
      productId: productId as any,
      price: Number(editPrice),
      imageUrl: editImage || undefined,
      stockQuantity: editStock ? Number(editStock) : undefined,
      inStock: editInStock,
    });
    setEditingId(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ff66] mx-auto mb-4">
              <Dumbbell className="h-7 w-7 text-black" />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-white/40 mt-2">
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
                className="h-11 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#00ff66]/40"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#00ff66]/40"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-400">{loginError}</p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-[#00ff66] text-black hover:bg-[#00e65c] font-semibold cursor-pointer"
            >
              <Lock className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <p className="text-xs text-white/30 mb-2 font-medium">Demo Credentials:</p>
            <p className="text-xs text-white/50 font-mono">
              {ADMIN_EMAIL}
            </p>
            <p className="text-xs text-white/50 font-mono">
              {ADMIN_PASSWORD}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-xs text-white/30 hover:text-white/60 cursor-pointer w-full text-center"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00ff66]">
              <Dumbbell className="h-4 w-4 text-black" />
            </div>
            <span className="text-base font-bold tracking-tight">TheDietStore</span>
            <Badge className="bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20 text-[10px] ml-1">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
              onClick={() => navigate("/catalogue")}
            >
              View Catalogue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
              onClick={() => setIsLoggedIn(false)}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-sm text-white/40 mt-1">
            Edit prices, images, and stock quantities for all products.
          </p>
        </div>

        {products === undefined ? (
          <div className="text-center py-20 text-white/40">Loading products...</div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_100px_100px_120px_80px_80px_80px] gap-3 px-4 py-3 bg-white/[0.03] text-[10px] text-white/30 uppercase tracking-wider font-medium">
              <span></span>
              <span>Product</span>
              <span>Category</span>
              <span className="text-right">Price</span>
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
                    "grid grid-cols-1 md:grid-cols-[auto_1fr_100px_100px_120px_80px_80px_80px] gap-3 px-4 py-3 border-t border-white/5 items-center transition-colors",
                    isEditing && "bg-[#00ff66]/[0.03]",
                  )}
                >
                  {/* Image */}
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/[0.04] flex-shrink-0">
                    {(isEditing ? editImage : product.imageUrl) ? (
                      <img
                        src={isEditing ? editImage : product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-white/10" />
                      </div>
                    )}
                  </div>

                  {/* Name & Brand */}
                  <div>
                    <p className="text-sm font-medium text-white/80 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-white/35">{product.brand}</p>
                  </div>

                  {/* Category */}
                  <span className="text-xs text-white/50 hidden md:block">
                    {product.category}
                  </span>

                  {/* Price */}
                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        type="number"
                        className="h-8 text-xs bg-white/[0.04] border-white/10 text-white w-full text-right"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-white/80">
                        {formatINR(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Image URL */}
                  <div className="hidden md:block">
                    {isEditing ? (
                      <Input
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        className="h-8 text-xs bg-white/[0.04] border-white/10 text-white"
                        placeholder="Image URL"
                      />
                    ) : (
                      <span className="text-[10px] text-white/25 truncate block max-w-[120px]">
                        {product.imageUrl || "—"}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        type="number"
                        className="h-8 text-xs bg-white/[0.04] border-white/10 text-white w-full text-right"
                      />
                    ) : (
                      <span className="text-xs text-white/50">
                        {product.stockQuantity ?? "—"}
                      </span>
                    )}
                  </div>

                  {/* In Stock */}
                  <div className="flex justify-center">
                    {isEditing ? (
                      <button
                        onClick={() => setEditInStock(!editInStock)}
                        className={cn(
                          "h-6 w-11 rounded-full transition-colors cursor-pointer relative",
                          editInStock ? "bg-emerald-500" : "bg-white/10",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                            editInStock ? "translate-x-[22px]" : "translate-x-0.5",
                          )}
                        />
                      </button>
                    ) : (
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full inline-block",
                          product.inStock ? "bg-emerald-400" : "bg-red-400",
                        )}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(product._id)}
                          className="h-7 w-7 rounded-md bg-[#00ff66]/10 text-[#00ff66] flex items-center justify-center hover:bg-[#00ff66]/20 cursor-pointer transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="h-7 w-7 rounded-md bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(product)}
                        className="h-7 w-7 rounded-md bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white/70 cursor-pointer transition-colors"
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
