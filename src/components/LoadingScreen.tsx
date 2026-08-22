import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"reveal" | "exit">("reveal");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 1800);
    const t2 = setTimeout(() => setVisible(false), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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
              <motion.h1
                className="font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-white leading-none"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              >
                THE
              </motion.h1>
            </div>

            {/* Line 2: DIET */}
            <div className="relative overflow-hidden">
              <motion.h1
                className="font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase leading-none"
                style={{ color: "#c2202f" }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              >
                DIET
              </motion.h1>
            </div>

            {/* Line 3: STORE */}
            <div className="relative overflow-hidden">
              <motion.h1
                className="font-['Orbitron'] text-6xl sm:text-8xl md:text-[10rem] font-normal tracking-[0.15em] uppercase text-white leading-none"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              >
                STORE
              </motion.h1>
            </div>

            {/* Underline bar */}
            <motion.div
              className="mt-6 h-1.5 bg-gradient-to-r from-transparent via-[#c2202f] to-transparent"
              initial={{ width: 0 }}
                            animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Tagline */}
            <motion.p
              className="mt-4 font-['Orbitron'] text-sm sm:text-base md:text-lg tracking-[0.6em] uppercase font-normal"
              style={{ color: "rgba(194, 32, 47, 0.5)" }}
              initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
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
