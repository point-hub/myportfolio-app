import { reactive } from 'vue';

export interface IForm {
  _id?: string
  code?: string
  name?: string
  notes?: string
  is_archived?: boolean
}

export function useForm() {
  const defaultForm: IForm = {
    _id: undefined,
    code: undefined,
    name: undefined,
    notes: undefined,
    is_archived: undefined,
  };

  const data = reactive<IForm>(defaultForm);

  return { data };
}
