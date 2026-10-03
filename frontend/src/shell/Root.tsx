import type { ReactElement } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import { ToastViewport } from './ToastViewport';

export function Root(): ReactElement {
  return (
    <>
      <Outlet />
      <ToastViewport />
      <ScrollRestoration />
    </>
  );
}
