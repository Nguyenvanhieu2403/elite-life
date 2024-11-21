/* eslint-disable react/jsx-no-undef */
'use client';
import { DataTable, DataTableExpandedRows, DataTableValueArray } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import React, { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataResponse } from '../../../types/response-data';
import moment from 'moment';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LazyStateObject } from '../../../types/models/filter';
import { formatDate, formatNumberWithThousandSeparator, processFilter, WalletTypeEnums } from '../../../common/common';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { OrderDetailData, OrderDetailItem } from '../../../types/models/orders';
import { Checkbox } from 'primereact/checkbox';
import { useRouter } from 'next/navigation';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";
import { Action, DialogStyle, Permissions } from "../../../common/config";
import OrderService from '../../../service/OrderService';
import { Dialog } from 'primereact/dialog';
import { SplitButton } from 'primereact/splitbutton';
import { Calendar } from 'primereact/calendar';
import { catchAxiosError } from '../../../common/commonTSX';
interface SumProp {
}
const DetailPage = ({ }: SumProp) => {
    const router = useRouter();
    const rows = 10
    let initialData = {
        status: true,
        data: [],
        total: 0
    }
    const [dialogImport, setDialogImport] = useState(false);
    const [toggleAction, setToggleAction] = useState("");
    const [toggle, setToggle] = useState(false);
    const toggleDialog = (dialogType: string) => {
        switch (dialogType) {
            case "IMPORT":
                setDialogImport(!dialogImport);
                break;
            default:
                break;
        }
        if (dialogImport) {
            // Close
            setToggleAction("");
        } else {
            // Open
            setToggleAction(dialogType);
        }
    };

    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: rows,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            'Collaborator.UserName': { value: null, matchMode: FilterMatchMode.CONTAINS },
            'Collaborator.Name': { value: null, matchMode: FilterMatchMode.CONTAINS },
            DeliveryDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
            NameSale: { value: null, matchMode: FilterMatchMode.CONTAINS },
            MobileSale: { value: null, matchMode: FilterMatchMode.CONTAINS },
            AddressSale: { value: null, matchMode: FilterMatchMode.CONTAINS }
        }
    }
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | DataTableValueArray | undefined>(undefined);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [listData, setListData] = useState<DataResponse>(initialData);
    const [loading1, setLoading1] = useState(true);
    const dataTableRef = useRef(null);
    const onFilter = (event: any) => {
        setlazyState(event);
    }
    const onPage = (event: any) => {
        setlazyState(event);
    };



    const rowExpansionTemplate = (data: OrderDetailData) => {
        return (
            <div className="p-3">
                <DataTable value={data.OrderDetails}>
                    <Column field="Collaborator.UserName" header="Mã NVKD" ></Column>
                    <Column field="Collaborator.Name" header="Họ tên" ></Column>
                    <Column field="Type" header="Hoa hồng"
                        body={(rowData: OrderDetailItem) => {
                            return WalletTypeEnums[rowData.WalletTypeEnums as keyof typeof WalletTypeEnums];
                        }}
                    ></Column>

                    <Column field="Value" header="Số tiền"
                        body={(rowData) => {
                            return rowData.Value ? formatNumberWithThousandSeparator(rowData.Value) : "";
                        }}
                    ></Column>
                </DataTable>
            </div>
        );
    };

    const getList = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = processFilter(lazyState);
        OrderService.get(currentPage, lazyState.rows, filterProcess).then((data) => {
            setListData(data);
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        });
    }
    useEffect(() => {
        setLoading1(false);



        var currentPeriod = 0;
        let currentDate = moment();
        var ninthOfThisMonth = moment().date(9);
        var twentyThirdOfThisMonth = moment().date(23);
        let nextMonth = new Date();
        if (currentDate.isAfter(ninthOfThisMonth) && currentDate.isBefore(twentyThirdOfThisMonth)) {
            currentPeriod = 2
        } else {
            currentPeriod = 1
            const today = new Date();
            nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        }
        getList()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyState, toggle]);
    const toast = useRef<Toast>(null);

    const [dataExpansion, setDataExpansion] = useState();
    const [visibleDialog1, setVisibleDialog1] = useState(false);
    const [visibleDialog2, setVisibleDialog2] = useState(false);
    const [visibleDialog3, setVisibleDialog3] = useState(false);
    const [visibleDialog4, setVisibleDialog4] = useState(false);
    const [DeliveryDate, setDeliveryDate] = useState<string | Date | Date[] | null>(null);

    const toggleSetDeliveryDate = () => {
        setVisibleDialog4(true);
    }
    const items = (rowData: any) => {

        const commonItems = [
            // {
            //     label: 'Chi tiết nhận hoa hồng',
            //     icon: 'pi pi-book',
            //     command: () => {
            //         setVisibleDialog1(true)
            //         setDataExpansion(rowData.OrderDetails)
            //     },
            // },
            {
                label: 'Chi tiết hoá đơn',
                icon: 'pi pi-briefcase',
                command: () => {
                    setDataExpansion(rowData.OrderPays)
                    setVisibleDialog2(true)
                },
            },
            {
                label: 'Chi tiết chi hoa hồng',
                icon: 'pi pi-book',
                command: () => {
                    OrderService.getCommissionPayment(rowData.Id).then((response) => {
                        setDataExpansion(response.data)
                        setVisibleDialog3(true)
                    })
                },
            },

        ];

        return commonItems;
    };
    const [selectedId, setSelectedId] = useState<number | null>()
    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => {
            console.log(e)
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };
    return (
        <>
            <ConfirmDialog />
            <Toast ref={toast} />

            {/* Dialog 1 */}


            {/* Dialog 2 */}
            <Dialog header="Chi tiết hoá đơn"
                style={{ width: DialogStyle.width.small }}
                draggable={false}
                visible={visibleDialog2} onHide={() => {
                    setDataExpansion(undefined)
                    setVisibleDialog2(false)
                }
                }>
                <DataTable value={dataExpansion} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} >

                    <Column
                        header="Stt"
                        body={(rowData, options) => {
                            return options.rowIndex + 1;
                        }
                        }
                    />
                    <Column
                        header="Ngày thanh toán"
                        body={
                            (rowData) => {
                                return rowData.PayDate ? formatDate(rowData.PayDate) : "";

                            }
                        }
                    />
                    <Column
                        header="Số tiền"
                        body={
                            (rowData) => {
                                return formatNumberWithThousandSeparator(rowData.Value)
                            }
                        }
                    />
                </DataTable>
            </Dialog>

            {/* Dialog 3 */}
            <Dialog header="Chi tiết chi hoa hồng"
                style={{ width: DialogStyle.width.medium }}
                draggable={false}
                visible={visibleDialog3} onHide={() => {
                    setDataExpansion(undefined)
                    setVisibleDialog3(false)
                }
                }>
                <DataTable value={dataExpansion} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} >

                    <Column
                        header="Stt"
                        body={(rowData, options) => {
                            return options.rowIndex + 1;
                        }
                        }
                    />
                    <Column
                        header="Ngày thanh toán"
                        body={
                            (rowData) => {
                                return rowData.CreatedAt ? formatDate(rowData.CreatedAt) : "";
                            }
                        }
                    />
                    <Column
                        header="Số tiền"
                        body={
                            (rowData) => {
                                return formatNumberWithThousandSeparator(rowData.Value)
                            }
                        }
                    />
                    <Column
                        field="Note"
                        header="Nội dung"
                    />
                    <Column
                        field="Wallet.Collaborator.Name"
                        header="Người nhận hoa hồng"
                    />
                    <Column
                        field="Wallet.Collaborator.UserName"
                        header="Mã người nhận hoa hồng"
                    />
                </DataTable>
            </Dialog>

            {/* Dialog 4 */}
            <Dialog header="Chọn ngày gửi đơn"
                style={{ width: DialogStyle.width.min }}
                draggable={false}
                visible={visibleDialog4} onHide={() => {
                    setVisibleDialog4(false)
                    setDeliveryDate(null)
                    setSelectedId(null)
                }
                }>
                <div className="field">
                    <label htmlFor="DeliveryDate" className="font-bold block mb-2" > Ngày gửi đơn <span className="text-red-600">*</span></label>
                    <Calendar
                        id='DeliveryDate'
                        value={new Date(DeliveryDate?.toString() || "")}
                        onChange={(e) => {
                            setDeliveryDate(e.value ?? null);
                        }
                        }
                        className='w-full'
                        showIcon
                        dateFormat="dd/mm/yy"

                    />
                </div>
                <div className="field  flex justify-content-between button-50">
                    <Button className='btn-pri' label="Lưu" onClick={() => {
                        if (!selectedId || DeliveryDate == null) {
                            return;
                        }
                        const date = DeliveryDate ? moment(DeliveryDate.toString()).format('DD/MM/YYYY') : ""

                        OrderService.setDeliveryDate(selectedId, date).then((response: DefaultResponse) => {
                            if (!response.status) {
                                toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
                            } else {
                                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã cập nhật thành công', life: 3000 });
                                getList()
                                setVisibleDialog4(false)
                                setDeliveryDate(null)
                            }
                        }).catch((e) => {
                            catchAxiosError({
                                e, router, toast
                            })
                        })
                    }} />
                    <Button className='btn-sec' label="Bỏ qua" onClick={() => {
                        setVisibleDialog4(false)
                        setDeliveryDate(null)
                    }} />
                </div>
            </Dialog>
            <DataTable
                value={listData.data}
                lazy
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
                currentPageReportTemplate="{first} - {last} of {totalRecords} items"
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                ref={dataTableRef}
                rowExpansionTemplate={rowExpansionTemplate}
                totalRecords={listData.total}
                rows={lazyState.rows}
                first={lazyState.first}
                onFilter={onFilter}
                onPage={onPage}
                className="p-datatable-gridlines"
                dataKey="Id"
                filterDisplay="row"
                filters={lazyState.filters}
                loading={loading1}
                emptyMessage="Không có bản ghi nào."
            >
                <Column
                    header="Thao tác"
                    body={
                        (rowData) => {
                            return (

                                <>
                                    <SplitButton icon="pi pi-bars" model={items(rowData)} severity="success" dropdownIcon="pi pi-bars" aria-hidden="true" hidden={false} />


                                </>
                            )
                        }
                    }

                    style={{ minWidth: '80px' }} />

                <Column
                    header="Ngày gửi đơn" filter
                    showFilterMenu={false}
                    filterElement={dateFilterTemplate}
                    style={{ minWidth: '140px' }}
                    filterMatchModeOptions={[
                        { label: 'Date is', value: FilterMatchMode.DATE_IS },
                    ]}
                    field='DeliveryDate'
                    dataType="date"
                    body={(rowData) => {
                        return rowData.DeliveryDate ? formatDate(rowData.DeliveryDate) : <>

                            <p className='sendOrder' onClick={() => {
                                setVisibleDialog4(true);
                                setSelectedId(rowData.Id)
                            }}>Chọn ngày gửi đơn</p>
                        </>
                    }}

                />
                <Column
                    header="Tên người nhận hàng"
                    field="NameSale" style={{ minWidth: '140px' }}
                    filter
                    showFilterMenu={false}
                />
                <Column
                    header="Địa chỉ khách hàng"
                    field="AddressSale" style={{ minWidth: '140px' }}
                    filter
                    showFilterMenu={false}
                />
                <Column
                    header="Số điện thoại"
                    field="MobileSale" style={{ minWidth: '140px' }}
                    filter
                    showFilterMenu={false}
                />
                <Column field="Collaborator.UserName"
                    header="Mã khách hàng" filter
                    showFilterMenu={false}
                    style={{ minWidth: '150px' }}

                />
                <Column field="Collaborator.Name"
                    header="Tên khách hàng" filter
                    showFilterMenu={false}
                    style={{ minWidth: '150px' }}

                />
                <Column
                    header="Số chưa thanh toán"
                    body={(rowData) => {
                        return rowData.Pending ? formatNumberWithThousandSeparator(rowData.Pending) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Số đã thanh toán"
                    body={(rowData) => {
                        return rowData.Payed ? formatNumberWithThousandSeparator(rowData.Payed) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức hưởng tối đa KH"
                    body={(rowData) => {
                        return rowData.CommissionCustomerMax ? formatNumberWithThousandSeparator(rowData.CommissionCustomerMax) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức đã hưởng khách hàng"
                    body={(rowData) => {
                        return rowData.CommissionCustomer ? formatNumberWithThousandSeparator(rowData.CommissionCustomer) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức đã hưởng đồng chia"
                    body={(rowData) => {
                        return rowData.CommissionCustomerShare ? formatNumberWithThousandSeparator(rowData.CommissionCustomerShare) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức đã hưởng tri ân"
                    body={(rowData) => {
                        return rowData.CommissionCustomerGratitude ? formatNumberWithThousandSeparator(rowData.CommissionCustomerGratitude) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức hưởng tối đa Sale"
                    body={(rowData) => {
                        return rowData.CommissionSaleMax ? formatNumberWithThousandSeparator(rowData.CommissionSaleMax) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức đã hưởng Sale"
                    body={(rowData) => {
                        return rowData.CommissionSale ? formatNumberWithThousandSeparator(rowData.CommissionSale) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức hưởng hoa hồng giới thiệu"
                    body={(rowData) => {
                        return rowData.CommissionSale1 ? formatNumberWithThousandSeparator(rowData.CommissionSale1) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức hưởng thưởng lãnh đạo"
                    body={(rowData) => {
                        return rowData.CommissionSale2 ? formatNumberWithThousandSeparator(rowData.CommissionSale2) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />
                <Column
                    header="Mức hưởng từ 900% - 1000%"
                    body={(rowData) => {
                        return rowData.CommissionSale3 ? formatNumberWithThousandSeparator(rowData.CommissionSale3) : "";
                    }}
                    style={{ minWidth: '150px' }}
                />

            </DataTable>
        </>
    );
};
export default DetailPage;