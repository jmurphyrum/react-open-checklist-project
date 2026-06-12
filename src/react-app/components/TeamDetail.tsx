import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CardTable from "./CardTable";
import { Card } from "../lib/cards";

interface TeamData {
  team: string;
  cards: Card[];
}

export default function TeamDetail() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const decodedName = name ? decodeURIComponent(name) : "";

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setData(null);
    fetch("/api/teams/" + encodeURIComponent(decodedName))
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
          <Link to="/teams">Teams</Link>
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
          <Link to="/teams">Teams</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Not found</span>
        </div>
        <div className="empty-state" style={{ marginTop: "var(--sp-8)" }}>
          <p>Team not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/teams">Teams</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{data.team}</span>
      </div>

      <div className="set-detail-header">
        <h1 className="set-detail-title">{data.team}</h1>
      </div>

      <CardTable cards={data.cards} contextLabel={data.team + " cards"} mode="team" />
    </div>
  );
}
