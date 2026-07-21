<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import AppBreadcrumb, { type IBreadcrumb } from '@/components/app-breadcrumb.vue';
import { getDashboardInvestmentsApi, type IInvestmentSummaryItem } from '@/composables/api/dashboard/get-investments.api';
import { useSelectableBanks } from '@/composables/selectable/banks';
import { useSelectableOwners } from '@/composables/selectable/owners';
import { toast } from '@/toast';
import { handleError } from '@/utils/api';
import { formatNumber } from '@/utils/number';

const palette = ['#4f6272', '#7aa6a1', '#d5a44f', '#8b6bb3', '#c56f5a'];
const breadcrumbs: IBreadcrumb[] = [
  { name: 'Home', path: '/' },
  { name: 'Dashboard' },
];

const filter = reactive({
  owner_id: '',
  bank_id: '',
  group_id: '',
  instrument_type: '',
});

const instrumentOptions = ref([
  { label: 'All', value: '' },
  { label: 'Tabungan', value: 'savings' },
  { label: 'Deposito', value: 'deposits' },
  { label: 'Asuransi', value: 'insurances' },
  { label: 'Saham', value: 'stocks' },
  { label: 'Obligasi', value: 'bonds' },
]);

const { options: ownerOptions, searchOwner, isLoading: isLoadingOwners } = useSelectableOwners();
const { options: groupOptions, searchOwner: searchGroup, isLoading: isLoadingGroups } = useSelectableOwners();
const { options: bankOptions, searchBank, isLoading: isLoadingBanks } = useSelectableBanks();

const isLoading = ref(false);
const isResetting = ref(false);
const summary = ref<{
  allocation: IInvestmentSummaryItem[]
  data: IInvestmentSummaryItem[]
  total: {
    acquisition_value: number
    weight: number
    gross_interest: number
    tax: number
    total_interest: number
    cashback: number
    return_in: number
  }
}>({
  allocation: [],
  data: [],
  total: {
    acquisition_value: 0,
    weight: 0,
    gross_interest: 0,
    tax: 0,
    total_interest: 0,
    cashback: 0,
    return_in: 0,
  },
});

let controller: AbortController | null = null;

const chartRows = computed(() => summary.value.allocation.filter(item => item.acquisition_value > 0));

const pieStyle = computed(() => {
  if (chartRows.value.length === 0) {
    return { background: '#e5e7eb' };
  }

  let cursor = 0;
  const segments = chartRows.value.map((item, index) => {
    const start = cursor;
    const end = cursor + item.weight;
    cursor = end;
    return `${palette[index % palette.length]} ${start}% ${end}%`;
  });

  return { background: `conic-gradient(${segments.join(', ')})` };
});

const getInvestments = async () => {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();

  try {
    isLoading.value = true;
    summary.value = await getDashboardInvestmentsApi({
      search: {
        owner_id: filter.owner_id,
        bank_id: filter.bank_id,
        group_id: filter.group_id,
        instrument_type: filter.instrument_type,
      },
    }, controller);
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  } finally {
    isLoading.value = false;
  }
};

const resetFilter = async () => {
  isResetting.value = true;
  filter.owner_id = '';
  filter.bank_id = '';
  filter.group_id = '';
  filter.instrument_type = '';
  await getInvestments();
  isResetting.value = false;
};

watch(filter, async () => {
  if (isResetting.value) {
    return;
  }
  await getInvestments();
});

onMounted(async () => {
  await getInvestments();
});
</script>

