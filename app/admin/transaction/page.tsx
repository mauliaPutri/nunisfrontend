"use client";

import React, { useEffect, useState } from "react";
import { Search, Upload, ChevronLeft, ChevronRight, Calendar, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ButtonDetail from "@/components/detailButton";
import axios from "axios";
import { BreadcrumbSkeleton, SearchSkeleton, ActionButtonSkeleton, TableSkeleton } from "@/components/Skeletons";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface User {
  id: string;
  nama: string;
  pictures: string;
  email: string;
  address: string;
  phone: string;
}
interface Item {
  id: number;
  name: string;
  faktur: string;
  kode_menu: string;
  jumlah: number;
  subtotal: number;
  total: number;
  diskon_persen: string;
  diskon_rupiah: string;
}
interface Transaksi {
  faktur: string;
  sub_total: number;
  user: User;
  no_telepon: string;
  alamat: string;
  item: string; // JSON string
  tanggal: string;
  total: number;
  diskon_persen: number;
  diskon_rupiah: number;
  detail_penjualan: Item[];
  notes: string;
  status: number;
}

export default function TransactionPage() {
  const [products, setProducts] = useState<Transaksi[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [exportType, setExportType] = useState<string>("all");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  // Fungsi untuk memformat waktu
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Fungsi untuk memeriksa transaksi baru
  const checkNewTransactions = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ALL_TRANSAKSI);
      const sortedData = response.data.sort((a: Transaksi, b: Transaksi) => {
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      });

      // Periksa apakah ada transaksi baru dengan status menunggu konfirmasi
      const newPendingTransactions = sortedData.filter((transaction: Transaksi) =>
        transaction.status === 0 &&
        !products.some(p => p.faktur === transaction.faktur)
      );

      if (newPendingTransactions.length > 0) {
        setShowAlert(true);
        setErrorMessage(`Ada ${newPendingTransactions.length} transaksi baru!`);
        setTimeout(() => setShowAlert(false), 3000);
      }

      setProducts(sortedData);
      setFilteredProducts(sortedData);
      setTotalPages(Math.ceil(sortedData.length / itemsPerPage));
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error("Gagal memeriksa transaksi baru:", error);
    }
  };

  useEffect(() => {
    async function fetchTransaksi() {
      try {
        const response = await axios.get(API_ENDPOINTS.ALL_TRANSAKSI);
        const sortedData = response.data.sort((a: Transaksi, b: Transaksi) => {
          return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
        });
        setProducts(sortedData);
        setFilteredProducts(sortedData);
        setTotalPages(Math.ceil(sortedData.length / itemsPerPage));
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error("Error fetching transaksi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransaksi();

    // Set up polling untuk memeriksa transaksi baru setiap 10 detik
    const interval = setInterval(checkNewTransactions, 10000);

    return () => clearInterval(interval);
  }, [itemsPerPage]);

  useEffect(() => {
    filterProducts();
  }, [startDate, endDate, products, itemsPerPage, searchTerm]);

  const filterProducts = () => {
    let filtered = [...products]; // Buat salinan array untuk diurutkan
    if (startDate && endDate) {
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.tanggal);
        return productDate >= new Date(startDate) && productDate <= new Date(endDate);
      });
    } else if (startDate) {
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.tanggal);
        const filterDate = new Date(startDate);
        return (
          productDate.getFullYear() === filterDate.getFullYear() &&
          productDate.getMonth() === filterDate.getMonth() &&
          productDate.getDate() === filterDate.getDate()
        );
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.faktur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.alamat.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Urutkan hasil filter berdasarkan tanggal terbaru
    filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const onGetPeriodicReport = async () => {
    try {
      setLoading(true);
      let dataToExport = [...products];

      if (exportStartDate && exportEndDate) {
        dataToExport = dataToExport.filter((transaction) => {
          const transactionDate = new Date(transaction.tanggal);
          return transactionDate >= new Date(exportStartDate) && transactionDate <= new Date(exportEndDate);
        });
      }

      if (dataToExport && Array.isArray(dataToExport)) {
        // Urutkan data berdasarkan tanggal ASCENDING
        dataToExport.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

        // Format data per transaksi
        const formattedData: any[] = [];
        let totalSubTotal = 0;
        let totalTotal = 0;
        dataToExport.forEach((transaction, idx) => {
          // Gabungkan item menu ke string, satu menu per baris
          const itemMenuStr = transaction.detail_penjualan
            .map((item: any) => `${item.name} = ${item.jumlah}`)
            .join('\n');

          formattedData.push([
            (idx + 1).toString(),
            new Date(transaction.tanggal).toLocaleDateString('en-US'),
            transaction.faktur,
            transaction.user.nama,
            itemMenuStr,
            transaction.diskon_persen ? transaction.diskon_persen + '%' : '',
            transaction.diskon_rupiah ? 'Rp. ' + transaction.diskon_rupiah : '',
            'Rp. ' + Number(transaction.sub_total).toLocaleString('id-ID'),
            'Rp. ' + Number(transaction.total).toLocaleString('id-ID'),
          ]);
          totalSubTotal += Number(transaction.sub_total);
          totalTotal += Number(transaction.total);
        });

        // Baris total
        formattedData.push([
          '', '', '', 'TOTAL', '', '', '',
          'Rp. ' + totalSubTotal.toLocaleString('id-ID'),
          'Rp. ' + totalTotal.toLocaleString('id-ID'),
        ]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([]);
        // Judul di atas
        XLSX.utils.sheet_add_aoa(worksheet, [["EKSPOR TRANSAKSI"]], { origin: 'A1' });
        // Header manual
        XLSX.utils.sheet_add_aoa(worksheet, [[
          'No', 'Tanggal', 'Faktur', 'Nama', 'Item Menu', 'Diskon Persen', 'Diskon Rupiah', 'Sub Total', 'Total'
        ]], { origin: 'A2' });
        // Data
        XLSX.utils.sheet_add_aoa(worksheet, formattedData, { origin: 'A3' });
        // Set lebar kolom
        worksheet['!cols'] = [
          { wch: 5 }, // No
          { wch: 15 }, // Tanggal
          { wch: 15 }, // Faktur
          { wch: 15 }, // Nama
          { wch: 30 }, // Item Menu
          { wch: 15 }, // DiskonPersen
          { wch: 15 }, // Diskon Rupiah
          { wch: 15 }, // Sub Total
          { wch: 15 }, // Total
        ];
        // Merge judul
        worksheet['!merges'] = worksheet['!merges'] || [];
        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

        const title = exportStartDate && exportEndDate ?
          `Ekspor Transaksi${exportStartDate} sampai ${exportEndDate}` :
          'Ekspor Semua Transaksi';

        XLSX.utils.book_append_sheet(workbook, worksheet, "Ekspor Transaksi");
        XLSX.writeFile(workbook, `${title}.xlsx`);
        setIsExportDialogOpen(false);
      } else {
        console.log("#==================Ekspor Error: Tidak ada data untuk diekspor");
      }
    } catch (error: any) {
      console.log("#==================Ekspor Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onExportPeriodicReportPDF = async () => {
    setLoading(true);
    let dataToExport = [...products];

    if (exportStartDate && exportEndDate) {
      dataToExport = dataToExport.filter((transaction) => {
        const transactionDate = new Date(transaction.tanggal);
        return transactionDate >= new Date(exportStartDate) && transactionDate <= new Date(exportEndDate);
      });
    }

    // Urutkan data berdasarkan tanggal ASCENDING
    dataToExport.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    // Kelompokkan transaksi per tanggal
    const grouped = dataToExport.reduce((acc: any, trx: any) => {
      const tgl = new Date(trx.tanggal).toLocaleDateString('id-ID');
      if (!acc[tgl]) {
        acc[tgl] = {
          menu: {},
          totalTransaksi: 0,
          totalDiskon: 0,
          totalPendapatan: 0,
          tanggalAsli: trx.tanggal
        };
      }
      acc[tgl].totalTransaksi += 1;
      acc[tgl].totalDiskon += Number(trx.diskon_rupiah);
      acc[tgl].totalPendapatan += Number(trx.total);
      trx.detail_penjualan.forEach((item: any) => {
        if (!acc[tgl].menu[item.name]) acc[tgl].menu[item.name] = 0;
        acc[tgl].menu[item.name] += item.jumlah;
      });
      return acc;
    }, {});

    // Urutkan tanggal dari awal ke akhir
    const groupedArr = Object.entries(grouped)
      .map(([tgl, data]: any) => ({ tgl, ...data }))
      .sort((a, b) => new Date(a.tanggalAsli).getTime() - new Date(b.tanggalAsli).getTime());

    // Data tabel
    const tableData = groupedArr.map((data: any, idx: number) => {
      const menuStr = Object.entries(data.menu)
        .map(([nama, jumlah]: any) => `${nama} = ${jumlah}`)
        .join('\n');
      return [
        (idx + 1).toString(),
        data.tgl,
        menuStr,
        data.totalTransaksi.toString(),
        `Rp. ${data.totalDiskon.toLocaleString('id-ID')}`,
        `Rp. ${data.totalPendapatan.toLocaleString('id-ID')}`,
      ];
    });

    // Baris total
    if (tableData.length > 0) {
      const totalTransaksi = groupedArr.reduce((a: number, b: any) => a + b.totalTransaksi, 0);
      const totalDiskon = groupedArr.reduce((a: number, b: any) => a + b.totalDiskon, 0);
      const totalPendapatan = groupedArr.reduce((a: number, b: any) => a + b.totalPendapatan, 0);
      tableData.push([
        '', 'Total', '', totalTransaksi.toString(), `Rp. ${totalDiskon.toLocaleString('id-ID')}`, `Rp. ${totalPendapatan.toLocaleString('id-ID')}`
      ]);
    }

    // Tentukan periode header
    let periodeString = '';
    if (exportStartDate && exportEndDate) {
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID');
      };
      periodeString = `Periode: ${formatDate(exportStartDate)} s.d. ${formatDate(exportEndDate)}`;
    } else if (dataToExport.length > 0) {
      const sortedByDate = [...dataToExport].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
      const firstDate = new Date(sortedByDate[0].tanggal);
      const lastDate = new Date(sortedByDate[sortedByDate.length - 1].tanggal);
      const formatDate = (date: Date) => date.toLocaleDateString('id-ID');
      periodeString = `Periode: ${formatDate(firstDate)} s.d. ${formatDate(lastDate)}`;
    }

    const getBase64FromUrl = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    const logoBase64 = await getBase64FromUrl('/LOGO NUNIS.jpg');
    const doc = new jsPDF();
    doc.addImage(logoBase64, 'JPEG', 28, 12, 35, 35);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("NUNIS WARUNG & KOFFIE", 120, 25, { align: "center" });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const alamat = "Jl. Raya Trenggalek - Ponorogo No.Km.7, RT.17/RW.4, Setono, Kec. Tugu, Kabupaten Trenggalek, Jawa Timur 66352";
    const alamatLines = doc.splitTextToSize(alamat, 100);
    doc.text(alamatLines, 120, 32, { align: "center" });

    doc.text("Telp: 08521764546 | Email: nuniswarung@gmail.com", 120, 45, { align: "center" });
    doc.setLineWidth(1.2);
    doc.line(15, 49, 195, 49);
    doc.setLineWidth(1.2);
    // Judul laporan
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("LAPORAN REKAPITULASI PENJUALAN", 105, 58, { align: "center" });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(periodeString, 105, 63, { align: "center" });
    const now = new Date();
    const tanggalCetak = `Tanggal Cetak: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    doc.setFontSize(10);
    doc.text(tanggalCetak, 105, 68, { align: "center" });

    // Tabel
    autoTable(doc, {
      startY: 75,
      head: [["No", "Tanggal", "Menu & Jumlah", "Total Transaksi", "Total Diskon", "Total Penjualan"]],
      body: tableData,
      styles: { fontSize: 9, cellWidth: 'wrap' },
      headStyles: { fillColor: [200, 200, 200], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      theme: 'grid',
    });

    // Footer
    doc.setFontSize(9);
    doc.text(
      `Dicetak otomatis oleh sistem pada ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`,
      105,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );

    doc.save(exportStartDate && exportEndDate ?
      `Laporan Rekapitulasi Penjualan${exportStartDate} sampai ${exportEndDate}.pdf` :
      'Laporan Rekapitulasi Semua Penjualan.pdf');
    setLoading(false);
  };

  const handleStatusChange = async (faktur: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      const response = await axios.post(API_ENDPOINTS.UPDATE_STATUS_BY_FAKTUR, {
        faktur: faktur,
        status: parseInt(newStatus),
      });
      setIsSuccess(true);
      setErrorMessage("Status pesanan berhasil diperbarui");
      setShowAlert(true);

      // Update status langsung di state tanpa perlu refresh
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => {
          if (product.faktur === faktur) {
            return {
              ...product,
              status: parseInt(newStatus)
            };
          }
          return product;
        });
        return updatedProducts;
      });

      setFilteredProducts(prevFiltered => {
        const updatedFiltered = prevFiltered.map(product => {
          if (product.faktur === faktur) {
            return {
              ...product,
              status: parseInt(newStatus)
            };
          }
          return product;
        });
        return updatedFiltered;
      });

      setTimeout(() => setShowAlert(false), 1000);
    } catch (error) {
      console.error("Ada kesalahan saat mengubah status:", error);
      setIsSuccess(false);
      setErrorMessage("Gagal mengubah status pesanan. Silakan coba lagi.");
      setShowAlert(true);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (new Date(e.target.value) > new Date(endDate)) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleExportStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportStartDate(e.target.value);
    if (new Date(e.target.value) > new Date(exportEndDate)) {
      setExportEndDate("");
    }
  };

  const handleExportEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportEndDate(e.target.value);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const clearExportDateFilter = () => {
    setExportStartDate("");
    setExportEndDate("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {showAlert && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in-down">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z" />
              </svg>
            </div>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
      <div className="sticky top-0 z-50 p-4 md:p-6 lg:p-8 bg-white shadow-lg rounded-b-2xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <span>Halaman</span>
            <span>/</span>
            <span className="text-blue-600">Transaksi</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Transaksi</h1>
            <div className="text-sm text-gray-500">
              Terakhir diperbarui: {isClient ? formatTime(lastUpdateTime) : '-'}
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
              <Input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Cari berdasarkan ID Pesanan, Nama, atau Alamat"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar size={20} className="text-gray-500 hidden sm:block" />
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-[130px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="whitespace-nowrap text-xs sm:text-sm">-</span>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
                className="w-[130px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <Button
                onClick={clearDateFilter}
                variant="outline"
                className="bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Bersihkan</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-[150px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
              <option value={100}>100 per halaman</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              <span>Ekspor</span>
            </Button>
          </div>
        </div>

        {isExportDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors"
              onClick={() => {
                setIsExportDropdownOpen(false);
                setIsExportDialogOpen(true);
                setExportType('all');
              }}>
              Rekapitulasi Transaksi (.xlsx)
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors"
              onClick={() => {
                setIsExportDropdownOpen(false);
                setIsExportDialogOpen(true);
                setExportType('pdf');
              }}>
              Laporan Rekapitulasi Penjualan (.pdf)
            </div>
          </div>
        )}
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="w-[95%] md:w-[80%] lg:w-[60%] xl:w-[40%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg lg:text-xl font-semibold text-center md:text-left">
              {exportType === 'all' ? 'Ekspor Transaksi' : 'Laporan Rekapitulasi Penjualan'}
            </DialogTitle>
          </DialogHeader>

          {exportType === 'all' && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Calendar size={20} className="text-gray-500 hidden sm:block" />
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={handleExportStartDateChange}
                    className="w-[130px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="whitespace-nowrap text-xs sm:text-sm"> - </span>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={handleExportEndDateChange}
                    min={exportStartDate}
                    className="w-[130px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <Button onClick={clearExportDateFilter} className="bg-[#F4F7FE] hover:bg-gray-200 text-gray-700 text-xs sm:text-sm transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <DialogClose asChild>
                    <Button variant="outline" className="text-xs sm:text-sm">Batal</Button>
                  </DialogClose>
                  <Button onClick={onGetPeriodicReport} className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700">
                    {loading ? "Loading..." : "Ekspor Transaksi"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {exportType === 'pdf' && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Calendar size={20} className="text-gray-500 hidden sm:block" />
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={handleExportStartDateChange}
                    className="w-[130px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="whitespace-nowrap text-xs sm:text-sm"> - </span>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={handleExportEndDateChange}
                    min={exportStartDate}
                    className="w-[130px] bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <Button onClick={clearExportDateFilter} className="bg-[#F4F7FE] hover:bg-gray-200 text-gray-700 text-xs sm:text-sm transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <DialogClose asChild>
                    <Button variant="outline" className="text-xs sm:text-sm">Batal</Button>
                  </DialogClose>
                  <Button onClick={onExportPeriodicReportPDF} className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700">
                    {loading ? "Loading..." : "Ekspor Laporan"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Table */}
      <div className="flex-grow overflow-auto px-2 sm:px-4">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <Table className="min-w-full border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    ID Pesanan
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    Nama
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Tanggal
                  </TableHead>
                  {/* <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Diskon %
                  </TableHead> */}
                  <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Diskon
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Sub Total
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[100px] sm:w-[150px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Total
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[100px] p-0 text-black text-center bg-gray-300">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[100px] p-0 text-black text-center bg-gray-300">
                    Detail
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((product) => (
                  <TableRow key={product.faktur}>
                    <TableCell className="text-blue-500 text-[10px] sm:text-[12px] text-center">
                      {product.faktur}
                    </TableCell>
                    <TableCell className="text-blue-500 text-[10px] sm:text-[12px] text-center">
                      {product.user.nama}
                    </TableCell>
                    <TableCell className="text-center text-[10px] sm:text-[12px] hidden md:table-cell">
                      {new Date(product.tanggal).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell className="text-center hidden text-[10px] sm:text-[12px] md:table-cell">
                      {product.diskon_persen}%
                    </TableCell> */}
                    <TableCell className="text-center hidden text-[10px] sm:text-[12px] md:table-cell">
                      Rp. {product.diskon_rupiah}
                    </TableCell>
                    <TableCell className="text-center text-[10px] sm:text-[12px] hidden md:table-cell">
                      Rp. {product.sub_total}
                    </TableCell>
                    <TableCell className="text-center hidden text-[10px] sm:text-[12px] md:table-cell">
                      Rp. {product.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-[10px] sm:text-[12px]">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.faktur, e)}
                        className={`rounded-xl px-2 py-1 ${product.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                            product.status === 1 ? 'bg-blue-100 text-blue-800' :
                              product.status === 2 ? 'bg-purple-100 text-purple-800' :
                                product.status === 3 ? 'bg-orange-100 text-orange-800' :
                                  product.status === 4 ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                          }`}
                      >
                        <option value={0} className="bg-yellow-100 text-yellow-800">Menunggu Konfirmasi</option>
                        <option value={1} className="bg-blue-100 text-blue-800">Pesanan Diterima</option>
                        <option value={2} className="bg-purple-100 text-purple-800">Sedang Diproses</option>
                        <option value={3} className="bg-orange-100 text-orange-800">Pesanan Siap</option>
                        <option value={4} className="bg-emerald-100 text-emerald-800">Pesanan Selesai</option>
                        <option value={5} className="bg-red-100 text-red-800">Pesanan Dibatalkan</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-center">
                      <ButtonDetail itemmu={product} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center p-2 mt-1 gap-4">
          <div className="text-xs sm:text-sm text-center sm:text-left w-full sm:w-auto">
            Menampilkan {indexOfFirstItem + 1} sampai {Math.min(indexOfLastItem, filteredProducts.length)} dari {filteredProducts.length}
          </div>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 w-full sm:w-auto">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-[#F4F7FE] text-gray-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <ChevronLeft size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-[#F4F7FE] text-gray-700'
                  } h-8 sm:h-10 min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm px-2 sm:px-4`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-[#F4F7FE] text-gray-700 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <ChevronRight size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
