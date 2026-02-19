export default {
  path: 'coupon-bonds',
  children: [
    {
      path: '',
      component: () => import('./list/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:read'] },
    },
    {
      path: ':id/create/:uuid',
      component: () => import('./create/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:create'] },
    },
    {
      path: ':id/edit/:uuid',
      component: () => import('./edit/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:update'] },
    },
    {
      path: ':id/details/:uuid',
      component: () => import('./details/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:read'] },
    },
    {
      path: ':id',
      component: () => import('./details/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:read'] },
    },
    {
      path: ':id/edit',
      component: () => import('./edit/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:update'] },
    },
    {
      path: ':id/histories',
      component: () => import('./histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:read'] },
    },
    {
      path: ':id/audits',
      component: () => import('./audits/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'audit-logs:read'] },
    },
    {
      path: ':id/field-histories/:field',
      component: () => import('./field-histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['bonds:module', 'bonds:read'] },
    },
  ],
};
