export interface Role {
    Id: number;
    Name?: string;
    Permission?: string;
    Permissions?: Array;
    CreatedBy?: string;
    CreatedAt?: string;
}

export interface RoleModal {
    Id?: number | null;
    Name?: string;
    PermissionIds?: Array;
}