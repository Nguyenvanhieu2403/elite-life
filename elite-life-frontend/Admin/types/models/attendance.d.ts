export interface AttendanceType {
    ScheduleType: string;
    TeacherId: number ;
    TeacherName: string ;
    ClassName: string ;
    TeachingDay: string ;
    StudyTime: string ;
    Note?: string
}
export interface AttendanceModal {
    TeacherId: number,
    SchedulesId: number,
    TeachingDay: string,
    Note?: string,
    SchedulesType: string
}

export interface AttendanceStudentType {
    Id: number;
    Code: string;
    Name: string;
}

export interface AttendanceStudent {
    Id: number;
    Name?: string;
    DateOfBirth?: string | Date | any;
    UserName?: string;
    Image?: string | null;
}

export interface AttendanceStudentClassData {
    TeacherName: string;
    ClassId: number;
    ClassName: string;
    BeginDate: string;
    EndDate: string;
    TeachingDay: string;
    AttendanceTime: string;
    Students: AttendanceStudent[];
    AttendanceType: AttendanceStudentType[];
    search?: boolean;
}