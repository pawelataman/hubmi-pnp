import { Navigate, type RouteObject } from 'react-router';

import { DraftScreen } from '../features/adaptation/DraftScreen';
import { ProfileScreen } from '../features/adaptation/ProfileScreen';
import { AuthorThreadScreen } from '../features/cases/AuthorThreadScreen';
import { CasesScreen } from '../features/cases/CasesScreen';
import { IdeaScreen } from '../features/idea/IdeaScreen';
import { ExpertInnovationsScreen } from '../features/expert/ExpertInnovationsScreen';
import { InnovationScreen } from '../features/innovation/InnovationScreen';
import { LibraryScreen } from '../features/library/LibraryScreen';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { CuratorThreadScreen } from '../features/rops/CuratorThreadScreen';
import { QueueScreen } from '../features/rops/QueueScreen';
import { TrendsScreen } from '../features/rops/TrendsScreen';
import { PreviewScreen } from '../features/matchmaking/PreviewScreen';
import { ProblemCardScreen } from '../features/matchmaking/ProblemCardScreen';
import { ResultsScreen } from '../features/matchmaking/ResultsScreen';
import { StartScreen } from '../features/matchmaking/StartScreen';
import { DemoStub } from '../shell/DemoStub';
import { PublicLayout } from '../shell/PublicLayout';
import { RequirePersona } from '../shell/RequirePersona';
import { Root } from '../shell/Root';
import { RopsLayout } from '../shell/RopsLayout';

export const routes: RouteObject[] = [
  {
    element: <Root />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <StartScreen /> },
          { path: 'onboarding', element: <OnboardingScreen /> },
          { path: 'ekspert/innowacje', element: <ExpertInnovationsScreen /> },
          { path: 'znajdz/podglad', element: <PreviewScreen /> },
          { path: 'znajdz/doprecyzowanie', element: <ProblemCardScreen /> },
          { path: 'znajdz/wyniki', element: <ResultsScreen /> },
          { path: 'biblioteka', element: <LibraryScreen /> },
          { path: 'innowacje/:id', element: <InnovationScreen /> },
          {
            path: 'innowacje/:id/dostosuj',
            element: (
              <RequirePersona role="user">
                <ProfileScreen />
              </RequirePersona>
            ),
          },
          {
            path: 'innowacje/:id/szkic',
            element: (
              <RequirePersona role="user">
                <DraftScreen />
              </RequirePersona>
            ),
          },
          { path: 'zglos-pomysl', element: <IdeaScreen /> },
          {
            path: 'moje-sprawy',
            element: (
              <RequirePersona role="user">
                <CasesScreen />
              </RequirePersona>
            ),
          },
          {
            path: 'moje-sprawy/:id',
            element: (
              <RequirePersona role="user">
                <AuthorThreadScreen />
              </RequirePersona>
            ),
          },
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
          { path: 'kolejka', element: <QueueScreen /> },
          { path: 'kolejka/:id', element: <CuratorThreadScreen /> },
          { path: 'trendy', element: <TrendsScreen /> },
          { path: '*', element: <DemoStub /> },
        ],
      },
    ],
  },
];
