import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MessageCircle, Package, CheckCircle, XCircle } from "lucide-react";

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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#2b2a27] bg-[#0a0a0a] shadow-[0_15px_45px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 bg-[#111111] border border-[#2b2a27] text-[#999999] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden bg-[#0a0a0a]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
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
              <p className="text-2xl font-medium text-white">
                {formatINR(product.price)}
              </p>
            </div>

            <p className="text-sm text-[#999999] leading-relaxed mb-6">
              {product.description}
            </p>

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
              {product.inStock ? (
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
