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
import { User } from '../../../types/types';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import moment from "moment";
import { Dialog } from 'primereact/dialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { formatDate, isJsonString, processFilter } from '../../../common/common';
import PermissionsService from '../../../service/PermissionsService';
import { InputValue, InputValueResponse } from '../../../types/models/dropdownInput';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import BaseCommonService from '../../../service/BaseCommonService';
import { Permission, PermissionModal } from '../../../types/models/permission';
import { Action, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";


const PermissionPages = () => {
    const router = useRouter();
    const message = useRef<Messages>(null);

    const limit = 10;
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: limit,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            Controller: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Code: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Action: { value: null, matchMode: FilterMatchMode.CONTAINS },
        }
    }
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);
    // search
    const [typeSelected, setTypeSelected] = useState("User");
    const [types, setTypes] = useState<InputValue[]>([]);

    // dialog add and edit
    let emptyPermission: PermissionModal = {
        Code: '',
        Name: '',
        Action: '',
        Controller: '',
    };

    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [permission, setPermission] = useState(emptyPermission);

    const [actionSelected, setActionSelected] = useState(null);
    const [actions, setActions] = useState<InputValue[]>([]);

    const [functionSelected, setFunctionSelected] = useState(null);
    const [functions, setFunctions] = useState<InputValue[]>([]);

    const toast = useRef<Toast>(null);
    const clearFilter1 = () => {
        setlazyState(lazyStateDefault);
    };

    const retrievePermission = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = processFilter(lazyState);
        PermissionsService.get(currentPage, lazyState.rows, filterProcess, typeSelected)
            .then((response: DefaultResponse) => {
                setPermissions(response.data);
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
        retrievePermission();
    };
    useEffect(() => {
        if (typeSelected)
            retrievePermission();
    }, [lazyState, typeSelected]);

    const retrieveTypeSelectbox = () => {
        BaseCommonService.getApplicationType()
            .then((response: DefaultResponse) => {
                var typeOptionValues = [];
                if (response.data && response.data.length > 0) {
                    typeOptionValues = response.data.map((item: InputValueResponse) => ({ code: item.Value, name: item.Text }));
                    // setTypeSelected(typeOptionValues[0].code)
                }
                setTypes(typeOptionValues);
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
    useEffect(() => {
        retrieveTypeSelectbox();
    }, []);


    const onFilter = (event: any) => {
        event['first'] = 0;
        setlazyState(event);
    }
    const onPage = (event: any) => {
        console.log(event)
        setlazyState(event);
    };

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
                if (typeSelected)
                    PermissionsService.delete(Id, typeSelected)
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
    const renderAction = (rowData: Permission) => {
        return <div className='flex justify-content-center flex-wrap'>
            <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDialog(rowData.Id)} />
            <Button style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => confirm(rowData.Id)} />
        </div>
    }

    const hideDialog = () => {
        setSubmitted(false);
        setShowPermissionDialog(false);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setPermission((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        setPermission((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const handleShowDialog = async (Id: number | null) => {
        try {
            if (Id !== null) {
                setIsEdit(true);
                const response = await PermissionsService.getUpdate(Id, typeSelected);
                handleResponseShowDialog(response);
            } else {
                setIsEdit(false);
                setPermission(emptyPermission);
                setActionSelected(null)
                setFunctionSelected(null)
                const response = await PermissionsService.getCreate(typeSelected);
                handleResponseShowDialog(response);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleResponseShowDialog = (response: DefaultResponse) => {
        if (response.status) {
            setShowPermissionDialog(true);
            const { Actions, Functions, Info } = response.data;
            if (Actions && Actions.length > 0) {
                const actionItem = Actions.map((item: any) => ({
                    code: item.Value,
                    name: item.Text,
                }));
                setActions(actionItem)
            }
            if (Functions && Functions.length > 0) {
                const functionsItem = Functions.map((item: any) => ({
                    code: item.Value,
                    name: item.Text,
                }));
                setFunctions(functionsItem)
            }
            if (Info) {
                setActionSelected(Info.Action)
                setFunctionSelected(Info.Controller)
                setPermission({
                    Id: Info.Id,
                    Code: Info.Code,
                    Name: Info.Name,
                    Action: Info.Action,
                    Controller: Info.Controller,
                });
            }
        }
    };
    const handlePermissionAction = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if (!permission.Name) {
            return;
        }
        // isEdit = false : add event
        if (!isEdit) {
            if (!permission.Code) {
                return;
            }
            PermissionsService.create(permission, typeSelected)
                .then((response) => {
                    if (response.status == true) {
                        setPermission(emptyPermission)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã thêm mới thành công', life: 3000 });
                        setSubmitted(false)
                        reloadPage();
                        setShowPermissionDialog(false);
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
            PermissionsService.update(permission, typeSelected)
                .then((response) => {
                    if (response.status == true) {
                        setPermission(emptyPermission)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã chỉnh sửa thành công', life: 3000 });
                        setSubmitted(false)
                        reloadPage();
                        setShowPermissionDialog(false);
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
                    <h3>Danh mục quyền</h3>
                    {/* <div className='flex gap-5 align-items-end flex-wrap mb-2'>
                        <div className="field">
                            <label htmlFor="Type" className="font-bold block mb-2" >Đối tượng:</label>
                            <Dropdown
                                virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                filter
                                value={types.find(({ code }) => code === typeSelected)}
                                onChange={(e) => {
                                    var typesSelectedR: any = null;
                                    if (e.value != null) {
                                        typesSelectedR = e.value.code;
                                    }
                                    setTypeSelected(typesSelectedR)
                                }
                                }
                                options={types}
                                optionLabel="name"
                                className="w-full md:w-14rem"
                            />
                        </div>

                    </div> */}
                    <div className="flex mb-4">
                        {
                            authorizeAccountControllerAction(Permissions.Permission, Action.Add) &&
                            <Button label="Thêm mới" icon="pi pi-plus" severity="help" className="ml-auto mr-2" onClick={() => handleShowDialog(null)} />
                        }
                    </div>

                    <DataTable
                        value={permissions}
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
                        emptyMessage="No permission found."
                    >
                        <Column
                            header="Thao tác"
                            body={renderAction}
                            style={{ minWidth: '100px' }}
                        ></Column>
                        <Column
                            field="Controller"
                            header="Tên chức năng"
                            filter
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            style={{ minWidth: '150px' }}
                        />
                        <Column
                            field="Code"
                            header="Mã quyền"
                            filter
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            field="Name"
                            header="Tên quyền"
                            filter
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            field="Action"
                            header="Hành động"
                            filter
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            style={{ minWidth: '150px' }}
                        />
                    </DataTable>
                </div>
                <Dialog visible={showPermissionDialog}
                    style={{ width: '900px' }}
                    header={isEdit ? "Chỉnh sửa Permission" : "Thêm Permission"}
                    modal
                    className="p-fluid"
                    blockScroll
                    draggable={false}
                    onHide={hideDialog}>
                    <>
                        <div className="field">
                            <div className=" flex flex-wrap gap-3 p-fluid mb-3 mt-2">
                                <div className="w-49">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Name <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="Name"
                                        value={permission.Name}
                                        onChange={(e) => onInputChange(e, 'Name')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !permission.Name
                                        })}
                                    />
                                    {submitted && !permission.Name && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                                <div className="w-49">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Code <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="Code"
                                        value={permission.Code}
                                        onChange={(e) => onInputChange(e, 'Code')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !permission.Code
                                        })}
                                    />
                                    {submitted && !permission.Code && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <div className=" flex flex-wrap gap-3 p-fluid mb-3 mt-2">
                                <div className="w-49">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Action</label>
                                    <Dropdown
                                        virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                        filter
                                        value={actions.find(({ code }) => code === actionSelected)}
                                        onChange={(e) => {
                                            var actionSelectedR: any = null;
                                            if (e.value != null) {
                                                actionSelectedR = e.value.code;
                                            }
                                            setActionSelected(actionSelectedR)
                                            setPermission((prev) => ({
                                                ...prev,
                                                Action: actionSelectedR,
                                            }));
                                        }
                                        }
                                        options={actions}
                                        optionLabel="name"
                                        placeholder="Chọn một action" />

                                </div>
                                <div className="w-49">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Functions </label>
                                    <Dropdown
                                        virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                        filter
                                        value={functions.find(({ code }) => code === functionSelected)}
                                        onChange={(e) => {
                                            var functionSelectedR: any = null;
                                            if (e.value != null) {
                                                functionSelectedR = e.value.code;
                                            }
                                            setFunctionSelected(functionSelectedR)
                                            setPermission((prev) => ({
                                                ...prev,
                                                Controller: functionSelectedR,
                                            }));
                                        }
                                        }
                                        options={functions}
                                        optionLabel="name"
                                        placeholder="Chọn một function" />

                                </div>

                            </div>
                        </div>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-3">

                            </div>
                            <div className="p-fluid formgrid grid col-12 md:col-9">
                                <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                                    <Button className='btn-pri' label="Lưu" onClick={handlePermissionAction} />
                                    <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                                </div>
                            </div>
                        </div>
                        <Messages ref={message} />
                    </>
                </Dialog>
            </div>
        </div>
    );
};

export default PermissionPages;
