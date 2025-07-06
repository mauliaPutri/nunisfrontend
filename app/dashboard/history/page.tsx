"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Check, CheckCheck, CheckCircle, ClipboardCheck, Clock, Key, Package, Utensils, X, XCircle } from 'lucide-react';
import { formatCurrency } from "../menu/formatCurrency";
import axios from 'axios';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import usePrintInvoice from '../menu/ExportPdf';
import QRCode from 'qrcode.react';
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';
import { motion } from 'framer-motion';
import ZoomIn from '@/components/animation/zoomIn';
import FadeUp from '@/components/animation/fadeUp';

// Fungsi untuk memformat tanggal dengan offset WIB
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Tambahkan offset WIB (UTC+7)
  const wibDate = new Date(date.getTime() + (0 * 60 * 60 * 1000));
  const day = wibDate.getDate();
  const month = wibDate.toLocaleString('id-ID', { month: 'long' });
  const year = wibDate.getFullYear();
  const hours = wibDate.getHours().toString().padStart(2, '0');
  const minutes = wibDate.getMinutes().toString().padStart(2, '0');
  const seconds = wibDate.getSeconds().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};

// Fungsi untuk memformat tanggal tanpa jam
const formatDateWithoutTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const wibDate = new Date(date.getTime() + (0 * 60 * 60 * 1000));
  const day = wibDate.getDate();
  const month = wibDate.toLocaleString('id-ID', { month: 'long' });
  const year = wibDate.getFullYear();
  return `${day} ${month} ${year}`;
};

interface DetailItem {
  kode_menu: string;
  jumlah: number;
  total: number;
  menu_name: string;
  image: string;
  subtotal: number;
}

interface Transaction {
  faktur: string;
  id_user: number;
  no_telepon: string;
  alamat: string;
  tanggal: string;
  total: number;
  sub_total: number;
  diskon_rupiah: number;
  details: DetailItem[];
  main_item: DetailItem;
  other_items_count: number;
  status: number;
}

interface User {
  id: number;
  email: string;
  nama: string;
  address: string;
  phone: number;
  pictures: string;
}

