// File: src/pages/category.tsx

"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ButtonAdd from "@/components/addButtonCategory";
import EditButton from "@/components/editButtonCategory";
import { Button } from "@/components/ui/button";
import { Loader2, Pen, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/Skeletons";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get(API_ENDPOINTS.CATEGORIES);
  return response.data;
};

const deleteCategory = async (id: string): Promise<void> => {
  await axios.delete(API_ENDPOINTS.DELETE_CATEGORY(id));
};

export default function CategoryPage() {
  const [products, setProducts] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCategories = useCallback(async () => {
    const categories = await fetchCategories();
    setProducts(categories);
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteCategory(id);
      setProducts(products.filter((product) => product.id !== id));
      console.log(`Hapus kategori dengan id: ${id}`);
      setSuccessMessage("Kategori berhasil dihapus");
      setIsLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.reason || "Gagal menghapus kategori";
        setErrorMessage(errorMessage);
        setIsLoading(false);
      } else {
        console.error("Gagal menghapus kategori:", error);
        setErrorMessage("Terjadi kesalahan yang tidak diketahui");
        setIsLoading(false);
      }
    }
  };

  // const openModal = (category: Category) => {
  //   setSelectedCategory(category);
  //   setIsModalOpen(true);
  // };
  
  const filteredCategories = products.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
            <span className="text-blue-600">Kategori</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kategori</h1>
            <div className="flex items-center space-x-3">
              <ButtonAdd 
                onCategoryAdded={refreshCategories} 
                onSuccess={(message) => setSuccessMessage(message)} 
                onError={(message) => setErrorMessage(message)} 
                onLoading={setIsLoading}
              />
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative">
            <Input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Cari menu berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto px-2 sm:px-4">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <Table className="min-w-full border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    ID Kategori
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    Nama
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-0 text-black text-center bg-gray-300">
                    Icon
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[150px] sm:w-[250px] p-0 text-black text-center bg-gray-300">
                    Deskripsi
                  </TableHead>
                  <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-0 text-black text-center bg-gray-300">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-blue-500 text-[10px] sm:text-[12px] text-center">
                      {product.id}
                    </TableCell>
                    <TableCell className="text-[10px] sm:text-[12px] text-center">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {product.icon && (
                          <img
                            src={`data:image/jpeg;base64,${product.icon}`}
                            alt={product.name}
                            className="max-w-[30px] max-h-[30px] sm:max-w-[50px] sm:max-h-[50px]"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] sm:text-[12px] text-center">
                      {product.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2">
                          <EditButton
                            category={product}
                            onCategoryEdited={refreshCategories}
                            onSuccess={(message) => setSuccessMessage(message)}
                            onError={(message) => setErrorMessage(message)}
                            onLoading={setIsLoading}
                          />
                          <Dialog>
                            <DialogTrigger asChild onClick={() => setSelectedCategory(product)}>
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
                                Apakah anda yakin ingin menghapus kategori <strong>{product.name}</strong>?
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
      </div>
    </div>
  );
}
