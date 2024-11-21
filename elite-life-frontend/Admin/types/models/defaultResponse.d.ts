export interface DefaultResponse {
    status?: boolean;
    statusCode?: number;
    data?: any;
    total?: number;
    message?: any;
}
export interface HomePageResponse {
    status?: boolean;
    data: CollaboratorHome;
}

export interface MonthData {
    month: string;
    count: number;
}

export interface CollaboratorHome {
    Collaborators: CollaboratorData[]
    TotalMembersIsSale: number
    TotalNumberOfVIPMembers: number
    TotalOrdersSold: number
    TotalRevenue: number
    TotalSystemMembers: number
}

export interface CollaboratorData {
    Available: number,
    BeginDate: string,
    CreatedAt: string,
    Customer: number,
    Id: number,
    Name: string,
    Rank: string,
    Sale: number,
    UserName: string
}