import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Set {
  set_id: string;
  name: string;
  genre: string;
  manufacturer?: string;
  season?: string;
  card_count?: number;
  category: string[];
}

export default function SetBrowser() {
  const [genre, setGenre] = useState("");
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sets?limit=100&genre=${encodeURIComponent(genre)}`)
      .then((response) => response.json())
      .then((data) => {
        setSets(data.sets || []);
        setLoading(false);
      });
  }, [genre]);

  if (loading) return <div>Loading sets...</div>;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <select
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}
        >
          <option value="">All Genres</option>
          <option value="Sports">Sports</option>
          <option value="TCG">TCG</option>
          <option value="Non-Sport">Non-Sport</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {sets.map((set) => (
          <Link key={set.set_id} to={`/sets/${set.set_id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1rem", background: "#fff" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>
                {set.genre}
              </div>
              <h3 style={{ margin: "0.25rem 0 0", fontSize: "1.125rem" }}>{set.name}</h3>
              <div style={{ fontSize: "0.875rem", color: "#4b5563", marginTop: "0.5rem" }}>
                {[set.manufacturer, set.season, set.card_count ? `${set.card_count} cards` : null].filter(Boolean).join(" - ")}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                {set.category?.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      fontSize: "0.75rem",
                      background: "#ffedd5",
                      color: "#9a3412",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
