import { http, httpFormData } from "./CommonService";
import authHeader from './AuthHeader';

class SystemService {
    get() {
        return http
            .get(`/sale/collaborator/get-binary-tree?page=1&limit=${Number.MAX_SAFE_INTEGER}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new SystemService();