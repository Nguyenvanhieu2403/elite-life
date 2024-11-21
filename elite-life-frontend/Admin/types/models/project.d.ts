export interface ProjectInterface {
    Id: number;
    Name: string;
    Note: string;
    ShortName: string;
    ProjectCode: string;
    CreatedBy: string;
    CreatedAt: Date | null = null;
}

export interface ProjectModal {
    Id?: number | null;
    ProjectCode?: string;
    Name?: string;
    ShortName?: string;
    Note?: string;
    NationIds: Array;
    PersonIds: Array,
}
export interface NationInProject {
    Id: number;
    Nation: Nation;
}
export interface Nation {
    Id: number;
    Code: string;
    Name: string;
    Note: string;
}
export interface PersonInProject {
    Id: number;
    Person: Person;
}
export interface Person {
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Identity: string;
    DateOfBirth: string;
    Gender: boolean;
    Address: string;
}



