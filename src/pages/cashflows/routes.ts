export default {
  path: 'cashflows',
  children: [
    {
      path: '',
      component: () => import('@/pages/deposits/cashflows/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:read'] },
    },
  ],
};
