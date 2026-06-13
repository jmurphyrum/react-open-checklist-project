interface Tile {
  label: string;
  value: string | number;
  sub?: string;
}

export default function KPIRow({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="kpi-row">
      {tiles.map(tile => (
        <div key={tile.label} className="kpi-tile">
          <div className="kpi-label">{tile.label}</div>
          <div className="kpi-value">{tile.value}</div>
          {tile.sub && <div className="kpi-sub">{tile.sub}</div>}
        </div>
      ))}
    </div>
  );
}
