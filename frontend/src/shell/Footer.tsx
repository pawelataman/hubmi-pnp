import type { ReactElement } from 'react';
import { Link } from 'react-router';

import styles from './Footer.module.css';

export function Footer(): ReactElement {
  return (
    <footer className={styles['footer']}>
      <Link to="/kontakt">Kontakt z ROPS</Link>
      <Link to="/dostepnosc">Deklaracja dostępności</Link>
      <Link to="/jak-dziala-ai">Jak działa AI w HubMe</Link>
      <span className={styles['note']}>
        Wszystkie dane na makietach są przykładowe
      </span>
    </footer>
  );
}
