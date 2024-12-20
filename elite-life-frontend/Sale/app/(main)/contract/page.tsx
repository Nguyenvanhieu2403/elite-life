'use client';
import { useRouter } from "next/navigation";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, formatNumberWithThousandSeparator, processFilter } from '../../../common/common';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import SystemService from '../../../service/SystemService';
import { Tree } from "primereact/tree";
import { catchAxiosError } from "../../../common/commonTSX";
import { classNames } from "primereact/utils";
import ContractService from "../../../service/ContractService";
import { Dialog } from "primereact/dialog";
import { DialogStyle } from "../../../common/config";
import SignatureCanvas from 'react-signature-canvas'
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { ProgressSpinner } from "primereact/progressspinner";
import saveAs from "file-saver";
import axios from "axios";

export interface CollabContractResponse {
    Name: string,
    Identity: string,
    IdentityDate: string,
    IdentityPlace: string,
    Address: string,
    ImageSign: File | null
}

interface PdfResponse {
    Contract: any;
    ImageSign: string | null,
    PdfPath: string,
    HtmlPath: string | null
}
const System = () => {
    const [pdf, setPdf] = useState<PdfResponse>({
        ImageSign: null,
        PdfPath: "",
        HtmlPath: null,
        Contract: null
    });
    const sigPad = useRef<SignatureCanvas>(null)
    const [trimmedSignature, setTrimmedSignature] = useState<any>()
    const [showDialog, setShowDialog] = useState<boolean>(false)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const router = useRouter();
    const toast = useRef<Toast>(null)
    const [identityDate, setIdentityDate] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const base64ToBlob = (base64: string, mime: string = 'image/png') => {
        const byteString = atob(base64.split(',')[1]); // Remove the data URL part
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
    };

    const base64ToFile = (base64: string, filename: string, mime: string = 'image/png') => {
        const blob = base64ToBlob(base64, mime);
        return new File([blob], filename, { type: mime });
    };

    const getSignature = () => {
        if (sigPad.current) {
            const trimmed = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
            setTrimmedSignature(trimmed);
        } else {
            console.log("SignaturePad is not initialized.");
        }
    };
    const clearSignature = () => {
        if (sigPad.current) {
            const trimmed = sigPad.current.clear()
            setTrimmedSignature(null);
        } else {
            console.log("SignaturePad is not initialized.");
        }
    };
    const [collaborator, setCollaborator] = useState<CollabContractResponse>({
        Address: "",
        Identity: "",
        IdentityDate: "",
        IdentityPlace: "",
        ImageSign: null,
        Name: ""
    })
    const handleSignContract = () => {
        setSubmitted(true)
        if (!collaborator.Address || !collaborator.Identity || !collaborator.IdentityDate || !collaborator.IdentityPlace
            || !collaborator.Name
        ) {
            return false;
        }
        if (sigPad.current) {
            if (!trimmedSignature) {
                toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Bạn chưa có chữ kí', life: 3000 });
                return;
            };
        }
        setLoading(true)
        const signatureFile = base64ToFile(trimmedSignature, 'signature.png');
        collaborator.ImageSign = signatureFile
        collaborator.IdentityDate = moment(collaborator.IdentityDate).format("DD/MM/YYYY");
        ContractService.mailMerge(collaborator).then((response: DefaultResponse) => {
            if (response.status == true) {
                setLoading(false)
                setShowDialog(false);
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã kí thành công', life: 3000 });

                window.location.reload();
            }
        }).catch(
            (e) => catchAxiosError({ e, router, toast })
        )
    }
    const fetchContract = () => {
        setLoading(true)
        ContractService.get().then((response: DefaultResponse) => {
            console.log(response)
            if (response.status) {
                setLoading(false)
                setPdf(response.data)
            }
        }).catch(
            (e) => catchAxiosError({ e, router, toast })
        )
    }
    useEffect(() => {
        fetchContract()
        console.log("SignaturePad initialized", sigPad.current);

    }, [])
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setCollaborator((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const hideDialog = () => {
        setShowDialog(false)
    }
    const downloadPdf = async () => {
        setLoading(true); // Bắt đầu tải, cập nhật trạng thái loading

        try {
            // Gọi API download hợp đồng
            const response = await ContractService.download();

            // Kiểm tra nếu response chứa dữ liệu hợp lệ
            if (response) {
                // Tạo đối tượng Blob từ dữ liệu PDF
                const blob = new Blob([response], { type: 'application/pdf' });

                // Tạo URL tạm thời cho Blob
                const downloadUrl = URL.createObjectURL(blob);

                // Tạo thẻ <a> để trigger việc tải file
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'contract.docx'; // Tên file tải về
                link.click(); // Bắt đầu tải file

                // Thông báo thành công
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Tải hợp đồng thành công!', life: 3000 });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Tải hợp đồng thất bại!', life: 3000 });
            }
        } catch (error) {
            // Nếu có lỗi xảy ra trong quá trình tải
            toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Tải hợp đồng thất bại!', life: 3000 });
            console.error(error);
        } finally {
            setLoading(false); // Kết thúc việc tải, cập nhật lại trạng thái loading
        }
    }

    
    return (
        <>
            <Toast ref={toast} />
            <div id="loading" className="loading" style={{ display: loading == true ? "block" : "none" }}>
                <ProgressSpinner />
            </div>
            <div className="card">
                <h3>Hợp đồng đại lý</h3>
                {
                    pdf.HtmlPath != "" ? <React.Fragment>
                        {
                            pdf.HtmlPath && <div className="contractSection" dangerouslySetInnerHTML={{ __html: pdf.HtmlPath }} />
                        }
                    </React.Fragment> : ""
                }
                
                <div className="d-flex">
                    <div className="w-49" style={{ paddingRight: 15 }}>
                        <h3>Bên B</h3>
                        {pdf.ImageSign == null ? <Button onClick={() => {
                            setShowDialog(true)
                            const storage = localStorage.getItem("Info");
                            if (storage) {
                                const parsed = JSON.parse(storage)
                                setCollaborator({
                                    Address: parsed.Address,
                                    Identity: parsed.Identity,
                                    IdentityDate: new Date(parsed.IdentityDate).toString(),
                                    IdentityPlace: parsed.IdentityPlace,
                                    ImageSign: null,
                                    Name: parsed.Name
                                })
                                setIdentityDate(new Date(parsed.IdentityDate).toString())
                            }
                        }}>Kí hợp đồng</Button> :
                            <>
                                <b>                                {pdf.Contract && <p> Hà Nội, ngày {moment(pdf.Contract.CreatedAt).get('D')} tháng {moment(pdf.Contract.CreatedAt).get('month') + 1} năm {moment(pdf.Contract.CreatedAt).get('year')} </p>}
                                </b>
                                <img src={`/image/${pdf.ImageSign}`} alt="signature" style={{ maxWidth: "100%" }} />
                                <p>  {pdf.Contract && pdf.Contract.Name}</p>
                            </>

                        }
                        
                    </div>
                    
                    <div className="w-49" style={{ paddingLeft: 15 }}>
                        <h3>Bên A</h3>
                        <p>CÔNG TY TNHH NGHIÊN CỨU VÀ SẢN XUẤT SINH HỌC HANA, THỰC THUỘC CTY CP TẬP ĐOÀN ELITE LIFE - JAPAN.</p>
                        <p>Mã số doanh nghiệp: 0901155104, cấp ngày 15 tháng 02 năm 2024.</p>
                        <p>Đại diện: Ông LƯƠNG VĂN NGHỊ.</p>
                        <p>Chức vụ: Tổng giám đốc</p>
                        <p>Điện thoại: 0909679955</p>
                    </div>


                </div>
            <Button label="Tải hợp đồng" icon="pi pi-download" onClick={downloadPdf} />
            </div>
            <Dialog visible={showDialog}
                style={{ width: DialogStyle.width.medium, height: DialogStyle.height.medium }}
                header="Kí hợp đồng"
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={hideDialog}>
                <>
                    <div className='p-fluid formgrid grid col-12'>
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
                            <label htmlFor="Address" className="font-bold block mb-2" >Địa chỉ <span className="text-red-600">*</span></label>
                            <InputText
                                id="Address"
                                value={collaborator.Address}
                                onChange={(e) => onInputChange(e, 'Address')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !collaborator.Address
                                })}
                            />
                            {submitted && !collaborator.Address && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>
                        <div className="field col-12 sm:col-6">
                            <label htmlFor="Identity" className="font-bold block mb-2" > CMTND/ CCCD/ HC  <span className="text-red-600">*</span></label>
                            <InputText
                                id="Identity"
                                value={collaborator.Identity}
                                onChange={(e) => onInputChange(e, 'Identity')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !collaborator.Identity
                                })}
                            />
                            {submitted && !collaborator.Identity && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                        </div>
                        <div className="field col-12 sm:col-6">
                            <label htmlFor="Email" className="font-bold block mb-2" > Ngày cấp <span className="text-red-600">*</span> </label>
                            <Calendar
                                inputId="IdentityDate"
                                maxDate={moment().toDate()}
                                name="IdentityDate"
                                value={identityDate ? new Date(identityDate?.toString()) : ""}
                                onChange={(e) => {
                                    if (e.value) {

                                        setIdentityDate(e.value);
                                        setCollaborator((prev) => ({
                                            ...prev,
                                            ["IdentityDate"]: formatDate((e as any).value),
                                        }));
                                    }
                                }
                                }
                                className={classNames({
                                    'p-invalid': submitted && !collaborator.IdentityDate
                                })}
                                showIcon
                                dateFormat="dd/mm/yy"

                                showOnFocus={false}
                            />
                            {submitted && !collaborator.IdentityDate && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                        </div>
                        <div className="field col-12 sm:col-6">
                            <label htmlFor="IdentityPlace" className="font-bold block mb-2" > Nơi cấp <span className="text-red-600">*</span> </label>
                            <InputText
                                id="IdentityPlace"
                                value={collaborator.IdentityPlace}
                                onChange={(e) => onInputChange(e, 'IdentityPlace')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !collaborator.IdentityPlace
                                })}
                            />
                            {submitted && !collaborator.IdentityPlace && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                        </div>


                    </div>
                    <div className='p-fluid formgrid grid col-12'>
                        <div className="field col-12 lg:col-6">
                            <label htmlFor="" className="font-bold block mb-2" > Chữ ký <span className="text-red-600">*</span></label>
                            <SignatureCanvas penColor='black' ref={sigPad}
                                canvasProps={{ className: 'sigCanvas' }}

                            />
                            <div className="p-fluid formgrid grid col-12 md:col-12">
                                <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                                    <Button className="btn-pri d-flex justify-content-center" onClick={() => {
                                        getSignature()
                                    }
                                    }>Xác nhận chữ kí</Button>
                                    <Button className="btn-sec d-flex justify-content-center" onClick={() => {
                                        clearSignature()
                                    }
                                    }>Clear</Button>
                                </div>
                            </div>
                        </div>
                        <div className="field col-12 sm:col-6">
                            <label htmlFor="" className="font-bold block mb-2" >Xác nhận chữ ký</label>
                            <div className="sigCanvas">
                                {
                                    trimmedSignature ? <img src={trimmedSignature} alt="trimmedImage" /> : ""
                                }
                            </div>

                        </div>
                    </div>
                    <div className="p-fluid formgrid grid col-12 md:col-12">
                        <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                            <Button className='btn-pri' label="Lưu" onClick={handleSignContract} />
                            <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                        </div>
                    </div>
                </>
            </Dialog>
        </>
    );
};

export default System;
