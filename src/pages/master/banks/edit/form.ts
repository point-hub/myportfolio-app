import { reactive } from 'vue';

export interface IForm {
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
  update_reason?: string
}

export type IFormError = Partial<
  Record<
    | 'code'
    | 'name'
    | 'branch'
    | 'address'
    | 'phone'
    | `accounts.${number}.account_number`
    | `accounts.${number}.account_name`
    | 'notes'
    | 'update_reason',
    string[]
  >
>;

export function useForm() {
  const createDefaultForm = (): IForm => ({
    code: undefined,
    name: undefined,
    branch: undefined,
    address: undefined,
    phone: undefined,
    accounts: [],
    notes: undefined,
    update_reason: undefined,
  });
  const createDefaultFormError = (): IFormError => ({});

  const data = reactive<IForm>(createDefaultForm());
  const errors = reactive<IFormError>(createDefaultFormError());

  const reset = () => {
    Object.assign(data, createDefaultForm());
    Object.assign(errors, createDefaultFormError());
  };

  return { data, errors, reset };
}