<template>
  <div class="content-container">
    <app-breadcrumb :breadcrumbs="breadcrumbs" />

    <base-card title="Alokasi Portfolio">
      <div v-if="isLoading" class="h-64 flex items-center">
        <base-loader type="classic" sample="2" />
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-[minmax(260px,420px)_1fr] gap-8 items-center">
        <div class="flex justify-center">
          <div class="pie-chart" :style="pieStyle"></div>
        </div>
        <base-table>
          <thead>
            <tr>
              <th>Jenis Investasi</th>
              <th>Alokasi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="summary.allocation.length === 0">
              <td colspan="2">Data Not Found</td>
            </tr>
            <tr v-for="(item, index) in summary.allocation" :key="item.type">
              <td>
                <div class="flex items-center gap-2">
                  <span class="legend-dot" :style="{ backgroundColor: palette[index % palette.length] }"></span>
                  {{ item.label }}
                </div>
              </td>
              <td>{{ formatNumber(item.weight, 2) }}%</td>
            </tr>
          </tbody>
        </base-table>
      </div>
    </base-card>

    <base-card title="Alokasi Portfolio + Returnnya">
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <base-choosen
            v-model="filter.instrument_type"
            v-model:options="instrumentOptions"
            title="Jenis Investasi"
            placeholder="Jenis Investasi"
            :readonly="isLoading"
          />
          <base-choosen
            v-model="filter.bank_id"
            v-model:options="bankOptions"
            v-model:search="searchBank"
            title="Bank"
            placeholder="Bank"
            :loading="isLoadingBanks"
            :readonly="isLoading"
          />
          <base-choosen
            v-model="filter.group_id"
            v-model:options="groupOptions"
            v-model:search="searchGroup"
            title="Group"
            placeholder="Group"
            :loading="isLoadingGroups"
            :readonly="isLoading"
          />
          <base-choosen
            v-model="filter.owner_id"
            v-model:options="ownerOptions"
            v-model:search="searchOwner"
            title="Owner"
            placeholder="Owner"
            :loading="isLoadingOwners"
            :readonly="isLoading"
          />
        </div>
        <div class="flex justify-end">
          <base-button color="primary" variant="filled" class="font-bold" :disabled="isLoading" @click="resetFilter">
            <base-icon icon="i-fa7-solid:rotate-right" /> RESET
          </base-button>
        </div>

        <base-table>
          <thead>
            <tr>
              <th>Jenis Investment</th>
              <th class="text-right">Nilai Perolehan</th>
              <th class="text-right">Bobot</th>
              <th class="text-right">Bunga Bruto</th>
              <th class="text-right">Tax</th>
              <th class="text-right">Total Bunga</th>
              <th class="text-right">Cashback</th>
              <th class="text-right">Total Return In</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="8">
                <div class="h-24 flex items-center">
                  <base-loader type="classic" sample="2" />
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && summary.data.length === 0">
              <td colspan="8">Data Not Found</td>
            </tr>
            <tr v-for="item in summary.data" v-if="!isLoading" :key="item.type">
              <td>{{ item.label }}</td>
              <td class="text-right">{{ formatNumber(item.acquisition_value, 2) }}</td>
              <td class="text-right">{{ formatNumber(item.weight, 2) }}%</td>
              <td class="text-right">{{ formatNumber(item.gross_interest, 2) }}</td>
              <td class="text-right">{{ formatNumber(item.tax, 2) }}</td>
              <td class="text-right">{{ formatNumber(item.total_interest, 2) }}</td>
              <td class="text-right">{{ formatNumber(item.cashback, 2) }}</td>
              <td class="text-right">{{ formatNumber(item.return_in, 2) }}%</td>
            </tr>
            <tr v-if="!isLoading" class="font-bold bg-slate-100 dark:bg-slate-700">
              <td>Total</td>
              <td class="text-right">{{ formatNumber(summary.total.acquisition_value, 2) }}</td>
              <td class="text-right">{{ formatNumber(summary.total.weight, 2) }}%</td>
              <td class="text-right">{{ formatNumber(summary.total.gross_interest, 2) }}</td>
              <td class="text-right">{{ formatNumber(summary.total.tax, 2) }}</td>
              <td class="text-right">{{ formatNumber(summary.total.total_interest, 2) }}</td>
              <td class="text-right">{{ formatNumber(summary.total.cashback, 2) }}</td>
              <td class="text-right">{{ formatNumber(summary.total.return_in, 2) }}%</td>
            </tr>
          </tbody>
        </base-table>
      </div>
    </base-card>
  </div>
</template>

<style scoped lang="postcss">
.pie-chart {
  @apply w-64 h-64 rounded-full relative;
}

.pie-chart::after {
  content: '';
  @apply absolute inset-[46%] rounded-full bg-white dark:bg-slate-900;
}

.legend-dot {
  @apply w-3 h-3 shrink-0;
}
</style>
