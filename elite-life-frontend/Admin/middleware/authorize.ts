import { parseJsonText } from "typescript";

export function authorizeLogin(): boolean {
    try {
        let isLogin = false;
        const tokenExpires = localStorage.getItem('tokenExpires');
        const jwt = localStorage.getItem('jwt');
        const nowTime = Date.now() / 1000;

        if (tokenExpires && jwt) {
            const tokenExpiresTime = parseInt(tokenExpires);

            if (!isNaN(tokenExpiresTime)) {
                isLogin = tokenExpiresTime >= nowTime;
            } else {
                isLogin = true;
            }
        }
        if (!isLogin) {
            localStorage.removeItem("jwt");
            localStorage.removeItem("tokenExpires");
            localStorage.removeItem("Info");
            localStorage.removeItem("Permissions");
        }
        return isLogin;
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
}

export function getPermissions(): Array<string> {
    let currentPermissions: Array<string> = [];

    const permissionsJSON = localStorage.getItem('Permissions');

    if (permissionsJSON) {
        try {
            const parsedPermissions = JSON.parse(permissionsJSON);
            if (Array.isArray(parsedPermissions)) {
                var permissions = parsedPermissions.map((item: any) => (item.Permission ? item.Permission.Controller : ""));
                currentPermissions = Array.from(new Set(permissions.filter(item => item !== null)));
            } else {
                return [];
            }
        } catch (error) {
            console.error('Lỗi khi phân tích quyền từ localStorage:', error);
            return [];
        }
    }
    return currentPermissions;
}





export function authorizeAccountControllerAction(controller: string, action: string) {
    try {
        let isAuthorized = false;
        const permissionsJSON = localStorage.getItem('Permissions');
        if (permissionsJSON) {
            const roles = JSON.parse(permissionsJSON);
            for (const role of roles) {
                if (role.Permission && role.Permission.Controller === controller && role.Permission.Action === action) {
                    return true;
                }
            }
        }
        return isAuthorized;
    } catch (error) {
        return false;
    }
}

