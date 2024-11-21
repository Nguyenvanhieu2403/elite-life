export interface Product {
  Id: number,
  Name: string,
  Price: number,
  ProjectId?: number | null,
  DiscountPayPeriod1?: number,
  DiscountPayPeriod2?: number,
  DiscountPayPeriod3?: number,
  CreatedAt?: string,
  IsEnable?: boolean
}