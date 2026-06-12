import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface CardSet {
  set_id: string;
  name: string;
  genre: string;
  manufacturer?: string;
  season?: string;
  card_count?: number;
  category: string[];
}

const GENRES = [
  { value: "", label: "All" },
  { value: "Sports", label: "Sports" },
  { value: "TCG", label: "TCG" },
  { value: "Non-Sport", label: "Non-Sport" },
];

function genreBadgeClass(genre: string): string {
  if (genre === "Sports") return "badge genre-badge--sports";
  if (genre === "TCG") return "badge genre-badge--tcg";
  if (genre === "Non-Sport") return "badge genre-badge--nonsport";
  return "badge genre-badge--unknown";
}

export default function SetBrowser() {
  const [genre, setGenre] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sets, setSets] = useState<CardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ limit: "100" });
    if (genre) params.set("genre", genre);
    if (search) params.set("search", search);
    fetch("/api/sets?" + params.toString())
      .then((r) => r.json())
      .then((data) => {
        setSets(data.sets || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [genre, search]);

  return (
    <div className="set-browser">
      <div className="filter-bar">
        <div className="genre-pills" role="group" aria-label="Filter by genre">
          {GENRES.map((g) => (
            <button
              key={g.value}
              className={"genre-pill" + (genre === g.value ? " active" : "")}
              onClick={() => setGenre(g.value)}
              aria-pressed={genre === g.value}
            >
              {g.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="search-input"
          placeholder="Search sets..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search sets"
        />
      </div>

      {loading && (
        <div className="set-list" aria-busy="true" aria-label="Loading sets">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="set-row skeleton-row">
              <span className="skeleton" style={{ width: "2.75rem", height: "1.125rem", borderRadius: "0.25rem" }} />
              <div className="set-row-body">
                <span className="skeleton" style={{ width: (50 + (i % 4) * 12) + "%", height: "0.9rem" }} />
                <span className="skeleton" style={{ width: "38%", height: "0.75rem", marginTop: "0.3rem" }} />
              </div>
              <span className="skeleton" style={{ width: "3.25rem", height: "0.75rem" }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="empty-state">
          <p>Failed to load sets. Check your connection and try again.</p>
        </div>
      )}

      {!loading && !error && sets.length === 0 && (
        <div className="empty-state">
          <p>No sets match this filter &mdash; try a different genre or clear the search.</p>
        </div>
      )}

      {!loading && !error && sets.length > 0 && (
        <div className="set-list" role="list">
          {sets.map((set) => (
            <Link key={set.set_id} to={"/sets/" + set.set_id} className="set-row" role="listitem">
              <span className={genreBadgeClass(set.genre)}>{set.genre}</span>
              <div className="set-row-body">
                <span className="set-name">{set.name}</span>
                {(set.manufacturer || set.season) && (
                  <span className="set-meta">
                    {[set.manufacturer, set.season].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
              {set.card_count != null && (
                <span className="set-count">{set.card_count} cards</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
