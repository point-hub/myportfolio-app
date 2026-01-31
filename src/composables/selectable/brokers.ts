import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getBrokersApi, type IBrokerData } from '../api/master/brokers/get.api';

export function useSelectableBrokers() {
  const brokers = ref<IBrokerData[]>([]);
  const searchBroker = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    brokers.value.map((broker) => ({
      label: `[${broker.code}] ${broker.name} ${broker.account_number} a/n ${broker.account_name}`,
      value: broker._id,
    })),
  );

  const getBrokers = async (search?: string) => {
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
