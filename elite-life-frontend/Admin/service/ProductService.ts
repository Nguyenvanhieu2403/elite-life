/* eslint-disable import/no-anonymous-default-export */
import { AxiosHeaderValue } from "axios";
import authHeader from "./AuthHeader";
import { http, httpFormData } from "./CommonService";

class ProductService {
    async get(
        page: number,
        limit: number,
        filters: any
    ) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/products/get`, {
                headers: authHeader(),
                params: {
                    page: page,
                    limit: limit,
                    filters: filterQueryString,
                }
            })
            .then(response => {
                return response.data;
            });
    }
    getCreate() {
        return http
            .get('/admin/products/create', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdate(id: number) {
        return http
            .get(`/admin/products/update/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    async delete(
        id: number
    ) {
        const response = await http
            .post(`/admin/products/delete/${id}`, {
                id: id
            }, {
                headers: authHeader()
            });
        return response.data;
    }
    async add(
        Name: string,
        Price: number,
        DiscountPayPeriod1?: number | null,
        DiscountPayPeriod2?: number | null,
        DiscountPayPeriod3?: number | null,
        ProjectId?: number | null
    ) {
        const response = await http
            .post(`/admin/products/create`, {
                Name, Price, DiscountPayPeriod1, DiscountPayPeriod2, DiscountPayPeriod3, ProjectId
            }, {
                headers: authHeader()
            });
        return response.data;
    }
    async edit(
        id: number,
        Name: string,
        Price: number,
        DiscountPayPeriod1?: number | null,
        DiscountPayPeriod2?: number | null,
        DiscountPayPeriod3?: number | null,
        ProjectId?: number | null
    ) {
        const response = await http
            .post(`/admin/products/update/${id}`, {
                Name, Price, DiscountPayPeriod1, DiscountPayPeriod2, DiscountPayPeriod3, ProjectId
            },
                {
                    headers: authHeader()
                }
            );
        return response.data;
    }
    async export() {
        var auth_bearer = {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        const merge_header = { ...auth_bearer, ...authHeader() }
        return http
            .get("admin/products/export-excel", {
                headers: merge_header,
                responseType: "blob"
            })
            .then(response => {
                const blob = new Blob([response.data]);
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'products.xlsx';
                link.click();
                window.URL.revokeObjectURL(link.href);
            });
    }
    enable(Id: number) {
        return http
            .post(`/admin/products/enable/${Id}`, {
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    disable(Id: number) {
        return http
            .post(`/admin/products/disable/${Id}`, {
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}

export default new ProductService();
