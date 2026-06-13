import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, cardSubsetDisplay, useVirtualScroll, ROW_HEIGHT } from '../lib/cards';
import KPIRow from '../layout/KPIRow';

interface SetData {
  set_id: string;
  name?: string;
  sport?: string;
  genre?: string;
  card_count?: number;
  cards: Card[];
}

type SortCol = 'number' | 'name' | 'parallel' | 'subset';

function SortArrow({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <span style={{ opacity: 0.25, marginLeft: 3 }}>↕</span>;
  return <span style={{ marginLeft: 3 }}>{asc ? '↑' : '↓'}</span>;
}

function CardFlags({ card }: { card: Card }) {
  return (
    <span style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {card.rookie_card    && <span className="ibadge ibadge-g">RC</span>}
      {card.autograph      && <span className="ibadge ibadge-b">AUTO</span>}
      {card.relic          && <span className="ibadge ibadge-p">RELIC</span>}
      {card.serial_numbered && card.print_run && (
        <span className="ibadge ibadge-y">/{card.print_run}</span>
      )}
    </span>
  );
}

function parseSortNum(s: string): number | null {
  const n = parseFloat(s.replace(/[^\d.]/g, ''));
  return isNaN(n) ? null : n;
}

export default function SetDetailPage() {
  const { set_id } = useParams<{ set_id: string }>();
  const [data, setData]     = useState<SetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [col, setCol]         = useState<SortCol>('number');
  const [asc, setAsc]         = useState(true);
  const [rcOnly, setRcOnly]   = useState(false);
  const [autoOnly, setAutoOnly] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!set_id) return;
    setLoading(true);
    setSearch('');
    setRcOnly(false);
    setAutoOnly(false);
    fetch(`/api/sets/${set_id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [set_id]);

  const cards = data?.cards ?? [];

  const filtered = cards.filter(c => {
    if (rcOnly && !c.rookie_card) return false;
    if (autoOnly && !c.autograph) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    const name = (c.card_name ?? '').toLowerCase();
    const subs = c.subjects.map(s => s.name.toLowerCase()).join(' ');
    const num  = c.number.toLowerCase();
    return name.includes(q) || subs.includes(q) || num.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = '', bv = '';
    if (col === 'number') {
      const an = parseSortNum(a.number);
      const bn = parseSortNum(b.number);
      if (an !== null && bn !== null) return asc ? an - bn : bn - an;
      av = a.number; bv = b.number;
    } else if (col === 'name') {
      av = a.card_name ?? a.subjects[0]?.name ?? '';
      bv = b.card_name ?? b.subjects[0]?.name ?? '';
    } else if (col === 'parallel') {
      av = a.parallel ?? '';
      bv = b.parallel ?? '';
    } else if (col === 'subset') {
      av = a.subset ?? '';
      bv = b.subset ?? '';
    }
    return asc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const { range, topSpacer, bottomSpacer } = useVirtualScroll(
    sorted.length,
    containerRef,
  );

  function sort(c: SortCol) {
    if (c === col) setAsc(v => !v);
    else { setCol(c); setAsc(true); }
  }

  const rcCount    = cards.filter(c => c.rookie_card).length;
  const autoCount  = cards.filter(c => c.autograph).length;

  // Total known physical copies: sum print_run for every serial-numbered design.
  // Unlimited (non-serial) cards have an unknown print quantity and are counted separately.
  const serialCards    = cards.filter(c => c.serial_numbered && c.print_run != null);
  const knownPrints    = serialCards.reduce((sum, c) => sum + (c.print_run ?? 0), 0);
  const unlimitedCount = cards.filter(c => !c.serial_numbered).length;

  const kpis = [
    {
      label: 'Cards',
      value: cards.length.toLocaleString(),
      sub: 'unique designs in checklist',
    },
    { label: 'Rookie Cards', value: loading ? '—' : rcCount,    sub: 'across set' },
    { label: 'Autographs',   value: loading ? '—' : autoCount,  sub: 'signed cards' },
    {
      label: 'Known Prints',
      value: loading ? '—' : knownPrints.toLocaleString(),
      sub: loading
        ? ''
        : `${serialCards.length.toLocaleString()} serial · ${unlimitedCount.toLocaleString()} unlimited`,
    },
  ];

  if (loading) {
    return (
      <>
        <KPIRow tiles={[
          { label: 'Cards', value: '—' },
          { label: 'Rookie Cards', value: '—' },
          { label: 'Autographs', value: '—' },
          { label: 'Known Prints', value: '—' },
        ]} />
        <div className="page-header">
          <div className="page-breadcrumb">
            <Link to="/">Sets</Link>
            <span>›</span>
          </div>
          <div
            style={{
              height: 20, width: 300,
              background: 'var(--c-surface-up)',
              borderRadius: 4,
              animation: 'skel-shimmer 1.4s ease-in-out infinite',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
        <div className="intel-loading">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="skel-row" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </>
    );
  }

  if (!data) {
    return <div className="intel-empty">Set not found</div>;
  }

  const title = data.name || data.set_id;

  return (
    <>
      <KPIRow tiles={kpis} />

      <div className="page-header">
        <div className="page-breadcrumb">
          <Link to="/">Sets</Link>
          <span>›</span>
          <span style={{ color: 'var(--c-text-2)' }}>{title}</span>
        </div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">
          {[data.sport, data.genre, set_id].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="intel-filter-bar">
        <input
          className="intel-search"
          placeholder="Search by name, player, or #…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search cards in this set"
        />
        <button
          className={'btn btn-ghost' + (rcOnly ? '' : '')}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            ...(rcOnly
              ? { background: 'var(--c-green-dim)', borderColor: 'rgba(16,185,129,0.35)', color: 'var(--c-green)' }
              : {}),
          }}
          onClick={() => setRcOnly(v => !v)}
        >
          RC only
        </button>
        <button
          className="btn btn-ghost"
          style={{
            padding: '4px 10px',
            fontSize: 11,
            ...(autoOnly
              ? { background: 'var(--c-blue-dim)', borderColor: 'rgba(96,165,250,0.35)', color: 'var(--c-blue)' }
              : {}),
          }}
          onClick={() => setAutoOnly(v => !v)}
        >
          Auto only
        </button>
        <span className="intel-count">
          {sorted.length.toLocaleString()} {sorted.length === 1 ? 'card' : 'cards'}
        </span>
      </div>

      <div
        className="dtable-wrap"
        ref={containerRef}
        style={{ height: `calc(100vh - var(--topbar-h) - var(--status-h) - 180px)` }}
      >
        <table className="dtable">
          <thead>
            <tr>
              <th
                className="sort"
                style={{ width: 64 }}
                onClick={() => sort('number')}
              >
                # <SortArrow active={col === 'number'} asc={asc} />
              </th>
              <th className="sort" onClick={() => sort('name')}>
                Name <SortArrow active={col === 'name'} asc={asc} />
              </th>
              <th>Flags</th>
              <th className="sort" onClick={() => sort('parallel')}>
                Parallel <SortArrow active={col === 'parallel'} asc={asc} />
              </th>
              <th className="sort" onClick={() => sort('subset')}>
                Subset <SortArrow active={col === 'subset'} asc={asc} />
              </th>
              <th style={{ width: 72 }} />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={6}
                style={{ height: topSpacer, padding: 0, border: 'none' }}
              />
            </tr>
            {sorted.slice(range.start, range.end).map(card => {
              const primary = card.card_name ?? card.subjects[0]?.name ?? 'Untitled';
              const team    = card.subjects[0]?.team;
              const subset  = cardSubsetDisplay(card, false);
              return (
                <tr key={card.uuid} style={{ height: ROW_HEIGHT }}>
                  <td
                    className="td-m"
                    style={{ fontSize: 11, color: 'var(--c-text-3)', paddingTop: 0, paddingBottom: 0 }}
                  >
                    {card.number}
                  </td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <div
                      className="td-p"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 280,
                      }}
                    >
                      {primary}
                    </div>
                    {team && (
                      <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 1 }}>
                        {team}
                      </div>
                    )}
                  </td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <CardFlags card={card} />
                  </td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                    {card.parallel
                      ? <span className="ibadge">{card.parallel}</span>
                      : <span className="td-dim">Base</span>
                    }
                  </td>
                  <td
                    className="td-dim"
                    style={{
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                  >
                    {subset || '—'}
                  </td>
                  <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <Link
                      to={`/cards/${card.uuid}`}
                      className="row-action"
                      onClick={e => e.stopPropagation()}
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td
                colSpan={6}
                style={{ height: bottomSpacer, padding: 0, border: 'none' }}
              />
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
