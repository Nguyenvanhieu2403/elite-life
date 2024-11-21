export interface ServiceContracts {
  Id: number;
  Name?: string;
  BeginDate?: string;
  StudentTemporaryId?: number;
  ContractCode?: string;
  CollaboratorId?: number;
  ProductId?: number;
  Status?: string;
  Note?: string;
  CreatedBy?: string;
  CreatedAt?: string;
  PayPeriod?: number;
  TotalPay?: number
}

export interface ServiceContractsModal {
  Id?: number | null;
  Name?: string;
  BeginDate?: string;
  StudentTemporaryId?: number | null;
  ContractCode?: string;
  CollaboratorId?: number | null;
  ProductId?: number | null;
  Status?: string;
  Note?: string;
  CreatedBy?: string;
  CreatedAt?: string;
  PayPeriod?: number | null;
  TotalPay?: number | null
}

