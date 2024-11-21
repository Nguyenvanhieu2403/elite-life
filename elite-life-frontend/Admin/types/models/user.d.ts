export interface User {
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

export interface UserModal {
    File?: File | null;
    Id?: number | null;
    UserName?: string;
    Password?: string;
    RePassword?: string;
    RoleId?: number | null;
    DisplayName?: string;
    Email?: string;
    Mobile?: string;
    Image?: string | null;
    Address?: string;
    SubInstituteIds: Array,
    OrgIds: Array,
}
