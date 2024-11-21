export interface Kyc {
    Id: number
    EnableKyc: boolean,
    PermitDocument: string,
    DuplicateDocumentNumber: boolean
    ManualApprovalKyc: boolean,
    WaitingTimeApprovalKyc: number
}

export type KycType = "EnableKyc" | "PermitDocument" | "DuplicateDocumentNumber" | "ManualApprovalKyc" | "WaitingTimeApprovalKyc"