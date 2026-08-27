import { useEffect, useState } from "react";
import { X, Package, MessageCircle, Minus, Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  inStock: boolean;
  imageUrl?: string;
  tags: string[];
  servings?: string;
  weight?: string;
  featured?: boolean;
  stockQuantity?: number;
};

function formatINR(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ProductDetail({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [qty, setQty] = useState(1);

  // Animate out, then actually unmount via onClose
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  // Mount animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Escape key closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    // lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) /
            product.compare_at_price) *
            100
        )
      : null;

  const msg = encodeURIComponent(
    `Hi TheDietStore 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n💰 Price: ${formatINR(
      product.price
    )}\n📋 SKU: ${product.sku}\n🔢 Quantity: ${qty}\n\nPlease share details about:\n• Availability & stock\n• Bulk/wholesale pricing\n• Delivery options\n\nThank you!`
  );

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-opacity duration-200 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full sm:w-[90vw] sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] bg-[#0a0a0a] border border-[#2b2a27] sm:rounded-lg overflow-hidden flex flex-col
          transition-all duration-300 ease-out
          ${
            visible
              ? "translate-y-0 sm:translate-y-0 sm:scale-100 opacity-100"
              : "translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
          }`}
      >
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#333]" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/90 border border-white/20 text-white hover:border-[#c2202f] hover:text-[#c2202f] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[380px] bg-[#111111] flex items-center justify-center shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <Package className="h-20 w-20 text-[#333]" />
              )}

              {!product.inStock && (
                <div className="absolute top-4 left-4">
                  <span className="bg-[#c2202f] text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider font-['Orbitron']">
                    Sold out
                  </span>
                </div>
              )}
              {discount && (
                <div className="absolute top-4 left-4" style={{ marginTop: !product.inStock ? "2rem" : 0 }}>
                  <span className="bg-white text-black text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider font-['Orbitron']">
                    {discount}% off
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="sm:w-1/2 p-5 sm:p-7 flex flex-col">
              <p className="text-[11px] text-[#c2202f] font-medium uppercase tracking-wider mb-1.5">
                {product.brand} · {product.category}
              </p>

              <h2 className="font-['Orbitron'] text-lg sm:text-xl font-normal tracking-[0.1em] uppercase text-white mb-3 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <p className="text-2xl font-semibold text-white">
                  {formatINR(product.price)}
                </p>
                {product.compare_at_price && (
                  <p className="text-sm text-[#999999] line-through">
                    {formatINR(product.compare_at_price)}
                  </p>
                )}
              </div>

              <p className="text-sm text-[#999999] leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Meta grid */}
              {(product.servings || product.weight || product.sku) && (
                <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                  {product.weight && (
                    <div className="border border-[#2b2a27] px-3 py-2">
                      <p className="text-[#999999] uppercase tracking-wider mb-0.5">
                        Weight
                      </p>
                      <p className="text-white">{product.weight}</p>
                    </div>
                  )}
                  {product.servings && (
                    <div className="border border-[#2b2a27] px-3 py-2">
                      <p className="text-[#999999] uppercase tracking-wider mb-0.5">
                        Servings
                      </p>
                      <p className="text-white">{product.servings}</p>
                    </div>
                  )}
                  <div className="border border-[#2b2a27] px-3 py-2">
                    <p className="text-[#999999] uppercase tracking-wider mb-0.5">
                      Availability
                    </p>
                    <p className={product.inStock ? "text-[#25D366]" : "text-[#c2202f]"}>
                      {product.inStock ? "In stock" : "Sold out"}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-wider text-[#999999] border border-[#2b2a27] px-2.5 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3">
                {/* Quantity selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#999999] uppercase tracking-wider">
                    Qty
                  </span>
                  <div className="flex items-center border border-[#2b2a27]">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-[#c2202f] transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm text-white">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-[#c2202f] transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/918295158184?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 text-sm font-medium tracking-wider"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enquire on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}