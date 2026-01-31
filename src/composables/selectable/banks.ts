import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getBanksApi, type IBankData } from '../api/master/banks/get.api';

export function useSelectableBanks() {
  const banks = ref<IBankData[]>([]);
  const searchBank = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    banks.value.map((bank) => ({
      label: bank.name,
      value: bank._id,
    })),
  );

  // controller is scoped to THIS composable instance
  let controller: AbortController | null = null;

  const getBanks = async (search?: string) => {
    // Abort the previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create a new AbortController for this request
    controller = new AbortController();

    isLoading.value = true;
    const response = await getBanksApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    banks.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchBank,
    async (val) => {
      await getBanks(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getBanks();
  });

  return {
    banks,
    options,
    isLoading,
    searchBank,
    getBanks,
  };
}
