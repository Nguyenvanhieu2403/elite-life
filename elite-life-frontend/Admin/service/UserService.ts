import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { UserModal } from "../types/models/user";
import { objectToFormData } from "../common/common";

class UserService {
  get(page: number, limit: number, filters: any) {
    var filterQueryString = JSON.stringify(filters);
    return http
      .get(`/admin/users/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getCreate() {
    return http
      .get('/admin/users/create', {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getDetail(id: number) {
    return http
      .get(`/admin/users/get/${id}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getUpdate(id: number) {
    return http
      .get(`/admin/users/update/${id}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  create(user: UserModal) {
    const formData = objectToFormData(user);

    return httpFormData
      .post("/admin/users/create", formData, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  update(user: UserModal) {
    const formData = objectToFormData(user);

    return httpFormData
      .post(`/admin/users/update/${user.Id}`, formData, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  delete(Id: number) {
    return http
      .post(`/admin/users/delete/${Id}`, {
        Id
      }, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
}
export default new UserService();
