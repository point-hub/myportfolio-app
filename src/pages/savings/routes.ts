export default {
  path: 'savings',
  children: [
    {
      path: '',
      component: () => import('./list/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:read'] },
    },
    {
      path: 'create',
      component: () => import('./create/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:create'] },
    },
    {
      path: 'interests',
      component: () => import('./interests/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module'] },
    },
    {
      path: 'cashbacks',
      component: () => import('./cashbacks/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module'] },
    },
    {
      path: ':id',
      component: () => import('./details/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:read'] },
    },
    {
      path: ':id/edit',
      component: () => import('./edit/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:update'] },
    },
    {
      path: ':id/extend',
      component: () => import('./extend/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:update'] },
    },
    {
      path: ':id/histories',
      component: () => import('./histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:read'] },
    },
    {
      path: ':id/audits',
      component: () => import('./audits/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'audit-logs:read'] },
    },
    {
      path: ':id/field-histories/:field',
      component: () => import('./field-histories/index.vue'),
      meta: { requiresAuth: true, permissions: ['savings:module', 'savings:read'] },
    },
  ],
};
