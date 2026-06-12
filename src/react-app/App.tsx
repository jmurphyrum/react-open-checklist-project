import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import CardDetail from "./components/CardDetail";
import SetBrowser from "./components/SetBrowser";
import SetDetail from "./components/SetDetail";
import Validator from "./components/Validator";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4.5 8l2.5 2.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="nav">
          <div className="nav-inner">
            <NavLink to="/" className="nav-brand">
              <CheckIcon />
              Open Checklist
            </NavLink>
            <nav className="nav-links" aria-label="Main navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Browse
              </NavLink>
              <NavLink
                to="/validate"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Validator
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<SetBrowser />} />
            <Route path="/sets/:set_id" element={<SetDetail />} />
            <Route path="/cards/:uuid" element={<CardDetail />} />
            <Route path="/validate" element={<Validator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
