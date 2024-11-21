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
import CollaboratorService from '../../../service/CollaboratorService';
import { Tree } from 'primereact/tree';
import { Avatar } from 'primereact/avatar';
import { Action, DialogStyle, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { FileUpload } from 'primereact/fileupload';
import { BankAccount, BankAccountModal } from '../../../types/models/bankAccount';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";

const BankAccountPage = () => {
    const router = useRouter();
    const imageURL = process.env.PortImage;
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
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Email: { value: null, matchMode: FilterMatchMode.CONTAINS },
            ContractNumber: { value: null, matchMode: FilterMatchMode.EQUALS },
            Mobile: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Address: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Identity: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankOwner: { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Bank.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            BankBranchName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const dataTableRef = useRef(null);

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

    const [nationIdOptionSelected, setNationIdOptionSelected] = useState(null);
    const [nationIdOptions, setNationIdOptions] = useState<InputValue[]>([]);

    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);

    // dialog add and edit
    const emptyBankAccount: BankAccountModal = {
        Id: null,
        BankId: null,
        NationId: null,
        BankBranchName: "",
        BankOwner: "",
        BankNumber: "",
    };

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [bankAccount, setBankAccount] = useState(emptyBankAccount);

    const [parentIdOptionSelected, setParentIdOptionSelected] = useState(null);
    const [parentIdOptions, setParentIdOptions] = useState<InputValue[]>([]);

    const [bankIdOptionSelected, setBankIdOptionSelected] = useState(null);
    const [bankIdOptions, setBankIdOptions] = useState<InputValue[]>([]);

    const [rankOptionSelected, setRankOptionSelected] = useState(null);
    const [rankOptions, setRankOptions] = useState<InputValue[]>([]);

    const [isShowClearFilter, setIsShowClearFilter] = useState(false);
    const toast = useRef<Toast>(null);
    const clearFilter = () => {
        setlazyState(lazyStateDefault);
        setIsShowClearFilter(false);
    };

    const retrieveBankAccount = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);

        CollaboratorService.getBankAccount(currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                if (response.status) {
                    setBankAccounts(response.data);
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
        retrieveBankAccount();
    };
    useEffect(() => {
        retrieveBankAccount();
    }, [lazyState]);


    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => {
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };

    const dateBodyTemplate = (rowData: BankAccount) => {
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

    // confirm 
    const reject = () => {
    };

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                {
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} /> : <div></div>
                }
                <div >
                    <Button loading={loading} label="Xuất Excel" icon="pi pi-upload" severity="success" className="mr-2" onClick={() => exportExcel()} />
                </div>
            </div>
        );
    };

    // add and edit
    const renderAction = (rowData: BankAccount) => {
        return <div className='flex justify-content-center flex-wrap'>
            {
                authorizeAccountControllerAction(Permissions.CollaboratorBank, Action.Update) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDialog(rowData.Id)} />
            }
        </div>
    }

    const hideDialog = () => {
        setSubmitted(false);
        setShowUserDialog(false);

    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setBankAccount((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        setBankAccount((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const exportExcel = () => {
        setLoading(true);
        var filterProcess = processFilter(lazyState);
        CollaboratorService.getBankAccount(firstPage, Number.MAX_SAFE_INTEGER, filterProcess)
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
            CollaboratorService.getUpdatebank(Id)
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        // var bankIdOptionValues = [];
                        // if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                        //     bankIdOptionValues = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        // }
                        // setBankIdOptions(bankIdOptionValues);

                        var nationIdOptionValues = [];
                        if (response.data.Nations && response.data.Nations.length > 0) {
                            nationIdOptionValues = response.data.Nations.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setNationIdOptions(nationIdOptionValues);

                        if (response.data.Info) {
                            setBankIdOptionSelected(response.data.Info.BankId)
                            onchangeReLoadBank(response.data.Info.Bank?.NationId)
                            setBankAccount({
                                Id: response.data.Info.Id,
                                NationId: response.data.Info.Bank?.NationId,
                                BankId: response.data.Info.BankId,
                                BankNumber: response.data.Info.BankNumber,
                                BankOwner: response.data.Info.BankOwner,
                                BankBranchName: response.data.Info.BankBranchName,
                            })
                            setNationIdOptionSelected(response.data.Info.Bank?.NationId)
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
        }
        setShowUserDialog(true)
    };

    const handleCollaboratorAction = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if (!bankAccount.BankId || !bankAccount.NationId || !bankAccount.BankNumber || !bankAccount.BankOwner || !bankAccount.BankBranchName) {
            return;
        }
        CollaboratorService.updateBankAccount(bankAccount)
            .then((response: DefaultResponse) => {
                if (response.status == true) {
                    setBankAccount(emptyBankAccount)
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
    };

    const onchangeReLoadBank = (nationId: number | null) => {
        if (nationId != null)
            CollaboratorService.getBank(nationId)
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        var bankIdOptionValues = [];
                        if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                            bankIdOptionValues = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setBankIdOptions(bankIdOptionValues);
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
    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Quản lý tài khoản ngân hàng</h3>

                    <DataTable
                        value={bankAccounts}
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
                        emptyMessage="No bank account found."
                        header={renderHeader1()}
                    >
                        <Column
                            header="Thao tác"
                            exportable={false}
                            body={renderAction}
                            style={{ minWidth: '70px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="UserName"
                            header="Tên đăng nhập"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Name"
                            header="Họ tên"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Email"
                            header="Email"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="ContractNumber"
                            header="Số hợp đồng"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Mobile"
                            header="SĐT"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
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
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="BankNumber"
                            header="STK"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="BankOwner"
                            header="Chủ tài khoản"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Bank.Name"
                            header="Ngân hàng"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="BankBranchName"
                            header="Chi nhánh"
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
                    style={{ width: DialogStyle.width.medium }}
                    header={isEdit ? "Chỉnh sửa tài khoản ngân hàng" : "Thêm người dùng"}
                    modal
                    blockScroll
                    draggable={false}
                    className="p-fluid"
                    onHide={hideDialog}>
                    <>
                        <div className="field">
                            <div className=" flex flex-wrap gap-3 p-fluid mb-3">
                                <div className="w-49">
                                    <label htmlFor="BankOwner" className="font-bold block mb-2" >Chủ tài khoản <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="BankOwner"
                                        value={bankAccount.BankOwner}
                                        onChange={(e) => onInputChange(e, 'BankOwner')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !bankAccount.BankOwner
                                        })}
                                    />
                                    {submitted && !bankAccount.BankOwner && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                                <div className="w-49">
                                    <label htmlFor="BankNumber" className="font-bold block mb-2" >Số tài khoản <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="BankNumber"
                                        value={bankAccount.BankNumber}
                                        onChange={(e) => onInputChange(e, 'BankNumber')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !bankAccount.BankNumber
                                        })}
                                    />
                                    {submitted && !bankAccount.BankNumber && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                            </div>

                            <div className=" flex flex-wrap gap-3 p-fluid mb-3">
                                <div className="w-49">
                                    <label htmlFor="Nation" className="font-bold block mb-2" >Quốc gia<span className="text-red-600">*</span></label>
                                    <Dropdown
                                        virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                        filter
                                        value={nationIdOptions.find(({ code }) => code === nationIdOptionSelected)}
                                        onChange={(e) => {
                                            var nationIdOptionSelectedR: any = null;
                                            if (e.value != null) {
                                                nationIdOptionSelectedR = e.value.code;
                                                onchangeReLoadBank(e.value.code)
                                            }
                                            setNationIdOptionSelected(nationIdOptionSelectedR)
                                            setBankAccount((prev) => ({
                                                ...prev,
                                                NationId: nationIdOptionSelectedR,
                                            }));
                                        }
                                        }
                                        options={nationIdOptions}
                                        optionLabel="name"
                                        placeholder="Chọn một quốc gia"
                                        className={classNames({
                                            'p-invalid': submitted && !bankAccount.NationId
                                        })}
                                    />
                                    {submitted && !bankAccount.NationId && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                                <div className="w-49">
                                    <label htmlFor="BankOwner" className="font-bold block mb-2" >Ngân hàng <span className="text-red-600">*</span></label>
                                    <Dropdown
                                        virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                        filter
                                        value={bankIdOptions.find(({ code }) => code === bankIdOptionSelected)}
                                        onChange={(e) => {
                                            var bankIdOptionSelectedR: any = null;
                                            if (e.value != null) {
                                                bankIdOptionSelectedR = e.value.code;
                                            }
                                            setBankIdOptionSelected(bankIdOptionSelectedR)
                                            setBankAccount((prev) => ({
                                                ...prev,
                                                BankId: bankIdOptionSelectedR,
                                            }));
                                        }
                                        }
                                        options={bankIdOptions}
                                        optionLabel="name"
                                        placeholder="Chọn một ngân hàng"
                                        className={classNames({
                                            'p-invalid': submitted && !bankAccount.BankId
                                        })}
                                    />
                                    {submitted && !bankAccount.BankId && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                            </div>
                            <div className=" flex flex-wrap gap-3 p-fluid mb-3">
                                <div className="w-49">
                                    <label htmlFor="BankBranchName" className="font-bold block mb-2" >Chi nhánh <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="BankBranchName"
                                        value={bankAccount.BankBranchName}
                                        onChange={(e) => onInputChange(e, 'BankBranchName')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !bankAccount.BankBranchName
                                        })}
                                    />
                                    {submitted && !bankAccount.BankBranchName && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                            </div>
                        </div>
                        <div className="flex col-3 ml-auto justify-content-center gap-3">
                            <Button className='btn-pri' label="Lưu" onClick={handleCollaboratorAction} />
                            <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                        </div>
                        <Messages ref={message} />
                    </>


                </Dialog >
            </div >
        </div >
    );
};

export default BankAccountPage;
