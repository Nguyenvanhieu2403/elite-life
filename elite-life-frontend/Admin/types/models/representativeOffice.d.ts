export interface RepresentativeOffice {
    Id: number;
    Image: string | null;
    Code: string;
    Name: string;
    Parent: string;
    CreatedBy: string;
    CreatedAt: string;
}

export interface RepresentativeOfficeModal {
    Id: number | null;
    Code?: string;
    Name?: string;
    ParentId?: number | null;
    Image?: File | null;
}