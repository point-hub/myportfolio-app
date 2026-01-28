<script setup lang="ts">
import {
  type IAppMenu,
  useDarkMode,
  useMobileBreakpoint,
  useSidebar,
  useSidebarMenuStore,
  useSidebarStore,
} from '@point-hub/papp';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppHeaderNotifications from '@/components/app-header-notifications.vue';
import { useAblyChannel } from '@/composables/ably-channel';
import { useAuthStore } from '@/stores/auth.store';

import { version } from '../../package.json';

const route = useRoute();
const router = useRouter();

useSidebar();

const mobileBreakpoint = useMobileBreakpoint();
const sidebarStore = useSidebarStore();
const sidebarMenuStore = useSidebarMenuStore();
const { isDarkMode, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();

const { subscribe } = useAblyChannel(`notifications:${authStore.authUser?._id}`);
const isHeaderMenuOpen = ref(false);

// Sidebar
const appMenu = ref<IAppMenu[]>([
  {
    name: 'My Porfolio',
    path: '/',
    icon: 'https://assets.pointhub.net/assets/images/logo/primary/icon-rounded.png',
    menu: [
      {
        name: 'Home',
        path: '/home',
      },
    ],
  },
]);

const appList = ref<IAppMenu[]>([
  {
    name: 'My Porfolio',
    path: 'https://www.example.com',
  },
]);
sidebarMenuStore.setAppMenu(appMenu.value, appList.value);

// Header
const account = ref({
  organization: authStore.authUser?.role?.name,
  username: authStore.authUser?.username,
  avatar: 'https://placehold.co/150',
});

const organizations = ref([
  {
    name: 'My Porfolio',
    link: '?org=abc',
  },
]);

const onSignout = async () => {
  await authStore.signout();
  await router.push('/signin');
};

onMounted(() => {
  subscribe();
  sidebarMenuStore.onChooseApp(route.path);

  if (authStore.hasPermission('master:module')) {
    const masterMenu = {
      name: 'Master',
      submenu: [] as Array<{ name: string; path: string }>,
    };
    if (authStore.hasPermission('users:module')) { masterMenu.submenu?.push({ name: 'Users', path: '/master/users' }); }
    if (authStore.hasPermission('roles:module')) { masterMenu.submenu?.push({ name: 'Roles', path: '/master/roles' }); }
    if (authStore.hasPermission('owners:module')) { masterMenu.submenu?.push({ name: 'Owners', path: '/master/owners' }); }
    if (authStore.hasPermission('banks:module')) { masterMenu.submenu?.push({ name: 'Banks', path: '/master/banks' }); }
    if (authStore.hasPermission('brokers:module')) { masterMenu.submenu?.push({ name: 'Brokers', path: '/master/brokers' }); }
    if (authStore.hasPermission('issuers:module')) { masterMenu.submenu?.push({ name: 'Issuers', path: '/master/issuers' }); }
    appMenu.value[0]?.menu?.push(masterMenu);
  }
  if (authStore.hasPermission('savings:module')) {
    appMenu.value[0]?.menu?.push({ name: 'Savings', path: '/savings' });
  }
  if (authStore.hasPermission('deposits:module')) {
    appMenu.value[0]?.menu?.push({ name: 'Deposits', path: '/deposits' });
  }
  if (authStore.hasPermission('insurances:module')) {
    appMenu.value[0]?.menu?.push({ name: 'Insurances', path: '/insurances' });
  }
  if (authStore.hasPermission('bonds:module')) {
    appMenu.value[0]?.menu?.push({ name: 'Bonds', path: '/bonds' });
  }
  if (authStore.hasPermission('stocks:module')) {
    appMenu.value[0]?.menu?.push({ name: 'Stocks', path: '/stocks' });
  }
});
</script>

<template>
  <div class="app-layout">
    <!-- Header -->
    <app-header>
      <template #left-header>
        <header-sidebar-button
          :on-toggle-sidebar="sidebarStore.toggleSidebar"
          v-model:is-sidebar-open="sidebarStore.isSidebarOpen"
        />
      </template>
      <template #right-header>
        <app-header-notifications />
        <base-divider class="h-10" orientation="horizontal" />
        <header-menu v-model:is-open="isHeaderMenuOpen" :organization="account.organization" :username="account.username" :avatar="account.avatar">
          <header-menu-account :organization="account.organization" :username="account.username" :avatar="account.avatar" />
          <base-divider orientation="vertical" class="my-2!" />
          <header-menu-link label="My Account" icon="i-ph:user-circle-gear-duotone" path="/account" @click="() => isHeaderMenuOpen = false" />
          <header-menu-switch-organization :organizations="organizations" />
          <header-menu-dark-mode :on-toggle-dark-mode="toggleDarkMode" v-model:is-dark-mode="isDarkMode" />
          <header-menu-signout :on-signout="onSignout" />
        </header-menu>
      </template>
    </app-header>

    <!-- Sidebar -->
    <app-sidebar
      :title="sidebarMenuStore.choosenAppTitle"
      :apps="sidebarMenuStore.appMenu"
      :menus="sidebarMenuStore.appMenu[sidebarMenuStore.choosenAppIndex]?.menu ?? []"
      :is-sidebar-open="sidebarStore.isSidebarOpen"
      :is-mobile="mobileBreakpoint.isMobile()"
      @choose="sidebarMenuStore.onChooseApp"
    />

    <!-- Main Container -->
    <div class="main-container">
      <!-- Main Content -->
      <main class="main-content">
        <router-view />
      </main>

      <!-- Footer -->
      <app-footer :version="version" :year="2025" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.app-layout {
  @apply h-100vh w-full flex grow;
}

.main-container {
  @apply flex flex-col py-4 space-y-8 w-full transition-all duration-300;
}

.is-sidebar-open .main-container {
  @apply lg:w-[calc(100%-(var(--sidebar-panel-width)+var(--sidebar-menu-width)))] lg:ml-[calc(var(--sidebar-panel-width)+var(--sidebar-menu-width))];
}

.main-content {
  @apply mt-[60px] px-4 flex-1;
}

.main-content-header {
  @apply flex space-x-4 py-2 overflow-x-hidden;
}

.main-content-body {
  @apply flex flex-col space-y-5;
}
</style>
