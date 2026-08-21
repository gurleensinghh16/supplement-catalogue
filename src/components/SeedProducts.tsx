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
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#00ff66]/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00ff66] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-[#00ff66]/10 flex items-center justify-center animate-pulse">
                <div className="h-3 w-3 rounded-sm bg-[#00ff66]" />
              </div>
            </div>
          </div>
          <div className="text-white/70 text-sm font-medium tracking-wide">
            Loading catalogue
          </div>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
