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
import { formatDate, formatNumberWithThousandSeparator, processFilter } from "../../../common/common";
import WithdrawRequestService from "../../../service/WithdrawRequestService";
import { DefaultResponse } from "../../../types/models/defaultResponse";
import { catchAxiosError } from "../../../common/commonTSX";
import { Dialog } from "primereact/dialog";
import { DialogStyle } from "../../../common/config";
import { classNames } from "primereact/utils";
import ContractService from "../../../service/ContractService";
import moment from "moment";

const WithdrawRequestPage = () => {
    const router = useRouter();
    const message = useRef<Messages>(null);
    const firstPage = 1;
    const limit = 10;
    const [pdf, setPdf] = useState<any>()
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: limit,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            UserName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Identity: { value: null, matchMode: FilterMatchMode.CONTAINS },
            IdentityPlace: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Address: { value: null, matchMode: FilterMatchMode.CONTAINS },
            IdentityDate: { value: null, matchMode: FilterMatchMode.DATE_IS },

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
    const renderAction = (rowData: any) => {
        return rowData.IsSign == true ? <div className='flex justify-content-center flex-wrap'>
            <Button style={{ width: "24px", borderRadius: "50%" }} title="Xem chi tiết" severity="success" icon="pi pi-file-pdf" onClick={() => handleShowDialog(rowData.Id, rowData.ImageSign)} />
        </div>

            : ""
    }
    const [currentImage, setCurrentImage] = useState<File>();

    const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setCurrentImage(selectedFiles?.[0]);
        setPreviewImage(URL.createObjectURL(selectedFiles?.[0]));
    };

    const handleShowDialog = (Id: number, ImageSign: string) => {
        if (Id != null) {
            setSelectedId(Id)
            ContractService.getById(Id)
                .then((response) => {
                    if (response.status) {
                        console.log(response)
                        setShowDialog(true)
                        response.data.ImageSign = ImageSign
                        console.log(response)
                        setPdf(response.data)
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
        return rowData.CreatedAt ? formatDate(rowData.CreatedAt) : "";
    };
    const retrieveData = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        ContractService.get(currentPage, lazyState.rows, filterProcess)
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
    const imageBodyTemplate = (rowData: any) => {
        const avatar = rowData.ImageSign;
        return (
            <React.Fragment>
                {avatar !== null ? (
                    <div className=''>
                        <img width={100} src={`/image${avatar}`} alt="Image" />
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
                    <h3>Quản lý hợp đồng đại lý</h3>


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
                            field="UserName"
                            header="Mã thành viên"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="Name"
                            header="Họ và tên"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            field="Address"
                            header="Địa chỉ"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Identity"
                            header="CMTND/CCCD"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Date is', value: FilterMatchMode.DATE_IS },
                            ]}
                            field="IdentityDate"
                            header="Ngày cấp"
                            body={(rowData) => {
                                return rowData.IdentityDate ? formatDate(rowData.IdentityDate) : "";
                            }}
                            filterElement={dateFilterTemplate}
                            filter
                            dataType="date"
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="IdentityPlace"
                            header="Nơi cấp"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            header="Trạng thái"
                            body={(rowData) => {
                                return rowData.IsSign == false ? "Chưa kí" : "Đã kí"
                            }}
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            header="Ảnh chữ ký"
                            style={{ minWidth: '100px' }}
                            body={imageBodyTemplate}
                            exportable={false}
                        />
                    </DataTable>
                </div>

            </div >
            <Dialog visible={showDialog}
                style={{ width: DialogStyle.width.large }}
                header={"Chi tiết hợp đồng"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={hideDialog}>
                <React.Fragment>
                    {
                        pdf && pdf.PdfPath != "" ? <React.Fragment>
                            {
                                pdf.PdfPath && <div className="contractSection" dangerouslySetInnerHTML={{ __html: pdf.PdfPath }} />
                            }
                        </React.Fragment> : ""
                    }
                </React.Fragment>
                <div className="d-flex">
                    <div className="w-49" style={{ paddingRight: 15 }}>
                        <h3>Bên B</h3>
                        <>
                            <b>       { pdf && pdf.Contract && <p> Hà Nội, ngày {moment(pdf.Contract.CreatedAt).get('D')} tháng {moment(pdf.Contract.CreatedAt).get('month') + 1} năm {moment(pdf.Contract.CreatedAt).get('year')} </p>}</b>
                            <img src={`/image/${pdf?.ImageSign}`} alt="signature" style={{ maxWidth: "100%" }} />
                            <p>  { pdf && pdf.Contract && pdf.Contract.Name}</p>
                        </>
                    </div>
                    <div className="w-49" style={{ paddingLeft: 15 }}>
                        <h3>Bên A</h3>
                        <p>CÔNG TY TNHH NGHIÊN CỨU VÀ SẢN XUẤT SINH HỌC HANA, THỰC THUỘC CTY CP TẬP ĐOÀN ELITE LIFE - JAPAN.</p>
                        <p>Mã số doanh nghiệp: 0901155104, cấp ngày 15 tháng 02 năm 2024.</p>
                        <p>Đại diện: Ông LƯƠNG VĂN NGHỊ.</p>
                        <p>Chức vụ: Tổng giám đốc</p>
                        <p>Điện thoại: 0909679955</p>
                    </div>


                </div>
            </Dialog>

        </div >
    );
}

export default WithdrawRequestPage