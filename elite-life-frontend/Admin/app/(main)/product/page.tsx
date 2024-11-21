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
import ProductService from '../../../service/ProductService';
import { DataResponse } from '../../../types/response-data';
import { Product } from '../../../types/models/product';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import moment from 'moment';
import { InputNumber, InputNumberChangeEvent, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, formatNumberWithThousandSeparator, isJsonString, processFilter } from '../../../common/common';
import { useRouter } from 'next/navigation';
import { Action, DropdownSizeLoadding, Permissions } from "../../../common/config";
import { authorizeAccountControllerAction } from '../../../middleware/authorize';
import { Messages } from 'primereact/messages';
import { Dropdown } from 'primereact/dropdown';
import { InputValue, InputValueResponse } from '../../../types/models/dropdownInput';
import { DefaultResponse } from '../../../types/models/defaultResponse';
interface ListType {
    Value: string | null;
}
interface ValidationErrors {
    Name?: string;
    Price?: string;
}
interface DialogState {
    isOpen: boolean;
}
const ProductPage = () => {
    const router = useRouter();
    let emptyList: Product = {
        Id: 0,
        Name: "",
        ProjectId: null,
        Price: 0,
        DiscountPayPeriod1: 0,
        DiscountPayPeriod2: 0,
        DiscountPayPeriod3: 0,
    }
    let initialData = {
        status: true,
        data: [],
        total: 0
    }
    const rows = 10;
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
            "Project.Name": {
                value: null, matchMode: FilterMatchMode.CONTAINS
            },
            IsEnable: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            Price: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            IsEnable: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            DiscountPayPeriod1: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            DiscountPayPeriod2: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            DiscountPayPeriod3: {
                value: null, matchMode: FilterMatchMode.EQUALS
            },
            CreatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [errorMessage, displayErrorMessage] = useState<ValidationErrors>();
    const [listData, setListData] = useState<DataResponse>(initialData);
    const [selectedId, setSelectedId] = useState<number | undefined>();
    const [formValues, setFormValues] = useState(emptyList);
    const dataTableRef = useRef(null);
    const [gridList, setGridList] = useState<Product>(emptyList);

    const [loading1, setLoading1] = useState(true);
    const [dialogStates, setDialogStates] = useState<DialogState[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const dt = useRef<DataTable<Product[]>>(null);

    const [projectIdOptions, setProjectIdOptions] = useState<InputValue[]>([]);
    const [projectIdOptionSelected, setProjectIdOptionSelected] = useState(null);


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
        setProjectIdOptionSelected(null)
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={() => setlazyState(lazyStateDefault)} />
                <div className="flex ">
                    {
                        authorizeAccountControllerAction(Permissions.Product, Action.Add) &&
                        <Button label="Thêm mới" icon="pi pi-plus" severity="help" className=" mr-2" onClick={openNew} />
                    }

                    <Button loading={loading1} label="Xuất Excel" icon="pi pi-upload" severity="success" onClick={() => exportExcel()} />
                </div>
            </div>
        );
    };
    const closeDialogAddAndEdit = () => {
        setSelectedId(undefined);
        hideDialog(1);
        setFormValues(emptyList);
        setSubmitted(false);
        displayErrorMessage({})
    }
    const [first, setFirst] = useState(0);
    const [allGridData, setAllGridData] = useState<DataResponse>(initialData);

    const onPageChange = async (event: PaginatorPageChangeEvent) => {
        let page = event.first / rows + 1
        setFirst(event.first);
        ProductService.get(page, rows, lazyState.filters).then((data) => {
            setListData(data);
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
    };
    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="dd/mm/yy" />;
    };
    const dateBodyTemplate = (rowData: Product) => {
        if (rowData.CreatedAt != undefined) {

            return formatDate(rowData.CreatedAt);
        }
        return "";
    };

    const exportExcel = () => {
        setLoading1(true);
        ProductService.get(1, Number.MAX_SAFE_INTEGER, {}).then((data) => {
            setLoading1(false);
            exportExcelFromGrid(dataTableRef, data.data)
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
        });;
    }
    //end grid
    //add and edit
    const validate = (data: { Name?: string; Price?: number }): ValidationErrors => {
        let errors: ValidationErrors = {};

        if (!data.Name) {
            errors.Name = 'Name is required.';
        }
        if (!data.Price) {
            errors.Price = 'Price is required.';
        }
        displayErrorMessage(errors);
        return errors;
    };
    const message = useRef<Messages>(null);

    const addOrEditProduct = async () => {
        try {
            message.current?.clear();
            let validateData = validate({
                Name: formValues.Name,
                Price: formValues.Price,
            })
            if (Object.values(validateData).length != 0) {
                return;
            }
            console.log(formValues)
            //validate here
            if (selectedId != null) {
                //edit
                ProductService.edit(
                    selectedId,
                    formValues.Name,
                    formValues.Price,
                    formValues.DiscountPayPeriod1,
                    formValues.DiscountPayPeriod2,
                    formValues.DiscountPayPeriod3,
                    formValues.ProjectId,
                ).then(async (res) => {
                    if (res.status == true) {
                        closeDialogAddAndEdit()
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Sửa thành công', life: 3000 });
                        let pageIndex = first / rows + 1
                        ProductService.get(pageIndex, rows, lazyState.filters).then((data) => {
                            setListData(data);

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
                    else {
                        message.current?.show({
                            severity: 'error', summary: 'Thao tác không thành công', sticky: true, content: (
                                <React.Fragment>
                                    <div className="max-w-[900px]">
                                        {
                                            isJsonString(res.message) ?
                                                Object.keys(res.message).map((key, index) => (
                                                    <div className="ml-2" key={index}>
                                                        {res.message[key]}
                                                    </div>
                                                ))
                                                :
                                                <div className="ml-2">{res.message}</div>
                                        }
                                    </div>
                                </React.Fragment>
                            )
                        });
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
            else {
                //add
                ProductService.add(
                    formValues.Name,
                    formValues.Price,
                    formValues.DiscountPayPeriod1,
                    formValues.DiscountPayPeriod2,
                    formValues.DiscountPayPeriod3,
                    formValues.ProjectId,
                ).then(async (res) => {

                    if (res.status == true) {
                        closeDialogAddAndEdit()
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Thêm thành công', life: 3000 });
                        let pageIndex = first / rows + 1
                        ProductService.get(pageIndex, rows, lazyState.filters).then((data) => {
                            setListData(data);

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
                    else {
                        message.current?.show({
                            severity: 'error', summary: 'Thao tác không thành công', sticky: true, content: (
                                <React.Fragment>
                                    <div className="max-w-[900px]">
                                        {
                                            isJsonString(res.message) ?
                                                Object.keys(res.message).map((key, index) => (
                                                    <div className="ml-2" key={index}>
                                                        {res.message[key]}
                                                    </div>
                                                ))
                                                :
                                                <div className="ml-2">{res.message}</div>
                                        }
                                    </div>
                                </React.Fragment>
                            )
                        });
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
    const editProducts = (listData: Product) => {
        setGridList({ ...listData });
        var list = { ...listData };
        showDialog(1);
        setSelectedId(listData.Id)
        setFormValues(listData);
        ProductService.getUpdate(listData.Id)
            .then((response: DefaultResponse) => {
                if (response.status) {
                    var projectIdOptionValues = [];
                    if (response.data.Projects && response.data.Projects.length > 0) {
                        projectIdOptionValues = response.data.Projects.map((item: InputValueResponse) => ({ code: item.Value, name: item.Text }));
                    }
                    setProjectIdOptions(projectIdOptionValues);
                    setProjectIdOptionSelected(response.data.Info.ProjectId)
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
    //delete
    const deleteProduct = (listData: Product) => {
        setSelectedId(listData.Id)
        confirmDialog({
            message: 'Bạn có muốn xóa bản ghi này?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Đồng ý',
            rejectLabel: 'Hủy',
            accept() {
                ProductService.delete(listData.Id).then(async (res) => {

                    if (res.status == true) {
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Xóa thành công', life: 3000 });
                        let pageIndex = first / rows + 1
                        ProductService.get(pageIndex, rows, lazyState.filters).then((data) => {
                            setListData(data);
                            setSelectedId(undefined)
                        })
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
        })
    };

    const reject = () => {
    };
    const confirmLock = (Id: number) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn Disable?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            accept() {
                ProductService.disable(Id)
                    .then((response: DefaultResponse) => {
                        if (!response.status) {
                            toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
                        } else {
                            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã Disable thành công', life: 3000 });
                            retrieveProduct();
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
    const confirmUnLock = (Id: number) => {
        confirmDialog({
            message: 'Bạn có chắc chắn muốn Enable?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            accept() {
                ProductService.enable(Id)
                    .then((response: DefaultResponse) => {
                        if (!response.status) {
                            toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
                        } else {
                            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã Enable thành công', life: 3000 });
                            retrieveProduct();
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
    const renderAction = (rowData: Product) => {
        return <div className='flex justify-content-center flex-wrap'>
            {
                authorizeAccountControllerAction(Permissions.Product, Action.Add) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => editProducts(rowData)} tooltip='Sửa' />
            }
            {
                authorizeAccountControllerAction(Permissions.Product, Action.Lock) &&
                <Button
                    severity="success"
                    style={{ marginLeft: "5px", borderRadius: "50%" }}
                    icon={rowData.IsEnable ? "pi pi-lock" : "pi pi-unlock"}
                    onClick={() => rowData.IsEnable ? confirmLock(rowData.Id) : confirmUnLock(rowData.Id)}
                    tooltip={rowData.IsEnable ? 'Enable' : 'Disable'}
                />
            }

        </div>
    }
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
        const val = (e.target && e.target.value) || 0;
        setGridList((prev) => ({
            ...prev,
            [name]: val,
        }));
        setFormValues((prevValues) => ({ ...prevValues, [name]: val }));
    };
    const onFilter = (event: any) => {
        setFirst(0);
        setlazyState(event);
    }
    const onPage = (event: any) => {
        setlazyState(event);
    };
    const retrieveProduct = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = processFilter(lazyState);
        ProductService.get(currentPage, rows, filterProcess).then((data) => {
            setListData(data);
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
        setLoading1(false);
        retrieveProduct()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyState]);
    const toast = useRef<Toast>(null);
    const isEnableFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        const isEnableOptions = [
            { label: 'Enable', value: "true" },
            { label: 'Disable', value: "false" }
        ];
        return (
            <Dropdown
                value={options.value}
                options={isEnableOptions}
                onChange={(e) => {
                    console.log(e.value);
                    options.filterApplyCallback(e.value);
                }}
                className="p-column-filter"
                showClear
            />
        );
    };
    return (
        <div className="card">
            <div className=' col-12'>
                <h3>Danh mục sản phẩm</h3>
            </div>
            <div className="col-12">

                <Toast ref={toast} />
                <ConfirmDialog />

                <DataTable
                    value={listData.data}
                    lazy
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    currentPageReportTemplate="{first} - {last} of {totalRecords} items"
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
                    header={renderHeader()}
                >
                    <Column
                        header="Thao tác" body={renderAction}
                        style={{ minWidth: '100px' }}
                        exportable={false}
                    ></Column>
                    <Column field="Name" header="Tên sản phẩm" filter showFilterMenu={false} style={{ minWidth: '12rem' }} />

                    <Column field="Price"
                        header="Giá sản phẩm" filter
                        showFilterMenu={false}
                        body={(rowData) => {
                            return rowData.Price ? formatNumberWithThousandSeparator(rowData.Price) : "";
                        }}
                    />

                </DataTable>
                <Paginator first={first} rows={rows} totalRecords={listData.total} onPageChange={onPageChange} />
            </div>
            <Dialog
                header={`Danh mục sản phẩm`}
                visible={dialogStates[1]?.isOpen || false}
                style={{ width: '650px' }}
                onHide={closeDialogAddAndEdit}
                footer={
                    <div>
                        <div className="flex justify-content-between button-50">
                            <Button className='btn-pri' label="Lưu" onClick={addOrEditProduct}></Button>
                            <Button className='btn-sec' label="Bỏ qua" onClick={closeDialogAddAndEdit}></Button>
                        </div>
                    </div>
                }
                blockScroll
                draggable={false}
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Name">Tên sản phẩm <span className="text-red-600">*</span> </label>
                        <InputText id="Name" type="text" value={gridList.Name} onChange={(e) => onInputChange(e, 'Name')} className={errorMessage?.Name ? 'p-invalid' : ''} />
                        {errorMessage?.Name ? (
                            <small className="p-invalid">{errorMessage.Name}</small>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="Price">Giá sản phẩm <span className="text-red-600">*</span></label>
                        <InputNumber id="Number1" value={gridList.Price} onValueChange={(e) => onInputNumberChange(e, 'Price')} className={errorMessage?.Price ? 'p-invalid' : ''} />
                        {errorMessage?.Price ? (
                            <small className="p-invalid">{errorMessage.Price}</small>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                <Messages ref={message} />
            </Dialog>
        </div>
    );
};
export default ProductPage;