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
        const hasPermission = permissions.some((str) => str.includes(searchString));
        return hasPermission;
    }

    const model: AppMenuItem[] = [

        {
            label: '',
            icon: 'pi pi-fw pi-bookmark',
            items: [
                {
                    label: 'Trang chủ',
                    icon: 'pi pi-fw pi-home',
                    to: '/'
                },
                {
                    label: 'Quản lý khách hàng',
                    icon: 'pi pi-fw pi-briefcase',
                    to: '/refferals'
                },
                {
                    label: 'Quản lý hệ thống',
                    icon: 'pi pi-fw pi-user',
                    to: '/system'
                },
                {
                    label: 'Hướng dẫn sử dụng',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/tutorial/hdsd'
                },
                {
                    label: 'Về chúng tôi',
                    icon: 'pi pi-fw pi-user',
                    to: '/tutorial/about-us'
                },
                {
                    label: 'Hợp đồng đại lý',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/contract'
                },
                {
                    label: 'Chính sách kinh doanh',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/tutorial/business-policy'
                },
                {
                    label: 'Cơ sở pháp lý',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/tutorial/legality'
                },
                {
                    label: 'Văn hoá Elite',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: '/tutorial/culture'
                },
                {
                    label: 'Hotline: 0967364999',
                    icon: 'pi pi-fw pi-phone',
                    to: "tel:0967364999",
                    target: "_blank"
                },
                {
                    label: 'Zalo hỗ trợ chung',
                    icon: 'pi pi-fw pi-file-pdf',
                    to: 'https://zalo.me/g/hcwaid814',
                    target: "_blank"
                },
            ]
        }
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
