import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const draftBondApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/bonds/draft', data);

  return response.data;
};
