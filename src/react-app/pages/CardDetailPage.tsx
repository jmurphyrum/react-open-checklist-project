import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, cardSubsetDisplay, playerImageUrl } from '../lib/cards';
import KPIRow from '../layout/KPIRow';

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <div className="dossier-card-no-img">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span>No image</span>
    </div>
  );
}

export default function CardDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    fetch(`/api/cards/${uuid}`)
      .then(r => r.json())
      .then(d => { setCard(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return (
      <div className="intel-empty">
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--c-text-3)' }}>
          Loading card data…
        </span>
      </div>
    );
  }

  if (!card) {
    return <div className="intel-empty">Card not found</div>;
  }

  const primary  = card.subjects[0];
  const name     = card.card_name ?? primary?.name ?? 'Untitled';
  const imageUrl = primary ? playerImageUrl(primary.name) : null;
  const subset   = cardSubsetDisplay(card, true);

  const flags = [
    card.rookie_card    && { label: 'Rookie Card',      cls: 'ibadge ibadge-g' },
    card.autograph      && { label: 'Autograph',        cls: 'ibadge ibadge-b' },
    card.relic          && { label: 'Relic',            cls: 'ibadge ibadge-p' },
    card.serial_numbered && { label: 'Serial Numbered', cls: 'ibadge ibadge-y' },
  ].filter(Boolean) as { label: string; cls: string }[];

  const kpis = [
    {
      label: 'Card Number',
      value: `#${card.number}`,
      sub: card.set_name ?? card.set_id,
    },
    {
      label: 'Print Run',
      value: card.print_run ? `/${card.print_run}` : '∞',
      sub: card.serial_numbered ? 'serial numbered' : 'unlimited print run',
    },
    {
      label: 'Subjects',
      value: card.subjects.length,
      sub: card.subjects.slice(0, 2).map(s => s.name).join(', ') || '—',
    },
    {
      label: 'Attributes',
      value: flags.length || 'Base',
      sub: flags.map(f => f.label).join(' · ') || 'standard card',
    },
  ];

  const metaRows: { key: string; val: string; mono?: boolean }[] = [
    { key: 'Set',       val: card.set_name ?? card.set_id, mono: true },
    { key: 'Number',    val: `#${card.number}`,            mono: true },
    { key: 'Team',      val: primary?.team ?? '—' },
    { key: 'Role',      val: primary?.role ?? '—' },
    { key: 'Subset',    val: card.subset ?? 'Base' },
    { key: 'Variation', val: card.variation ?? '—' },
    { key: 'Parallel',  val: card.parallel ?? 'Base' },
    { key: 'Print Run', val: card.print_run ? `/${card.print_run}` : '∞', mono: true },
    { key: 'Rookie',    val: card.rookie_card    ? 'Yes' : 'No' },
    { key: 'Autograph', val: card.autograph      ? 'Yes' : 'No' },
    { key: 'Relic',     val: card.relic          ? 'Yes' : 'No' },
    { key: 'Serially #', val: card.serial_numbered ? 'Yes' : 'No' },
  ];

  const extLinks = [
    {
      label: 'PSA',
      href: `https://www.psacard.com/cardfacts`,
    },
    {
      label: 'COMC',
      href: `https://www.comc.com/`,
    },
    {
      label: 'eBay',
      href: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(name + ' ' + (card.set_name ?? card.set_id))}`,
    },
    {
      label: 'TCGplayer',
      href: `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(name)}`,
    },
  ];

  return (
    <>
      <KPIRow tiles={kpis} />

      <div className="page-header">
        <div className="page-breadcrumb">
          <Link to="/">Sets</Link>
          <span>›</span>
          <Link to={`/sets/${card.set_id}`}>{card.set_name ?? card.set_id}</Link>
          <span>›</span>
          <span style={{ color: 'var(--c-text-2)' }}>#{card.number}</span>
        </div>
        <h1 className="page-title">{name}</h1>
        <p className="page-subtitle">
          {[
            `Card #${card.number}`,
            subset || null,
            card.print_run ? `/${card.print_run}` : null,
          ].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="dossier">
        {/* Image column */}
        <div className="dossier-img-col">
          <div className="dossier-card-img">
            {imageUrl
              ? <img src={imageUrl} alt={name} loading="lazy" />
              : <ImagePlaceholder />
            }
          </div>

          {flags.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {flags.map(f => (
                <span
                  key={f.label}
                  className={f.cls}
                  style={{ justifyContent: 'center', padding: '5px 10px', fontSize: 11 }}
                >
                  {f.label}
                </span>
              ))}
            </div>
          )}

          {/* Subjects (if more than one) */}
          {card.subjects.length > 1 && (
            <div className="vtree" style={{ width: '100%' }}>
              <div className="vtree-title">Subjects</div>
              <div className="vlist">
                {card.subjects.map((s, i) => (
                  <div key={i} className="vitem">
                    <UserIcon />
                    <span className="vitem-name">{s.name}</span>
                    {s.team && <span className="vitem-run">{s.team}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data column */}
        <div className="dossier-data-col">
          <div
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-data)',
              color: 'var(--c-text-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Card Dossier
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--c-text)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            {name}
          </div>
          {primary?.team && (
            <div style={{ fontSize: 13, color: 'var(--c-text-2)', marginBottom: 16 }}>
              {primary.team}{primary.role ? ` · ${primary.role}` : ''}
            </div>
          )}

          {/* Metadata grid */}
          <div className="mgrid">
            {metaRows.map(row => (
              <div key={row.key} className="mgrid-cell">
                <div className="mgrid-key">{row.key}</div>
                <div className={`mgrid-val${row.mono ? ' m' : ''}`}>{row.val}</div>
              </div>
            ))}
          </div>

          {/* Variant position (if parallel or print run shows it's a variant) */}
          {(card.parallel || card.subset || card.print_run) && (
            <div className="vtree">
              <div className="vtree-title">Variant Position</div>
              <div className="vlist">
                <div className="vitem">
                  <span className="vitem-name">Base</span>
                  <span className="vitem-run">∞</span>
                </div>
                {card.subset && card.subset !== 'Base' && (
                  <div className={`vitem${!card.parallel ? ' current' : ''}`}>
                    <span className="vitem-name">{card.subset}</span>
                    <span className="vitem-run">
                      {!card.serial_numbered ? '∞' : card.print_run ? `/${card.print_run}` : ''}
                    </span>
                  </div>
                )}
                {card.parallel && (
                  <div className="vitem current">
                    <span className="vitem-name">{card.parallel}</span>
                    <span className="vitem-run">
                      {card.print_run ? `/${card.print_run}` : '∞'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External links */}
          <div className="ext-links">
            {extLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="ext-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalIcon />
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
