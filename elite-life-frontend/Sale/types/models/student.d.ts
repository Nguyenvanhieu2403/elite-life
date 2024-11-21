export interface Student {
    Id: number;
    Name: string;
    Email: string;
    Mobile: string;
    Identity: string;
    Gender: boolean;
    Order: Order;
}
export interface Order {
    OrderId: number;
    PayAmount: number;
}
