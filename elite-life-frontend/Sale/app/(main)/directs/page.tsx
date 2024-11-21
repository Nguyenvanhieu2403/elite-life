'use client';
import { useRouter } from "next/navigation";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, processFilter } from '../../../common/common';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { Directs } from '../../../types/models/directs';
import DirectsService from '../../../service/DirectsService';
import { Calendar } from 'primereact/calendar';
import moment from 'moment';

const Directs = () => {
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
            Email: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Mobile: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BeginDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
            UserName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        }
    }

    const dataTableRef = useRef(null);
    const [directs, setDirects] = useState<Directs[]>([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);
    const toast = useRef<Toast>(null);
    //search
    const [searchFromDate, setSearchFromDate] = useState<string | Date | Date[] | null>(null);
    const [searchToDate, setSearchToDate] = useState<string | Date | Date[] | null>(null);
    const [searchAction, setSearchAction] = useState(false);
    const [isShowClearFilter, setIsShowClearFilter] = useState(false);

    const clearFilter1 = () => {
        setlazyState(lazyStateDefault);
        setIsShowClearFilter(false);
        setSearchFromDate(null);
        setSearchToDate(null);
    };
    const dateBodyTemplate = (rowData: Directs) => {
        return rowData.BeginDate ? formatDate(rowData.BeginDate) : "";
    };

    const retrieveSystemMember = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        var searchFromDateFormat = searchFromDate ? moment(searchFromDate.toString()).format('DD/MM/YYYY') : ""
        var searchToDateFormat = searchToDate ? moment(searchToDate.toString()).format('DD/MM/YYYY') : ""

        DirectsService.get(currentPage, lazyState.rows, filterProcess, searchFromDateFormat, searchToDateFormat)
            .then((response: DefaultResponse) => {

                setDirects(response.data);
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
    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => {
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };

    useEffect(() => {
        retrieveSystemMember();
    }, [lazyState, searchAction]);

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

    const exportExcel = () => {
        var filterProcess = processFilter(lazyState);
        var searchFromDateFormat = searchFromDate ? moment(searchFromDate.toString()).format('DD/MM/YYYY') : ""
        var searchToDateFormat = searchToDate ? moment(searchToDate.toString()).format('DD/MM/YYYY') : ""

        DirectsService.get(firstPage, Number.MAX_SAFE_INTEGER, filterProcess, searchFromDateFormat, searchToDateFormat)
            .then((response: DefaultResponse) => {
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
    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                {
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter1} /> : <div></div>
                }
                <Button label="Xuất excel" icon="pi pi-upload" severity="success" onClick={() => exportExcel()} />
            </div>
        );
    };


    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Thành viên trực tiếp</h3>

                    <div className='flex gap-5 align-items-end flex-wrap mb-2'>
                        <div className="field">
                            <label htmlFor="Name" className="font-bold block mb-2" >Từ ngày</label>
                            <Calendar value={searchFromDate} onChange={(e) => setSearchFromDate(e.value ?? null)} dateFormat="dd/mm/yy" showIcon />

                        </div>
                        <div className="field">
                            <label htmlFor="Name" className="font-bold block mb-2" >Đến ngày</label>
                            <Calendar value={searchToDate} onChange={(e) => setSearchToDate(e.value ?? null)} dateFormat="dd/mm/yy" showIcon />
                        </div>
                        <div className="field">
                            <Button label="Tìm kiếm" icon="pi pi-search" severity="info" onClick={() => { setSearchAction(!searchAction), setIsShowClearFilter(true) }} />
                        </div>
                    </div>

                    <DataTable
                        value={directs}
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
                        header={renderHeader1()}
                    >
                        <Column
                            exportable={false}
                            header="STT"
                            headerStyle={{ width: '3rem' }}
                            body={(data, options) => options.rowIndex + 1}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Name"
                            header="Họ và tên"
                            filter
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="UserName"
                            header="Tên đăng nhập"
                            filter
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Email"
                            header="Email"
                            filter
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Mobile"
                            header="SĐT"
                            filter
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Date is', value: FilterMatchMode.DATE_IS },
                            ]}
                            field="BeginDate"
                            header="Ngày tham gia"
                            body={dateBodyTemplate}
                            filterElement={dateFilterTemplate}
                            filter
                            dataType="date"
                            style={{ minWidth: '180px' }}
                        />
                    </DataTable>
                </div>

            </div >
        </div >
    );
};

export default Directs;
