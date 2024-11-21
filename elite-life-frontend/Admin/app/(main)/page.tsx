/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from "next/navigation";
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import Link from 'next/link';
import { Demo } from '../../types/types';
import { ChartData, ChartOptions } from 'chart.js';
import { LazyStateObject } from '../../types/models/filter';
import { Collaborators } from '../../types/models/collaborators';
import { Image } from 'primereact/image';
import { formatNumberWithThousandSeparator, processFilter, formatNumberToFix, formatDate } from '../../common/common';
import CollaboratorService from '../../service/CollaboratorService';
import { CollaboratorData, CollaboratorHome, DefaultResponse, HomePageResponse } from '../../types/models/defaultResponse';
import { Toast } from 'primereact/toast';
import { catchAxiosError } from "../../common/commonTSX";
import HomeService from "../../service/HomeService";
import { PageSize } from "../../common/config";
import { FilterMatchMode } from "primereact/api";

const lineData: ChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'Số Lượng',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
};

const Dashboard = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Demo.Product[]>([]);
    const menu1 = useRef<Menu>(null);
    const menu2 = useRef<Menu>(null);
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const toast = useRef<Toast>(null);

    const firstPage = 1;
    const limit = 10;
    const lazyStateDefault: LazyStateObject = {
        first: 0,
        rows: limit,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            "Name": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "UserName": { value: null, matchMode: FilterMatchMode.CONTAINS },
            "Rank": { value: null, matchMode: FilterMatchMode.CONTAINS },
        }
    }
    const dataTableRef = useRef(null);
    const [totalRecords, setTotalRecords] = useState(0)
    const [homeData, setHomeData] = useState<CollaboratorHome>();
    const [collaborators, setCollaborators] = useState<CollaboratorData[]>([]);
    const [lazyState, setlazyState] = useState(lazyStateDefault);
    const onFilter = (event: any) => {
        event['first'] = 0;
        setlazyState(event);
    }
    const onPage = (event: any) => {
        setlazyState(event);
    };


    const retrieveCollaborator = () => {
        var currentPage = lazyState.page ? lazyState.page + 1 : firstPage;
        var filterProcess = processFilter(lazyState);
        HomeService.get(currentPage, lazyState.rows, filterProcess)
            .then((response: HomePageResponse) => {
                setHomeData(response.data)
                setCollaborators(response.data.Collaborators)
                setTotalRecords(response.data.TotalSystemMembers)
            })
            .catch((e) => {
                catchAxiosError({
                    e, router, toast
                })

            });
    };

    useEffect(() => {
        // initial call
        retrieveCollaborator()
        const intervalTimer = 1000 * 15
        const intervalId = setInterval(() => {
            retrieveCollaborator();
        }, intervalTimer); // Set the desired interval in milliseconds

        return () => clearInterval(intervalId);
    }, [lazyState]);




    return (
        <>
            <div className="dashboard-head">
                <div className="dashboard-statisic-card bg-1">
                    <p>Tổng doanh thu</p>
                    <h3>{formatNumberWithThousandSeparator(homeData?.TotalRevenue)}</h3>
                </div>
                <div className="dashboard-statisic-card bg-2">
                    <p>Tổng combo đã bán</p>
                    <h3>{formatNumberWithThousandSeparator(homeData?.TotalOrdersSold)}</h3>
                </div>
                <div className="dashboard-statisic-card bg-3">
                    <p>Tổng hội viên hệ thống</p>
                    <h3>{formatNumberWithThousandSeparator(homeData?.TotalSystemMembers)}</h3>
                </div>
                <div className="dashboard-statisic-card bg-4">
                    <p>Tổng số khách hàng</p>
                    <h3>{formatNumberWithThousandSeparator((homeData?.TotalSystemMembers || 0) - (homeData?.TotalMembersIsSale || 0))}</h3>
                </div>
                <div className="dashboard-statisic-card bg-5">
                    <p>Tổng số thành viên</p>
                    <h3>{formatNumberWithThousandSeparator(homeData?.TotalMembersIsSale)}</h3>
                </div>
                <div className="dashboard-statisic-card bg-6">
                    <p>Tổng số thành viên VIP</p>
                    <h3>{formatNumberWithThousandSeparator(homeData?.TotalNumberOfVIPMembers)}</h3>
                </div>
            </div>
            <div className="card">
                <Toast ref={toast} />
                <div className="db-content">
                    <div className="db-title">
                        <h5>TOP thành viên</h5>
                        <div className="db-title-r">

                        </div>
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
                    emptyMessage="No data found."

                >
                    <Column
                        header="Rank"
                        body={(rowData, options) => {
                            return options.rowIndex + 1;
                        }
                        }
                    />
                    <Column
                        showFilterMenu={false}
                        field="UserName"
                        header="Tên đăng nhập"
                        filter
                        style={{ minWidth: '180px' }}
                    />
                    <Column
                        showFilterMenu={false}

                        field="Name"
                        header="Họ tên"
                        filter
                        style={{ minWidth: '180px' }}
                    />
                    <Column
                        header="Ngày gia nhập"
                        showFilterMenu={false}
                        filter
                        body={
                            (rowData) => {
                                return rowData.BeginDate ? formatDate(rowData.BeginDate) : "";

                            }
                        }
                    />
                    <Column
                        showFilterMenu={false}

                        field="Rank"
                        header="Cấp độ"
                        filter
                        style={{ maxWidth: '100px' }}
                    />
                    <Column
                        header="Số dư"
                        body={
                            (rowData) => {
                                return formatNumberWithThousandSeparator(rowData.Available)
                            }
                        }
                    />
                    <Column
                        header="HH Khách hàng"
                        body={
                            (rowData) => {
                                return formatNumberWithThousandSeparator(rowData.Customer)
                            }
                        }
                    />
                    <Column
                        header="HH đại lý"
                        body={
                            (rowData) => {
                                return formatNumberWithThousandSeparator(rowData.Sale)
                            }
                        }
                    />
                </DataTable>
            </div>
        </>

    );
};

export default Dashboard;
