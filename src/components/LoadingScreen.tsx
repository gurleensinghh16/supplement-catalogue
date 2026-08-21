import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"glitch" | "reveal" | "exit">("glitch");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1200);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => setVisible(false), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 scanlines opacity-20" />

          {/* Flicker / noise background */}
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03]" />

          {/* Main glitch text */}
          <div className="relative">
            {/* Base text */}
            <h1
              className={`glitch-text text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.2em] uppercase text-white ${
                phase === "glitch" ? "animate-glitch" : ""
              }`}
              data-text="THE DIET STORE"
            >
              THE DIET STORE
            </h1>

            {/* Glitch copies */}
            {phase === "glitch" && (
              <>
                <h1
                  className="glitch-text glitch-copy-1 absolute inset-0 text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.2em] uppercase text-[#c3f73a]"
                  aria-hidden="true"
                >
                  THE DIET STORE
                </h1>
                <h1
                  className="glitch-text glitch-copy-2 absolute inset-0 text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.2em] uppercase text-[#ff3366]"
                  aria-hidden="true"
                >
                  THE DIET STORE
                </h1>
              </>
            )}

            {/* Underline bar */}
            <motion.div
              className="mt-4 h-1 bg-[#c3f73a] mx-auto"
              initial={{ width: 0 }}
              animate={{
                width: phase === "exit" ? "100%" : phase === "reveal" ? "100%" : "60%",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Tagline */}
            <motion.p
              className="mt-4 text-xs sm:text-sm tracking-[0.5em] uppercase text-[#c3f73a]/60 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase !== "glitch" ? 1 : 0, y: phase !== "glitch" ? 0 : 10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Premium Supplements
            </motion.p>
          </div>

          {/* Skip button */}
          <button
            onClick={() => {
              setPhase("exit");
              setTimeout(() => setVisible(false), 400);
            }}
            className="absolute bottom-8 right-8 text-sm text-white/30 hover:text-white/60 transition-colors tracking-wider uppercase"
          >
            Skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
