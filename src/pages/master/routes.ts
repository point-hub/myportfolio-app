import bankRoutes from './banks/routes';
import exampleRoutes from './examples/routes';
import issuerRoutes from './issuers/routes';
import ownerRoutes from './owners/routes';
import roleRoutes from './roles/routes';
import userRoutes from './users/routes';

export default {
  path: 'master',
  children: [
    {
      path: '',
      component: () => import('./index.vue'),
      meta: { requiresAuth: true, permissions: ['master:module'] },
    },
    exampleRoutes,
    userRoutes,
    roleRoutes,
    issuerRoutes,
    ownerRoutes,
    bankRoutes,
  ],
};
