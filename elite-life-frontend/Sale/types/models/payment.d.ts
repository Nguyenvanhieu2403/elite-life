export interface PaymentData {
    CreatedBy: string;
    CreatedAt: string;
    Id: number;
    Year: number;
    Month: number;
    Period: number;
    StartDate: string;
    EndDate: string;
    EffectiveDate: string;
    StudentId: number;
    OrderId: number;
    PayPeriod: string;
    PayNum: number;
    OrderTotalValue: string;
    OrderPending?: string;
    OrderValue: string;
    PayDate: string;
    OrgId: number;
    Note?: null;
    PayrollCommisionDetails: PayrollCommissionDetail[];
    Order: {
        CreatedBy: string;
        CreatedAt: string;
        Id: number;
        StudentId: number;
        ProductId: number;
        UserId: number;
        Status: number;
        Amount: number;
        TotalAmount: number;
        PayAmount: number;
        Pending: number;
        PayPeriod: number;
        Amount1: number;
        Amount2: number;
        Amount3: number;
        AmountPercent1: number;
        AmountPercent2: number;
        AmountPercent3: number;
        PayDate1: string;
        PayDate2?: null;
        PayDate3?: null;
        AmountCom1: number;
        AmountCom2: number;
        AmountCom3: number;
        AmountComPercent1: number;
        AmountComPercent2: number;
        AmountComPercent3: number;
        PayDateCom1: string;
        PayDateCom2?: null;
        PayDateCom3?: null;
        Rate: number;
        Bonus: number;
        NextDate: string;
    };
    Student: {
        Id: number;
        Name: string;
        UserName: string;
    };
}

interface PayrollCommissionDetail {
    Id: number;
    Type: number;
    RankValue: number;
    CommissionValue: number;
    Value: number;
    IsImport: boolean;
    ImportNote?: null;
    Collaborator: {
        Id: number;
        Name: string;
        UserName: string;
    };
    Org: {
        Id: number;
        Code: string;
        Name: string;
    };
    Rank: {
        Id: number;
        Name: string;
    };
}
