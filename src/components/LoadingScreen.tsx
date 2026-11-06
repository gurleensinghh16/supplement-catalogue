import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";
const LOGO_SRC = `${BASE}imagecom.png`;

type Phase = "flip" | "glow1" | "glowoff" | "glow2" | "shatter" | "exit";

type Particle = {
  col: number;
  row: number;
  cx: number; // tile centre relative to the logo box (px)
  cy: number;
  endX: number;
  endY: number;
  rotate: number; // degrees
  delay: number; // seconds
  scaleEnd: number;
};

// Shatter timing (seconds), same as the old CSS transitions
const SHATTER_DURATION = 0.7;
const MAX_DELAY = 0.12;

// Static filter: rasterised once, only its opacity is animated
const GLOW_FILTER =
  "brightness(1.2) drop-shadow(0 0 18px rgba(255,255,255,0.55)) drop-shadow(0 0 40px rgba(255,255,255,0.35))";

function getConfig() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const nav =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { deviceMemory?: number })
      : undefined;
  const lowEnd = (nav?.hardwareConcurrency ?? 8) <= 4 || (nav?.deviceMemory ?? 8) <= 2;

  const grid = isMobile ? (lowEnd ? 7 : 9) : 22;
  const logoSize = isMobile ? 180 : 280;
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

  return { grid, logoSize, tileSize: logoSize / grid, dpr };
}

// Same maths as CSS cubic-bezier()
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-4) break;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sampleY(Math.min(Math.max(t, 0), 1));
  };
}

const easeMove = cubicBezier(0.2, 0, 0.6, 1);
const easeFade = cubicBezier(0, 0, 0.58, 1); // CSS "ease-out"

// Draw the logo once, then cut it into round dots with a single mask pass.
// This replaces hundreds of canvases + data URLs.
function buildSprites(img: HTMLImageElement, grid: number, logoSize: number, dpr: number) {
  const px = Math.round(logoSize * dpr);
  const tilePx = px / grid;

  const sheet = document.createElement("canvas");
  sheet.width = px;
  sheet.height = px;
  const ctx = sheet.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, px, px);

  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  const r = tilePx * 0.36;
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const x = (col + 0.5) * tilePx;
      const y = (row + 0.5) * tilePx;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  return sheet;
}

function buildParticles(grid: number, tileSize: number): Particle[] {
  const list: Particle[] = [];
  const maxDist = Math.sqrt(grid * grid + grid * grid) / 2;

  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const dx = col - grid / 2 + 0.5;
      const dy = row - grid / 2 + 0.5;
      const dist = Math.hypot(dx, dy) || 1;
      const nd = dist / maxDist;
      const speed = 120 + nd * 350;

      list.push({
        col,
        row,
        cx: col * tileSize + tileSize / 2,
        cy: row * tileSize + tileSize / 2,
        endX: (dx / dist) * speed * (0.8 + Math.random() * 0.4),
        endY: (dy / dist) * speed * (0.8 + Math.random() * 0.4),
        rotate: (Math.random() - 0.5) * 480,
        delay: nd * MAX_DELAY,
        scaleEnd: 1.5 + nd * 1.5,
      });
    }
  }
  return list;
}

