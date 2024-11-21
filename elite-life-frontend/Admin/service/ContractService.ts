import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';

class ContractService {
    get(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/contract/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getById(id: number) {
        return http
            .get(`/admin/contract/get/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new ContractService();
