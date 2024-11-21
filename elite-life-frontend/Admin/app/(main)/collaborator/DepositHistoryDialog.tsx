import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { Messages } from "primereact/messages";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { Teacher } from "../../../types/types";
import { InputValue } from '../../../types/models/dropdownInput';
import { RadioButtonChangeEvent } from "primereact/radiobutton";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import moment from "moment";
import { DefaultResponse } from "../../../types/models/defaultResponse";
import { catchAxiosError, displayErrorMessage } from "../../../common/commonTSX";
import { classNames } from "primereact/utils";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DialogStyle, DropdownSizeLoadding, PageSize } from "../../../common/config";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import CollaboratorService from "../../../service/CollaboratorService";
import { TeacherModal } from "../../../types/models/teacher";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { formatDate, formatNumberWithThousandSeparator, processFilter } from "../../../common/common";
import { Column } from "primereact/column";
import { LazyStateObject } from "../../../types/models/filter";

interface ComponentProp {
    visible: boolean,
    toggleDialog: () => void;
    toggleAction: string;
    onSaveCallback: () => void;
    currentId: number | null
}

const DepositHistoryDialog = ({ visible, toggleDialog, toggleAction, onSaveCallback, currentId }: ComponentProp) => {
    const router = useRouter();
    const message = useRef<Messages>(null);
    const toast = useRef<Toast>(null);
    const [submitted, setSubmitted] = useState(false);

    const [AvailableDeposit, setAvailableDeposit] = useState<number | null>(0);
    const [Note, setNote] = useState<string | undefined>("");

    const handleDepositCollab = () => {
        message.current?.clear();
        if (AvailableDeposit == 0) {
            return
        }
        setSubmitted(true);
        if (currentId) {
            CollaboratorService.deposit(currentId, AvailableDeposit ?? 0, Note)
                .then((response: DefaultResponse) => {
                    if (response.status == true) {
                        setSubmitted(false)
                        retrieveWalletDetail();
                        setAvailableDeposit(0)
                        setNote("")
                        onSaveCallback()
                    } else {
                        displayErrorMessage({ isExport: false, message, response })
                    }
                })
                .catch((e) => {
                    catchAxiosError({
                        e, router, toast
                    })
                });
        }
    };
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: PageSize,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            Note: { value: null, matchMode: FilterMatchMode.CONTAINS },

        }
    }
    const [lazyState, setlazyState] = useState(lazyStateDefault);

    const retrieveWalletDetail = () => {
        if (!currentId) return;
        var currentPage = lazyState.page ? lazyState.page + 1 : 1;
        var filterProcess = {}
        CollaboratorService.getWalletDetails(currentId, currentPage, lazyState.rows, filterProcess)
            .then((response: DefaultResponse) => {
                if (response.status) {
                    const data: Teacher = response.data
                    setDepositHistory(data)
                    setTotalRecords(response.total ?? 0)

                }
            })
            .catch((e: any) => {
                catchAxiosError({ e, router, toast })
            });
    }
    const [depositHistory, setDepositHistory] = useState<any>()
    useEffect(() => {
        if (toggleAction == "DEPOSIT" && currentId != null) {
            retrieveWalletDetail()
            setSubmitted(false)

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleAction, currentId, lazyState]);
    const onFilter = (event: any) => {
        setlazyState(event);
    }
    const onPage = (event: any) => {
        setlazyState(event);
    }
    const [totalRecords, setTotalRecords] = useState(0);


    return (
        <>
            <Dialog visible={visible}
                style={{ width: DialogStyle.width.small }}
                header="Nạp tiền"
                modal
                blockScroll
                draggable={false}
                className="p-fluid"
                onHide={() => {
                    setAvailableDeposit(null)
                    setNote("")
                    toggleDialog()
                }}>
                <>
                    <div className=''>
                        <div className="field">
                            <label htmlFor="Name" className="" >Số tiền:</label>

                            <InputNumber
                                id="AvailableDeposit"
                                value={AvailableDeposit}
                                onValueChange={(e) => setAvailableDeposit(e.value ?? null)}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !AvailableDeposit
                                })}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="Note" className="" >Ghi chú:</label>
                            <InputText
                                id="Note"
                                value={Note}
                                onChange={(e) => setNote(e.target.value ?? null)}
                            />
                        </div>
                    </div>
                    <DataTable
                        value={depositHistory}
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[10, 25, 50]}
                        currentPageReportTemplate="{first} - {last} of {totalRecords} items"
                        lazy
                        onPage={onPage}
                        totalRecords={totalRecords}
                        rows={lazyState.rows}
                        first={lazyState.first}
                        className="p-datatable-gridlines"
                        dataKey="Id"
                        emptyMessage="No data found."
                    >
                        <Column
                            header="Stt"
                            body={(rowData, options) => {
                                return options.rowIndex + 1;
                            }
                            }
                        />
                        <Column
                            header="Số tiền"
                            body={(rowData) => {
                                return formatNumberWithThousandSeparator(rowData.Value)
                            }}
                        />
                        <Column
                            field="Note"
                            header="Ghi chú"
                        />
                        <Column
                            header="Ngày tạo"
                            body={
                                (rowData) => {
                                    return rowData.CreatedAt ? formatDate(rowData.CreatedAt) : "";

                                }
                            }
                        />
                    </DataTable>

                    <div className="flex w-18rem ml-auto justify-content-center gap-3 mt-5">
                        <Button className='btn-pri' label="Lưu" onClick={handleDepositCollab} />
                        <Button className='btn-sec' label="Bỏ qua" onClick={() => {
                            toggleDialog()
                            setAvailableDeposit(null)
                            setNote("")
                        }} />
                    </div>
                    <Messages ref={message} />
                </>
            </Dialog>
        </>
    )


}

export default DepositHistoryDialog