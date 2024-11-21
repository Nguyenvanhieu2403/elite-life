export interface Collaborators {
  Id: number;
  Name?: string;
  Email?: string;
  Mobile?: string;
  Address?: string;
  Identity?: string;
  IdentityDate?: string;
  IdentityPlace?: string;
  IdentityIMG?: string;
  IdentityImg2?: string;
  DateOfBirth?: string;
  BeginDate?: string;
  ContractNumber?: string;
  Level?: string;
  IsRepOffice?: string;
  RankId?: string;
  ParentId?: string;
  BankId?: string;
  BankBranchName?: string;
  BankNumber?: string;
  BankBranchName?: string;
  Note?: string;
  IsLock: boolean;
  UserName?: string;
  BankBranchName?: string;
  CollaboratorStatistic?: string;
  Image?: string;
  CreatedBy?: string;
  CreatedAt?: string;
}
export interface TreeView {
  key: string;
  label: string;
  data: string;
  children: TreeView[];
}

export interface CollaboratorModal {
  Id?: number | null;
  UserName?: string;
  Name?: string;
  Email?: string;
  Mobile?: string;
  Address?: string;
  Identity?: string;
  IdentityDate?: string;
  IdentityPlace?: string;
  Level?: string;
  IsRepOffice?: string;
  RankId?: number | null;
  ParentId?: number | null;
  BankId?: number | null;
  BankBranchName?: string;
  BankOwner?: string;
  BankNumber?: string;
  Note?: string;
  Password?: string;
  RePassword?: string;
  Image?: string | null;
  File?: File | null;
  BankSwiftCode?: string;
  NationId: number | null
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

export interface FileModel {
  Id?: number | null;
  Name?: string | null;
}

export interface CollaboratorFileUpload {
  Id: number;
  FileIds?: any;
  Files?: any;
}