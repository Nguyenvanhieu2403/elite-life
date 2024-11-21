export interface Student {
  Id: number = null;
  File: string = null;
  Name: string | null = null;
  Email: string = null;
  Mobile: string = null;
  IsLock: boolean = null;
  Address: string | null = null;
  UserName: string | null = null;
  Identity: string | null = null;
  DateOfBirth: string | Date = null;
  Gender: boolean | number = null;
  GenderName: string = null;
  BeginDate: Date | null = null;
  ContractNumber: string | null = null;
  LevelId: number | null = null;
  StudyStatus: number | null = null;
  StudentStatusTypes: string;
  StudentStatus: string;
  OpeningDay: string | Date = null;
  LevelName: string;
  StudentGroupId: number | null = null;
  PayPeriod: number | null = null;
  GroupStudentName: string;
  CollaboratorId: number | null = null;
  CollaboratorName: string;
  CollaboratorUserName: string;
  ProductId: number | null = null;
  SubInstituteId: number | null = null;
  OrgId: number | null = null;
  RepresentativeOfficeId: number | null = null;
  ProductName: string;
  Image: string = null
  RePassword: string
  Password: string
  CreatedAt: Date | null = null;
  IdentityPlace: string = null;
  IdentityDate: string | Date = null;
  StudyStatusTypeId: number | null = null;
}
export interface StudentModal {
  Id?: number | null;
  Name?: string;
  Email?: string;
  Mobile?: string;
  Address?: string;
  Identity?: string;
  DateOfBirth?: string
  Gender?: boolean;
  LevelId: number | null;
  StudentGroupId: number | null;
  PayPeriod: number | null;
  CollaboratorId: number | null;
  Password?: string;
  RePassword?: string;
  File?: File | null;
  SubInstituteId: number | null = null;
  OrgId: number | null = null;
  ProductId: number | null = null;
  RepresentativeOfficeId: number | null = null;
  IdentityPlace: string;
  IdentityDate: string;
  StudyStatusTypeId: number | null = null;
  StudentStatus?: string;
  OpeningDay?: string
}

export interface StudentImportModal {
  file: File | null;
}
export interface CommentModal {
  StudentId?: number | null;
  Note: string | null;
}

export interface FileType {
  Text: string;
  Value: number;
}

export interface FileItem {
  Id?: number | null;
  FileName?: string | null;
  FileId?: number | null;
  File?: FileModel | null

}