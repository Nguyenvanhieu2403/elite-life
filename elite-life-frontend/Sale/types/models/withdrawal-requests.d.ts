interface Collaborator {
  Id: number;
  Name: string;
  UserName: string;
}

interface Bank {
  Id: number;
  Name: string;
}

export interface WithdrawRequest {
  CreatedBy: string;
  CreatedAt: string; // You could use Date type if you plan to parse this to a Date object.
  Id: number;
  Code: string;
  CollaboratorId: number;
  BankNumber: string;
  BankOwner: string;
  BankId: number;
  BankBranchName: string;
  WithdrawalAmount: number;
  Note: string;
  Status: string;
  NoteRejection: string;
  Image: string | null;
  Collaborator: Collaborator;
  Bank: Bank;
}

export interface WithdrawRequestModal {
  BankNumber: string, 
  BankOwner: string, 
  BankId: string, 
  WithdrawalAmount: number, 
}