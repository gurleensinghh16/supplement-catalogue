import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";

type Phase = "enter" | "glow" | "exit";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === "enter") {
      // grows from small to big, then trigger glow
      t = setTimeout(() => setPhase("glow"), 1000);
    }

    if (phase === "glow") {
      // shining effect holds briefly then exit
      t = setTimeout(() => setPhase("exit"), 800);
    }

    if (phase === "exit") {
      // fade out everything
      t = setTimeout(() => setVisible(false), 700);
    }

    return () => clearTimeout(t!);
  }, [phase, visible]);

  if (!visible) return null;

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 300;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Glow burst behind logo */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(194,32,47,0.6) 0%, rgba(194,32,47,0.2) 40%, transparent 70%)",
              top: centerY,
              left: centerX,
              x: "-50%",
              y: "-50%",
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={
              phase === "enter"
                ? { width: 0, height: 0, opacity: 0 }
                : phase === "glow"
                ? { width: 600, height: 600, opacity: 1 }
                : { width: 800, height: 800, opacity: 0 }
            }
            transition={
              phase === "glow"
                ? { duration: 0.5, ease: "easeOut" }
                : { duration: 0.6, ease: "easeIn" }
            }
          />

          {/* Shine sweep — diagonal light ray across the logo */}
          <motion.div
            className="pointer-events-none absolute z-10"
            style={{
              top: centerY,
              left: centerX,
              x: "-50%",
              y: "-50%",
              width: 340,
              height: 340,
              overflow: "hidden",
              borderRadius: 8,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "glow" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "60%",
                height: "200%",
                background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)",
                transform: "skewX(-15deg)",
              }}
              initial={{ x: "-100%" }}
              animate={phase === "glow" ? { x: "300%" } : { x: "-100%" }}
              transition={{ duration: 0.7, ease: "easeInOut", delay: 0.1 }}
            />
          </motion.div>

          {/* Logo — grows from small to large */}
          <div style={{ perspective: 900, position: "relative", zIndex: 20 }}>
            <motion.img
              src={`${BASE}Animation.png`}
              alt="TheDietStore"
              initial={{
                opacity: 0,
                scale: 0.15,
                filter: "brightness(1)",
              }}
              animate={
                phase === "enter"
                  ? {
                      opacity: 1,
                      scale: 1,
                      filter: "brightness(1)",
                    }
                  : phase === "glow"
                  ? {
                      opacity: 1,
                      scale: 1.08,
                      filter: "brightness(1.8) drop-shadow(0 0 30px rgba(194,32,47,0.9))",
                    }
                  : {
                      opacity: 0,
                      scale: 1.15,
                      filter: "brightness(2.5) drop-shadow(0 0 60px rgba(194,32,47,1))",
                    }
              }
              transition={
                phase === "enter"
                  ? {
                      opacity: { duration: 0.4 },
                      scale: { type: "spring", stiffness: 80, damping: 12 },
                    }
                  : phase === "glow"
                  ? { duration: 0.5, ease: "easeOut" }
                  : { duration: 0.6, ease: "easeIn" }
              }
              style={{ width: 300, height: "auto", display: "block" }}
            />
          </div>

          {/* Tagline */}
          <motion.p
            className="absolute font-['Orbitron'] text-xs sm:text-sm tracking-[0.5em] uppercase text-[#c2202f]/70"
            style={{ top: centerY + 180, left: centerX, transform: "translateX(-50%)", whiteSpace: "nowrap" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === "enter" ? 1 : phase === "glow" ? 1 : 0,
              y: phase === "enter" ? 0 : phase === "glow" ? 0 : 10,
            }}
            transition={{ duration: 0.4, delay: phase === "enter" ? 0.4 : 0 }}
          >
            Premium Supplements
          </motion.p>

          {/* Particle sparks during glow */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute rounded-full bg-[#c2202f]"
              style={{
                width: 4,
                height: 4,
                top: centerY,
                left: centerX,
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={
                phase === "glow"
                  ? {
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i / 8) * Math.PI * 2) * (80 + Math.random() * 60),
                      y: Math.sin((i / 8) * Math.PI * 2) * (80 + Math.random() * 60),
                    }
                  : { opacity: 0 }
              }
              transition={{
                duration: 0.7,
                delay: i * 0.04,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}