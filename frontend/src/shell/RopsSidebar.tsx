import { useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router';

import type { HubApi } from '../api/HubApi';
import type { Persona, QueuePage } from '../api/types';
import { useApi, useSession, useTextSize, useToast } from '../app/contexts';
import { useAsync, type AsyncResult } from '../app/useAsync';
import { cx } from '../ui/cx';
import { isNavActive, SIDE_NAV, type NavItem } from './navigation';
import { PersonaPicker } from './PersonaPicker';
import styles from './RopsSidebar.module.css';
import { useLeaveThen } from './useLeaveThen';

export function RopsSidebar(): ReactElement {
  const api: HubApi = useApi();
  const { pathname } = useLocation();
  const { persona, signIn, signOut } = useSession();
  const leaveThen: (change: () => void) => void = useLeaveThen();
  const { cycle } = useTextSize();
  const { stub } = useToast();
  const [picking, setPicking] = useState<boolean>(false);
  const { state }: AsyncResult<QueuePage> = useAsync<QueuePage>(
    'sidebar-queue',
    (signal: AbortSignal): Promise<QueuePage> =>
      api.listQueue({ type: null }, signal),
  );
  const fresh: number | null =
    state.status === 'ready' ? state.data.fresh : null;

  return (
    <aside className={styles['sidebar']}>
      <div className={styles['brand']}>
        <span className={styles['logo']} aria-hidden="true">
          H
        </span>
        <div className={styles['brandText']}>
          <span className={styles['name']}>HubMe</span>
          <span className={styles['sub']}>Panel ROPS</span>
        </div>
      </div>
      <nav aria-label="Panel" className={styles['nav']}>
        {SIDE_NAV.map((item: NavItem): ReactElement => {
          const active: boolean = isNavActive(item, pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cx(styles['link'], active && styles['active'])}
            >
              <span className={styles['marker']} aria-hidden="true" />
              {item.label}
              {item.to === '/rops/kolejka' && fresh !== null ? (
                <span className={styles['count']}>{fresh}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className={styles['foot']}>
        <div className={styles['access']}>
          <button
            type="button"
            aria-label="Powiększ tekst"
            className={styles['footButton']}
            onClick={cycle}
          >
            A+
          </button>
          <button type="button" className={styles['footWide']} onClick={stub}>
            Prosty język
          </button>
        </div>
        <div className={styles['who']}>
          <span className={styles['avatar']} aria-hidden="true">
            {persona?.initials}
          </span>
          <div className={styles['whoText']}>
            <span className={styles['whoName']}>{persona?.name}</span>
            <span className={styles['sub']}>Kuratorka · przykład</span>
          </div>
        </div>
        <div className={styles['session']}>
          <button
            type="button"
            className={styles['sessionLink']}
            onClick={(): void => {
              setPicking(true);
            }}
          >
            Zmień osobę
          </button>
          <button
            type="button"
            className={styles['sessionLink']}
            onClick={(): void => {
              leaveThen(signOut);
            }}
          >
            Wyloguj
          </button>
          <Link to="/" className={styles['sessionLink']}>
            Strona główna
          </Link>
        </div>
      </div>
      {picking ? (
        <PersonaPicker
          requiredRole={null}
          onDone={(): void => {
            setPicking(false);
          }}
          onChoose={(chosen: Persona): void => {
            setPicking(false);
            if (chosen.role === 'curator') {
              signIn(chosen.id);
            } else {
              // The panel is curator-only: leave it before switching.
              leaveThen((): void => {
                signIn(chosen.id);
              });
            }
          }}
        />
      ) : null}
    </aside>
  );
}
