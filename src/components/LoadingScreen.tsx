import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";

type Target = { x: number; y: number; width: number };
type Phase = "enter" | "flip" | "move" | "landed" | "exit";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("enter");
  const [target, setTarget] = useState<Target | null>(null);
  const attemptsRef = useRef(0);

  // Phase transitions
  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === "enter") {
      // Grow big, then start flipping
      t = setTimeout(() => setPhase("flip"),1200);
    }

    if (phase === "flip") {
      // After flips complete, find target and fly
      t = setTimeout(() => {
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
            attemptsRef.current++;
            requestAnimationFrame(findTarget);
          } else {
            setPhase("exit");
          }
        };
        findTarget();
      }, 1400); // wait for flips to finish (3 flips × ~400ms + buffer)
    }

    if (phase === "move")   t = setTimeout(() => setPhase("landed"), 700);
    if (phase === "landed") t = setTimeout(() => setPhase("exit"),   180);
    if (phase === "exit")   t = setTimeout(() => setVisible(false),  600);

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
          

          {/* Ground shadow */}
          <motion.div
            className="pointer-events-none absolute rounded-full bg-black blur-md"
            style={{ width: 130, height: 18, top: centerY + 175, left: centerX, x: "-50%" }}
            animate={{
              opacity: phase === "enter" || phase === "flip" ? 0.5 : 0,
              scaleX:  phase === "enter" || phase === "flip" ? 1 : 0.4,
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Logo */}
          <div style={{ perspective: 900, position: "fixed", inset: 0, pointerEvents: "none" }}>
            <motion.img
              src={`${BASE}logoo.png`}
              alt="TheDietStore"
              style={{ position: "absolute" }}

             initial={{
  opacity: 0,
  scale: 0.8,
  rotateY: 0,
  top: centerY,
  left: typeof window !== "undefined" ? window.innerWidth + 200 : 1400,
  x: "-50%",
  y: "-50%",
  width: 80,
}}

              animate={
                phase === "enter"
                  ? {
                      // Grows from small to big
                      opacity: 1,
                      scale: 1,
                      rotateY: 0,
                      top: centerY,
                      left: centerX,
                      x: "-50%",
                      y: "-50%",
                      width: 340,
                    }
                  : phase === "flip"
                  ? {
                      // Stays big, flips 2-3 times (rotateY cycles)
                      opacity: 1,
                      scale: [1, 1.06, 1],
                      rotateY: 0,
                      top: centerY,
                      left: centerX,
                      x: "-50%",
                      y: "-50%",
                      width: 340,
                    }
                  : flying && target
                  ? {
                      // Flies to nav logo position
                      opacity: phase === "exit" ? 0 : 1,
                      scale: phase === "landed" ? 1.12 : 1,
                      rotateY: phase === "move" ? [0, 360, 720] : 0,  // flips 2x while flying
                      top: target.y,
                      left: target.x,
                      x: "-50%",
                      y: "-50%",
                      width: target.width,
                    }
                  : { opacity: 1 }
              }

              transition={
              phase === "enter"
? {
    opacity: { duration: 0.3 },
    left: { type: "spring", stiffness: 80, damping: 15 },  // slides in
    scale: { type: "spring", stiffness: 100, damping: 12 },
    width: { type: "spring", stiffness: 100, damping: 12 },
  }

                  : phase === "flip"
                  ? {
                      rotateY: {
                        duration: 1.4,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                      },
                      scale: {
                        duration: 1.4,
                        ease: "easeInOut",
                      },
                    }
                  : phase === "landed"
  ? { duration: 0.15, ease: "easeOut" }
  : phase === "move"
  ? {
      duration: 0.65,
      ease: [0.65, 0, 0.35, 1],
      rotateY: {
        duration: 0.65,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    }
  : { duration: 0.65, ease: [0.65, 0, 0.35, 1] }
              }
            />
          </div>

          {/* Tagline — visible during enter + flip, fades on move */}
          <motion.p
            className="absolute font-['Orbitron'] text-xs sm:text-sm tracking-[0.5em] uppercase text-[#c2202f]/70"
            style={{ top: centerY + 190, left: centerX, transform: "translateX(-50%)", whiteSpace: "nowrap" }}
            animate={{
              opacity: phase === "enter" || phase === "flip" ? 1 : 0,
              y:       phase === "enter" || phase === "flip" ? 0 : 10,
            }}
            transition={{ duration: 0.4 }}
          >
            Premium Supplements
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}