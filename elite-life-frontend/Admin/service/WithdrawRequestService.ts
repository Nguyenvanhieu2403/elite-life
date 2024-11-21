import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { UserModal } from "../types/models/user";
import { WithdrawRequest, WithdrawRequestModal } from "../types/models/withdrawal-requests";
import { objectToFormData } from "../common/common";

class WithdrawRequestService {
    get(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/withdrawal-requests/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdate(id: number) {
        return http
            .get(`/admin/withdrawal-requests/update/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    update(collaborator: WithdrawRequestModal) {
        const collaboratorFormData = objectToFormData(collaborator);

        return httpFormData
            .post(`/admin/withdrawal-requests/update/${collaborator.id}`, collaboratorFormData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    approve(Id: number, withdrawRequest: any) {
        const formData = objectToFormData(withdrawRequest)
        return httpFormData
            .post(`/admin/withdrawal-requests/approve/${Id}`, formData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    reject(Id: number, NoteRejection?: string) {
        const formData = objectToFormData({NoteRejection})
        return httpFormData
            .post(`/admin/withdrawal-requests/reject/${Id}`, formData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new WithdrawRequestService();
