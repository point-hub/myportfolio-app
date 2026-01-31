import { reactive } from 'vue';

import type { IAuthUser } from '@/stores/auth.store';

export interface IForm {
  _id?: string
  form_number?: string
  owner?: {
    name?: string
  }
  group?: {
    name?: string
  }
  placement?: {
    bank?: {
      name?: string
    }
    bilyet_number?: string
    base_date?: number
    date?: string
    term?: number
    maturity_date?: string
    amount?: number
  }
  source?: {
    bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
  }
  interest?: {
    payment_method?: string
    rate?: number
    gross_amount?: number
    tax_rate?: number
    tax_amount?: number
    net_amount?: number
    bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
    is_rollover?: boolean
  }
  interest_schedule?: {
    term?: number
    payment_date?: string
    amount?: number
    received_date?: string
    received_amount?: number
    received_additional_payment_date?: string
    received_additional_payment_amount?: number
    bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
    additional_bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
    created_by?: IAuthUser
  }[]
  cashback?: {
    bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
  }
  cashback_schedule: {
    payment_date?: string
    rate?: number
    amount?: number
    received_date?: string
    received_amount?: number
    received_additional_payment_date?: string
    received_additional_payment_amount?: number
    bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
    additional_bank?: {
      name?: string
      account?: {
        account_name?: string
        account_number?: string
      }
    }
    created_by?: IAuthUser
  }[]
  notes?: string | undefined | null
  is_archived?: boolean
  is_draft?: boolean
}

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    form_number: undefined,
    owner: undefined,
    group: undefined,
    placement: {
      bilyet_number: undefined,
      base_date: undefined,
      date: undefined,
      term: undefined,
      maturity_date: undefined,
      bank: undefined,
      amount: undefined,
    },
    source: {
      bank: undefined,
    },
    interest: {
      payment_method: undefined,
      rate: undefined,
      gross_amount: undefined,
      tax_rate: undefined,
      tax_amount: undefined,
      net_amount: undefined,
      bank: undefined,
      is_rollover: false,
    },
    interest_schedule: [],
    cashback: {
      bank: undefined,
    },
    cashback_schedule: [],
    notes: undefined,
  };

  const data = reactive<IForm>(defaultForm);

  return { data };
}
