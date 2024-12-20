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
const System = () => {
    const [expandedKeys, setExpandedKeys] = useState({});
    const [currentTreeValue, setCurrentTreeValue] = useState<any[]>([]);
    const router = useRouter();
    const toast = useRef<Toast>(null)
    // process show all tree

    const expandAll = () => {
        let _expandedKeys = {};
        for (let node of currentTreeValue) {
            expandNode(node, _expandedKeys);
        }
        setExpandedKeys(_expandedKeys);
    };
    // process show all tree
    const expandNode = (node: { children: string | any[]; key: string | number; }, _expandedKeys: { [x: string]: boolean; }) => {

        if (node.children && node.children.length) {
            _expandedKeys[node.key] = true;

            for (let child of node.children) {
                if(child.Name &&child.Name.includes("F3")){
                    continue;
                }
                expandNode(child, _expandedKeys);
            }
        }
    };

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
    const [stat, setStat] = useState<any>();
    const nodeTemplate = (node : any, options: any) => {
       
        let label = <div>{node.label}</div>;
        if(node.ParentId == null){
            label = <div className="firstNoteTreeView">{node.label}</div>
        }
        if (node.IsGroup) {
            label = <div className="isGroupTreeView">{node.label}</div>
        }

        return <span className={options.className}>{label}</span>;
    }
    function buildTreeView(data: DataItem[]): DataItem[] {
        const map: { [key: number]: DataItem } = {};
        const tree: DataItem[] = [];
        data.forEach(item => {
            let itemUsername = item.UserName;
            const rank = item.Rank ?? ""
            if(itemUsername){
                itemUsername = `${item.UserName} (${rank})`;
            }
            else{
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
    useEffect(() => {
        SystemService.get().then((response: DefaultResponse) => {
            setStat(response.data.totals)
            buildTreeView(response.data.dataRaw)
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        })
    }, [])
    useEffect(() => {
        expandAll();
    }, [currentTreeValue])
    return (
        <>
            <div className="card">
                <h3 onClick={expandAll}>Quản lý hệ thống</h3>
                <div className="dashboard-head">
                    <div className="dashboard-statisic-card bg-1">
                        <p>Tổng doanh thu</p>
                        <h3>{formatNumberWithThousandSeparator(stat?.TotalRevenue, true)}</h3>
                    </div>
                    <div className="dashboard-statisic-card bg-2">
                        <p>Tổng thành viên</p>
                        <h3>{formatNumberWithThousandSeparator(stat?.total, false)}</h3>
                    </div>
                    <div className="dashboard-statisic-card bg-3">
                        <p>Thành viên DL0</p>
                        <h3>{formatNumberWithThousandSeparator(stat?.F1, false)}</h3>
                    </div>
                    <div className="dashboard-statisic-card bg-4">
                        <p>Thành viên DL1</p>
                        <h3>{formatNumberWithThousandSeparator(stat?.F2, false)}</h3>
                    </div>
                    <div className="dashboard-statisic-card bg-6">
                        <p>Thành viên DL2</p>
                        <h3>{formatNumberWithThousandSeparator(stat?.F3, false)}</h3>
                    </div>
                </div>
                <Tree onToggle={(e) => setExpandedKeys(e.value)} expandedKeys={expandedKeys} nodeTemplate={nodeTemplate} value={currentTreeValue} className="w-full" />
            </div>
           
        </>
    );
};

export default System;
