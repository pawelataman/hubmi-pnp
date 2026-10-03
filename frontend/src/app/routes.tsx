import { Navigate, type RouteObject } from 'react-router';

import { PreviewScreen } from '../features/matchmaking/PreviewScreen';
import { ProblemCardScreen } from '../features/matchmaking/ProblemCardScreen';
import { ResultsScreen } from '../features/matchmaking/ResultsScreen';
import { StartScreen } from '../features/matchmaking/StartScreen';
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
        children: [
          { index: true, element: <StartScreen /> },
          { path: 'znajdz/podglad', element: <PreviewScreen /> },
          { path: 'znajdz/doprecyzowanie', element: <ProblemCardScreen /> },
          { path: 'znajdz/wyniki', element: <ResultsScreen /> },
          { path: '*', element: <DemoStub /> },
        ],
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
