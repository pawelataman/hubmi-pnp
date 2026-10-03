import type { ReactElement } from 'react';

import { useApiHealth, type ApiHealthState } from '../hooks/useApiHealth';

function getStatusLabel(state: ApiHealthState): string {
  switch (state.status) {
    case 'loading':
      return 'Checking connection';
    case 'connected':
      return 'API connected';
    case 'error':
      return 'Connection unavailable';
  }
}

export function ApiStatus(): ReactElement {
  const { state, retry } = useApiHealth();

  return (
    <section className="connection-card" aria-labelledby="connection-title">
      <div className="card-topline">
        <span className="eyebrow">Live connection</span>
        <span className={`status-badge status-${state.status}`} aria-live="polite">
          <span className="status-dot" aria-hidden="true" />
          {getStatusLabel(state)}
        </span>
      </div>
      <h2 id="connection-title">Your stack, working together.</h2>
      <p className="muted">A real request from React to your FastAPI backend.</p>
      <div className="connection-flow" aria-label="React connects to FastAPI through the API proxy">
        <div className="flow-node"><span className="node-icon">R</span><strong>React</strong><span>Frontend</span></div>
        <span className="flow-line" aria-hidden="true" />
        <code className="flow-endpoint">/api/v1/health</code>
        <span className="flow-line" aria-hidden="true" />
        <div className="flow-node"><span className="node-icon api-icon">F</span><strong>FastAPI</strong><span>Backend</span></div>
      </div>
      <div className="response-panel" aria-live="polite" aria-busy={state.status === 'loading'}>
        <div className="response-heading"><span>API response</span><code>GET /api/v1/health</code></div>
        {state.status === 'connected' && <pre>{JSON.stringify(state.data, null, 2)}</pre>}
        {state.status === 'loading' && <p className="response-message">Waiting for the backend…</p>}
        {state.status === 'error' && <p className="response-message error-message">{state.message}</p>}
      </div>
      <button className="secondary-button" type="button" onClick={retry} disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'Checking…' : 'Check connection again'}
      </button>
    </section>
  );
}

