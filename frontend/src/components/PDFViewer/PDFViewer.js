import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import classNames from 'classnames/bind';
import styles from './PDFViewer.module.scss';

const cx = classNames.bind(styles);

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFViewer = ({ url }) => {
    const canvasRef = useRef(null);
    const [numPages, setNumPages] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [scale, setScale] = React.useState(1.5);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const loadPDF = async () => {
            try {
                setLoading(true);
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                setNumPages(pdf.numPages);
                
                // Render first page
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;
                setLoading(false);
            } catch (error) {
                console.error('Error loading PDF:', error);
                setLoading(false);
            }
        };

        if (url) {
            loadPDF();
        }
    }, [url, scale]);

    const changePage = async (newPage) => {
        if (newPage >= 1 && newPage <= numPages) {
            try {
                setLoading(true);
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(newPage);
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;
                setCurrentPage(newPage);
                setLoading(false);
            } catch (error) {
                console.error('Error changing page:', error);
                setLoading(false);
            }
        }
    };

    const handleZoom = (factor) => {
        setScale(prevScale => prevScale * factor);
    };

    return (
        <div className={cx('pdf-viewer')}>
            <div className={cx('toolbar')}>
                <div className={cx('navigation')}>
                    <button 
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                    >
                        Previous
                    </button>
                    <span>{`Page ${currentPage} of ${numPages || '-'}`}</span>
                    <button 
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage >= numPages || loading}
                    >
                        Next
                    </button>
                </div>
                <div className={cx('zoom')}>
                    <button onClick={() => handleZoom(0.8)}>Zoom Out</button>
                    <button onClick={() => handleZoom(1.2)}>Zoom In</button>
                </div>
            </div>
            <div className={cx('canvas-container')}>
                {loading && <div className={cx('loading')}>Loading...</div>}
                <canvas ref={canvasRef} className={cx('pdf-canvas')} />
            </div>
        </div>
    );
};

export default PDFViewer; 