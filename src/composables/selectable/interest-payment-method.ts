import { computed } from 'vue';

export interface IOption {
  label: string;
  value: string;
}

export function useSelectableInterestPaymentMethod() {
  const options = computed<IOption[]>(() => [
    {
      label: 'In Arrear',
      value: 'in-arrear',
    },
    {
      label: 'In Advance',
      value: 'in-advance',
    },
  ]);

  return {
    options,
  };
}
