import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/ui/sidebar";
import { Plus, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionPage = () => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errors, setErrors] = useState({});

  const [transactionList, setTransactionList] = useState([]);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userData = localStorage.getItem("user");
        console.log("User data in localStorage:", userData); // Cek apakah ada data pengguna

        if (!userData) {
          setErrors({
            form: "Data pengguna tidak ditemukan. Silakan login terlebih dahulu.",
          });
          return;
        }

        const user = JSON.parse(userData);
        console.log("Fetched user:", user);

        // Lakukan fetch transaksi setelah mendapatkan user data
        const response = await axios.get(
          `http://localhost:3000/transaction/${user.userId}`
        );
        // Verifikasi respons API
        console.log("Respons API:", response);

        // Mengecek apakah respons mengandung data transaksi
        if (
          response &&
          response.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          console.log("Data transaksi diterima:", response.data.data);
          setTransactionList(response.data.data); // Menyimpan transaksi ke dalam state
        } else {
          console.log("Tidak ada transaksi untuk user ini.");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  // Fungsi untuk mengelompokkan transaksi per hari
  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate(transactionList);

  // State untuk menyimpan total pemasukan, pengeluaran, dan saldo
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  // Fungsi untuk menghitung total pemasukan, pengeluaran, dan saldo
  useEffect(() => {
    let income = 0;
    let expense = 0;

    // Menghitung pemasukan dan pengeluaran berdasarkan jenis transaksi
    transactionList.forEach((transaction) => {
      if (transaction.type === "Pemasukan") {
        income += transaction.amount; // Pemasukan
      } else if (transaction.type === "Pengeluaran") {
        expense += transaction.amount; // Pengeluaran
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense); // Menghitung saldo
  }, [transactionList]);

  const [formValues, setFormValues] = useState({
    category: "",
    amount: "",
    date: "",
    time: "",
    description: "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.category) newErrors.category = "Kategori wajib dipilih";
    if (!formValues.amount) newErrors.amount = "Jumlah wajib diisi";
    else if (isNaN(formValues.amount))
      newErrors.amount = "Jumlah hanya berupa angka";
    if (!formValues.date) newErrors.date = "Tanggal wajib diisi";
    if (!formValues.time) newErrors.time = "Waktu wajib diisi";
    if (!formValues.description)
      newErrors.description = "Keterangan wajib diisi";
    if (!selectedType) newErrors.type = "Tipe transaksi wajib dipilih";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Fungsi untuk mengirim data ke API
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Ambil data user yang sedang login dari localStorage
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.userId) {
        setErrors({
          form: "Tidak ada data pengguna yang ditemukan. Silakan login kembali.",
        });
        return;
      }

      // Membuat data yang akan dikirim ke backend
      const dataToSend = {
        type: selectedType,
        category: formValues.category,
        amount: formValues.amount,
        date: formValues.date,
        time: formValues.time,
        description: formValues.description,
        userId: user.userId,
      };

      console.log("Data yang dikirim:", dataToSend);

      // Menggunakan axios untuk mengirim data ke backend
      const response = await axios.post(
        "http://localhost:3000/transaction",
        dataToSend
      );

      // Menangani respon sukses dari backend
      if (response.data.success) {
        // Jika berhasil, tutup floating layer dan reset form
        setIsAddTransactionOpen(false);
        setFormValues({
          category: "",
          amount: "",
          date: "",
          time: "",
          description: "",
        });
        setSelectedType(""); // Reset selectedType setelah berhasil
      } else {
        // Jika gagal, tampilkan pesan error dari backend
        setErrors({ form: response.data.message });
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
      setErrors({ form: "Terjadi kesalahan. Coba lagi nanti." });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex w-screen overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Transaksi</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Cari apapun di sini ..."
                className="w-80 pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border-0 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Button
              className="bg-green-500 hover:bg-green-600 text-black"
              onClick={() => setIsAddTransactionOpen(true)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-zinc-900 border-0 rounded-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800 shadow-md rounded-lg p-3">
                <div className="text-sm text-gray-400">Pemasukan</div>
                <div className="text-2xl font-bold mt-1 text-green-500">
                  +Rp{totalIncome.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-zinc-800 shadow-md rounded-lg p-3">
                <div className="text-sm text-gray-400">Pengeluaran</div>
                <div className="text-2xl font-bold mt-1 text-red-500">
                  -Rp{totalExpense.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="bg-zinc-800 shadow-md rounded-lg p-3">
                <div className="text-sm text-gray-400">Sisa Saldo</div>
                <div className="text-2xl font-bold mt-1">
                  Rp{balance.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <p className="text-gray-400">No transactions available</p>
        ) : (
          Object.keys(groupedTransactions).map((date, index) => (
            <div key={index}>
              <div className="bg-zinc-900 shadow-md rounded-lg p-4 mt-4">
                <h2 className="text-xl font-bold text-white">{date}</h2>{" "}
                {/* Menampilkan tanggal */}
                {/* List Transaksi Per Hari */}
                {groupedTransactions[date].map((item, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800 shadow-md rounded-lg py-2 px-4 mt-4 flex justify-between items-center"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-full bg-blue-400"></div>{" "}
                      {/* Icon Placeholder */}
                      <div className="flex flex-col">
                        <div className="text-base font-medium text-gray-300">
                          {item.description}
                        </div>{" "}
                        {/* Deskripsi */}
                        <div className="text-sm text-gray-400">
                          {item.category}
                        </div>{" "}
                        {/* Kategori */}
                      </div>
                    </div>
                    <h2
                      className={`text-lg font-medium ${
                        item.type === "Pemasukan"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      Rp{item.amount.toLocaleString()} {/* Format jumlah */}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Floating Layer */}
      {isAddTransactionOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 flex justify-center items-center z-[9999]">
          <div className="bg-[#2C2B2B] rounded-[20px] p-10 w-[717px] h-[528px]">
            {/* Close Button */}
            <button
              className="absolute"
              style={{
                width: "28px",
                height: "28px",
                left: "1087px",
                top: "192px",
              }}
              onClick={() => setIsAddTransactionOpen(false)}
            >
              <img
                src="/close-button.png"
                alt="Close Button"
                className="w-4 h-4"
              />
            </button>
            <div className="flex justify-center mb-8 space-x-4">
              <button
                className={`px-6 py-1 rounded-[16px] border border-[#D5D5D5] ${
                  selectedType === "Pengeluaran"
                    ? "bg-[#48DE80] text-[#1C1B1B]"
                    : "bg-transparent text-[#D5D5D5]"
                }`}
                onClick={() => setSelectedType("Pengeluaran")}
              >
                Pengeluaran
              </button>
              <button
                className={`px-6 py-1 rounded-[16px] ${
                  selectedType === "Pemasukan"
                    ? "bg-[#48DE80] text-[#1C1B1B]"
                    : "bg-transparent text-[#D5D5D5] border border-[#D5D5D5]"
                }`}
                onClick={() => setSelectedType("Pemasukan")}
              >
                Pemasukan
              </button>
            </div>

            {/* Form */}
            <div className="space-y-8">
              {/* Error message global */}
              {errors.form && (
                <p className="text-red-500 text-xs mt-1">{errors.form}</p>
              )}

              {/* Jumlah */}
              <div className="flex flex-col items-center">
                <InputField
                  label="Jumlah"
                  placeholder="Masukkan jumlah"
                  value={formValues.amount}
                  onChange={(e) =>
                    setFormValues({ ...formValues, amount: e.target.value })
                  }
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Tanggal dan Waktu */}
              <div className="flex justify-between px-7">
                <InputField
                  label="Tanggal"
                  type="date"
                  value={formValues.date}
                  onChange={(e) =>
                    setFormValues({ ...formValues, date: e.target.value })
                  }
                />
                <InputField
                  label="Waktu"
                  type="time"
                  value={formValues.time}
                  onChange={(e) =>
                    setFormValues({ ...formValues, time: e.target.value })
                  }
                />
              </div>

              {/* Kategori dan Keterangan */}
              <div className="flex justify-between px-7">
                <div className="flex flex-col">
                  <label
                    className="text-[#D6D5D5] font-medium mb-2"
                    style={{
                      fontSize: "16px",
                      lineHeight: "25px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Kategori
                  </label>
                  <select
                    className="w-[280px] h-[40px] bg-[#414040] text-white px-4 py-2 rounded-[12px] focus:outline-none"
                    value={formValues.category}
                    onChange={(e) =>
                      setFormValues({ ...formValues, category: e.target.value })
                    }
                    style={{
                      background: "#414040",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <option value="" disabled hidden>
                      Tambahkan kategori
                    </option>

                    {selectedType === "Pemasukan"
                      ? ["Gaji", "Uang Saku", "Bonus", "Hadiah", "Lainnya"].map(
                          (category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          )
                        )
                      : [
                          "Makanan & Minuman",
                          "Transportasi",
                          "Pakaian",
                          "Kesehatan",
                          "Kecantikan",
                          "Pendidikan",
                          "Lainnya",
                        ].map((category) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-[#373636] hover:bg-[#414040] text-white"
                          >
                            {category}
                          </option>
                        ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
                <InputField
                  label="Keterangan"
                  placeholder="Tambahkan keterangan"
                  value={formValues.description}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      description: e.target.value,
                    })
                  }
                  style={{
                    width: "280px",
                    height: "40px",
                  }}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-12">
              <button
                className="bg-[#48DE80] py-2 text-[#1C1B1B] font-medium text-[17px] rounded-[24px]"
                onClick={handleSubmit}
                style={{ width: "460px", height: "44px" }}
              >
                Tambahkan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, placeholder, type, value, onChange }) => (
  <div className="flex flex-col">
    <label
      className="text-[#D6D5D5] font-medium mb-2"
      style={{ fontSize: "16px", lineHeight: "25px", letterSpacing: "-0.02em" }}
    >
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-[280px] h-[40px] bg-[#1C1B1B] text-white px-4 py-2 rounded-[12px] focus:outline-none"
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    />
  </div>
);
export default TransactionPage;