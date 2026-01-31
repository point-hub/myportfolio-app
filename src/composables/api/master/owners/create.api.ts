import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createOwnerApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/master/owners', data);

  return response.data;
};
