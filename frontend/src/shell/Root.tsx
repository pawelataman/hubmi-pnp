import type { ReactElement } from 'react';
import { Outlet } from 'react-router';

import { ToastViewport } from './ToastViewport';

export function Root(): ReactElement {
  return (
    <>
      <Outlet />
      <ToastViewport />
    </>
  );
}
