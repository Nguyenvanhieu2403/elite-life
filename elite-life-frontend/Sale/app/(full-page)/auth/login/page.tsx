/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState, useRef } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { useFormik } from 'formik';

import AuthService from "../../../../service/AuthService";
import { LoginResponse } from '../../../../types/models/auth';
import { isJsonString } from '../../../../common/common';

const LoginPage = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const message = useRef<Messages>(null);

    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();
    const containerClassName = classNames('content-login surface-ground flex', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const handleLogin = (userName: string, password: string) => {
        setLoading(true)
        message.current?.clear();
        AuthService.login(userName, password).then(
            (data: LoginResponse) => {
                if (data.status != true) {
                    setLoading(false)
                    message.current?.show({
                        severity: 'error',
                        content: (
                            <React.Fragment>
                                <div className="max-w-[30rem]">
                                    {
                                        isJsonString(data.message) ?
                                            <>
                                                <div className="ml-2">{data.message.UserName}</div>
                                                <div className="ml-2">{data.message.Password}</div>
                                            </>
                                            :
                                            <>
                                                <div className="ml-2">{data.message}</div>
                                            </>
                                    }
                                </div>
                            </React.Fragment>
                        ),
                        sticky: true
                    });
                } else {
                    setLoading(false)
                    localStorage.setItem("jwt", JSON.stringify(data.token));
                    localStorage.setItem("Info", JSON.stringify((data as any).data.CollaboratorInfo));
                    localStorage.setItem("tokenExpires", JSON.stringify(data.tokenExpires));
                    router.push('/')
                }
            },

        );
    }



    const formik = useFormik({
        initialValues: {
            userName: '',
            password: '',

        },
        onSubmit: (data) => {
            data && handleLogin(data.userName, data.password);
            formik.resetForm();
        }
    });

    return (
        <div className={containerClassName}>
            <div className="login-left">
                <img src="/layout/images/image-illustrator.png" />
            </div>
            <div className="login-right">
                <div className="login-right-mid">
                    <img className='logo' src="/layout/images/logo-login.svg" alt="logo" />
                    <div className="form-login">
                        <h2 className="title-login">ĐĂNG NHẬP</h2>
                        <div>
                            <form onSubmit={formik.handleSubmit} className="flex flex-column gap-2">
                                <div className="mr-input-lg">
                                    <InputText id="email1"
                                        value={formik.values.userName}
                                        onChange={(e) => formik.setFieldValue('userName', e.target.value)} type="text" placeholder="Mã đăng nhập" className='w-full' />
                                </div>
                                <div className="mr-input-lg">
                                    <Password feedback={false} inputId="password1"

                                        value={formik.values.password} onChange={(e) => formik.setFieldValue('password', e.target.value)} placeholder="Password" toggleMask className='w-full' inputClassName='w-full'></Password>
                                </div>
                                <div className="flex align-items-center justify-content-between">
                                    <div className="flex align-items-center">
                                        <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                        <label htmlFor="rememberme1">Ghi nhớ đăng nhập</label>
                                    </div>
                                </div>
                                <Button type='submit' label="ĐĂNG NHẬP" className="btn-login" ></Button>
                                <div className="label-sale">
                                    <label htmlFor="">Bạn chưa có tài khoản? Click để </label><a href="/auth/register">đăng ký</a>
                                </div>
                                <Messages ref={message} className="max-w-login-mess" />
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
