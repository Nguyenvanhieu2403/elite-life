'use client';

import { useRouter } from "next/navigation";
import { Messages } from "primereact/messages";
import React, { useEffect, useRef, useState } from "react";
import { LazyStateObject } from "../../../types/models/filter";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { WithdrawRequest } from '../../../types/models/withdrawal-requests';
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { authorizeAccountControllerAction } from "../../../middleware/authorize";
import { Calendar } from "primereact/calendar";
import { formatDate, processFilter } from "../../../common/common";
import WithdrawRequestService from "../../../service/WithdrawRequestService";
import { DefaultResponse } from "../../../types/models/defaultResponse";
import { catchAxiosError } from "../../../common/commonTSX";
import { Dialog } from "primereact/dialog";
import { DialogStyle } from "../../../common/config";

const WithdrawRequestPage = () => {
    const router = useRouter();
    const message = useRef<Messages>(null);
    const firstPage = 1;
    const limit = 10;
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: limit,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            UserName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankOwner: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankBranchName: { value: null, matchMode: FilterMatchMode.CONTAINS },

            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const onFilter = (event: any) => {
        event['first'] = 0;
        setlazyState(event);
    }
    const onPage = (event: any) => {
        setlazyState(event);
    };
    const [showDialog, setShowDialog] = useState(false)
    const [loading, setLoading] = useState(true);
    const renderAction = (rowData: WithdrawRequest) => {
        return <div className='flex justify-content-center flex-wrap'>
            <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDialog(rowData.Id)} />

        </div>
    }

    const handleShowDialog = (Id: number) => {
        if (Id != null) {
            WithdrawRequestService.getUpdate(Id)
                .then((response) => {
                    if (response.status) {
                        console.log(response)
                        setShowDialog(true)
                    }
                })
                .catch((e) => {
                    catchAxiosError({
                        e, router, toast
                    })
                });
        };
    };

    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => {
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };

    const dateBodyTemplate = (rowData: WithdrawRequest) => {
        return rowData.CreatedAt ? formatDate(rowData.CreatedAt) : "";
    };
    const retrieveData = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        WithdrawRequestService.get(currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                setWithdrawRequests(response.data);
                setLoading(false)
                setTotalRecords(response.total ?? 0)
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });
    };
    const dataTableRef = useRef(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const toast = useRef<Toast>(null)
    const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>()
    const imageBodyTemplate = (rowData: WithdrawRequest) => {
        const avatar = rowData.Image;
        return (
            <React.Fragment>
                {avatar !== null ? (
                    <div className='w-table w-table-img'>
                        <img src={`/image${avatar}`} alt="Image" />
                    </div>
                ) : (
                    <div className='w-table w-table-img'>
                        <img src='/demo/images/avatar/defaultAvatar.png' alt="Default Image" />
                    </div>
                )}
            </React.Fragment>
        );
    };

    const hideDialog = () => {
        setShowDialog(false);
    };
    useEffect(() => {
        retrieveData();
    }, [lazyState]);
    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Quản lý yêu cầu rút tiền</h3>


                    <DataTable
                        value={withdrawRequests}
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
                        emptyMessage="No data found."
                    >
                        <Column
                            header="Thao tác"
                            exportable={false}
                            body={renderAction}
                            style={{ minWidth: '100px' }}
                        ></Column>

                        <Column
                            showFilterMenu={false}
                            field="Code"
                            header="Mã"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="Collaborator.Name"
                            header="Họ và tên"
                            filter
                            style={{ minWidth: '180px' }}
                        />

                        <Column
                            showFilterMenu={false}
                            field="Email"
                            header="Email"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="BankNumber"
                            header="Số tài khoản"
                            filter
                            style={{ minWidth: '180px' }}
                        />

                        <Column
                            showFilterMenu={false}
                            field="BankOwner"
                            header="Chủ tài khoản"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="BankNumber"
                            header="Ngân hàng"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="BankBranchName"
                            header="Chi nhánh"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="WithdrawalAmount"
                            header="Số tiền"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="Note"
                            header="Lý do"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="Status"
                            header="Trạng thái"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="NoteRejection"
                            header="Lý do từ chối"
                            filter
                            style={{ minWidth: '180px' }}
                        />

                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Date is', value: FilterMatchMode.DATE_IS },
                            ]}
                            field="CreatedAt"
                            header="Ngày tạo"
                            body={dateBodyTemplate}
                            filterElement={dateFilterTemplate}
                            filter
                            dataType="date"
                            style={{ minWidth: '240px' }}
                        />
                        <Column
                            field="Image"
                            header="Ảnh chứng từ chuyển tiền"
                            style={{ minWidth: '100px' }}
                            body={imageBodyTemplate}
                            exportable={false}
                        />
                    </DataTable>
                </div>

            </div >
            <Dialog visible={showDialog}
                style={{ width: DialogStyle.width.small }}
                header={"Phê duyệt yêu cầu rút tiền"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={hideDialog}>
                123123213
            </Dialog>
        </div >
    );
}

export default WithdrawRequestPage