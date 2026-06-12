import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import CardDetail from "./components/CardDetail";
import SetBrowser from "./components/SetBrowser";
import SetDetail from "./components/SetDetail";
import Validator from "./components/Validator";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <nav
          style={{
            borderBottom: "1px solid #e5e7eb",
            padding: "1rem 1.5rem",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <Link to="/" style={{ fontWeight: 700, fontSize: "1.25rem", color: "#ea580c", textDecoration: "none" }}>
            Open Checklist
          </Link>
          <Link to="/" style={{ color: "#374151", textDecoration: "none" }}>
            Browse
          </Link>
          <Link to="/validate" style={{ color: "#374151", textDecoration: "none" }}>
            Validator
          </Link>
        </nav>
        <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem" }}>
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
