import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print';


const usePrintInvoice = () => {
    const documentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => documentRef.current,
        documentTitle: `Invoice`,
        bodyClass: 'p-16',
        pageStyle: `
            @media print {
            .invoice-data {
                overflow: visible !important;
                height: auto !important;
            }
            }
        `,
    });

    return { documentRef, handlePrint };
};

export default usePrintInvoice;