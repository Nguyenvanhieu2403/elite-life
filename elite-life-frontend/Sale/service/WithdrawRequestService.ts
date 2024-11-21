import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { WithdrawRequest, WithdrawRequestModal } from "../types/models/withdrawal-requests";
import { objectToFormData } from "../common/common";

class WithdrawRequestService {
    get(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/sale/withdrawal-requests/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
   
    getCreate() {

        return http
            .get(`/sale/withdrawal-requests/create`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    create(withdrawRequest: WithdrawRequestModal) {

        return http
            .post(`/sale/withdrawal-requests/create`, withdrawRequest, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new WithdrawRequestService();
