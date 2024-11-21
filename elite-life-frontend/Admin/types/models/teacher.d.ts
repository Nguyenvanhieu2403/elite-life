export interface Teacher {
    UserName: string;
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Identity: string;
    Address: string;
    Gender: boolean;
    IsLock: boolean;
    Image: string;
    DateOfBirth: string
}

export interface TeacherModal {
    Id?: number | null;
    Name?: string;
    Email?: string;
    Mobile?: string;
    Identity?: string;
    Address?: string;
    TeacherType?: string;
    Password?: string;
    RePassword?: string;
    Gender?: boolean | null;
    TeacherTypeId?: number | null;
    Image?: File | null;
    File?: File | null;
    DateOfBirth?: string 
}
