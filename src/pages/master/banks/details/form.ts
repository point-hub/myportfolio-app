import { reactive } from 'vue';

export interface IForm {
  _id?: string
  code?: string
  name?: string
  branch?: string
  address?: string
  phone?: string
  account_number?: string
  account_name?: string
  notes?: string
  is_archived?: boolean
}

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    code: undefined,
    name: undefined,
    branch: undefined,
    address: undefined,
    phone: undefined,
    account_number: undefined,
    account_name: undefined,
    notes: undefined,
    is_archived: undefined,
  };

  const data = reactive<IForm>(defaultForm);

  return { data };
}
