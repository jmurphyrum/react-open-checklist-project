import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, cardSubsetDisplay, teamAbbr, useVirtualScroll } from "../lib/cards";

interface CardTableProps {
  cards: Card[];
  contextLabel: string;
  mode?: "set" | "player" | "team";
}

export default function CardTable({ cards, contextLabel, mode = "set" }: CardTableProps) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedSubset, setSelectedSubset] = useState("");
  const [showRC, setShowRC] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [showRelic, setShowRelic] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const teams = useMemo(() => {
    const seen = new Set<string>();
    cards.forEach((c) => c.subjects.forEach((s) => { if (s.team) seen.add(s.team); }));
    return [...seen].sort();
  }, [cards]);

  const subsets = useMemo(() => {
    const seen = new Set<string>();
    cards.forEach((c) => {
      if (c.subset) seen.add(c.subset);
      if (c.variation && !c.subset) seen.add(c.variation);
    });
    return [...seen].sort();
  }, [cards]);

  const parallels = useMemo(() => {
    const seen = new Set<string>();
    cards.forEach((c) => { if (c.parallel) seen.add(c.parallel); });
    return [...seen].sort();
  }, [cards]);

  const filtered = useMemo(() => {
    let list = cards;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.number.toLowerCase().includes(q) ||
          (c.card_name || "").toLowerCase().includes(q) ||
          c.subjects.some((s) => s.name.toLowerCase().includes(q)) ||
          (c.set_name || c.set_id).toLowerCase().includes(q),
      );
    }
    if (selectedTeam) list = list.filter((c) => c.subjects.some((s) => s.team === selectedTeam));
    if (selectedSubset) list = list.filter((c) => c.subset === selectedSubset || c.variation === selectedSubset);
    if (showRC) list = list.filter((c) => c.rookie_card);
    if (showAuto) list = list.filter((c) => c.autograph);
    if (showRelic) list = list.filter((c) => c.relic);
    return list;
  }, [cards, search, selectedTeam, selectedSubset, showRC, showAuto, showRelic]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [search, selectedTeam, selectedSubset, showRC, showAuto, showRelic]);

  const { range, topSpacer, bottomSpacer } = useVirtualScroll(filtered.length, containerRef);
  const visibleCards = filtered.slice(range.start, range.end);
  const hasFilters = !!(search || selectedTeam || selectedSubset || showRC || showAuto || showRelic);

  const showTeamPills = mode === "set" && teams.length > 1;
  const showTeamCol = mode !== "team" && teams.length > 1;
  const showPlayerCol = mode === "set" || mode === "team";
  const showSetCol = mode === "player" || mode === "team";
  const showSubsetFilter = subsets.length > 1;
  const showParallelInfo = parallels.length > 0;

  const gridCols = [
    "7rem",
    showPlayerCol ? "2fr" : null,
    showSetCol ? "2fr" : null,
    showTeamCol ? "4.5rem" : null,
    "3fr",
    showParallelInfo ? "1fr" : null,
    "4.5rem",
    "8rem",
  ]
    .filter(Boolean)
    .join(" ");

  function clearAll() {
    setSearch("");
    setSelectedTeam("");
    setSelectedSubset("");
    setShowRC(false);
    setShowAuto(false);
    setShowRelic(false);
  }

  return (
    <>
      <div className="set-section-header" style={{ marginBottom: "var(--sp-3)" }}>
        <h2 className="set-section-title">Cards</h2>
        <span className="set-section-count">
          {hasFilters
            ? filtered.length.toLocaleString() + " / " + cards.length.toLocaleString()
            : cards.length.toLocaleString()}
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="empty-state"><p>No cards found.</p></div>
      ) : (
        <>
          <div className="cards-filter-bar">
            <input
              className="cards-search"
              type="search"
              placeholder="Search by number, name, or set..."
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
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
            <div className="cards-filter-pills" role="group" aria-label="Filter by attribute">
              <button type="button" className={"cards-filter-pill cards-filter-pill--rc" + (showRC ? " active" : "")} onClick={() => setShowRC((p) => !p)} aria-pressed={showRC}>RC</button>
              <button type="button" className={"cards-filter-pill cards-filter-pill--auto" + (showAuto ? " active" : "")} onClick={() => setShowAuto((p) => !p)} aria-pressed={showAuto}>Auto</button>
              <button type="button" className={"cards-filter-pill cards-filter-pill--relic" + (showRelic ? " active" : "")} onClick={() => setShowRelic((p) => !p)} aria-pressed={showRelic}>Relic</button>
            </div>
            {hasFilters && (
              <button type="button" className="cards-filter-clear" onClick={clearAll}>Clear</button>
            )}
          </div>

          {showTeamPills && (
            <div className="cards-team-filter" role="group" aria-label="Filter by team">
              <button type="button" className={"cards-team-pill" + (selectedTeam === "" ? " active" : "")} onClick={() => setSelectedTeam("")}>All</button>
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  className={"cards-team-pill" + (selectedTeam === team ? " active" : "")}
                  onClick={() => setSelectedTeam((prev) => (prev === team ? "" : team))}
                  title={team}
                >
                  {teamAbbr(team)}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state"><p>No cards match your search.</p></div>
          ) : (
            <div
              className="card-table-wrap"
              style={{ "--cl-grid": gridCols } as React.CSSProperties}
            >
              <div
                ref={containerRef}
                className="card-table-scroll"
                role="list"
                aria-label={contextLabel}
              >
                <div className="card-table-head">
                  <span className="card-th">#</span>
                  {showPlayerCol && <span className="card-th">Player</span>}
                  {showSetCol && <span className="card-th">Set</span>}
                  {showTeamCol && <span className="card-th">Team</span>}
                  <span className="card-th">Subset</span>
                  {showParallelInfo && <span className="card-th">Parallel</span>}
                  <span className="card-th">Print Run</span>
                  <span className="card-th card-th--right">Attrs</span>
                </div>
                {topSpacer > 0 && <div style={{ height: topSpacer }} aria-hidden="true" />}
                {visibleCards.map((card) => {
                  const primaryName = card.subjects?.map((s) => s.name).join(", ") || "—";
                  const primaryTeam = card.subjects?.[0]?.team ?? "";
                  const subsetDisplay = cardSubsetDisplay(card, !showParallelInfo);
                  const printRunDisplay =
                    card.serial_numbered && card.print_run ? "#/" + card.print_run : "";

                  return (
                    <Link
                      key={card.uuid}
                      to={"/cards/" + card.uuid}
                      className="card-table-row"
                      role="listitem"
                    >
                      <span className="card-number">#{card.number}</span>
                      {showPlayerCol && (
                        <span className="card-cell-name">{primaryName}</span>
                      )}
                      {showSetCol && (
                        <span className="card-cell-set" title={card.set_name || card.set_id}>
                          {card.set_name || card.set_id}
                        </span>
                      )}
                      {showTeamCol && (
                        <span className="card-cell-team" title={primaryTeam}>
                          {primaryTeam ? teamAbbr(primaryTeam) : ""}
                        </span>
                      )}
                      <span className="card-cell-subset">{subsetDisplay}</span>
                      {showParallelInfo && (
                        <span className="card-cell-parallel">{card.parallel ?? ""}</span>
                      )}
                      <span className="card-cell-printrun">{printRunDisplay}</span>
                      <span className="card-cell-chips">
                        {card.rookie_card && <span className="attr-chip attr-chip--rc">RC</span>}
                        {card.autograph && <span className="attr-chip attr-chip--auto">Auto</span>}
                        {card.relic && <span className="attr-chip attr-chip--relic">Relic</span>}
                      </span>
                    </Link>
                  );
                })}
                {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} aria-hidden="true" />}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
