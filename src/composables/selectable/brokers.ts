import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getBrokersApi, type IBrokerData } from '../api/master/brokers/get.api';

export function useSelectableBrokers() {
  const brokers = ref<IBrokerData[]>([]);
  const searchBroker = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    brokers.value.map((broker) => ({
      label: `${broker.name}`,
      value: broker._id,
    })),
  );

  // controller is scoped to THIS composable instance
  let controller: AbortController | null = null;

  const getBrokers = async (search?: string) => {
    // Abort the previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create a new AbortController for this request
    controller = new AbortController();

    isLoading.value = true;
    const response = await getBrokersApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    brokers.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchBroker,
    async (val) => {
      await getBrokers(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getBrokers();
  });

  return {
    brokers,
    options,
    isLoading,
    searchBroker,
    getBrokers,
  };
}
