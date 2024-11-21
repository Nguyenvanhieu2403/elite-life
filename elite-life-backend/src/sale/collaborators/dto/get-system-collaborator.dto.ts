export class GetSystemCollaboratorDto {
    Id: number;
    UserName: string;
    Name: string;
    Email: string = null;
    Mobile: string = null;
    ParentId: number | null;
    Level: number
}

export class BinaryCollaboratorDto {
    Id: number;
    Name: string;
    UserName?: string;
    Rank?: string;
    ParentId: number | null;
    IsGroup: boolean
}

export class Note {
    Key: number;
    Name: string;
    UserName: string;
    Rank: string;
    ParentId: number | null;
    Label: string;
    Children: Note[]

    constructor(
        id: number,
        name: string,
        userName: string,
        rank: string,
        parentId: number | null,
        nameChildren: string,
        children: Note[] = []
    ) {
        this.Key = id;
        this.Name = name;
        this.UserName = userName;
        this.Rank = rank;
        this.ParentId = parentId;
        this.Label = nameChildren;
        this.Children = children;
    }
}


