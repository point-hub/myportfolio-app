<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';

import { getPermissionsApi } from '@/composables/api/master/permissions/get.api';

import { type IForm } from './form';

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

const hasPermission = (resource: string, action: string) => {
  return data.value.permissions?.includes(`${resource}:${action}`);
};

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

const SCOPE_MAP = {
  master: ['master', 'users', 'roles', 'owners', 'banks', 'issuers'],
  administrator: ['administrator', 'audit-logs'],
} as const;

const checkAll = (scope: keyof typeof SCOPE_MAP, checked: boolean) => {
  for (const resource of SCOPE_MAP[scope]) {
    const actions = availablePermissions.value[resource] ?? [];
    for (const action of actions) {
      togglePermission(resource, action, checked);
    }
  }
};

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
          <a href="javascript:void(0)" class="tab" :class="{ 'border-b-2 !border-slate-500': selected }">
            <!-- Master -->
          </a>
        </BaseTab>
        <!-- <BaseTab as="template" v-slot="{ selected }">
          <a href="javascript:void(0)" class="tab" :class="{ 'border-b-2 !border-slate-500': selected }">
            Administrator
          </a>
        </BaseTab> -->
      </BaseTabList>

      <BaseTabPanels class="flex-1 text-sm p-4">
        <!-- MASTER -->
        <BaseTabPanel>
          <div class="flex gap-2 pt-2 pb-8">
            <base-button class="px-4!" size="xs" color="primary" @click="checkAll('master', true)">
              Select All
            </base-button>
            <base-button class="px-4!" size="xs" color="danger" @click="checkAll('master', false)">
              Deselect All
            </base-button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.master">
              <p class="uppercase font-bold lg:w-48">Menu Master</p>
              <div v-for="action in availablePermissions.master" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('master', action)"
                  @update:model-value="(v: boolean) => togglePermission('master', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.users">
              <p class="uppercase font-bold lg:w-48">Users</p>
              <div v-for="action in availablePermissions.users" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('users', action)"
                  @update:model-value="(v: boolean) => togglePermission('users', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.roles">
              <p class="uppercase font-bold lg:w-48">Roles</p>
              <div v-for="action in availablePermissions.roles" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('roles', action)"
                  @update:model-value="(v: boolean) => togglePermission('roles', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.owners">
              <p class="uppercase font-bold lg:w-48">Owners</p>
              <div v-for="action in availablePermissions.owners" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('owners', action)"
                  @update:model-value="(v: boolean) => togglePermission('owners', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.banks">
              <p class="uppercase font-bold lg:w-48">Banks</p>
              <div v-for="action in availablePermissions.banks" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('banks', action)"
                  @update:model-value="(v: boolean) => togglePermission('banks', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.issuers">
              <p class="uppercase font-bold lg:w-48">Issuers</p>
              <div v-for="action in availablePermissions.issuers" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('issuers', action)"
                  @update:model-value="(v: boolean) => togglePermission('issuers', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.stocks">
              <p class="uppercase font-bold lg:w-48">Stocks</p>
              <div v-for="action in availablePermissions.stocks" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('stocks', action)"
                  @update:model-value="(v: boolean) => togglePermission('stocks', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.bonds">
              <p class="uppercase font-bold lg:w-48">Bonds</p>
              <div v-for="action in availablePermissions.bonds" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('bonds', action)"
                  @update:model-value="(v: boolean) => togglePermission('bonds', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.deposits">
              <p class="uppercase font-bold lg:w-48">Deposits</p>
              <div v-for="action in availablePermissions.deposits" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('deposits', action)"
                  @update:model-value="(v: boolean) => togglePermission('deposits', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.savings">
              <p class="uppercase font-bold lg:w-48">Savings</p>
              <div v-for="action in availablePermissions.savings" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('savings', action)"
                  @update:model-value="(v: boolean) => togglePermission('savings', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.insurances">
              <p class="uppercase font-bold lg:w-48">Insurances</p>
              <div v-for="action in availablePermissions.insurances" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('insurances', action)"
                  @update:model-value="(v: boolean) => togglePermission('insurances', action, v)"
                />
              </div>
            </div>
          </div>
        </BaseTabPanel>

        <!-- ADMINISTRATOR -->
        <!-- <BaseTabPanel>
          <div class="flex gap-2 pt-2 pb-8">
            <base-button class="px-4!" size="xs" color="primary" @click="checkAll('administrator', true)">
              Select All
            </base-button>
            <base-button class="px-4!" size="xs" color="danger" @click="checkAll('administrator', false)">
              Deselect All
            </base-button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions.administrator">
              <p class="uppercase font-bold lg:w-48">Menu Administrator</p>
              <div v-for="action in availablePermissions.administrator" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('administrator', action)"
                  @update:model-value="(v: boolean) => togglePermission('administrator', action, v)"
                />
              </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:gap-8" v-if="availablePermissions['audit-logs']">
              <p class="uppercase font-bold lg:w-48">Audit Logs</p>
              <div v-for="action in availablePermissions['audit-logs']" :key="action">
                <base-checkbox
                  class="uppercase"
                  :text="action"
                  :disabled="isSaving"
                  :model-value="hasPermission('audit-logs', action)"
                  @update:model-value="(v: boolean) => togglePermission('audit-logs', action, v)"
                />
              </div>
            </div>
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
