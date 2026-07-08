import { useRef, useState, useCallback } from "react";
import { type Destination, type StartPoint } from "@/data/destinations";
import { useI18n } from "@/i18n/I18nProvider";
import { localized } from "@/data/destinations";
import floorPlanAsset from "@/assets/smct-ot-map-v2.png.asset.json";

interface HospitalMapProps {
  destination: Destination | null;
  userPos: [number, number];
  progress: number; // 0..1 along path
  highlightSegment?: { start: [number, number]; end: [number, number] } | null;
  startPoint: StartPoint;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export const HospitalMap = ({
  destination,
  userPos,
  progress,
  highlightSegment,
  startPoint,
}: HospitalMapProps) => {
  const { t, dir, lang } = useI18n();

  // Zoom & pan state
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number; cx: number; cy: number; tx: number; ty: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const clampTranslate = useCallback(
    (nextTx: number, nextTy: number, nextScale: number) => {
      const el = containerRef.current;
      if (!el) return { tx: nextTx, ty: nextTy };
      const w = el.clientWidth;
      const h = el.clientHeight;
      const maxX = ((nextScale - 1) * w) / 2;
      const maxY = ((nextScale - 1) * h) / 2;
      return {
        tx: Math.max(-maxX, Math.min(maxX, nextTx)),
        ty: Math.max(-maxY, Math.min(maxY, nextTy)),
      };
    },
    []
  );

  const applyZoom = useCallback(
    (nextScale: number, focalX: number, focalY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = focalX - rect.left - rect.width / 2;
      const cy = focalY - rect.top - rect.height / 2;
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
      const ratio = clamped / scale;
      const newTx = cx - (cx - tx) * ratio;
      const newTy = cy - (cy - ty) * ratio;
      const c = clampTranslate(newTx, newTy, clamped);
      setScale(clamped);
      setTx(c.tx);
      setTy(c.ty);
    },
    [scale, tx, ty, clampTranslate]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, tx, ty };
      pinchStart.current = null;
    } else if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      pinchStart.current = {
        dist: Math.hypot(dx, dy),
        scale,
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
        tx,
        ty,
      };
      panStart.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const pts = Array.from(pointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, (pinchStart.current.scale * dist) / pinchStart.current.dist)
      );
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = pinchStart.current.cx - rect.left - rect.width / 2;
      const cy = pinchStart.current.cy - rect.top - rect.height / 2;
      const ratio = nextScale / pinchStart.current.scale;
      const newTx = cx - (cx - pinchStart.current.tx) * ratio;
      const newTy = cy - (cy - pinchStart.current.ty) * ratio;
      const c = clampTranslate(newTx, newTy, nextScale);
      setScale(nextScale);
      setTx(c.tx);
      setTy(c.ty);
    } else if (pointers.current.size === 1 && panStart.current && scale > 1) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const c = clampTranslate(panStart.current.tx + dx, panStart.current.ty + dy, scale);
      setTx(c.tx);
      setTy(c.ty);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    applyZoom(scale * (1 + delta), e.clientX, e.clientY);
  };

  const resetView = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };
  const zoomIn = () => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    applyZoom(scale * 1.4, r.left + r.width / 2, r.top + r.height / 2);
  };
  const zoomOut = () => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    applyZoom(scale / 1.4, r.left + r.width / 2, r.top + r.height / 2);
  };

  const pathStr = destination
    ? destination.path.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")
    : "";

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-2 border-border bg-soft shadow-soft">
      <div
        ref={containerRef}
        className="relative w-full touch-none select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: pointers.current.size === 0 ? "transform 0.15s ease-out" : "none",
          }}
        >
          <svg
            viewBox="0 0 400 430"
            className="block h-auto w-full"
            role="img"
            aria-label="SMC Level 2 Operating Theatre floor plan"
          >
            {/* Real hospital floor plan (SMC Level 2 O.T) */}
            <rect x="0" y="0" width="400" height="430" fill="#ffffff" />
            <image
              href={floorPlanAsset.url}
              x="0"
              y="0"
              width="400"
              height="430"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Active route — solid green direction line from start → destination */}
            {destination && (
              <>
                <path
                  d={pathStr}
                  fill="none"
                  stroke="hsl(var(--success) / 0.3)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathStr}
                  fill="none"
                  stroke="hsl(var(--success))"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Animated marching overlay showing walking progress */}
                <path
                  d={pathStr}
                  fill="none"
                  stroke="hsl(var(--success-foreground) / 0.9)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 8"
                  className="route-march"
                  style={{ strokeDashoffset: -progress * 24 }}
                />

                {/* Highlighted current segment + next waypoint */}
                {highlightSegment && (
                  <>
                    <line
                      x1={highlightSegment.start[0]}
                      y1={highlightSegment.start[1]}
                      x2={highlightSegment.end[0]}
                      y2={highlightSegment.end[1]}
                      stroke="hsl(var(--secondary))"
                      strokeWidth="7"
                      strokeLinecap="round"
                      opacity="0.95"
                    />
                    <g transform={`translate(${highlightSegment.end[0]} ${highlightSegment.end[1]})`}>
                      <circle r="10" fill="hsl(var(--secondary) / 0.3)">
                        <animate attributeName="r" values="8;18;8" dur="1.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.4s" repeatCount="indefinite" />
                      </circle>
                      <circle r="6" fill="hsl(var(--card))" stroke="hsl(var(--secondary))" strokeWidth="3" />
                    </g>
                  </>
                )}

                {/* Destination pin */}
                <g transform={`translate(${destination.x} ${destination.y})`}>
                  <circle r="22" fill="hsl(var(--secondary) / 0.2)" />
                  <circle r="14" fill="hsl(var(--secondary))" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="16"
                    style={{ fontFamily: "system-ui" }}
                  >
                    {destination.icon}
                  </text>
                </g>
              </>
            )}

            {/* You marker (live GPS) */}
            <g transform={`translate(${userPos[0]} ${userPos[1]})`}>
              <circle r="18" fill="hsl(var(--primary) / 0.18)">
                <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="11" fill="hsl(var(--primary))" stroke="white" strokeWidth="3" />
            </g>

            {/* Start-point label */}
            <g transform={`translate(${startPoint.x} ${startPoint.y + 38})`}>
              <rect x="-58" y="-14" width="116" height="22" rx="11" fill="hsl(var(--foreground))" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="700"
                fill="hsl(var(--background))"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {startPoint.icon} {localized(startPoint.name, lang)}
              </text>
            </g>

            {/* Compass */}
            <g transform="translate(30 30)">
              <circle r="18" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y="-2"
                fontSize="10"
                fontWeight="800"
                fill="hsl(var(--secondary))"
                style={{ fontFamily: "Nunito" }}
              >
                N
              </text>
              <polygon points="0,-14 -3,-6 3,-6" fill="hsl(var(--secondary))" />
            </g>
          </svg>
        </div>
      </div>

      {/* Zoom controls */}
      <div className={`absolute bottom-4 flex flex-col gap-1.5 ${dir === "rtl" ? "right-4" : "left-4"}`}>
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-lg font-extrabold text-foreground shadow-soft backdrop-blur transition-smooth hover:scale-110"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-lg font-extrabold text-foreground shadow-soft backdrop-blur transition-smooth hover:scale-110"
        >
          −
        </button>
        {scale > 1.02 && (
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset zoom"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-xs font-extrabold text-foreground shadow-soft backdrop-blur transition-smooth hover:scale-110"
          >
            ⤾
          </button>
        )}
      </div>

      {/* Floating GPS badge */}
      <div
        className={`pointer-events-none absolute top-4 flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-xs font-bold shadow-soft backdrop-blur ${
          dir === "rtl" ? "left-4" : "right-4"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-foreground">{t.liveGps}</span>
      </div>
    </div>
  );
};
