'use client';
import { useRouter } from "next/navigation";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import CollaboratorRankService from '../../../service/CollaboratorRanksService';
import { CollaboratorRank } from '../../../types/types';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, formatNumberWithThousandSeparator, processFilter } from '../../../common/common';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { CollaboratorRankModal } from '../../../types/models/collaboratorRanks';
import AddEditCollaboratorRank from './addEditCollaboratorRanks';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";
import { Action, Permissions } from "../../../common/config";


const CollaboratorRank = () => {
    const router = useRouter();
    const firstPage = 1;
    const limit = 10;
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: limit,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Value: { value: null, matchMode: FilterMatchMode.EQUALS },
            Level: { value: null, matchMode: FilterMatchMode.EQUALS },
        }
    }
    const [dialogAddOrEdit, setDialogAddOrEdit] = useState(false);
    const [toggleAction, setToggleAction] = useState("");
    const [isShowClearFilter, setIsShowClearFilter] = useState(false);

    const toggleDialog = (dialogType: string) => {
        switch (dialogType) {
            case "ADD_EDIT":
                setDialogAddOrEdit(!dialogAddOrEdit);
                break;
            default:
                break;
        }

        if (dialogAddOrEdit) {
            // Close
            setToggleAction("");
            setSelectedId(null);
        } else {
            // Open
            setToggleAction(dialogType);
        }
    };

    const dataTableRef = useRef(null);

    const [collaboratorRanks, setCollaboratorRanks] = useState<CollaboratorRank[]>([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedId, setSelectedId] = useState<number | null>();
    const toast = useRef<Toast>(null);

    const retrieveCollaboratorRank = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        CollaboratorRankService.get(currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                setCollaboratorRanks(response.data);
                setLoading(false)
                setTotalRecords(response.total ?? 0)
            })
            .catch((e) => {
                switch (e.response.data.statusCode) {
                    case 401:
                        router.push('/auth/login');
                        break;
                    case 403:
                        toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Bạn không có quyền thực hiện thao tác này', life: 3000 });
                        break;
                    default:
                        throw e;

                }

            });
    };
    const reloadPage = () => {
        retrieveCollaboratorRank();
    };
    useEffect(() => {
        retrieveCollaboratorRank();
    }, [lazyState]);

    const comTemplate = (rowData: CollaboratorRank) => {
        return rowData.IsCom ? "Có" : "Không"
    }
    const onFilter = (event: any) => {
        event['first'] = 0;
        setlazyState(event);
        const lazyStateFilters = JSON.stringify(event.filters);
        const lazyStateDefaultFilters = JSON.stringify(lazyStateDefault.filters);
        if (lazyStateFilters === lazyStateDefaultFilters) {
            setIsShowClearFilter(false)
        } else {
            setIsShowClearFilter(true)
        }
    }
    const onPage = (event: any) => {
        console.log(event)
        setlazyState(event);
    };

    const bodyFomatNumber = (rowData: CollaboratorRank) => {
        return rowData.Value ? formatNumberWithThousandSeparator(rowData.Value) : "";
    }

    // confirm 
    const reject = () => {
    };
    const confirm = (Id: number) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn xóa?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Đồng ý',
            rejectLabel: 'Hủy',
            accept() {
                CollaboratorRankService.delete(Id)
                    .then((response: DefaultResponse) => {
                        if (!response.status) {
                            toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
                        } else {
                            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã xóa thành công', life: 3000 });
                            reloadPage();
                        }
                    })
                    .catch((e) => {
                        switch (e.response.data.statusCode) {
                            case 401:
                                router.push('/auth/login');
                                break;
                            case 403:
                                toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Bạn không có quyền thực hiện thao tác này', life: 3000 });
                                break;
                            default:
                                throw e;

                        }
                    });
            },
            reject
        });
    };

    // add and edit
    const renderAction = (rowData: CollaboratorRank) => {
        return <div className='flex justify-content-center flex-wrap'>
            {
                authorizeAccountControllerAction(Permissions.CollaboratorRank, Action.Update) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowAddOrEdit(rowData.Id)} />
            }
            {
                authorizeAccountControllerAction(Permissions.CollaboratorRank, Action.Delete) &&
                <Button style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => confirm(rowData.Id)} />
            }
        </div>
    }
    const handleShowAddOrEdit = (Id: number | null) => {
        setSelectedId(Id);
        toggleDialog("ADD_EDIT")
    };
    const handleSave = (data: any) => {
        setCollaboratorRanks(data);
    }

    const exportExcel = () => {
        setLoading(true);
        var filterProcess = processFilter(lazyState);
        CollaboratorRankService.get(firstPage, Number.MAX_SAFE_INTEGER, filterProcess)
            .then((response: DefaultResponse) => {
                setLoading(false);
                exportExcelFromGrid(dataTableRef, response.data)
            })
            .catch((e) => {
                switch (e.response.data.statusCode) {
                    case 401:
                        router.push('/auth/login');
                        break;
                    case 403:
                        toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Bạn không có quyền thực hiện thao tác này', life: 3000 });
                        break;
                    default:
                        throw e;

                }

            });
    }
    const clearFilter = () => {
        setlazyState(lazyStateDefault);
        setIsShowClearFilter(false);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                {
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} /> : <div></div>
                }
                <div>
                    {
                        authorizeAccountControllerAction(Permissions.CollaboratorRank, Action.Add) &&
                        <Button label="Thêm mới" icon="pi pi-plus" severity="info" className="ml-auto mr-2" onClick={() => handleShowAddOrEdit(null)} />
                    }

                    <Button loading={loading} label="Xuất excel" icon="pi pi-upload" severity="success" onClick={() => exportExcel()} />
                </div>
            </div>
        );
    }
    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Danh mục chức danh</h3>
                    <DataTable
                        value={collaboratorRanks}
                        ref={dataTableRef}
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[10, 25, 50]}
                        currentPageReportTemplate="{first} - {last} of {totalRecords} items"
                        lazy
                        totalRecords={totalRecords}
                        rows={lazyState.rows}
                        first={lazyState.first}
                        onFilter={onFilter}
                        onPage={onPage}
                        className="p-datatable-gridlines"
                        dataKey="Id"
                        filterDisplay="row"
                        filters={lazyState.filters}
                        loading={loading}
                        header={renderHeader()}
                    >
                        <Column
                            header="Thao tác"
                            exportable={false}
                            body={renderAction}
                            style={{ width: '100px' }}
                        ></Column>
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Name"
                            header="Tên chức danh"
                            filter
                            style={{ minWidth: '260px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Value"
                            body={bodyFomatNumber}
                            header="Hoa hồng trực tiếp"
                            filter
                            style={{ minWidth: '210px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Equals', value: FilterMatchMode.EQUALS },
                            ]}
                            field="Level"
                            header="Cấp bậc"
                            filter
                            style={{ minWidth: '210px' }}
                        />
                        <Column field="IsCom" body={comTemplate}
                            header="Tính hoa hồng"
                            style={{ minWidth: '150px' }}
                        />
                    </DataTable>
                </div>
            </div>
            <AddEditCollaboratorRank
                visible={dialogAddOrEdit}
                toggleDialog={() => toggleDialog("ADD_EDIT")}
                lazyState={lazyState}
                selectedId={selectedId ?? null}
                toggleAction={toggleAction}
                onSave={handleSave}
            />

        </div>
    );
};

export default CollaboratorRank;