export function LoadingScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("flip");
  const [{ grid, logoSize, tileSize, dpr }] = useState(getConfig);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[] | null>(null);
  const rafRef = useRef(0);

  const isShattering = phase === "shatter" || phase === "exit";
  const isGlowing = phase === "glow1" || phase === "glow2";

  // Phase timeline
  useEffect(() => {
    if (!visible || reduceMotion) return;
    let t: ReturnType<typeof setTimeout> | undefined;

    if (phase === "flip") t = setTimeout(() => setPhase("glow1"), 2800);
    if (phase === "glow1") t = setTimeout(() => setPhase("glowoff"), 300);
    if (phase === "glowoff") t = setTimeout(() => setPhase("glow2"), 250);
    if (phase === "glow2") t = setTimeout(() => setPhase("shatter"), 80);
    if (phase === "shatter") t = setTimeout(() => setPhase("exit"), 900);
    if (phase === "exit") t = setTimeout(() => setVisible(false), 700);

    return () => {
      if (t) clearTimeout(t);
    };
  }, [phase, visible, reduceMotion]);

  // Prepare the sprite sheet while the browser is idle (during the flip)
  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;

    const img = new Image();
    img.decoding = "async";
    img.src = LOGO_SRC;

    const prepare = () => {
      if (cancelled || spriteRef.current) return;
      spriteRef.current = buildSprites(img, grid, logoSize, dpr);
      particlesRef.current = buildParticles(grid, tileSize);
    };

    const schedule = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(prepare, { timeout: 1500 });
      } else {
        setTimeout(prepare, 300); // Safari
      }
    };

    if (img.complete && img.naturalWidth > 0) schedule();
    else img.onload = schedule;

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [reduceMotion, grid, logoSize, tileSize, dpr]);

  // Shatter: one canvas, one requestAnimationFrame loop
  useLayoutEffect(() => {
    if (!isShattering) return;

    const canvas = canvasRef.current;
    const sprite = spriteRef.current;
    const particles = particlesRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !sprite || !particles) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const originX = w / 2 - logoSize / 2;
    const originY = h / 2 - logoSize / 2;
    const tilePx = sprite.width / grid;
    const half = tileSize / 2;
    const total = SHATTER_DURATION + MAX_DELAY;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (t >= total) return;

      for (const p of particles) {
        const local = Math.min(Math.max((t - p.delay) / SHATTER_DURATION, 0), 1);
        const move = easeMove(local);
        const alpha = 1 - easeFade(local);
        if (alpha <= 0.01) continue;

        const scale = 1 + (p.scaleEnd - 1) * move;
        const angle = (p.rotate * move * Math.PI) / 180;
        const cos = Math.cos(angle) * scale * dpr;
        const sin = Math.sin(angle) * scale * dpr;

        ctx.setTransform(
          cos,
          sin,
          -sin,
          cos,
          (originX + p.cx + p.endX * move) * dpr,
          (originY + p.cy + p.endY * move) * dpr
        );
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprite,
          p.col * tilePx,
          p.row * tilePx,
          tilePx,
          tilePx,
          -half,
          -half,
          tileSize,
          tileSize
        );
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw(start); // first frame before paint, so there is no blank flash
    return () => cancelAnimationFrame(rafRef.current);
  }, [isShattering, grid, logoSize, tileSize, dpr]);

  if (!visible || reduceMotion) return null;

  const glowOpacity = phase === "glow1" ? 0.6 : phase === "glow2" ? 1 : 0;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Shatter layer: a single canvas instead of hundreds of DOM tiles */}
      {isShattering && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
      )}

      {/* Logo: flips to 180°, glows twice, then shatters */}
      {!isShattering && (
        <div style={{ perspective: 800 }}>
          <motion.div
            style={{
              position: "relative",
              width: logoSize,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
            initial={{ opacity: 0, scale: 0.05, rotateY: 0 }}
            animate={
              phase === "flip"
                ? { opacity: 1, scale: 1, rotateY: 180 }
                : phase === "glow1"
                ? { opacity: 1, scale: 1.08, rotateY: 180 }
                : phase === "glowoff"
                ? { opacity: 1, scale: 1, rotateY: 180 }
                : phase === "glow2"
                ? { opacity: 1, scale: 1.15, rotateY: 180 }
                : { opacity: 0, scale: 1.3, rotateY: 180 }
            }
            transition={
              phase === "flip"
                ? {
                    opacity: { duration: 0.5, ease: "easeOut" },
                    scale: { duration: 2.6, ease: [0.16, 1, 0.3, 1] },
                    rotateY: { duration: 2.6, ease: [0.25, 0.1, 0.25, 1] },
                  }
                : { duration: 0.25, ease: "easeOut" }
            }
          >
            {/* Front face: sets the box size, visible for the first half of the flip */}
            <img
              src={LOGO_SRC}
              alt="TheDietStore"
              decoding="async"
              className="max-w-[70vw]"
              style={{
                position: "relative",
                zIndex: 20,
                width: "100%",
                display: "block",
                backfaceVisibility: "hidden",
              }}
            />

            {/* Back face: lands facing forward, right-side-up, after the flip */}
            <img
              src={LOGO_SRC}
              alt=""
              aria-hidden
              decoding="async"
              className="max-w-[70vw]"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 20,
                width: "100%",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            />

            {/* Glow: pre-filtered overlay, only its opacity animates (no per-frame repaint) */}
            <motion.img
              src={LOGO_SRC}
              alt=""
              aria-hidden
              className="max-w-[70vw]"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 21,
                width: "100%",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                filter: GLOW_FILTER,
                pointerEvents: "none",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: glowOpacity }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      )}

      {/* Tagline */}
      <motion.p
        className="absolute font-['Orbitron'] text-[11px] xs:text-xs sm:text-base tracking-[0.3em] sm:tracking-[0.5em] uppercase px-4 text-center"
        style={{
          bottom: `calc(50% - ${logoSize / 2 + 28}px)`,
          left: 0,
          right: 0,
          width: "100%",
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: phase === "flip" || isGlowing ? 1 : 0,
          y: phase === "flip" || isGlowing ? 0 : 8,
          color: isGlowing ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
        }}
        transition={{ duration: 0.3, delay: phase === "flip" ? 0.6 : 0 }}
      >
        Premium Supplements
      </motion.p>
    </motion.div>
  );
}