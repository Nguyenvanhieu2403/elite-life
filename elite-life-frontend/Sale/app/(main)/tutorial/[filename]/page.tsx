'use client';
import React, { useEffect, useRef, useState } from 'react';
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
    hotline: "Hotline",
    culture: "Văn Hoá Elite",
    legality: "Cơ sở pháp lý",
}
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

const Tutorial = () => {
    const { filename } = useParams();  // No type argument needed
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null)
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
    const onDocumentLoadSuccess = ({ numPages } : any) => {
      setNumPages(numPages);
    };
    useEffect(() => {
        if (filename) {
            setPdfFile(`${filename}.pdf`);
        }
    }, [filename]);

    const downloadPdf = async () => {
        setLoading(true); // Bắt đầu tải, cập nhật trạng thái loading
    
        try {
            // Đường dẫn tới file DOCX trong thư mục public
            const filePath = '/contractBuy.docx'; // Đảm bảo đường dẫn này đúng
    
            // Gọi file từ thư mục public
            const response = await fetch(filePath);
    
            // Kiểm tra nếu file tồn tại
            if (response.ok) {
                // Lấy dữ liệu file dưới dạng Blob
                const blob = await response.blob();
    
                // Tạo URL tạm thời cho Blob
                const downloadUrl = URL.createObjectURL(blob);
    
                // Tạo thẻ <a> để trigger việc tải file
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'Hợp đồng mua bán công ty.docx'; // Tên file tải về
                link.click(); // Bắt đầu tải file
    
                // Thông báo thành công
                toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Tải hợp đồng mua bán công ty thành công!', life: 3000 });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Tải hợp đồng mua bán công ty thất bại!', life: 3000 });
            }
        } catch (error) {
            // Nếu có lỗi xảy ra trong quá trình tải
            toast.current?.show({ severity: 'error', summary: 'Thất bại', detail: 'Tải hợp đồng mua bán công ty thất bại!', life: 3000 });
            console.error(error);
        } finally {
            setLoading(false); // Kết thúc việc tải, cập nhật lại trạng thái loading
        }
    }
    

    return (
        <>
            <Toast ref={toast} />
                <div id="loading" className="loading" style={{ display: loading == true ? "block" : "none" }}>
                    <ProgressSpinner />
                </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card card-pdf" >
                        {pdfFile ? (
                            <>
                                <h3>{TutorialFileName[pdfFile.replace(".pdf", "")]}</h3>
                                {/* <iframe src={`/tutorial/${pdfFile}`} width={"100%"} height={"95%"} /> */}
                                <Document
                                className={"pdfViewer"}
                                    
                                    file={`/tutorial/${pdfFile}`} 
                                    onLoadSuccess={onDocumentLoadSuccess}
                                >
                                    <Page pageNumber={pageNumber} />
                                </Document>
                                <div className='buttonSectionPdf'>
                                    <Button className='btnPrev' onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}>Previous</Button>
                                    <span>Page {pageNumber} of {numPages}</span>
                                    <Button className='btnNext' onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}>Next</Button>
                                </div>
                            </>
                        ) : (
                            <h3>Loading...</h3>
                        )}
                        {filename === 'legality' && (
                            <Button label="Tải hợp đồng mua bán công ty" icon="pi pi-download" onClick={downloadPdf} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Tutorial;