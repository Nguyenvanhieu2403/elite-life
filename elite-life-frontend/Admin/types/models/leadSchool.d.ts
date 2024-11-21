export interface LeadSchoolInterface {
    Id: number;
    OrgId?: number;
    RepresentativeOfficeId?: number;
    SchoolId?: number;
    Status?: string;
    BeginDate?: string;
    CreatedBy?: string;
    CreatedAt?: string;
}

export interface LeadSchoolModal {
    Id?: number | null;
    OrgId?: number | null;
    RepresentativeOfficeId?: number | null;
    SchoolId?: number | null;
    Status?: string;
    BeginDate?: string;
    CollaboratorId: number | null
}




