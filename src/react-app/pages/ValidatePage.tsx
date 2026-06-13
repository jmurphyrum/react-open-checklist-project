import { useState } from 'react';
import KPIRow from '../layout/KPIRow';

type ValidateType = 'card' | 'set';

interface ValidationError {
  message: string;
  instancePath?: string;
  schemaPath?: string;
}

interface ValidationResult {
  valid: boolean;
  schema?: string;
  errors?: ValidationError[];
  message?: string;
}

const CARD_EXAMPLE = `{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "number": "1",
  "set_id": "2026-topps-series-2",
  "subjects": [
    { "name": "Aaron Judge", "team": "New York Yankees", "role": "OF" }
  ],
  "rookie_card": false,
  "autograph": false,
  "relic": false,
  "serial_numbered": false
}`;

const SET_EXAMPLE = `{
  "set_id": "2026-topps-series-2",
  "name": "2026 Topps Series 2",
  "sport": "Baseball",
  "genre": "Base Set"
}`;

export default function ValidatePage() {
  const [json, setJson]       = useState('');
  const [type, setType]       = useState<ValidateType>('card');
  const [result, setResult]   = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseErr, setParseErr] = useState('');

  async function handleValidate() {
    setParseErr('');
    setResult(null);

    try {
      JSON.parse(json);
    } catch {
      setParseErr('Invalid JSON — check syntax before validating');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/validate?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        valid: false,
        message: 'Network error — could not reach the validation API',
      });
    } finally {
      setLoading(false);
    }
  }

  function loadExample() {
    setJson(type === 'card' ? CARD_EXAMPLE : SET_EXAMPLE);
    setResult(null);
    setParseErr('');
  }

  const kpis = [
    { label: 'Card Schema',  value: 'v0.1', sub: 'schema/cards.json' },
    { label: 'Set Schema',   value: 'v0.2', sub: 'schema/set.json' },
    { label: 'Validator',    value: 'AJV',  sub: 'JSON Schema draft-07' },
    { label: 'Schema Store', value: 'R2',   sub: 'Cloudflare object storage' },
  ];

  return (
    <>
      <KPIRow tiles={kpis} />

      <div className="page-header">
        <h1 className="page-title">JSON Validator</h1>
        <p className="page-subtitle">
          Validate card or set JSON against the R2-backed schemas before ingestion
        </p>
      </div>

      <div className="val-layout">
        {/* Input column */}
        <div className="val-col">
          <div className="val-col-hdr">
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                color: 'var(--c-text-3)',
              }}
            >
              JSON Input
            </span>
            <div className="type-toggle">
              <button
                className={'tt-btn' + (type === 'card' ? ' on' : '')}
                onClick={() => { setType('card'); setResult(null); setParseErr(''); }}
              >
                Card
              </button>
              <button
                className={'tt-btn' + (type === 'set' ? ' on' : '')}
                onClick={() => { setType('set'); setResult(null); setParseErr(''); }}
              >
                Set
              </button>
            </div>
          </div>

          <textarea
            className="json-area"
            value={json}
            onChange={e => {
              setJson(e.target.value);
              setParseErr('');
              setResult(null);
            }}
            placeholder={
              type === 'card'
                ? '{\n  "uuid": "...",\n  "number": "1",\n  "set_id": "...",\n  "subjects": [...],\n  ...\n}'
                : '{\n  "set_id": "...",\n  "name": "...",\n  ...\n}'
            }
            spellCheck={false}
            aria-label="JSON input"
            style={{ minHeight: 340 }}
          />

          {parseErr && <div className="parse-error">{parseErr}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={handleValidate}
              disabled={!json.trim() || loading}
            >
              {loading
                ? 'Validating…'
                : `Validate ${type === 'card' ? 'Card' : 'Set'}`
              }
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { setJson(''); setResult(null); setParseErr(''); }}
              disabled={!json && !result}
            >
              Clear
            </button>
            <button
              className="btn btn-ghost"
              onClick={loadExample}
              style={{ marginLeft: 'auto' }}
            >
              Load example
            </button>
          </div>
        </div>

        {/* Result column */}
        <div className="val-col">
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.11em',
              textTransform: 'uppercase',
              color: 'var(--c-text-3)',
            }}
          >
            Result
          </span>

          {!result && !loading && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                color: 'var(--c-text-3)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
              </svg>
              <span style={{ fontSize: 12 }}>
                Paste JSON and click Validate
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--c-text-3)',
                  fontFamily: 'var(--font-data)',
                }}
              >
                {type === 'card' ? 'schema/cards.json v0.1' : 'schema/set.json v0.2'}
              </span>
            </div>
          )}

          {loading && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--c-text-3)',
                fontFamily: 'var(--font-data)',
                fontSize: 12,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Validating against schema…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {result && (
            <div className={`result-box${result.valid ? ' ok' : ' err'}`}>
              <div className={`result-title${result.valid ? ' ok' : ' err'}`}>
                {result.valid ? '✓ Valid' : '✗ Invalid'}
                {result.schema && (
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 11,
                      fontFamily: 'var(--font-data)',
                      opacity: 0.7,
                    }}
                  >
                    {result.schema}
                  </span>
                )}
              </div>

              {result.message && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--c-text-2)',
                    marginBottom: 10,
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {result.message}
                </div>
              )}

              {result.valid && !result.errors?.length && !result.message && (
                <div style={{ color: 'var(--c-text-2)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                  All required fields are present and schema-compliant.
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.errors.map((err, i) => (
                    <div key={i}>
                      {err.instancePath && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--c-text-3)',
                            marginBottom: 2,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {err.instancePath}
                        </div>
                      )}
                      <div style={{ color: 'var(--c-text)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                        {err.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
