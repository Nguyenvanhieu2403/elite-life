import { objectToFormData } from "../common/common";
import { RegisterModal } from "../types/models/register";
import { http, httpFormData } from "./CommonService";
class AuthService {
    login(
        UserName: string,
        Password: string,
    ) {
        return http
            .post("/sale/auth/login", {
                UserName,
                Password,
            })
            .then(response => {
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("jwt");
        localStorage.removeItem("tokenExpires");
        localStorage.removeItem("Info");
        localStorage.removeItem("Permissions");
        localStorage.removeItem("isDisabled");
    }
    Register(register: RegisterModal) {
        const formData = objectToFormData(register)
        return httpFormData
            .post("/sale/auth/register", formData, {
            })
            .then(response => {
                return response.data;
            });
    }
    getRegister() {
        return httpFormData
            .get("/sale/auth/register", {
            })
            .then(response => {
                return response.data;
            });
    }
    RegisterKyc(register: RegisterModal) {
        var formData = new FormData();
        const files = register.Files
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append(`Files`, files[i]);
            }
        }
        for (const key in register) {
            if (register.hasOwnProperty(key)) {
                const value = (register as any)[key];
                if (value !== null && value !== undefined) {
                    if (key == "Files") {
                        //ignore
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            }
        }
        return httpFormData
            .post("/sale/auth/registerKyc", formData, {
            })
            .then(response => {
                return response.data;
            });
    }
    // getConfig() {
    //     return http
    //         .get('/sale/auth/configSettingKyc', {
    //         })
    //         .then(response => {
    //             return response.data;
    //         });
    // }
    // getRegister() {
    //     return http
    //         .get('/sale/auth/registerKyc', {
    //         })
    //         .then(response => {
    //             return response.data;
    //         });
    // }
    getBank(nationId: number | null) {
        return http
            .get(`/sale/auth/getBanks/${nationId}`, {
            })
            .then(response => {
                return response.data;
            });
    }
}

export default new AuthService();
