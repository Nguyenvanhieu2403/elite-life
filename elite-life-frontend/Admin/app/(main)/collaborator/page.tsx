'use client';
import { useRouter } from "next/navigation";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressBar } from 'primereact/progressbar';
import { Slider } from 'primereact/slider';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import moment from "moment";
import { Dialog } from 'primereact/dialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, formatNumberWithThousandSeparator, isJsonString, processFilter, WalletTypeEnums } from '../../../common/common';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import { Image } from 'primereact/image';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import { UserModal } from '../../../types/models/user';
import { InputValue, InputValueResponse } from '../../../types/models/dropdownInput';
import { Password } from 'primereact/password';
import CollaboratorService from '../../../service/CollaboratorService';
import { CollaboratorModal, Collaborators, FileItem, FileType, TreeView } from '../../../types/models/collaborators';
import { Tree } from 'primereact/tree';
import { Avatar } from 'primereact/avatar';
import { Action, DialogStyle, DropdownSizeLoadding, Permissions } from '../../../common/config';
import { SplitButton } from 'primereact/splitbutton';
import { authorizeAccountControllerAction } from "../../../middleware/authorize";
import { RadioButtonChangeEvent } from "primereact/radiobutton";
import { catchAxiosError } from "../../../common/commonTSX";
import DepositHistoryDialog from "./DepositHistoryDialog";
import { OrderDetailItem } from "../../../types/models/orders";

