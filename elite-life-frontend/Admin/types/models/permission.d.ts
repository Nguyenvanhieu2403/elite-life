export interface Permission {
    Id: number;
    Name?: string;
    Code?: string;
    Action?: string;
    Controller?: string;
    CreatedBy?: string;
    CreatedAt?: string;
}
export interface PermissionModal {
    Id?: number | null;
    Code?: string;
    Name?: string;
    Action?: string;
    Controller?: string;
}