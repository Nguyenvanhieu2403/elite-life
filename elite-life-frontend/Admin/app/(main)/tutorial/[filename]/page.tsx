'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
const TutorialFileName: Record<string, string> = {
    hdsd: "Hướng dẫn sử dụng",
    "about-us": "Về chúng tôi",
    zalo: "Zalo hỗ trợ chung",
    telegram: "Telegram",
    'technical-support': "Hỗ trợ kĩ thuật",
    'franchise-contract': "Hợp đồng đại lý",
    'business-policy': "Chính sách kinh doanh",
    'sale-policy': "Chính sách bán hàng",
    hotline: "Hotline"
}
const Tutorial = () => {
    const { filename } = useParams();  // No type argument needed
    const [pdfFile, setPdfFile] = useState<string | null>(null);

    useEffect(() => {
        if (filename) {
            setPdfFile(`${filename}.pdf`);
        }
    }, [filename]);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card" style={{ height: "calc(100vh - 165px)" }}>
                    {pdfFile ? (
                        <>
                            <h3>{TutorialFileName[pdfFile.replace(".pdf", "")]}</h3>
                            <iframe src={`/tutorial/${pdfFile}`} width={"100%"} height={"95%"} />
                        </>
                    ) : (
                        <h3>Loading...</h3>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tutorial;