/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from "next/navigation";
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import Link from 'next/link';
import { Demo } from '../../types/types';
import { ChartData, ChartOptions } from 'chart.js';
import { LazyStateObject } from '../../types/models/filter';
import { Image } from 'primereact/image';
import { formatDate, formatDateTime, formatNumberWithThousandSeparator, isJsonString, processFilter } from '../../common/common';
import HomeService from "../../service/HomeService";
import { DefaultResponse } from "../../types/models/defaultResponse";
import { Info, Payment } from "../../types/models/home";
import moment from "moment";
import AccountService from "../../service/AccountService";
import { FileModal } from "../../types/models/account";
import { Toast } from "primereact/toast";
import { Messages } from "primereact/messages";
import { InputValue, InputValueResponse } from "../../types/models/dropdownInput";
import { CollaboratorModal, Collaborators } from "../../types/models/collaborators";
import { Dialog } from "primereact/dialog";
import { DialogStyle, DropdownSizeLoadding } from "../../common/config";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import AuthService from "../../service/AuthService";
import { InputNumber } from "primereact/inputnumber";
import WithdrawRequestService from "../../service/WithdrawRequestService";
import { catchAxiosError, displayErrorMessage } from "../../common/commonTSX";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { TabPanel, TabView } from "primereact/tabview";
// import CollaboratorService from '../../service/CollaboratorService';
// import { DefaultResponse } from '../../types/models/defaultResponse';
import { RankEnums } from "../../common/common";
import PurchaseDialogCombo from "./PurchaseComboDialog";
import { Paginator } from "primereact/paginator";

export enum WalletTypeEnums {
    Source = "Cá nhân",
    CustomerShare = "Đồng chia",
    CustomerGratitude = "Tri ân",
    Sale1 = "Hoa hồng giới thiệu",
    Sale2 = "Thưởng lãnh đạo",
    // Sale3 = "Sale3",
}

