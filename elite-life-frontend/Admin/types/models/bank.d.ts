export interface Banks {
    Id: number;
    Name?: string;
    NationId?: string;
    CreatedAt?: string;
}

export interface BankModal {
    Id?: number | null;
    Name?: string;
    NationId?: number | null;
}