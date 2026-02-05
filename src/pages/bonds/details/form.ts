import { reactive } from 'vue';

import type { IBankAccountData } from '@/composables/api/master/banks/get-accounts.api';
import type { IOwnerData } from '@/composables/api/master/owners/get.api';
import { getLocalDate } from '@/utils/date';

export interface IReceivedCoupon {
  date: string
  amount: string
  received_amount: string
  remaining_amount: string
}

export interface IForm {
  _id?: string;
  form_number?: string;
  product?: string;
  publisher?: string;
  type?: string;
  series?: string;
  year_issued?: string;
  bank_source?: IBankAccountData;
  bank_source_id?: string;
  bank_source_account_uuid?: string;
  bank_placement?: IBankAccountData;
  bank_placement_id?: string;
  bank_placement_account_uuid?: string;
  owner_id?: string;
  owner?: IOwnerData;
  base_date?: number;
  transaction_date?: string;
  settlement_date?: string;
  maturity_date?: string;
  transaction_number?: number;
  price?: number;
  principal_amount?: number;
  proceed_amount?: number;
  accrued_interest?: number;
  total_proceed?: number;
  coupon_tenor?: number;
  coupon_rate?: number;
  coupon_gross_amount?: number;
  coupon_tax_rate?: number;
  coupon_tax_amount?: number;
  coupon_net_amount?: number;
  coupon_date?: string;
  received_coupons?: IReceivedCoupon[];
  notes?: string | null;
  is_archived?: boolean | null;
  created_at?: Date;
  created_by_id?: string;
  updated_at?: Date | null;
  updated_by_id?: string | null;
  archived_at?: Date | null;
  archived_by_id?: string | null;
  status?: 'active' | 'draft'
}

// Update IFormError to match IForm
export type IFormError = Partial<
  Record<
    | '_id'
    | 'form_number'
    | 'bank_source_id'
    | 'bank_source_account_uuid'
    | 'bank_placement_id'
    | 'bank_placement_account_uuid'
    | 'owner_id'
    | 'base_date'
    | 'transaction_date'
    | 'settlement_date'
    | 'maturity_date'
    | 'transaction_number'
    | 'price'
    | 'principle_amount'
    | 'proceed_amount'
    | 'accrued_interest'
    | 'total_proceed'
    | 'coupon_tenor'
    | 'coupon_rate'
    | 'coupon_gross_amount'
    | 'coupon_tax_rate'
    | 'coupon_tax_amount'
    | 'coupon_net_amount'
    | 'notes',
    string[]
  >
>;

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    form_number: undefined,
    product: undefined,
    publisher: undefined,
    type: undefined,
    series: undefined,
    year_issued: undefined,
    bank_source_id: undefined,
    bank_source_account_uuid: undefined,
    bank_placement_id: undefined,
    bank_placement_account_uuid: undefined,
    owner_id: undefined,
    base_date: undefined,
    transaction_date: undefined,
    settlement_date: undefined,
    maturity_date: undefined,
    transaction_number: undefined,
    price: undefined,
    principal_amount: undefined,
    proceed_amount: undefined,
    accrued_interest: undefined,
    total_proceed: undefined,
    coupon_tenor: undefined,
    coupon_rate: undefined,
    coupon_gross_amount: undefined,
    coupon_tax_rate: undefined,
    coupon_tax_amount: undefined,
    coupon_net_amount: undefined,
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
