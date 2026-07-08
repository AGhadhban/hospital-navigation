import { useCallback, useEffect, useMemo, useState } from "react";
import { DestinationList } from "@/components/DestinationList";
import { HospitalMap } from "@/components/HospitalMap";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QRCodesPanel } from "@/components/QRCodesPanel";
import { RouteSheet } from "@/components/RouteSheet";
import { StartPointPicker } from "@/components/StartPointPicker";
import {
  DESTINATIONS,
  PATHS,
  START_POINTS,
  getStartPoint,
  type Destination,
  type StartPoint,
} from "@/data/destinations";

import { useI18n } from "@/i18n/I18nProvider";
import logo from "@/assets/logo.jpeg";

const Index = () => {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [startPoint, setStartPoint] = useState<StartPoint>(START_POINTS[0]);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>([
    START_POINTS[0].x,
    START_POINTS[0].y,
  ]);
  const [progress, setProgress] = useState(0);
  const [highlight, setHighlight] = useState<
    { start: [number, number]; end: [number, number] } | null
  >(null);

  // Read ?start= and ?to= from QR-encoded URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startId = params.get("start");
    const toId = params.get("to");
    if (startId) {
      const sp = getStartPoint(startId);
      setStartPoint(sp);
      setUserPos([sp.x, sp.y]);
    }
    if (toId) {
      const d = DESTINATIONS.find((x) => x.id === toId);
      if (d) setDestination(d);
    }
  }, []);

  // Re-anchor userPos whenever start point changes and no route is active
  useEffect(() => {
    if (!destination) setUserPos([startPoint.x, startPoint.y]);
  }, [startPoint, destination]);

  // Choose the corridor-following path baked for this (destination, start) pair.
  const routedDestination = useMemo<Destination | null>(() => {
    if (!destination) return null;
    const baked = PATHS[destination.id]?.[startPoint.id];
    if (baked && baked.length >= 2) {
      return { ...destination, path: baked };
    }
    // Fallback: prepend start to existing path (legacy behaviour)
    const first: [number, number] = [startPoint.x, startPoint.y];
    const rest = destination.path.slice(1);
    return { ...destination, path: [first, ...rest] };
  }, [destination, startPoint]);


  const handleSelect = (d: Destination) => {
    setDestination(d);
    setUserPos([startPoint.x, startPoint.y]);
    setProgress(0);
    setHighlight(null);
    requestAnimationFrame(() => {
      document.getElementById("map-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleClose = () => {
    setDestination(null);
    setUserPos([startPoint.x, startPoint.y]);
    setProgress(0);
    setHighlight(null);
  };

  const handleProgress = useCallback(
    (
      pos: [number, number],
      pct: number,
      hl: { start: [number, number]; end: [number, number] } | null
    ) => {
      setUserPos(pos);
      setProgress(pct);
      setHighlight(hl);
    },
    []
  );

  return (
    <div className="min-h-screen bg-soft">
      <div className="mx-auto max-w-2xl px-5 pb-40 pt-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-elevated ring-1 ring-border">
              <img
                src={logo}
                alt="Government Hospitals — Salmaniya Medical Complex"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                {t.appName}
              </p>
              <p className="truncate text-sm font-bold text-foreground">{t.hospital}</p>
            </div>
          </div>
          <LanguageToggle />
        </header>

        {/* Hero greeting */}
        <section className="mt-6">
          <h1 className="font-serif text-[34px] font-extrabold leading-[1.1] text-foreground">
            {t.greetingHead}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t.greetingHighlight}
            </span>
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{t.greetingSub}</p>
        </section>

        {/* Start-point picker (QR-aware) */}
        <StartPointPicker value={startPoint} onChange={setStartPoint} />

        {/* Map */}
        <div id="map-anchor" className="mt-6">
          <HospitalMap
            destination={routedDestination}
            userPos={userPos}
            progress={progress}
            highlightSegment={highlight}
            startPoint={startPoint}
          />
        </div>

        {/* List */}
        <div className="mt-8">
          <DestinationList
            query={query}
            onQuery={setQuery}
            category={category}
            onCategory={setCategory}
            onSelect={handleSelect}
            selectedId={destination?.id}
          />
        </div>

        {/* QR codes for admins to print */}
        <QRCodesPanel />

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          {t.footerHelp}
        </p>
      </div>

      {routedDestination && (
        <RouteSheet
          destination={routedDestination}
          onClose={handleClose}
          onProgress={handleProgress}
        />
      )}
    </div>
  );
};

export default Index;
