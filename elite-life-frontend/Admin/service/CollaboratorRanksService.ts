import { http, httpFormData } from "./CommonService";

import authHeader from './AuthHeader';
import { CollaboratorRankModal } from "../types/models/collaboratorRanks";

class CollaboratorRankService {
  get(page: number, limit: number, filters: any) {
    var filterQueryString = JSON.stringify(filters);
    return http
      .get(`/admin/collaboratorRanks/get?page=${page}&limit=${limit}&filters=${filterQueryString}`, {
        headers: authHeader()
      })
      .then(response => {
        return response.data;
      });
  }
  getDetail(id: number) {
    return http
      .get(`/admin/collaboratorRanks/update/${id}`, {
        headers: authHeader(),
      })
      .then(response => {
        return response.data;
      });
  }
  create(collaboratorRank: CollaboratorRankModal) {
    return http
      .post("/admin/collaboratorRanks/create", collaboratorRank
        , {
          headers: authHeader()
        })
      .then(response => {
        return response.data;
      });
  }
  update(collaboratorRank: CollaboratorRankModal) {
    return http
      .post(`/admin/collaboratorRanks/update/${collaboratorRank.Id}`, collaboratorRank, {
        headers: authHeader()
      })
      .then(response => {
        return response.data;
      });
  }
  delete(Id: number) {
    return http
      .post(`/admin/collaboratorRanks/delete/${Id}`, {
      }, {
        headers: authHeader()
      })
      .then(response => {
        return response.data;
      });
  }
}
export default new CollaboratorRankService();
