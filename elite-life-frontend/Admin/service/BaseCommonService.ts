import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { Role, RoleModal } from "../types/models/role";

class BaseCommonService {
  getApplicationType() {
    return http
      .get('/admin/common/application/types/get', {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getOtherListType() {
    return http
      .get(`/admin/common/other-lists/types/get`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
}
export default new BaseCommonService();
