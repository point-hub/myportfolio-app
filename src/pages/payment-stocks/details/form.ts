import { reactive } from 'vue';

import type { IBrokerData } from '@/composables/api/master/brokers/get.api';
import type { IStockData } from '@/composables/api/stocks/get.api';

export interface ITransaction {
  uuid?: string;
  stock_id?: string;
  stock?: IStockData;
  transaction_number?: string;
  date?: string;
  amount?: number;
}

export interface IForm {
  _id?: string;
  form_number?: string;
  broker?: IBrokerData;
  broker_id?: string;
  payment_date?: string;
  transactions?: ITransaction[];
  total?: number;
  notes?: string | null;
  is_archived?: boolean | null;
  status?: 'draft' | 'active';
  created_at?: Date;
  created_by_id?: string;
  updated_at?: Date | null;
  updated_by_id?: string | null;
  archived_at?: Date | null;
  archived_by_id?: string | null;
}

// Update IFormError to match IForm
export type IFormError = Partial<
  Record<    | '_id'
    | 'form_number'
    | 'broker_id'
    | 'payment_date'
    | `transactions.${number}.stock_id`
    | `transactions.${number}.transaction_number`
    | `transactions.${number}.date`
    | `transactions.${number}.amount`
    | 'total'
    | 'notes',
    string[]
  >
>;

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    broker_id: undefined,
    payment_date: undefined,
    transactions: [],
    total: 0,
    notes: undefined,
    is_archived: null,
    created_at: undefined,
    created_by_id: undefined,
    updated_at: null,
    updated_by_id: null,
    archived_at: null,
    archived_by_id: null,
  };

  const defaultFormError: IFormError = {};

  const data = reactive<IForm>(defaultForm);
  const errors = reactive<IFormError>(defaultFormError);

  const reset = () => {
    Object.assign(data, defaultForm);
    Object.assign(errors, defaultFormError);
  };

  return { data, errors, reset };
}
