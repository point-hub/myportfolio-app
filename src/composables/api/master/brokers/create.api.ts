import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createBrokerApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/master/brokers', data);

  return response.data;
};
