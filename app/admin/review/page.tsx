"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2, Upload } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { DialogClose } from "@radix-ui/react-dialog";
import { TableSkeleton } from "@/components/Skeletons";

interface Review {
  id: string;
  email: string;
  message: string;
}

export default function Component() {
  const [review, setReview] = useState<Review[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get(API_ENDPOINTS.CONTACT);
        setReview(response.data);
        setProducts(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("There was an error!", error);
      } finally {
      }
    }
    fetchUsers();
  }, [itemsPerPage]);

  const onGetExporProduct = async (title?: string, worksheetname?: string) => {
    try {
      setLoading(true);
      // Check if the action result contains data and if it's an array
      if (products && Array.isArray(products)) {
        const dataToExport = products.map((pro: any) => ({
          ID: pro.id,
          Email: pro.email,
          Ulasan: pro.message
        }));
        // Create Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `${title}.xlsx`);
        console.log(`Ekspor data ke ${title}.xlsx`);
        setLoading(false);
      } else {
        setLoading(false);
        console.log("#==================Ekspor Error")
      }
    } catch (error: any) {
      setLoading(false);
      console.log("#==================Ekspor Error", error.message);
    }
  };

  // delete
  const deleteReview = async (id: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.DELETE_CONTACT(id));
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteReview(id);
      setReview(review.filter((product) => product.id !== id));
      console.log(`Hapus review dengan id: ${id}`);
      setSuccessMessage("Ulasan berhasil dihapus");
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal menghapus review:', error);
      setErrorMessage("Gagal menghapus review");
      setIsLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = review.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  if (successMessage) {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
        <div className="flex items-center">
          <div className="py-1">
            <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/>
            </svg>
          </div>
          <p>{successMessage}</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
        <div className="flex items-center">
          <div className="py-1">
            <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"></svg>
          </div>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-50 p-4 md:p-6 lg:p-8 bg-white shadow-lg rounded-b-2xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <span>Halaman</span>
            <span>/</span>
            <span className="text-blue-600">Ulasan</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Ulasan</h1>
          </div>
        </div>

        {/* Search and Filter Section */}
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
            onClick={() => onGetExporProduct("Ulasan", "Ulasan")}
            className="bg-[#F4F7FE] rounded-xl text-gray-700 px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>{loading ? "Memproses..." : "Ekspor"}</span>
          </Button>
        </div>
      </div>
      

      {/* Table */}
      <div className="flex-grow overflow-auto px-2 sm:px-4">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <Table className="min-w-full border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    ID
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    Email
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-0 text-black text-center bg-gray-300">
                    Ulasan
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[100px] p-0 text-black text-center bg-gray-300">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-blue-500 text-[10px] sm:text-[12px] text-center">
                      {product.id}
                    </TableCell>
                    <TableCell className="text-[10px] sm:text-[12px] text-center">
                      {product.email}
                    </TableCell>
                    <TableCell className="text-[10px] sm:text-[12px] text-center">
                      {product.message}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-[#F13023] sm:opacity-80 sm:w-[70px] text-white w-[50px] p-2">
                                <Trash2 size={15} className="sm:mr-2" />
                                <span className="hidden sm:inline text-[12px]">
                                  Hapus
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
                              <DialogTitle>Konfirmasi Hapus</DialogTitle>
                              <DialogDescription className="text-black">
                                Apakah anda yakin ingin menghapus pesan <strong>{product.message}</strong>?
                              </DialogDescription>
                              <DialogFooter className="flex justify-end gap-2">
                                <DialogClose asChild>
                                  <Button>
                                    Batal
                                  </Button>
                                </DialogClose>
                                <Button className="bg-red-700 text-white" onClick={() => handleDelete(product.id)}>
                                  Hapus
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center p-2 mt-1 gap-4">
          <div className="text-xs sm:text-sm text-center sm:text-left w-full sm:w-auto">
            Menampilkan {indexOfFirstItem + 1} sampai {Math.min(indexOfLastItem, review.length)} dari {review.length}
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
