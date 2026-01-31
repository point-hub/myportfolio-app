import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createDepositApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/deposits', data);

  return response.data;
};
