import { useState } from "react";

type SchemaType = "card" | "set";

interface ValidationError {
  instancePath?: string;
  message?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: ValidationError[];
  schema_version?: string;
}

export default function Validator() {
  const [input, setInput] = useState("");
  const [type, setType] = useState<SchemaType>("card");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function validate() {
    setLoading(true);
    let data: unknown;
    try {
      data = JSON.parse(input);
    } catch {
      setResult({ valid: false, error: "Invalid JSON" });
      setLoading(false);
      return;
    }

    const response = await fetch(`/api/validate?type=${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setResult(await response.json());
    setLoading(false);
  }

  return (
    <div>
      <h1>Schema Validator</h1>
      <div style={{ marginBottom: "1rem" }}>
        <select value={type} onChange={(event) => setType(event.target.value as SchemaType)} style={{ padding: "0.5rem", marginRight: "0.5rem" }}>
          <option value="card">Card Schema v0.1</option>
          <option value="set">Set Schema v0.2</option>
        </select>
      </div>
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={`Paste JSON here...\n\nExample:\n{\n  "uuid": "11111111-1111-1111-1111-111111111111",\n  "number": "1",\n  "genre": "Sports",\n  "set_id": "2023-topps-series-1",\n  "subjects": [{"name": "Aaron Judge"}]\n}`}
        style={{
          width: "100%",
          height: "300px",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          padding: "0.75rem",
          borderRadius: "0.375rem",
          border: "1px solid #d1d5db",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={validate}
        disabled={loading}
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 1.5rem",
          background: "#ea580c",
          color: "#fff",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
        }}
      >
        {loading ? "Validating..." : "Validate"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            borderRadius: "0.375rem",
            background: result.valid ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${result.valid ? "#86efac" : "#fecaca"}`,
          }}
        >
          <div style={{ fontWeight: 600, color: result.valid ? "#166534" : "#991b1b" }}>{result.valid ? "Valid" : "Invalid"}</div>
          {result.error && <div style={{ fontSize: "0.875rem", color: "#7f1d1d", marginTop: "0.25rem" }}>{result.error}</div>}
          {result.schema_version && <div style={{ fontSize: "0.875rem", color: "#4b5563", marginTop: "0.25rem" }}>Schema: v{result.schema_version}</div>}
          {result.errors && result.errors.length > 0 && (
            <ul style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#7f1d1d" }}>
              {result.errors.map((error, index) => (
                <li key={`${error.instancePath || "root"}-${index}`}>
                  {error.instancePath || "root"}: {error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
