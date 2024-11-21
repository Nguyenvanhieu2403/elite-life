'use client';
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
import { findDifference, formatDate, isJsonString, processFilter } from '../../../common/common';
import RoleService from '../../../service/RoleService';
import { Role, RoleModal } from '../../../types/models/role';
import { InputValue, InputValueResponse } from '../../../types/models/dropdownInput';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import BaseCommonService from '../../../service/BaseCommonService';
import { Action, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { PickList } from 'primereact/picklist';
import { useRouter } from "next/navigation";
import { authorizeAccountControllerAction } from '../../../middleware/authorize';

const Role = () => {
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
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        }
    }
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);
    // search
    const [typeSelected, setTypeSelected] = useState("User");
    const [types, setTypes] = useState<InputValue[]>([]);

    // dialog add and edit
    let emptyRole: RoleModal = {
        Id: null,
        Name: '',
        PermissionIds: []
    };

    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [role, setRole] = useState(emptyRole);

    const [multiSelectPermission, setMultiSelectPermission] = useState(null);
    const [multiselectPermissions, setMultiselectPermissions] = useState<InputValue[]>([]);

    const [source, setSource] = useState<InputValue[]>([]);
    const [target, setTarget] = useState<InputValue[]>([]);

    const toast = useRef<Toast>(null);
    const clearFilter1 = () => {
        setlazyState(lazyStateDefault);
    };

    const retrieveRole = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = processFilter(lazyState);
        RoleService.get(currentPage, lazyState.rows, filterProcess, typeSelected)
            .then((response: DefaultResponse) => {
                setRoles(response.data);
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
        retrieveRole();
    };
    useEffect(() => {
        if (typeSelected)
            retrieveRole();
    }, [lazyState, typeSelected]);

    const retrieveTypeSelectbox = () => {
        BaseCommonService.getApplicationType()
            .then((response: DefaultResponse) => {
                var typeOptionValues = [];
                if (response.data && response.data.length > 0) {
                    typeOptionValues = response.data.map((item: InputValueResponse) => ({ code: item.Value, name: item.Text }));
                    setTypeSelected(typeOptionValues[0].code)
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

    const permissionsBodyTemplate = (rowData: Role) => {
        return rowData.Permissions && rowData.Permissions.length > 0 ? (
            <ul>
                {rowData.Permissions.map((permission: any, index: number) => (
                    <li key={index}>{permission.Permission ? permission.Permission.Name : ""}</li>
                ))}
            </ul>
        ) : (<></>);
    };

    const onFilter = (event: any) => {
        event['first'] = 0;
        setlazyState(event);
    }
    const onPage = (event: any) => {
        console.log(event)
        setlazyState(event);
    };

    const onChange = (event: any) => {
        setSource(event.source);
        setTarget(event.target);
        var permissionSelected: never[] = [];
        if (event.target != null) {
            permissionSelected = event.target.map((item: any) => (item.code));
        }
        setRole((prev) => ({
            ...prev,
            PermissionIds: permissionSelected,
        }));
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
                    RoleService.delete(Id, typeSelected)
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
    const renderAction = (rowData: Role) => {
        return <div className='flex justify-content-center flex-wrap'>

            {
                authorizeAccountControllerAction(Permissions.Role, Action.Update) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDialog(rowData.Id)} />
            }
            {
                authorizeAccountControllerAction(Permissions.Role, Action.Delete) &&
                <Button style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => confirm(rowData.Id)} />
            }
        </div>
    }

    const hideDialog = () => {
        setSubmitted(false);
        setShowRoleDialog(false);
        setSource([]);
        setTarget([]);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setRole((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        setRole((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const handleShowDialog = async (Id: number | null) => {
        try {
            if (Id !== null) {
                setIsEdit(true);
                const response = await RoleService.getUpdate(Id, typeSelected);
                handleResponseShowDialog(response);
            } else {
                setIsEdit(false);
                setRole(emptyRole);
                setMultiSelectPermission(null);
                setTarget([])
                const response = await RoleService.getCreate(typeSelected);
                handleResponseShowDialog(response);
            }
            setShowRoleDialog(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleResponseShowDialog = (response: DefaultResponse) => {
        if (response.status) {
            const { Permissions, Info } = response.data;
            let permissionItem = []
            if (Permissions && Permissions.length > 0) {
                permissionItem = Permissions.map((item: any) => ({
                    code: item.Value,
                    name: item.Text,
                }));
            }
            if (Info) {
                let permissionSelected = [];
                if (Info.Permissions && Info.Permissions.length > 0) {
                    permissionSelected = Info.Permissions.map((item: any) => ({
                        code: item.Permission ? item.Permission.Id : "",
                        name: item.Permission ? item.Permission.Name : "",
                    }))
                }

                let permissionSelectedRequest = [];
                if (Info.Permissions && Info.Permissions.length > 0) {
                    permissionSelectedRequest = Info.Permissions.map((item: any) =>
                        item.PermissionId
                    );
                }
                setMultiSelectPermission(permissionSelected);
                setRole({
                    Id: Info.Id,
                    Name: Info.Name,
                    PermissionIds: permissionSelectedRequest,
                });
                setTarget(permissionSelected)
                const sourceValues = findDifference(permissionItem, permissionSelected);
                console.log(sourceValues)
                setSource(sourceValues)
            } else {
                setMultiselectPermissions(permissionItem);
                setSource(permissionItem);
            }
        }
    };
    const handleRoleAction = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if (!role.Name) {
            return;
        }
        // isEdit = false : add event
        if (!isEdit) {
            RoleService.create(role, typeSelected)
                .then((response) => {
                    if (response.status == true) {
                        setRole(emptyRole)
                        setSource([]);
                        setTarget([]);
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã thêm mới thành công', life: 3000 });
                        setSubmitted(false)
                        reloadPage();
                        setShowRoleDialog(false);
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
            RoleService.update(role, typeSelected)
                .then((response) => {
                    if (response.status == true) {
                        setRole(emptyRole)
                        setSource([]);
                        setTarget([]);
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã chỉnh sửa thành công', life: 3000 });
                        setSubmitted(false)
                        reloadPage();
                        setShowRoleDialog(false);
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
                    <h3>Quản lý nhóm quyền</h3>
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
                            authorizeAccountControllerAction(Permissions.Role, Action.Add) &&
                            <Button label="Thêm mới" icon="pi pi-plus" severity="help" className="ml-auto mr-2" onClick={() => handleShowDialog(null)} />
                        }
                    </div>

                    <DataTable
                        value={roles}
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
                        className="p-datatable-gridlines table-nq"
                        dataKey="Id"
                        filterDisplay="row"
                        filters={lazyState.filters}
                        loading={loading}
                        emptyMessage="No role found."
                    >
                        <Column
                            header="Thao tác"
                            body={renderAction}
                            style={{ width: '100px' }}
                        ></Column>
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            filter
                            field="Name"
                            header="Tên nhóm quyền"
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            field="Permissions"
                            header="Danh sách quyền"
                            style={{ minWidth: '200px' }}
                            body={permissionsBodyTemplate}
                        />
                    </DataTable>
                </div>
                <Dialog visible={showRoleDialog}
                    style={{ width: '900px' }}
                    header={isEdit ? "Chỉnh sửa Role" : "Thêm Role"}
                    modal
                    blockScroll
                    draggable={false}
                    className="p-fluid"
                    onHide={hideDialog}>
                    <>
                        <div className="field">
                            <div className=" flex flex-wrap gap-3 p-fluid mb-3 mt-2">
                                <div className="w-49">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Name <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="Name"
                                        value={role.Name}
                                        onChange={(e) => onInputChange(e, 'Name')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !role.Name
                                        })}
                                    />
                                    {submitted && !role.Name && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                {/* <div className="w-49">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Permission</label>
                                    <MultiSelect
                                        value={multiSelectPermission}
                                        onChange={(e) => {
                                            setMultiSelectPermission(e.value)
                                            var permissionSelected: never[] = [];
                                            if (e.value != null) {
                                                permissionSelected = e.value.map((item: any) => (item.code));
                                            }
                                            setRole((prev) => ({
                                                ...prev,
                                                PermissionIds: permissionSelected,
                                            }));
                                        }
                                        }
                                        options={multiselectPermissions}
                                        optionLabel="name"
                                        placeholder="Select Permissions"
                                        filter
                                        showClear
                                        className="multiselect-custom"
                                        display="chip"
                                    />

                                </div> */}
                            </div>
                            <label htmlFor="integeronly" className="font-bold block mb-2" > Permission</label>
                            <PickList source={source} target={target} onChange={onChange}
                                filter filterBy="name"
                                itemTemplate={(item) => <div key={item.code}>{item.name}</div>}
                                breakpoint="1400px"
                                sourceHeader="Danh sách chưa chọn"
                                targetHeader="Danh sách đã chọn"
                                sourceStyle={{ height: '24rem' }}
                                targetStyle={{ height: '24rem' }}
                                showSourceControls={false}
                                showTargetControls={false}

                            />

                        </div>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-3">

                            </div>
                            <div className="p-fluid formgrid grid col-12 md:col-9">
                                <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                                    <Button className='btn-pri' label="Lưu" onClick={handleRoleAction} />
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

export default Role;
