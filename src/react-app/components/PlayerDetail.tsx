import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CardTable from "./CardTable";
import { Card } from "../lib/cards";

interface PlayerData {
  name: string;
  cards: Card[];
}

export default function PlayerDetail() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const decodedName = name ? decodeURIComponent(name) : "";

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setData(null);
    fetch("/api/players/" + encodeURIComponent(decodedName))
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setData(d); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [decodedName]);

  if (loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/players">Players</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="skeleton" style={{ width: "8rem", height: "0.8rem", display: "inline-block" }} />
        </div>
        <div className="set-detail-header">
          <div className="skeleton" style={{ width: "50%", height: "1.5rem", marginTop: "0.75rem" }} />
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/players">Players</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Not found</span>
        </div>
        <div className="empty-state" style={{ marginTop: "var(--sp-8)" }}>
          <p>Player not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/players">Players</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{data.name}</span>
      </div>

      <div className="set-detail-header">
        <h1 className="set-detail-title">{data.name}</h1>
      </div>

      <CardTable cards={data.cards} contextLabel={data.name + " cards"} mode="player" />
    </div>
  );
}
