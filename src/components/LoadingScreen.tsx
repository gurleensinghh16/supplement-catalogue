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
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="pointer-events-none absolute inset-0 scanlines opacity-15" />
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c2202f]/[0.05] blur-[120px]" />

          <div className="relative flex flex-col items-center gap-2 sm:gap-4">
            {/* Line 1: THE */}
            <div className="relative overflow-hidden">
              <h1
                className={`glitch-line font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-white leading-none ${
                  phase === "glitch" ? "animate-glitch" : ""
                }`}
                data-text="THE"
              >
                THE
              </h1>
              {phase === "glitch" && (
                <>
                  <span className="glitch-copy-1 absolute inset-0 font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-[#c2202f] leading-none pointer-events-none" aria-hidden="true">THE</span>
                  <span className="glitch-copy-2 absolute inset-0 font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-[#de3746] leading-none pointer-events-none" aria-hidden="true">THE</span>
                </>
              )}
            </div>

            {/* Line 2: DIET */}
            <div className="relative overflow-hidden">
              <h1
                className={`glitch-line font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase leading-none ${
                  phase === "glitch" ? "animate-glitch-delayed" : ""
                }`}
                style={{ color: "#c2202f" }}
                data-text="DIET"
              >
                DIET
              </h1>
              {phase === "glitch" && (
                <>
                  <span className="glitch-copy-1 absolute inset-0 font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-white leading-none pointer-events-none" aria-hidden="true">DIET</span>
                  <span className="glitch-copy-2 absolute inset-0 font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-[#de3746] leading-none pointer-events-none" aria-hidden="true">DIET</span>
                </>
              )}
            </div>

            {/* Line 3: STORE */}
            <div className="relative overflow-hidden">
              <h1
                className={`glitch-line font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-white leading-none ${
                  phase === "glitch" ? "animate-glitch" : ""
                }`}
                data-text="STORE"
              >
                STORE
              </h1>
              {phase === "glitch" && (
                <>
                  <span className="glitch-copy-1 absolute inset-0 font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-[#c2202f] leading-none pointer-events-none" aria-hidden="true">STORE</span>
                  <span className="glitch-copy-2 absolute inset-0 font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-[#de3746] leading-none pointer-events-none" aria-hidden="true">STORE</span>
                </>
              )}
            </div>

            {/* Underline bar */}
            <motion.div
              className="mt-6 h-1.5 bg-gradient-to-r from-transparent via-[#c2202f] to-transparent"
              initial={{ width: 0 }}
              animate={{
                width: phase === "exit" ? "100%" : phase === "reveal" ? "100%" : "40%",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Tagline */}
            <motion.p
              className="mt-4 font-['Orbitron'] text-sm sm:text-base md:text-lg tracking-[0.6em] uppercase font-normal"
              style={{ color: "rgba(194, 32, 47, 0.5)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase !== "glitch" ? 1 : 0, y: phase !== "glitch" ? 0 : 10 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Premium Supplements
            </motion.p>
          </div>

          <button
            onClick={() => {
              setPhase("exit");
              setTimeout(() => setVisible(false), 500);
            }}
            className="absolute bottom-8 right-8 font-['Orbitron'] text-sm text-[#c2202f]/30 hover:text-[#c2202f]/70 transition-colors tracking-wider uppercase"
          >
            Skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
