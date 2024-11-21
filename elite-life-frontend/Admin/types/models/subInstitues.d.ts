export interface SubInstitues {
    Id: number;
    Image: string | null;
    Name: string;
    CreatedBy: string;
    CreatedAt: string;
}

export interface SubInstituesModal {
    Id: number | null;
    Name?: string;
    Image?: File | null;
}
