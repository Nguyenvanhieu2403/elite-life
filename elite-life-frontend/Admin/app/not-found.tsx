"use client";

import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import Link from 'next/link';
import { authorizeLogin } from "../middleware/authorize";
import { ProgressSpinner } from "primereact/progressspinner";

const NotFoundPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkLoginStatus = async () => {
        try {
            const isLogin = await authorizeLogin();

            if (!isLogin) {
                router.push('/auth/login');
            } else {
                router.push('/');

            }
        } catch (error) {
            console.error('Lỗi kiểm tra đăng nhập', error);
        }
    };


    useEffect(() => {
        checkLoginStatus();
    }, []);
    return (
        <React.Fragment>
            {isLoading ? (
                <div className=" flex justify-content-center surface-300 w-screen h-screen ">
                    <ProgressSpinner />
                </div>
            ) : (
                <div>
                </div>
            )}
        </React.Fragment>
    );
};

export default NotFoundPage;
