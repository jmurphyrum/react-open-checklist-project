import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teamAbbr } from "../lib/cards";

interface Team {
  team: string;
  card_count: number;
}

export default function TeamBrowser() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ limit: "200" });
    if (search) params.set("search", search);
    fetch("/api/teams?" + params.toString())
      .then((r) => r.json())
      .then((data) => { setTeams(data.teams || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [search]);

  return (
    <div className="set-browser">
      <div className="filter-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search teams..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search teams"
        />
      </div>

      {loading && (
        <div className="set-list" aria-busy="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="set-row skeleton-row">
              <div className="set-row-body">
                <span className="skeleton" style={{ width: (40 + (i % 4) * 10) + "%", height: "0.9rem" }} />
              </div>
              <span className="skeleton" style={{ width: "3.25rem", height: "0.75rem" }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="empty-state"><p>Failed to load teams. Check your connection and try again.</p></div>
      )}

      {!loading && !error && teams.length === 0 && (
        <div className="empty-state"><p>No teams found.</p></div>
      )}

      {!loading && !error && teams.length > 0 && (
        <div className="set-list" role="list">
          {teams.map((t) => (
            <Link
              key={t.team}
              to={"/teams/" + encodeURIComponent(t.team)}
              className="set-row"
              role="listitem"
            >
              <span className="browse-abbr">{teamAbbr(t.team)}</span>
              <div className="set-row-body">
                <span className="set-name">{t.team}</span>
              </div>
              <span className="set-count">{t.card_count.toLocaleString()} cards</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
