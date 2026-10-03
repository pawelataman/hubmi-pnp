import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement scrolling and reports every call as an error;
// <ScrollRestoration /> scrolls on each navigation.
window.scrollTo = (): void => {};

afterEach((): void => {
  cleanup();
  window.sessionStorage.clear();
  document.documentElement.style.fontSize = '';
});
