"use client";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangesPicker";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_ENDPOINTS } from '../../api/nunisbackend/api';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  id: string;
  email: string;
  message: string;
  pictures: string;
}
interface Statistics {
  total_penjualan: number;
  jumlah_order: number;
  jumlah_client: number;
}

interface Transaction {
  tanggal: string;
  total: number;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [menuTerlaris, setMenuTerlaris] = useState<any>(null);
  const [statisticsByDate, setStatisticsByDate] = useState<Statistics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fungsi untuk mengambil semua data
  const fetchAllData = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      // Reset hanya data yang terkait dengan tanggal
      setTransactions([]);
      setStatisticsByDate({
        total_penjualan: 0,
        jumlah_order: 0,
        jumlah_client: statisticsByDate?.jumlah_client || 0
      });
      return;
    }

    setIsLoading(true);

    // Buat tanggal dalam timezone Asia/Jakarta
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    // Set waktu awal hari untuk fromDate (Asia/Jakarta)
    fromDate.setHours(0, 0, 0, 0);
    
    // Set waktu akhir hari untuk toDate (Asia/Jakarta)
    toDate.setHours(23, 59, 59, 999);

    // Konversi ke UTC dengan menambahkan offset Asia/Jakarta (+7)
    const fromDateUTC = new Date(fromDate.getTime() + (7 * 60 * 60 * 1000));
    const toDateUTC = new Date(toDate.getTime() + (7 * 60 * 60 * 1000));

    try {
      // Fetch transactions
      const transactionsResponse = await axios.post(API_ENDPOINTS.TRANSAKSI_DATE_RANGE, {
        from: fromDateUTC.toISOString(),
        to: toDateUTC.toISOString(),
      });
      
      // Urutkan transaksi berdasarkan tanggal
      const sortedTransactions = transactionsResponse.data.sort((a: Transaction, b: Transaction) => {
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      });
      
      setTransactions(sortedTransactions);

      console.log("Data Transaksi untuk Grafik:", sortedTransactions);

      // Fetch statistics
      const statisticsResponse = await axios.post(API_ENDPOINTS.STATISTICS_BY_DATE, {
        from: fromDateUTC.toISOString(),
        to: toDateUTC.toISOString(),
      });
      setStatisticsByDate(statisticsResponse.data);

      // Fetch menu terlaris
      const menuResponse = await axios.post(API_ENDPOINTS.MENU_TERLARIS, {
        from: fromDateUTC.toISOString(),
        to: toDateUTC.toISOString(),
      });
      setMenuTerlaris(menuResponse.data);
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect untuk auto-refresh setiap 30 detik
  useEffect(() => {
    fetchAllData(); // Panggil pertama kali

    const intervalId = setInterval(() => {
      fetchAllData();
      }, 10000); // 10 detik untuk mengurangi beban server

    return () => clearInterval(intervalId);
  }, [dateRange]);

  // Effect untuk mengambil ulasan dengan auto-refresh
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await axios.get(
          API_ENDPOINTS.CONTACT,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Terjadi kesalahan!", error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers(); // Panggil pertama kali

    const intervalId = setInterval(() => {
      fetchUsers();
    }, 10000); // Refresh users setiap 10 detik

    return () => clearInterval(intervalId);
  }, []);

  // Data untuk grafik
  const chartData = {
    labels: transactions.map(transaction => {
      const date = new Date(transaction.tanggal);
      // Tambahkan offset WIB (+7 jam)
      const wibDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      const day = wibDate.getDate();
      const month = wibDate.toLocaleString('id-ID', { month: 'long' });
      const year = wibDate.getFullYear();
      const hours = wibDate.getHours().toString().padStart(2, '0');
      const minutes = wibDate.getMinutes().toString().padStart(2, '0');
      const seconds = wibDate.getSeconds().toString().padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
    }),
    datasets: [{
      label: 'Data Transaksi',
      data: transactions.map(transaction => transaction.total),
      fill: true,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <span>Halaman</span>
          <span>/</span>
          <span className="text-blue-600">Beranda</span>
        </div>
        <h1 className="text-4xl font-semibold mt-2">Beranda</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Penjualan (Periode)</p>
              <p className="text-xl font-bold">
                {statisticsByDate
                  ? `Rp. ${statisticsByDate.total_penjualan}`
                  : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah Transaksi (Periode)</p>
              <p className="text-xl font-bold">
                {statisticsByDate ? statisticsByDate.jumlah_order : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-yellow-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Menu Terlaris</p>
              <p className="text-xl font-bold">
                {menuTerlaris
                  ? `${menuTerlaris.name} (${menuTerlaris.total_terjual} terjual)`
                  : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah Pelanggan</p>
              <p className="text-xl font-bold">
                {statisticsByDate ? statisticsByDate.jumlah_client : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Dinamika Pejualan</h2>
              <div className="w-full h-[300px] md:h-[400px]">
                <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
              </div>
            </CardContent>
          </Card>
        </div>
  
        <div>
          <Card>
            <CardContent className="p-0">
              <DateRangePicker className="p-2 w-full" onDateRangeChange={setDateRange} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Ulasan Pelanggan</h2>
          <div className="space-y-4">
            {users
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-[40px] w-[40px]">
                    <AvatarImage 
                      src={user.pictures} 
                    />
                    <AvatarFallback><UserRound /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold break-all">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{user.message}</p>
                  </div>
                </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 py-4 gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left w-full sm:w-auto">
              Menampilkan {currentPage * itemsPerPage - itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, users.length)} dari {users.length} ulasan
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none"
              >
                Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(users.length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(users.length / itemsPerPage)}
                className="flex-1 sm:flex-none"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
