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
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import UserService from '../../../service/UserService';
import { User } from '../../../types/types';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import moment from "moment";
import { Dialog } from 'primereact/dialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, isJsonString, processFilter } from '../../../common/common';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { UserModal } from '../../../types/models/user';
import { InputValue } from '../../../types/models/dropdownInput';
import { Password } from 'primereact/password';
import { Action, DialogStyle, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";

const UserManage = () => {
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
            DisplayName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Email: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Address: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Mobile: { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Role.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const dataTableRef = useRef(null);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);

    // dialog add and edit
    let emptyUser: UserModal = {
        Id: null,
        Image: "",
        UserName: '',
        Password: '',
        RePassword: '',
        RoleId: null,
        OrgIds: [],
        SubInstituteIds: [],
        DisplayName: '',
        Email: '',
        Mobile: '',
        Address: '',
    };
    const [isShowClearFilter, setIsShowClearFilter] = useState(false);

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState(emptyUser);

    const [roleSelected, setRoleSelected] = useState(null);
    const [roles, setRoles] = useState<InputValue[]>([]);

    const [orgIdSelected, setOrgIdSelected] = useState<any>(null);
    const [orgIds, setOrgIds] = useState<InputValue[]>([]);

    const [subInstituteIdSelected, setSubInstituteIdSelected] = useState<any>(null);
    const [subInstituteIds, setSubInstituteIds] = useState<InputValue[]>([]);

    const toast = useRef<Toast>(null);
    const clearFilter1 = () => {
        setlazyState(lazyStateDefault);
        setIsShowClearFilter(false);
    };

    const retrieveUser = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        UserService.get(currentPage, lazyState.rows, filterProcess)
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
    const confirm = (Id: number) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn xóa?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Đồng ý',
            rejectLabel: 'Hủy',
            accept() {
                UserService.delete(Id)
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

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                {
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter1} /> : <div></div>
                }
                <div >
                    {
                        authorizeAccountControllerAction(Permissions.User, Action.Add) &&
                        <Button label="Thêm mới" icon="pi pi-plus" severity="help" className="ml-auto mr-2" onClick={() => handleShowDialog(null)} />
                    }
                    <Button loading={loading} label="Xuất Excel" icon="pi pi-upload" severity="success" onClick={() => exportExcel()} />
                </div>
            </div>
        );
    };

    // add and edit
    const renderAction = (rowData: User) => {
        return <div className='flex justify-content-center flex-wrap'>
            {
                authorizeAccountControllerAction(Permissions.User, Action.Update) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDialog(rowData.Id)} />
            }
            {
                authorizeAccountControllerAction(Permissions.User, Action.Delete) &&
                <Button style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => confirm(rowData.Id)} />
            }
        </div>
    }

    const hideDialog = () => {
        setSubmitted(false);
        setPreviewImage("")

        setShowUserDialog(false);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setUser((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        setUser((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const exportExcel = () => {
        setLoading(true);
        var filterProcess = processFilter(lazyState);
        UserService.get(firstPage, Number.MAX_SAFE_INTEGER, filterProcess)
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
            UserService.getUpdate(Id)
                .then((response) => {
                    if (response.status) {
                        setShowUserDialog(true)
                        var roleValues = [];
                        if (response.data.Role && response.data.Role.length > 0) {
                            roleValues = response.data.Role.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setRoles(roleValues);
                        var OrgIdsValues = [];
                        if (response.data.Orgs && response.data.Orgs.length > 0) {
                            OrgIdsValues = response.data.Orgs.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setOrgIds(OrgIdsValues);
                        var SubInstitutesValues = [];
                        if (response.data.SubInstitutes && response.data.SubInstitutes.length > 0) {
                            SubInstitutesValues = response.data.SubInstitutes.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setSubInstituteIds(SubInstitutesValues);
                        if (response.data.Info) {
                            setUser(response.data.Info);
                            if (response.data.Info.OrgIds && response.data.Info.OrgIds.length > 0) {
                                setOrgIdSelected(OrgIdsValues.filter((s: any) => response.data.Info.OrgIds.some((s1: any) => s1 == s.code)));
                            } else {
                                setOrgIdSelected(null);
                            }
                            if (response.data.Info.SubInstituteIds
                                && response.data.Info.SubInstituteIds.length > 0) {
                                setSubInstituteIdSelected(SubInstitutesValues.filter((s: any) => response.data.Info.SubInstituteIds.some((s1: any) => s1 == s.code)));
                            } else {
                                setSubInstituteIdSelected(null);
                            }
                            setRoleSelected(response.data.Info.RoleId);
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
            UserService.getCreate()
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        setShowUserDialog(true)
                        var roleValues = [];
                        if (response.data.Role && response.data.Role.length > 0) {
                            roleValues = response.data.Role.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setRoles(roleValues);
                        var OrgIdsValues = [];
                        if (response.data.Orgs && response.data.Orgs.length > 0) {
                            OrgIdsValues = response.data.Orgs.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setOrgIds(OrgIdsValues);
                        var SubInstitutesValues = [];
                        if (response.data.SubInstitutes && response.data.SubInstitutes.length > 0) {
                            SubInstitutesValues = response.data.SubInstitutes.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setSubInstituteIds(SubInstitutesValues);
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
            setUser(emptyUser);
            setRoleSelected(null);
            setOrgIdSelected(null);
            setSubInstituteIdSelected(null);
        }
    };
    const [previewImage, setPreviewImage] = useState<string>("");

    const handleUserAction = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if (!user.DisplayName || !user.Email || !user.Mobile || !user.RoleId) {
            return;
        }
        // isEdit = false : add event
        if (!isEdit) {
            if (!user.Password || !user.RePassword) {
                return;
            }
            UserService.create(user)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setUser(emptyUser)
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

                    };
                });
        } else {
            UserService.update(user)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setUser(emptyUser)
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
    const [currentImage, setCurrentImage] = useState<File>();

    const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setCurrentImage(selectedFiles?.[0]);
        setPreviewImage(URL.createObjectURL(selectedFiles?.[0]));
        // set avatar
        setUser((prev) => ({
            ...prev,
            File: selectedFiles?.[0],
        }));
    };
    const imageBodyTemplate = (rowData: UserModal) => {
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
    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Quản lý tài khoản</h3>


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
                            header="Thao tác"
                            exportable={false}
                            body={renderAction}
                            style={{ minWidth: '100px' }}
                        ></Column>
                        <Column
                            field="Image"
                            header="Ảnh đại diện"
                            style={{ minWidth: '100px' }}
                            body={imageBodyTemplate}
                            exportable={false}
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
                            field="DisplayName"
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
                            field="Role.Name"
                            header="Nhóm quyền"
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
                <Dialog visible={showUserDialog}
                    style={{ width: DialogStyle.width.large }}
                    header={isEdit ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
                    modal
                    blockScroll
                    draggable={false}
                    className="p-fluid"
                    onHide={hideDialog}>
                    <>
                        <div className="p-fluid formgrid grid">
                            <div className='field col-12 md:col-3'>
                                <label htmlFor="label" className="font-bold block mb-2" >Ảnh đại diện </label>
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
                                            {
                                                user.File ?
                                                    <img
                                                        className="w-15rem h-15rem"
                                                        src={`/image/${user.Image}`}
                                                        alt=""
                                                    /> :
                                                    <img
                                                        className="w-15rem h-15rem"
                                                        src={`/demo/images/avatar/defaultAvatar.png`}
                                                        alt=""
                                                    />
                                            }
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
                            <div className='p-fluid formgrid grid col-12 md:col-9'>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Họ và tên <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="DisplayName"
                                        value={user.DisplayName}
                                        onChange={(e) => onInputChange(e, 'DisplayName')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !user.DisplayName
                                        })}
                                    />
                                    {submitted && !user.DisplayName && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Email <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="Email"
                                        value={user.Email}
                                        onChange={(e) => onInputChange(e, 'Email')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !user.Email
                                        })}
                                    />
                                    {submitted && !user.Email && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Số điện thoại <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="Mobile"
                                        value={user.Mobile}
                                        onChange={(e) => onInputChange(e, 'Mobile')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !user.Mobile
                                        })}
                                    />
                                    {submitted && !user.Mobile && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Nhóm quyền <span className="text-red-600">*</span></label>

                                    <Dropdown
                                        virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                        filter
                                        value={roles.find(({ code }) => code === roleSelected)}
                                        onChange={(e) => {
                                            var roleIdSelected: any = null;
                                            if (e.value != null) {
                                                roleIdSelected = e.value.code;
                                            }
                                            setRoleSelected(roleIdSelected)
                                            setUser((prev) => ({
                                                ...prev,
                                                RoleId: roleIdSelected,
                                            }));
                                        }
                                        }
                                        options={roles}
                                        className={classNames({
                                            'p-invalid': submitted && !user.RoleId
                                        })}
                                        optionLabel="name"
                                    />

                                    {submitted && !user.RoleId && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Tên đăng nhập <span className="text-red-600">*</span></label>
                                    <InputText
                                        id="UserName"
                                        value={user.UserName}
                                        onChange={(e) => onInputChange(e, 'UserName')}
                                        required
                                        disabled={isEdit}
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !user.UserName
                                        })}
                                    />
                                    {submitted && !user.UserName && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Mật khẩu {!isEdit && <span className="text-red-600">*</span>}</label>
                                    <Password feedback={false}
                                        id="Password"
                                        value={user.Password}
                                        onChange={(e) => onInputChange(e, 'Password')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !user.Password && !isEdit
                                        })}
                                    />
                                    {submitted && !isEdit && !user.Password && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="integeronly" className="font-bold block mb-2" > Nhập lại mật khẩu {!isEdit && <span className="text-red-600">*</span>}</label>
                                    <Password feedback={false}
                                        id="RePassword"
                                        value={user.RePassword}
                                        onChange={(e) => onInputChange(e, 'RePassword')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !user.RePassword && !isEdit
                                        })}
                                    />
                                    {submitted && !user.RePassword && !isEdit && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                            </div>
                        </div>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-3">

                            </div>
                            <div className="p-fluid formgrid grid col-12 md:col-9">
                                <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                                    <Button className='btn-pri' label="Lưu" onClick={handleUserAction} />
                                    <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                                </div>
                            </div>
                        </div>
                        <Messages ref={message} />
                    </>


                </Dialog >
            </div >
        </div >
    );
};

export default UserManage;
