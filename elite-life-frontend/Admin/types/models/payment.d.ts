export interface Payment {
    status: boolean;
    data: PaymentItem[];
    total: number;
}

export interface PaymentItem {
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
    OrderPending: string;
    OrderValue: string;
    PayDate: string;
    OrgId: number;
    Note: string | null;
    PayrollCommisionDetails: PayrollCommisionDetail[];
    Order: Order;
    Student: Student;
}

interface PayrollCommisionDetail {
    Id: number;
    Collaborator: Collaborator;
    Org: Organization;
    IsImport: boolean;
    Note: string;
    Rank: Rank;
}

interface Collaborator {
    Id: number;
    Name: string;
    UserName: string;
}

interface Organization {
    Id: number;
    Name: string;
}

interface Rank {
    Id: number;
    Name: string;
}

interface Order {
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
    PayDate2: string | null;
    PayDate3: string;
    Rate: number;
    Bonus: number;
    NextDate: string;
    Student: Student;
}

interface Student {
    CreatedBy: string;
    CreatedAt: string;
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Address: string;
    Identity: string;
    IdentityImg: string | null;
    IdentityImg2: string | null;
    DateOfBirth: string | null;
    Gender: string | null;
    BeginDate: string | null;
    ContractNumber: string | null;
    LevelId: number | null;
    StudentGroupId: number | null;
    CollaboratorId: number;
    ProductId: number | null;
    UserId: number | null;
    Payment: string | null;
    TotalPay: number | null;
    IsLock: boolean | null;
    UserName: string;
    OrgId: number | null;
    SubInstituteId: number | null;
    RepresentativeOfficeId: number | null;
}