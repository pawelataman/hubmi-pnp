import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { App } from './App';
import './ui/tokens.css';
import './ui/base.css';

const container: HTMLElement | null = document.getElementById('root');

if (container === null) {
  throw new Error('The application root element is missing.');
}

const root: Root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
