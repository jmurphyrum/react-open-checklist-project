import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface Card {
  uuid: string;
  number: string;
  card_name?: string;
  subjects: { name: string; team?: string; role?: string }[];
  rookie_card: boolean;
  autograph: boolean;
  parallel?: string;
}

interface SetData {
  set_id: string;
  name: string;
  genre: string;
  manufacturer?: string;
  season?: string;
  description?: string;
  cards: Card[];
}

export default function SetDetail() {
  const { set_id } = useParams();
  const [data, setData] = useState<SetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sets/${set_id}`)
      .then((response) => response.json())
      .then((responseData) => {
        setData(responseData);
        setLoading(false);
      });
  }, [set_id]);

  if (loading) return <div>Loading set...</div>;
  if (!data) return <div>Set not found</div>;

  return (
    <div>
      <Link to="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
        Back to sets
      </Link>
      <h1 style={{ marginTop: "0.5rem" }}>{data.name}</h1>
      <p style={{ color: "#4b5563" }}>{data.description}</p>

      <h2 style={{ marginTop: "2rem", fontSize: "1.25rem" }}>Cards ({data.cards?.length || 0})</h2>
      <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
        {data.cards?.map((card) => (
          <Link key={card.uuid} to={`/cards/${card.uuid}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                padding: "0.75rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, marginRight: "0.75rem" }}>#{card.number}</span>
                <span>{card.card_name || card.subjects?.map((subject) => subject.name).join(", ")}</span>
                {card.rookie_card && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.75rem",
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    RC
                  </span>
                )}
                {card.autograph && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.75rem",
                      background: "#dbeafe",
                      color: "#1e40af",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    Auto
                  </span>
                )}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>{card.parallel}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
