import { registerPreloader } from '@shared/lib/route-preload-registry';
import { lazyWithPreload } from '@shared/utils/lazyWithRetry';

export const routeLoaders = {
  login: lazyWithPreload(() => import('@/features/auth/pages/Login/Login').then((m) => ({ default: m.default }))),
  customer: lazyWithPreload(() => import('@/features/customer/routes').then((m) => ({ default: m.CustomerRoutes }))),
  hr: lazyWithPreload(() => import('@/features/hr/routes').then((m) => ({ default: m.HRRoutes }))),
  manager: lazyWithPreload(() => import('@/features/manager/routes').then((m) => ({ default: m.ManagerRoutes }))),
  owner: lazyWithPreload(() => import('@/features/owner/routes').then((m) => ({ default: m.OwnerRoutes }))),
};

registerPreloader('/login', routeLoaders.login.preload);
registerPreloader('/hr', routeLoaders.hr.preload);
registerPreloader('/owner', routeLoaders.owner.preload);
registerPreloader('/manager', routeLoaders.manager.preload);
registerPreloader('/', routeLoaders.customer.preload);
