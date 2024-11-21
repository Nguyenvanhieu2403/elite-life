import { http } from "./CommonService";

import authHeader from './AuthHeader';
import { BankModal } from "../types/models/bank";

class BanksService {
    get(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/banks/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getCreate() {
        return http
            .get(`/admin/banks/create`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdate(id: number) {
        return http
            .get(`/admin/banks/update/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }

    addBank(bank: BankModal) {
        return http
            .post(`/admin/banks/create`, bank, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    updateBank(bank: BankModal) {
        return http
            .post(`/admin/banks/update/${bank.Id}`, bank, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    delete(Id: number) {
        return http
            .post(`/admin/banks/delete/${Id}`, {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new BanksService();
