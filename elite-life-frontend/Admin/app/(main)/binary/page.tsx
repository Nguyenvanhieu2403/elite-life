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
// import { Tree } from "primereact/tree";
import { catchAxiosError } from "../../../common/commonTSX";
import { classNames } from "primereact/utils";
import CollaboratorService from "../../../service/CollaboratorService";
import Tree from "react-d3-tree";
const System = () => {
    const [expandedKeys, setExpandedKeys] = useState({});
    const [currentTreeValue, setCurrentTreeValue] = useState<any[]>([]);
    const router = useRouter();
    const toast = useRef<Toast>(null)
    // process show all tree




    useEffect(() => {
        CollaboratorService.getBinaryTree().then((response: DefaultResponse) => {
            if (response.data.orgChart) {
                console.log([response.data.orgChart])
                setCurrentTreeValue([response.data.orgChart])

            }
            // buildTreeView(response.data.orgChart)
        }).catch((e) => {
            catchAxiosError({
                e, router, toast
            })
        })
    }, [])

    const renderRectSvgNode = ({ nodeDatum, toggleNode }: any) => {
        return (
            <g>
                <rect x="-34" y="-32" rx="15" ry="15" width="65" height="45" fill="white" />
                <text
                    fontWeight={400}
                    x="0"
                    y="-20"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="11"
                    fill="black">
                    {nodeDatum.attributes.index}
                </text>
                <text
                    fontWeight={400}
                    x="0"
                    y="0"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="10"
                    fill="black">
                    {nodeDatum.name}
                </text>
                {nodeDatum.children.length > 0 ? (
                    <>
                        <circle r="8" cx="0" cy="12" fill="black" onClick={toggleNode} />
                        <text y="16" x="0" textAnchor="middle" fill="white" stroke="white" strokeWidth="1" onClick={toggleNode}>
                            {nodeDatum.__rd3t.collapsed ? "+" : "-"}
                        </text>
                    </>
                ) : ""}


            </g>
        )
    }
    useEffect(() => {
        // expandAll();
    }, [currentTreeValue])
    return (
        <>
            <div className="card">
                <h3>Sơ đồ cây nhị phân</h3>
                <div style={{ width: "100%", height: "90vh" }}>
                    {currentTreeValue.length > 0 ? <Tree pathFunc={"straight"}
                        branchNodeClassName="elite__node"
                        depthFactor={110}
                        separation={{
                            nonSiblings: 0.65,
                            siblings: 1
                        }}
                        renderCustomNodeElement={(rd3tProps) =>
                            renderRectSvgNode({ ...rd3tProps })
                        }
                        // renderCustomNodeElement={renderRectSvgNode}
                        orientation="vertical" data={currentTreeValue} /> : ""}
                </div>
            </div>

        </>
    );
};

export default System;
