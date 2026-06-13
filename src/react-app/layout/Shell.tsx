import { useState } from 'react';
import './intel.css';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="shell">
      <TopBar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="body-row">
        <Sidebar collapsed={collapsed} />
        <div className="content">{children}</div>
      </div>
      <footer className="statusbar">
        <span>Open Checklist</span>
        <span className="sb-dot">·</span>
        <span>Card Market Intelligence</span>
        <div className="sb-status">
          <div className="sb-pulse" />
          <span>API online</span>
        </div>
      </footer>
    </div>
  );
}