const Collaborator = () => {
    const router = useRouter();
    const imageURL = process.env.PortImage;
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
            ContractNumber: { value: null, matchMode: FilterMatchMode.EQUALS },
            UserName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Org.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Rank.Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            Email: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Mobile: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Address: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Identity: { value: null, matchMode: FilterMatchMode.CONTAINS },
            IdentityPlace: { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Parent.UserName": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "CollaboratorStatistic.TotalCommission": { value: null, matchMode: FilterMatchMode.EQUALS },
            "CollaboratorStatistic.Student": { value: null, matchMode: FilterMatchMode.EQUALS },
            BeginDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
            IdentityDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
        }
    }
    const dataTableRef = useRef(null);

    const [collaborators, setCollaborators] = useState<Collaborators[]>([]);
    // search
    const [searchFromDate, setSearchFromDate] = useState<string | Date | Date[] | null>(null);
    const [searchToDate, setSearchToDate] = useState<string | Date | Date[] | null>(null);
    const [searchAction, setSearchAction] = useState(false);
    const [isShowClearFilter, setIsShowClearFilter] = useState(false);

    // tree
    const [currentTreeValue, setCurrentTreeValue] = useState<any[]>([]);
    const [currentTreeComValue, setCurrentTreeComValue] = useState<any[]>([]);
    const [expandedKeys, setExpandedKeys] = useState({});
    const [expandedKeyComs, setExpandedKeyComs] = useState({});

    const [loading, setLoading] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const [totalRecords, setTotalRecords] = useState(0);
    const [AvailableDeposit, setAvailableDeposit] = useState<number | null>(0);

    // dialog add and edit
    const emptyCollaborator: CollaboratorModal = {
        Id: null,
        Name: "",
        Email: "",
        Mobile: "",
        Address: "",
        Identity: "",
        IdentityDate: "",
        IdentityPlace: "",
        Level: "",
        IsRepOffice: "",
        RankId: null,
        ParentId: null,
        BankId: null,
        BankBranchName: "",
        BankOwner: "",
        BankNumber: "",
        Note: "",
        Password: "",
        RePassword: "",
        Image: null,
        File: null,
        NationId: null,
        BankSwiftCode: ""
    };

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [showTreeViewDialog, setShowTreeViewDialog] = useState(false);
    const [showTreeViewComDialog, setShowTreeViewComDialog] = useState(false);
    const [showContractDialog, setShowContractDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [collaborator, setCollaborator] = useState(emptyCollaborator);

    const [parentIdOptionSelected, setParentIdOptionSelected] = useState(null);
    const [parentIdOptions, setParentIdOptions] = useState<InputValue[]>([]);
    const [bankIdOptionSelected, setBankIdOptionSelected] = useState(9);
    const [bankIdOptions, setBankIdOptions] = useState<InputValue[]>([]);
    const [rankOptionSelected, setRankOptionSelected] = useState(null);
    const [rankOptions, setRankOptions] = useState<InputValue[]>([]);
    const [currentImage, setCurrentImage] = useState<File>();
    const [importFile, setImportFile] = useState<File>();
    const [previewImage, setPreviewImage] = useState<string>("");
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [contractNumber, setContractNumber] = useState<number | null>(null);

    const [nationIdOptionSelected, setNationIdOptionSelected] = useState<number | null>(null);
    const [nationIdOptions, setNationIdOptions] = useState<InputValue[]>([]);
    // upload

    const [fileTypes, setFileTypes] = useState<FileType[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);

    const [uploadFileIds, setUploadFileIds] = useState<number[]>([]);
    const [uploadFiles, setUploadFiles] = useState<any[]>([]);

    const [identityDate, setIdentityDate] = useState<string | Date | Date[] | null>(null);

    const toast = useRef<Toast>(null);
    const clearFilter = () => {
        setlazyState(lazyStateDefault);
        setSearchFromDate(null);
        setSearchToDate(null);
        setSearchAction(!searchAction);
        setIsShowClearFilter(false);
    };

    const retrieveCollaborator = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        var searchFromDateFormat = searchFromDate ? moment(searchFromDate.toString()).format('DD/MM/YYYY') : ""
        var searchToDateFormat = searchToDate ? moment(searchToDate.toString()).format('DD/MM/YYYY') : ""
        // Compare only if both dates are valid
        if (searchFromDateFormat && searchToDateFormat) {
            var fromDate = moment(searchFromDateFormat, 'DD/MM/YYYY');
            var toDate = moment(searchToDateFormat, 'DD/MM/YYYY');

            if (toDate.isBefore(fromDate)) {
                // toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc', life: 3000 });
                return;
            }
        }
        CollaboratorService.get(currentPage, lazyState.rows, filterProcess, searchFromDateFormat, searchToDateFormat)
            .then((response: DefaultResponse) => {

                setCollaborators(response.data);
                setLoading(false)
                setTotalRecords(response.total ?? 0)
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });
    };
    const reloadPage = () => {
        retrieveCollaborator();
    };
    useEffect(() => {
        retrieveCollaborator();
    }, [lazyState, searchAction]);

    useEffect(() => {
        expandAll(currentTreeValue)
    }, [currentTreeValue])

    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar maxDate={moment().toDate()} value={options.value} onChange={(e) => {
            options.filterApplyCallback(e.value)
        }} dateFormat="dd/mm/yy"
        />;
    };

    const dateBodyTemplate = (rowData: Collaborators) => {
        return rowData.BeginDate ? formatDate(rowData.BeginDate) : "";
    };
    const dateBodyTemplate2 = (rowData: Collaborators) => {
        return rowData.IdentityDate ? formatDate(rowData.IdentityDate) : "";
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
                CollaboratorService.delete(Id)
                    .then((response: DefaultResponse) => {
                        if (!response.status) {
                            toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
                        } else {
                            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã xóa thành công', life: 3000 });
                            reloadPage();
                        }
                    })
                    .catch((e) => {
                        catchAxiosError({
                            e, router, toast
                        })
                    });
            },
            reject
        });
    };
    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                {
                    isShowClearFilter ? <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} /> : <div></div>
                }
                <div >
                    {
                        authorizeAccountControllerAction(Permissions.Collaborator, Action.Add) &&
                        <Button label="Thêm mới" icon="pi pi-plus" severity="info" className="ml-auto mr-2" onClick={() => handleShowDialog(null)} />
                    }

                    <Button loading={loading} label="Xuất Excel" icon="pi pi-upload" severity="success" className="mr-2" onClick={() => exportExcel()} />
                    {
                        authorizeAccountControllerAction(Permissions.Collaborator, Action.Import) &&
                        <>
                            <Button label="Xuất file mẫu" icon="pi pi-upload" severity="help" className="mr-2" onClick={() => exportExcelTemplate()} />
                            <Button label="Nhập file mẫu" icon="pi pi-download" severity="warning" onClick={() => handleShowImportDialog()} /></>
                    }

                </div>
            </div>
        );
    };
    const items = (Id: number, isLock: boolean | null) => {
        const authorizedLock = authorizeAccountControllerAction(Permissions.Collaborator, Action.Lock);
        const authorizedUpdate = authorizeAccountControllerAction(Permissions.Collaborator, Action.Update);

        const commonItems = [
            {
                label: 'Sơ đồ cây hệ thống',
                icon: 'pi pi-briefcase',
                command: () => {
                    handleShowTreeDialog(Id);
                },
            },
            {
                label: 'Chi tiết nhận hoa hồng',
                icon: 'pi pi-briefcase',
                command: () => {
                    CollaboratorService.getOrderDetails(Id, 1, Number.MAX_SAFE_INTEGER).then((response: DefaultResponse) => {
                        setDataExpansion(response.data)
                        setVisibleDialog1(true)
                    })
                },
            },

        ];
        // if (authorizedLock) {
        //     commonItems.push({
        //         label: isLock ? 'Mở khóa' : 'Khóa',
        //         icon: isLock ? 'pi pi-unlock' : 'pi pi-lock',
        //         command: () => {
        //             isLock ? confirmUnLock(Id) : confirmLock(Id);
        //         },
        //     });
        // }
        commonItems.push({
            label: 'Nạp tiền',
            icon: 'pi pi-dollar',
            command: () => {
                handleShowUploadDialog(Id);
            },
        });
        return commonItems;
    };


    // add and edit
    const renderAction = (rowData: Collaborators) => {
        return <div className='flex justify-content-center flex-wrap' >
            {
                authorizeAccountControllerAction(Permissions.Collaborator, Action.Update) &&
                <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDialog(rowData.Id)} />
            }
            {
                authorizeAccountControllerAction(Permissions.Collaborator, Action.Delete) &&
                <Button style={{ marginLeft: "5px", borderRadius: "50%" }} severity="danger" icon="pi pi-trash" onClick={() => confirm(rowData.Id)} />
            }
            <SplitButton style={{ marginLeft: "5px" }} icon="pi pi-bars" model={items(rowData.Id, rowData.IsLock)} severity="success" dropdownIcon="pi pi-bars" aria-hidden="true" hidden={false} />
        </div>
    }
    const imageBodyTemplate = (rowData: Collaborators) => {
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
    const contractBodyTemplate = (rowData: Collaborators) => {
        const contractNumber = rowData.ContractNumber;
        return (
            <React.Fragment>
                {
                    contractNumber ?
                        <span>{contractNumber}</span>
                        :
                        authorizeAccountControllerAction(Permissions.Collaborator, Action.Index) ?
                            <Button className='h-2rem' label="Cập nhập SHĐ" link onClick={() => handleShowContractDialog(rowData.Id)} /> : ""
                }
            </React.Fragment>
        );
    };

    const hideDialog = () => {
        setSubmitted(false);
        setShowUserDialog(false);
        setShowContractDialog(false);
        setShowTreeViewDialog(false);
        setShowTreeViewComDialog(false);
        setShowImportDialog(false);
        // clear upload
        setShowUploadDialog(false);
        setUploadFileIds([])
        setUploadFiles([])
        setIdentityDate("")
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setCollaborator((prev) => ({
            ...prev,
            [name]: val,
        }));
    };
    const onDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | RadioButtonChangeEvent, name: string) => {
        const val = (e.target && e.target.value) || '';
        if (val.Value != undefined) {
            setCollaborator((prev) => ({
                ...prev,
                [name]: val.Value,
            }));
        } else {
            setCollaborator((prev) => ({
                ...prev,
                [name]: val,
            }));
        }
    };
    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        setCollaborator((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const exportExcel = () => {
        setLoading(true);
        var filterProcess = processFilter(lazyState);
        var searchFromDateFormat = "01/01/1970"
        var searchToDateFormat = moment().format("DD/MM/YYYY");

        CollaboratorService.get(firstPage, Number.MAX_SAFE_INTEGER, filterProcess, searchFromDateFormat, searchToDateFormat)
            .then((response: DefaultResponse) => {
                exportExcelFromGrid(dataTableRef, response.data)
                setLoading(false);
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });
    }

    const exportExcelTemplate = () => {
        CollaboratorService.getExportTemplate()
            .then((response) => {
                if (response) {
                    const contentDisposition = response.headers['content-disposition'];
                    const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                    let fileName = 'template.xlsx';
                    if (fileNameMatch && fileNameMatch.length > 1) {
                        fileName = fileNameMatch[1];
                    }
                    const blob = new Blob([response.data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', fileName);
                    link.setAttribute('target', '_blank');
                    link.click();
                    window.URL.revokeObjectURL(url);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    interface DataItem {
        Id: number;
        Name: string;
        Rank: string;
        ParentId: number | null;
        UserName: string;
        children?: DataItem[];
        key?: number;
        label?: string;

    }
    function buildTreeView(data: DataItem[]): DataItem[] {
        const map: { [key: number]: DataItem } = {};
        const tree: DataItem[] = [];
        data.forEach(item => {
            let itemUsername = item.UserName;
            const rank = item.Rank ?? ""
            if (itemUsername) {
                itemUsername = `${item.UserName} - ${item.Name} (${rank})`;
            }
            else {
                itemUsername = item.Name
            }
            map[item.Id] = {
                ...item,
                key: (item.Id),
                label: itemUsername,
                children: []
            };
        });

        data.forEach(item => {
            if (item.ParentId === null) {
                // If no parent, it's a root node
                tree.push(map[item.Id]);
            } else {
                // Add it as a child to its parent
                if (map[item.ParentId]) {
                    map[item.ParentId].children!.push(map[item.Id]);
                }
            }
        });

        // Add a count node for each parent node
        // for (const parentId in map) {
        //     const parent = map[parentId];
        //     if (parent.children && parent.children.length > 0) {

        //         if (parent.children.length > 0) {
        //             const countNode: DataItem = {
        //                 Id: parent.Id,
        //                 Name: `${parent.children.length} Children`,
        //                 ParentId: parent.ParentId,
        //                 key: `count-${parent.Id}`,
        //                 label: `${parent.children.length} Children`,
        //                 children: parent.children
        //                 ,
        //                 Rank: "abcd",
        //                 UserName: "cdef"
        //             };
        //             parent.children = [countNode];

        //         }
        //     }
        // }
        setCurrentTreeValue(tree);
        return tree;
    }
    const nodeTemplate = (node: any, options: any) => {

        let label = <div>{node.label}</div>;
        if (node.ParentId == null) {
            label = <div className="firstNoteTreeView">{node.label}</div>
        }
        if (node.IsGroup) {
            label = <div className="isGroupTreeView">{node.label}</div>
        }

        return <span className={options.className}>{label}</span>;
    }
    const handleShowTreeDialog = (Id: number) => {
        CollaboratorService.getTree(Id)
            .then((response: DefaultResponse) => {
                if (response.status) {
                    // set tree value
                    buildTreeView(response.data.dataRaw)
                    // show all tree
                    // expandAll()
                    setShowTreeViewDialog(true)
                }
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });
    }

    const handleShowContractDialog = (Id: number) => {
        setShowContractDialog(true)
        setCurrentId(Id)
    }
    const handleShowUploadDialog = (Id: number) => {
        setCurrentId(Id)
        setToggleAction("DEPOSIT")
        setShowUploadDialog(true)

    }
    // process show all tree
    const expandAll = (value: Array<any>) => {
        let _expandedKeys = {};

        for (let node of value) {
            expandNode(node, _expandedKeys);
        }

        setExpandedKeys(_expandedKeys);
    };
    // process show all tree
    const expandAllCom = (value: Array<any>) => {
        let _expandedKeyComs = {};

        for (let node of value) {
            expandNode(node, _expandedKeyComs);
        }

        setExpandedKeyComs(_expandedKeyComs);
    };
    const expandNode = (node: { children: string | any[]; key: string | number; }, _expandedKeys: { [x: string]: boolean; }) => {
        if (node.children && node.children.length) {
            _expandedKeys[node.key] = true;

            for (let child of node.children) {
                if (child.Name.includes("F3")) {
                    continue;
                }
                expandNode(child, _expandedKeys);
            }
        }
    };
    function isPdfFile(inputString: string): boolean {
        const hasPdfExtension = inputString.toLowerCase().endsWith(".pdf");
        return hasPdfExtension;
    }
    const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setCurrentImage(selectedFiles?.[0]);
        setPreviewImage(URL.createObjectURL(selectedFiles?.[0]));
        // set avatar
        setCollaborator((prev) => ({
            ...prev,
            File: selectedFiles?.[0],
        }));
    };
    const selectImageByType = (typeId: number | null) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        if (typeId) {
            setUploadFileIds((prevIds) => [...prevIds, typeId]);
            setUploadFiles((prevFile) => [...prevFile, selectedFiles?.[0]]);
        }

    };
    const selectExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files as FileList;
        setImportFile(selectedFiles?.[0]);
    };
    const handleShowImportDialog = () => {
        setShowImportDialog(true);
    }
    const deleteImage = (Id: number | null | undefined) => {
        if (Id && currentId)
            CollaboratorService.deleteImage(currentId, Id)
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        CollaboratorService.getUpload(currentId)
                            .then((response: DefaultResponse) => {
                                if (response.status) {
                                    if (response.data.FileTypes)
                                        setFileTypes(response.data.FileTypes)
                                    if (response.data.Files)
                                        setFiles(response.data.Files)
                                }
                            })
                            .catch((e) => {
                                catchAxiosError({
                                    e, router, toast
                                })
                            });
                    }
                })
                .catch((e) => {
                    catchAxiosError({
                        e, router, toast
                    })
                });
    }
    const [visibleDialog1, setVisibleDialog1] = useState(false);
    const [dataExpansion, setDataExpansion] = useState();

    const handleShowDialog = (Id: number | null) => {
        setPreviewImage("");
        if (Id != null) {
            setIsEdit(true)
            CollaboratorService.getUpdate(Id)
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
                        var nationIdOptionValues = [];
                        if (response.data.Nations && response.data.Nations.length > 0) {
                            nationIdOptionValues = response.data.Nations.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setNationIdOptions(nationIdOptionValues);

                        var rankOptionValues = [];
                        if (response.data.RankOptions && response.data.RankOptions.length > 0) {
                            rankOptionValues = response.data.RankOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setRankOptions(rankOptionValues);
                        var curentCollaborator = response.data.Info
                        if (curentCollaborator) {
                            setCollaborator(curentCollaborator);
                            setParentIdOptionSelected(curentCollaborator.ParentId);
                            setRankOptionSelected(curentCollaborator.RankId);
                            setIdentityDate(curentCollaborator.IdentityDate);
                            setNationIdOptionSelected(curentCollaborator.Bank?.NationId);
                            setBankIdOptionSelected(curentCollaborator.BankId);

                        }
                    }
                })
                .catch((e) => {
                    catchAxiosError({
                        e, router, toast
                    })
                });
        } else {
            CollaboratorService.getCreate()
                .then((response: DefaultResponse) => {
                    if (response.status) {
                        var parentIdOptionValues = [];
                        if (response.data.ParentIdOptions && response.data.ParentIdOptions.length > 0) {
                            parentIdOptionValues = response.data.ParentIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setParentIdOptions(parentIdOptionValues);

                        var bankIdOptionValues = [];
                        if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                            bankIdOptionValues = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setBankIdOptions(bankIdOptionValues);
                        var nationIdOptionValues = [];
                        if (response.data.Nations && response.data.Nations.length > 0) {
                            nationIdOptionValues = response.data.Nations.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setNationIdOptions(nationIdOptionValues);

                        var rankOptionValues = [];
                        if (response.data.RankOptions && response.data.RankOptions.length > 0) {
                            rankOptionValues = response.data.RankOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
                        }
                        setRankOptions(rankOptionValues);
                    }
                })
                .catch((e) => {
                    catchAxiosError({
                        e, router, toast
                    })
                });
            setIsEdit(false);

            setCollaborator(emptyCollaborator);
            setParentIdOptionSelected(null);
            setRankOptionSelected(null);
            setBankIdOptionSelected(9);
            setNationIdOptionSelected(71)
        }
        setShowUserDialog(true)
    };

    const handleCollaboratorAction = () => {
        message.current?.clear();
        setSubmitted(true);

        // validate
        if (!collaborator.Name) {
            return;
        }
        // isEdit = false : add event
        if (!isEdit) {
            if (!collaborator.Password || !collaborator.RePassword) {
                return;
            }
            var collaboratorFormat = { ...collaborator }
            collaboratorFormat.IdentityDate = identityDate ? moment(identityDate.toString()).format('DD/MM/YYYY') : "";
            CollaboratorService.create(collaboratorFormat)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setCollaborator(emptyCollaborator)
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
                    catchAxiosError({
                        e, router, toast
                    })
                });
        } else {
            var collaboratorFormat = { ...collaborator }
            collaboratorFormat.IdentityDate = identityDate ? moment(identityDate.toString()).format('DD/MM/YYYY') : "";
            CollaboratorService.update(collaboratorFormat)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setCollaborator(emptyCollaborator)
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
                    catchAxiosError({
                        e, router, toast
                    })
                });
        }

    };
    const [toggleAction, setToggleAction] = useState("")


    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <div className="card">
                    <h3>Danh sách thành viên</h3>

                    <div className='flex gap-5 align-items-end flex-wrap mb-2'>
                        <div className="field">
                            <label htmlFor="Name" className="font-bold block mb-2" >Từ ngày:</label>
                            <Calendar maxDate={moment().toDate()} value={searchFromDate} onChange={(e) => setSearchFromDate(e.value ?? null)} dateFormat="dd/mm/yy" showIcon showOnFocus={false} />

                        </div>
                        <div className="field">
                            <label htmlFor="Name" className="font-bold block mb-2" >Đến ngày:</label>
                            <Calendar maxDate={moment().toDate()} value={searchToDate} onChange={(e) => setSearchToDate(e.value ?? null)} dateFormat="dd/mm/yy" showIcon showOnFocus={false} />
                        </div>
                        <div className="field">
                            <Button label="Tìm kiếm" icon="pi pi-search" severity="info" onClick={() => setSearchAction(!searchAction)} />
                        </div>
                    </div>

                    <DataTable
                        value={collaborators}
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
                            style={{ minWidth: '120px' }}
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
                            field="Rank"
                            header="Cấp độ"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Name"
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
                            header="Mobile"
                            filter
                            style={{ minWidth: '180px' }}
                        />

                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Identity"
                            header="CMTND/CCCD"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Date is', value: FilterMatchMode.DATE_IS },
                            ]}
                            field="IdentityDate"
                            header="Ngày cấp"
                            body={dateBodyTemplate2}
                            filterElement={dateFilterTemplate}
                            filter
                            dataType="date"
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="IdentityPlace"
                            header="Nơi cấp"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Contains', value: FilterMatchMode.CONTAINS },
                            ]}
                            field="Parent.UserName"
                            header="Người giới thiệu"
                            filter
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Date is', value: FilterMatchMode.DATE_IS },
                            ]}
                            field="BeginDate"
                            header="Ngày bắt đầu"
                            body={dateBodyTemplate}
                            filterElement={dateFilterTemplate}
                            filter
                            dataType="date"
                            style={{ minWidth: '180px' }}
                        />
                        {/* <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Equals', value: FilterMatchMode.EQUALS },
                            ]}
                            field="CollaboratorStatistic.TotalCommission"
                            header="Doanh thu"
                            filter
                            style={{ minWidth: '150px' }}
                        />
                        <Column
                            showFilterMenu={false}
                            filterMatchModeOptions={[
                                { label: 'Equals', value: FilterMatchMode.EQUALS },
                            ]}
                            field="CollaboratorStatistic.Student"
                            header="Học viên đã giới thiệu"
                            filter
                            style={{ minWidth: '150px' }}
                        /> */}

                    </DataTable>
                </div>
                <Dialog visible={showTreeViewDialog}
                    style={{ width: DialogStyle.width.large, height: DialogStyle.height.large }}
                    header="Sơ đồ cây hệ thống"
                    modal
                    blockScroll
                    draggable={false}
                    className="p-fluid"
                    onHide={hideDialog}>
                    <>
                        <Tree nodeTemplate={nodeTemplate} expandedKeys={expandedKeys} onToggle={(e: any) => setExpandedKeys(e.value)} value={currentTreeValue} className="w-full " />
                    </>
                </Dialog>

                <DepositHistoryDialog visible={showUploadDialog}
                    toggleDialog={() => setShowUploadDialog(!showUploadDialog)}
                    toggleAction={toggleAction}
                    currentId={currentId}
                    onSaveCallback={() => {
                        reloadPage()
                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Thao tác thực hiện thành công', life: 3000 });

                    }}
                />
                <Dialog visible={showUserDialog}
                    style={{ width: DialogStyle.width.large }}
                    header={isEdit ? "Chỉnh sửa nhân viên kinh doanh" : "Thêm nhân viên kinh doanh"}
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
                                    <label htmlFor="Email" className="font-bold block mb-2" > Ngày cấp </label>


                                    <Calendar
                                        inputId="IdentityDate"
                                        maxDate={moment().toDate()}
                                        name="IdentityDate"
                                        value={identityDate ? new Date(identityDate?.toString()) : ""}
                                        onChange={(e) => {
                                            setIdentityDate(e.value ?? null);
                                        }
                                        }
                                        showIcon
                                        dateFormat="dd/mm/yy"

                                        showOnFocus={false}
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
                                    <label htmlFor="label" className="font-bold block mb-2" >Người giới thiệu mới</label>
                                    <Dropdown
                                        virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                        filter
                                        value={parentIdOptions.find(({ code }) => code === parentIdOptionSelected)}
                                        onChange={(e) => {
                                            var parentIdOptionSelectedR: any = null;
                                            if (e.value != null) {
                                                parentIdOptionSelectedR = e.value.code;
                                            }
                                            setParentIdOptionSelected(parentIdOptionSelectedR)
                                            setCollaborator((prev) => ({
                                                ...prev,
                                                ParentId: parentIdOptionSelectedR,
                                            }));
                                        }
                                        }
                                        showClear
                                        options={parentIdOptions}
                                        optionLabel="name"
                                        placeholder="Chọn một người giới thiệu" />
                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="label" className="font-bold block mb-2" > Mật khẩu {!isEdit && <span className="text-red-600">*</span>}</label>
                                    <Password feedback={false}
                                        id="Password"
                                        value={collaborator.Password}
                                        onChange={(e) => onInputChange(e, 'Password')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !collaborator.Password && !isEdit
                                        })}
                                    />
                                    {submitted && !isEdit && !collaborator.Password && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="label" className="font-bold block mb-2" > Nhập lại mật khẩu {!isEdit && <span className="text-red-600">*</span>}</label>
                                    <Password feedback={false}
                                        id="RePassword"
                                        value={collaborator.RePassword}
                                        onChange={(e) => onInputChange(e, 'RePassword')}
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !collaborator.RePassword && !isEdit
                                        })}
                                    />
                                    {submitted && !collaborator.RePassword && !isEdit && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

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
                                        showClear
                                        options={bankIdOptions}
                                        optionLabel="name"
                                        placeholder="Chọn một ngân hàng" />
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
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="field col-12 sm:col-6">
                                    <label htmlFor="BankBranchName" className="font-bold block mb-2" >Chi nhánh</label>
                                    <InputText
                                        id="BankBranchName"
                                        value={collaborator.BankBranchName}
                                        onChange={(e) => onInputChange(e, 'BankBranchName')}
                                        required
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
                                    <Button className='btn-pri' label="Lưu" onClick={handleCollaboratorAction} />
                                    <Button className='btn-sec' label="Bỏ qua" onClick={hideDialog} />
                                </div>
                            </div>
                        </div>

                        <Messages ref={message} />
                    </>
                </Dialog>
                <Dialog header="Chi tiết nhận hoa hồng" visible={visibleDialog1}
                    draggable={false}
                    modal
                    style={{ width: DialogStyle.width.medium }}
                    onHide={() => {
                        setVisibleDialog1(false)
                        setDataExpansion(undefined)
                    }}>
                    <DataTable value={dataExpansion} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} >

                        <Column field="Order.Collaborator.UserName" header="Mã NVKD" ></Column>
                        <Column field="Order.Collaborator.Name" header="Họ tên" ></Column>
                        <Column field="Type" header="Hoa hồng"
                            body={(rowData: OrderDetailItem) => {
                                return WalletTypeEnums[rowData.WalletTypeEnums as keyof typeof WalletTypeEnums];
                            }}
                        ></Column>

                        <Column field="Value" header="Số tiền"
                            body={(rowData) => {
                                return rowData.Value ? `+${formatNumberWithThousandSeparator(rowData.Value)}` : "";
                            }}
                        ></Column>
                        <Column field="Note" header="Ghi chú"

                        ></Column>
                    </DataTable>
                </Dialog>
            </div>
        </div>
    );
};

export default Collaborator;
