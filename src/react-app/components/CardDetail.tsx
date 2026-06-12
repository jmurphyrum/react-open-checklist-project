import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface Subject {
  name: string;
  team?: string;
  role?: string;
  sport?: string;
}

interface CardData {
  uuid: string;
  number: string;
  card_name?: string;
  set_id: string;
  set_name?: string;
  set_image_url?: string;
  genre: string;
  rookie_card: boolean;
  autograph: boolean;
  relic: boolean;
  serial_numbered: boolean;
  parallel?: string;
  print_run?: number;
  subset?: string;
  variation?: string;
  manufacturer?: string;
  season?: string;
  subjects: Subject[];
  sports?: string[];
  category?: string[];
  image_url?: string;
  external_links?: { name: string; url: string }[];
  metadata?: Record<string, unknown>;
}

function isPlaceholder(url?: string | null): boolean {
  if (!url) return true;
  try {
    return new URL(url).hostname === "example.com";
  } catch {
    return true;
  }
}

function AttrRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <>
      <dt className="attr-label">{label}</dt>
      <dd className="attr-value">{value}</dd>
    </>
  );
}

export default function CardDetail() {
  const { uuid } = useParams();
  const [data, setData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isBoxFallback, setIsBoxFallback] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setData(null);
    setImgSrc(null);
    setIsBoxFallback(false);
    fetch("/api/cards/" + uuid)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d: CardData | null) => {
        if (!d) return;
        setData(d);
        setLoading(false);
        const cardImg = isPlaceholder(d.image_url) ? null : d.image_url!;
        const setImg = isPlaceholder(d.set_image_url) ? null : d.set_image_url!;
        setImgSrc(cardImg ?? setImg ?? null);
        setIsBoxFallback(!cardImg && !!setImg);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [uuid]);

  function handleImgError() {
    if (!data) return;
    const setImg = isPlaceholder(data.set_image_url) ? null : data.set_image_url!;
    if (setImg && imgSrc !== setImg) {
      setImgSrc(setImg);
      setIsBoxFallback(true);
    } else {
      setImgSrc(null);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/">Sets</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="skeleton" style={{ width: "8rem", height: "0.8rem", display: "inline-block" }} />
          <span className="breadcrumb-sep">/</span>
          <span className="skeleton" style={{ width: "5rem", height: "0.8rem", display: "inline-block" }} />
        </div>
        <div className="card-detail-layout">
          <div className="card-image-wrap">
            <div className="card-placeholder skeleton" />
          </div>
          <div className="card-detail-info-col">
            <div className="skeleton" style={{ width: "3rem", height: "1.125rem", borderRadius: "0.25rem" }} />
            <div className="skeleton" style={{ width: "70%", height: "1.5rem", marginTop: "0.75rem" }} />
            <div className="skeleton" style={{ width: "3rem", height: "0.8rem", marginTop: "0.5rem" }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/">Sets</Link>
        </div>
        <div className="empty-state" style={{ marginTop: "var(--sp-8)" }}>
          <p>Card not found.</p>
        </div>
      </div>
    );
  }

  const displayName = data.card_name || data.subjects?.map((s) => s.name).join(", ") || "Untitled";

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/">Sets</Link>
        <span className="breadcrumb-sep">/</span>
        {data.set_id && (
          <>
            <Link to={"/sets/" + data.set_id}>{data.set_name || data.set_id}</Link>
            <span className="breadcrumb-sep">/</span>
          </>
        )}
        <span>#{data.number}</span>
      </div>

      <div className="card-detail-layout">
        <div className="card-image-wrap">
          {imgSrc ? (
            <>
              <img
                src={imgSrc}
                alt={isBoxFallback ? (data.set_name || data.set_id) + " box" : displayName}
                className="card-image"
                loading="lazy"
                onError={handleImgError}
              />
              {isBoxFallback && (
                <p className="card-image-caption">Set box — no card image yet</p>
              )}
            </>
          ) : (
            <div className="card-placeholder">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="11" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 24l7-7 5 5 4-4 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>No image available</span>
            </div>
          )}
        </div>

        <div className="card-detail-info-col">
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center", flexWrap: "wrap", marginBottom: "var(--sp-3)" }}>
            {data.rookie_card && <span className="attr-chip attr-chip--rc">RC</span>}
            {data.autograph   && <span className="attr-chip attr-chip--auto">Auto</span>}
            {data.relic       && <span className="attr-chip attr-chip--relic">Relic</span>}
          </div>

          <h1 className="card-detail-title">{displayName}</h1>
          <p className="card-detail-number">#{data.number}</p>

          <dl className="attr-table">
            <AttrRow label="Set" value={
              data.set_id
                ? <Link to={"/sets/" + data.set_id}>{data.set_name || data.set_id}</Link>
                : null
            } />
            <AttrRow label="Genre"        value={data.genre} />
            <AttrRow label="Manufacturer" value={data.manufacturer} />
            <AttrRow label="Season"       value={data.season} />
            <AttrRow label="Subset"       value={data.subset} />
            <AttrRow label="Parallel"     value={data.parallel} />
            <AttrRow label="Print run"    value={data.print_run ? "#/" + data.print_run : null} />
            {data.sports && data.sports.length > 0 && (
              <AttrRow label="Sport" value={data.sports.join(", ")} />
            )}
            {data.category && data.category.length > 0 && (
              <AttrRow label="Category" value={
                <span style={{ display: "flex", gap: "var(--sp-1)", flexWrap: "wrap" }}>
                  {data.category.map((c) => <span key={c} className="attr-chip">{c}</span>)}
                </span>
              } />
            )}
          </dl>

          {data.subjects && data.subjects.length > 0 && (
            <section className="card-detail-subjects">
              <h2 className="card-detail-subjects-title">
                {data.subjects.length === 1 ? "Subject" : "Subjects"}
              </h2>
              <ul className="subjects-list">
                {data.subjects.map((s, i) => (
                  <li key={i} className="subject-item">
                    <span className="subject-name">{s.name}</span>
                    {(s.team || s.role || s.sport) && (
                      <span className="subject-meta">
                        {[s.role, s.team, s.sport].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.external_links && data.external_links.length > 0 && (
            <section className="card-detail-links">
              <h2 className="card-detail-subjects-title">External links</h2>
              <ul className="subjects-list">
                {data.external_links.map(({ name, url }) => (
                  <li key={name} className="subject-item">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="external-link">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
