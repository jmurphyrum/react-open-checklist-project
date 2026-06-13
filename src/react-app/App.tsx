import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Shell from './layout/Shell';
import Dashboard from './pages/Dashboard';
import SetDetailPage from './pages/SetDetailPage';
import CardDetailPage from './pages/CardDetailPage';
import ValidatePage from './pages/ValidatePage';
import PlayerBrowser from './components/PlayerBrowser';
import PlayerDetail from './components/PlayerDetail';
import TeamBrowser from './components/TeamBrowser';
import TeamDetail from './components/TeamDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/sets/:set_id"  element={<SetDetailPage />} />
          <Route path="/cards/:uuid"   element={<CardDetailPage />} />
          <Route path="/validate"      element={<ValidatePage />} />
          <Route path="/players"       element={<div className="legacy-content"><PlayerBrowser /></div>} />
          <Route path="/players/:name" element={<div className="legacy-content"><PlayerDetail /></div>} />
          <Route path="/teams"         element={<div className="legacy-content"><TeamBrowser /></div>} />
          <Route path="/teams/:name"   element={<div className="legacy-content"><TeamDetail /></div>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
