import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SeedProducts({ children }: { children: React.ReactNode }) {
  const seed = useMutation(api.products.seed);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    seed()
      .then(() => setSeeded(true))
      .catch(() => setSeeded(true));
  }, [seed]);

  if (!seeded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-white/40 text-sm">
            Loading catalogue...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
