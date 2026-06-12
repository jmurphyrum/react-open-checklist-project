import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

const ROW_HEIGHT = 44;
const OVERSCAN = 20;

interface Card {
  uuid: string;
  number: string;
  card_name?: string;
  subjects: { name: string; team?: string; role?: string }[];
  rookie_card: boolean;
  autograph: boolean;
  relic: boolean;
  serial_numbered: boolean;
  parallel?: string;
  print_run?: number;
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
  const [showRC, setShowRC] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [showRelic, setShowRelic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSearch("");
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
    if (showRC) list = list.filter((c) => c.rookie_card);
    if (showAuto) list = list.filter((c) => c.autograph);
    if (showRelic) list = list.filter((c) => c.relic);
    return list;
  }, [data?.cards, search, showRC, showAuto, showRelic]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [search, showRC, showAuto, showRelic]);

  const { range, topSpacer, bottomSpacer } = useVirtualScroll(
    filtered.length,
    containerRef,
  );
  const visibleCards = filtered.slice(range.start, range.end);
  const hasFilters = search || showRC || showAuto || showRelic;

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
            style={{ width: "3rem", height: "1.125rem", display: "inline-block", borderRadius: "0.25rem" }}
          />
          <div className="skeleton" style={{ width: "60%", height: "1.5rem", marginTop: "0.75rem" }} />
          <div className="skeleton" style={{ width: "40%", height: "0.9rem", marginTop: "0.5rem" }} />
        </div>
        <div className="set-section-header" style={{ marginBottom: "var(--sp-3)" }}>
          <div className="skeleton" style={{ width: "4rem", height: "1rem" }} />
          <div className="skeleton" style={{ width: "2rem", height: "0.8rem" }} />
        </div>
        <div className="cards-filter-bar">
          <div className="skeleton" style={{ width: "16rem", height: "2.25rem", borderRadius: "var(--r)" }} />
          <div className="skeleton" style={{ width: "6rem", height: "2.25rem", borderRadius: "var(--r)" }} />
        </div>
        <div className="card-table">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card-table-row">
              <span className="skeleton" style={{ width: "2.5rem", height: "0.75rem" }} />
              <span className="skeleton" style={{ width: 35 + (i % 4) * 12 + "%", height: "0.875rem" }} />
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
        {data.description && <p className="set-detail-desc">{data.description}</p>}
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
                <span key={cat} className="attr-chip" style={{ marginLeft: "var(--sp-1)" }}>
                  {cat}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      <div className="set-section-header" style={{ marginBottom: "var(--sp-3)" }}>
        <h2 className="set-section-title">Cards</h2>
        <span className="set-section-count">
          {hasFilters
            ? filtered.length.toLocaleString() + " / " + data.cards.length.toLocaleString()
            : data.cards.length.toLocaleString()}
        </span>
      </div>

      {data.cards.length === 0 ? (
        <div className="empty-state">
          <p>No cards in this set yet.</p>
        </div>
      ) : (
        <>
          <div className="cards-filter-bar">
            <input
              className="cards-search"
              type="search"
              placeholder="Search by number, name, or player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cards"
            />
            <div className="cards-filter-pills" role="group" aria-label="Filter by attribute">
              <button
                type="button"
                className={"cards-filter-pill cards-filter-pill--rc" + (showRC ? " active" : "")}
                onClick={() => setShowRC((prev) => !prev)}
                aria-pressed={showRC}
              >
                RC
              </button>
              <button
                type="button"
                className={"cards-filter-pill cards-filter-pill--auto" + (showAuto ? " active" : "")}
                onClick={() => setShowAuto((prev) => !prev)}
                aria-pressed={showAuto}
              >
                Auto
              </button>
              <button
                type="button"
                className={"cards-filter-pill cards-filter-pill--relic" + (showRelic ? " active" : "")}
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
                onClick={() => {
                  setSearch("");
                  setShowRC(false);
                  setShowAuto(false);
                  setShowRelic(false);
                }}
              >
                Clear
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No cards match your search.</p>
            </div>
          ) : (
            <div className="card-table-wrap">
              <div className="card-table-head">
                <span className="card-th">#</span>
                <span className="card-th">Name</span>
                <span className="card-th card-th--right">Attributes</span>
                <span className="card-th card-th--right">Parallel</span>
              </div>
              <div
                ref={containerRef}
                className="card-table-scroll"
                role="list"
                aria-label={data.name + " cards"}
              >
                {topSpacer > 0 && (
                  <div style={{ height: topSpacer }} aria-hidden="true" />
                )}
                {visibleCards.map((card) => (
                  <Link
                    key={card.uuid}
                    to={"/cards/" + card.uuid}
                    className="card-table-row"
                    role="listitem"
                  >
                    <span className="card-number">#{card.number}</span>
                    <span className="card-cell-name">
                      {card.card_name ||
                        card.subjects?.map((s) => s.name).join(", ") ||
                        "—"}
                    </span>
                    <span className="card-cell-chips">
                      {card.rookie_card && (
                        <span className="attr-chip attr-chip--rc">RC</span>
                      )}
                      {card.autograph && (
                        <span className="attr-chip attr-chip--auto">Auto</span>
                      )}
                      {card.relic && (
                        <span className="attr-chip attr-chip--relic">Relic</span>
                      )}
                      {card.serial_numbered && card.print_run && (
                        <span className="attr-chip attr-chip--serial">
                          #{card.print_run}
                        </span>
                      )}
                    </span>
                    <span className="card-cell-parallel">
                      {card.parallel ?? ""}
                    </span>
                  </Link>
                ))}
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
