export interface StudentsTemporary {
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
  Status: string | null = null;
  SchoolId: number | null = null;
  StudentTemporaryTypeId: number | null = null;
}
export interface StudentsTemporaryModal {
  Id?: number | null;
  Name?: string;
  Email?: string;
  Mobile?: string;
  Address?: string;
  Identity?: string;
  DateOfBirth?: string
  Gender?: boolean | number;
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
  SchoolId: number | null = null;
  StudentTemporaryTypeId: number | null = null;
}
