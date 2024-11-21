import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { UserForeignModal } from "../types/models/userForeign";

class UserSaleService {
    get(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/user-sale/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getCreate() {
        return http
            .get('/admin/user-sale/create', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdate(id: number) {
        return http
            .get(`/admin/user-sale/update/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    create(user: UserForeignModal) {
        return http
            .post("/admin/user-sale/create", user, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    update(user: UserForeignModal) {
        return http
            .post(`/admin/user-sale/update/${user.Id}`, user, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    delete(Id: number) {
        return http
            .post(`/admin/user-sale/delete/${Id}`, {
                Id
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new UserSaleService();
