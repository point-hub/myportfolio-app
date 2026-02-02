import { reactive } from 'vue';

import type { IBrokerData } from '@/composables/api/master/brokers/get.api';
import type { IIssuerData } from '@/composables/api/master/issuers/get.api';
import type { IOwnerData } from '@/composables/api/master/owners/get.api';
import type { IUserData } from '@/composables/api/master/users/get.api';

export interface IForm {
  _id?: string;
  form_number?: string;
  transaction_date?: string;
  settlement_date?: Date;
  broker_id?: string;
  broker?: IBrokerData;
  owner_id?: string;
  owner?: IOwnerData;
  transaction_number?: string;
  buying_list?: {
    issuer_id?: string;
    issuer?: IIssuerData;
    lots?: number;
    shares?: number;
    price?: number;
    total?: number;
  }[];
  selling_list?: {
    issuer_id?: string;
    issuer?: IIssuerData;
    lots?: number;
    shares?: number;
    price?: number;
    total?: number;
  }[];
  buying_total?: number;
  buying_brokerage_fee?: number;
  buying_vat?: number;
  buying_levy?: number;
  buying_kpei?: number;
  buying_stamp?: number;
  buying_proceed?: number;
  selling_total?: number;
  selling_brokerage_fee?: number;
  selling_vat?: number;
  selling_levy?: number;
  selling_kpei?: number;
  selling_stamp?: number;
  selling_proceed?: number;
  proceed_amount?: number;
  notes?: string | null;
  is_archived?: boolean | null;
  status?: 'draft' | 'active' | 'paid'
  created_at?: Date;
  created_by_id?: string;
  created_by?: IUserData;
  updated_at?: Date | null;
  updated_by_id?: string | null;
  updated_by?: IUserData | null;
  archived_at?: Date | null;
  archived_by_id?: string | null;
  archived_by?: IUserData | null;
}

// Update IFormError to match IForm
export type IFormError = Partial<
  Record<
    | '_id'
    | 'form_number'
    | 'transaction_date'
    | 'settlement_date'
    | 'broker_id'
    | 'owner_id'
    | 'transaction_number'
    | `buying_list.${number}.issuer_id`
    | `buying_list.${number}.lots`
    | `buying_list.${number}.shares`
    | `buying_list.${number}.price`
    | `buying_list.${number}.total`
    | `selling_list.${number}.issuer_id`
    | `selling_list.${number}.lots`
    | `selling_list.${number}.shares`
    | `selling_list.${number}.price`
    | `selling_list.${number}.total`
    | 'buying_total'
    | 'buying_brokerage_fee'
    | 'buying_vat'
    | 'buying_levy'
    | 'buying_kpei'
    | 'buying_stamp'
    | 'buying_proceed'
    | 'selling_total'
    | 'selling_brokerage_fee'
    | 'selling_vat'
    | 'selling_levy'
    | 'selling_kpei'
    | 'selling_stamp'
    | 'selling_proceed'
    | 'proceed_amount'
    | 'notes',
    string[]
  >
>;

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    transaction_date: undefined,
    settlement_date: undefined,
    broker_id: undefined,
    owner_id: undefined,
    transaction_number: undefined,
    buying_list: [],
    selling_list: [],
    buying_total: 0,
    buying_brokerage_fee: 0,
    buying_vat: 0,
    buying_levy: 0,
    buying_kpei: 0,
    buying_stamp: 0,
    buying_proceed: 0,
    selling_total: 0,
    selling_brokerage_fee: 0,
    selling_vat: 0,
    selling_levy: 0,
    selling_kpei: 0,
    selling_stamp: 0,
    selling_proceed: 0,
    proceed_amount: 0,
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
