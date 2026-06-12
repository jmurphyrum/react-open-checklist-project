import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Player {
  name: string;
  card_count: number;
}

export default function PlayerBrowser() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ limit: "500" });
    if (search) params.set("search", search);
    fetch("/api/players?" + params.toString())
      .then((r) => r.json())
      .then((data) => { setPlayers(data.players || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [search]);

  return (
    <div className="set-browser">
      <div className="filter-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search players..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search players"
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
        <div className="empty-state"><p>Failed to load players. Check your connection and try again.</p></div>
      )}

      {!loading && !error && players.length === 0 && (
        <div className="empty-state"><p>No players found.</p></div>
      )}

      {!loading && !error && players.length > 0 && (
        <div className="set-list" role="list">
          {players.map((player) => (
            <Link
              key={player.name}
              to={"/players/" + encodeURIComponent(player.name)}
              className="set-row"
              role="listitem"
            >
              <div className="set-row-body">
                <span className="set-name">{player.name}</span>
              </div>
              <span className="set-count">{player.card_count.toLocaleString()} cards</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
