export interface Decisions {
  CreatedBy?: string;
  CreatedAt?: string;
  Id: number;
  Name?: string;
  EffectiveDate?: string;
  CollaboratorId?: number;
  OrgId?: number;
  RankId?: number;
  ManageId?: null | number;
  ApproverId?: number;
  ApproverName?: string;
  OrgPolicyRankId?: number;
  File?: null | string;
  Status?: string;
  Org?: Org;
}
export interface Org {
  Id?: number;
  Name?: string;
  Image?: null | string;
}
export interface DecisionModal {
  Id?: number | null;
  Name?: string;
  EffectiveDate?: string;
  CollaboratorId?: number | null;
  OrgId?: number | null;
  RankId?: number | null;
  ManageId?: number | null;
  ApproverId?: number | null;
  OrgPolicyRankId?: number | null;
  File?: File | null;
}