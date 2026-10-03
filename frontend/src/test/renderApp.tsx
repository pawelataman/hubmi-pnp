import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import type { HubApi } from '../api/HubApi';
import { createMockApi } from '../api/mock/createMockApi';
import type { PersonaId } from '../api/types';
import { AppProviders } from '../app/AppProviders';
import { routes } from '../app/routes';

export type AppRouter = ReturnType<typeof createMemoryRouter>;

export interface RenderAppOptions {
  readonly api?: HubApi;
  readonly persona?: PersonaId;
}

export interface RenderedApp {
  readonly api: HubApi;
  readonly user: UserEvent;
  readonly router: AppRouter;
}

/** Renders the whole app at `path` with a zero-delay mock API. */
export function renderApp(
  path: string,
  options: RenderAppOptions = {},
): RenderedApp {
  if (options.persona !== undefined) {
    window.sessionStorage.setItem('hubme.persona', options.persona);
  }
  const api: HubApi = options.api ?? createMockApi({ delayMs: 0 });
  const router: AppRouter = createMemoryRouter(routes, {
    initialEntries: [path],
  });
  const user: UserEvent = userEvent.setup();
  render(
    <AppProviders api={api}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { api, user, router };
}
