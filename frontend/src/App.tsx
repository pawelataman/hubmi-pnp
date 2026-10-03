import type { ReactElement } from 'react';

import { ApiStatus } from './components/ApiStatus';

interface StackItem {
  readonly number: string;
  readonly name: string;
  readonly description: string;
  readonly detail: string;
}

const stackItems: readonly StackItem[] = [
  {
    number: '01',
    name: 'React + TypeScript',
    description: 'A typed foundation for your interface.',
    detail: 'Vite · Fast refresh · Strict typing',
  },
  {
    number: '02',
    name: 'FastAPI',
    description: 'A clear starting point for your API.',
    detail: 'Pydantic · OpenAPI · Versioned routes',
  },
  {
    number: '03',
    name: 'Docker Compose',
    description: 'Bring the whole project up locally.',
    detail: 'Live reload · Health checks · One command',
  },
];

export function App(): ReactElement {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Hubmi home">
          <span className="brand-symbol" aria-hidden="true">
            h
          </span>
          hubmi
          <span className="brand-divider" />
          <span className="brand-caption">Project blueprint</span>
        </a>
        <a
          className="header-link"
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
        >
          API docs <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main>
        <section className="hero" aria-labelledby="page-title">
          <span className="eyebrow hero-eyebrow">
            <span className="small-dot" aria-hidden="true" />
            Full-stack starter
          </span>
          <h1 id="page-title">
            A clean start.
            <br />
            <span>Room to build.</span>
          </h1>
          <p className="hero-description">
            Your frontend, backend, and local environment are connected. Make
            this foundation your own.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#connection-title">
              Explore the stack <span aria-hidden="true">↓</span>
            </a>
            <code className="version-label">Blueprint v0.1.0</code>
          </div>
        </section>
        <div className="stack-grid" aria-label="Project technologies">
          {stackItems.map((item: StackItem): ReactElement => (
            <article className="stack-card" key={item.number}>
              <span className="stack-number">{item.number}</span>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <span className="stack-detail">{item.detail}</span>
            </article>
          ))}
        </div>
        <div className="workspace-grid">
          <ApiStatus />
          <section className="start-card" aria-labelledby="start-title">
            <span className="eyebrow">Local development</span>
            <h2 id="start-title">
              One command.
              <br />
              Everything running.
            </h2>
            <p className="muted">
              From the project root, start both services with live reload.
            </p>
            <div className="command-panel">
              <span className="terminal-label">Terminal</span>
              <code>
                <span aria-hidden="true">$ </span>make dev
              </code>
            </div>
            <dl className="service-list">
              <div>
                <dt>Frontend</dt>
                <dd>
                  <a href="http://localhost:5173">
                    localhost:5173 <span aria-hidden="true">↗</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>Backend</dt>
                <dd>
                  <a
                    href="http://localhost:8000/api/v1/health"
                    target="_blank"
                    rel="noreferrer"
                  >
                    localhost:8000 <span aria-hidden="true">↗</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>API documentation</dt>
                <dd>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /docs <span aria-hidden="true">↗</span>
                  </a>
                </dd>
              </div>
            </dl>
            <p className="start-note">
              See README.md for setup, project structure, and checks.
            </p>
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <span>hubmi / blueprint</span>
        <span>Built to be your starting point.</span>
      </footer>
    </div>
  );
}
