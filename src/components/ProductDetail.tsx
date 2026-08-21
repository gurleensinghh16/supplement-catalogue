import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MessageCircle, Package, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  if (product.stockQuantity !== undefined && product.stockQuantity !== null)
    points.push(`Availability: ${product.stockQuantity} units in stock`);
  if (product.tags.length > 0)
    points.push(`Tags: ${product.tags.join(", ")}`);
  return points;
}

function buildWhatsAppMessage(product: Product): string {
  const msg = `Hi, I'm interested in enquiring about:\n\n*${product.name}*\nBrand: ${product.brand}\nPrice: ${formatINR(product.price)}\nSKU: ${product.sku}\n\nPlease share more details.`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-white/10" />
              </div>
            )}
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
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
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col">
            <p className="text-sm text-[#00ff66]/70 font-semibold uppercase tracking-wider mb-2">
              {product.brand}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mb-5">
              <p className="text-2xl font-bold text-white">
                {formatINR(product.price)}
              </p>
            </div>

            {/* Description */}
            <p className="text-base text-white/50 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Bullet Points */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">
                Product Details
              </h4>
              <ul className="space-y-2">
                {bulletPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-white/60">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#00ff66]/60 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.inStock ? (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-base text-emerald-400">In Stock</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-base text-red-400">Out of Stock</span>
                </>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Send Enquiry Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-base cursor-pointer gap-2"
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
