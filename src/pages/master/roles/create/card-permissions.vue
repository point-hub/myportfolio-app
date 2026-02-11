<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';

import { getPermissionsApi } from '@/composables/api/master/permissions/get.api';

import { type IForm } from './form';

/* =====================
 * MODELS
 * ===================== */
const data = defineModel<IForm>('data', {
  default: () => ({
    permissions: [],
  }),
});

const isSaving = defineModel('is-saving', { default: false });

watchEffect(() => {
  if (!Array.isArray(data.value.permissions)) {
    data.value.permissions = [];
  }
});

/* =====================
 * PERMISSIONS
 * ===================== */
const toResourceActions = (list: { name: string }[]) => {
  const result: Record<string, string[]> = {};

  for (const { name } of list) {
    const [resource, action] = name.split(':');
    if (!resource || !action) continue;

    result[resource] ??= [];
    if (!result[resource].includes(action)) {
      result[resource].push(action);
    }
  }

  return result;
};

const availablePermissions = ref<Record<string, string[]>>({});

const hasPermission = (resource: string, action: string) =>
  data.value.permissions?.includes(`${resource}:${action}`);

const togglePermission = (
  resource: string,
  action: string,
  checked: boolean,
) => {
  const key = `${resource}:${action}`;

  if (checked) {
    if (!data.value.permissions?.includes(key)) {
      data.value.permissions?.push(key);
    }
  } else {
    data.value.permissions = data.value.permissions?.filter(p => p !== key);
  }
};

/* =====================
 * SCOPES
 * ===================== */
const SCOPE_MAP = {
  main: ['stocks', 'payment-stocks', 'dividend-stocks', 'bonds', 'deposits', 'savings', 'insurances'],
  master: ['master', 'users', 'roles', 'owners', 'banks', 'brokers', 'issuers'],
  administrator: ['administrator', 'audit-logs'],
} as const;

const RESOURCE_LABELS: Record<string, string> = {
  master: 'Menu Master',
  users: 'Users',
  roles: 'Roles',
  owners: 'Owners',
  banks: 'Banks',
  brokers: 'Brokers',
  issuers: 'Issuers',
  stocks: 'Stocks',
  'payment-stocks': 'Payment Stocks',
  'dividend-stocks': 'Dividend Stocks',
  bonds: 'Bonds',
  deposits: 'Deposits',
  savings: 'Savings',
  insurances: 'Insurances',
  administrator: 'Administrator',
  'audit-logs': 'Audit Logs',
};

/* =====================
 * COMPUTED (SCOPE-AWARE)
 * ===================== */
const resourcesByScope = (scope: keyof typeof SCOPE_MAP) =>
  computed(() =>
    SCOPE_MAP[scope]
      .filter(r => availablePermissions.value[r])
      .map(r => ({
        key: r,
        label: RESOURCE_LABELS[r] ?? r,
        actions: availablePermissions.value[r],
      })),
  );

const actionsByScope = (scope: keyof typeof SCOPE_MAP) =>
  computed(() => {
    const set = new Set<string>();
    for (const r of SCOPE_MAP[scope]) {
      availablePermissions.value[r]?.forEach(a => set.add(a));
    }
    return Array.from(set);
  });

const mainResources = resourcesByScope('main');
const mainActions = actionsByScope('main');

const masterResources = resourcesByScope('master');
const masterActions = actionsByScope('master');

// const adminResources = resourcesByScope('administrator');
// const adminActions = actionsByScope('administrator');

/* =====================
 * CHECK ALL
 * ===================== */
const checkAll = (scope: keyof typeof SCOPE_MAP, checked: boolean) => {
  for (const resource of SCOPE_MAP[scope]) {
    const actions = availablePermissions.value[resource] ?? [];
    for (const action of actions) {
      togglePermission(resource, action, checked);
    }
  }
};

/* =====================
 * INIT
 * ===================== */
onMounted(async () => {
  const response = await getPermissionsApi();
  availablePermissions.value = toResourceActions(response.data);
});
</script>

