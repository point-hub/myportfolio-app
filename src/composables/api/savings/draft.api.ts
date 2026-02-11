import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const draftSavingApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/savings/draft', data);

  return response.data;
};
