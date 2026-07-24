export default {
  path: 'cashflows',
  children: [
    {
      path: '',
      component: () => import('@/pages/deposits/cashflows/index.vue'),
      meta: { requiresAuth: true, permissions: ['investment-reports:module', 'investment-reports:read'] },
    },
  ],
};
