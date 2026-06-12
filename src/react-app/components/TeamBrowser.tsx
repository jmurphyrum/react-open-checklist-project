import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teamAbbr, teamLogoUrl } from "../lib/cards";

interface Team {
  team: string;
  card_count: number;
}

const GENRES = [
  { value: "", label: "All" },
  { value: "Sports", label: "Sports" },
  { value: "TCG", label: "TCG" },
  { value: "Non-Sport", label: "Non-Sport" },
];

const SPORTS = [
  { value: "", label: "All" },
  { value: "Baseball", label: "Baseball" },
  { value: "Football", label: "Football" },
  { value: "Basketball", label: "Basketball" },
  { value: "Hockey", label: "Hockey" },
];

function TeamLogoImg({ team }: { team: string }) {
  const [failed, setFailed] = useState(false);
  const url = teamLogoUrl(team);
  if (!url || failed) {
    return <span className="team-logo-abbr">{teamAbbr(team)}</span>;
  }
  return (
    <img
      src={url}
      alt={team}
      className="team-logo-img"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function TeamBrowser() {
  const [genre, setGenre] = useState("");
  const [sport, setSport] = useState("");
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
    if (genre) params.set("genre", genre);
    if (sport) params.set("sport", sport);
    fetch("/api/teams?" + params.toString())
      .then((r) => r.json())
      .then((data) => { setTeams(data.teams || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [search, genre, sport]);

  return (
    <div className="set-browser">
      <div className="filter-bar">
        <div className="genre-pills" role="group" aria-label="Genre">
          {GENRES.map((g) => (
            <button
              key={g.value}
              className={"genre-pill" + (genre === g.value ? " active" : "")}
              onClick={() => setGenre(g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="genre-pills" role="group" aria-label="Sport">
          {SPORTS.map((s) => (
            <button
              key={s.value}
              className={"genre-pill" + (sport === s.value ? " active" : "")}
              onClick={() => setSport(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
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
        <div className="team-grid" aria-busy="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="team-logo-card team-logo-card--skeleton">
              <div className="skeleton" style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--r)" }} />
              <div className="skeleton" style={{ width: (50 + (i % 3) * 15) + "%", height: "0.7rem", borderRadius: "var(--r-sm)" }} />
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
        <div className="team-grid">
          {teams.map((t) => (
            <Link
              key={t.team}
              to={"/teams/" + encodeURIComponent(t.team)}
              className="team-logo-card"
            >
              <TeamLogoImg team={t.team} />
              <span className="team-logo-name">{t.team}</span>
              <span className="team-logo-count">{t.card_count.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
