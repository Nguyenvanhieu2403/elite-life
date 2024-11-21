export interface OtherListData {

    CreatedBy?: string;
    CreatedAt?: Date;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    Id: number;
    Type: string;
    Code: string;
    Name: string;
    Number1?: number | null;
    Number2?: number | null;
    String1?: string;
    String2?: string;
    Note?: string;
    Ord?: number;
    IsPublic?: boolean;

}
interface DataResponse {
    total: number;
    data: ResponseData[];
    status: boolean;
}