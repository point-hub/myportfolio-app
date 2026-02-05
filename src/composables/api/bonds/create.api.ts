import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createBondApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/bonds', data);

  return response.data;
};
