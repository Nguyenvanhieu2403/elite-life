export interface UserForeign {
    Id: number;
    UserName?: string;
    RoleId?: number;
    RoleName?: string;
    DisplayName?: string;
    Email?: string;
    Mobile?: string;
    Address?: string;
    ApplicationType?: string;
    Permission?: string;
    CreatedBy?: string;
    CreatedAt?: string;
}

export interface UserForeignModal {
    Id?: number | null;
    UserName?: string;
    Password?: string;
    RePassword?: string;
    RoleId?: number | null;
    DisplayName?: string;
    Email?: string;
    Mobile?: string;
    Address?: string;
    IsAdmin: boolean;
}