import type { ReactElement, ReactNode } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';

import type { PersonaRole } from '../api/types';

import { useSession } from '../app/contexts';
import { PersonaPicker } from './PersonaPicker';

interface RequirePersonaProps {
  /** `user` admits any signed-in persona; `curator` only the curator. */
  readonly role: PersonaRole;
  readonly children: ReactNode;
}

export function RequirePersona({
  role,
  children,
}: RequirePersonaProps): ReactElement {
  const { persona } = useSession();
  const navigate: NavigateFunction = useNavigate();
  const allowed: boolean =
    persona !== null && (role === 'user' || persona.role === role);

  if (allowed) {
    return <>{children}</>;
  }
  return (
    <PersonaPicker
      requiredRole={role}
      onDone={(chosen: boolean): void => {
        if (!chosen) {
          void navigate('/', { replace: true });
        }
      }}
    />
  );
}
