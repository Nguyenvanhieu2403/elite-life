'use client';
import { useRouter } from "next/navigation";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressBar } from 'primereact/progressbar';
import { Slider } from 'primereact/slider';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import UserActivitiesService from '../../../service/UserActivitiesService';
import { User } from '../../../types/types';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import moment from "moment";
import { Dialog } from 'primereact/dialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, formatDateHour, isJsonString, processFilter } from '../../../common/common';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { UserModal } from '../../../types/models/user';
import { InputValue } from '../../../types/models/dropdownInput';
import { Password } from 'primereact/password';
import { Action, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";

const UserActivities = () => {
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
            ApplicationType: { value: null, matchMode: FilterMatchMode.EQUALS },
            "User.UserName": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "User.Email": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "User.Mobile": { value: null, matchMode: FilterMatchMode.CONTAINS },
            Function: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Action: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Description: { value: null, matchMode: FilterMatchMode.CONTAINS },
            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const dataTableRef = useRef(null);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);

    // dialog add and edit
    const [isShowClearFilter, setIsShowClearFilter] = useState(false);

    const toast = useRef<Toast>(null);
    const clearFilter1 = () => {
        setlazyState(lazyStateDefault);
        setIsShowClearFilter(false);
    };

    const retrieveUser = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        UserActivitiesService.get(currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                setUsers(response.data);
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
        retrieveUser();
    };
    useEffect(() => {
        retrieveUser();
    }, [lazyState]);


    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => {
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };

    const dateBodyTemplate = (rowData: User) => {
        return rowData.CreatedAt ? formatDateHour(rowData.CreatedAt) : "";
    };

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

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                {
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter1} /> : <div></div>
                }
                <div >
                </div>
            </div>
        );
    };
    const handleStatusChange = (newStatusValue: string | null) => {
        setlazyState((prevLazyState) => ({
            ...prevLazyState,
            filters: {
                ...prevLazyState.filters,
                ApplicationType: {
                    ...prevLazyState.filters.ApplicationType,
                    value: newStatusValue,
                },
            },
        }));
    };
    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Lịch sử hoạt động</h3>
                    <div className='flex gap-2 align-items-end flex-wrap mb-2'>
                        {/* <div className="field">
                            <Button label="Tất cả" severity={lazyState.filters.ApplicationType.value == null ? "success" : "secondary"} className="w-9rem"
                                onClick={() => handleStatusChange(null)}
                            />
                        </div>
                        <div className="field">
                            <Button label="Quản trị" severity={lazyState.filters.ApplicationType.value == "User" ? "success" : "secondary"} className="w-9rem"
                                onClick={() => handleStatusChange("User")}
                            />
                        </div>
                        <div className="field">
                            <Button label="NVKD" severity={lazyState.filters.ApplicationType.value == "Sale" ? "success" : "secondary"} className="w-9rem"
                                onClick={() => handleStatusChange("Sale")}

                            />
                        </div>
                        <div className="field">
                            <Button label="Đối ngoại" severity={lazyState.filters.ApplicationType.value == "ForeignAffairs" ? "success" : "secondary"} className="w-9rem"
                                onClick={() => handleStatusChange("ForeignAffairs")}
                            />
                        </div> */}
                    </div>
                    <DataTable
                        value={users}
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
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="User.UserName"
                            header="Tên đăng nhập"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="User.Email"
                            header="Email"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="User.Mobile"
                            header="SDT"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Function"
                            header="Chức năng"
                            filter
                            style={{ minWidth: '180px' }}

                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Action"
                            header="Hành động"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Description"
                            header="Chi tiết"
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
                    </DataTable>
                </div>

            </div>
        </div>
    );
};

export default UserActivities;
