export interface BankAccount {
  Id: number;
  Name?: string;
  Email?: string;
  Mobile?: string;
  Address?: string;
  Identity?: string;
  ContractNumber?: string;
  BankId?: string;
  BankBranchName?: string;
  BankOwner?: string;
  BankNumber?: string;
  UserName?: string;
  Bank?: any;
  CreatedAt?: string;
}

export interface BankAccountModal {
  Id?: number | null;
  NationId?: number | null;
  BankId?: number | null;
  BankBranchName?: string;
  BankOwner?: string;
  BankNumber?: string;
}
