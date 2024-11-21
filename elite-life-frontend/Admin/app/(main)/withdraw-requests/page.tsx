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
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { authorizeAccountControllerAction } from "../../../middleware/authorize";
import { Calendar } from "primereact/calendar";
import { formatDate, formatDateHour, formatNumberWithThousandSeparator, processFilter } from "../../../common/common";
import WithdrawRequestService from "../../../service/WithdrawRequestService";
import { DefaultResponse } from "../../../types/models/defaultResponse";
import { catchAxiosError } from "../../../common/commonTSX";
import { Dialog } from "primereact/dialog";
import { DialogStyle } from "../../../common/config";
import { classNames } from "primereact/utils";

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
            Note: { value: null, matchMode: FilterMatchMode.CONTAINS },
            NoteRejection: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Status: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankBranchName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            WithdrawalAmount: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Tax: { value: null, matchMode: FilterMatchMode.EQUALS },
            "Collaborator.UserName": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Collaborator.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Bank.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },

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
    const [showDialogReject, setShowDialogReject] = useState(false)
    const [loading, setLoading] = useState(true);
    const renderAction = (rowData: WithdrawRequest) => {
        return rowData.Status == "Processing" ? <div className='flex justify-content-center flex-wrap'>
            <Button style={{ width: "110px" }} severity="success" label="Duyệt" icon="pi pi-check" onClick={() => handleShowDialog(rowData.Id)} />
            <Button style={{ width: "110px" }} severity="danger" label="Từ chối" icon="pi pi-times" onClick={() => handleShowDialogReject(rowData.Id)} />

        </div>

            : ""
    }
    const [currentImage, setCurrentImage] = useState<File>();

    const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setCurrentImage(selectedFiles?.[0]);
        setPreviewImage(URL.createObjectURL(selectedFiles?.[0]));
    };
    const handleShowDialogReject = (Id: number) => {
        setSelectedId(Id);
        setShowDialogReject(true);
    }
    const handleShowDialog = (Id: number) => {
        if (Id != null) {
            setSelectedId(Id)
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

    const confirmApprove = () => {
        if (!selectedId) return;
        const formData = {
            Note: Note,
            Image: currentImage
        }
        WithdrawRequestService.approve(selectedId, formData)
            .then((response: DefaultResponse) => {
                if (!response.status) {
                    toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message.Status, life: 3000 });
                } else {
                    toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã phê duyệt thành công', life: 3000 });
                    hideDialog()
                    retrieveData();
                }
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });
    };
    const [NoteRejection, setNoteRejection] = useState<string | undefined>()
    const [Note, setNote] = useState<string | null>()
    const confirmReject = (Id: number | undefined) => {
        if (!Id) return;

        WithdrawRequestService.reject(Id, NoteRejection)
            .then((response: DefaultResponse) => {
                if (!response.status) {
                    toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message.Status.toString(), life: 3000 });
                } else {
                    toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã từ chối thành công', life: 3000 });
                    retrieveData()
                    hideDialog()
                }
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });


    };
    const dateBodyTemplate = (rowData: WithdrawRequest) => {
        return rowData.CreatedAt ? formatDateHour(rowData.CreatedAt) : "";
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
                    ""
                )}
            </React.Fragment>
        );
    };
    const [previewImage, setPreviewImage] = useState<string>("");

    const [selectedId, setSelectedId] = useState<number>()
    const hideDialog = () => {
        setSelectedId(undefined)
        setShowDialog(false);
        setShowDialogReject(false);
        setPreviewImage("")
        setCurrentImage(undefined)
        setNoteRejection(undefined)
    };
    useEffect(() => {
        retrieveData();
    }, [lazyState]);

    const [submitted, setSubmitted] = useState(false);

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
                            field="Collaborator.UserName"
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
                            field="Bank.Name"
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
                            body={(rowData: WithdrawRequest) => {
                                return formatNumberWithThousandSeparator(rowData.WithdrawalAmount)
                            }
                            }
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="Tax"
                            header="Thuế"
                            filter
                            body={(rowData: WithdrawRequest) => {
                                return formatNumberWithThousandSeparator(rowData.Tax)
                            }
                            }
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="ActualNumberReceived"
                            header="Số thực nhận"
                            filter
                            body={(rowData: WithdrawRequest) => {
                                return formatNumberWithThousandSeparator(rowData.ActualNumberReceived)
                            }
                            }
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
                            field="Image"
                            header="Ảnh chứng từ chuyển tiền"
                            style={{ minWidth: '100px' }}
                            body={imageBodyTemplate}
                            exportable={false}
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
                <div className="field">
                    <div className=" flex flex-wrap gap-3 p-fluid mb-3">
                        <label htmlFor="BankOwner" className="font-bold block mb-2" >Lưu ý</label>
                        <InputText
                            value={Note ?? ""}
                            onChange={(e) => setNote(e.target.value)}
                            required
                            autoFocus
                            className={classNames({
                                'p-invalid': submitted && !Note
                            })}
                        />
                    </div>
                    <div className="  flex-wrap gap-3 p-fluid mb-3">
                        <label htmlFor="label" className="font-bold block mb-2" >Ảnh chứng từ chuyển tiền </label>
                        {previewImage !== "" ? (
                            <div className="">
                                <label htmlFor="fileInput">
                                    <img className="w-15rem h-15rem" src={previewImage} alt="" />
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="fileInput"
                                    onChange={selectImage}
                                    style={{ display: "none" }}
                                />
                            </div>
                        ) : (
                            <div className="">
                                <label htmlFor="fileInput">
                                    <img
                                        className="w-15rem h-15rem"
                                        src={`/demo/images/avatar/defaultImage.jpg`}
                                        alt=""
                                    />
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="fileInput"
                                    onChange={selectImage}
                                    style={{ display: "none" }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex ml-auto justify-content-center gap-3">
                    <Button className='btn-pri' label="Lưu" onClick={() => confirmApprove()} />
                    <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                </div>
            </Dialog>
            <Dialog visible={showDialogReject}
                style={{ width: DialogStyle.width.min }}
                header={"Từ chối yêu cầu rút tiền"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={hideDialog}>

                <div className="field">
                    <div className=" flex flex-wrap gap-3 p-fluid mb-3">
                        <label htmlFor="BankOwner" className="font-bold block mb-2" >Lý do từ chối </label>
                        <InputText
                            value={NoteRejection ?? ""}
                            onChange={(e) => setNoteRejection(e.target.value)}
                            required
                            autoFocus
                            className={classNames({
                                'p-invalid': submitted && !NoteRejection
                            })}
                        />

                    </div>

                </div>
                <div className="flex ml-auto justify-content-center gap-3">
                    <Button className='btn-pri' label="Lưu" onClick={() => confirmReject(selectedId)} />
                    <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                </div>
                <Messages ref={message} />
            </Dialog>
        </div >
    );
}

export default WithdrawRequestPage