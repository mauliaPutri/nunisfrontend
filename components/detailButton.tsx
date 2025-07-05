"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { Terminal, Printer } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode.react';

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
  user: User;
  no_telepon: string;
  alamat: string;
  item: string;
  sub_total: number;
  tanggal: string;
  total: number;
  diskon_persen: number;
  diskon_rupiah: number;
  detail_penjualan: Item[];
  notes: string;
  status?: number;
}

interface ButtonDetailProps {
  itemmu: Transaksi;
  onView?: () => void;
}

export default function ButtonDetail({ itemmu, onView }: ButtonDetailProps) {
  const [open, setOpen] = useState(false);
  const [item, setItems] = useState<Transaksi[]>([]);
  const [status, setStatus] = useState(itemmu.status?.toString() || "0");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const thermalPrintRef = useRef<HTMLDivElement>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [bluetoothCharacteristic, setBluetoothCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("tunai");
  const [cashAmount, setCashAmount] = useState(0);
  const [change, setChange] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showMobilePaymentDialog, setShowMobilePaymentDialog] = useState(false);

  useEffect(() => {
    setItems([itemmu]);
    setStatus(itemmu.status?.toString() || "0");
  }, [itemmu]);

  useEffect(() => {
    if (open && onView) {
      onView();
    }
  }, [open, onView]);

  function formatCurrency(value: number) {
    return value
      .toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace("Rp", "Rp.")
      .trim();
  }

  // Fungsi untuk membersihkan teks dari karakter khusus yang bisa menyebabkan masalah printing
  function sanitizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/[^\x00-\x7F]/g, '') // Hapus karakter non-ASCII
      .replace(/[^\w\s\-.,()]/g, '') // Hanya izinkan huruf, angka, spasi, dan tanda baca dasar
      .trim();
  }

  const handlePrintThermal = useReactToPrint({
    content: () => thermalPrintRef.current,
    copyStyles: true,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 5mm;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          width: 70mm;
          font-family: 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
        }
        .thermal-receipt {
          width: 100% !important;
          font-family: 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
        }
        .thermal-header {
          text-align: center;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .thermal-divider {
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        .thermal-item {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }
        .thermal-total {
          font-weight: bold;
          margin-top: 5px;
        }
        .thermal-text {
          font-family: 'Courier New', monospace !important;
          font-size: 14px !important;
          color: #000 !important;
          -webkit-font-smoothing: none !important;
          -moz-osx-font-smoothing: none !important;
          text-rendering: optimizeSpeed !important;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            -webkit-text-size-adjust: none !important;
            text-size-adjust: none !important;
          }
        }
      }
    `,
  });

  

  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
          { namePrefix: 'Printer' }
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      setBluetoothDevice(device);

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      setBluetoothCharacteristic(characteristic || null);
      return characteristic;
    } catch (error) {
      console.error('Gagal terhubung ke printer Bluetooth:', error);
      alert('Gagal terhubung ke printer Bluetooth. Pastikan printer Anda menyala dan dalam mode pairing.');
      return null;
    }
  };

  const onSubmit = (inputValue: number) => {
    const value = inputValue;
    console.log(value);
    if (!isNaN(value)) {
      setCashAmount(value);
      setChange(value - itemmu.total);
    } else {
      setCashAmount(0);
      setChange(0);
    }
  };

  const printToBluetoothPrinter = async () => {
    // Inisiasi nilai cashAmount berdasarkan metode pembayaran
    if (paymentMethod === "non-tunai") {
      setCashAmount(itemmu.total);
      setChange(0);
    } else if (paymentMethod === "tunai" && cashAmount <= 0) {
      alert('Masukkan jumlah uang yang diterima terlebih dahulu');
      return;
    } else if (paymentMethod === "tunai" && cashAmount < itemmu.total) {
      alert('Jumlah uang yang diterima kurang dari total pembayaran');
      return;
    }
    try {
      let characteristic = bluetoothCharacteristic;

      if (!characteristic) {
        const connectedCharacteristic = await connectBluetooth();
        if (!connectedCharacteristic) return;
        characteristic = connectedCharacteristic;
      }

      const receiptContent = generateReceiptContent();
      const encoder = new TextEncoder();
      const data = encoder.encode(receiptContent);

      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      alert('Struk berhasil dikirim ke printer!');
    } catch (error) {
      console.error('Gagal mencetak:', error);
      alert('Gagal mencetak. Silakan coba hubungkan kembali ke printer.');
    }
  };



  const generateReceiptContent = () => {
    let receipt = '\x1B\x40';

    receipt += '\x1B\x61\x01';
    receipt += 'NUNIS WARUNG & KOFFIE\n';
    receipt += 'Jl. Raya Trenggalek - Ponorogo \n No.Km.7\n';
    receipt += 'Kec. Tugu, Kab. Trenggalek,\n Jawa Timur\n';
    receipt += 'Telp: 085217645464\n';
    receipt += '\x1B\x61\x00';

    receipt += '--------------------------------\n';

    receipt += `No. Faktur : ${itemmu.faktur}\n`;
    receipt += `Tanggal    : ${new Date(itemmu.tanggal).toLocaleDateString()}\n`;
    receipt += `Kasir      : Admin\n`;
    receipt += `Pelanggan  : ${itemmu.user.nama}\n`;

    receipt += '--------------------------------\n';

    itemmu.detail_penjualan.forEach(item => {
      // Baris pertama: nama item
      receipt += `${item.name}\n`;
      
      // Baris kedua: jumlah x harga dan subtotal
      const pricePerItem = item.subtotal / item.jumlah;
      const itemDetail = `${item.jumlah} x Rp. ${pricePerItem}`;
      const subtotalText = `Rp. ${item.subtotal}`;
      const spacesNeeded = 31 - itemDetail.length - subtotalText.length;
      receipt += `${itemDetail}${' '.repeat(Math.max(1, spacesNeeded))}${subtotalText}\n`;
    });

    receipt += `Catatan:${' '.repeat(4 - (itemmu.notes?.length ?? 0))}${sanitizeText(itemmu.notes || '-')}\n`;
    receipt += '--------------------------------\n';

    receipt += `Subtotal:${' '.repeat(23 - formatCurrency(itemmu.sub_total).length)}${'Rp. ' + (itemmu.sub_total)}\n`;
    receipt += `Diskon:${' '.repeat(24 - formatCurrency(itemmu.diskon_rupiah).length)}${'Rp. ' + (itemmu.diskon_rupiah)}\n`;
    receipt += '--------------------------------\n';
    
    receipt += `Total:${' '.repeat(26 - formatCurrency(itemmu.total).length)}${'Rp. ' + (itemmu.total)}\n`;
    receipt += `Bayar (${paymentMethod}):${' '.repeat(26 - formatCurrency(cashAmount).length - paymentMethod.length - 3)}${'Rp. ' + (cashAmount)}\n`;
    receipt += `Kembalian:${' '.repeat(21 - formatCurrency(change).length)}${'Rp. ' + (change)}\n`;

    receipt += '--------------------------------\n';

    receipt += '\x1B\x61\x01';
    receipt += 'Terima kasih atas kunjungan Anda\n';
    receipt += 'nuniswarungkoffie.site\n';

    receipt += '\x1D\x56\x41\x10';

    return receipt;
  };

  const generateSimpleReceiptContent = () => {
    let receipt = '\x1B\x40';

    receipt += '\x1B\x61\x01';
    receipt += 'NUNIS WARUNG & KOFFIE\n';
    receipt += '--------------------------------\n';
    receipt += '\x1B\x61\x00';

    receipt += `Pelanggan: ${itemmu.user.nama}\n`;
    receipt += '--------------------------------\n';

    itemmu.detail_penjualan.forEach(item => {
      receipt += `${item.name} x ${item.jumlah}\n`;
      // receipt += `${item.jumlah} x Rp. ${item.subtotal / item.jumlah}\n`;
    });

    receipt += '--------------------------------\n';
    if (itemmu.notes) {
      receipt += `Catatan: ${sanitizeText(itemmu.notes)}\n`;
      receipt += '--------------------------------\n';
    }

    receipt += '\x1D\x56\x41\x10';
    return receipt;
  };

  const printSimpleReceipt = async () => {
    try {
      let characteristic = bluetoothCharacteristic;

      if (!characteristic) {
        const connectedCharacteristic = await connectBluetooth();
        if (!connectedCharacteristic) return;
        characteristic = connectedCharacteristic;
      }

      const receiptContent = generateSimpleReceiptContent();
      const encoder = new TextEncoder();
      const data = encoder.encode(receiptContent);

      const chunkSize = 512;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      alert('Struk pesanan berhasil dicetak!');
    } catch (error) {
      console.error('Gagal mencetak:', error);
      alert('Gagal mencetak. Silakan coba hubungkan kembali ke printer.');
    }
  };

  const AddDetailForm = ({ className }: React.ComponentProps<"form">) => {
    return (
      <div className={cn("grid items-start gap-4 w-full", className)}>
        <div className="flex flex-row w-full gap-2">
          <div className="flex flex-col w-1/2 ">
            <div>
              <Label htmlFor="id">ID Pesanan</Label>
              <p className="border p-2 rounded">{itemmu.faktur}</p>
            </div>
            <div>
              <Label htmlFor="">Nama Pemesan</Label>
              <p className="border p-2 rounded">{itemmu.user.nama}</p>
            </div>
            <div className="h-full">
              <Label htmlFor="">Items</Label>
              <div className="border h-[125px] p-2 rounded overflow-auto">
                <p>Pesanan : </p>
                {itemmu.detail_penjualan.map((items) => (
                  <div key={items.id} className="mb-2 p-2 border-b-4">
                    <p>
                      {items.name} x {items.jumlah} ={" "}
                      {formatCurrency(items.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="">Catatan</Label>
              <p className="border p-2 rounded">{sanitizeText(itemmu.notes || '-')}</p>
            </div>
            <div>
              <Label htmlFor="">Sub Total</Label>
              <p className="border p-2 rounded">Rp. {itemmu.total}</p>
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div>
              <Label htmlFor="">Diskon</Label>
              <p className="border p-2 rounded">
                Rp. {itemmu.diskon_rupiah}
              </p>
            </div>
            <div>
              <Label htmlFor="">Total</Label>
              <p className="border p-2 rounded">
                Rp. {itemmu.total}
              </p>
            </div>
            <div>
              <Label htmlFor="">Alamat</Label>
              <p className="border p-2 rounded">{itemmu.user.address}</p>
            </div>
            <div>
              <Label htmlFor="">No Telp</Label>
              <p className="border p-2 rounded">{itemmu.user.phone}</p>
            </div>
            <div>
              <Label htmlFor="">Tanggal</Label>
              <p className="border p-2 rounded">
                {new Date(itemmu.tanggal).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label htmlFor="">Status Pesanan</Label>
              <p className="w-full border p-1 rounded">
                {status === "0" && <span>Menunggu Konfirmasi</span>}
                {status === "1" && <span>Pesanan Diterima</span>}
                {status === "2" && <span>Sedang Diproses</span>}
                {status === "3" && <span>Pesanan Siap</span>}
                {status === "4" && <span>Pesanan Selesai</span>}
                {status === "5" && <span>Pesanan Dibatalkan</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t pt-2 mt-2">
          {status === "1" && (
            <>
              {isDesktop ? (
                <Button 
                  type="button" 
                  variant="default" 
                  onClick={printSimpleReceipt}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Pesanan
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="default"
                  onClick={() => handlePrintThermal()}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Pesanan
                </Button>
              )}
            </>
          )}
          {status === "4" && (
            <>
              {isDesktop ? (
                <div>
                  <Button 
                    type="button" 
                    variant="default" 
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Nota
                  </Button>
                  
                  {showPaymentDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
                          <button 
                            onClick={() => setShowPaymentDialog(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            &times;
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          <div>
                            <Label>Metode Pembayaran</Label>
                            <select 
                              className="w-full border p-2 rounded" 
                              onChange={(e) => {
                                setPaymentMethod(e.target.value);
                                if (e.target.value === "non-tunai") {
                                  setCashAmount(itemmu.total);
                                  setChange(0);
                                }
                              }}
                              value={paymentMethod}
                            >
                              <option value="tunai">Tunai</option>
                              <option value="non-tunai">Non Tunai</option>
                            </select>
                          </div>
                          {paymentMethod === "tunai" ? (
                            <>
                              <div>
                                <Label>Uang Diterima</Label>
                                <div className="flex gap-2">
                                  <form onSubmit={(e) => e.preventDefault()} className="w-full">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        className="flex-grow border p-2 rounded-l-md focus:outline-none focus:border-transparent" 
                                        onChange={(e) => {
                                          const inputElement = e.target as HTMLInputElement;
                                          inputElement.setAttribute('data-value', inputElement.value);
                                        }}
                                        placeholder="Masukkan jumlah"
                                      />
                                      <Button 
                                        type="button" 
                                        className=" text-white rounded-r-md transition-all duration-200 flex items-center justify-center px-4 py-2 h-full"
                                        onClick={(e) => {
                                          const inputElement = e.currentTarget.previousElementSibling as HTMLInputElement;
                                          const value = parseInt(inputElement.value);
                                          onSubmit(value);
                                        }}
                                      >
                                        <span>Hitung</span>
                                      </Button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                              <div>
                                <Label>Kembalian</Label>
                                <p className="border p-2 rounded">
                                  Rp {change}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <Label>Total Pembayaran</Label>
                              <p className="border p-2 rounded">
                                Rp {itemmu.total.toLocaleString()}
                              </p>
                            </div>
                          )}
                          <Button 
                            onClick={() => {
                              printToBluetoothPrinter();
                            }}
                          >
                            Cetak
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={() => setShowMobilePaymentDialog(true)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Nota
                  </Button>
                  
                  {showMobilePaymentDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
                          <button 
                            onClick={() => setShowMobilePaymentDialog(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            &times;
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          <div>
                            <Label>Metode Pembayaran</Label>
                            <select 
                              className="w-full border p-2 rounded" 
                              onChange={(e) => {
                                setPaymentMethod(e.target.value);
                                if (e.target.value === "non-tunai") {
                                  setCashAmount(itemmu.total);
                                  setChange(0);
                                }
                              }}
                              value={paymentMethod}
                            >
                              <option value="tunai">Tunai</option>
                              <option value="non-tunai">Non Tunai</option>
                            </select>
                          </div>
                          {paymentMethod === "tunai" ? (
                            <>
                              <div>
                                <Label>Uang Diterima</Label>
                                <div className="flex gap-2">
                                  <form onSubmit={(e) => e.preventDefault()} className="w-full">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        className="flex-grow border p-2 rounded-l-md focus:outline-none focus:border-transparent" 
                                        onChange={(e) => {
                                          const inputElement = e.target as HTMLInputElement;
                                          inputElement.setAttribute('data-value', inputElement.value);
                                        }}
                                        placeholder="Masukkan jumlah"
                                      />
                                      <Button 
                                        type="button" 
                                        className=" text-white rounded-r-md transition-all duration-200 flex items-center justify-center px-4 py-2 h-full"
                                        onClick={(e) => {
                                          const inputElement = e.currentTarget.previousElementSibling as HTMLInputElement;
                                          const value = parseInt(inputElement.value);
                                          onSubmit(value);
                                        }}
                                      >
                                        <span>Hitung</span>
                                      </Button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                              <div>
                                <Label>Kembalian</Label>
                                <p className="border p-2 rounded">
                                  Rp {change}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <Label>Total Pembayaran</Label>
                              <p className="border p-2 rounded">
                                Rp {itemmu.total.toLocaleString()}
                              </p>
                            </div>
                          )}
                          <Button 
                            onClick={() => {
                              // Tambahkan delay kecil untuk memastikan DOM sudah siap
                              setTimeout(() => {
                                handlePrintThermal();
                              }, 100);
                            }}
                          >
                            Cetak
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Tutup
          </Button>
        </div>
      </div>
    );
  };

  const Content = () => (
    <div className="grid gap-4 py-4">
      <DialogTitle className="text-2xl text-center">Detail Transaksi</DialogTitle>
      <AddDetailForm />

      {/* Template untuk printer thermal */}
      <div style={{ display: 'none' }}>
        <div ref={thermalPrintRef} className="thermal-receipt" style={{ 
          width: '70mm', 
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          lineHeight: '1.2',
          color: '#000',
          backgroundColor: '#fff',
          padding: '5mm'
        }}>
          {status === "1" ? (
            <>
              <div className="thermal-header">
                <h3 style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>NUNIS WARUNG & KOFFIE</h3>
              </div>

              <div className="thermal-divider"></div>

              <div style={{ marginBottom: '10px' }}>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Pelanggan: {sanitizeText(itemmu.user.nama)}</p>
              </div>

              <div className="thermal-divider"></div>

              <div style={{ marginBottom: '10px' }}>
                {itemmu.detail_penjualan.map((item, index) => (
                  <div key={index} style={{ margin: '3px 0' }}>
                    <p className="thermal-text" style={{ margin: '0' }}>{sanitizeText(item.name)} x {item.jumlah}</p>
                  </div>
                ))}
              </div>

              <div className="thermal-divider"></div>

              <div style={{ margin: '5px 0' }}>
                <p className="thermal-text" style={{ margin: '0' }}>Catatan: {sanitizeText(itemmu.notes || '-')}</p>
              </div>

              <div className="thermal-divider"></div>
            </>
          ) : (
            <>
              <div className="thermal-header">
                <h3 style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>NUNIS WARUNG & KOFFIE</h3>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Jl. Raya Trenggalek - Ponorogo No.Km.7</p>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Kec. Tugu, Kab. Trenggalek, Jawa Timur</p>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Telp: 085217645464</p>
              </div>

              <div className="thermal-divider"></div>

              <div style={{ marginBottom: '10px' }}>
                <p className="thermal-text" style={{ margin: '2px 0' }}>No. Faktur: {itemmu.faktur}</p>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Tanggal: {new Date(itemmu.tanggal).toLocaleDateString()}</p>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Kasir: Admin</p>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Pelanggan: {itemmu.user.nama}</p>
              </div>

              <div className="thermal-divider"></div>

              <div style={{ marginBottom: '10px' }}>
                {itemmu.detail_penjualan.map((item, index) => (
                  <div key={index} style={{ margin: '3px 0' }}>
                    <p className="thermal-text" style={{ margin: '0' }}>{item.name}</p>
                    <div className="thermal-item">
                      <p className="thermal-text" style={{ margin: '0' }}>{item.jumlah} x Rp. {item.subtotal / item.jumlah}</p>
                      <p className="thermal-text" style={{ margin: '0' }}>{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ margin: '5px 0' }}>
                <p className="thermal-text" style={{ margin: '0' }}>Catatan: {sanitizeText(itemmu.notes || '-')}</p>
              </div>

              <div className="thermal-divider"></div>

              <div style={{ marginBottom: '5px' }}>
                <div className="thermal-item">
                  <p className="thermal-text" style={{ margin: '0' }}>Subtotal:</p>
                  <p className="thermal-text" style={{ margin: '0' }}>{formatCurrency(itemmu.sub_total)}</p>
                </div>
                <div className="thermal-item">
                  <p className="thermal-text" style={{ margin: '0' }}>Diskon:</p>
                  <p className="thermal-text" style={{ margin: '0' }}>{formatCurrency(itemmu.diskon_rupiah)}</p>
                </div>
                <div className="thermal-divider"></div>
                <div className="thermal-item thermal-total">
                  <p className="thermal-text" style={{ margin: '0', fontWeight: 'bold' }}>TOTAL:</p>
                  <p className="thermal-text" style={{ margin: '0', fontWeight: 'bold' }}>{formatCurrency(itemmu.total)}</p>
                </div>
                <div className="thermal-item">
                  <p className="thermal-text" style={{ margin: '0' }}>Bayar ({paymentMethod}):</p>
                  <p className="thermal-text" style={{ margin: '0' }}>{formatCurrency(cashAmount)}</p>
                </div>
                <div className="thermal-item">
                  <p className="thermal-text" style={{ margin: '0' }}>Kembalian:</p>
                  <p className="thermal-text" style={{ margin: '0' }}>{formatCurrency(change)}</p>
                </div>
              </div>

              <div className="thermal-divider"></div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <p className="thermal-text" style={{ margin: '2px 0' }}>Terima kasih atas kunjungan Anda</p>
                <p className="thermal-text" style={{ margin: '2px 0' }}>nuniswarungkoffie.site</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#4ED4F1] w-[70px] text-white cursor-pointer rounded-full h-[20px] text-[12px]">
            Detail
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[919px] sm:max-h-[704px] bg-[#F4F7FE]">
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#4ED4F1] w-[70px] text-white cursor-pointer rounded-full h-[20px] text-[12px]">
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[919px] sm:max-h-[704px] bg-[#F4F7FE]">
        {/* <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader> */}
        <Content />
      </DialogContent>
    </Dialog>
  );
}
