import { http, httpFormData } from "./CommonService";
import authHeader from './AuthHeader';

class RefferalsService {
    get(page: number, limit: number, filters: any, fromDate: string, toDate: string) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/sale/collaborator/get-refferals?page=${page}&limit=${limit}&filters=${filterQueryString}&fromDate=${fromDate}&toDate=${toDate}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new RefferalsService();