const Dashboard = () => {
    const toast = useRef<Toast>(null);
    const message = useRef<Messages>(null);

    const WalletTypes: InputValue[] = [
        {
            code: "CustomerShare", name: WalletTypeEnums.CustomerShare,
        },
        {
            code: "CustomerGratitude", name: WalletTypeEnums.CustomerGratitude
        },
        {
            code: "Sale1", name: WalletTypeEnums.Sale1
        },
        {
            code: "Sale2", name: WalletTypeEnums.Sale2
        },
    ]

    const router = useRouter();
    const [products, setProducts] = useState<Demo.Product[]>([]);
    const menu1 = useRef<Menu>(null);
    const menu2 = useRef<Menu>(null);
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const firstPage = 1;
    const limit = 10;
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: limit,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {

        }
    }
    const dataTableRef = useRef(null);
    const [availableBalance, setAvailableBalance] = useState(0)
    const [storedbalance, setStoredBalance] = useState(0)
    const [accumulateBalance, setAccumulateBalance] = useState(0)
    const [payments, setPayments] = useState<Payment[]>([]);
    const [info, setInfo] = useState<Info>()
    const [globalInfo, setGlobalInfo] = useState<any>()
    const [loading, setLoading] = useState(true);
    const [loadingMember, setLoadingMember] = useState(true);
    const [lazyState, setlazyState] = useState(lazyStateDefault);

    const [currentImage, setCurrentImage] = useState<File>();
    const [importFile, setImportFile] = useState<File>();
    const [previewImage, setPreviewImage] = useState<string>("");

    // modal
    const [submitted, setSubmitted] = useState(false);

    // dialog add and edit
    const [collaborator, setCollaborator] = useState<CollaboratorModal>({});

    const [currentImageModal, setCurrentImageModal] = useState<File>();
    const [importFileModal, setImportFileModal] = useState<File>();
    const [previewImageModal, setPreviewImageModal] = useState<string>("");

    const [identityDate, setIdentityDate] = useState<string | Date | Date[] | null>(null);

    const [parentIdOptionSelected, setParentIdOptionSelected] = useState(null);
    const [parentIdOptions, setParentIdOptions] = useState<InputValue[]>([]);
    const [bankIdOptionSelected, setBankIdOptionSelected] = useState();
    const [collabListSelected, setCollabListSelected] = useState();
    const [BankNumber, setBankNumber] = useState<string>();
    const [PayAmount, setPayAmount] = useState<number | null>();
    const [BankOwner, setBankOwner] = useState<string>();
    const [WalletTypeFrom, setWalletTypeFrom] = useState<string>();
    const [roseBalance, setRoseBalance] = useState<number>(0);
    const [WalletTypeTo, setWalletTypeTo] = useState<string>();
    const [WithdrawAmount, setWithdrawAmount] = useState<number | null>();
    const [InternalTransferAmount, setInternalTransferAmount] = useState<number>(0);
    const [personalTransferAmount, setPersonalTransferAmount] = useState<number>(0);
    const [CollaboratorCode, setCollaboratorCode] = useState<string>();
    const [bankIdOptions, setBankIdOptions] = useState<InputValue[]>([]);
    const [rankOptionSelected, setRankOptionSelected] = useState(null);
    const [rankOptions, setRankOptions] = useState<InputValue[]>([]);

    const [orgOptionSelected, setOrgOptionSelected] = useState(null);
    const [orgOptions, setOrgOptions] = useState<InputValue[]>([]);

    const [showBuyDialog, setShowBuyDialog] = useState(false);

    // Ẩn nút
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const storedState = localStorage.getItem('isDisabled');
        if (storedState === 'true') {
            setIsDisabled(true); // Nếu đã vô hiệu hóa nút trước đó, giữ lại trạng thái
        }
    }, []);

    const accountName = "Công ty cổ phần tập đoàn ELITE LIFE";
    const accountNumber = "368568686"
    const bankName = "VIB"

    const applyLightTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);
    const [totalRecordCollab, setTotalRecordCollab] = useState(0)
    const PAGESIZE = 10;
    const retrieveCollaborator = (isLoading = true) => {
        if (isLoading) setLoadingMember(true);
        HomeService.getReferral(1, Number.MAX_SAFE_INTEGER)
            .then((response: DefaultResponse) => {
                setLoadingMember(false);
                setCollaborators(response.data);
                setTotalRecordCollab(response.total || 0)
                if (isLoading) setLoading(false)
            })
            .catch((e) => {
                if (e.status == 429) {
                    setLoadingMember(false);
                }
                catchAxiosError({
                    e, router, toast
                })
            });

    };
    const [totalRecords, setTotalRecords] = useState(0)
    const fetchPaymentList = (doLoading = false) => {
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;

        HomeService.getPaymentList(currentPage, lazyState.rows).then((response) => {
            if (doLoading) {
                setLoading(false)
            }
            if (response.status) {
                setTotalRecords(response.total)
                setPaymentList(response.data)
            }
        }).catch((e) => {
            if (e.status == 429) {
                setLoading(false);
            }
            catchAxiosError({
                e, router, toast
            })
        });
    }
    const retrieveUserInfo = () => {
        fetchPaymentList()
        HomeService.getInfo()
            .then((response: DefaultResponse) => {
                const info = response.data.Info
                setGlobalInfo(response.data)
                setInfo(info);
                setBankIdOptionSelected(info.BankId)
                setBankNumber(info.BankNumber)
                setBankOwner(info.BankOwner)
                setAvailableBalance(response.data.Source)
                setStoredBalance(response.data.Customer)
                setAccumulateBalance(response.data.Sale)
                setLoading(false)
            })
            .catch((e) => {
                if (e.response.data.statusCode == 401) {
                    router.push('/auth/login');
                }
                console.log(e);
            });
    }

    useEffect(() => {
        retrieveCollaborator();
    }, []);
    useEffect(() => {
        fetchPaymentList();
    }, [lazyState]);


    // useEffect(() => {
    //     // initial call

    //     const intervalTimer = 1000 * 15
    //     const intervalId = setInterval(() => {
    //         retrieveCollaborator(false);
    //         getUserInfo(false);
    //         fetchPaymentList()
    //     }, intervalTimer); // Set the desire    d interval in milliseconds

    //     return () => clearInterval(intervalId);
    // }, [lazyState]);

    const getUserInfo = (doesResetBankInfo = true) => {
        HomeService.getInfo()
            .then((response: DefaultResponse) => {
                const info = response.data.Info
                setGlobalInfo(response.data)
                setInfo(response.data.Info);
                if (doesResetBankInfo) {
                    setBankIdOptionSelected(info.BankId)
                    setBankNumber(info.BankNumber)
                    setBankOwner(info.BankOwner)
                }
                setAvailableBalance(response.data.Source)
                setStoredBalance(response.data.Customer)
                setAccumulateBalance(response.data.Sale)
            })
            .catch((e) => {
                if (e.response.data.statusCode == 401) {
                    router.push('/auth/login');
                }
                console.log(e);
            });
    }
    useEffect(() => {
        getUserInfo()
        HomeService.getOrders().then((response) => {
            let products = []
            if (response.data.Products && response.data.Products.length > 0) {
                products = response.data.Products.map((item: any) => ({ code: item.Value, name: item.Text, extra: item.Extra }));
            }
            setProduct(products)
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        });
        HomeService.getCollaboratorList().then((response) => {
            let ParentIdOptions = []
            if (response.data.ParentIdOptions && response.data.ParentIdOptions.length > 0) {
                ParentIdOptions = response.data.ParentIdOptions.map((item: any) => ({ code: item.Value, name: `${item.Value} - ${item.Text}`, extra: item.Extra }));
            }
            setCollabList(ParentIdOptions)
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        });
    }, [])


    useEffect(() => {
        WithdrawRequestService.getCreate().then((response) => {
            let bankOptions = []
            if (response.data.BankIdOptions && response.data.BankIdOptions.length > 0) {
                bankOptions = response.data.BankIdOptions.map((item: any) => ({ code: item.Value, name: item.Text }));
            }
            setBanks(bankOptions)
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        });




    }, [])



    const [collaborators, setCollaborators] = useState<Collaborators[]>([]);
    const [paymentList, setPaymentList] = useState<[]>([]);

    const confirmActivateAccount = () => {
        // if (availableBalance < 500000) {
        //     toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: "Bạn không có đủ số dư trong tài khoản", life: 3000 });

        //     return;
        // }
        confirmDialog({
            message: 'Bạn có chắc chắn muốn kich hoạt tài khoản?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            draggable: false,
            acceptLabel: 'Đồng ý',
            rejectLabel: 'Hủy',
            accept() {
                HomeService.activate()
                    .then((response: DefaultResponse) => {
                        if (!response.status) {
                            toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
                        } else {
                            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã kích hoạt tài khoản thành công', life: 3000 });
                            retrieveUserInfo()
                        }
                    })
                    .catch((e) => {
                        catchAxiosError({
                            e, router, toast
                        })
                    });
            },
        });
    }
    interface InputValueExtra extends InputValue {
        extra: string | number
    }
    const onPage = (event: any) => {
        setlazyState(event);
    }
    const [banks, setBanks] = useState<InputValue[]>([]);
    const [collabList, setCollabList] = useState<InputValueExtra[]>([]);
    const [product, setProduct] = useState<InputValueExtra[]>([]);

    return (
        <div className="grid db-all">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="col-12 lg:col-6 xl:col-4 mb-20">
                <div className="bg-dh bg-dh1">
                    <div className="db-all">
                        <p>Số dư</p>
                        <h3>{formatNumberWithThousandSeparator(availableBalance)}</h3>
                        {info && info.IsSale == false ?
                            <Button
                                onClick={confirmActivateAccount}
                                className="btn btn-activate">
                                Kích hoạt tài khoản
                            </Button>
                            : "Tài khoản của bạn đã được kích hoạt thành công"}
                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-4 mb-20">
                <div className="card mb-0 bg-dh bg-dh2">
                    <div className="db-all">
                        <p>Hoa hồng khách hàng</p>
                        <h3 className="m-0-h">{formatNumberWithThousandSeparator(storedbalance)}</h3>
                        <h4>/
                            {formatNumberWithThousandSeparator(globalInfo?.Order?.CommissionCustomerMax)} - {formatNumberWithThousandSeparator(globalInfo?.Order?.CommissionCustomer)} đã hưởng
                        </h4>
                        <span>Nâng VIP để tăng hạn mức hh
                            tới {formatNumberWithThousandSeparator((Number(product[0]?.extra) ?? 0) * 2)}
                        </span>


                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-4 mb-20">
                <div className="card mb-0 bg-dh bg-dh3">
                    <div className="db-all">
                        <p>Hoa Hồng NVKD</p>
                        <h3 className="m-0">{formatNumberWithThousandSeparator(accumulateBalance)}</h3>
                        <h4>/
                            {formatNumberWithThousandSeparator(globalInfo?.Order?.CommissionSaleMax)} - {formatNumberWithThousandSeparator(globalInfo?.Order?.CommissionSale)} đã hưởng
                        </h4>
                        <span>Nâng VIP1 để tăng hạn mức hh
                            tới {formatNumberWithThousandSeparator((Number(product[0]?.extra) ?? 0) * 10)}</span>

                    </div>
                </div>
            </div>
            <div className="col-12 lg:col-8 xl:col-8 mb-20 w-100-us">
                <div className="user-all">
                    <div className="user-left">
                        <div className="img-avt">
                            {
                                info && info.Image ?
                                    <img
                                        className="dashboard-profile"
                                        src={`/image/${info.Image}`}
                                        alt=""
                                    /> :
                                    <img
                                        className="dashboard-profile"
                                        src={`/demo/images/avatar/defaultAvatar.png`}
                                        alt=""
                                    />
                            }

                        </div>
                        <div className="name-avt">
                            <h3>{info?.Name}</h3>
                            <p>Mã hệ thống: {info?.UserName}</p>
                            <p>Ngày tham gia: {moment(info?.BeginDate).format("DD/MM/YYYY")}</p>
                            {
                                info && info.Rank == "None" ? "" :
                                    <span className="vip-m">
                                        {info && RankEnums[info.Rank as keyof typeof RankEnums]}
                                    </span>
                            }
                            {/* <span className="kh-m">Khách hàng</span> */}
                        </div>
                    </div>
                    <div className="user-right">
                        <p>Mã mời:</p>
                        {info && info.IsSale ?
                            <div className="input-m">
                                <strong>{window.location.origin}/auth/register?collaboratorCode={info?.UserName}</strong>
                                <CopyToClipboard text={`${window.location.origin}/auth/register?collaboratorCode=${info?.UserName}`} onCopy={
                                    () => toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã copy thành công', life: 3000 })

                                } >
                                    <button>  <i className="pi pi-copy copyIconBank" style={{
                                        color: "#a9a3a3",
                                        fontWeight: "bold",
                                        fontSize: "20px"
                                    }} /></button>
                                </CopyToClipboard>

                            </div>
                            :
                            <button className="btn-mk" onClick={confirmActivateAccount}>
                                <div className="input-m-new">
                                    <img src="/layout/images/icons8_unlock_private.png" alt="unlockIcon" />
                                    <span>Mở khóa mã mời</span>
                                </div>
                            </button>
                        }


                        <p className="m-0">Số thành viên đã mời: {totalRecordCollab} <a href="/refferals">Xem danh sách</a></p>
                    </div>
                </div>
            </div>
            {/* <div className="col-12 lg:col-4 xl:col-4 mb-20 w-50-us">
                <div className="nh-all">
                    <div className="nh-left">
                        <h3>Nạp tiền</h3>
                        <img style={{ maxWidth: "120px" }} src={`/layout/images/${bankName}.png`} alt="depositIcon" />
                        <p>Ngân hàng: {bankName}</p>
                        <p>Số tài khoản: {accountNumber}</p>
                        <p>CTK: {accountName}</p>
                        <p>Nội dung ck: Chuyển khoản tiền mua hàng {info?.UserName}
                            <CopyToClipboard text={`Chuyển khoản tiền mua hàng ${info?.UserName}`} onCopy={
                                () => toast.current?.show({ severity: 'success', summary: 'Thành công', detail: ' Bạn đã copy thành công', life: 3000 })

                            } >
                                <i className="pi pi-copy copyIconBank" />
                            </CopyToClipboard>
                        </p>
                    </div>
                    <div className="nh-right">
                        <img style={{
                            maxWidth: "100%"
                        }} src={`https://img.vietqr.io/image/${bankName}-${accountNumber}-qr_only.png?addInfo=${info?.UserName}&accountName=${accountName}`} />
                    </div>
                </div>
            </div> */}
            <div className="col-12 lg:col-6 xl:col-6 mb-20">
                <div className="table-card">
                    <TabView>
                        <TabPanel header="Rút tiền">
                            <div className="dashboard-statisic-card-small bg-1">
                                <p>Số dư</p>
                                <h3>{formatNumberWithThousandSeparator(availableBalance)}</h3>
                            </div>
                            <div className='mr-input-lg '>
                                <label htmlFor="label" className="block mb-2 text-left" > Ngân hàng</label>
                                <Dropdown
                                    style={{ width: '100%' }}
                                    virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                    filter
                                    inputId="BankId"
                                    name="BankId"
                                    value={banks.find(({ code }) => code === bankIdOptionSelected)}
                                    options={banks}
                                    optionLabel="name"
                                    onChange={(e) => {
                                        setBankIdOptionSelected(e.target.value.code)
                                    }}
                                />
                            </div>
                            <div className="grid">
                                <div className="mr-input-lg col-6">
                                    <label htmlFor="label" className="block mb-2 text-left" >Số tài khoản</label>
                                    <InputText
                                        value={BankNumber}
                                        onChange={(e) => setBankNumber(e.target.value)} type="text" className='w-full' />
                                </div>
                                <div className="mr-input-lg col-6">
                                    <label htmlFor="label" className="block mb-2 text-left" >Chủ tài khoản</label>
                                    <InputText
                                        value={BankOwner}
                                        onChange={(e) => setBankOwner(e.target.value)} type="text" className='w-full' />
                                </div>
                            </div>
                            <div className="grid">
                                <div className="mr-input-lg col-6">
                                    <label htmlFor="label" className="block mb-2 text-left" >Số tiền</label>
                                    <InputNumber style={{ width: "100%" }}
                                        value={WithdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.value)} type="text" className='w-full' />
                                </div>
                                <div className="mr-input-lg col-6">
                                    <label htmlFor="label" className="block mb-2 text-left" >Số thực nhận</label>
                                    <InputNumber style={{ width: "100%" }}
                                        value={WithdrawAmount && WithdrawAmount * 90 / 100} disabled
                                    />
                                </div>
                            </div>
                            <span className="pb-1">Các yêu cầu rút tiền sẽ tạm thu thuế thu nhập cá nhân 10%</span>
                            <Button className="btn-withdraw w-full d-flex justify-content-center align-items-center" onClick={async () => {
                                if (isDisabled) return; // Không làm gì nếu nút đang bị vô hiệu hóa

                                setIsDisabled(true);

                                if (!bankIdOptionSelected || !BankNumber || !BankOwner || !WithdrawAmount) {
                                    setIsDisabled(false);
                                    return;
                                }

                                localStorage.setItem('isDisabled', 'true');

                                message.current?.clear();
                                try {
                                    // Gửi yêu cầu rút tiền
                                    const response: DefaultResponse = await WithdrawRequestService.create({
                                        BankId: bankIdOptionSelected,
                                        BankNumber: BankNumber,
                                        BankOwner: BankOwner,
                                        WithdrawalAmount: WithdrawAmount
                                    });

                                    if (response.status === true) {
                                        setWithdrawAmount(null);
                                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã tạo yêu cầu rút tiền thành công', life: 3000 });
                                        // Cập nhật thông tin người dùng và danh sách giao dịch
                                        getUserInfo(false);
                                        fetchPaymentList();
                                    } else {
                                        toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: response.message?.WithdrawalAmount, life: 3000 });
                                    }
                                } catch (e) {
                                    catchAxiosError({ e, router, toast });
                                } finally {
                                    // Đảm bảo vô hiệu hóa nút và xóa trạng thái sau khi hoàn tất (hoặc có lỗi)
                                    setIsDisabled(false);
                                    localStorage.removeItem('isDisabled');
                                }
                            }}
                                disabled={isDisabled}
                            >
                                {isDisabled ? "Vui lòng chờ giao dịch thành công..." : "Rút tiền"}</Button>

                        </TabPanel>
                        <TabPanel header="Rút hoa hồng">

                            <div className='mr-input-lg '>
                                <label htmlFor="label" className="block mb-2 text-left" >Chọn ví rút:</label>
                                <Dropdown
                                    style={{ width: '100%' }}
                                    value={WalletTypes.find(({ code }) => code === WalletTypeFrom)}
                                    options={WalletTypes}
                                    optionLabel="name"
                                    onChange={(e) => {
                                        setWalletTypeFrom(e.target.value.code)

                                        switch (e.target.value.code) {
                                            case "Sale1":

                                                break;
                                            case "Sale2":

                                                break;
                                            case "CustomerShare":

                                                break;
                                            case "CustomerGratitude":

                                                break;

                                            default:
                                                break;
                                        }
                                        setRoseBalance(globalInfo[e.target.value.code] ?? 0)
                                    }}
                                />
                            </div>
                            <div className="dashboard-statisic-card-small bg-1">
                                <p>Số dư</p>
                                <h3>{formatNumberWithThousandSeparator(roseBalance)}</h3>
                            </div>
                            <div className="mr-input-lg">
                                <label htmlFor="label" className="block mb-2 text-left" >Số tiền:</label>
                                <InputNumber style={{ width: "100%" }}
                                    value={personalTransferAmount}
                                    min={0}
                                    onChange={(e) => {
                                        if (e.value != null) {
                                            setPersonalTransferAmount(e.value)
                                        }
                                    }} type="text" className='w-full' />
                            </div>
                            <Messages ref={message} />
                            <Button
                                className="btn-withdraw w-full d-flex justify-content-center align-items-center"
                                onClick={() => {
                                    if (isDisabled) return; // Không làm gì nếu nút đang bị vô hiệu hóa

                                    setIsDisabled(true);

                                    if (personalTransferAmount <= 0 || !WalletTypeFrom) {
                                        setIsDisabled(false);
                                        return;
                                    }

                                    localStorage.setItem('isDisabled', 'true');

                                    message.current?.clear();

                                    HomeService.personalMoneyTransfer({
                                        WalletTypeFrom: WalletTypeFrom,
                                        WalletTypeTo: "Source",
                                        Available: personalTransferAmount,
                                    })
                                        .then((response: DefaultResponse) => {
                                            if (response.status === true) {
                                                setWalletTypeFrom(undefined);
                                                setWalletTypeTo(undefined);
                                                setPersonalTransferAmount(0);
                                                toast.current?.show({
                                                    severity: 'success',
                                                    summary: 'Thành công',
                                                    detail: 'Bạn đã chuyển tiền thành công',
                                                    life: 3000,
                                                });
                                                retrieveUserInfo();
                                                setIsDisabled(false);
                                                localStorage.removeItem('isDisabled');
                                                setRoseBalance(0);
                                            } else {
                                                displayErrorMessage({
                                                    isExport: false,
                                                    message,
                                                    response,
                                                });
                                                setIsDisabled(false);
                                                localStorage.removeItem('isDisabled');
                                                setRoseBalance(0);
                                            }
                                        })
                                        .catch((e) => {
                                            catchAxiosError({
                                                e,
                                                router,
                                                toast,
                                            });
                                            setIsDisabled(false);
                                            localStorage.removeItem('isDisabled');
                                            setRoseBalance(0);
                                        });
                                }}
                                disabled={isDisabled}
                            >
                                {isDisabled ? "Vui lòng chờ giao dịch thành công..." : "Chuyển tiền"}
                            </Button>

                        </TabPanel>
                        <TabPanel header="Chuyển tiền HT">
                            <div className="dashboard-statisic-card-small bg-1">
                                <p>Số dư</p>
                                <h3>{formatNumberWithThousandSeparator(availableBalance)}</h3>
                            </div>
                            <div className="mr-input-lg">
                                <label htmlFor="label" className="block mb-2 text-left" >Mã khách hàng:</label>
                                {/* <InputText
                                    value={CollaboratorCode}
                                    onChange={(e) => setCollaboratorCode(e.target.value)} type="text" className='w-full' /> */}
                                <Dropdown
                                    style={{ width: '100%' }}
                                    virtualScrollerOptions={{ itemSize: DropdownSizeLoadding }}
                                    filter
                                    value={collabList.find(({ code }) => code === collabListSelected)}
                                    options={collabList}
                                    optionLabel="name"
                                    onChange={(e) => {
                                        setCollabListSelected(e.target.value.code)
                                    }}
                                />
                            </div>
                            <div className="mr-input-lg">
                                <label htmlFor="label" className="block mb-2 text-left" >Số tiền:</label>
                                <InputNumber style={{ width: "100%" }}
                                    value={InternalTransferAmount}
                                    min={0}
                                    onChange={(e) => {
                                        if (e.value != null) {
                                            setInternalTransferAmount(e.value)
                                        }
                                    }} type="text" className='w-full' />
                            </div>
                            <Messages ref={message} />

                            <Button className="btn-withdraw w-full d-flex justify-content-center align-items-center" onClick={async () => {

                                if (isDisabled) return; // Không làm gì nếu nút đang bị vô hiệu hóa

                                setIsDisabled(true);

                                if (InternalTransferAmount <= 0 || !collabListSelected) {
                                    setIsDisabled(false);
                                    return;
                                }

                                localStorage.setItem('isDisabled', 'true');

                                message.current?.clear();
                                try {
                                    // Gửi yêu cầu chuyển tiền nội bộ
                                    const response: DefaultResponse = await HomeService.internalTransfer({
                                        Available: InternalTransferAmount,
                                        CollaboratorCode: collabListSelected
                                    });

                                    if (response.status === true) {
                                        setCollaboratorCode(""); // Xóa mã cộng tác viên
                                        setInternalTransferAmount(0); // Đặt lại số tiền
                                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã chuyển tiền thành công', life: 3000 });
                                        getUserInfo(false); // Cập nhật lại thông tin người dùng
                                        fetchPaymentList(); // Cập nhật lại danh sách giao dịch
                                    } else {
                                        toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: response.message, life: 3000 });
                                    }
                                } catch (e) {
                                    catchAxiosError({ e, router, toast });
                                } finally {
                                    // Đảm bảo vô hiệu hóa nút và xóa trạng thái sau khi hoàn tất (hoặc có lỗi)
                                    setIsDisabled(false);
                                    localStorage.removeItem('isDisabled');
                                }
                            }}
                                disabled={isDisabled}
                            >{isDisabled ? "Vui lòng chờ giao dịch thành công..." : "Chuyển tiền"}</Button>
                        </TabPanel>
                    </TabView>

                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-6 mb-20">
                <div className="table-card">
                    <h4 className="h4-bt">Thành viên ({totalRecordCollab}) <button onClick={() => retrieveCollaborator()}><img src="/layout/images/icons8_rotate_right.png" alt="rotateIcon" /></button></h4>
                    <DataTable
                        value={collaborators}
                        ref={dataTableRef}
                        rows={lazyState.rows}
                        first={lazyState.first}
                        loading={loadingMember}
                        className="p-datatable-gridlines"
                        dataKey="Id"
                        filterDisplay="row"
                    >
                        <Column
                            header="Stt"
                            body={(rowData, options) => {
                                return options.rowIndex + 1;
                            }
                            }
                        />
                        <Column
                            field="Name"
                            header="Họ tên"
                        />
                        <Column
                            field="UserName"
                            header="Mã số"
                        />
                        <Column
                            header="Cấp độ"
                            body={
                                (rowData) => {
                                    switch (rowData.Rank) {
                                        case "None":
                                            return ""

                                        default:
                                            return rowData.Rank
                                    }
                                }
                            }
                        />


                    </DataTable>
                </div>
            </div>
            <div className="col-12 mb-20">
                <div className="table-card">
                    <h4 className="h4-bt">Lịch sử nạp rút <button onClick={() => {
                        setLoading(true);
                        fetchPaymentList(true)
                    }}><img src="/layout/images/icons8_rotate_right.png" alt="rotateIcon" /></button></h4>
                    <DataTable
                        value={paymentList}

                        rows={lazyState.rows}
                        className="p-datatable-gridlines"
                        dataKey="Id"
                    >
                        <Column
                            field="Note"
                            header="Nội dung"
                        />
                        <Column
                            field="Value"
                            header="Số tiền"
                            body={
                                (rowData) => {
                                    return rowData.Value > 0 ? `+${formatNumberWithThousandSeparator(rowData.Value)}` : formatNumberWithThousandSeparator(rowData.Value)
                                }
                            }
                        />
                        <Column
                            header="Ngày tạo"
                            showFilterMenu={false}
                            filter
                            body={
                                (rowData) => {
                                    return rowData.CreatedAt ? formatDateTime(rowData.CreatedAt) : "";

                                }
                            }
                        />
                        <Column
                            header="Trạng thái"
                            body={"Thành công"}
                        />


                    </DataTable>
                    <Paginator
                        first={lazyState.first}
                        rows={lazyState.rows}
                        totalRecords={totalRecords}
                        rowsPerPageOptions={[10, 25, 50]}
                        onPageChange={onPage}
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="{first} - {last} of {totalRecords} items"
                    />
                </div>
            </div>
            <div className="col-12 lg:col-12 xl:col-12 mb-20">
                <div className="img-qc-bot" onClick={() => {

                    setShowBuyDialog(true)
                }

                }>
                    <img src="/layout/images/img-banner.png" alt="adsIcon" />
                </div>
            </div>
            <PurchaseDialogCombo
                hideDialog={() => setShowBuyDialog(!showBuyDialog)}
                visible={showBuyDialog}
            />
        </div>
    );
};

export default Dashboard;
