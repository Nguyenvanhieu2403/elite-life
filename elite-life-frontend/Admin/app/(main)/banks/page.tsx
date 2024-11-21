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
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import moment from "moment";
import { Dialog } from 'primereact/dialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, isJsonString, processFilter } from '../../../common/common';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { Image } from 'primereact/image';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { UserModal } from '../../../types/models/user';
import { InputValue, InputValueResponse } from '../../../types/models/dropdownInput';
import { Password } from 'primereact/password';
import BanksService from '../../../service/BanksService';
import { Tree } from 'primereact/tree';
import { Avatar } from 'primereact/avatar';
import { Action, DialogStyle, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { FileUpload } from 'primereact/fileupload';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";
import { BankModal, Banks } from "../../../types/models/bank";

const Bank = () => {
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
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Nation.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const dataTableRef = useRef(null);

    const [banks, setBanks] = useState<Banks[]>([]);

    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);

    // dialog add and edit
    const emptyBank: BankModal = {
        Id: null,
        Name: "",
        NationId: null,
    };

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [bank, setBank] = useState(emptyBank);

    const [nationIdOptionSelected, setNationIdOptionSelected] = useState(null);
    const [nationIdOptions, setNationIdOptions] = useState<InputValue[]>([]);

    const [isShowClearFilter, setIsShowClearFilter] = useState(false);
    const toast = useRef<Toast>(null);
    const clearFilter = () => {
        setlazyState(lazyStateDefault);
        setIsShowClearFilter(false);
    };

    const retrieveBank = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);

        BanksService.get(currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                if (response.status) {
                    setBanks(response.data);
                    setLoading(false)
                    setTotalRecords(response.total ?? 0)
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
    };
    const reloadPage = () => {
        retrieveBank();
    };
    useEffect(() => {
        retrieveBank();
    }, [lazyState]);


    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => {
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };

    const dateBodyTemplate = (rowData: Banks) => {
        return rowData.CreatedAt ? formatDate(rowData.CreatedAt) : "";
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
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} /> : <div></div>
                }
                <div >
                    {
                        authorizeAccountControllerAction(Permissions.Banks, Action.Add) &&
                        <Button label="Thêm mới" icon="pi pi-plus" severity="info" className="ml-auto mr-2"
                            onClick={() => handleShowDialog(null)}
                        />
                    }

                    <Button loading={loading} label="Xuất Excel" icon="pi pi-upload" severity="success" className="mr-2" onClick={() => exportExcel()} />
                </div>
            </div>
        );
    };

    // add and edit
    const renderAction = (rowData: Banks) => {
        return <div className='flex justify-content-center flex-wrap'>
            {
                authorizeAccountControllerAction(Permissions.Banks, Action.Update) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil"
                    onClick={() => handleShowDialog(rowData.Id)}
                />
            }
            {
                authorizeAccountControllerAction(Permissions.Banks, Action.Delete) &&
                <Button style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => confirm(rowData.Id)} />
            }
        </div>
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
                BanksService.delete(Id)
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
    const hideDialog = () => {
        setSubmitted(false);
        setShowUserDialog(false);
        setBank(emptyBank)

    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setBank((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        setBank((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const exportExcel = () => {
        setLoading(true);
        var filterProcess = processFilter(lazyState);
        BanksService.get(firstPage, Number.MAX_SAFE_INTEGER, filterProcess)
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

    const handleShowDialog = (Id: number | null) => {
        if (Id != null) {
            setIsEdit(true)
            BanksService.getUpdate(Id)
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        var nationIdOptionValues = [];
                        if (response.data.Nations && response.data.Nations.length > 0) {
                            nationIdOptionValues = response.data.Nations.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setNationIdOptions(nationIdOptionValues);
                        var curentBank = response.data.Info
                        if (curentBank) {
                            setBank(curentBank);
                            setNationIdOptionSelected(curentBank.NationId);
                        }
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
        } else {
            BanksService.getCreate()
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        var nationIdOptionValues = [];
                        if (response.data.Nations && response.data.Nations.length > 0) {
                            nationIdOptionValues = response.data.Nations.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setNationIdOptions(nationIdOptionValues);
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
            setIsEdit(false);
            setBank(emptyBank);
            setNationIdOptionSelected(null);
        }
        setShowUserDialog(true)
    };

    const handleBankAction = () => {
        message.current?.clear();
        setSubmitted(true);

        // validate
        if (!bank.Name || !bank.NationId) {
            return;
        }
        // isEdit = false : add event
        if (!isEdit) {
            BanksService.addBank(bank)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setBank(emptyBank)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã thêm mới thành công', life: 3000 });
                        setSubmitted(false)
                        reloadPage();
                        setShowUserDialog(false);
                    } else {
                        message.current?.show({
                            severity: 'error', summary: 'Thao tác không thành công', sticky: true, content: (
                                <React.Fragment>
                                    <div className="max-w-[900px]">
                                        {
                                            isJsonString(response.message) ?
                                                Object.keys(response.message).map((key, index) => (
                                                    <div className="ml-2" key={index}>
                                                        {response.message[key]}
                                                    </div>
                                                ))
                                                :
                                                <div className="ml-2">{response.message}</div>
                                        }
                                    </div>
                                </React.Fragment>
                            )
                        });
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
        } else {
            BanksService.updateBank(bank)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setBank(emptyBank)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã chỉnh sửa thành công', life: 3000 });
                        setSubmitted(false)
                        reloadPage();
                        setShowUserDialog(false);
                    } else {
                        message.current?.show({
                            severity: 'error', summary: 'Thao tác không thành công', sticky: true, content: (
                                <React.Fragment>
                                    <div className="max-w-[900px]">
                                        {
                                            isJsonString(response.message) ?
                                                Object.keys(response.message).map((key, index) => (
                                                    <div className="ml-2" key={index}>
                                                        {response.message[key]}
                                                    </div>
                                                ))
                                                :
                                                <div className="ml-2">{response.message}</div>
                                        }
                                    </div>
                                </React.Fragment>
                            )
                        });
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
        }

    };

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Danh mục ngân hàng</h3>

                    <DataTable
                        value={banks}
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
                            header="Thao tác"
                            exportable={false}
                            body={renderAction}
                            style={{ minWidth: '100px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Nation.Name"
                            header="Quốc Gia"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Name"
                            header="Tên ngân hàng"
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
                            style={{ minWidth: '180px' }}
                        />
                    </DataTable>
                </div>


                <Dialog visible={showUserDialog}
                    style={{ width: DialogStyle.width.small }}
                    header={isEdit ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng"}
                    modal
                    blockScroll
                    draggable={false}
                    className="p-fluid"
                    onHide={hideDialog}>
                    <>

                        <div >
                            <div className=" p-fluid mb-3">
                                <label htmlFor="BankOwner" className="font-bold block mb-2" >Quốc gia<span className="text-red-600">*</span></label>
                                <Dropdown
                                    virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                    filter
                                    value={nationIdOptions.find(({ code }) => code === nationIdOptionSelected)}
                                    onChange={(e) => {
                                        var nationIdOptionSelectedR: any = null;
                                        if (e.value != null) {
                                            nationIdOptionSelectedR = e.value.code;
                                        }
                                        setNationIdOptionSelected(nationIdOptionSelectedR)
                                        setBank((prev) => ({
                                            ...prev,
                                            NationId: nationIdOptionSelectedR,
                                        }));
                                    }
                                    }
                                    options={nationIdOptions}
                                    optionLabel="name"
                                    placeholder="Chọn một quốc gia"
                                    className={classNames({
                                        'p-invalid': submitted && !bank.NationId
                                    })}
                                />
                                {submitted && !bank.NationId && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                            </div>
                        </div>
                        <div className=" p-fluid mb-3">
                            <label htmlFor="Name" className="font-bold block mb-2" >Tên ngân hàng<span className="text-red-600">*</span></label>
                            <InputText
                                id="name"
                                value={bank.Name}
                                onChange={(e) => onInputChange(e, 'Name')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !bank.Name
                                })}
                            />
                            {submitted && !bank.Name && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>


                        <div className="flex w-18rem ml-auto justify-content-center gap-3 mt-5">
                            <Button className='btn-pri' label="Lưu"
                                onClick={handleBankAction}
                            />
                            <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                        </div>
                        <Messages ref={message} />
                    </>


                </Dialog >
            </div >
        </div >
    );
};

export default Bank;
