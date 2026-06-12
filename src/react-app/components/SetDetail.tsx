import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CardTable from "./CardTable";
import { Card } from "../lib/cards";

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

export default function SetDetail() {
  const { set_id } = useParams();
  const [data, setData] = useState<SetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setData(null);
    fetch("/api/sets/" + set_id)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setData(d); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [set_id]);

  if (loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/">Sets</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="skeleton" style={{ width: "8rem", height: "0.8rem", display: "inline-block" }} />
        </div>
        <div className="set-detail-header">
          <span className="skeleton" style={{ width: "3rem", height: "1.125rem", display: "inline-block", borderRadius: "0.25rem" }} />
          <div className="skeleton" style={{ width: "60%", height: "1.5rem", marginTop: "0.75rem" }} />
          <div className="skeleton" style={{ width: "40%", height: "0.9rem", marginTop: "0.5rem" }} />
        </div>
        <div className="set-section-header" style={{ marginBottom: "var(--sp-3)" }}>
          <div className="skeleton" style={{ width: "4rem", height: "1rem" }} />
          <div className="skeleton" style={{ width: "2rem", height: "0.8rem" }} />
        </div>
        <div className="cards-filter-bar">
          <div className="skeleton" style={{ width: "16rem", height: "2.25rem", borderRadius: "var(--r)" }} />
          <div className="skeleton" style={{ width: "10rem", height: "2.25rem", borderRadius: "var(--r)" }} />
        </div>
        <div className="skeleton cards-team-filter" style={{ height: "2.25rem", borderRadius: "var(--r)" }} />
        <div className="card-table">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card-table-row">
              <span className="skeleton" style={{ width: "2.5rem", height: "0.75rem" }} />
              <span className="skeleton" style={{ width: 30 + (i % 4) * 10 + "%", height: "0.875rem" }} />
              <span /><span /><span /><span />
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
          <Link to="/">Sets</Link>
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
        <Link to="/">Sets</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{data.name}</span>
      </div>

      <div className="set-detail-header">
        <span className={genreBadgeClass(data.genre)}>{data.genre}</span>
        <h1 className="set-detail-title">{data.name}</h1>
        {data.description && <p className="set-detail-desc">{data.description}</p>}
        <div className="set-detail-meta-row">
          {data.manufacturer && (
            <span className="set-detail-meta-item"><strong>{data.manufacturer}</strong></span>
          )}
          {data.season && (
            <span className="set-detail-meta-item">Season <strong>{data.season}</strong></span>
          )}
          {data.category && data.category.length > 0 && (
            <span className="set-detail-meta-item">
              {data.category.map((cat) => (
                <span key={cat} className="attr-chip" style={{ marginLeft: "var(--sp-1)" }}>{cat}</span>
              ))}
            </span>
          )}
        </div>
      </div>

      <CardTable cards={data.cards} contextLabel={data.name + " cards"} mode="set" />
    </div>
  );
}
