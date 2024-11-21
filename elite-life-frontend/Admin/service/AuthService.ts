import authHeader from "./AuthHeader";
import { http, httpFormData } from "./CommonService";
class AuthService {
    login(
        UserName: string,
        Password: string,
    ) {
        return http
            .post("/admin/auth/login", {
                UserName,
                Password,
            })
            .then(response => {
                return response.data;
            });
    }


    logout() {
        return http
            .post('/admin/auth/logout', {}, {
                headers: authHeader(),
            })
            .then(response => {
                localStorage.removeItem("jwt");
                localStorage.removeItem("tokenExpires");
                localStorage.removeItem("Info");
                localStorage.removeItem("Permissions");
                return response.data;
            });
    }
}

export default new AuthService();
