import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from 'react';
import { Link, useLocation } from 'react-router';

import {
  useNotifications,
  useSession,
  useTextSize,
  useToast,
} from '../app/contexts';
import { Button } from '../ui/Button';
import { buttonClass } from '../ui/buttonClass';
import { cx } from '../ui/cx';
import { Switch } from '../ui/Switch';
import styles from './HubTopBar.module.css';
import {
  isNavActive,
  requiresPersona,
  TOP_NAV,
  type NavItem,
} from './navigation';
import { NotificationsPopover } from './NotificationsPopover';
import { PersonaPicker } from './PersonaPicker';
import { useLeaveThen } from './useLeaveThen';

type Panel = 'none' | 'picker' | 'bell' | 'menu';

export function HubTopBar(): ReactElement {
  const { pathname } = useLocation();
  const { persona, signOut } = useSession();
  const { cycle } = useTextSize();
  const { stub } = useToast();
  const { unread } = useNotifications();
  const leaveThen: (change: () => void) => void = useLeaveThen();
  // A panel is open only on the page it was opened on, so navigating closes it.
  const [opened, setOpened] = useState<{ panel: Panel; on: string }>({
    panel: 'none',
    on: pathname,
  });
  const panel: Panel = opened.on === pathname ? opened.panel : 'none';
  const bellAnchor: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const menuAnchor: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  function show(next: Panel): void {
    setOpened({ panel: next, on: pathname });
  }

  function toggle(next: Panel): void {
    show(panel === next ? 'none' : next);
  }

  function close(): void {
    show('none');
  }

  useEffect((): (() => void) | undefined => {
    if (panel !== 'bell' && panel !== 'menu') {
      return undefined;
    }
    const anchor: RefObject<HTMLDivElement | null> =
      panel === 'bell' ? bellAnchor : menuAnchor;
    function onKey(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpened({ panel: 'none', on: pathname });
        anchor.current?.querySelector<HTMLElement>('button')?.focus();
      }
    }
    function onPointer(event: MouseEvent): void {
      if (
        event.target instanceof Node &&
        anchor.current?.contains(event.target) !== true
      ) {
        setOpened({ panel: 'none', on: pathname });
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return (): void => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [panel, pathname]);

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
          const expertSearch: boolean =
            persona?.id === 'expert' && item.to === '/';
          const active: boolean = expertSearch
            ? pathname === '/ekspert/innowacje'
            : isNavActive(item, pathname);
          return (
            <Link
              key={item.label}
              to={expertSearch ? '/ekspert/innowacje' : item.to}
              aria-current={active ? 'page' : undefined}
              className={cx(styles['navLink'], active && styles['navActive'])}
            >
              {expertSearch ? 'Znajdź innowację' : item.label}
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
          <>
            {pathname !== '/onboarding' ? (
              <Link
                to="/onboarding"
                className={cx(buttonClass('primary'), styles['signup'])}
              >
                Załóż konto
              </Link>
            ) : null}
            <Button
              variant="secondary"
              onClick={(): void => {
                toggle('picker');
              }}
            >
              Zaloguj się
            </Button>
          </>
        ) : (
          <>
            <div ref={bellAnchor} className={styles['anchor']}>
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
            {persona.id !== 'expert' ? (
              <Link to="/moje-sprawy" className={styles['cases']}>
                Moje sprawy
              </Link>
            ) : null}
            <div ref={menuAnchor} className={styles['anchor']}>
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
                  {persona.id === 'beneficiary' ? (
                    <>
                      <Link
                        role="menuitem"
                        to="/onboarding"
                        className={styles['menuItem']}
                        onClick={close}
                      >
                        Mój profil potrzeb
                      </Link>
                      <Link
                        role="menuitem"
                        to="/znajdz/doprecyzowanie"
                        className={styles['menuItem']}
                        onClick={close}
                      >
                        Moje dopasowania
                      </Link>
                    </>
                  ) : null}
                  {persona.id === 'expert' ? (
                    <>
                      <Link
                        role="menuitem"
                        to="/onboarding?typ=expert"
                        className={styles['menuItem']}
                        onClick={close}
                      >
                        Mój profil eksperta
                      </Link>
                      <Link
                        role="menuitem"
                        to="/ekspert/innowacje"
                        className={styles['menuItem']}
                        onClick={close}
                      >
                        Innowacje dla mnie
                      </Link>
                    </>
                  ) : null}
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
                      show('picker');
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
                      if (requiresPersona(pathname)) {
                        // Leave first, so the page's guard asks nothing.
                        leaveThen(signOut);
                      } else {
                        signOut();
                      }
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
