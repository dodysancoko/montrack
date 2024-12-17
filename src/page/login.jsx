import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });

      // Jika login berhasil
      if (response.status === 200) {
        const { id, fullname, username } = response.data.user; // Ambil data user dari response

        // Simpan data user di localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({ userId: id, fullname, username })
        );
        // Redirect ke dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      // Menangani error
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1C1B1B] flex">
      {/* Left Panel */}
      <div className="fixed left-0 top-0 w-1/2 h-full bg-gradient-to-b from-[#059C82] via-[#16C98C] to-[#059C82]">
        <div className="absolute top-[148px] left-[230px] text-center">
          <h1 className="font-bold text-white text-[45px] leading-[47px] tracking-[-0.03em]">
            Finansial Anda
            <br />
            di Satu Tempat
          </h1>
        </div>
        <div className="absolute top-[276px] left-[25px] w-[677px] h-[240px]">
          <img
            src="/illustration.png"
            alt="MonTrack"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute top-[551.2px] left-[210px] text-center">
          <p className="font-semibold text-white text-[17.6px] leading-[25.6px] tracking-[-0.03em]">
            Catat keuangan, buat wishlist, pelajari laporan,
            <br />
            dan nikmati layanan keuangan lainnya
          </p>
        </div>
        <div className="absolute bottom-[48px] left-[270.4px] flex items-center gap-2">
          <div className="w-[40px] h-[40px]">
            <img
              src="/icon-montrack.png"
              alt="MonTrack Icon"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <h2 className="font-medium text-white text-[32px] leading-[48px] tracking-[-0.03em] drop-shadow-md">
            MonTrack
          </h2>
        </div>
      </div>

      <div className="fixed right-[160px] top-[150px] bg-[#2C2B2B] rounded-[25px] w-[435.2px] h-[548.8px] p-8">
        <h1 className="text-white font-semibold text-[32px] tracking-[-0.03em]">
          Masuk
        </h1>
        <form className="mt-5 space-y-4" onSubmit={handleLogin}>
          <div className="text-left">
            <label
              htmlFor="username"
              className="block text-[14.4px] font-normal text-white/75 tracking-[-0.02em]"
            >
              Nama Pengguna
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full h-[40px] px-4 rounded-[12px] bg-white/10 border border-white/30 text-white"
            />
          </div>
          <div className="text-left">
            <label
              htmlFor="password"
              className="block text-[14.4px] font-normal text-white/75 tracking-[-0.02em]"
            >
              Kata sandi
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full h-[40px] px-4 rounded-[12px] bg-white/10 border border-white/30 text-white"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm font-medium mt-2">{error}</p>
          )}
          <div className="text-right">
            <a
              href="#"
              className="text-[#14C48B] font-medium text-[16px] underline tracking-[-0.02em]"
            >
              Lupa kata sandi?
            </a>
          </div>
          <button
            type="submit"
            className="mt-6 w-full h-[44px] bg-[#48DE80] text-[#1C1B1B] font-medium text-[17.6px] rounded-[24px]"
          >
            Masuk
          </button>
        </form>
        <div className="flex items-center justify-between mt-8">
          <hr className="w-[94px] border-t border-white/75" />
          <p className="text-white/75 text-[16px] tracking-[-0.02em]">
            atau lanjutkan dengan
          </p>
          <hr className="w-[94px] border-t border-white/75" />
        </div>
        <div className="flex justify-center gap-8 mt-6">
          <div className="relative w-[40.8px] h-[40.8px] rounded-full bg-[#333333] flex items-center justify-center">
            <img
              src="/fb.png"
              alt="Facebook"
              className="w-[33.6px] h-[33.6px]"
            />
          </div>
          <div className="relative w-[40.8px] h-[40.8px] rounded-full bg-[#333333] flex items-center justify-center">
            <img src="/google.png" alt="Google" className="w-[32px] h-[32px]" />
          </div>
        </div>
        <div className="text-center mt-[35px]">
          <p className="text-white/75 text-[16px] tracking-[-0.02em]">
            Tidak memiliki akun?{" "}
            <Link to="/register" className="font-medium text-[#14C48B]">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
