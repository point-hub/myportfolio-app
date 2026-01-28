import { reactive } from 'vue';

export interface IForm {
  code?: string
  name?: string
  branch?: string
  address?: string
  phone?: string
  account_number?: string
  account_name?: string
  notes?: string
}

export interface IFormError {
  code: string[]
  name: string[]
  branch: string[]
  address: string[]
  phone: string[]
  account_number: string[]
  account_name: string[]
  notes: string[]
}

export function useForm() {
  const defaultForm: IForm = {
    code: undefined,
    name: undefined,
    branch: undefined,
    address: undefined,
    phone: undefined,
    account_number: undefined,
    account_name: undefined,
    notes: undefined,
  };

  const defaultFormError: IFormError = {
    code: [],
    name: [],
    branch: [],
    address: [],
    phone: [],
    account_number: [],
    account_name: [],
    notes: [],
  };

  const data = reactive<IForm>(defaultForm);
  const errors = reactive<IFormError>(defaultFormError);

  const reset = () => {
    Object.assign(data, defaultForm);
    Object.assign(errors, defaultFormError);
  };

  return { data, errors, reset };
}
