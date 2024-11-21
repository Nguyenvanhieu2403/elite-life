import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { UserModal } from "../types/models/user";
import { CollaboratorFileUpload, CollaboratorModal } from "../types/models/collaborators";
import { objectToFormData } from "../common/common";
import { BankAccount, BankAccountModal } from "../types/models/bankAccount";

class CollaboratorService {
    get(page: number, limit: number, filters: any, fromDate: string, toDate: string) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/collaborators/get?page=${page}&limit=${limit}&filters=${filterQueryString}&fromDate=${fromDate}&toDate=${toDate}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getHomePage() {
        return http
            .get('/admin/home/get', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getCreate() {
        return http
            .get('/admin/collaborators/create', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdate(id: number) {
        return http
            .get(`/admin/collaborators/update/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getDetail(id: number) {
        return http
            .get(`/admin/collaborators/get/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getTree(id: number) {
        return http
            .post(`/admin/collaborators/tree/${id}`, {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getBinaryTree() {
        return http
            .get(`/admin/collaborators/get-binary-tree`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getTreeCom(id: number) {
        return http
            .post(`/admin/collaborators/tree-com/${id}`, {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    create(collaborator: CollaboratorModal) {
        const collaboratorFormData = objectToFormData(collaborator);
        return httpFormData
            .post("/admin/collaborators/create", collaboratorFormData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    update(collaborator: CollaboratorModal) {
        const collaboratorFormData = objectToFormData(collaborator);

        return httpFormData
            .post(`/admin/collaborators/update/${collaborator.Id}`, collaboratorFormData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    lock(Id: number) {
        return http
            .post(`/admin/collaborators/lock/${Id}`, {
                Id
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    unLock(Id: number) {
        return http
            .post(`/admin/collaborators/unlock/${Id}`, {
                Id
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    deposit(Id: number, AvailableDeposit: number, Note?: string) {
        return http
            .post(`/admin/collaborators/deposit/${Id}`, {
                AvailableDeposit,
                Note
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    updateContract(Id: number, ContractNumber: number) {
        return http
            .post(`/admin/collaborators/contract/${Id}`, {
                ContractNumber
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpload(id: number) {
        return http
            .get(`/admin/collaborators/upload/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    upload(id: number, FileIds: any, Files: any) {
        var formData = new FormData();
        if (FileIds && FileIds.length > 0) {
            for (let i = 0; i < FileIds.length; i++) {
                formData.append(`FileIds`, FileIds[i]);
            }
        }
        if (Files && Files.length > 0) {
            for (let i = 0; i < Files.length; i++) {
                formData.append(`Files`, Files[i]);
            }
        }
        return httpFormData
            .post(`/admin/collaborators/upload/${id}`, formData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    deleteImage(collaboratorId: number, uploadId: number) {
        return http
            .post(`/admin/collaborators/upload/delete/${collaboratorId}/${uploadId}`, {}, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    import(file: any) {
        var formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        return httpFormData
            .post('/admin/collaborators/import', formData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getExportTemplate() {
        return httpDownload
            .get(`/admin/collaborators/export`, {
                headers: authHeader(),
            })
            .then(response => {
                return response;
            });
    }
    delete(Id: number) {
        return http
            .post(`/admin/collaborators/delete/${Id}`, {
                Id
            }, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    // bank account
    getBankAccount(page: number, limit: number, filters: any) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/collaborators/bank?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getUpdatebank(id: number) {
        return http
            .get(`/admin/collaborators/update/bank/${id}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    updateBankAccount(bankaccount: BankAccountModal) {
        return http
            .post(`/admin/collaborators/update/bank/${bankaccount.Id}`, bankaccount, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    getBank(nationId: number | null) {
        return http
            .get(`/admin/collaborators/getBanks/${nationId}`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    async getWalletDetails(
        selectedId: number,
        page: number,
        limit: number,
        filters: any
    ) {
        var filterQueryString = JSON.stringify(filters);
        return http
            .get(`/admin/collaborators/walletDetails/${selectedId}`, {
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
    async getOrderDetails(
        selectedId: number,
        page: number,
        limit: number,
    ) {
        return http
            .get(`/admin/collaborators/getOrderDetails/${selectedId}`, {
                headers: authHeader(),
                params: {
                    page: page,
                    limit: limit,
                }
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new CollaboratorService();
