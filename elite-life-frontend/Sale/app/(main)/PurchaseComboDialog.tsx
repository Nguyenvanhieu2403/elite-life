'use client';
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { formatDate, formatNumberWithThousandSeparator } from "../../common/common";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { DialogStyle } from "../../common/config";
import { InputNumber } from "primereact/inputnumber";
import { useRef, useState } from "react";
import { InputValue } from "../../types/models/dropdownInput";
import { useRouter } from "next/navigation";
import HomeService from "../../service/HomeService";
import moment from "moment";
import { DefaultResponse } from "../../types/models/defaultResponse";
import { Toast } from "primereact/toast";
import { catchAxiosError } from "../../common/commonTSX";
import { TabPanel, TabView } from "primereact/tabview";
import { Info } from "../../types/models/home";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
interface InputValueExtra extends InputValue {
    extra: string | number
}
interface ComponenProp {
    visible: boolean,
    hideDialog: () => void;
}
interface DeliveryInfo {
    NameSale: string,
    AddressSale: string,
    MobileSale: string
}
const PurchaseDialogCombo = ({ visible, hideDialog }: ComponenProp) => {
    const [PayAmount, setPayAmount] = useState<number | null>();
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        AddressSale: "",
        MobileSale: "",
        NameSale: ""
    })
    const [product, setProduct] = useState<InputValueExtra[]>([]);
    const message = useRef<Messages>(null);
    const [historyPay, setHistoryPay] = useState<any>();
    const [historyOrder, setHistoryOrder] = useState<any>();
    const toast = useRef<Toast>(null)
    const router = useRouter()
    const resetHistoryPay = () => {
        HomeService.getHistoryPay().then((response) => {
            setHistoryPay(response.data.Order);
            setHistoryOrder(response.data.OrderHistory);
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        });
    }
    const handleBuyCombo = () => {
        if (!PayAmount || PayAmount <= 0) return;
        HomeService.payCombo({
            PayDate: moment().format("DD/MM/YYYY"),
            Note: "",
            ProductId: Number(product[0].code),
            Value: PayAmount
        }).then((response: DefaultResponse) => {
            if (!response.status) {
                toast.current?.show({ severity: 'error', summary: 'Thao tác không thành công', detail: response.message, life: 3000 });
            } else {
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã thanh toán thành công', life: 3000 });
                setPayAmount(0)
                resetHistoryPay()

            }
        })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })
            });
    }
    const [info, setInfo] = useState<Info>()
    const [detailDialog, toggleDetailDialog] = useState(false)
    const purchaseTemplate = () => {
        if (!info) return <></>;
        if (info.Rank == "V") {
            if (historyPay.CommissionSale == historyPay.CommissionSaleMax) {
                //repurchas the bundle
                return (
                    <>
                        <p style={{
                            padding: "10px",
                            fontWeight: "bold",
                            background: "rgb(194, 245, 138)"
                        }}>
                            Bạn đã đạt tới hạn mức hoa hồng đủ điều kiện để tái mua gói
                        </p>
                    </>
                )
            }
        }
    }
    const [submitted, setSubmitted] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>()
    const handleShowDetailOrder = (orderId: number) => {
        setSelectedId(orderId);
        HomeService.getInfoDeliverySale(orderId).then((response: DefaultResponse) => {
            console.log(response)
            if (response.status) {
                toggleDetailDialog(true);
                console.log(response.data.Info)

                setDeliveryInfo(response.data.Info)
            }
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        });
    }
    return (
        <>

            <Dialog visible={detailDialog}
                style={{ width: DialogStyle.width.min }}
                header={"Chi tiết đơn hàng"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={() => {
                    toggleDetailDialog(false)
                }}
            >
                <Toast ref={toast} />
                <div className="mr-input-lg">
                    <label htmlFor="label" className="block mb-2 text-left" >Tên khách hàng<span className="text-red-600">*</span></label>
                    <InputText
                        value={deliveryInfo.NameSale}
                        min={0}

                        onChange={(e) => {
                            setDeliveryInfo((prev) => ({
                                ...prev,
                                NameSale: e.target.value,
                            }));
                        }} type="text"
                        className={classNames({
                            'p-invalid': submitted && !deliveryInfo.NameSale
                        })} />
                    {submitted && !deliveryInfo.NameSale && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                </div>
                <div className="mr-input-lg">
                    <label htmlFor="label" className="block mb-2 text-left" >Địa chỉ nhận hàng<span className="text-red-600">*</span></label>
                    <InputText
                        value={deliveryInfo.AddressSale}
                        min={0}
                        onChange={(e) => {
                            setDeliveryInfo((prev) => ({
                                ...prev,
                                AddressSale: e.target.value,
                            }));
                        }} type="text" className={classNames({
                            'p-invalid': submitted && !deliveryInfo.AddressSale
                        })} />
                    {submitted && !deliveryInfo.AddressSale && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}
                </div>
                <div className="mr-input-lg">
                    <label htmlFor="label" className="block mb-2 text-left" >Số điện thoại<span className="text-red-600">*</span></label>
                    <InputText
                        value={deliveryInfo.MobileSale}
                        min={0}
                        onChange={(e) => {
                            setDeliveryInfo((prev) => ({
                                ...prev,
                                MobileSale: e.target.value,
                            }));
                        }} type="text" className={classNames({
                            'p-invalid': submitted && !deliveryInfo.MobileSale
                        })} />
                    {submitted && !deliveryInfo.MobileSale && <small className="p-invalid">Nội dung bắt buộc không được bỏ trống</small>}

                </div>
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 sm:col-12 flex justify-content-between button-50">
                        <Button className='btn-pri' label="Lưu" onClick={() => {
                            setSubmitted(true);
                            if (!deliveryInfo.NameSale || !deliveryInfo.AddressSale || !deliveryInfo.MobileSale) {
                                return;
                            }
                            if (selectedId) {

                                HomeService.updateInfoDeliverySale(selectedId, deliveryInfo).then((response: DefaultResponse) => {
                                    if (response.status) {
                                        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Bạn đã cập nhật thành công', life: 3000 });
                                        resetHistoryPay();
                                        setSubmitted(false);
                                        setSelectedId(null)
                                        toggleDetailDialog(false)
                                    }
                                })
                            }
                        }} />
                        <Button className='btn-sec' label="Bỏ qua" onClick={() => {
                            toggleDetailDialog(false)
                            setSubmitted(false);
                            setSelectedId(null)
                        }} />
                    </div>
                </div>
            </Dialog>
            <Dialog visible={visible}
                style={{ width: DialogStyle.width.medium }}
                header={"Mua combo"}
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onShow={() => {
                    HomeService.getInfo()
                        .then((response: DefaultResponse) => {
                            const info = response.data.Info
                            setInfo(info);
                        })
                    resetHistoryPay()
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
                }}
                onHide={hideDialog}>
                <>
                    <Toast ref={toast} />
                    {purchaseTemplate()}
                    <div className="mb-4">

                        <div className="mr-input-lg">
                            <label htmlFor="label" className="block mb-2 text-left" >Số tiền</label>
                            <InputNumber
                                value={PayAmount}
                                min={0}
                                onChange={(e) => {
                                    setPayAmount(e.value)
                                }} type="text" className='w-full' />
                        </div>
                        <div className="label-balance">
                            <p>Số còn phải thanh toán:</p>
                            <b>{formatNumberWithThousandSeparator(
                                (Number(product[0]?.extra) ?? 0) - (PayAmount ?? 0) - (historyPay?.Payed ?? 0) <= 0
                                    ? 0
                                    : (Number(product[0]?.extra) ?? 0) - (PayAmount ?? 0) - (historyPay?.Payed ?? 0)
                            )}</b>
                        </div>
                    </div>
                    <TabView >
                        <TabPanel header="Danh sách thanh toán">
                            <DataTable
                                value={historyPay?.OrderPays}
                                className="p-datatable-gridlines mb-4"
                                dataKey="Id"
                            >
                                <Column
                                    header="Stt"
                                    body={(rowData, options) => {
                                        return options.rowIndex + 1;
                                    }
                                    }
                                />
                                <Column
                                    header="Ngày thanh toán"
                                    body={
                                        (rowData) => {
                                            return rowData.PayDate ? formatDate(rowData.PayDate) : "";

                                        }
                                    }
                                />
                                <Column
                                    header="Số tiền"
                                    body={
                                        (rowData) => {
                                            return formatNumberWithThousandSeparator(rowData.Value)
                                        }
                                    }
                                />



                            </DataTable>
                        </TabPanel>
                        <TabPanel header="Gói đã mua">

                            <DataTable
                                value={historyOrder}
                                className="p-datatable-gridlines mb-4"
                                dataKey="Id"
                            >
                                <Column
                                    header="Thao tác"
                                    style={{
                                        width: "80px"
                                    }}
                                    body={(rowData, options) => {
                                        return !rowData.DeliveryDate ? <Button style={{ borderRadius: "50%" }} icon="pi pi-pencil" onClick={() => handleShowDetailOrder(rowData.Id)} /> : ""
                                    }
                                    }
                                />
                                <Column
                                    header="Stt"
                                    body={(rowData, options) => {
                                        return options.rowIndex + 1;
                                    }
                                    }
                                />

                                <Column
                                    header="Ngày hoàn thành gói"
                                    body={
                                        (rowData) => {
                                            return rowData.CompletedDate ? formatDate(rowData.CompletedDate) : "";

                                        }
                                    }
                                />
                                <Column
                                    header="Tên khách hàng"
                                    field="NameSale"
                                />
                                <Column
                                    header="Địa chỉ khách hàng"
                                    field="AddressSale"
                                />
                                <Column
                                    header="Số điện thoại"
                                    field="MobileSale"
                                />

                                <Column
                                    header="Số tiền"
                                    body={
                                        (rowData) => {
                                            return formatNumberWithThousandSeparator(rowData.Value)
                                        }
                                    }
                                />
                                <Column
                                    header="Ngày gửi gói" filter
                                    showFilterMenu={false}
                                    style={{ minWidth: '140px' }}

                                    field='DeliveryDate'
                                    dataType="date"
                                    body={(rowData) => {
                                        return rowData.DeliveryDate ? formatDate(rowData.DeliveryDate) : ""
                                    }}

                                />


                            </DataTable>
                        </TabPanel>

                    </TabView>


                    <div>
                        <div className="flex ml-auto justify-content-center gap-3">
                            <Button className='btn-pri' label="Mua Combo" onClick={handleBuyCombo} />
                        </div>
                    </div>
                    <Messages ref={message} />
                </>


            </Dialog ></>
    )
}
export default PurchaseDialogCombo