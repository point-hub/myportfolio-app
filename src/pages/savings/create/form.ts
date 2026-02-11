import { reactive } from 'vue';

export interface IForm {
  form_number?: string
  owner_id?: string
  group_id?: string
  placement: {
    type?: string
    bank_id?: string
    account_number?: string
    base_date?: number
    date?: string
    term?: number
    maturity_date?: string
    amount?: number
  }
  source: {
    bank_id?: string
    bank_account_uuid?: string
  }
  interest: {
    payment_method?: string
    rate?: number
    gross_amount?: number
    tax_rate?: number
    tax_amount?: number
    net_amount?: number
    bank_id?: string
    bank_account_uuid?: string
    is_rollover?: boolean
  }
  interest_schedule: {
    term?: number
    payment_date?: string
    amount?: number
  }[]
  cashback: {
    bank_id?: string
    bank_account_uuid?: string
  }
  cashback_schedule: {
    payment_date?: string
    rate?: number
    amount?: number
  }[]
  notes?: string
}

export type IFormError = Partial<
  Record<
    | 'form_number'
    | 'owner_id'
    | 'group_id'
    | 'placement.type'
    | 'placement.account_number'
    | 'placement.base_date'
    | 'placement.date'
    | 'placement.term'
    | 'placement.maturity_date'
    | 'placement.bank_id'
    | 'placement.amount'
    | 'source.bank_id'
    | 'interest.payment_method'
    | 'interest.rate'
    | 'interest.gross_amount'
    | 'interest.tax_rate'
    | 'interest.tax_amount'
    | 'interest.net_amount'
    | 'interest.bank_id'
    | 'interest.is_rollover'
    | 'cashback.bank_id'
    | `cashback_schedule.${number}.payment_date`
    | `cashback_schedule.${number}.rate`
    | `cashback_schedule.${number}.amount`
    | 'notes',
    string[]
  >
>;

export function useForm() {
  const defaultForm: IForm = {
    form_number: undefined,
    owner_id: undefined,
    group_id: undefined,
    placement: {
      type: 'on-call',
      account_number: undefined,
      base_date: 365,
      date: undefined,
      term: undefined,
      maturity_date: undefined,
      bank_id: undefined,
      amount: undefined,
    },
    source: {
      bank_id: undefined,
      bank_account_uuid: undefined,
    },
    interest: {
      payment_method: 'in-arrear',
      rate: undefined,
      gross_amount: undefined,
      tax_rate: undefined,
      tax_amount: undefined,
      net_amount: undefined,
      bank_id: undefined,
      bank_account_uuid: undefined,
      is_rollover: false,
    },
    interest_schedule: [],
    cashback: {
      bank_id: undefined,
      bank_account_uuid: undefined,
    },
    cashback_schedule: [],
    notes: undefined,
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
