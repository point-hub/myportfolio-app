import { apiRequest } from '@/utils/api';

export interface IResponse {
  deleted_count: number
}

export const deleteCouponBondApi = async (_id: string, uuid: string, delete_reason?: string): Promise<IResponse | undefined> => {
  const response = await apiRequest.post(`/v1/bonds/${_id}/delete-coupon`, {
    uuid,
    delete_reason,
  });
  if (response.status === 200) {
    return response.data;
  }
};