const SkeletonLoader = () => (
  <Card className='w-full'>
    <CardContent className="w-full flex p-4 bg-gray-50 rounded-lg items-center border-[1px]">
      <Skeleton className="w-[75px] h-[75px] rounded-md mr-4" />
      <div className="flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="text-right">
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedHistory, setSelectedProduct] = useState<Transaction | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const { documentRef, handlePrint } = usePrintInvoice();

  // Fungsi untuk memeriksa perubahan status
  const checkStatusChanges = async () => {
    if (!userData?.id) return;
    
    try {
      const url = API_ENDPOINTS.TRANSAKSI_WITH_DETAILS(userData.id.toString());
      const response = await axios.get(url);
      const newData = response.data;

      // Bandingkan status dengan data yang ada
      const updatedData = historyData.map(oldItem => {
        const newItem = newData.find((item: Transaction) => item.faktur === oldItem.faktur);
        if (newItem && newItem.status !== oldItem.status) {
          return { ...oldItem, status: newItem.status };
        }
        return oldItem;
      });

      // Update state hanya jika ada perubahan
      if (JSON.stringify(updatedData) !== JSON.stringify(historyData)) {
        setHistoryData(updatedData);
      }
    } catch (err) {
      console.error("Gagal memeriksa perubahan status", err);
    }
  };

  const fetchData = async (start?: string, end?: string) => {
    setIsLoading(true);
    setError(null);
    const userinfo = localStorage.getItem("user-info");
    let email = userinfo ? userinfo.replace(/["]/g, "") : "";
    if (!email) {
      setError("Email tidak ditemukan di localStorage");
      setIsLoading(false);
      return;
    }

    try {
      const userResponse = await axios.get(
        API_ENDPOINTS.USER(email)
      );
      setUserData(userResponse.data);

      if (userResponse.data && userResponse.data.id) {
        let url = API_ENDPOINTS.TRANSAKSI_WITH_DETAILS(userResponse.data.id);
        if (start) url += `?start_date=${start}`;
        if (end) url += `${start ? '&' : '?'}end_date=${end}`;

        const transactionResponse = await axios.get(url);
        // Sort transactions by date (newest first)
        const sortedData = [...transactionResponse.data].sort((a, b) => {
          return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
        });
        setHistoryData(sortedData);
      }
    } catch (err) {
      console.error("Gagal mengambil data", err);
      setError("Gagal mengambil data. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto refresh untuk memeriksa perubahan status
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkStatusChanges();
    }, 20000); // 20 detik

    return () => clearInterval(intervalId);
  }, [historyData, userData]);

  // Filter data transaksi secara lokal
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredData(historyData);
      setFilterError(null);
      return;
    }
    if (startDate && endDate) {
      if (endDate < startDate) {
        setFilterError('Tanggal akhir tidak boleh lebih kecil dari tanggal awal');
        setFilteredData([]);
        return;
      }
      setFilterError(null);
      setFilteredData(historyData.filter(item => {
        const tgl = item.tanggal.slice(0, 10);
        return tgl >= startDate && tgl <= endDate;
      }));
      return;
    }
    // Jika hanya startDate
    if (startDate) {
      setFilterError(null);
      setFilteredData(historyData.filter(item => item.tanggal.slice(0, 10) === startDate));
      return;
    }
    // Jika hanya endDate
    if (endDate) {
      setFilterError(null);
      setFilteredData(historyData.filter(item => item.tanggal.slice(0, 10) === endDate));
      return;
    }
  }, [startDate, endDate, historyData]);

  const handleDetailClick = (product: Transaction) => {
    setSelectedProduct(product);
  };

  const qrCodeData = selectedHistory
    ? JSON.stringify({
      user: userData?.nama,
      phone: selectedHistory.no_telepon,
      address: selectedHistory.alamat,
      invoiceId: selectedHistory.faktur,
      invoiceItems: selectedHistory.details.map(item => ({
        kode_menu: item.kode_menu,
        jumlah: item.jumlah,
        total: item.total,
        menu_name: item.menu_name,
        subtotal: item.subtotal,
      })) || [],
      subTotal: selectedHistory.sub_total,
      discount: selectedHistory.diskon_rupiah,
      total: selectedHistory.total,
    })
    : '';

  return (
    <div className="container mx-auto p-4">
      <FadeUp>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-green-700">Riwayat</h1>
          <div className="w-40 h-1 bg-green-600 mx-auto mt-3 rounded-full"></div>
        </div>
      </FadeUp>
      <div className='flex flex-col sm:flex-row gap-2'>
        <div className='mb-2 flex gap-2 sm:w-full w-1/2'>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Tanggal Awal"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Tanggal Akhir"
          />
        </div>
        <Button
          variant={'outline'}
          onClick={() => { setStartDate(''); setEndDate(''); }}
          disabled={!startDate && !endDate}
          className='bg-[#61AB5B] rounded-3xl w-1/4 flex-row mb-2'
        >
          Reset
        </Button>
      </div>
      {filterError && <div className="text-red-500 mb-2">{filterError}</div>}
      <div className="space-y-4 w-full ">
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: index * 0.2 }} key={index}>
              <Card key={item.faktur} className='w-full flex bg-slate-400' >
                <CardContent className="w-full flex p-4 bg-gray-50 hover:bg-gray-100 rounded-lg items-center border-[1px] border-[#54844F]">
                  <div className='w-[75px] h-[75px] mr-2 mb-2'>
                    <AspectRatio ratio={1 / 1} className='bg-muted'>
                      {item.main_item && item.main_item.image ? (
                        <Image
                          src={`data:image/jpeg;base64,${item.main_item.image}`}
                          alt={item.main_item.menu_name || 'Menu Image'}
                          fill
                          className="rounded-md mr-4"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">gambar</span>
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-semibold">
                      {item.main_item ? item.main_item.menu_name : 'Menu tidak tersedia'}
                      {item.other_items_count > 0 && ` dan ${item.other_items_count} lainnya${item.other_items_count > 1 ? ' ' : ''}`}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{formatDate(item.tanggal)}</p>
                    <div className='flex flex-row'>
                      {item.status === 0 ? (
                        <Clock className='p-1 h-6 w-6 mr-2 flex-wrap bg-[#FFA500] text-white rounded-full shadow-md' />
                      ) : item.status === 1 ? (
                        <ClipboardCheck className='p-1 h-6 w-6 mr-2 flex-wrap bg-[#4ED4F1] text-white rounded-full shadow-md' />
                      ) : item.status === 2 ? (
                        <Utensils className='p-1 h-6 w-6 mr-2 flex-wrap bg-orange-400 text-white rounded-full shadow-md' />
                      ) : item.status === 3 ? (
                        <Package className='p-1 h-6 w-6 mr-2 flex-wrap bg-cyan-700 text-white rounded-full shadow-md' />
                      ) : item.status === 4 ? (
                        <CheckCircle className='p-1 h-6 w-6 mr-2 flex-wrap bg-[#369A2E] text-white rounded-full shadow-md' />
                      ) : (
                        <XCircle className='p-1 h-6 w-6 mr-2 flex-wrap bg-[#FF0000] text-white rounded-full shadow-md' />
                      )}
                      <p>
                        {item.status === 0 ? 'Menunggu Konfirmasi' :
                          item.status === 1 ? 'Pesanan Diterima' :
                            item.status === 2 ? 'Sedang Diproses' :
                              item.status === 3 ? 'Pesanan Siap' :
                                item.status === 4 ? 'Pesanan Selesai' :
                                  'Pesanan Dibatalkan'}
                      </p>
                    </div>
                  </div>
                  {item.status === 4 ? (
                    <div className="text-right">
                      <p className="font-semibold">Rp {item.total.toLocaleString()}</p>
                      <Dialog>
                        <DialogTrigger>
                          <Button variant="outline" className="mt-2 mr-2 rounded-3xl bg-[#369A2E] border-[2px] border-[#369A2E] hover:bg-white text-gray-50 hover:text-[#369A2E]" onClick={() => handleDetailClick(item)}>
                            Nota
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm p-0 bg-white rounded-lg shadow-lg font-mono text-[12px]">
                          <DialogDescription>
                            <div className="flex flex-col items-center pt-2 pb-1">
                              {/* Logo */}
                              <div className="mb-2">
                                <Image
                                  src="/LOGO NUNIS.jpg"
                                  alt="Nunis Warung & Koffie"
                                  width={100}
                                  height={100}
                                  className="mx-auto"
                                />
                              </div>
                              {/* Judul dan Alamat */}
                              <h2 className="font-bold text-sm mb-1">Nunis Warung & Koffie</h2>
                              <div className="text-center text-[11px] leading-tight mb-2">
                                Jl. Raya Trenggalek - Ponorogo No.Km.7,<br />
                                RT.17/RW.4, Setono, Kec. Tugu, Kabupaten Trenggalek
                              </div>
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-2" />

                            {/* Info Transaksi */}
                            <div className="px-4 leading-tight mb-2">
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Invoice No</span>
                                <span>{selectedHistory?.faktur}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Tanggal</span>
                                <span>{formatDateWithoutTime(selectedHistory?.tanggal || '')}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Pelanggan</span>
                                <span>{userData?.nama || "Nama"}</span>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-2" />

                            {/* Item Pesanan */}
                            <div className="px-4 leading-tight mb-2">
                              {selectedHistory?.details.map((detail, idx) => (
                                <div key={idx} className="flex justify-between items-start mb-2">
                                  <div>
                                    <span>{detail.menu_name}</span>
                                    <div className="ml-2 text-[10px] text-gray-500">
                                      {detail.jumlah}x @Rp{Number(detail.total / detail.jumlah).toLocaleString()}
                                    </div>
                                  </div>
                                  <span>{Number(detail.subtotal).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-2" />

                            {/* Ringkasan */}
                            <div className="px-4 leading-tight mb-2">
                              <div className="flex justify-between mb-1">
                                <span>SubTotal</span>
                                <span>{selectedHistory?.sub_total.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Diskon</span>
                                <span>{selectedHistory?.diskon_rupiah.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-2" />

                            <div className="px-4 font-semibold flex justify-between mb-2">
                              <span>Total</span>
                              <span>{selectedHistory?.total.toLocaleString()}</span>
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-2" />

                            {/* Footer */}
                            <div className="text-center text-[11px] pt-1 pb-3 leading-tight">
                              Terima kasih atas pesanan Anda!<br />
                              Silakan datang kembali.
                            </div>
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) :
                    <div className="text-right">
                      <p className="font-semibold">Rp {item.total.toLocaleString()}</p>
                      <Dialog>
                        <DialogTrigger>
                          <Button variant="outline" className="mt-2 rounded-3xl bg-[#369A2E] border-[2px] border-[#369A2E] hover:bg-white text-gray-50 hover:text-[#369A2E]" onClick={() => handleDetailClick(item)}>
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent ref={documentRef} className="max-w-2xl w-full h-[80vh] overflow-y-auto" hideClose={true}>
                          <DialogHeader className="top-0 bg-white z-10">
                            <div className="flex justify-between items-center">
                              <DialogTitle className="text-2xl font-bold text-[#61AB5B]">Invoice</DialogTitle>
                              <DialogTrigger>
                                <Button size="sm" variant="outline" className="border-[#61AB5B] text-[#61AB5B] hover:bg-[#61AB5B] hover:text-white">
                                  <X className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            </div>
                            <DialogDescription />
                          </DialogHeader>

                          <div className="p-1 sm:w-full">
                            <div className='flex'>
                              <div className='flex flex-col w-1/2 gap-2 text-start'>
                                <label>www.nunis.id</label>
                                <label>nunis@gmail.com</label>
                                <label>085217645464</label>
                              </div>
                              <div className='flex w-1/2'>
                                <div className='flex flex-row align-items-end justify-end w-full'>
                                  <div className='flex flex-col text-end'>
                                    <h4 className='text-[#61AB5B]'>Nunis Warung & Koffie</h4>
                                    <label>Jl. Raya Trenggalek - Ponorogo No.Km.7, RT.17/RW.4, Setono, Kec. Tugu, Kabupaten Trenggalek, Jawa Timur 66352</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-3 outline bg-light shadow-lg rounded-lg bg-gray-100">
                              <div className="flex flex-row align-items-start justify-content-between">

                                <div className="flex flex-col align-items-start w-auto">
                                  <h5>Tagihan</h5>
                                  <label>Id : {userData?.nama} </label>
                                  <label>No.Telp : {selectedHistory?.no_telepon}</label>
                                  <label>Alamat : {selectedHistory?.alamat}</label>
                                </div>
                                <div className="flex flex-col align-items-end">
                                  <h6>Invoice of IDR</h6>
                                  <h6>{formatCurrency(selectedHistory?.total || 0)}</h6>
                                </div>
                              </div>
                              <div className="flex flex-row align-items-center justify-content-between mt-3">
                                <div className="flex flex-col align-items-start w-auto">
                                  <h5>Tanggal Invoice</h5>
                                  <label>{formatDate(selectedHistory?.tanggal || '')}</label>
                                </div>
                                <div className="flex flex-col align-items-end">
                                  <h5>Nomor Invoice</h5>
                                  <label>{selectedHistory?.faktur}</label>
                                </div>
                              </div>
                              <hr />
                              <div className="flex flex-row align-items-center justify-content-between mt-3">
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Detail Item</b>
                                </div>
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Jumlah</b>
                                </div>
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Harga Satuan</b>
                                </div>
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Total</b>
                                </div>
                              </div>
                              <hr />
                              <div className="h-[100px] overflow-auto invoice-data">
                                {selectedHistory?.details.map((item, index) => (
                                  <div className="flex flex-row align-items-center mt-3" key={index}>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{item.menu_name}</label>
                                    </div>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{item.jumlah}</label>
                                    </div>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{formatCurrency(item.subtotal / item.jumlah)}</label>
                                    </div>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{formatCurrency(item.subtotal)}</label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <hr />
                              <div className="flex">
                                <div className="flex w-1/2">
                                  <QRCode value={qrCodeData} />
                                </div>
                                <div className="flex flex-col w-1/2">
                                  <div className="flex align-items-center justify-content-between">
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>Subtotal</label>
                                    </div>
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>{formatCurrency(selectedHistory?.sub_total || 0)}</label>
                                    </div>
                                  </div>
                                  <div className="flex flex-row align-items-center justify-content-between">
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>Diskon</label>
                                    </div>
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>{formatCurrency(selectedHistory?.diskon_rupiah || 0)}</label>
                                    </div>
                                  </div>
                                  <div className="flex flex-row justify-end">
                                    <hr className="w-3/4" />
                                  </div>
                                  <div className="flex flex-row align-items-center justify-content-between">
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <b>Total</b>
                                    </div>
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label><b>{formatCurrency(selectedHistory?.total || 0)}</b></label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="bottom-0 bg-white pt-4">
                            <Button onClick={handlePrint} className="bg-[#61AB5B] hover:bg-[#4a8346] text-white"><b>Export PDF</b></Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  }
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p>Tidak ada riwayat transaksi.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;