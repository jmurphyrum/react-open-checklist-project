import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface CardData {
  uuid: string;
  number: string;
  genre: string;
  sport?: string;
  set_id: string;
  card_name?: string;
  description?: string;
  subjects: { name: string; role?: string; team?: string }[];
  parallel?: string;
  print_run?: number;
  serial_numbered: boolean;
  autograph: boolean;
  relic: boolean;
  rookie_card: boolean;
  release_date?: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
}

export default function CardDetail() {
  const { uuid } = useParams();
  const [card, setCard] = useState<CardData | null>(null);

  useEffect(() => {
    fetch(`/api/cards/${uuid}`)
      .then((response) => response.json())
      .then(setCard);
  }, [uuid]);

  if (!card) return <div>Loading card...</div>;

  return (
    <div>
      <Link to={`/sets/${card.set_id}`} style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
        Back to set
      </Link>
      <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.card_name || `Card ${card.number}`}
              style={{ width: "100%", maxWidth: "400px", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: "400px",
                aspectRatio: "2.5/3.5",
                background: "#f3f4f6",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
              }}
            >
              No Image
            </div>
          )}
        </div>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <h1>{card.card_name || `Card #${card.number}`}</h1>
          <div style={{ color: "#4b5563", marginTop: "0.5rem" }}>{card.description}</div>

          <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
            <div>
              <strong>Set:</strong> {card.set_id}
            </div>
            <div>
              <strong>Number:</strong> {card.number}
            </div>
            <div>
              <strong>Genre:</strong> {card.genre}
            </div>
            {card.sport && (
              <div>
                <strong>Sport:</strong> {card.sport}
              </div>
            )}
            {card.parallel && (
              <div>
                <strong>Parallel:</strong> {card.parallel}
              </div>
            )}
            {card.print_run && (
              <div>
                <strong>Print Run:</strong> {card.print_run}
              </div>
            )}
            {card.release_date && (
              <div>
                <strong>Release:</strong> {card.release_date}
              </div>
            )}
          </div>

          <h3 style={{ marginTop: "1.5rem" }}>Subjects</h3>
          {card.subjects?.map((subject, index) => (
            <div key={`${subject.name}-${index}`} style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: "0.375rem", marginTop: "0.5rem" }}>
              <div style={{ fontWeight: 600 }}>{subject.name}</div>
              {subject.role && <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{subject.role}</div>}
              {subject.team && <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{subject.team}</div>}
            </div>
          ))}

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {card.rookie_card && <span style={{ background: "#dcfce7", color: "#166534", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem" }}>Rookie Card</span>}
            {card.autograph && <span style={{ background: "#dbeafe", color: "#1e40af", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem" }}>Autograph</span>}
            {card.relic && <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem" }}>Relic</span>}
            {card.serial_numbered && <span style={{ background: "#fef3c7", color: "#92400e", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.875rem" }}>Serial Numbered</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
