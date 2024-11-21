import { http, httpFormData } from "./CommonService";
import authHeader from './AuthHeader';
import { CollabContractResponse } from "../app/(main)/contract/page";
import { objectToFormData } from "../common/common";

class ContractService {
    get() {
        return http
            .get(`/sale/contract/get`, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    mailMerge(collaborator: CollabContractResponse) {
        const collaboratorFormData = objectToFormData(collaborator);
        return httpFormData
            .post("/sale/contract/mail-merge", collaboratorFormData, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new ContractService();