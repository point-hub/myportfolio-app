export default {
  path: 'insurances',
  children: [
    {
      path: '',
      component: () => import('./list/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:read'] },
    },
    {
      path: 'create',
      component: () => import('./create/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:create'] },
    },
    {
      path: 'interests',
      component: () => import('./interests/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module'] },
    },
    {
      path: 'cashbacks',
      component: () => import('./cashbacks/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module'] },
    },
    {
      path: ':id',
      component: () => import('./details/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:read'] },
    },
    {
      path: ':id/edit',
      component: () => import('./edit/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:update'] },
    },
    {
      path: ':id/extend',
      component: () => import('./extend/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:update'] },
    },
    {
      path: ':id/histories',
      component: () => import('./histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:read'] },
    },
    {
      path: ':id/audits',
      component: () => import('./audits/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'audit-logs:read'] },
    },
    {
      path: ':id/field-histories/:field',
      component: () => import('./field-histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['insurances:module', 'insurances:read'] },
    },
  ],
};
