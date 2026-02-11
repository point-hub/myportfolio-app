import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createPaymentStockApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/payment-stocks', data);

  return response.data;
};
