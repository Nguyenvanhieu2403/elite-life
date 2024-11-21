export interface Policie {
    Id: number;
    EffectiveDate?: string;
    OrgPolicyRanks?: Array;
    Status?: string;
    Org?: Org;
    CreatedAt?: string;
    StudentPayment1Percent1?: number | null;
    StudentPayment2Percent1?: number | null;
    StudentPayment2Percent2?: number | null;
    StudentPayment3Percent1?: number | null;
    StudentPayment3Percent2?: number | null;
    StudentPayment3Percent3?: number | null;

    CollaboratorPayment1Percent1?: number | null;
    CollaboratorPayment1Percent2?: number | null;
    CollaboratorPayment2Percent1?: number | null;
    CollaboratorPayment2Percent2?: number | null;
    CollaboratorPayment3Percent1?: number | null;
    CollaboratorPayment3Percent2?: number | null;
    CollaboratorPayment3Percent3?: number | null;
}
export interface Org {
    length: number | null;
    Id: number | null;
    Name: string;
}
export interface PolicieModal {
    Id?: number | null;
    OrgId?: number | null | null;
    EffectiveDate?: string;
    ApproverId?: number | null | null;
    OrgPolicyRanks?: Array;
    StudentPayment1Percent1?: number | null;
    StudentPayment2Percent1?: number | null;
    StudentPayment2Percent2?: number | null;
    StudentPayment3Percent1?: number | null;
    StudentPayment3Percent2?: number | null;
    StudentPayment3Percent3?: number | null;

    CollaboratorPayment1Percent1?: number | null;
    CollaboratorPayment1Percent2?: number | null;
    CollaboratorPayment2Percent1?: number | null;
    CollaboratorPayment2Percent2?: number | null;
    CollaboratorPayment3Percent1?: number | null;
    CollaboratorPayment3Percent2?: number | null;
    CollaboratorPayment3Percent3?: number | null;
    File?: File | null;
}
