import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { Role, RoleModal } from "../types/models/role";

class RoleService {
  get(page: number, limit: number, filters: any, type: string | null) {
    var filterQueryString = JSON.stringify(filters);
    return http
      .get(`/admin/roles/get/${type}?page=${page}&limit=${limit}&filters=${filterQueryString}&type=${type}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getCreate(type: string | null) {
    return http
      .get(`/admin/roles/create/${type}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  getUpdate(id: number, type: string | null) {
    return http
      .get(`/admin/roles/update/${type}/${id}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }

  create(role: RoleModal, type: string | null) {
    return http
      .post(`/admin/roles/create/${type}`, role, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  update(role: RoleModal, type: string | null) {
    return http
      .post(`/admin/roles/update/${type}/${role.Id}`, role, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  delete(Id: number, type: string | null) {
    return http
      .post(`/admin/roles/delete/${type}/${Id}`, {
        Id
      }, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
}
export default new RoleService();
