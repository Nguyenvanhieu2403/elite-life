/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState, useRef, useEffect } from 'react';
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
import { Dropdown } from 'primereact/dropdown';
import { DropdownSizeLoadding } from '../../../../common/config';
import { InputValue, InputValueResponse } from '../../../../types/models/dropdownInput';
import { DefaultResponse } from '../../../../types/models/defaultResponse';
import { Toast } from 'primereact/toast';
import { Register, RegisterModal } from '../../../../types/models/register';
import { Calendar } from 'primereact/calendar';
import moment from 'moment';
import CameraComponent from '../../../CommonComponent/CameraComponent';

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const [success, setSuccess] = useState(true)
    const [eContractRead, setEContractRead] = useState(false)

    const [value, setValue] = useState<Register>();

    const [currentImage, setCurrentImage] = useState<File | any>();
    const [previewImage, setPreviewImage] = useState<string>("");

    const [disableStep2, setDisableStep2] = useState(true);
    const [disableStep3, setDisableStep3] = useState(true);

    const [cccdFrontImage, setCccdFrontImage] = useState<File | any>();
    const [cccdFrontPreview, setCccdFrontPreview] = useState<string>("");

    const [cccdBackImage, setCccdBackImage] = useState<File | any>();
    const [cccdBackPreview, setCccdBackPreview] = useState<string>("");

    const [portraitImage, setPortraitImage] = useState<File | any>();
    const [portraitPreview, setPortraitPreview] = useState<string>("");

    const [parents, setParents] = useState<InputValue[]>([]);
    const [banks, setBanks] = useState<InputValue[]>([]);
    const [nationIdOptions, setNationIdOptions] = useState<InputValue[]>([]);

    const [eContract, setEContract] = useState<any>();

    const message = useRef<Messages>(null);

    const toast = useRef<Toast>(null);
    const { layoutConfig } = useContext(LayoutContext);

    const [isKycEnabled, setIsKycEnabled] = useState<boolean>(false)
    const [isKycManual, setIsKycManual] = useState<boolean>(false)
    const [WaitingTimeApprovalKyc, setWaitingTimeApprovalKyc] = useState<number>(0)
    const [isRegisterSuccesful, setIsRegisterSuccesful] = useState<boolean>(false)

    const [currentPage, setCurrentPage] = useState(1)

    const router = useRouter();
    const containerClassName = classNames('content-login surface-ground flex', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setCurrentImage(selectedFiles?.[0]);
        setPreviewImage(URL.createObjectURL(selectedFiles?.[0]));
    };


    const formik = useFormik({
        initialValues: {
            Name: '',
            Identity: '',
            IdentityDate: '',
            IdentityPlace: '',
            Email: '',
            Mobile: '',
            Address: '',
            ParentId: null,
            BankNumber: '',
            BankBranchName: '',
            BankId: null,
            BankOwner: '',
            Password: '',
            RePassword: '',
            Image: null,
            IdentityIMG: null,
            IdentityIMG2: null,
            FaceIMG: null,
            File: null,
            NationId: 71,
            BankSwiftCode: "",
            ParentCode: ""
        },
        onSubmit: (values) => {
            // debugger
            message.current?.clear();
            setSubmitted(true);
            let valueRequest: RegisterModal;
            var valuesIdentityDate = values.IdentityDate ? moment(values.IdentityDate).format("DD/MM/YYYY") : undefined
            valueRequest = {
                Name: values.Name,
                Identity: values.Identity,
                IdentityDate: valuesIdentityDate,
                IdentityPlace: values.IdentityPlace,
                Email: values.Email,
                Mobile: values.Mobile,
                ParentId: values.ParentId,
                BankNumber: values.BankNumber,
                BankBranchName: values.BankBranchName,
                BankId: values.BankId,
                BankOwner: values.BankOwner,
                Password: values.Password,
                RePassword: values.RePassword,
                File: currentImage,
                ParentCode: values.ParentCode

            }
            message.current?.clear();
            // debugger;
            setSubmitted(true);
            // validate
            if (!values.Name || !values.Password || !values.RePassword) {
                return;
            }
            setLoading(true)

            AuthService.Register(valueRequest)
                .then((response: DefaultResponse) => {
                    setSubmitted(false);
                    setLoading(false)
                    setIsRegisterSuccesful(response.status || false)
                    if (response.status == true) {
                        formik.resetForm();
                        setCurrentImage(null);
                        setPreviewImage('');
                        setSubmitted(false)
                        setValue(response.data)
                        setSuccess(false)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã tạo tài khoản thành công', life: 3000 });
                    } else {
                        message.current?.show({
                            severity: 'error', summary: 'Thao tác không thành công', sticky: true, content: (
                                <React.Fragment>
                                    <div className="max-w-[600px]">
                                        {
                                            isJsonString(response.message) ?
                                                Object.keys(response.message).map((key, index) => (
                                                    <div className="ml-2" key={index}>
                                                        {response.message[key].toString()}
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
        }
    });


    const onchangeReLoadBank = (nationId: number | null) => {
        if (nationId != null)
            AuthService.getBank(nationId)
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        var bankIdOptionValues = [];
                        if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                            bankIdOptionValues = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setBanks(bankIdOptionValues);
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

    useEffect(() => {
        AuthService.getRegister().then((response) => {
            let regOptions = []
            let bankOptions = []
            if (response.data.ParentIdOptions && response.data.ParentIdOptions.length > 0) {
                regOptions = response.data.ParentIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
            }
            if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                bankOptions = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
            }
            setParents(regOptions)
            setBanks(bankOptions)

        })
        const params = new URLSearchParams(window.location.search)
        if (params) {
            const parentCode = params.get('collaboratorCode')
            if (parentCode) {
                formik.setFieldValue('ParentCode', parentCode)
            }
        }
    }, [])
    return (
        <div className={containerClassName}>
            <div className='loading' style={{ display: loading ? "block" : "none" }}>
                <div className="loader"></div>
            </div>
            <Toast ref={toast} />
            <div className="login-left login-left-dk">
                <img src="/layout/images/image-illustrator.png" alt='' />
                <div className="table-res">
                    <h2>Chính sách kinh doanh ELITE LIFE - JAPAN</h2>
                    <div className="ct-h3">
                        <h3>1. Người tiêu dùng</h3>
                        <ul>
                            <li>1 combo 3,450,000 VNĐ nhận: 3 hộp chuyển hóa, 3 lọ tinh chất dầu</li>
                            <li>Thưởng tri ân tối đa 200% giá trị combo</li>
                        </ul>
                    </div>
                    <div className="ct-h3">
                        <h3>2. Hoa hồng giới thiệu</h3>
                        <div className="tb-ct-h3">
                            <div className="tb-th">
                                <p className="bg1">DL0</p>
                                <p className="bg2">DL1</p>
                                <p className="bg3">DL2</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg4">4%</p>
                                <p className="bg5">5%</p>
                                <p className="bg6">7%</p>
                            </div>
                        </div>
                    </div>
                    <div className="ct-h3 m-0">
                        <h3>3. Đại lý bán hàng</h3>
                        <div className="tb-ct-h33">
                            <div className="tb-th">
                                <p className="bg1 bg2">STT</p>
                                <p className="bg1 bg3">ĐIỀU KIỆN</p>
                                <p className="bg1 bg4">DOANH SỐ</p>
                                <p className="bg1 bg5">HOA HỒNG</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg2">V0</p>
                                <p className="bg3">3 DL0</p>
                                <p className="bg4">3,450,000</p>
                                <p className="bg5">Đồng chia doanh số</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg2">V1</p>
                                <p className="bg3">3 V0</p>
                                <p className="bg4">DS {'>'}= 69tr</p>
                                <p className="bg5">6%</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg2">V2</p>
                                <p className="bg3">3 V1</p>
                                <p className="bg4">DS {'>'}= 69tr</p>
                                <p className="bg5">3%</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg2">V3</p>
                                <p className="bg3">3 V2</p>
                                <p className="bg4">DS {'>'}= 69tr</p>
                                <p className="bg5">2%</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg2">V4</p>
                                <p className="bg3">3 V3</p>
                                <p className="bg4">DS {'>'}= 69tr</p>
                                <p className="bg5">1%</p>
                            </div>
                            <div className="tb-td">
                                <p className="bg2">V5</p>
                                <p className="bg3">3 V4</p>
                                <p className="bg4">DS {'>'}= 69tr</p>
                                <p className="bg5">1%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="login-right login-right-rg">
                <div className="login-right-mid">
                    <img className='logo' src="/layout/images/logo-login.svg" alt="logo" />
                    {success ? <>
                        <div className="form-login">
                            <h2 className="title-login">ĐĂNG KÝ</h2>
                            <div className='button-register'>
                                <div>
                                    <button className="active" onClick={() =>
                                        setCurrentPage(1)
                                    }>1<span>Thông tin cá nhân</span></button>
                                </div>
                                <div>
                                    <button className={currentPage == 2 || currentPage == 3 || currentPage == 4 ? "active" : ""} onClick={() => {
                                        if (!formik.values.Name || !formik.values.Identity || !formik.values.Email || !formik.values.Mobile) {
                                            setSubmitted(true)
                                            setCurrentPage(1)
                                        }
                                        else {
                                            setSubmitted(false)
                                            setCurrentPage(2)
                                        }
                                    }}>2<span>Thông tin ngân hàng</span></button>
                                </div>
                                <div>
                                    <button className={currentPage == 3 || currentPage == 4 ? "active" : ""} onClick={() => {
                                        if (!formik.values.Name || !formik.values.Identity || !formik.values.Email || !formik.values.Mobile) {
                                            setSubmitted(true)
                                            setCurrentPage(1)
                                        }
                                        else {
                                            setSubmitted(false)
                                            setCurrentPage(3)
                                        }
                                    }}>3<span>Điều khoản & Mật khẩu</span></button>
                                </div>
                                {isKycEnabled ?
                                    <div>
                                        <button className={currentPage == 4 ? "active" : ""} onClick={() => {
                                            if (!formik.values.Name || !formik.values.Identity || !formik.values.Email || !formik.values.Mobile) {
                                                setSubmitted(true)
                                                setCurrentPage(1)
                                            }
                                            else {
                                                setSubmitted(false)
                                                setCurrentPage(4)
                                            }
                                        }}>4<span>KYC</span></button>
                                    </div> : <></>}
                            </div>
                            <div className="form-rg">
                                <form onSubmit={formik.handleSubmit}>
                                    {currentPage == 1 &&
                                        <>
                                            <div className=''>
                                                <label htmlFor="label" className="block mb-2" >Ảnh đại diện</label>
                                                {previewImage !== "" ? (
                                                    <div className="">
                                                        <label htmlFor="fileInput">
                                                            <img className="w-8rem h-8rem" src={previewImage} alt="" />
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
                                                                formik.values.Image ?
                                                                    <img
                                                                        className="w-8rem h-8rem"
                                                                        src={`/image/${formik.values.Image}`}
                                                                        alt=""
                                                                    /> :
                                                                    <img
                                                                        className="w-8rem h-8rem"
                                                                        src={`/demo/images/avatar/icons_login.png`}
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
                                            <div className="mr-input-lg">
                                                <label htmlFor="Name" className="block mb-2 text-left" >Họ tên<span className="text-red-600">*</span></label>
                                                <InputText
                                                    value={formik.values.Name}
                                                    onChange={(e) => formik.setFieldValue('Name', e.target.value)} type="text" className='w-full' />
                                                {submitted && !formik.values.Name && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                            </div>

                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" > Số CMTND/ CCCD/ Hộ chiếu</label>
                                                <InputText
                                                    value={formik.values.Identity}
                                                    onChange={(e) => formik.setFieldValue('Identity', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="integeronly" className="block mb-2 text-left" > Ngày cấp </label>
                                                <Calendar
                                                    showIcon
                                                    id="IdentityDate"
                                                    value={formik.values.IdentityDate}
                                                    onChange={(e) => {
                                                        formik.setFieldValue('IdentityDate', e.target.value);
                                                    }}
                                                    showOnFocus={false}
                                                    dateFormat="dd/mm/yy"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" >Nơi cấp</label>
                                                <InputText
                                                    value={formik.values.IdentityPlace}
                                                    onChange={(e) => formik.setFieldValue('IdentityPlace', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" >Email</label>
                                                <InputText
                                                    value={formik.values.Email}
                                                    onChange={(e) => formik.setFieldValue('Email', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <div className="input-100">
                                                <div className="mr-input-lg">
                                                    <label htmlFor="label" className="block mb-2 text-left" >Số điện thoại</label>
                                                    <InputText
                                                        value={formik.values.Mobile}
                                                        onChange={(e) => formik.setFieldValue('Mobile', e.target.value)} type="text" className='w-full' />

                                                </div>

                                            </div>
                                            <div className='mr-input-lg '>
                                                <label htmlFor="label" className="block mb-2 text-left" > Người giới thiệu </label>
                                                <InputText
                                                    value={formik.values.ParentCode}
                                                    onChange={(e) => formik.setFieldValue('ParentCode', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <Button type='button' label="Tiếp" onClick={() => {
                                                if (!formik.values.Name) {
                                                    setSubmitted(true)
                                                }
                                                else {
                                                    setSubmitted(false)
                                                    setCurrentPage(2)
                                                }
                                            }} className="btn-login" ></Button>
                                            <div className='label-sale'>
                                                <label htmlFor="">Bạn đã có tài khoản? Click để </label><a href="/auth/login">đăng nhập</a>
                                            </div>
                                        </>
                                    }
                                    {currentPage == 2 &&
                                        <>
                                            <div className='mr-input-lg '>
                                                <label htmlFor="label" className="block mb-2 text-left" > Ngân hàng</label>
                                                <Dropdown
                                                    style={{ width: '100%' }}
                                                    virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                                    filter
                                                    inputId="BankId"
                                                    name="BankId"
                                                    value={banks.find(({ code }) => code === formik.values.BankId)}
                                                    options={banks}
                                                    optionLabel="name"
                                                    onChange={(e) => {
                                                        formik.setFieldValue(`BankId`, e.value.code);
                                                    }}
                                                />
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" >Số tài khoản</label>
                                                <InputText
                                                    value={formik.values.BankNumber}
                                                    onChange={(e) => formik.setFieldValue('BankNumber', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" >Chủ tài khoản</label>
                                                <InputText
                                                    value={formik.values.BankOwner}
                                                    onChange={(e) => formik.setFieldValue('BankOwner', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className=" block mb-2 text-left" >Chi nhánh</label>
                                                <InputText
                                                    value={formik.values.BankBranchName}
                                                    onChange={(e) => formik.setFieldValue('BankBranchName', e.target.value)} type="text" className='w-full' />
                                            </div>
                                            <div className="btn-b2">
                                                <Button type='button' label="Quay lại" onClick={() => setCurrentPage(1)} className="btn-rg-ql" ></Button>
                                                <Button type='button' label="Tiếp" onClick={() => {
                                                    setCurrentPage(3)
                                                }} className="btn-login" ></Button>
                                            </div>

                                            <div className='label-sale'>
                                                <label htmlFor="">Bạn đã có tài khoản? Click để </label><a href="/auth/login">đăng nhập</a>
                                            </div>
                                        </>
                                    }
                                    {currentPage == 3 &&
                                        <>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" >Mật khẩu<span className="text-red-600">*</span></label>
                                                <Password feedback={false} inputId="password"
                                                    value={formik.values.Password} onChange={(e) => formik.setFieldValue('Password', e.target.value)} toggleMask className='w-full' inputClassName='w-full'></Password>
                                                {submitted && !formik.values.Password && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                            </div>
                                            <div className="mr-input-lg">
                                                <label htmlFor="label" className="block mb-2 text-left" >Xác nhận mật khẩu<span className="text-red-600">*</span></label>
                                                <Password feedback={false} inputId="repassword"
                                                    value={formik.values.RePassword} onChange={(e) => formik.setFieldValue('RePassword', e.target.value)} toggleMask className='w-full' inputClassName='w-full'></Password>
                                                {submitted && !formik.values.RePassword && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                                            </div>
                                            <div className="btn-b2">
                                                <Button type='button' label="Quay lại" onClick={() => setCurrentPage(2)} className="btn-rg-ql" ></Button>
                                                {isKycEnabled ? <Button type='button' label="Tiếp" onClick={() => {
                                                    setCurrentPage(4)
                                                }} /> : <Button type='submit' label="Đăng ký" className="btn-login" ></Button>}
                                            </div>
                                            <div className='label-sale'>
                                                <label htmlFor="">Bạn đã có tài khoản? Click để </label><a href="/auth/login">đăng nhập</a>
                                            </div>
                                        </>
                                    }
                                    <Messages ref={message} className="max-w-login-mess" />
                                </form>
                            </div>
                        </div>
                    </> : <>
                        <div className="form-login form-login-tc">
                            <img className='img-tc' src="/layout/images/icons_afterRegister.svg" alt='afterReg' />
                            <h2>ĐĂNG KÝ THÀNH CÔNG</h2>
                            <h5>Thông tin tài khoản</h5>
                            <div className='label-tc'>
                                <div>
                                    <label htmlFor="" className="font-bold mb-2 ">Mã số: </label>
                                    <label htmlFor="">{value?.UserName}</label>
                                </div>
                                <div>
                                    <label htmlFor="" className="font-bold mb-2 ">Họ tên: </label>
                                    <label htmlFor="">{value?.Name}</label>
                                </div>
                                <div>
                                    <label htmlFor="" className="font-bold mb-2 ">Email: </label>
                                    <label htmlFor="">{value?.Email}</label>
                                </div>
                                <div>
                                    <label htmlFor="" className="font-bold mb-2 ">Điện thoại: </label>
                                    <label htmlFor="">{value?.Mobile}</label>
                                </div>
                                <div>
                                    <label htmlFor="" className="font-bold mb-2 ">CMTND/ CCCD /HC: </label>
                                    <label htmlFor="">{value?.Identity}</label>
                                </div>

                            </div>
                            <Button type='button' label="Truy cập" onClick={() => router.push('/auth/login')} className="btn-login" ></Button>
                        </div>

                    </>}
                </div>
            </div>
        </div >
    );
};

export default RegisterPage;


