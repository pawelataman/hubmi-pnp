import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach((): void => {
  cleanup();
  window.sessionStorage.clear();
  document.documentElement.style.fontSize = '';
});
