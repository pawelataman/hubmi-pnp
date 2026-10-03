import { useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router';

import {
  useNotifications,
  useSession,
  useTextSize,
  useToast,
} from '../app/contexts';
import { Button } from '../ui/Button';
import { cx } from '../ui/cx';
import { Switch } from '../ui/Switch';
import styles from './HubTopBar.module.css';
import { isNavActive, TOP_NAV, type NavItem } from './navigation';
import { NotificationsPopover } from './NotificationsPopover';
import { PersonaPicker } from './PersonaPicker';

type Panel = 'none' | 'picker' | 'bell' | 'menu';

export function HubTopBar(): ReactElement {
  const { pathname } = useLocation();
  const { persona, signOut } = useSession();
  const { cycle } = useTextSize();
  const { stub } = useToast();
  const { unread } = useNotifications();
  const [panel, setPanel] = useState<Panel>('none');

  function toggle(next: Panel): void {
    setPanel((current: Panel): Panel => (current === next ? 'none' : next));
  }

  function close(): void {
    setPanel('none');
  }

  return (
    <header className={styles['bar']}>
      <Link to="/" className={styles['brand']}>
        <span className={styles['logo']} aria-hidden="true">
          H
        </span>
        <span className={styles['name']}>HubMe</span>
      </Link>
      <nav aria-label="Główna" className={styles['nav']}>
        {TOP_NAV.map((item: NavItem): ReactElement => {
          const active: boolean = isNavActive(item, pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cx(styles['navLink'], active && styles['navActive'])}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles['tools']}>
        <Button
          variant="neutral"
          aria-label="Powiększ tekst"
          className={styles['textSize']}
          onClick={cycle}
        >
          A+
        </Button>
        <Switch checked={false} onChange={stub}>
          Prosty język
        </Switch>
        {persona === null ? (
          <Button
            variant="secondary"
            onClick={(): void => {
              toggle('picker');
            }}
          >
            Zaloguj się
          </Button>
        ) : (
          <>
            <div className={styles['anchor']}>
              <button
                type="button"
                className={styles['bell']}
                aria-label={`Powiadomienia, ${String(unread)} nieprzeczytane`}
                aria-expanded={panel === 'bell'}
                onClick={(): void => {
                  toggle('bell');
                }}
              >
                <span className={styles['bellIcon']} aria-hidden="true">
                  <span className={styles['bellDome']} />
                  <span className={styles['bellRim']} />
                  <span className={styles['bellClapper']} />
                </span>
                {unread > 0 ? (
                  <span className={styles['badge']} aria-hidden="true">
                    {unread}
                  </span>
                ) : null}
              </button>
              {panel === 'bell' ? (
                <NotificationsPopover onClose={close} />
              ) : null}
            </div>
            <Link to="/moje-sprawy" className={styles['cases']}>
              Moje sprawy
            </Link>
            <div className={styles['anchor']}>
              <button
                type="button"
                className={styles['avatar']}
                aria-label={`Konto: ${persona.name}`}
                aria-haspopup="menu"
                aria-expanded={panel === 'menu'}
                onClick={(): void => {
                  toggle('menu');
                }}
              >
                {persona.initials}
              </button>
              {panel === 'menu' ? (
                <div role="menu" className={styles['menu']}>
                  {persona.role === 'curator' ? (
                    <Link
                      role="menuitem"
                      to="/rops/kolejka"
                      className={styles['menuItem']}
                      onClick={close}
                    >
                      Panel ROPS
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    className={styles['menuItem']}
                    onClick={(): void => {
                      setPanel('picker');
                    }}
                  >
                    Zmień osobę
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles['menuItem']}
                    onClick={(): void => {
                      close();
                      signOut();
                    }}
                  >
                    Wyloguj
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
      {panel === 'picker' ? (
        <PersonaPicker requiredRole={null} onDone={close} />
      ) : null}
    </header>
  );
}
