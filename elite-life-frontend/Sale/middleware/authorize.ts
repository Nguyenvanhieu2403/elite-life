import { parseJsonText } from "typescript";

export function authorizeLogin(): boolean {
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
    }
    return isLogin;
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
            }
        } catch (error) {
            console.error('Lỗi khi phân tích quyền từ localStorage:', error);
        }
    }
    return currentPermissions;
}