<template>
  <base-card title="Permissions">
    <BaseTabGroup as="div" class="dark:bg-slate-800">
      <BaseTabList class="tablist">
        <BaseTab as="template" v-slot="{ selected }">
          <a
            href="javascript:void(0)"
            class="tab"
            :class="{ 'border-b-2 !border-slate-500': selected }"
          >
            Main
          </a>
        </BaseTab>

        <BaseTab as="template" v-slot="{ selected }">
          <a
            href="javascript:void(0)"
            class="tab"
            :class="{ 'border-b-2 !border-slate-500': selected }"
          >
            Master
          </a>
        </BaseTab>

        <!-- <BaseTab as="template" v-slot="{ selected }">
          <a
            href="javascript:void(0)"
            class="tab"
            :class="{ 'border-b-2 !border-slate-500': selected }"
          >
            Administrator
          </a>
        </BaseTab> -->
      </BaseTabList>

      <BaseTabPanels class="flex-1 text-sm p-4">
        <!-- MASTER -->
        <BaseTabPanel>
          <div class="flex gap-2 pt-2 pb-6">
            <base-button size="xs" color="primary" @click="checkAll('main', true)">
              Select All
            </base-button>
            <base-button size="xs" color="danger" @click="checkAll('main', false)">
              Deselect All
            </base-button>
          </div>

          <div class="relative overflow-x-auto">
            <base-table class="uppercase">
              <tbody>
                <tr v-for="res in mainResources" :key="res.key">
                  <td
                    class="font-bold sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 min-w-48 max-w-48 w-48"
                  >
                    {{ res.label }}
                  </td>

                  <td
                    v-for="(action, index) in mainActions"
                    :key="action"
                    class="text-center whitespace-nowrap"
                    :class="[
                      index === mainActions.length - 1 ? 'w-full' : 'w-max'
                    ]"
                  >
                    <base-checkbox
                      v-if="res.actions?.includes(action)"
                      :disabled="isSaving"
                      :text="action"
                      :model-value="hasPermission(res.key, action)"
                      @update:model-value="(v: boolean) => togglePermission(res.key, action, v)"
                    />
                  </td>
                </tr>
              </tbody>
            </base-table>
          </div>
        </BaseTabPanel>

        <!-- MASTER -->
        <BaseTabPanel>
          <div class="flex gap-2 pt-2 pb-6">
            <base-button size="xs" color="primary" @click="checkAll('master', true)">
              Select All
            </base-button>
            <base-button size="xs" color="danger" @click="checkAll('master', false)">
              Deselect All
            </base-button>
          </div>

          <div class="relative overflow-x-auto">
            <base-table class="uppercase">
              <tbody>
                <tr v-for="res in masterResources" :key="res.key">
                  <td
                    class="font-bold sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 min-w-48 max-w-48 w-48"
                  >
                    {{ res.label }}
                  </td>

                  <td
                    v-for="(action, index) in masterActions"
                    :key="action"
                    class="text-center whitespace-nowrap"
                    :class="[
                      index === masterActions.length - 1 ? 'w-full' : 'w-max'
                    ]"
                  >
                    <base-checkbox
                      v-if="res.actions?.includes(action)"
                      :disabled="isSaving"
                      :text="action"
                      :model-value="hasPermission(res.key, action)"
                      @update:model-value="(v: boolean) => togglePermission(res.key, action, v)"
                    />
                  </td>
                </tr>
              </tbody>
            </base-table>
          </div>
        </BaseTabPanel>

        <!-- ADMINISTRATOR -->
        <!-- <BaseTabPanel>
          <div class="flex gap-2 pt-2 pb-6">
            <base-button size="xs" color="primary" @click="checkAll('administrator', true)">
              Select All
            </base-button>
            <base-button size="xs" color="danger" @click="checkAll('administrator', false)">
              Deselect All
            </base-button>
          </div>

          <div class="relative overflow-x-auto">
            <base-table class="uppercase">
              <tbody>
                <tr v-for="res in adminResources" :key="res.key">
                  <td
                    class="font-bold sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 min-w-48 max-w-48 w-48"
                  >
                    {{ res.label }}
                  </td>

                  <td
                    v-for="(action, index) in adminActions"
                    :key="action"
                    class="text-center whitespace-nowrap"
                    :class="[
                      index === adminActions.length - 1 ? 'w-full' : 'w-max'
                    ]"
                  >
                    <base-checkbox
                      v-if="res.actions?.includes(action)"
                      :disabled="isSaving"
                      :text="action"
                      :model-value="hasPermission(res.key, action)"
                      @update:model-value="(v: boolean) => togglePermission(res.key, action, v)"
                    />
                  </td>
                </tr>
              </tbody>
            </base-table>
          </div>
        </BaseTabPanel> -->
      </BaseTabPanels>
    </BaseTabGroup>
  </base-card>
</template>

<style scoped lang="postcss">
.tablist {
  @apply flex overflow-x-auto pt-4 border-b border-slate-200 dark:border-[#191e3a];
}

.tab {
  @apply flex pb-2 px-4 gap-2 items-center -mb-[1px] whitespace-nowrap outline-none;
}
</style>
