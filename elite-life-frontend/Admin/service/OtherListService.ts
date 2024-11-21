/* eslint-disable import/no-anonymous-default-export */
import { AxiosHeaderValue } from "axios";
import authHeader from "./AuthHeader";
import { http, httpFormData } from "./CommonService";

class OtherListService {
    async getOtherList() {
        return http
            .get("admin/other-lists/get-types", {
                headers: authHeader()
            })
            .then(response => {
                return response.data;
            });
    }
    async get(
        type: string,
        page: number,
        limit: number,
        filters: any
    ) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/other-lists/get/${type}`, {
                headers: authHeader(),
                params: {
                    page: page,
                    limit: limit,
                    filters: filterQueryString
                }
            })
            .then(response => {
                return response.data;
            });
    }
    async deleteListItem(
        id: number, Type: string
    ) {
        const response = await http
            .post(`/admin/other-lists/delete/${id}`, {
                id: id,
                Type: Type
            }, {
                headers: authHeader()
            });
        return response.data;
    }
    async add(
        Type: string,
        Code: string,
        Name: string,
        Number1?: number | null,
        Number2?: number | null,
        String1?: string | null,
        String2?: string | null,
        Note?: string | null,
        Ord?: number | 0,
    ) {
        const response = await http
            .post(`/admin/other-lists/create`, {
                Type, Code, Name, Number1, Number2, String1, String2, Note, Ord
            }, {
                headers: authHeader()
            });
        return response.data;
    }
    async edit(
        id: number,
        Type: string,
        Code: string,
        Name: string,
        Number1?: number | null,
        Number2?: number | null,
        String1?: string | null,
        String2?: string | null,
        Note?: string | null,
        Ord?: number | 0,
    ) {
        const response = await http
            .post(`/admin/other-lists/update/${id}`, {
                Type, Code, Name, Number1, Number2, String1, String2, Note, Ord
            },
                {
                    headers: authHeader()
                }
            );
        return response.data;
    }
    async import(
        Type: string,
        file: string,
    ) {
        return http
            .post(`admin/other-lists/import/${Type}`, {
                file: file
            },
                {
                    headers: authHeader()
                })
            .then(response => {
                return response.data
            });
    }
    async export() {
        var auth_bearer = {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        const merge_header = { ...auth_bearer, ...authHeader() }
        return http
            .get("admin/other-lists/export-excel", {
                headers: merge_header,
                responseType: "blob"
            })
            .then(response => {
                const blob = new Blob([response.data]);
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'OtherLists.xlsx'; // Set the desired file name
                link.click();
                window.URL.revokeObjectURL(link.href);
            });
    }
}

export default new OtherListService();
