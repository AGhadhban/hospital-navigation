import { useEffect, useMemo, useState } from "react";
import { DestinationDetails } from "@/components/DestinationDetails";
import { buildTurns, progressInfo, totalDistanceM } from "@/lib/navigation";
import type { Destination } from "@/data/destinations";
import { localized } from "@/data/destinations";
import { useI18n } from "@/i18n/I18nProvider";

interface RouteSheetProps {
  destination: Destination;
  onClose: () => void;
  onProgress: (
    pos: [number, number],
    pct: number,
    highlight: { start: [number, number]; end: [number, number] } | null
  ) => void;
}

function pathLength(path: Array<[number, number]>) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i][0] - path[i - 1][0];
    const dy = path[i][1] - path[i - 1][1];
    total += Math.hypot(dx, dy);
  }
  return total;
}

function pointAt(path: Array<[number, number]>, t: number): [number, number] {
  const total = pathLength(path);
  let target = total * t;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i][0] - path[i - 1][0];
    const dy = path[i][1] - path[i - 1][1];
    const seg = Math.hypot(dx, dy);
    if (target <= seg) {
      const r = target / seg;
      return [path[i - 1][0] + dx * r, path[i - 1][1] + dy * r];
    }
    target -= seg;
  }
  return path[path.length - 1];
}

export const RouteSheet = ({ destination, onClose, onProgress }: RouteSheetProps) => {
  const { t: tr, lang } = useI18n();
  const [t, setT] = useState(0);
  const [mode, setMode] = useState<"gps" | "walking">("walking");
  const [walking, setWalking] = useState(true);

  const turns = useMemo(() => buildTurns(destination, lang, tr), [destination, lang, tr]);
  const total = useMemo(() => totalDistanceM(turns), [turns]);
  const info = useMemo(() => progressInfo(turns, t), [turns, t]);
  const currentTurn = turns[info.currentTurnIdx];

  useEffect(() => {
    if (mode !== "walking" || !walking) return;
    const id = setInterval(() => {
      setT((prev) => Math.min(1, prev + 0.005));
    }, 80);
    return () => clearInterval(id);
  }, [walking, mode]);


  useEffect(() => {
    const pos = pointAt(destination.path, t);
    const arrived = t >= 1;
    const highlight =
      arrived || !currentTurn
        ? null
        : { start: currentTurn.segmentStart, end: currentTurn.segmentEnd };
    onProgress(pos, t, highlight);
  }, [t, destination, onProgress, currentTurn]);

  const remaining = Math.max(0, Math.ceil(destination.walkMinutes * (1 - t)));
  const arrived = t >= 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[88vh] max-w-2xl flex-col rounded-t-3xl border-t-2 border-border bg-card shadow-elevated animate-in slide-in-from-bottom-10 duration-300">
      <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />

      <div className="overflow-y-auto px-5 pb-6 pt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            {destination.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {arrived ? tr.arrived : tr.walkingTo}
            </p>
            <h2 className="truncate text-2xl font-extrabold text-foreground">
              {localized(destination.name, lang)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {localized(destination.floor, lang)} · {localized(destination.wing, lang)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr.closeRoute}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground transition-smooth hover:bg-muted-foreground/20"
          >
            ✕
          </button>
        </div>

        {/* Direction mode selector */}
        <div className="mt-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {tr.directionMode}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("gps")}
              className={`h-11 rounded-xl text-sm font-extrabold transition-smooth ${
                mode === "gps"
                  ? "bg-card text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tr.modeLiveGps}
            </button>
            <button
              type="button"
              onClick={() => setMode("walking")}
              className={`h-11 rounded-xl text-sm font-extrabold transition-smooth ${
                mode === "walking"
                  ? "bg-card text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tr.modeWalking}
            </button>
          </div>
          {mode === "gps" && (
            <p className="mt-2 rounded-xl bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
              {tr.liveGpsNote}
            </p>
          )}
        </div>

        {!arrived && currentTurn && (

          <div className="mt-5 overflow-hidden rounded-2xl bg-hero p-4 text-primary-foreground shadow-elevated">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 text-4xl">
                {currentTurn.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] opacity-80">
                  {tr.next} · {tr.step} {currentTurn.index} {tr.of} {turns.length}
                </p>
                <p className="text-lg font-extrabold leading-tight">
                  {currentTurn.instruction}
                </p>
                <p className="mt-1 text-xs font-bold opacity-90">
                  {tr.in} {info.distanceRemainingInSegmentM} {tr.m}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-soft p-3 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              {tr.time}
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {arrived ? 0 : remaining}
              <span className="ms-1 text-xs font-bold text-muted-foreground">{tr.min}</span>
            </p>
          </div>
          <div className="rounded-2xl bg-soft p-3 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              {tr.distance}
            </p>
            <p className="text-xl font-extrabold text-foreground">
              {arrived ? 0 : info.totalRemainingM}
              <span className="ms-1 text-xs font-bold text-muted-foreground">{tr.m}</span>
            </p>
          </div>
          <div className="rounded-2xl bg-soft p-3 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              {tr.progress}
            </p>
            <p className="text-xl font-extrabold text-primary">{Math.round(t * 100)}%</p>
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-hero transition-smooth"
            style={{ width: `${Math.round(t * 100)}%` }}
          />
        </div>

        <h3 className="mt-6 font-serif text-lg font-extrabold text-foreground">
          {tr.turnByTurn}
        </h3>
        <p className="text-xs font-bold text-muted-foreground">
          {tr.totalSteps(total, turns.length)}
        </p>

        <ol className="mt-3 space-y-2.5">
          {turns.map((turn, i) => {
            const done = i < info.currentTurnIdx || arrived;
            const current = !done && i === info.currentTurnIdx;
            return (
              <li
                key={i}
                className={`flex items-start gap-3 rounded-2xl border-2 p-3 transition-smooth ${
                  current
                    ? "border-secondary bg-secondary/10 shadow-warm"
                    : done
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-card"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${
                    current
                      ? "bg-secondary text-secondary-foreground"
                      : done
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-foreground"
                  }`}
                >
                  {done ? "✓" : turn.icon}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`text-[15px] leading-snug ${
                      current
                        ? "font-extrabold text-foreground"
                        : done
                          ? "font-semibold text-muted-foreground line-through decoration-1"
                          : "font-semibold text-foreground"
                    }`}
                  >
                    {turn.instruction}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {current
                      ? tr.remaining(info.distanceRemainingInSegmentM)
                      : `${turn.distanceM} ${tr.m}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex gap-3">
          {!arrived ? (
            <button
              type="button"
              onClick={() => setWalking((w) => !w)}
              disabled={mode !== "walking"}
              className="h-14 flex-1 rounded-2xl bg-hero text-base font-extrabold text-primary-foreground shadow-elevated transition-bounce hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {walking ? tr.pause : tr.resume}
            </button>

          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-14 flex-1 rounded-2xl bg-warm text-base font-extrabold text-secondary-foreground shadow-warm transition-bounce hover:scale-[1.02] active:scale-[0.98]"
            >
              {tr.done}
            </button>
          )}
        </div>

        <DestinationDetails destination={destination} />
      </div>
    </div>
  );
};
