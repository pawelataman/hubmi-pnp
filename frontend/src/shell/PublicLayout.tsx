import type { ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router';

import { AiNotice } from './AiNotice';
import { Footer } from './Footer';
import { HubTopBar } from './HubTopBar';
import { showsAiNotice } from './navigation';
import styles from './PublicLayout.module.css';

export function PublicLayout(): ReactElement {
  const { pathname } = useLocation();
  return (
    <div className={styles['page']}>
      <HubTopBar />
      {showsAiNotice(pathname) ? <AiNotice /> : null}
      <div className={styles['content']}>
        <Outlet />
      </div>
      {pathname === '/' ? <Footer /> : null}
    </div>
  );
}
