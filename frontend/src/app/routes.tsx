import { Navigate, type RouteObject } from 'react-router';

import { DemoStub } from '../shell/DemoStub';
import { PublicLayout } from '../shell/PublicLayout';
import { Root } from '../shell/Root';
import { RopsLayout } from '../shell/RopsLayout';
import { RequirePersona } from './RequirePersona';

export const routes: RouteObject[] = [
  {
    element: <Root />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: '*', element: <DemoStub /> }],
      },
      {
        path: 'rops',
        element: (
          <RequirePersona role="curator">
            <RopsLayout />
          </RequirePersona>
        ),
        children: [
          { index: true, element: <Navigate to="/rops/kolejka" replace /> },
          { path: '*', element: <DemoStub /> },
        ],
      },
    ],
  },
];
