import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';

class OrderService {
  get(page: number, limit: number, filters: any) {
    var filterQueryString = JSON.stringify(filters);
    return http
      .get(`/admin/orders/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getCommissionPayment(orderId: number) {
    return http
      .get(`/admin/orders/commission-payment-history/${orderId}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  setDeliveryDate(orderId: number, DeliveryDate: string) {
    return http
      .post(`/admin/orders/delivered/${orderId}`, { DeliveryDate }, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
}
export default new OrderService();
