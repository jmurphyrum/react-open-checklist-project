import { useState } from "react";

const TYPES = [
  { value: "card", label: "Card" },
  { value: "set",  label: "Set"  },
] as const;

type ValidatorType = "card" | "set";

interface ValidationResult {
  valid: boolean;
  errors?: { instancePath?: string; message?: string; params?: Record<string, unknown> }[];
}

export default function Validator() {
  const [type, setType]           = useState<ValidatorType>("card");
  const [json, setJson]           = useState("");
  const [result, setResult]       = useState<ValidationResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function validate() {
    setLoading(true);
    setResult(null);
    setFetchError(null);
    try {
      const r = await fetch("/api/validate?type=" + type, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      const data = await r.json();
      setResult(data);
    } catch {
      setFetchError("Could not reach the validation API.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (json.trim()) validate();
    }
  }

  const isEmpty = json.trim() === "";

  return (
    <div className="validator-layout">
      <div className="validator-header">
        <h1 className="validator-title">Validator</h1>
        <p className="validator-desc">
          Paste a card or set JSON record to check it against the live R2-backed schema.
        </p>
      </div>

      <div className="validator-type-selector" role="group" aria-label="Schema type">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={"validator-type-btn" + (type === t.value ? " active" : "")}
            onClick={() => { setType(t.value); setResult(null); setFetchError(null); }}
            aria-pressed={type === t.value}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="validator-editor">
        <label htmlFor="validator-json" className="validator-editor-label">
          JSON — <span className="validator-schema-hint">{type} schema v{type === "card" ? "0.1" : "0.2"}</span>
        </label>
        <textarea
          id="validator-json"
          className="validator-textarea"
          value={json}
          onChange={(e) => { setJson(e.target.value); setResult(null); setFetchError(null); }}
          onKeyDown={handleKeyDown}
          placeholder={"Paste your " + type + " JSON here..."}
          spellCheck={false}
          rows={16}
          aria-label={"JSON input for " + type + " validation"}
        />
      </div>

      <div className="validator-actions">
        <button
          type="button"
          className="validator-btn"
          onClick={validate}
          disabled={isEmpty || loading}
          aria-busy={loading}
        >
          {loading ? "Validating…" : "Validate"}
        </button>
        <span className="validator-hint">or Cmd+Enter</span>
      </div>

      {fetchError && (
        <div className="validator-result validator-result--error" role="alert">
          <p className="validator-result-summary">{fetchError}</p>
        </div>
      )}

      {result && (
        <div
          className={"validator-result " + (result.valid ? "validator-result--valid" : "validator-result--invalid")}
          role="status"
          aria-live="polite"
        >
          {result.valid ? (
            <p className="validator-result-summary">
              <span className="validator-status-icon" aria-hidden="true">✓</span>
              Valid {type} record
            </p>
          ) : (
            <>
              <p className="validator-result-summary">
                <span className="validator-status-icon" aria-hidden="true">✗</span>
                {result.errors?.length ?? 0} validation {result.errors?.length === 1 ? "error" : "errors"}
              </p>
              {result.errors && result.errors.length > 0 && (
                <ul className="validator-error-list" aria-label="Validation errors">
                  {result.errors.map((err, i) => (
                    <li key={i} className="validator-error-item">
                      {err.instancePath && (
                        <span className="validator-error-path">{err.instancePath}</span>
                      )}
                      <span className="validator-error-msg">{err.message ?? "Unknown error"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
