/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '../types/types';
import { LayoutContext } from './context/layoutcontext';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import AuthService from '../service/AuthService';
import { Dialog } from 'primereact/dialog';
import { DialogStyle, DropdownSizeLoadding } from '../common/config';
import { InputText } from 'primereact/inputtext';
import { ChangePassRequest, FileModal } from '../types/models/account';
import { Messages } from 'primereact/messages';
import router from 'next/router';
import AccountService from '../service/AccountService';
import { DefaultResponse } from '../types/models/defaultResponse';
import { formatDate, formatNumberWithThousandSeparator, isJsonString } from '../common/common';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import { CollaboratorModal } from '../types/models/collaborators';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputValue, InputValueResponse } from '../types/models/dropdownInput';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import HomeService from '../service/HomeService';
import { catchAxiosError } from '../common/commonTSX';
import { useRouter } from 'next/navigation';
import PurchaseDialogCombo from '../app/(main)/PurchaseComboDialog';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef<HTMLButtonElement | null>(null);
    const topbarmenuRef = useRef<HTMLDivElement | null>(null);
    const topbarmenubuttonRef = useRef<HTMLButtonElement | null>(null);
    const menu = useRef<TieredMenu | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showChangePassDialog, setShowChangePassDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const toast = useRef<Toast>(null);



    const message = useRef<Messages>(null);

    // dialog add and edit
    const emptyChangePassRequest: ChangePassRequest = {
        Password: "",
        NewPassword: "",
        ReNewPassword: "",
    };
    const emptyUpload: FileModal = {
        File: null,
    };
    const [changePassRequest, setChangePassRequest] = useState(emptyChangePassRequest);
    const [uploadRequest, setUploadRequest] = useState(emptyUpload);

    // dialog add and edit
    const [collaborator, setCollaborator] = useState<CollaboratorModal>({});

    const [currentImage, setCurrentImage] = useState<File>();
    const [importFile, setImportFile] = useState<File>();
    const [previewImage, setPreviewImage] = useState<string>("");

    const [identityDate, setIdentityDate] = useState<string | Date | Date[] | null>(null);

    const [parentIdOptionSelected, setParentIdOptionSelected] = useState(null);
    const [parentIdOptions, setParentIdOptions] = useState<InputValue[]>([]);
    const [bankIdOptionSelected, setBankIdOptionSelected] = useState(9);
    const [bankIdOptions, setBankIdOptions] = useState<InputValue[]>([]);
    const [rankOptionSelected, setRankOptionSelected] = useState(null);
    const [rankOptions, setRankOptions] = useState<InputValue[]>([]);

    const [orgOptionSelected, setOrgOptionSelected] = useState(null);
    const [orgOptions, setOrgOptions] = useState<InputValue[]>([]);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const signOut = async () => {
        await AuthService.logout();
    };
    const showInfor = async () => {
        setShowUploadDialog(true)
        AccountService.getUpdate()
            .then((response: DefaultResponse) => {
                if (response.status) {
                    var parentIdOptionValues = [];
                    if (response.data.ParentIdOptions && response.data.ParentIdOptions.length > 0) {
                        parentIdOptionValues = response.data.ParentIdOptions.map((item: InputValueResponse) => ({ code: item.Value, name: item.Text }));
                    }
                    setParentIdOptions(parentIdOptionValues);

                    var bankIdOptionValues = [];
                    if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                        bankIdOptionValues = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                    }
                    setBankIdOptions(bankIdOptionValues);

                    var rankOptionValues = [];
                    if (response.data.RankOptions && response.data.RankOptions.length > 0) {
                        rankOptionValues = response.data.RankOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                    }
                    setRankOptions(rankOptionValues);
                    var orgOptionValues = [];
                    if (response.data.OrgOptions && response.data.OrgOptions.length > 0) {
                        orgOptionValues = response.data.OrgOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                    }
                    setOrgOptions(orgOptionValues);
                    var curentCollaborator = response.data.Info
                    if (curentCollaborator) {
                        setCollaborator(curentCollaborator);
                        setParentIdOptionSelected(curentCollaborator.ParentId);
                        setRankOptionSelected(curentCollaborator.RankId);
                        setOrgOptionSelected(curentCollaborator.OrgId);
                        setBankIdOptionSelected(curentCollaborator.BankId);
                        setIdentityDate(curentCollaborator.IdentityDate);
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
    };

    const hideDialog = () => {
        setSubmitted(false);
        setShowChangePassDialog(false);
        setShowUploadDialog(false);
        setShowBuyDialog(false);
    };
    const handleChangPassWord = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if (!changePassRequest.Password || !changePassRequest.NewPassword || !changePassRequest.ReNewPassword) {
            return;
        }
        AccountService.changePassword(changePassRequest)
            .then((response: DefaultResponse) => {
                if (response.status == true) {
                    setChangePassRequest(emptyChangePassRequest)
                    toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã thay đổi mật khẩu thành công', life: 3000 });
                    setSubmitted(false)
                    setShowChangePassDialog(false);
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
                    default:
                        throw e;

                }

            });
    };
    const handleUpload = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if(!collaborator.Name){
            return false;
        }
        var collaboratorFormat = { ...collaborator }
        collaboratorFormat.IdentityDate = identityDate ? moment(identityDate.toString()).format('DD/MM/YYYY') : "";
        AccountService.update(collaboratorFormat)
            .then((response: DefaultResponse) => {
                if (response.status == true) {
                    setCollaborator({})
                    toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã chỉnh sửa thành công', life: 3000 });
                    setSubmitted(false)
                    showInfor();
                    setShowUploadDialog(false);
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
    const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setCurrentImage(selectedFiles?.[0]);
        setPreviewImage(URL.createObjectURL(selectedFiles?.[0]));

        setUploadRequest((prev) => ({
            ...prev,
            File: selectedFiles?.[0],
        }));
    };

    const onInputChangePass = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setChangePassRequest((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const [PayAmount, setPayAmount] = useState<number | null>();
    const [showBuyDialog, setShowBuyDialog] = useState(false);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setCollaborator((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const items = [
        {
            label: 'Thông tin',
            icon: 'pi pi-fw pi-user',
            command: showInfor
        },
        {
            label: 'Đổi mật khẩu',
            icon: 'pi pi-fw pi-user-edit',
            command: () => { setShowChangePassDialog(true) }
        },
        {
            separator: true
        },
        {
            label: 'Đăng xuất',
            icon: 'pi pi-fw pi-sign-out',
            url: "/auth/login",
            command: signOut
        }
    ];
    const router = useRouter();

    return (
        <div className="layout-topbar">
            <Toast ref={toast} />
            <div className='flex ml-10'>
                <Link href="/" className="layout-topbar-logo">
                    <img src={`/layout/images/logo.png`} alt="logo" />
                </Link>
                <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
                <button type="button" className="p-link btn-purchase mobile-only" onClick={() => {
                    setShowBuyDialog(true)
                }}>
                    <span>Mua combo</span>
                </button>
            </div>
            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link btn-purchase" onClick={() => {
                    setShowBuyDialog(true)
                }}>
                    <span>Mua combo</span>
                </button>
                <button type="button" className="p-link layout-topbar-button" onClick={(e) => menu.current?.toggle(e)}>
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
                <TieredMenu model={items} popup ref={menu} breakpoint="767px" />
                {/* <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-cog"></i>
                    <span>Settings</span>
                </button> */}
            </div>
            <Dialog visible={showChangePassDialog}
                style={{ width: DialogStyle.width.min }}
                header={"Đổi mật khẩu"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={hideDialog}>
                <>
                    <div className="field">
                        <div className="mb-3">
                            <label htmlFor="BankOwner" className="font-bold block mb-2" >Mật khẩu hiện tại<span className="text-red-600">*</span></label>
                            <Password feedback={false} toggleMask
                                id="Password"
                                value={changePassRequest.Password}
                                onChange={(e) => onInputChangePass(e, 'Password')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !changePassRequest.Password
                                })}
                            />
                            {submitted && !changePassRequest.Password && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="BankNumber" className="font-bold block mb-2" >Mật khẩu mới<span className="text-red-600">*</span></label>
                            <Password feedback={false} toggleMask
                                id="NewPassword"
                                value={changePassRequest.NewPassword}
                                onChange={(e) => onInputChangePass(e, 'NewPassword')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !changePassRequest.NewPassword
                                })}
                            />
                            {submitted && !changePassRequest.NewPassword && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="BankNumber" className="font-bold block mb-2" >Nhập lại mật khẩu mới<span className="text-red-600">*</span></label>
                            <Password feedback={false} toggleMask
                                id="ReNewPassword"
                                value={changePassRequest.ReNewPassword}
                                onChange={(e) => onInputChangePass(e, 'ReNewPassword')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !changePassRequest.ReNewPassword
                                })}

                            />
                            {submitted && !changePassRequest.ReNewPassword && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>
                    </div>

                    <div className="flex  ml-auto justify-content-center gap-3">
                        <Button className='btn-pri' label="Lưu" onClick={handleChangPassWord} />
                        <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                    </div>
                    <Messages ref={message} />
                </>


            </Dialog >

            <Dialog visible={showUploadDialog}
                style={{ width: DialogStyle.width.large }}
                header={"Thông tin nhân viên kinh doanh"}
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
                                            collaborator.Image ?
                                                <img
                                                    className="w-15rem h-15rem"
                                                    src={`/image/${collaborator.Image}`}
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
                                <label htmlFor="UserName" className="font-bold block mb-2" > Tên đăng nhập </label>
                                <InputText
                                    id="UserName"
                                    value={collaborator.UserName}
                                    autoFocus
                                    disabled
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="Name" className="font-bold block mb-2" >Họ và tên <span className="text-red-600">*</span></label>
                                <InputText
                                    id="Name"
                                    value={collaborator.Name}
                                    onChange={(e) => onInputChange(e, 'Name')}
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !collaborator.Name
                                    })}
                                />
                                 {submitted && !collaborator.Name && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="Email" className="font-bold block mb-2" > Email </label>
                                <InputText
                                    id="Email"
                                    value={collaborator.Email}
                                    onChange={(e) => onInputChange(e, 'Email')}
                                    required
                                    autoFocus
                                 
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="Identity" className="font-bold block mb-2" > CMTND/ CCCD/ HC </label>
                                <InputText
                                    id="Identity"
                                    value={collaborator.Identity}
                                    onChange={(e) => onInputChange(e, 'Identity')}
                                    required
                                    autoFocus
                                   
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="Email" className="font-bold block mb-2" > Ngày cấp</label>
                                <Calendar
                                    inputId="IdentityDate"
                                    name="IdentityDate"
                                    value={new Date(identityDate?.toString() || "")}
                                    onChange={(e) => {
                                        setIdentityDate(e.value ?? null);
                                    }
                                    }
                                    showIcon
                                    dateFormat="dd/mm/yy"
                                   
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="IdentityPlace" className="font-bold block mb-2" > Nơi cấp </label>
                                <InputText
                                    id="IdentityPlace"
                                    value={collaborator.IdentityPlace}
                                    onChange={(e) => onInputChange(e, 'IdentityPlace')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="Mobile" className="font-bold block mb-2" >Điện thoại</label>
                                <InputText
                                    id="Mobile"
                                    value={collaborator.Mobile}
                                    onChange={(e) => onInputChange(e, 'Mobile')}
                                    required
                                    autoFocus
                                />

                            </div>

                            <div className="field col-12 sm:col-6">
                                <label htmlFor="BankNumber" className="font-bold block mb-2" >Số tài khoản</label>
                                <InputText
                                    id="BankNumber"
                                    value={collaborator.BankNumber}
                                    onChange={(e) => onInputChange(e, 'BankNumber')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="BankOwner" className="font-bold block mb-2" >Chủ tài khoản</label>
                                <InputText
                                    id="BankOwner"
                                    value={collaborator.BankOwner}
                                    onChange={(e) => onInputChange(e, 'BankOwner')}
                                    autoFocus
                                />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="BankOwner" className="font-bold block mb-2" >Ngân hàng</label>
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
                                        setCollaborator((prev) => ({
                                            ...prev,
                                            BankId: bankIdOptionSelectedR,
                                        }));
                                    }
                                    }
                                    options={bankIdOptions}
                                    optionLabel="name"
                                    placeholder="Chọn một ngân hàng" />
                            </div>
                            <div className="field col-12 sm:col-6">
                                <label htmlFor="BankBranchName" className="font-bold block mb-2" >Chi nhánh</label>
                                <InputText
                                    id="BankBranchName"
                                    value={collaborator.BankBranchName}
                                    onChange={(e) => onInputChange(e, 'BankBranchName')}
                                    autoFocus
                                />
                            </div>

                        </div>
                    </div>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">

                        </div>
                        <div className="p-fluid formgrid grid col-12 md:col-9">
                            <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                                <Button className='btn-pri' label="Lưu" onClick={handleUpload} />
                                <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                            </div>
                        </div>
                    </div>

                    <Messages ref={message} />
                </>
            </Dialog>
            <PurchaseDialogCombo
                hideDialog={() => setShowBuyDialog(!showBuyDialog)}
                visible={showBuyDialog}
            />
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
