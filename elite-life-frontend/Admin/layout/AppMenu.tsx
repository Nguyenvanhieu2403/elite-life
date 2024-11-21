/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '../types/types';
import { getPermissions } from '../middleware/authorize';
import { Permissions } from '../common/config';
import { Menu } from 'primereact/menu';
const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    function checkPermissionAuth(searchString: string): boolean {
        const permissions = getPermissions();
        const hasPermission = permissions.some((str) => str == searchString);
        return hasPermission;
    }
    function getMenuItems(): AppMenuItem[] {
        var menuItem: AppMenuItem[] = [
            {
                label: 'Trang chủ',
                icon: 'pi pi-fw pi-home',
                to: '/'
            },
        ];

        if (checkPermissionAuth(Permissions.Collaborator)) {
            menuItem.push({
                label: 'Danh sách thành viên',
                icon: 'pi pi-fw pi-briefcase',
                to: '/collaborator'
            })
        }
        if (checkPermissionAuth(Permissions.Order)) {
            menuItem.push(
                {
                    label: 'Quản lý đơn hàng',
                    icon: 'pi pi-fw pi-cart-plus',
                    to: '/orders'
                }
            )
        }
        if (checkPermissionAuth(Permissions.WithdrawalRequests)) {
            menuItem.push(
                {
                    label: 'Quản lý yêu cầu rút tiền',
                    icon: 'pi pi-fw pi-dollar',
                    to: '/withdraw-requests'
                })
        }
        if (checkPermissionAuth(Permissions.Contract)) {
            menuItem.push(
                {
                    label: 'Quản lý hợp đồng đại lý',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/contract'
                })
        }
        if (checkPermissionAuth(Permissions.BinaryTree)) {
            menuItem.push(
                {
                    label: 'Sơ đồ cây nhị phân',
                    icon: 'pi pi-fw pi-chart-bar',
                    to: '/binary'
                }
            )
        }
        if (getMenuSystermItems() && getMenuSystermItems().length > 0)
            menuItem.push({
                label: 'Quản trị hệ thống',
                icon: 'pi pi-fw pi-cog',
                items: getMenuSystermItems()
            });
        menuItem.push({
            label: 'Hướng dẫn sử dụng',
            icon: 'pi pi-fw pi-file-pdf',
            to: '/tutorial/hdsd'
        })
        return menuItem;
    }

    function getMenuSystermItems(): AppMenuItem[] {
        var menuAuthItem = [
        ];
        if (checkPermissionAuth(Permissions.User)) {
            menuAuthItem.push({
                label: 'Quản lý tài khoản',
                icon: 'pi pi-fw pi-circle',
                to: '/user'
            });
        }
        if (checkPermissionAuth(Permissions.Permission)) {
            menuAuthItem.push({
                label: 'Danh mục quyền',
                icon: 'pi pi-fw pi-circle',
                to: '/permissions'
            });
        }
        if (checkPermissionAuth(Permissions.Role)) {
            menuAuthItem.push({
                label: 'Quản lý Nhóm quyền',
                icon: 'pi pi-fw pi-circle',
                to: '/role'
            });
        }

        //     menuAuthItem.push({
        //         label: 'Danh mục Sản phẩm',
        //         icon: 'pi pi-fw pi-circle-off',
        //         to: '/product'
        if (checkPermissionAuth(Permissions.UserActivities)) {
            menuAuthItem.push({
                label: 'Lịch sử hoạt động',
                icon: 'pi pi-fw pi-circle-off',
                to: '/userActivities'
            });
        }
        if (checkPermissionAuth(Permissions.UserAccessHitories)) {
            menuAuthItem.push({
                label: 'Lịch sử truy cập tài khoản',
                icon: 'pi pi-fw pi-circle-off',
                to: '/history-account'
            });
        }
        ///
        return menuAuthItem;
    }

    const model: AppMenuItem[] = [
        {
            label: '',
            icon: 'pi pi-fw pi-bookmark',
            items: getMenuItems()
        },

    ];


    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return <AppMenuitem item={item} root={true} index={i} key={item.label} />;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
