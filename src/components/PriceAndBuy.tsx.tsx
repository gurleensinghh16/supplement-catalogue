type PriceProduct = {
  name: string;
  brand: string;
  sku: string;
  inStock: boolean;
  price?: string;
  mrp?: string;
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PriceAndBuy({ product }: { product: PriceProduct }) {
  const p = Number(product.price);
  const m = Number(product.mrp);
  const hasPrice = p > 0;
  const canBuy = hasPrice && product.inStock;

  const buyMsg = encodeURIComponent(
    `Hi TheDietStore 👋\n\nI'd like to buy:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n💰 Price: ${hasPrice ? formatPrice(p) : "N/A"}\n📋 SKU: ${product.sku}\n\nPlease confirm availability and share the payment details.\n\nThank you!`
  );

  return (
    <div className="mb-2">
      {hasPrice ? (
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-base font-semibold text-white">{formatPrice(p)}</span>
          {m > p && (
            <>
              <span className="text-xs text-[#999999] line-through">{formatPrice(m)}</span>
              <span className="text-[10px] text-[#25D366] font-medium">
                {Math.round((1 - p / m) * 100)}% off
              </span>
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-[#999999] mb-2">Price on request</p>
      )}

      {canBuy ? (
        <a
          href={`https://wa.me/918295158184?text=${buyMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="block w-full py-2.5 mb-2 text-center bg-[#c2202f] text-white font-['Orbitron'] text-xs tracking-wider uppercase hover:bg-[#de3746] transition-colors"
        >
          Buy now
        </a>
      ) : (
        <button
          disabled
          className="block w-full py-2.5 mb-2 text-center bg-[#2b2a27] text-[#999999] font-['Orbitron'] text-xs tracking-wider uppercase cursor-not-allowed"
        >
          {product.inStock ? "Unavailable" : "Sold out"}
        </button>
      )}
    </div>
  );
}