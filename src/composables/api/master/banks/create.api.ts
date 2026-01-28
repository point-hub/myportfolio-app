import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createBankApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/master/banks', data);

  return response.data;
};
