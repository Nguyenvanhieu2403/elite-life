import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { objectToFormData } from "../common/common";

class HomeService {
    getPayment(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/sale/home/payment-list?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getInfo() {
        return http
            .post('/sale/home/info', {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    payCombo(obj: {
        PayDate: string,
        Value: number,
        Note: string,
        ProductId: number
    }) {
        return http
            .post('/sale/orders/pay', obj, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    internalTransfer(obj: {
        CollaboratorCode: string,
        Available: number,
    }) {
        return http
            .post('/sale/collaborator/internalTransfer', obj, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    personalMoneyTransfer(obj: {
        WalletTypeFrom: string,
        WalletTypeTo: string,
        Available: number,
    }) {
        return http
            .post('/sale/collaborator/personalMoneyTransfer', obj, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    activate() {
        return http
            .post('/sale/orders/activate', {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getPaymentList(page: number, limit: number) {
        return http
            .get(`/sale/home/payment-list?page=${page}&limit=${limit}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getOrders() {
        return http
            .get('/sale/orders/pay', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getHistoryPay() {
        return http
            .get('/sale/orders/historyPay', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getInfoDeliverySale(orderId: number) {
        return http
            .get(`/sale/orders//info-delivery-sale/${orderId}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    updateInfoDeliverySale(orderId: number, params: {
        NameSale: string,
        AddressSale: string,
        MobileSale: string
    }) {
        return http
            .post(`/sale/orders/update/${orderId}`, params, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getReferral(pageIndex: number, pageSize: number) {
        return http
            .get(`/sale/home/get-refferals?page=${pageIndex}&limit=${pageSize}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getCollaboratorList() {
        return http
            .get(`/sale/collaborator/create-internalTransfer`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    validatePersonalMoneyTransfer(obj: {
        WalletTypeFrom: string,
        WalletTypeTo: string,
        Available: number,
    }) {
        return http
            .post('/sale/collaborator/validatePersonalMoneyTransfer', obj, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new HomeService();
