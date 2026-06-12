import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

const ROW_HEIGHT = 44;
const OVERSCAN = 20;

const TEAM_ABBR: Record<string, string> = {
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

function teamAbbr(team: string): string {
  return TEAM_ABBR[team] ?? team.slice(0, 3).toUpperCase();
}

interface Subject {
  name: string;
  team?: string;
  role?: string;
}

interface Card {
  uuid: string;
  number: string;
  card_name?: string;
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

interface SetData {
  set_id: string;
  name: string;
  genre: string;
  manufacturer?: string;
  season?: string;
  description?: string;
  category?: string[];
  cards: Card[];
}

function genreBadgeClass(genre: string): string {
  if (genre === "Sports") return "badge genre-badge--sports";
  if (genre === "TCG") return "badge genre-badge--tcg";
  if (genre === "Non-Sport") return "badge genre-badge--nonsport";
  return "badge genre-badge--unknown";
}

function cardSubsetDisplay(card: Card, includeParallel: boolean): string {
  const parts: string[] = [];
  if (card.subset) parts.push(card.subset);
  if (card.variation && card.variation !== card.subset) parts.push(card.variation);
  if (includeParallel && card.parallel) parts.push(card.parallel);
  return parts.join(" · ");
}

function useVirtualScroll(
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

export default function SetDetail() {
  const { set_id } = useParams();
  const [data, setData] = useState<SetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedSubset, setSelectedSubset] = useState("");
  const [showRC, setShowRC] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [showRelic, setShowRelic] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSearch("");
    setSelectedTeam("");
    setSelectedSubset("");
    setShowRC(false);
    setShowAuto(false);
    setShowRelic(false);
    fetch("/api/sets/" + set_id)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [set_id]);

  const teams = useMemo(() => {
    if (!data?.cards) return [];
    const seen = new Set<string>();
    data.cards.forEach((c) =>
      c.subjects.forEach((s) => {
        if (s.team) seen.add(s.team);
      }),
    );
    return [...seen].sort();
  }, [data?.cards]);

  const subsets = useMemo(() => {
    if (!data?.cards) return [];
    const seen = new Set<string>();
    data.cards.forEach((c) => {
      if (c.subset) seen.add(c.subset);
      if (c.variation && !c.subset) seen.add(c.variation);
    });
    return [...seen].sort();
  }, [data?.cards]);

  const parallels = useMemo(() => {
    if (!data?.cards) return [];
    const seen = new Set<string>();
    data.cards.forEach((c) => {
      if (c.parallel) seen.add(c.parallel);
    });
    return [...seen].sort();
  }, [data?.cards]);

  const filtered = useMemo(() => {
    if (!data?.cards) return [];
    let list = data.cards;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.number.toLowerCase().includes(q) ||
          (c.card_name || "").toLowerCase().includes(q) ||
          c.subjects.some((s) => s.name.toLowerCase().includes(q)),
      );
    }
    if (selectedTeam) {
      list = list.filter((c) =>
        c.subjects.some((s) => s.team === selectedTeam),
      );
    }
    if (selectedSubset) {
      list = list.filter(
        (c) => c.subset === selectedSubset || c.variation === selectedSubset,
      );
    }
    if (showRC) list = list.filter((c) => c.rookie_card);
    if (showAuto) list = list.filter((c) => c.autograph);
    if (showRelic) list = list.filter((c) => c.relic);
    return list;
  }, [data?.cards, search, selectedTeam, selectedSubset, showRC, showAuto, showRelic]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [search, selectedTeam, selectedSubset, showRC, showAuto, showRelic]);

  const { range, topSpacer, bottomSpacer } = useVirtualScroll(
    filtered.length,
    containerRef,
  );
  const visibleCards = filtered.slice(range.start, range.end);
  const hasFilters =
    search || selectedTeam || selectedSubset || showRC || showAuto || showRelic;

  const showTeamFilter = teams.length > 1;
  const showSubsetFilter = subsets.length > 1;
  const showParallelInfo = parallels.length > 0;

  function clearAll() {
    setSearch("");
    setSelectedTeam("");
    setSelectedSubset("");
    setShowRC(false);
    setShowAuto(false);
    setShowRelic(false);
  }

  if (loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/">Browse</Link>
          <span className="breadcrumb-sep">/</span>
          <span
            className="skeleton"
            style={{ width: "8rem", height: "0.8rem", display: "inline-block" }}
          />
        </div>
        <div className="set-detail-header">
          <span
            className="skeleton"
            style={{
              width: "3rem",
              height: "1.125rem",
              display: "inline-block",
              borderRadius: "0.25rem",
            }}
          />
          <div
            className="skeleton"
            style={{ width: "60%", height: "1.5rem", marginTop: "0.75rem" }}
          />
          <div
            className="skeleton"
            style={{ width: "40%", height: "0.9rem", marginTop: "0.5rem" }}
          />
        </div>
        <div
          className="set-section-header"
          style={{ marginBottom: "var(--sp-3)" }}
        >
          <div className="skeleton" style={{ width: "4rem", height: "1rem" }} />
          <div
            className="skeleton"
            style={{ width: "2rem", height: "0.8rem" }}
          />
        </div>
        <div className="cards-filter-bar">
          <div
            className="skeleton"
            style={{
              width: "16rem",
              height: "2.25rem",
              borderRadius: "var(--r)",
            }}
          />
          <div
            className="skeleton"
            style={{
              width: "10rem",
              height: "2.25rem",
              borderRadius: "var(--r)",
            }}
          />
        </div>
        <div
          className="skeleton cards-team-filter"
          style={{ height: "2.25rem", borderRadius: "var(--r)" }}
        />
        <div className="card-table">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card-table-row">
              <span
                className="skeleton"
                style={{ width: "2.5rem", height: "0.75rem" }}
              />
              <span
                className="skeleton"
                style={{
                  width: 30 + (i % 4) * 10 + "%",
                  height: "0.875rem",
                }}
              />
              <span />
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/">Browse</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Not found</span>
        </div>
        <div className="empty-state" style={{ marginTop: "var(--sp-8)" }}>
          <p>This set could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Browse</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{data.name}</span>
      </div>

      <div className="set-detail-header">
        <span className={genreBadgeClass(data.genre)}>{data.genre}</span>
        <h1 className="set-detail-title">{data.name}</h1>
        {data.description && (
          <p className="set-detail-desc">{data.description}</p>
        )}
        <div className="set-detail-meta-row">
          {data.manufacturer && (
            <span className="set-detail-meta-item">
              <strong>{data.manufacturer}</strong>
            </span>
          )}
          {data.season && (
            <span className="set-detail-meta-item">
              Season <strong>{data.season}</strong>
            </span>
          )}
          {data.category && data.category.length > 0 && (
            <span className="set-detail-meta-item">
              {data.category.map((cat) => (
                <span
                  key={cat}
                  className="attr-chip"
                  style={{ marginLeft: "var(--sp-1)" }}
                >
                  {cat}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      <div
        className="set-section-header"
        style={{ marginBottom: "var(--sp-3)" }}
      >
        <h2 className="set-section-title">Cards</h2>
        <span className="set-section-count">
          {hasFilters
            ? filtered.length.toLocaleString() +
              " / " +
              data.cards.length.toLocaleString()
            : data.cards.length.toLocaleString()}
        </span>
      </div>

      {data.cards.length === 0 ? (
        <div className="empty-state">
          <p>No cards in this set yet.</p>
        </div>
      ) : (
        <>
          {/* Primary filter bar */}
          <div className="cards-filter-bar">
            <input
              className="cards-search"
              type="search"
              placeholder="Search by number, name, or player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cards"
            />
            {showSubsetFilter && (
              <select
                className="cards-subset-select"
                value={selectedSubset}
                onChange={(e) => setSelectedSubset(e.target.value)}
                aria-label="Filter by subset"
              >
                <option value="">All subsets</option>
                {subsets.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
            <div
              className="cards-filter-pills"
              role="group"
              aria-label="Filter by attribute"
            >
              <button
                type="button"
                className={
                  "cards-filter-pill cards-filter-pill--rc" +
                  (showRC ? " active" : "")
                }
                onClick={() => setShowRC((prev) => !prev)}
                aria-pressed={showRC}
              >
                RC
              </button>
              <button
                type="button"
                className={
                  "cards-filter-pill cards-filter-pill--auto" +
                  (showAuto ? " active" : "")
                }
                onClick={() => setShowAuto((prev) => !prev)}
                aria-pressed={showAuto}
              >
                Auto
              </button>
              <button
                type="button"
                className={
                  "cards-filter-pill cards-filter-pill--relic" +
                  (showRelic ? " active" : "")
                }
                onClick={() => setShowRelic((prev) => !prev)}
                aria-pressed={showRelic}
              >
                Relic
              </button>
            </div>
            {hasFilters && (
              <button
                type="button"
                className="cards-filter-clear"
                onClick={clearAll}
              >
                Clear
              </button>
            )}
          </div>

          {/* Team filter row */}
          {showTeamFilter && (
            <div className="cards-team-filter" role="group" aria-label="Filter by team">
              <button
                type="button"
                className={
                  "cards-team-pill" + (selectedTeam === "" ? " active" : "")
                }
                onClick={() => setSelectedTeam("")}
              >
                All
              </button>
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  className={
                    "cards-team-pill" +
                    (selectedTeam === team ? " active" : "")
                  }
                  onClick={() =>
                    setSelectedTeam((prev) => (prev === team ? "" : team))
                  }
                  title={team}
                >
                  {teamAbbr(team)}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No cards match your search.</p>
            </div>
          ) : (
            <div
              className="card-table-wrap"
              style={
                {
                  "--cl-grid": [
                    "7rem",
                    "2fr",
                    showTeamFilter ? "4.5rem" : "",
                    "3fr",
                    showParallelInfo ? "1fr" : "",
                    "4.5rem",
                    "8rem",
                  ]
                    .filter(Boolean)
                    .join(" "),
                } as React.CSSProperties
              }
            >
              <div
                ref={containerRef}
                className={
                  "card-table-scroll" +
                  (showTeamFilter ? " has-team" : "") +
                  (showParallelInfo ? " has-parallel" : "")
                }
                role="list"
                aria-label={data.name + " cards"}
              >
                <div className="card-table-head">
                  <span className="card-th">#</span>
                  <span className="card-th">Player</span>
                  {showTeamFilter && <span className="card-th">Team</span>}
                  <span className="card-th">Subset</span>
                  {showParallelInfo && <span className="card-th">Parallel</span>}
                  <span className="card-th">Print Run</span>
                  <span className="card-th card-th--right">Attrs</span>
                </div>
                {topSpacer > 0 && (
                  <div style={{ height: topSpacer }} aria-hidden="true" />
                )}
                {visibleCards.map((card) => {
                  const primaryName =
                    card.subjects?.map((s) => s.name).join(", ") || "—";
                  const primaryTeam = card.subjects?.[0]?.team ?? "";
                  const subsetDisplay = cardSubsetDisplay(card, !showParallelInfo);
                  const printRunDisplay =
                    card.serial_numbered && card.print_run
                      ? "#/" + card.print_run
                      : "";

                  return (
                    <Link
                      key={card.uuid}
                      to={"/cards/" + card.uuid}
                      className="card-table-row"
                      role="listitem"
                    >
                      <span className="card-number">#{card.number}</span>
                      <span className="card-cell-name">{primaryName}</span>
                      {showTeamFilter && (
                        <span
                          className="card-cell-team"
                          title={primaryTeam}
                        >
                          {primaryTeam ? teamAbbr(primaryTeam) : ""}
                        </span>
                      )}
                      <span className="card-cell-subset">{subsetDisplay}</span>
                      {showParallelInfo && (
                        <span className="card-cell-parallel">
                          {card.parallel ?? ""}
                        </span>
                      )}
                      <span className="card-cell-printrun">
                        {printRunDisplay}
                      </span>
                      <span className="card-cell-chips">
                        {card.rookie_card && (
                          <span className="attr-chip attr-chip--rc">RC</span>
                        )}
                        {card.autograph && (
                          <span className="attr-chip attr-chip--auto">
                            Auto
                          </span>
                        )}
                        {card.relic && (
                          <span className="attr-chip attr-chip--relic">
                            Relic
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
                {bottomSpacer > 0 && (
                  <div style={{ height: bottomSpacer }} aria-hidden="true" />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
