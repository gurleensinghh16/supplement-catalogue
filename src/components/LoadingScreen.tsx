import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";
const SESSION_KEY = "tds_loading_played";

type Target = { x: number; y: number; width: number };
type Phase = "enter" | "move" | "landed" | "exit";

export function LoadingScreen() {
  const alreadyPlayed =
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

  const [visible, setVisible] = useState(!alreadyPlayed);
  const [phase, setPhase] = useState<Phase>("enter");
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    if (!alreadyPlayed) sessionStorage.setItem(SESSION_KEY, "1");
  }, [alreadyPlayed]);

  // Short hold on the big centered flip, then locate the real nav logo and fly to it
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      let attempts = 0;
      const findTarget = () => {
        const el = document.getElementById("site-logo");
        if (el) {
          const rect = el.getBoundingClientRect();
          setTarget({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
          });
          setPhase("move");
        } else if (attempts < 60) {
          attempts++;
          requestAnimationFrame(findTarget);
        } else {
          setPhase("exit");
        }
      };
      findTarget();
    }, 500);
    return () => clearTimeout(t);
  }, [visible]);

  // move -> landed (snap pulse) -> exit (fade out), overlapping the fade with the pulse
  useEffect(() => {
    if (phase === "move") {
      const t = setTimeout(() => setPhase("landed"), 650);
      return () => clearTimeout(t);
    }
    if (phase === "landed") {
      const t = setTimeout(() => setPhase("exit"), 150);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (alreadyPlayed) return null;

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

  const flying = phase === "move" || phase === "landed" || phase === "exit";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Ambient brand glow behind the logo while centered */}
          <motion.div
            className="pointer-events-none absolute rounded-full bg-[#c2202f]/10 blur-[100px]"
            style={{ width: 420, height: 420, top: centerY - 210, left: centerX - 210 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "enter" ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Soft ground shadow under the logo while centered — gives it weight */}
          <motion.div
            className="pointer-events-none absolute rounded-full bg-black blur-md"
            style={{ width: 130, height: 18, top: centerY + 95, left: centerX, x: "-50%" }}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{
              opacity: phase === "enter" ? 0.55 : 0,
              scaleX: phase === "enter" ? 1 : 0.4,
            }}
            transition={{ duration: 0.5 }}
          />

          <motion.img
            src={`${BASE}logoo.png`}
            alt="TheDietStore"
            style={{ position: "fixed", perspective: 800 }}
            initial={{
              opacity: 0,
              rotateY: -120,
              scale: 1,
              top: centerY,
              left: centerX,
              x: "-50%",
              y: "-50%",
              width: 90,
            }}
            animate={
              !flying
                ? {
                    opacity: 1,
                    rotateY: 0,
                    scale: 1,
                    top: centerY,
                    left: centerX,
                    x: "-50%",
                    y: "-50%",
                    width: 260, // grows big on first appearance
                  }
                : target
                ? {
                    opacity: 1,
                    rotateY: 0,
                    scale: phase === "landed" ? 1.12 : 1, // snap pulse on arrival
                    top: target.y,
                    left: target.x,
                    x: "-50%",
                    y: "-50%",
                    width: target.width, // shrinks down to real nav logo size
                  }
                : { opacity: 0 }
            }
            transition={
              !flying
                ? {
                    rotateY: { type: "spring", stiffness: 120, damping: 14 },
                    width: { type: "spring", stiffness: 120, damping: 14 },
                    opacity: { duration: 0.3 },
                  }
                : phase === "landed"
                ? { duration: 0.15, ease: "easeOut" }
                : { duration: 0.65, ease: [0.65, 0, 0.35, 1] }
            }
          />

          {/* Tagline — fades in with the big centered logo, fades out as it flies */}
          <motion.p
            className="absolute font-['Orbitron'] text-xs sm:text-sm tracking-[0.5em] uppercase text-[#c2202f]/60"
            style={{ top: centerY + 130, left: centerX, transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === "enter" ? 1 : 0,
              y: phase === "enter" ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Premium Supplements
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}