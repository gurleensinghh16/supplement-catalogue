import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SeedProducts({ children }: { children: React.ReactNode }) {
  const seed = useMutation(api.products.seed);
  const products = useQuery(api.products.list, {});
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (products === undefined) return; // still loading
    if (products.length === 0) {
      // DB is empty — seed default products
      seed().then(() => setSeeded(true)).catch(() => setSeeded(true));
    } else {
      // DB already has products — use them as-is, do NOT delete/reseed
      setSeeded(true);
    }
  }, [products, seed]);

  // Expose seed/reseed globally for admin use
  (window as any).__reseed = seed;

  if (!seeded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 border border-[#c2202f]/10" />
            <div className="absolute inset-0 border border-transparent border-t-[#c2202f] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-[#c2202f]/10 flex items-center justify-center animate-pulse">
                <div className="h-3 w-3 bg-[#c2202f]" />
              </div>
            </div>
          </div>
          <div className="text-[#999999] text-sm font-medium tracking-wider uppercase">
            Loading catalogue
          </div>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="h-1.5 w-1.5 bg-[#c2202f] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 bg-[#c2202f] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 bg-[#c2202f] animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
