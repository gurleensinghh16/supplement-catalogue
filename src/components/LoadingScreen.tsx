import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL || "/";

type Phase = "flip" | "glow1" | "glowoff" | "glow2" | "shatter" | "exit";

type Tile = {
  id: number;
  dataUrl: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotate: number;
  delay: number;
  scaleEnd: number;
};

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("flip");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const COLS = isMobile ? 8 : 12;
  const ROWS = isMobile ? 8 : 12;
  const LOGO_SIZE = isMobile ? 180 : 280;
  const TILE_SIZE = LOGO_SIZE / COLS;

  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === "flip") t = setTimeout(() => setPhase("glow1"), 2800);
    if (phase === "glow1") t = setTimeout(() => setPhase("glowoff"), 300);
    if (phase === "glowoff") t = setTimeout(() => setPhase("glow2"), 250);
    if (phase === "glow2") t = setTimeout(() => setPhase("shatter"), 400);
    if (phase === "shatter") t = setTimeout(() => setPhase("exit"), 900);
    if (phase === "exit") t = setTimeout(() => setVisible(false), 700);

    return () => clearTimeout(t!);
  }, [phase, visible]);

  const generateTiles = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const generate = () => {
      const generated: Tile[] = [];
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const srcTileW = natW / COLS;
      const srcTileH = natH / ROWS;
      const circleRadius = TILE_SIZE * 0.9;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const size = circleRadius * 2 + 4;
          const tileCanvas = document.createElement("canvas");
          tileCanvas.width = size;
          tileCanvas.height = size;
          const ctx = tileCanvas.getContext("2d");
          if (!ctx) continue;

          ctx.beginPath();
          ctx.arc(size / 2, size / 2, circleRadius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(
            img,
            col * srcTileW, row * srcTileH, srcTileW, srcTileH,
            0, 0, size, size
          );

          const startX = col * TILE_SIZE;
          const startY = row * TILE_SIZE;
          const cx = col - COLS / 2 + 0.5;
          const cy = row - ROWS / 2 + 0.5;
          const dist = Math.sqrt(cx * cx + cy * cy) || 1;
          const maxDist = Math.sqrt(COLS * COLS + ROWS * ROWS) / 2;
          const normalizedDist = dist / maxDist;
          const speed = 120 + normalizedDist * 350;

          generated.push({
            id: row * COLS + col,
            dataUrl: tileCanvas.toDataURL("image/webp", 0.8),
            startX, startY,
            endX: (cx / dist) * speed * (0.8 + Math.random() * 0.4),
            endY: (cy / dist) * speed * (0.8 + Math.random() * 0.4),
            rotate: (Math.random() - 0.5) * 480,
            delay: normalizedDist * 0.12,
            scaleEnd: 1.5 + normalizedDist * 1.5,
          });
        }
      }
      setTiles(generated);
    };

    if (img.complete && img.naturalWidth > 0) generate();
    else img.onload = generate;
  }, [COLS, ROWS, TILE_SIZE]);

  useEffect(() => {
    if (phase === "shatter") generateTiles();
  }, [phase, generateTiles]);

  if (!visible) return null;

  const isGlowing = phase === "glow1" || phase === "glow2";
  const isShattering = phase === "shatter" || phase === "exit";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* ─── Shatter Tiles ─── */}
          {isShattering && tiles.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                width: LOGO_SIZE, height: LOGO_SIZE,
                marginLeft: -LOGO_SIZE / 2,
                marginTop: -LOGO_SIZE / 2,
              }}
            >
              {tiles.map((tile) => (
                <motion.div
                  key={tile.id}
                  style={{
                    position: "absolute",
                    left: tile.startX, top: tile.startY,
                    width: TILE_SIZE, height: TILE_SIZE,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{
                    x: tile.endX, y: tile.endY,
                    opacity: [1, 0.8, 0],
                    scale: tile.scaleEnd,
                    rotate: tile.rotate,
                  }}
                  transition={{ duration: 0.7, delay: tile.delay, ease: [0.2, 0, 0.6, 1] }}
                >
                  <img src={tile.dataUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Hidden img for canvas source */}
          <img ref={imgRef} src={`${BASE}logo_1.png`} alt="" crossOrigin="anonymous"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: LOGO_SIZE, height: LOGO_SIZE }}
          />

          {/* ─── Logo — flips 360° once while growing, then glows twice, then shatters ─── */}
          {!isShattering && (
            <div style={{ perspective: 800 }}>
              <motion.img
                src={`${BASE}logo_1.png`}
                alt="TheDietStore"
                className="max-w-[70vw]"
                style={{ position: "relative", zIndex: 20, width: LOGO_SIZE }}
                initial={{ opacity: 0, scale: 0.05, rotateY: 0, filter: "brightness(1) drop-shadow(0 0 0px transparent)" }}
                animate={
                  phase === "flip"
                    ? { opacity: 1, scale: 1, rotateY: 360, filter: "brightness(1) drop-shadow(0 0 0px transparent)" }
                    : phase === "glow1"
                    ? { opacity: 1, scale: 1.08, rotateY: 360, filter: "brightness(1.5) drop-shadow(0 0 20px rgba(255,255,255,0.6)) drop-shadow(0 0 40px rgba(255,255,255,0.3))" }
                    : phase === "glowoff"
                    ? { opacity: 1, scale: 1, rotateY: 360, filter: "brightness(1) drop-shadow(0 0 0px transparent)" }
                    : phase === "glow2"
                    ? { opacity: 1, scale: 1.15, rotateY: 360, filter: "brightness(2) drop-shadow(0 0 50px rgba(255,255,255,0.9)) drop-shadow(0 0 80px rgba(255,255,255,0.5))" }
                    : { opacity: 0, scale: 1.3, rotateY: 360, filter: "brightness(1)" }
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
              />
            </div>
          )}

          {/* ─── Tagline ─── */}
          <motion.p
            className="absolute font-['Orbitron'] text-xs sm:text-sm tracking-[0.5em] uppercase"
            style={{ bottom: `calc(50% - ${LOGO_SIZE / 2 + 28}px)`, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
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
      )}
    </AnimatePresence>
  );
}