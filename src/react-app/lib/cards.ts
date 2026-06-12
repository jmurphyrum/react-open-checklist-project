import { useLayoutEffect, useState } from "react";

export const ROW_HEIGHT = 44;
const OVERSCAN = 20;

export const TEAM_ABBR: Record<string, string> = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Athletics": "OAK",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Brooklyn Dodgers": "BRK",
  "California Angels": "CAL",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN",
  "Cleveland": "CLE",
  "Cleveland Guardians": "CLE",
  "Cleveland Indians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Florida Marlins": "FLA",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Milwaukee Braves": "MLW",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Giants": "NYG",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "Oakland Athletics": "OAK",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SD",
  "San Francisco Giants": "SF",
  "Seattle Mariners": "SEA",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Devil Rays": "TB",
  "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH",
  "Montréal Expos": "MON",
};

export function teamAbbr(team: string): string {
  return TEAM_ABBR[team] ?? team.slice(0, 3).toUpperCase();
}

export interface Subject {
  name: string;
  team?: string;
  role?: string;
}

export interface Card {
  uuid: string;
  number: string;
  card_name?: string;
  set_id: string;
  set_name?: string;
  subjects: Subject[];
  subset?: string;
  variation?: string;
  parallel?: string;
  print_run?: number;
  serial_numbered: boolean;
  rookie_card: boolean;
  autograph: boolean;
  relic: boolean;
}

export function cardSubsetDisplay(card: Card, includeParallel: boolean): string {
  const parts: string[] = [];
  if (card.subset) parts.push(card.subset);
  if (card.variation && card.variation !== card.subset) parts.push(card.variation);
  if (includeParallel && card.parallel) parts.push(card.parallel);
  return parts.join(" · ");
}

export function useVirtualScroll(
  count: number,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [range, setRange] = useState({ start: 0, end: Math.min(60, count) });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const { scrollTop, clientHeight } = el;
      const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
      const end = Math.min(
        count,
        Math.ceil((scrollTop + clientHeight) / ROW_HEIGHT) + OVERSCAN,
      );
      setRange({ start, end });
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [count, containerRef]);

  return {
    range,
    topSpacer: range.start * ROW_HEIGHT,
    bottomSpacer: Math.max(0, count - range.end) * ROW_HEIGHT,
  };
}
