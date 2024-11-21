export interface LazyStateObject {
    first: number,
    rows: number,
    page: number,
    sortField: string | null,
    sortOrder: string | null,
    filters: LazyStateFilterObject
}

export interface LazyStateFilterObject {
    [property: string]: {
        value: any,
        matchMode: FilterMatchMode
    } | any
}