export interface RegisterModal {
    Name?: string,
    Identity?: string,
    IdentityDate?: string,
    IdentityPlace?: string,
    Email?: string,
    Mobile?: string,
    ParentId?: number | null,
    BankNumber?: string,
    BankBranchName?: string,
    BankId?: number | null,
    BankOwner?: string,
    Password?: string,
    RePassword?: string,
    Image?: string | null;
    Files?: File[] | null
    File?: File[] | null
    ParentCode?: string;
    Avatar?: File | null;
}

export interface FileInterface {
    IdentityIMG?: File | null;
    IdentityIMG2?: File | null;
    FaceIMG?: File | null;
    Avatar?: File | null;
}
export interface Register {
    Name?: string,
    Identity?: string,
    IdentityDate?: string,
    ParentCode?: string,
    IdentityPlace?: string,
    Email?: string,
    Mobile?: string,
    BankNumber?: string,
    BankBranchName?: string,
    BankId?: number | null,
    BankOwner?: string,
    UserName?: string
    ElectronicContractId?: number
}

