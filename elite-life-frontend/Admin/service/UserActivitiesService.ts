import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { UserModal } from "../types/models/user";

class UserActivitiesService {
  get(page: number, limit: number, filters: any) {
    var filterQueryString = JSON.stringify(filters);
    return http
      .get(`/admin/user-activities/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
}
export default new UserActivitiesService();
