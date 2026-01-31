import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const draftDepositApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/deposits/draft', data);

  return response.data;
};
