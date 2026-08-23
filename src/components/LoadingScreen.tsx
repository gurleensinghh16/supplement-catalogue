import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";

type Phase = "grow" | "glow" | "exit";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("grow");

  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === "grow") t = setTimeout(() => setPhase("glow"), 1400);
    if (phase === "glow") t = setTimeout(() => setPhase("exit"), 900);
    if (phase === "exit") t = setTimeout(() => setVisible(false), 700);

    return () => clearTimeout(t!);
  }, [phase, visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Shine sweep over logo during glow */}
          <motion.div
            className="pointer-events-none absolute z-30"
            style={{
              width: 300,
              height: 300,
              overflow: "hidden",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "glow" ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: "-50%",
                left: 0,
                width: "55%",
                height: "200%",
                background:
                  "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)",
                transform: "skewX(-15deg)",
              }}
              initial={{ x: "-100%" }}
              animate={phase === "glow" ? { x: "400%" } : { x: "-100%" }}
              transition={{ duration: 0.7, ease: "easeInOut", delay: 0.05 }}
            />
          </motion.div>

          {/* Logo */}
          <motion.img
            src={`${BASE}Animation.png`}
            alt="TheDietStore"
            style={{ position: "relative", zIndex: 20 }}
            initial={{
              opacity: 0,
              scale: 0.05,
              rotateY: 0,
              filter: "brightness(1) drop-shadow(0 0 0px transparent)",
            }}
            animate={
              phase === "grow"
                ? {
                    opacity: 1,
                    scale: 1,
                    rotateY: [0, 180, 360, 540, 720], // flips while growing
                    filter: "brightness(1) drop-shadow(0 0 0px transparent)",
                    width: 300,
                  }
                : phase === "glow"
                ? {
                    opacity: 1,
                    scale: 1.1,
                    rotateY: 720,
                    filter:
                      "brightness(2) drop-shadow(0 0 25px rgba(255,255,255,0.9)) drop-shadow(0 0 50px rgba(255,255,255,0.5))",
                    width: 300,
                  }
                : {
                    opacity: 0,
                    scale: 1.2,
                    rotateY: 720,
                    filter: "brightness(3) drop-shadow(0 0 80px rgba(255,255,255,1))",
                    width: 300,
                  }
            }
            transition={
              phase === "grow"
                ? {
                    opacity: { duration: 0.3 },
                    scale: {
                      duration: 1.3,
                      ease: [0.16, 1, 0.3, 1], // fast start, eases into full size
                    },
                    rotateY: {
                      duration: 1.3,
                      ease: "easeInOut",
                      times: [0, 0.25, 0.5, 0.75, 1],
                    },
                  }
                : phase === "glow"
                ? {
                    duration: 0.5,
                    ease: "easeOut",
                    filter: { duration: 0.4 },
                  }
                : {
                    duration: 0.6,
                    ease: "easeIn",
                  }
            }
          />

          {/* Tagline */}
          <motion.p
            className="absolute font-['Orbitron'] text-xs sm:text-sm tracking-[0.5em] uppercase"
            style={{
              bottom: "calc(50% - 190px)",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              color: "rgba(255,255,255,0.5)",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: phase === "grow" ? 1 : phase === "glow" ? 1 : 0,
              y: phase === "grow" ? 0 : phase === "glow" ? 0 : 8,
              color:
                phase === "glow"
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.5)",
            }}
            transition={{ duration: 0.4, delay: phase === "grow" ? 0.5 : 0 }}
          >
            Premium Supplements
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}