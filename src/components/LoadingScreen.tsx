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
  const generatedRef = useRef(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const COLS = isMobile ? 9 : 22;
  const ROWS = isMobile ? 9 : 22;
  const LOGO_SIZE = isMobile ? 180 : 280;
  const TILE_SIZE = LOGO_SIZE / COLS;

  useEffect(() => {
    if (!visible) return;
    let t: ReturnType<typeof setTimeout>;

    if (phase === "flip") t = setTimeout(() => setPhase("glow1"), 2800);
    if (phase === "glow1") t = setTimeout(() => setPhase("glowoff"), 300);
    if (phase === "glowoff") t = setTimeout(() => setPhase("glow2"), 250);
    if (phase === "glow2") t = setTimeout(() => setPhase("shatter"), 80);
    if (phase === "shatter") t = setTimeout(() => setPhase("exit"), 900);
    if (phase === "exit") t = setTimeout(() => setVisible(false), 700);

    return () => clearTimeout(t!);
  }, [phase, visible]);

  const generateTiles = useCallback(() => {
    const img = imgRef.current;
    if (!img || generatedRef.current) return;

    const generate = () => {
      if (generatedRef.current) return;
      generatedRef.current = true;
      const generated: Tile[] = [];
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const srcTileW = natW / COLS;
      const srcTileH = natH / ROWS;
            const circleRadius = TILE_SIZE * 0.32;

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

                    const dataUrl = tileCanvas.toDataURL("image/webp", 0.85);
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
            dataUrl,
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
    // Generate tiles as early as possible — right at mount, as soon as the
    // hidden source image is available — instead of waiting for glow2/shatter.
    // The flip phase alone gives ~2.8s of idle time, which is much more
    // margin than doing this work in the 400ms glow2 window (which was
    // blocking the main thread mid-animation and causing a stutter).
    generateTiles();
  }, [generateTiles]);

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
          {tiles.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                width: LOGO_SIZE, height: LOGO_SIZE,
                marginLeft: -LOGO_SIZE / 2,
                marginTop: -LOGO_SIZE / 2,
                opacity: isShattering ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              {tiles.map((tile) => (
                                <div
                  key={tile.id}
                  style={{
                    position: "absolute",
                    left: tile.startX, top: tile.startY,
                    width: TILE_SIZE, height: TILE_SIZE,
                    willChange: isShattering ? "transform, opacity" : "auto",
                    transform: isShattering
                      ? `translate(${tile.endX}px, ${tile.endY}px) scale(${tile.scaleEnd}) rotate(${tile.rotate}deg)`
                      : "translate(0px, 0px) scale(1) rotate(0deg)",
                    opacity: isShattering ? 0 : 1,
                    transition: `transform 0.7s cubic-bezier(0.2,0,0.6,1) ${tile.delay}s, opacity 0.7s ease-out ${tile.delay}s`,
                  }}
                >
                                                      <img
                    src={tile.dataUrl}
                    alt=""
                    draggable={false}
                    style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Hidden img for canvas source */}
          <img ref={imgRef} src={`${BASE}image.png`} alt="" crossOrigin="anonymous"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: LOGO_SIZE, height: LOGO_SIZE }}
          />

          {/* ─── Logo — flips to 180° (front/back card-flip, no mirrored text), then glows twice, then shatters ─── */}
          {!isShattering && (
            <div style={{ perspective: 800 }}>
              <motion.div
                style={{ position: "relative", width: LOGO_SIZE, transformStyle: "preserve-3d" }}
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
                    : { opacity: 0, scale: 1.3, rotateY: 180 } // exit fallback
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
                {/* Front face — establishes the box size (same pattern as original working code:
                    position relative, width LOGO_SIZE). Visible for first half of the flip. */}
                <img
                  src={`${BASE}image.png`}
                  alt="TheDietStore"
                  className="max-w-[70vw]"
                  style={{ position: "relative", zIndex: 20, width: "100%", display: "block", backfaceVisibility: "hidden" }}
                />
                {/* Back face — same logo, pre-rotated 180deg relative to this wrapper, so once the
                    wrapper finishes rotating 180deg, this face lands facing forward, right-side-up
                    (no mirroring). Overlaid exactly on top of the front face. Handles the glow filter. */}
                <motion.img
                  src={`${BASE}image.png`}
                  alt="TheDietStore"
                  className="max-w-[70vw]"
                  style={{
                    position: "absolute", top: 0, left: 0, zIndex: 20, width: "100%",
                    backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                  }}
                  animate={
                                       phase === "glow1"
                      ? { filter: "brightness(1.15) drop-shadow(0 0 15px rgba(255,255,255,0.4)) drop-shadow(0 0 25px rgba(255,255,255,0.2))" }
                      : phase === "glowoff"
                      ? { filter: "brightness(1) drop-shadow(0 0 0px transparent)" }
                                                   : phase === "glow2"
                      ? { filter: "brightness(1.15) drop-shadow(0 0 35px rgba(255,255,255,0.55)) drop-shadow(0 0 55px rgba(255,255,255,0.3))" }
                      : { filter: "brightness(1) drop-shadow(0 0 0px transparent)" }
                  }
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          )}

          {/* ─── Tagline ─── */}
           <motion.p
            className="absolute font-['Orbitron'] text-[11px] xs:text-xs sm:text-base tracking-[0.3em] sm:tracking-[0.5em] uppercase px-4 text-center"
            style={{ bottom: `calc(50% - ${LOGO_SIZE / 2 + 28}px)`, left: 0, right: 0, width: "100%" }}
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