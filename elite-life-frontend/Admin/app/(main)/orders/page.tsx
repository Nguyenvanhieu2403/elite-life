'use client';
import { useRouter } from "next/navigation";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressBar } from 'primereact/progressbar';
import { Slider } from 'primereact/slider';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import UserActivitiesService from '../../../service/HistoryAccountService';
import { User } from '../../../types/types';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import moment from "moment";
import { Dialog } from 'primereact/dialog';
import { LazyStateFilterObject, LazyStateObject } from '../../../types/models/filter';
import { exportExcelFromGrid, formatDate, formatDateHour, isJsonString, processFilter } from '../../../common/common';
import { Messages } from 'primereact/messages';
import { DefaultResponse } from '../../../types/models/defaultResponse';
import OrderService from "../../../service/OrderService";
import { catchAxiosError } from "../../../common/commonTSX";
import DetailPage from "./Detail";

const UserActivities = () => {
   
    return (
        <div className="grid">
            <div className="col-12">
                <ConfirmDialog />

                <div className="card">
                    <h3>Quản lý đơn hàng</h3>
                    <DetailPage />

                </div>

            </div>
        </div>
    );
};

export default UserActivities;
