export interface Order {
    PayPeriod?: number
    Amount: number
    Amount1: number
    Amount2: number
    Amount3: number
    Bonus?: number
    Id?: number
    PayAmount?: number
    Pending?: number
    ProductId?: number
    Rate?: number
    Status?: number
    TotalPaid?: number;
    TotalAmount?: number
    CreatedAt?: string;
    FinishDate?: string;
    Estimate?: number;
    PayDate?: string;
    PayDate1?: string;
    PayDate2?: string;
    PayDate3?: string;
    NextDate?: string;
    DiscountAmount?: number;
    DiscountNote?: string;
    OrderValue?: string;
    Code?: string;
}
export interface OrderAddModal {
    StudentId: number;
    ProductId: number;
    Amount: number;
    TotalAmount: number;
    PayPeriod: number;
    DiscountAmount: number;
    DiscountNote: string
}