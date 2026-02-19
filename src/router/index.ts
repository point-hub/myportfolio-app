import { createRouter, createWebHistory } from 'vue-router';

import authConfig from '@/config/auth';
import routesAccount from '@/pages/account/routes';
import routesAdministrator from '@/pages/administrator/routes';
import routesAuth from '@/pages/auth/routes';
import routesBond from '@/pages/bonds/routes';
import routesCouponBond from '@/pages/coupon-bonds/routes';
import routesDeposit from '@/pages/deposits/routes';
import routesDividendStock from '@/pages/dividend-stocks/routes';
import routesInsurance from '@/pages/insurances/routes';
import routesMaster from '@/pages/master/routes';
import routesPaymentStock from '@/pages/payment-stocks/routes';
import routesSaving from '@/pages/savings/routes';
import routesStock from '@/pages/stocks/routes';
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      children: [
        {
          path: '',
          redirect: '/home',
        },
        {
          path: '',
          component: () => import('@/layouts/app.vue'),
          children: [
            {
              path: 'home',
              component: () => import('@/pages/home.vue'),
              meta: { requiresAuth: true },
            },
            routesAccount,
            routesMaster,
            routesDeposit,
            routesInsurance,
            routesSaving,
            routesPaymentStock,
            routesDividendStock,
            routesStock,
            routesBond,
            routesCouponBond,
            routesAdministrator,
          ],
        },
        {
          path: '',
          component: () => import('@/layouts/auth.vue'),
          children: [routesAuth],
        },
        {
          // redirect signin to Pointhub SSO
          path: '/sso-signin',
          component: () => import('@/pages/empty.vue'),
          beforeEnter() {
            const queryParams = {
              client_id: authConfig.client_id,
              response_type: 'code',
              state: crypto.randomUUID(),
              redirect_uri: authConfig.redirect_uri,
            };
            const queryString = new URLSearchParams(queryParams).toString();
            window.location.href = `${authConfig.url}?${queryString}`;
          },
        },
        {
          path: '/403',
          component: () => import('@/pages/403.vue'),
        },
        {
          path: '/:pathMatch(.*)*',
          component: () => import('@/pages/404.vue'),
        },
      ],
    },
  ],
  scrollBehavior() {
    // always scroll to top after navigation
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // try to reauthenticate if not authenticated
  if (!authStore.isAuthenticated && to.path !== '/signin') {
    await authStore.reauthenticate().catch(() => {});
  }

  // check if user has permission to access route
  if (to.meta.permissions) {
    const required = Array.isArray(to.meta.permissions)
      ? to.meta.permissions
      : [to.meta.permissions];

    const hasAccess = required.every(p =>
      authStore.hasPermission(p),
    );

    if (!hasAccess) {
      return next('/403');
    }
  }

  // redirect to signin page if not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next(`/signin?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  next();
});

export default router;
