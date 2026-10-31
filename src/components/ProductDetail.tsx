
import { useEffect, useState } from "react";
import { X, Package, ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";

const MAX_QTY = 10;

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
  price?: number | string | null;
  mrp?: number | string | null;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductDetail({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addToCart, items, updateQuantity } = useCart();

  const [visible, setVisible] = useState(false);

  const price = Number(product.price);
  const mrp = Number(product.mrp);

  const hasPrice = Number.isFinite(price) && price > 0;
  const hasMrp = Number.isFinite(mrp) && mrp > price;

  const productId = String(product.id || product.sku || "").trim();

  const cartItem = items.find((item) => item.id === productId);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleAddToCart = () => {
    if (!product.inStock || !hasPrice) return;

    if (!productId) {
      alert("This product has no product ID. Please contact the store.");
      return;
    }

    addToCart({
      id: productId,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      price,
      mrp: hasMrp ? mrp : undefined,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
    });
  };

  const changeQuantity = (nextQuantity: number) => {
    if (!cartItem) return;
    updateQuantity(productId, nextQuantity);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-200 ease-out sm:items-center ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden border border-[#2b2a27] bg-[#0a0a0a] transition-all duration-300 ease-out sm:max-h-[85vh] sm:w-[90vw] sm:max-w-3xl sm:rounded-lg ${
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
        }`}
      >
        {/* Mobile drag handle */}
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#333]" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/90 text-white transition-colors hover:border-[#c2202f] hover:text-[#c2202f] sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Product content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative flex aspect-square shrink-0 items-center justify-center bg-[#111111] sm:aspect-auto sm:min-h-[380px] sm:w-1/2">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <Package className="h-20 w-20 text-[#333]" />
              )}

              {!product.inStock && (
                <div className="absolute left-4 top-4">
                  <span className="bg-[#c2202f] px-2.5 py-1 font-['Orbitron'] text-[10px] font-bold uppercase tracking-wider text-white">
                    Sold out
                  </span>
                </div>
              )}
            </div>

            {/* Information */}
            <div className="flex flex-col p-5 sm:w-1/2 sm:p-7">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-[#c2202f]">
                {product.brand} · {product.category}
              </p>

              <h2 className="mb-3 font-['Orbitron'] text-lg font-normal uppercase leading-snug tracking-[0.1em] text-white sm:text-xl">
                {product.name}
              </h2>

              <p className="mb-5 text-sm leading-relaxed text-[#999999]">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-5">
                {hasPrice ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-semibold text-white">
                      {formatPrice(price)}
                    </span>

                    {hasMrp && (
                      <>
                        <span className="text-sm text-[#999999] line-through">
                          {formatPrice(mrp)}
                        </span>

                        <span className="text-xs font-medium text-[#25D366]">
                          {Math.round((1 - price / mrp) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#999999]">
                    Price on request
                  </p>
                )}
              </div>

              {/* Product details */}
              {(product.servings || product.weight || product.sku) && (
                <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
                  {product.weight && (
                    <div className="border border-[#2b2a27] px-3 py-2">
                      <p className="mb-0.5 uppercase tracking-wider text-[#999999]">
                        Weight
                      </p>
                      <p className="text-white">{product.weight}</p>
                    </div>
                  )}

                  {product.servings && (
                    <div className="border border-[#2b2a27] px-3 py-2">
                      <p className="mb-0.5 uppercase tracking-wider text-[#999999]">
                        Servings
                      </p>
                      <p className="text-white">{product.servings}</p>
                    </div>
                  )}

                  <div className="border border-[#2b2a27] px-3 py-2">
                    <p className="mb-0.5 uppercase tracking-wider text-[#999999]">
                      Availability
                    </p>
                    <p
                      className={
                        product.inStock ? "text-[#25D366]" : "text-[#c2202f]"
                      }
                    >
                      {product.inStock ? "In stock" : "Sold out"}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#2b2a27] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#999999]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Cart quantity selector */}
              <div className="mt-auto">
                {product.inStock && hasPrice ? (
                  cartItem ? (
                    <div className="flex w-full items-center justify-between border border-[#c2202f] bg-[#171010] px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(cartItem.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center text-white transition-colors hover:text-[#c2202f]"
                      >
                        <Minus size={18} />
                      </button>

                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <ShoppingCart
                          size={16}
                          className="text-[#c2202f]"
                        />
                        {cartItem.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(cartItem.quantity + 1)
                        }
                        disabled={cartItem.quantity >= MAX_QTY}
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center text-white transition-colors hover:text-[#c2202f] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 border border-[#c2202f] bg-[#c2202f] py-3 font-['Orbitron'] text-xs uppercase tracking-wider text-white transition-colors hover:bg-[#de3746]"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed border border-[#2b2a27] bg-[#2b2a27] py-3 font-['Orbitron'] text-xs uppercase tracking-wider text-[#999999]"
                  >
                    {!product.inStock ? "Sold Out" : "Price Unavailable"}
                  </button>
                )}

                <p className="mt-2 text-center text-[10px] text-[#777777]">
                  {cartItem
                    ? "Quantity updated in your shopping cart."
                    : "Add this product to your shopping cart."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
