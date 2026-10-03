import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router';

import { buttonClass } from '../ui/buttonClass';
import styles from './DemoStub.module.css';
import { STUB_TITLES } from './navigation';

export function DemoStub(): ReactElement {
  const { pathname } = useLocation();
  const inPanel: boolean = pathname.startsWith('/rops');
  return (
    <main className={styles['stub']}>
      <h1 className={styles['title']}>
        {STUB_TITLES[pathname] ?? 'Strona niedostępna w demo'}
      </h1>
      <p className={styles['text']}>
        Ta część nie jest dostępna w wersji demonstracyjnej.
      </p>
      <Link
        to={inPanel ? '/rops/kolejka' : '/'}
        className={buttonClass('secondary')}
      >
        {inPanel ? 'Wróć do kolejki zgłoszeń' : 'Wróć na stronę główną'}
      </Link>
    </main>
  );
}
