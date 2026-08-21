import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"glitch" | "reveal" | "exit">("glitch");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1400);
    const t2 = setTimeout(() => setPhase("exit"), 2600);
    const t3 = setTimeout(() => setVisible(false), 3400);
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
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #050e05 0%, #0a0a0a 40%, #060d06 100%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 scanlines opacity-15" />

          {/* Noise background */}
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04]" />

          {/* Ambient green glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c3f73a]/[0.04] blur-[120px]" />

          {/* Main glitch text container */}
          <div className="relative flex flex-col items-center gap-2 sm:gap-4">
            {/* Line 1: THE */}
            <div className="relative overflow-hidden">
              <h1
                className={`glitch-line text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-white leading-none ${
                  phase === "glitch" ? "animate-glitch" : ""
                }`}
                data-text="THE"
              >
                THE
              </h1>
              {phase === "glitch" && (
                <>
                  <span className="glitch-copy-1 absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-[#c3f73a] leading-none pointer-events-none" aria-hidden="true">THE</span>
                  <span className="glitch-copy-2 absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-[#39ff14] leading-none pointer-events-none" aria-hidden="true">THE</span>
                </>
              )}
            </div>

            {/* Line 2: DIET */}
            <div className="relative overflow-hidden">
              <h1
                className={`glitch-line text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase leading-none ${
                  phase === "glitch" ? "animate-glitch-delayed" : ""
                }`}
                style={{ color: "#c3f73a" }}
                data-text="DIET"
              >
                DIET
              </h1>
              {phase === "glitch" && (
                <>
                  <span className="glitch-copy-1 absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-white leading-none pointer-events-none" aria-hidden="true">DIET</span>
                  <span className="glitch-copy-2 absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-[#7fff00] leading-none pointer-events-none" aria-hidden="true">DIET</span>
                </>
              )}
            </div>

            {/* Line 3: STORE */}
            <div className="relative overflow-hidden">
              <h1
                className={`glitch-line text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-white leading-none ${
                  phase === "glitch" ? "animate-glitch" : ""
                }`}
                data-text="STORE"
              >
                STORE
              </h1>
              {phase === "glitch" && (
                <>
                  <span className="glitch-copy-1 absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-[#c3f73a] leading-none pointer-events-none" aria-hidden="true">STORE</span>
                  <span className="glitch-copy-2 absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] font-black tracking-[0.3em] uppercase text-[#39ff14] leading-none pointer-events-none" aria-hidden="true">STORE</span>
                </>
              )}
            </div>

            {/* Underline bar */}
            <motion.div
              className="mt-6 h-1.5 bg-gradient-to-r from-transparent via-[#c3f73a] to-transparent"
              initial={{ width: 0 }}
              animate={{
                width: phase === "exit" ? "100%" : phase === "reveal" ? "100%" : "40%",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Tagline */}
            <motion.p
              className="mt-4 text-sm sm:text-base md:text-lg tracking-[0.6em] uppercase font-medium"
              style={{ color: "rgba(195, 247, 58, 0.5)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase !== "glitch" ? 1 : 0, y: phase !== "glitch" ? 0 : 10 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Premium Supplements
            </motion.p>
          </div>

          {/* Skip button */}
          <button
            onClick={() => {
              setPhase("exit");
              setTimeout(() => setVisible(false), 500);
            }}
            className="absolute bottom-8 right-8 text-sm text-[#c3f73a]/30 hover:text-[#c3f73a]/70 transition-colors tracking-wider uppercase"
          >
            Skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
