import { reactive } from 'vue';

export interface IForm {
  code?: string
  name?: string
  notes?: string
}

export interface IFormError {
  code: string[]
  name: string[]
  notes: string[]
}

export function useForm() {
  const defaultForm: IForm = {
    code: undefined,
    name: undefined,
    notes: undefined,
  };

  const defaultFormError: IFormError = {
    code: [],
    name: [],
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
