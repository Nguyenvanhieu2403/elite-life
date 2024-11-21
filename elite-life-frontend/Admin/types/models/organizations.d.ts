export interface Organizations {
    Id: number;
    Image: string | null;
    Code: string;
    Name: string;
    CreatedBy: string;
    CreatedAt: string;
}

export interface OrganizationModal {
    Id: number | null;
    Code?: string;
    Name?: string;
    Image?: File | null;
}
