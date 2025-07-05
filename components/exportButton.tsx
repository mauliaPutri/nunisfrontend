"use client"
import React, { useState } from 'react'
import * as XLSX from "xlsx";
import { Button } from './ui/button';

export const ExportButton  = async (title?: string, worksheetname?: string) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    try {
        setLoading(true);
        const response = await fetch('https://fakestoreapi.com/products');
        // Check if the action result contains data and if it's an array
        if (products && Array.isArray(products)) {
            const dataToExport = products.map((pro: any) => ({
                title: pro.title,
                price: pro.lastname,
                category: pro.category,
                description: pro.description,
            })
                ,);
            // Create Excel workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
            XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
            // Save the workbook as an Excel file
            XLSX.writeFile(workbook, `${title}.xlsx`);
            console.log(`Data berhasil diekspor ke ${title}.xlsx`);
            setLoading(false);
        } else {
            setLoading(false);
            console.log("#==================Ekspor Error")
        }
    } catch (error: any) {
        setLoading(false);
        console.log("#==================Ekspor Error", error.message);

    }
    return (
        <Button className="bg-[#F4F7FE] rounded-full text-gray-700 px-4 py-2 flex items-center">
            <span className="mr-2">
                {/* <Upload size={15} /> */}
            </span>{" "}
            Export
        </Button>
    )
}
