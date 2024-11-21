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
    hotline: "Hotline",
    culture: "Văn Hoá Elite",
    legality: "Cơ sở pháp lý",
}
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from 'primereact/button';

const Tutorial = () => {
    const { filename } = useParams();  // No type argument needed
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
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

    return (
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
                </div>
            </div>
        </div>
    );
};

export default Tutorial;