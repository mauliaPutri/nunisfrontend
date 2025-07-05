"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, ChevronLeft, ChevronRight, Loader2, Upload, Shield, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface User {
  id: string;
  nama: string;
  pictures: string;
  email: string;
  address: string;
  phone: string;
  status: number;
}

export default function Component() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      // setIsLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.GET_USER, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        setUsers(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("There was an error!", error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [itemsPerPage]);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(API_ENDPOINTS.DELETE_USER(id), {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.filter((user) => user.id !== id);
          setTotalPages(Math.ceil(updatedUsers.length / itemsPerPage));
          return updatedUsers;
        });
        setSuccessMessage("User berhasil dihapus");
      }
    } catch (error: any) {
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.reason || error.response.data.Error || "Terjadi kesalahan saat menghapus pengguna"
        : "Terjadi kesalahan yang tidak diketahui";
      
      setErrorMessage(errorMessage);
      console.error("Gagal menghapus pengguna:", error);
    } finally {
      setIsLoading(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem).reverse();

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (email: string, newStatus: number) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.UPDATE_USER_STATUS(email),
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update user status di state lokal
        setUsers(users.map(user => 
          user.email === email ? { ...user, status: newStatus } : user
        ));
        setSuccessMessage(response.data.message || "Status pengguna berhasil diperbarui");
      } else {
        setErrorMessage(response.data.message || "Gagal memperbarui status pengguna");
      }
    } catch (error: any) {
      console.error("Terjadi kesalahan saat memperbarui status:", error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat memperbarui status pengguna");
      }
    } finally {
      setIsLoading(false);
    }
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
            <span className="text-blue-600">Pengguna</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pengguna</h1>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative">
            <Input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Cari berdasarkan nama atau email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow overflow-auto px-2 sm:px-4">
        <Table className="min-w-full border text-sm sm:text-base">
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-1 sm:p-2 text-black text-center bg-gray-300">
                ID User
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-1 sm:p-2 text-black text-center bg-gray-300">
                Gambar
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[60px] sm:w-[90px] p-1 sm:p-2 text-black text-center bg-gray-300">
                Nama
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[150px] sm:w-[250px] p-1 sm:p-2 text-black text-center bg-gray-300 hidden md:table-cell">
                Email
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[150px] sm:w-[250px] p-1 sm:p-2 text-black text-center bg-gray-300 hidden md:table-cell">
                Alamat
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[150px] sm:w-[250px] p-1 sm:p-2 text-black text-center bg-gray-300 hidden md:table-cell">
                No Telp
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[150px] sm:w-[250px] p-1 sm:p-2 text-black text-center bg-gray-300 hidden md:table-cell">
                Status
              </TableHead>
              <TableHead className="text-[11px] sm:text-[13px] w-[80px] sm:w-[100px] p-1 sm:p-2 text-black text-center bg-gray-300">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-blue-500 text-center text-xs sm:text-sm">
                  {user.id}
                </TableCell>
                <TableCell className="text-black text-center p-1 sm:p-2">
                  {user.pictures && (
                    <Image
                      src={user.pictures}
                      alt={user.nama}
                      width={40}
                      height={40}
                      className="mx-auto max-w-[30px] sm:max-w-[40px] max-h-[30px] sm:max-h-[40px]"
                    />
                  )}
                </TableCell>
                <TableCell className="text-center text-xs sm:text-sm">
                  {user.nama}
                </TableCell>
                <TableCell className="text-center text-xs sm:text-sm hidden md:table-cell">
                  {user.email}
                </TableCell>
                <TableCell className="text-center text-xs sm:text-sm hidden md:table-cell">
                  {user.address}
                </TableCell>
                <TableCell className="text-center text-xs sm:text-sm hidden md:table-cell">
                  {user.phone}
                </TableCell>
                <TableCell className="text-center text-xs sm:text-sm hidden md:table-cell">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="hover:bg-gray-100"
                        onClick={() => setSelectedUser(user)}
                      >
                        {user.status === 1 ? "Admin" : user.status === 2 ? "Pengguna" : user.status}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
                      <DialogTitle>Ubah Status Pengguna</DialogTitle>
                      <DialogDescription className="text-black">
                        Pilih status baru untuk pengguna <strong>{user.nama}</strong>
                      </DialogDescription>
                      <div className="flex flex-col gap-4 py-4">
                        <Button 
                          variant={user.status === 1 ? "default" : "outline"}
                          onClick={() => handleUpdateStatus(user.email, 1)}
                          className="w-full"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Admin</span>
                          </div>
                        </Button>
                        <Button
                          variant={user.status === 2 ? "default" : "outline"} 
                          onClick={() => handleUpdateStatus(user.email, 2)}
                          className="w-full"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Pengguna</span>
                          </div>
                        </Button>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Batal</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild onClick={() => setSelectedUser(user)}>
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
                          Apakah anda yakin ingin menghapus pengguna <strong>{user.nama}</strong>?
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button>
                              Batal
                            </Button>
                          </DialogClose>
                          <Button className="bg-red-700 text-white" onClick={() => handleDelete(user.id)}>
                            Hapus
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col sm:flex-row justify-between items-center p-2 mt-1 gap-4">
          <div className="text-xs sm:text-sm text-center sm:text-left w-full sm:w-auto">
            Menampilkan {indexOfFirstItem + 1} sampai {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} 
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
                className={`${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-[#F4F7FE] text-gray-700'
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