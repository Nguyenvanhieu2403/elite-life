
export interface Permission {
    CreatedBy: string;
    CreatedAt: string;
    Id: number;
    Code: string | null;
    Name: string;
    Action: string | null;
    Controller: string | null;
    Function: string | null;
}

export interface Info {
    CreatedBy: string;
    CreatedAt: string;
    Id: number;
    UserName: string;
    RoleId: number;
    DisplayName: string;
    Email: string;
    Mobile: string;
    Address: string;
    Permission: string | null;
    Note: string | null;
}

export interface Data {
    Info: Info;
    Permissions: Permission[];
}

export interface LoginResponse {
    status: boolean;
    token: string;
    tokenExpires: number;
    data: Data;
    message?: any;
}