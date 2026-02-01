import { apiRequest } from '@/utils/api';

interface IResponse {
  matched_count: string
  modified_count: string
}

export const deleteCashbackDepositApi = async (id: string, data:unknown): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/deposits/${id}/delete-cashback`, data);

  return response.data;
};
