import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';

class HomeService {
    get(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/home/get-home?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
   
}
export default new HomeService();
