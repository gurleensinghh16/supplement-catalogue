import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";
const SESSION_KEY = "tds_loading_played";

type Target = { x: number; y: number; width: number };
type Phase = "enter" | "move" | "landed" | "exit";

export function LoadingScreen() {
  const [visible, setVisible] = useState(() => {
    // Initialise state synchronously — avoids the stale closure bug
    if (typeof window === "undefined") return false;
    const played = sessionStorage.getItem(SESSION_KEY) === "1";
    if (!played) sessionStorage.setItem(SESSION_KEY, "1");
    return !played;
  });

  const [phase, setPhase] = useState<Phase>("enter");
  const [target, setTarget] = useState<Target | null>(null);
  const attemptsRef = useRef(0);

  // After a short hold, find the nav logo and fly to it
  useEffect(() => {
    if (!visible) return;

    const holdTimer = setTimeout(() => {
      attemptsRef.current = 0;

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
        } else if (attemptsRef.current < 120) {
          // doubled attempts — lazy routes take longer on GH Pages
          attemptsRef.current++;
          requestAnimationFrame(findTarget);
        } else {
          // logo never appeared — just exit gracefully
          setPhase("exit");
        }
      };

      findTarget();
    }, 800); // slightly longer hold so lazy Landing has time to mount

    return () => clearTimeout(holdTimer);
  }, [visible]);

  // Phase transitions
  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "move")   t = setTimeout(() => setPhase("landed"), 700);
    if (phase === "landed") t = setTimeout(() => setPhase("exit"),   180);
    if (phase === "exit")   t = setTimeout(() => setVisible(false),  350);
    return () => clearTimeout(t!);
  }, [phase, visible]);

  if (!visible) return null;

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 300;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;
  const flying = phase === "move" || phase === "landed" || phase === "exit";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Ambient glow */}
          <motion.div
            className="pointer-events-none absolute rounded-full bg-[#c2202f]/10 blur-[100px]"
            style={{ width: 420, height: 420, top: centerY - 210, left: centerX - 210 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "enter" ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Ground shadow */}
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

          {/* 
            FIX: Wrap in a div with perspective so rotateY actually works in 3D.
            The wrapper stays centered; the img animates position separately.
          */}
          <div style={{ perspective: 800, position: "fixed", inset: 0, pointerEvents: "none" }}>
            <motion.img
              src={`${BASE}logoo.png`}
              alt="TheDietStore"
              style={{ position: "absolute" }}
              initial={{
                opacity: 0,
                rotateY: -120,
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
                      top: centerY,
                      left: centerX,
                      x: "-50%",
                      y: "-50%",
                      width: 260,
                    }
                  : target
                  ? {
                      opacity: phase === "exit" ? 0 : 1, // FIX: fade out cleanly on exit
                      rotateY: 0,
                      scale: phase === "landed" ? 1.12 : 1,
                      top: target.y,
                      left: target.x,
                      x: "-50%",
                      y: "-50%",
                      width: target.width,
                    }
                  : { opacity: 1 } // FIX: don't flash invisible while target resolves
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
          </div>

          {/* Tagline */}
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