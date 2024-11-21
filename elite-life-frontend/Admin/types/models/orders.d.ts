interface Product {
    Id: number;
    Name: string;
    Price: number;
  }
  
  interface Collaborator {
    Id: number;
    Name: string;
    Rank: string;
    UserName: string;
  }
  
 export interface OrderDetailItem {
    Id: number;
    WalletTypeEnums: string;
    Collaborator: Collaborator;
  }
  
 export interface OrderDetailData {
    CreatedBy: string;
    CreatedAt: string;
    Id: number;
    CollaboratorId: number;
    ProductId: number;
    Value: number;
    Pending: number;
    Payed: number;
    CompletedDate: string;
    IsProcess: boolean;
    CommissionExpected: number;
    CommissionReal: number;
    CommissionCustomerMax: number;
    CommissionCustomer: number;
    CommissionCustomerShare: number;
    CommissionCustomerGratitude: number;
    CommissionSaleMax: number;
    CommissionSale: number;
    CommissionSale1: number;
    CommissionSale2: number;
    CommissionSale3: number;
    Product: Product;
    Collaborator: Collaborator;
    OrderDetails: OrderDetailItem[];
  }
  