import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface Card {
  uuid: string;
  number: string;
  card_name?: string;
  subjects: { name: string; team?: string; role?: string }[];
  rookie_card: boolean;
  autograph: boolean;
  relic: boolean;
  parallel?: string;
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

export default function SetDetail() {
  const { set_id } = useParams();
  const [data, setData] = useState<SetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch("/api/sets/" + set_id)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((responseData) => {
        if (responseData) { setData(responseData); setLoading(false); }
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [set_id]);

  if (loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/">Browse</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="skeleton" style={{ width: "8rem", height: "0.8rem", display: "inline-block" }} />
        </div>
        <div className="set-detail-header">
          <span className="skeleton" style={{ width: "3rem", height: "1.125rem", display: "inline-block", borderRadius: "0.25rem" }} />
          <div className="skeleton" style={{ width: "60%", height: "1.5rem", marginTop: "0.75rem" }} />
          <div className="skeleton" style={{ width: "40%", height: "0.9rem", marginTop: "0.5rem" }} />
        </div>
        <div className="set-section-header">
          <div className="skeleton" style={{ width: "4rem", height: "1rem" }} />
          <div className="skeleton" style={{ width: "2rem", height: "0.8rem" }} />
        </div>
        <div className="card-table">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-table-row" style={{ pointerEvents: "none" }}>
              <span className="skeleton" style={{ width: "2.5rem", height: "0.8rem" }} />
              <span className="skeleton" style={{ width: (40 + (i % 3) * 15) + "%", height: "0.9rem" }} />
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

      <div className="set-section-header">
        <h2 className="set-section-title">Cards</h2>
        <span className="set-section-count">{data.cards?.length ?? 0}</span>
      </div>

      {(!data.cards || data.cards.length === 0) ? (
        <div className="empty-state">
          <p>No cards in this set yet.</p>
        </div>
      ) : (
        <div className="card-table">
          {data.cards.map((card) => (
            <Link key={card.uuid} to={"/cards/" + card.uuid} className="card-table-row">
              <span className="card-number">#{card.number}</span>
              <span className="card-cell-name">
                {card.card_name || card.subjects?.map((s) => s.name).join(", ") || "—"}
              </span>
              <span className="card-cell-chips">
                {card.rookie_card && <span className="attr-chip attr-chip--rc">RC</span>}
                {card.autograph   && <span className="attr-chip attr-chip--auto">Auto</span>}
                {card.relic       && <span className="attr-chip attr-chip--relic">Relic</span>}
              </span>
              <span className="card-cell-parallel">{card.parallel ?? ""}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
