import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

import { getIssuersApi, type IIssuerData } from '../api/master/issuers/get.api';

export function useSelectableIssuers() {
  const issuers = ref<IIssuerData[]>([]);
  const searchIssuer = ref<string | undefined>();
  const isLoading = ref(false);

  const options = computed(() =>
    issuers.value.map((issuer) => ({
      label: `[${issuer.code}] ${issuer.name}`,
      value: issuer._id,
    })),
  );

  const getIssuers = async (search?: string) => {
    isLoading.value = true;
    const response = await getIssuersApi({
      search: {
        all: search,
      },
      page: 1,
      page_size: 100,
    });

    issuers.value = response.data;
    isLoading.value = false;
  };

  watchDebounced(
    searchIssuer,
    async (val) => {
      await getIssuers(val);
    },
    { debounce: 500, maxWait: 1000 },
  );

  onMounted(() => {
    getIssuers();
  });

  return {
    issuers,
    options,
    isLoading,
    searchIssuer,
    getIssuers,
  };
}
