import { http, httpDownload, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { UserModal } from "../types/models/user";
import { ChangePassRequest } from "../types/models/account";
import { objectToFormData } from "../common/common";
import { BankAccount, BankAccountModal } from "../types/models/bankAccount";

class AccountService {

    getInfo() {
        return http
            .get('/admin/auth/info', {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
    changePassword(changePassRequest: ChangePassRequest) {

        return http
            .post(`/admin/auth/change-password`, changePassRequest, {
                headers: authHeader(),
            })
            .then(response => {
                return response.data;
            });
    }
}
export default new AccountService();
