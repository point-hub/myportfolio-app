export default {
  path: 'deposits',
  children: [
    {
      path: '',
      component: () => import('./list/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:read'] },
    },
    {
      path: 'create',
      component: () => import('./create/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:create'] },
    },
    {
      path: 'interests',
      component: () => import('./interests/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module'] },
    },
    {
      path: 'cashbacks',
      component: () => import('./cashbacks/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module'] },
    },
    {
      path: ':id',
      component: () => import('./details/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:read'] },
    },
    {
      path: ':id/edit',
      component: () => import('./edit/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:update'] },
    },
    {
      path: ':id/histories',
      component: () => import('./histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:read'] },
    },
    {
      path: ':id/audits',
      component: () => import('./audits/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'audit-logs:read'] },
    },
    {
      path: ':id/field-histories/:field',
      component: () => import('./field-histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['deposits:module', 'deposits:read'] },
    },
  ],
};
