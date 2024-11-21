export interface Info {
    CreatedBy?: null | string;
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
    IsSale: boolean;
    Level?: number;
    IsRepOffice?: boolean;
    RankId?: number;
    ParentId?: number;
    BankId?: null | number;
    BankBranchName?: string;
    BankOwner?: string;
    BankNumber?: string;
    Note?: string;
    IsLock?: boolean;
    UserName?: string;
    OrgId?: number;
    ManageId?: number;
    LastDecisionId?: number;
    Parent?: {
        CreatedBy?: null | string;
        CreatedAt?: string;
        Id?: number;
        Name?: string;
        Email?: string;
        Mobile?: string;
        Address?: string;
        Identity?: string;
        IdentityIMG?: string;
        IdentityImg2?: string;
        DateOfBirth?: string;
        BeginDate?: string;
        ContractNumber?: string;
        Level?: number;
        IsRepOffice?: boolean;
        RankId?: number;
        ParentId?: number;
        BankId?: null | number;
        BankBranchName?: string;
        BankOwner?: string;
        BankNumber?: string;
        Note?: string;
        IsLock?: boolean;
        UserName?: string;
        OrgId?: number;
        ManageId?: number;
        LastDecisionId?: number;
    };
    Bank?: {
        CreatedBy?: string;
        CreatedAt?: string;
        Id?: number;
        Name?: string;
        OrderNo?: number;
    };
    Rank: string;
    Org?: {
        CreatedBy?: string;
        CreatedAt?: string;
        Id?: number;
        Code?: string;
        Name?: string;
        Image?: null | string;
        ParentId?: null | number;
    };
    Image?: string;
}

export interface Payment {
    CreatedAt?: string;
    Id?: number;
    Type?: number;
    Value?: number;
    PayrollCommision?: {
        PayDate?: string;
        Student?: {
            Id?: number;
            Collaborator?: {
                Id?: number;
                Name?: string;
                UserName?: string;
                Image?: null | string;
            };
        };
    };
}
