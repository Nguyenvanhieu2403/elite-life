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
import { DialogStyle } from '../common/config';
import { InputText } from 'primereact/inputtext';
import { ChangePassRequest } from '../types/models/account';
import { Messages } from 'primereact/messages';
import router from 'next/router';
import AccountService from '../service/AccountService';
import { DefaultResponse } from '../types/models/defaultResponse';
import { isJsonString } from '../common/common';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef<HTMLButtonElement | null>(null);
    const topbarmenuRef = useRef<HTMLDivElement | null>(null);
    const topbarmenubuttonRef = useRef<HTMLButtonElement | null>(null);
    const menu = useRef<TieredMenu | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const toast = useRef<Toast>(null);

    const message = useRef<Messages>(null);

    // dialog add and edit
    const emptyChangePassRequest: ChangePassRequest = {
        Password: "",
        NewPassword: "",
        ReNewPassword: "",
    };

    const [changePassRequest, setChangePassRequest] = useState(emptyChangePassRequest);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const signOut = async () => {
        await AuthService.logout();
    };
    const hideDialog = () => {
        setSubmitted(false);
        setShowUserDialog(false);

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
                    default:
                        throw e;

                }

            });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setChangePassRequest((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const items = [
        // {
        //     label: 'Thông tin',
        //     icon: 'pi pi-fw pi-user',
        //     command: () => { }
        // },
        {
            label: 'Đổi mật khẩu',
            icon: 'pi pi-fw pi-user-edit',
            command: () => { setShowUserDialog(true) }
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
            </div>
            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
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
            <Dialog visible={showUserDialog}
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
                                onChange={(e) => onInputChange(e, 'Password')}
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
                                onChange={(e) => onInputChange(e, 'NewPassword')}
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
                                onChange={(e) => onInputChange(e, 'ReNewPassword')}
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
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
