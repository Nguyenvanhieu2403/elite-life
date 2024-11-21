export interface CollaboratorRank {
    Id: number;
    Name: string;
    Value: number | null;
    IsCom: boolean = null
}

export interface CollaboratorRankModal {
    Id?: number | null;
    Name?: string;
    Value?: number | null;
    IsCom: boolean;
    Level?: number
}
