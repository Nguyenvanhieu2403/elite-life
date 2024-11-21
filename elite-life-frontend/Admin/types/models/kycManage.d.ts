export interface KycManage {
  Info: {
    CreatedBy: string;
    CreatedAt: string;
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Address: string;
    Identity: string;
    IdentityDate: string;
    IdentityPlace: string;
    DateOfBirth: string | null;
    BeginDate: string;
    ContractNumber: string | null;
    Level: string | null;
    IsRepOffice: boolean;
    RankId: number;
    ParentId: number | null;
    BankId: number | null;
    BankBranchName: string;
    BankOwner: string;
    BankNumber: string;
    Note: string;
    ManageId: number | null;
    IdentityIMG: string | null;
    IdentityIMG2: string | null;
    FaceIMG: string | null;
    Avatar: string | null;
    ElectronicContractId: number;
    Status: string;
    TimeKyc: string;
  }
  ParentName: string | null;
  BankName: string | null;
}