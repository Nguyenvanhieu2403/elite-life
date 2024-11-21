'use client';
import { useRouter } from "next/navigation";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import CollaboratorRankService from '../../../service/CollaboratorRanksService';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { LazyStateObject } from '../../../types/models/filter';
import { isJsonString, processFilter } from '../../../common/common';
import { Messages } from 'primereact/messages';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { CollaboratorRankModal } from '../../../types/models/collaboratorRanks';
import { DialogStyle } from '../../../common/config';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Checkbox } from "primereact/checkbox";


interface AddEditCollaboratorRankProps {
    visible: boolean,
    selectedId: number | null;
    toggleDialog: () => void;
    lazyState: LazyStateObject;
    toggleAction: string;
    onSave: (data: any) => void;
}

const AddEditCollaboratorRank = ({ onSave, visible, toggleDialog, lazyState, selectedId, toggleAction }: AddEditCollaboratorRankProps) => {
    const router = useRouter();
    const message = useRef<Messages>(null);

    const [isEdit, setIsEdit] = useState(false);
    // dialog add and edit
    let emptyCollaboratorRank: CollaboratorRankModal = {
        Id: null,
        Name: '',
        Value: null,
        IsCom: false,
        Level: 0
    };
    const [submitted, setSubmitted] = useState(false);
    const [collaboratorRank, setCollaboratorRank] = useState(emptyCollaboratorRank);

    const toast = useRef<Toast>(null);

    const retrieveCollaboratorRankCallback = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = processFilter(lazyState);
        CollaboratorRankService.get(currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                onSave(response.data);
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
        if (toggleAction == "ADD_EDIT") {
            if (selectedId != null) {
                setIsEdit(true)
                CollaboratorRankService.getDetail(selectedId)
                    .then((response) => {
                        setCollaboratorRank(response.data);
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
                setIsEdit(false);
                setCollaboratorRank(emptyCollaboratorRank);
            }
        }
    }, [selectedId, toggleAction])

    const hideDialog = () => {
        toggleDialog();
        setSubmitted(false);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setCollaboratorRank((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value;
        setCollaboratorRank((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const handleCollaboratorRankAction = () => {
        message.current?.clear();
        setSubmitted(true);
        // validate
        if (!collaboratorRank.Name || collaboratorRank.Value == null) {
            return;
        }
        // isEdit = false : add event
        if (!isEdit) {
            CollaboratorRankService.create(collaboratorRank)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setCollaboratorRank(emptyCollaboratorRank)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã thêm mới thành công', life: 3000 });
                        setSubmitted(false)
                        retrieveCollaboratorRankCallback()
                        hideDialog();
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

            CollaboratorRankService.update(collaboratorRank)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setCollaboratorRank(emptyCollaboratorRank)
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã chỉnh sửa thành công', life: 3000 });
                        setSubmitted(false)
                        retrieveCollaboratorRankCallback()
                        hideDialog();
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
            <Dialog
                visible={visible}
                style={{ width: DialogStyle.width.small }}
                header={isEdit ? "Cập nhật chức danh" : "Thêm chức danh"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={hideDialog}>
                <>
                    <div className="field">
                        <div className=" flex flex-wrap gap-3 p-fluid mb-3 mt-2">
                            <label htmlFor="integeronly" className="font-bold block mb-2" > Tên chức danh <span className="text-red-600">*</span></label>
                            <InputText
                                id="Name"
                                value={collaboratorRank.Name}
                                onChange={(e) => onInputChange(e, 'Name')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !collaboratorRank.Name
                                })}
                            />
                            {submitted && !collaboratorRank.Name && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>
                        <div className=" flex flex-wrap gap-3 p-fluid mb-3 mt-2">
                            <label htmlFor="integeronly" className="font-bold block mb-2" > Hoa hồng trực tiếp <span className="text-red-600">*</span></label>
                            <InputNumber
                                id="Value"
                                value={collaboratorRank.Value}
                                onValueChange={(e) => onInputNumberChange(e, 'Value')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !collaboratorRank.Value
                                })}
                            />
                            {submitted && collaboratorRank.Value == null && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                        </div>
                        <div className=" flex flex-wrap gap-3 p-fluid mb-3 mt-2">
                            <label htmlFor="integeronly" className="font-bold block mb-2" >Cấp bậc</label>
                            <InputNumber
                                id="Value"
                                value={collaboratorRank.Level}
                                onValueChange={(e) => onInputNumberChange(e, 'Level')}
                                autoFocus
                            />
                        </div>
                        <div className="w-49">
                            <label htmlFor="BankBranchName" className="font-bold block mb-2" >Tính hoa hồng</label>
                            <Checkbox onChange={(e) => {
                                var isCom = false;
                                if (e.checked != undefined) {
                                    isCom = e.checked;
                                }

                                setCollaboratorRank((prev) => ({
                                    ...prev,
                                    IsCom: isCom,
                                }));

                            }}
                                checked={collaboratorRank.IsCom}></Checkbox>
                        </div>
                    </div>
                    <div className="flex justify-content-between button-50">
                        <Button className='btn-pri' label="Lưu" onClick={handleCollaboratorRankAction} />
                        <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                    </div>
                    <Messages ref={message} />
                </>
            </Dialog >
        </div >
    );
};

export default AddEditCollaboratorRank;