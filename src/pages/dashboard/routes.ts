export default {
  path: 'dashboard',
  component: () => import('./index.vue'),
  meta: { requiresAuth: true, permissions: ['dashboard:read'] },
};
