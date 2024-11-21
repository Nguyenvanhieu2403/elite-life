import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { ChangePassRequest, FileModal } from "../types/models/account";
import { objectToFormData } from "../common/common";
import { CollaboratorModal } from "../types/models/collaborators";

class AccountService {

    getInfo() {
        return http
            .post('/sale/auth/info', {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    changePassword(changePassRequest: ChangePassRequest) {

        return http
            .post(`/sale/auth/change-password`, changePassRequest, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    updateImg(file: FileModal) {
        const fileFormData = objectToFormData(file);

        return httpFormData
            .post(`/sale/auth/upload`, fileFormData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdate() {
        return http
            .get(`/sale/collaborator/update`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getRank(orgId: number) {
        return http
            .post(`/sale/collaborator/get-ranks`, { OrgId: orgId }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    update(collaborator: CollaboratorModal) {
        const collaboratorFormData = objectToFormData(collaborator);

        return httpFormData
            .post(`/sale/collaborator/update`, collaboratorFormData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new AccountService();
