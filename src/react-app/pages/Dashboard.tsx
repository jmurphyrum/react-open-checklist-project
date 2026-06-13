import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPIRow from '../layout/KPIRow';

interface SetRecord {
  set_id: string;
  name?: string;
  sport?: string;
  genre?: string;
  card_count?: number;
  years?: number[];
}

function fmt(n?: number): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function SportBadge({ sport }: { sport?: string }) {
  if (!sport) return <span className="td-dim">—</span>;
  const cls =
    sport.toLowerCase().includes('baseball') ? 'ibadge ibadge-b' :
    sport.toLowerCase().includes('basketball') ? 'ibadge ibadge-o' :
    sport.toLowerCase().includes('football') ? 'ibadge ibadge-g' :
    sport.toLowerCase().includes('hockey') ? 'ibadge ibadge-p' :
    'ibadge';
  return <span className={cls}>{sport}</span>;
}

export default function Dashboard() {
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/sets')
      .then(r => r.json())
      .then(data => {
        const list: SetRecord[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.sets)
            ? data.sets
            : [];
        setSets(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalCards = sets.reduce((s, r) => s + (r.card_count ?? 0), 0);
  const sports = [...new Set(sets.map(r => r.sport).filter(Boolean) as string[])].sort();

  const visible = sets.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q
      || (r.name ?? r.set_id).toLowerCase().includes(q)
      || r.set_id.includes(q);
    const matchS = !sport || r.sport === sport;
    return matchQ && matchS;
  });

  const kpis = [
    {
      label: 'Total Cards',
      value: totalCards > 0 ? totalCards.toLocaleString() : '—',
      sub: 'across all tracked sets',
    },
    {
      label: 'Sets Tracked',
      value: sets.length || '—',
      sub: 'in database',
    },
    {
      label: 'Sports',
      value: sports.length || '—',
      sub: sports.slice(0, 3).join(' · ') || 'loading…',
    },
    {
      label: 'Schema',
      value: 'v0.2',
      sub: 'card · set · JSON schemas',
    },
  ];

  return (
    <>
      <KPIRow tiles={kpis} />

      <div className="page-header">
        <h1 className="page-title">Sets</h1>
        <p className="page-subtitle">All tracked checklists in the database</p>
      </div>

      <div className="intel-filter-bar">
        <input
          className="intel-search"
          placeholder="Search by name or set ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search sets"
        />
        <select
          className="intel-select"
          value={sport}
          onChange={e => setSport(e.target.value)}
          aria-label="Filter by sport"
        >
          <option value="">All Sports</option>
          {sports.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(search || sport) && (
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => { setSearch(''); setSport(''); }}
          >
            Clear
          </button>
        )}
        <span className="intel-count">
          {loading ? '…' : `${visible.length} ${visible.length === 1 ? 'set' : 'sets'}`}
        </span>
      </div>

      <div className="dtable-wrap">
        {loading ? (
          <div className="intel-loading">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="skel-row"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="intel-empty">No sets match your filters</div>
        ) : (
          <table className="dtable">
            <thead>
              <tr>
                <th>Set Name</th>
                <th>Sport</th>
                <th>Genre</th>
                <th className="r">Cards</th>
                <th>Set ID</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {visible.map(set => {
                const name = set.name || set.set_id;
                return (
                  <tr
                    key={set.set_id}
                    onClick={() => navigate(`/sets/${set.set_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="td-p">{name}</span>
                      {set.years && set.years.length > 0 && (
                        <span
                          className="td-m"
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            color: 'var(--c-text-3)',
                          }}
                        >
                          {set.years[0]}
                        </span>
                      )}
                    </td>
                    <td><SportBadge sport={set.sport} /></td>
                    <td className="td-dim">{set.genre || '—'}</td>
                    <td className="td-m r" style={{ textAlign: 'right' }}>
                      {fmt(set.card_count)}
                    </td>
                    <td
                      className="td-m"
                      style={{
                        fontSize: 11,
                        color: 'var(--c-text-3)',
                        maxWidth: 220,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {set.set_id}
                    </td>
                    <td>
                      <button
                        className="row-action"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/sets/${set.set_id}`);
                        }}
                        aria-label={`Browse ${name}`}
                      >
                        Browse →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
