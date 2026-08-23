import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";

type Phase = "grow" | "glow1" | "glowoff" | "glow2" | "shatter" | "exit";

type Tile = {
  id: number;
  canvas: HTMLCanvasElement;
  x: number;      // grid position x
  y: number;      // grid position y
  vx: number;     // velocity x (fly direction)
  vy: number;     // velocity y (fly direction)
  rotate: number; // random spin
};

const COLS = 18;
const ROWS = 18;
const LOGO_SIZE = 300;
const TILE_W = LOGO_SIZE / COLS;
const TILE_H = LOGO_SIZE / ROWS;

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("grow");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === "grow")    t = setTimeout(() => setPhase("glow1"),   2600);
    if (phase === "glow1")   t = setTimeout(() => setPhase("glowoff"), 300);
    if (phase === "glowoff") t = setTimeout(() => setPhase("glow2"),   250);
    if (phase === "glow2")   t = setTimeout(() => setPhase("shatter"), 350);
    if (phase === "shatter") t = setTimeout(() => setPhase("exit"),    600);
    if (phase === "exit")    t = setTimeout(() => setVisible(false),   600);

    return () => clearTimeout(t!);
  }, [phase, visible]);

  // When shatter begins — slice the logo into canvas tiles
  useEffect(() => {
    if (phase !== "shatter") return;
    const img = imgRef.current;
    if (!img) return;
console.log("img complete:", img.complete, "naturalWidth:", img.naturalWidth); // ← ADD HERE
    const generate = () => {
  const generated: Tile[] = [];

  // Use actual image natural dimensions as source
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  const srcTileW = natW / COLS;
  const srcTileH = natH / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = TILE_W;
      tileCanvas.height = TILE_H;
      const ctx = tileCanvas.getContext("2d");
      if (!ctx) continue;

      ctx.drawImage(
        img,
        col * srcTileW,   // source x — based on natural size
        row * srcTileH,   // source y — based on natural size
        srcTileW,         // source width
        srcTileH,         // source height
        0,                // dest x
        0,                // dest y
        TILE_W,           // dest width — scaled to display size
        TILE_H            // dest height — scaled to display size
      );

        // Direction from center — tiles fly outward
        const cx = col - COLS / 2 + 0.5;
        const cy = row - ROWS / 2 + 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy) || 1;

        generated.push({
          id: row * COLS + col,
          canvas: tileCanvas,
          x: col * TILE_W,
          y: row * TILE_H,
          vx: (cx / dist) * (300 + Math.random() * 600),
vy: (cy / dist) * (300 + Math.random() * 600),
          rotate: Math.random() * 720 - 360,
        });
      }
      
    }

     setTiles(generated);
  };

  // Wait for image to load if not already
  if (img.complete && img.naturalWidth > 0) {
    generate();
  } else {
    img.onload = generate;
  }
}, [phase]);

  if (!visible) return null;

  const isGlowing = phase === "glow1" || phase === "glow2";
  const isShattering = phase === "shatter" || phase === "exit";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Canvas tiles — shatter effect */}
          {isShattering && tiles.map((tile) => (
            <motion.canvas
  key={tile.id}
  ref={(el) => {
    if (el) {
      const ctx = el.getContext("2d");
      if (ctx) {
        el.width = TILE_W;
        el.height = TILE_H;
        // Draw circle clip so tile appears as circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(TILE_W / 2, TILE_H / 2, Math.min(TILE_W, TILE_H) / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(tile.canvas, 0, 0);
        ctx.restore();
      }
    }
  }}
  style={{
    position: "absolute",
    left: `calc(50% - ${LOGO_SIZE / 2}px + ${tile.x}px)`,
    top: `calc(50% - ${LOGO_SIZE / 2}px + ${tile.y}px)`,
    width: TILE_W,
    height: TILE_H,
    borderRadius: "50%",   // makes canvas element circular
    imageRendering: "pixelated",
  }}
  initial={{
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
  }}
  animate={{
    x: tile.vx,
    y: tile.vy,
    opacity: 0,
    scale: 1.5,            // less scale so circles stay small
    rotate: tile.rotate,
  }}
  transition={{
    duration: 0.4,         // fast — was 0.8
    delay: Math.random() * 0.05,  // tiny delay variation
    ease: [0.2, 0, 1, 0.8],      // fast start, eases at end
  }}
/>
          ))}

          {/* Hidden img used as canvas source */}
          <img
            ref={imgRef}
            src={`${BASE}logo_1.png`}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              width: LOGO_SIZE,
              height: LOGO_SIZE,
            }}
          />

          {/* Visible logo — hidden during shatter (tiles take over) */}
          {!isShattering && (
            <div style={{ perspective: 1000 }}>
              <motion.img
                src={`${BASE}logo_1.png`}
                alt="TheDietStore"
                style={{ position: "relative", zIndex: 20, width: LOGO_SIZE }}
                initial={{
                  opacity: 0,
                  scale: 0.02,
                  rotateY: 0,
                  filter: "brightness(1) drop-shadow(0 0 0px transparent)",
                }}
                animate={
                  phase === "grow"
                    ? {
                        opacity: 1,
                        scale: 1,
                        rotateY: 180, // one clean flip
                        filter: "brightness(1) drop-shadow(0 0 0px transparent)",
                      }
                    : phase === "glow1"
                    ? {
                        opacity: 1,
                        scale: 1.05,
                        rotateY: 180,
                        filter: "brightness(1.4) drop-shadow(0 0 15px rgba(255,255,255,0.6)) drop-shadow(0 0 30px rgba(255,255,255,0.3))",
                      }
                    : phase === "glowoff"
                    ? {
                        opacity: 1,
                        scale: 1,
                        rotateY: 180,
                        filter: "brightness(1) drop-shadow(0 0 0px transparent)",
                      }
                    : phase === "glow2"
                    ? {
                        opacity: 1,
                        scale: 1.1,
                        rotateY: 180,
                        filter:
"brightness(1.8) drop-shadow(0 0 40px rgba(255,255,255,0.8)) drop-shadow(0 0 70px rgba(255,255,255,0.4))",
                      }
                    : {
                        opacity: 0,
                        scale: 1,
                        rotateY: 180,
                        filter: "brightness(1)",
                      }
                }
                transition={
                  phase === "grow"
                    ? {
                        opacity: { duration: 0.4 },
                        scale: {
                          duration: 2.4,
                          ease: [0.08, 0.5, 0.3, 1],
                        },
                        rotateY: {
                          duration: 2.4,
                          ease: [0.1, 0, 0.9, 1], // slow start slow end
                        },
                      }
                    : phase === "glow1" || phase === "glow2"
                    ? { duration: 0.2, ease: "easeOut" }
                    : phase === "glowoff"
                    ? { duration: 0.2, ease: "easeIn" }
                    : { duration: 0.3 }
                }
              />
            </div>
          )}

          {/* Tagline */}
          <motion.p
            className="absolute font-['Orbitron'] text-xs sm:text-sm tracking-[0.5em] uppercase"
            style={{
              bottom: "calc(50% - 190px)",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity:
                phase === "grow" ? 1
                : isGlowing ? 1
                : 0,
              y: phase === "grow" || isGlowing ? 0 : 8,
              color: isGlowing
                ? "rgba(255,255,255,1)"
                : "rgba(255,255,255,0.5)",
            }}
            transition={{ duration: 0.3, delay: phase === "grow" ? 0.5 : 0 }}
          >
            Premium Supplements
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}