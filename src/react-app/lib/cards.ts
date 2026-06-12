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

// MLB Stats API player IDs — used to build headshot URLs from the same CDN Baseball Reference embeds
const MLB_PLAYER_IDS: Record<string, number> = {
  // Active stars
  "Shohei Ohtani": 660271, "Mike Trout": 545361, "Aaron Judge": 592450,
  "Mookie Betts": 605141, "Juan Soto": 665742, "Fernando Tatis Jr.": 665487,
  "Julio Rodriguez": 677594, "Yordan Alvarez": 670541, "Ronald Acuña Jr.": 660670,
  "Pete Alonso": 624413, "Corey Seager": 608369, "Paul Goldschmidt": 502671,
  "Freddie Freeman": 518692, "José Ramírez": 608070, "Trea Turner": 607208,
  "Bo Bichette": 666182, "Vladimir Guerrero Jr.": 665489, "Bryce Harper": 547180,
  "Nolan Arenado": 571448, "Elly De La Cruz": 682998, "Gunnar Henderson": 683002,
  "Bobby Witt Jr.": 677951, "Spencer Strider": 675911, "Paul Skenes": 694973,
  "Jackson Chourio": 694192, "Wyatt Langford": 695243, "Kyle Tucker": 663647,
  "Jeremy Peña": 665926, "Adley Rutschman": 668939, "Wander Franco": 665833,
  "Jazz Chisholm Jr.": 665750, "Randy Arozarena": 668227, "Ha-Seong Kim": 673490,
  "Cody Bellinger": 641355, "Francisco Lindor": 596019, "Anthony Volpe": 694497,
  "Jasson Dominguez": 694502, "Michael Harris II": 678882, "Jackson Merrill": 694978,
  "Kyle Schwarber": 656941, "Matt Olson": 621566, "Austin Riley": 663586,
  "José Altuve": 514888, "Alex Bregman": 608071, "Giancarlo Stanton": 519317,
  "Gleyber Torres": 650402, "George Springer": 543807, "Xander Bogaerts": 519048,
  "Carlos Correa": 621043, "Marcus Semien": 543760, "Marcus Freeman": 518692,
  "Francisco Alvarez": 682629, "Royce Lewis": 668009, "Jordan Walker": 694192,
  "Corbin Carroll": 682998, "Seiya Suzuki": 673548, "Ian Happ": 664023,
  // Pitchers
  "Gerrit Cole": 543037, "Max Scherzer": 453286, "Clayton Kershaw": 477132,
  "Zack Wheeler": 554430, "Corbin Burnes": 669203, "Sandy Alcantara": 645261,
  "Logan Webb": 657277, "Shane McClanahan": 663698, "Framber Valdez": 664285,
  "Kevin Gausman": 592332, "Luis Castillo": 622491, "Max Fried": 605483,
  "Tyler Glasnow": 607192, "Walker Buehler": 621111, "Nestor Cortes": 641482,
  "Brady Singer": 669160, "Justin Verlander": 434378,
  // Legends (MLB CDN has historical headshots for Hall of Famers)
  "Ken Griffey Jr.": 116338, "Derek Jeter": 116539, "Chipper Jones": 116516,
  "Barry Bonds": 111188, "Alex Rodriguez": 121347, "Cal Ripken Jr.": 120478,
  "Mike Piazza": 120488, "Nolan Ryan": 118665, "Randy Johnson": 117077,
  "Greg Maddux": 116285, "Tom Glavine": 115749, "John Smoltz": 120979,
  "Craig Biggio": 111990, "Jeff Bagwell": 112663, "Ivan Rodriguez": 121358,
  "Manny Ramirez": 119489, "Pedro Martinez": 117971, "Jim Thome": 120939,
  "Frank Thomas": 120074, "Tony Gwynn": 115793, "Rickey Henderson": 113028,
  "Wade Boggs": 111669, "Ryne Sandberg": 120689, "Don Mattingly": 116477,
  "Dave Winfield": 121377, "Ozzie Smith": 120801, "Robin Yount": 121785,
  "George Brett": 111998, "Alan Trammell": 121141, "Gary Carter": 112452,
  "Mike Schmidt": 120843, "Johnny Bench": 111509, "Reggie Jackson": 116209,
  "Mariano Rivera": 121250, "Roger Clemens": 112526,
};

export function playerImageUrl(name: string): string | null {
  const id = MLB_PLAYER_IDS[name];
  if (!id) return null;
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${id}/headshot/67/current`;
}

const ESPN_ABBR_OVERRIDE: Record<string, string | null> = {
  "CWS": "chw", "WSH": "was",
  "BRK": null, "CAL": null, "FLA": null, "MLW": null, "MON": null, "NYG": null,
};

export function teamLogoUrl(team: string): string | null {
  const abbr = TEAM_ABBR[team];
  if (!abbr) return null;
  const override = ESPN_ABBR_OVERRIDE[abbr];
  if (override === null) return null;
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${override ?? abbr.toLowerCase()}.png`;
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
