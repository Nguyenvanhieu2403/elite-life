export interface Room {
    Id: number;
    Name: string;
    CreatedAt: string;
}

export interface RoomModal {
    Id?: number | null;
    Name?: string;
    Note?: string;
}