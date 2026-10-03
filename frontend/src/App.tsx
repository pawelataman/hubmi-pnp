import type { ReactElement } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import type { HubApi } from './api/HubApi';
import { createMockApi } from './api/mock/createMockApi';
import { AppProviders } from './app/AppProviders';
import { routes } from './app/routes';

const api: HubApi = createMockApi();
const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes);

export function App(): ReactElement {
  return (
    <AppProviders api={api}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
