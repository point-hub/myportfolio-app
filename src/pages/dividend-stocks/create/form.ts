import { reactive } from 'vue';

import type { IIssuerData } from '@/composables/api/master/issuers/get.api';
import type { IOwnerData } from '@/composables/api/master/owners/get.api';

export interface ITransaction {
  issuer_id?: string;
  issuer?: IIssuerData;
  owner_id?: string;
  owner?: IOwnerData;
  dividend_date?: string;
  shares?: number;
  dividend_amount?: number;
  total_dividend?: number;
  received_amount?: number;
}

export interface IForm {
  _id?: string;
  form_number?: string;
  broker_id?: string;
  bank_id?: string;
  bank_account_uuid?: string;
  dividend_date?: string;
  transactions?: ITransaction[];
  total_received?: number;
  notes?: string | null;
  is_archived?: boolean | null;
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
    | 'bank_id'
    | 'dividend_date'
    | `transactions.${number}.issuer_id`
    | `transactions.${number}.owner_id`
    | `transactions.${number}.shares`
    | `transactions.${number}.dividend_amount`
    | `transactions.${number}.total_dividend`
    | `transactions.${number}.received_amount`
    | 'total_received'
    | 'notes',
    string[]
  >
>;

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    broker_id: undefined,
    bank_id: undefined,
    bank_account_uuid: undefined,
    dividend_date: undefined,
    transactions: [],
    total_received: 0,
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
