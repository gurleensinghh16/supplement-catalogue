import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MessageCircle, Package, CheckCircle, XCircle } from "lucide-react";

// Matches the Supabase `products` table columns (snake_case) — same shape
// used by Landing.tsx and Dashboard.tsx.
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  in_stock: boolean;
  image_url?: string;
  tags: string[];
  servings?: string;
  weight?: string;
  featured?: boolean;
  stock_quantity?: number;
};

function formatINR(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function buildBulletPoints(product: Product): string[] {
  const points: string[] = [];
  if (product.brand) points.push(`Brand: ${product.brand}`);
  if (product.category) points.push(`Category: ${product.category}`);
  if (product.weight) points.push(`Weight: ${product.weight}`);
  if (product.servings) points.push(`Servings: ${product.servings}`);
  if (product.sku) points.push(`SKU: ${product.sku}`);
  if (product.stock_quantity !== undefined && product.stock_quantity !== null)
    points.push(`Availability: ${product.stock_quantity} units in stock`);
  if (product.tags.length > 0)
    points.push(`Tags: ${product.tags.join(", ")}`);
  return points;
}

function buildWhatsAppMessage(product: Product): string {
  const msg = `Hi TheDietStore 👋\n\nI'm interested in:\n\n📦 *${product.name}*\n🏷️ Brand: ${product.brand}\n💰 Price: ${formatINR(product.price)}\n📋 SKU: ${product.sku}\n\nPlease share details about:\n• Availability & stock\n• Bulk/wholesale pricing\n• Delivery options\n\nThank you!`;
  return `https://wa.me/918295158184?text=${encodeURIComponent(msg)}`;
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const bulletPoints = buildBulletPoints(product);
  const whatsappUrl = buildWhatsAppMessage(product);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Close button — fixed to the viewport, not the scroll container, so it never scrolls away */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] h-9 w-9 bg-[#111111] border border-[#2b2a27] text-[#999999] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className="relative w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto border-0 sm:border border-[#2b2a27] bg-[#0a0a0a] shadow-[0_15px_45px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
         <div className="relative aspect-[4/3] sm:aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden bg-[#0a0a0a]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover product-img"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-[#999999]/30" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
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

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col">
            <p className="text-xs text-[#c2202f] font-medium uppercase tracking-wider mb-2">
              {product.brand}
            </p>
            <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-normal tracking-[0.15em] uppercase text-white leading-tight mb-3">
              {product.name}
            </h2>

            <div className="mb-5">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-medium text-white">
                  {formatINR(product.price)}
                </p>
                {product.compare_at_price && (
                  <p className="text-base text-[#999999] line-through">
                    {formatINR(product.compare_at_price)}
                  </p>
                )}
              </div>
              {product.compare_at_price && (
                <p className="text-sm text-[#57a256] mt-1">
                  You save {formatINR(product.compare_at_price - product.price)}
                </p>
              )}
            </div>

            <div className="mb-6">
              {product.description.split(/(?<=[.!?])\s+/).filter(Boolean).map((sentence, i) => (
                <p key={i} className="text-sm text-[#999999] leading-relaxed mb-2">
                  {sentence.trim()}
                </p>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-medium text-[#999999] uppercase tracking-wider mb-3">
                Product Details
              </h4>
              <ul className="space-y-2">
                {bulletPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#999999]">
                    <span className="mt-1 h-1.5 w-1.5 bg-[#c2202f] flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {product.in_stock ? (
                <>
                  <CheckCircle className="h-4 w-4 text-[#57a256]" />
                  <span className="text-sm text-[#57a256]">In Stock</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-[#c2202f]" />
                  <span className="text-sm text-[#c2202f]">Out of Stock</span>
                </>
              )}
            </div>

            <div className="flex-1" />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-sm cursor-pointer gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Send Enquiry on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}