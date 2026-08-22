import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";

type Target = { x: number; y: number; width: number };

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"flip" | "move" | "done">("flip");
  const [target, setTarget] = useState<Target | null>(null);

  // Phase 1: hold the flip-in for a moment, then locate the real nav logo
  useEffect(() => {
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
          // Nav logo never appeared in time — just fade out instead of hanging
          setPhase("done");
        }
      };
      findTarget();
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  // Phase 2 -> 3: after the fly-to-target animation finishes, fade the whole overlay out
  useEffect(() => {
    if (phase === "move") {
      const t = setTimeout(() => setPhase("done"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "done") {
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.img
            src={`${BASE}logoo.png`}
            alt="TheDietStore"
            style={{ position: "fixed", perspective: 800 }}
            initial={{
              opacity: 0,
              rotateY: -100,
              top: centerY,
              left: centerX,
              x: "-50%",
              y: "-50%",
              width: 160,
            }}
            animate={
              phase === "flip"
                ? {
                    opacity: 1,
                    rotateY: 0,
                    top: centerY,
                    left: centerX,
                    x: "-50%",
                    y: "-50%",
                    width: 160,
                  }
                : target
                ? {
                    opacity: 1,
                    rotateY: 0,
                    top: target.y,
                    left: target.x,
                    x: "-50%",
                    y: "-50%",
                    width: target.width,
                  }
                : { opacity: 0 }
            }
            transition={
              phase === "flip"
                ? { duration: 0.9, ease: "easeOut" }
                : { duration: 0.7, ease: [0.65, 0, 0.35, 1] }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}