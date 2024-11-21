'use client';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import React, { useEffect, useState, useRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import CustomDropDown from '../../CommonComponent/CustomDropdown';
import OtherListService from '../../../service/OtherListService';
import { DataResponse } from '../../../types/response-data';
import { OtherListData } from '../../../types/models/other-lists';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import moment from 'moment';
import { InputNumber, InputNumberChangeEvent, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { processFilter, exportExcelFromGrid, formatDate } from '../../../common/common';
import { useRouter } from 'next/navigation';
import { Action, Permissions } from "../../../common/config";
import { authorizeAccountControllerAction } from '../../../middleware/authorize';
import { Dropdown } from 'primereact/dropdown';
interface ListType {
    Text: string,
    Value: string | null;
}
interface ValidationErrors {
    Type?: string;
    Name?: string;
    Code?: string;
}

enum OtherListsEnum {
    TeacherType = "Loại giáo viên",
    AttendanceStatus = "Trạng thái điểm danh",
    LearnDate = "Ngày học",
    ScheduleType = "Loại lịch trình",
    ForeignAffairsLocation = "Vị trí đối ngoại",
    ForeignAffairsTeam = "Đội đối ngoại",
    LanguageDegree = "Bằng ngoại ngữ",
    StudentGroups = "Nhóm ngành nghề",
    PartnerType = "Phân loại đối tác",
    NationType = "Quốc gia",
    StudyStatusType = "Trạng thái học",
    StudentsTemporaryType = "Trạng thái học viên"
}
const translationMapping: { [key: string]: OtherListsEnum } = {
    TeacherType: OtherListsEnum.TeacherType,
    AttendanceStatus: OtherListsEnum.AttendanceStatus,
    LearnDate: OtherListsEnum.LearnDate,
    ScheduleType: OtherListsEnum.ScheduleType,
    ForeignAffairsLocation: OtherListsEnum.ForeignAffairsLocation,
    ForeignAffairsTeam: OtherListsEnum.ForeignAffairsTeam,
    LanguageDegree: OtherListsEnum.LanguageDegree,
    StudentGroups: OtherListsEnum.StudentGroups,
    PartnerType: OtherListsEnum.PartnerType,
    NationType: OtherListsEnum.NationType,
    StudyStatusType: OtherListsEnum.StudyStatusType,
    StudentsTemporaryType: OtherListsEnum.StudentsTemporaryType
};

interface DialogState {
    isOpen: boolean;
}
const OtherListPage = () => {
    const rows = 10;
    const router = useRouter();
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: rows,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            Name: {
                value: null, matchMode: FilterMatchMode.CONTAINS
            },
            Code: {
                value: null, matchMode: FilterMatchMode.CONTAINS
            },
            Note: {
                value: null, matchMode: FilterMatchMode.CONTAINS
            },
            Ord: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    let emptyList: OtherListData = {
        Name: "",
        Code: "",
        Id: 0,
        Ord: 0,
        Type: "",
        Number1: 0,
        Number2: 0,
    }
    let initialData = {
        status: true,
        data: [],
        total: 0
    }
    const dataTableRef = useRef(null);
    const fileUploadRef = useRef<FileUpload | null>(null);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [errorMessage, displayErrorMessage] = useState<ValidationErrors>();
    const [selectedList, setSelectedList] = useState<ListType | null>(null);
    const [selectedListOnDialog, setSelectedListOnDialog] = useState<{ Value: string; Text: string; } | null>();
    const [listData, setListData] = useState<DataResponse>(initialData);
    const [selectedId, setSelectedId] = useState<number | undefined>();
    const [formValues, setFormValues] = useState(emptyList);
    const [gridList, setGridList] = useState<OtherListData>(emptyList);
    const [loading1, setLoading1] = useState(true);
    const [dialogStates, setDialogStates] = useState<DialogState[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [allGridData, setAllGridData] = useState<DataResponse>(initialData);
    //grid
    const showDialog = (index: number) => {
        const newStates = [...dialogStates];
        newStates[index] = { isOpen: true };
        setDialogStates(newStates);
    };
    const hideDialog = (index: number) => {
        const newStates = [...dialogStates];
        newStates[index] = { isOpen: false };
        setDialogStates(newStates);
    };
    const closeDialogAddAndEdit = () => {
        setSelectedListOnDialog(null);
        setSelectedId(undefined);
        hideDialog(1);
        setFormValues(emptyList);
        setSubmitted(false);
        displayErrorMessage({})
    }

    const rightToolbarTemplate = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setlazyState(lazyStateDefault)} />
                <div className="flex">
                    {
                        authorizeAccountControllerAction(Permissions.OtherList, Action.Add) &&
                        <Button label="Thêm mới" icon="pi pi-plus" severity="help" className=" mr-2" onClick={openNew} />
                    }
                    <Button loading={loading1} label="Xuất Excel" icon="pi pi-upload" severity="success" className="mr-2" onClick={() => exportExcel()} />
                    {
                        authorizeAccountControllerAction(Permissions.OtherList, Action.Import) &&
                        <FileUpload
                            mode="basic"
                            customUpload={true}
                            uploadHandler={importUploadHandler}
                            accept=".csv,.xlsx"
                            maxFileSize={1000000}
                            chooseLabel="Nhập file mẫu"
                            ref={fileUploadRef}
                            className="inline-block"
                        />
                    }
                </div>
            </div>
        );
    };

    const exportExcel = () => {
        setLoading1(true);
        if (selectedList?.Value != null) {
            getOtherListItem(selectedList, 1, lazyState.filters)?.then((data) => {
                setLoading1(false);
                exportExcelFromGrid(dataTableRef, data.data)
            });
        }
    }

    const getOtherListItem = (selectedItem: ListType, page: number, filter: LazyStateFilterObject) => {
        if (selectedItem.Value != null) {
            return OtherListService.get(selectedItem.Value, page, rows, filter).then((data) => {
                return data;
            }).catch((e) => {
                console.log(e);
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
    }

    const [first, setFirst] = useState(0);
    const [list, getOtherLists] = useState<OtherListData[]>([]);
    const onPageChange = async (event: PaginatorPageChangeEvent) => {
        let page = event.first / 10 + 1
        setFirst(event.first);
        if (selectedList != null) {
            getOtherListItem(selectedList, page, lazyState.filters)?.then((data) => setListData(data));

        }
    };
    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="dd/mm/yy" />;
    };
    const dateBodyTemplate = (rowData: OtherListData) => {
        return formatDate(rowData.CreatedAt);
    };
    const importUploadHandler = (event: FileUploadHandlerEvent) => {
        const { files } = event;
        if (files && files.length > 0) {
            const file: File = files[0];
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                if (e.target && e.target.result) {
                    const dataUrl: string = e.target.result as string;
                    if (selectedList?.Value != null) {
                        importCSV(selectedList?.Value, dataUrl)
                        if (fileUploadRef.current) {
                            fileUploadRef.current.clear();
                        }
                    }
                }
            };
            fileReader.readAsDataURL(file);
        }
    };
    const importCSV = (type: string, file: string) => {
        OtherListService.import(type, file).then(async (res) => {
            if (res.status == true) {
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Import thành công', life: 3000 });
                let pageIndex = first / 10 + 1
                if (selectedList != null) {
                    getOtherListItem(selectedList, pageIndex, lazyState.filters)?.then((data) => setListData(data));

                }
            }
        }).catch((e) => {
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
    //end grid
    //add and edit
    const validate = (data: { Name?: string; Code?: string; Type?: string }): ValidationErrors => {
        let errors: ValidationErrors = {};
        if (!data.Name) {
            errors.Name = 'Tên không được để trống.';
        }
        if (!data.Code) {
            errors.Code = 'Mã không được để trống.';
        }
        if (!data.Type) {
            errors.Type = 'Type không được để trống.';
        }
        displayErrorMessage(errors);
        return errors;
    };

    const addOrEditOtherList = async () => {
        try {
            let validateData = validate({
                Type: selectedListOnDialog?.Value ?? "",
                Code: formValues.Code,
                Name: formValues.Name,
            })
            if (Object.values(validateData).length != 0) {
                return;
            }
            //validate here
            if (selectedId != null) {
                //edit
                OtherListService.edit(
                    selectedId,
                    selectedListOnDialog?.Value ?? "",
                    formValues.Code,
                    formValues.Name,
                    formValues.Number1,
                    formValues.Number2,
                    formValues.String1,
                    formValues.String2,
                    formValues.Note,
                    formValues.Ord
                ).then(async (res) => {
                    if (res.status == true) {
                        closeDialogAddAndEdit()
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Sửa thành công', life: 3000 });
                        let pageIndex = first / 10 + 1
                        if (selectedList != null) {
                            getOtherListItem(selectedList, pageIndex, lazyState.filters)?.then((data) => setListData(data));

                        }
                    }
                }).catch((e) => {
                    console.log(e);
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
            else {
                //add
                OtherListService.add(
                    selectedListOnDialog?.Value ?? "",
                    formValues.Code,
                    formValues.Name,
                    formValues.Number1,
                    formValues.Number2,
                    formValues.String1,
                    formValues.String2,
                    formValues.Note,
                    formValues.Ord
                ).then(async (res) => {
                    if (res.status == true) {
                        closeDialogAddAndEdit()
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Thêm thành công', life: 3000 });
                        let pageIndex = first / 10 + 1
                        if (selectedList != null) {
                            getOtherListItem(selectedList, pageIndex, lazyState.filters)?.then((data) => setListData(data));

                        }
                    }
                }).catch((e) => {
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
        } catch (error) {
            console.log(error);
        }
    }
    //edit
    const editOtherLists = (listData: OtherListData) => {
        setGridList({ ...listData });
        var list = { ...listData };
        var type = {
            "Value": list.Type,
            "Text": list.Type,
        }
        setSelectedId(listData.Id);
        setSelectedListOnDialog(type);
        showDialog(1);
        setFormValues(listData);
    };
    //delete
    const deleteOtherList = (listData: OtherListData) => {
        setSelectedId(listData.Id)
        const Type = selectedList?.Value ?? ""
        confirmDialog({
            message: 'Bạn có muốn xóa bản ghi này?',
            header: 'Xác nhận',
            acceptLabel: 'Đồng ý',
            rejectLabel: 'Hủy',
            icon: 'pi pi-exclamation-triangle',
            accept() {
                OtherListService.deleteListItem(listData.Id, Type).then(async (res) => {
                    if (res.status == true) {
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Xóa thành công', life: 3000 });
                        let pageIndex = first / 10 + 1
                        let data = await OtherListService.get(selectedList?.Value as string, pageIndex, 10, lazyState.filters)
                        setListData(data);
                        setSelectedId(undefined)
                    }
                }).catch((e) => {
                    console.log(e);
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
        })
    };
    const openNew = () => {
        setGridList(emptyList);
        setSubmitted(false);
        showDialog(1)
    };
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setGridList((prev) => ({
            ...prev,
            [name]: val,
        }));
        setFormValues((prevValues) => ({ ...prevValues, [name]: val }));
    };
    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = (e.target && e.target.value) || '';
        setGridList((prev) => ({
            ...prev,
            [name]: val,
        }));
        setFormValues((prevValues) => ({ ...prevValues, [name]: val }));
    };

    const clearFilter = () => {
        setlazyState(lazyStateDefault);
    };

    const onFilter = (event: any) => {
        setFirst(0);
        setlazyState(event);
    }
    const onPage = (event: any) => {
        setlazyState(event);
    };

    const getListData = (selectedItem: ListType, page: number, filter: LazyStateFilterObject) => {
        // console.log(list)
        // console.log(selectedItem)
        // var item = (list as any).find((item: any) => item.Value === selectedItem);
        // console.log(item)
        setSelectedList(selectedItem)
        getOtherListItem(selectedItem, page, filter)?.then((data) => setListData(data));
    }

    useEffect(() => {
        setLoading1(false);
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = processFilter(lazyState);
        const initialFormLoad = async () => {
            if (list.length <= 0) {

                OtherListService.getOtherList().then((data) => {

                    if (data.data.length > 0) {
                        const translatedOptions = data.data.map((option: ListType) => ({
                            Text: translationMapping[(option.Text as any)] || option.Text,
                            Value: option.Value
                        }));
                        getOtherLists(translatedOptions)
                        setSelectedList(translatedOptions[0])
                        getOtherListItem(data.data[0], currentPage, filterProcess)?.then((data) => setListData(data))
                    }
                }).catch((e) => {
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
            if (selectedList?.Value != undefined) {
                getOtherListItem(selectedList, currentPage, filterProcess)?.then((data) => setListData(data))
            }
        }
        initialFormLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyState])

    const toast = useRef<Toast>(null);
    return (
        <div className="card">
            <h3>Danh mục khác</h3>

            <Toast ref={toast} />
            <ConfirmDialog />
            <div className='flex align-items-end flex-wrap mb-2'>
                <div className="field">
                    <label htmlFor="Name" className="font-bold block mb-2" >Danh sách:</label>
                    <Dropdown
                        value={selectedList}
                        onChange={(e) => getListData(e.value, 1, lazyState.filters)}
                        options={list}
                        optionLabel="Text"
                        placeholder="Chọn danh mục"
                        filter
                        style={{ minWidth: '200px' }}
                        className="w-full"
                    />
                </div>

            </div>
            <DataTable
                value={listData.data}
                lazy
                ref={dataTableRef}
                totalRecords={listData.total}
                rows={lazyState.rows}
                first={lazyState.first}
                onFilter={onFilter}
                onPage={onPage}
                className="p-datatable-gridlines"
                dataKey="Id"
                filterDisplay="row"
                filters={lazyState.filters}
                loading={loading1}
                emptyMessage="Không có bản ghi nào."
                header={rightToolbarTemplate}

            >
                <Column
                    header="Thao tác" exportable={false} body={(rowData: OtherListData) =>
                        <div className='flex justify-content-center flex-wrap'>
                            {
                                authorizeAccountControllerAction(Permissions.OtherList, Action.Update) &&
                                <Button tooltip='Sửa' style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => editOtherLists(rowData)} />
                            }
                            {
                                authorizeAccountControllerAction(Permissions.OtherList, Action.Delete) &&
                                <Button tooltip='Xóa' style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => deleteOtherList(rowData)} />
                            }


                        </div>
                    }
                    style={{ minWidth: '100px' }}
                ></Column>
                <Column field="Code"
                    header="Code" filter
                    showFilterMenu={false}
                />
                <Column field="Name" header="Name" filter showFilterMenu={false} style={{ minWidth: '12rem' }} />
                <Column field="Note"
                    header="Note" filter
                    showFilterMenu={false}
                />
                <Column field="Ord" showFilterMenu={false}
                    header="Order" filter
                />
                <Column header="Created Date" filterField="CreatedAt" showFilterMenu={false} field='CreatedAt' dataType="date" body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
            </DataTable>
            <Paginator first={first} rows={rows} totalRecords={listData.total} onPageChange={onPageChange} />
            <Dialog
                header={`Danh mục khác`}
                visible={dialogStates[1]?.isOpen || false}
                style={{ width: '650px' }}
                onHide={closeDialogAddAndEdit}
                footer={
                    <div>
                        <div className="flex justify-content-between button-50">
                            <Button className='btn-pri' label="Lưu" onClick={addOrEditOtherList}></Button>
                            <Button className='btn-sec' label="Bỏ qua" onClick={closeDialogAddAndEdit}></Button>
                        </div>
                    </div>
                }
                blockScroll
                draggable={false}
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Type">Type*</label>
                        <CustomDropDown
                            value={selectedListOnDialog}
                            onChange={(e) => setSelectedListOnDialog(e.value)}
                            options={list}
                            optionLabel="Text"
                            placeholder="Chọn danh mục*"
                            filter
                            className={`w-full ${errorMessage?.Type ? 'p-invalid' : ''}`}
                        />
                        {errorMessage?.Type ? (
                            <small className="p-invalid">{errorMessage.Type}</small>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Name">Name*</label>
                        <InputText id="Name" type="text" value={gridList.Name} onChange={(e) => onInputChange(e, 'Name')} className={errorMessage?.Name ? 'p-invalid' : ''} />
                        {errorMessage?.Name ? (
                            <small className="p-invalid">{errorMessage.Name}</small>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Code">Code*</label>
                        <InputText id="Code" type="text" value={gridList.Code} onChange={(e) => onInputChange(e, 'Code')} className={`${errorMessage?.Code ? 'p-invalid' : ''}`} />
                        {errorMessage?.Code ? (
                            <small className="p-invalid">{errorMessage.Code}</small>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Note">Note</label>
                        <InputText id="Note" type="text" value={gridList?.Note || ""} onChange={(e) => onInputChange(e, 'Note')} />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Ord">Order</label>
                        <InputNumber id="Ord" value={gridList?.Ord} onValueChange={(e) => onInputNumberChange(e, 'Ord')} />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Number1">Number1</label>
                        <InputNumber id="Number1" value={gridList?.Number1} onValueChange={(e) => onInputNumberChange(e, 'Number1')} />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Number2">Number2</label>
                        <InputNumber id="Number2" value={gridList?.Number2} onValueChange={(e) => onInputNumberChange(e, 'Number2')} />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="String1">String1</label>
                        <InputText id="String1" type="text" value={gridList?.String1 || ""} onChange={(e) => onInputChange(e, 'String1')} />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="String2">String2</label>
                        <InputText id="String2" type="text" value={gridList?.String2 || ""} onChange={(e) => onInputChange(e, 'String2')} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
export default OtherListPage;