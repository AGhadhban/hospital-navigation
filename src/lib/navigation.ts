import type { Destination } from "@/data/destinations";
import { localized } from "@/data/destinations";
import type { Lang } from "@/i18n/I18nProvider";

type Dict = {
  headStraight: string;
  turnLeft: string;
  turnRight: string;
  uTurn: string;
  arriveAt: (name: string) => string;
  walkM: (m: number) => string;
  headFor: (compass: string, m: number) => string;
  north: string;
  northEast: string;
  east: string;
  southEast: string;
  south: string;
  southWest: string;
  west: string;
  northWest: string;
};

export type Turn = {
  index: number;
  instruction: string;
  icon: string;
  distanceM: number;
  cumulativeM: number;
  segmentStart: [number, number];
  segmentEnd: [number, number];
  bearing: number;
};

const UNITS_PER_METER = 2;

function bearingDeg(a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const rad = Math.atan2(dx, -dy);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

function relativeTurn(prev: number, next: number, t: Dict) {
  let diff = next - prev;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  if (Math.abs(diff) < 25) return { word: t.headStraight, icon: "⬆️" };
  if (diff >= 25 && diff < 135) return { word: t.turnRight, icon: "➡️" };
  if (diff <= -25 && diff > -135) return { word: t.turnLeft, icon: "⬅️" };
  return { word: t.uTurn, icon: "↩️" };
}

function compassWord(b: number, t: Dict) {
  if (b < 22.5 || b >= 337.5) return t.north;
  if (b < 67.5) return t.northEast;
  if (b < 112.5) return t.east;
  if (b < 157.5) return t.southEast;
  if (b < 202.5) return t.south;
  if (b < 247.5) return t.southWest;
  if (b < 292.5) return t.west;
  return t.northWest;
}

export function buildTurns(destination: Destination, lang: Lang, t: Dict): Turn[] {
  const path = destination.path;
  const turns: Turn[] = [];
  let cum = 0;
  let prevBearing: number | null = null;

  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const distUnits = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const distM = Math.round(distUnits / UNITS_PER_METER);
    cum += distM;
    const bearing = bearingDeg(a, b);

    let instruction: string;
    let icon: string;

    if (i === 1) {
      instruction = t.headFor(compassWord(bearing, t), distM);
      icon = "🚪";
    } else {
      const turn = relativeTurn(prevBearing!, bearing, t);
      instruction = `${turn.word}${t.walkM(distM)}`;
      icon = turn.icon;
    }

    if (i === path.length - 1) {
      instruction += t.arriveAt(localized(destination.name, lang));
    }

    turns.push({
      index: i,
      instruction,
      icon,
      distanceM: distM,
      cumulativeM: cum,
      segmentStart: a,
      segmentEnd: b,
      bearing,
    });
    prevBearing = bearing;
  }

  return turns;
}

export function totalDistanceM(turns: Turn[]) {
  return turns.length ? turns[turns.length - 1].cumulativeM : 0;
}

export function progressInfo(turns: Turn[], t: number) {
  const total = totalDistanceM(turns);
  const walked = total * t;
  let acc = 0;
  for (let i = 0; i < turns.length; i++) {
    const seg = turns[i].distanceM;
    if (walked <= acc + seg || i === turns.length - 1) {
      const into = Math.max(0, walked - acc);
      return {
        currentTurnIdx: i,
        distanceIntoSegmentM: Math.round(into),
        distanceRemainingInSegmentM: Math.max(0, Math.round(seg - into)),
        totalRemainingM: Math.max(0, Math.round(total - walked)),
        totalM: total,
      };
    }
    acc += seg;
  }
  return {
    currentTurnIdx: 0,
    distanceIntoSegmentM: 0,
    distanceRemainingInSegmentM: 0,
    totalRemainingM: total,
    totalM: total,
  };
}
