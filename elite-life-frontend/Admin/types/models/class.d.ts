export interface ClassInterface {
    Id: number;
    Name: string;
    ClassLevel: string;
    DayTotal: string;
    TotalStudy: number;
    UserManager: string;
    Address: string;
    ApplicationType: string;
    Permission: string;
    CreatedBy: string;
    CreatedAt: string;
    StartDate: string;
    TestDay: string;
    TestFinal: string;
    IsSchedule: boolean;

}

export interface ClassModal {
    Id?: number | null;
    Name?: string;
    Note?: string;
    DayStudy?: number | null;
    DayStudyVN?: number | null;
    DayStudyTG?: number | null;
    TestDay?: string;
    TestDate: string;
    TestFinal: string;
    ClassLevelId?: number | null;
    UserManagerId?: number | null;
    StartDate: string;
}
export interface TeacherInClass {
    Id: number;
    Teacher: Teacher;
}
export interface Teacher {
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Identity: string;
    Address: string;
    TotalStudy: string;
}
export interface Student {
    ContractNumber: string;
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Identity: string;
    DateOfBirth: string;
    Gender: boolean;
    Address: string;
    TotalStudy: string;
}
export interface StudentInClass {
    Id: number;
    Student: Student;
}


export interface ScheduleModal {
    LearnDate?: string;
    TeacherId?: number | null;
    RoomId?: number | null;
    BeginDate?: string;
    EndDate?: string;
}
