export interface CollaboratorModal {
  CreatedBy?: string;
  CreatedAt?: string;
  Id?: number;
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
  Level?: number;
  IsRepOffice?: boolean;
  RankId?: number;
  ParentId?: number;
  BankId?: number;
  BankBranchName?: string;
  BankOwner?: string;
  BankNumber?: string;
  Note?: string;
  IsLock?: boolean;
  UserName?: string;
  OrgId?: number;
  ManageId?: number;
  LastDecisionId?: number;
  Parent?: UserDataDetail;
  Bank?: {
    CreatedBy?: string;
    CreatedAt?: string;
    Id?: number;
    Name?: string;
    OrderNo?: number;
  };
  Rank?: {
    CreatedBy?: string;
    CreatedAt?: string;
    Id?: number;
    Name?: string;
    Value?: number;
  };
  Org?: {
    CreatedBy?: string;
    CreatedAt?: string;
    Id?: number;
    Code?: string;
    Name?: string;
    Image?: string | null;
    ParentId?: number | null;
  };
  Image?: string | null;
}

export interface FileType {
  Text?: string;
  Value?: number;
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

export interface Collaborators {
  Name: string, 
  UserName: string, 
  Level: string
}