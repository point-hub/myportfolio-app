import { reactive } from 'vue';

export interface IForm {
  _id?: string
  code?: string
  name?: string
  branch?: string
  address?: string
  phone?: string
  accounts?: {
    account_number?: string
    account_name?: string
  }[]
  notes?: string
  is_archived?: boolean
}

export function useForm() {
  const createDefaultForm = (): IForm => ({
    code: undefined,
    name: undefined,
    branch: undefined,
    address: undefined,
    phone: undefined,
    accounts: [],
    notes: undefined,
    is_archived: undefined,
  });

  const data = reactive<IForm>(createDefaultForm());

  return { data };
}
