/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LogIn,
  KeyRound,
  Shield,
  User,
  AlertCircle,
  Home,
  Menu,
  Moon,
  Sun,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import LandingPage from "./components/LandingPage.js";
import RegistrationForm from "./components/RegistrationForm.js";
import PesertaDashboard from "./components/PesertaDashboard.js";
import AdminDashboard from "./components/AdminDashboard.js";
import PrintDocument from "./components/PrintDocument.js";
import { User as UserType, Registration, Role } from "./types.js";
import { BismillahCalligraphy, IslamicDivider, IslamicCorners, RubElHizb } from "./components/IslamicOrnaments.js";

type ViewType = "landing" | "register" | "login" | "peserta-dashboard" | "admin-dashboard" | "print";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string>("");
  const [restoringSession, setRestoringSession] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Printing state
  const [printType, setPrintType] = useState<"BUKTI" | "KARTU" | "KELULUSAN" | null>(null);
  const [printReg, setPrintReg] = useState<Registration | null>(null);

  // Success Popup state
  const [successPopupReg, setSuccessPopupReg] = useState<Registration | null>(null);

  // Landing page data states
  const [sysSettings, setSysSettings] = useState<any>({
    year: "2026/2027",
    gelombang: "Gelombang 1",
    statusActive: true,
    quota: { MDT: 100, PAUD: 100, SMPI: 100, SMAI: 100 }
  });
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    verified: 0,
    accepted: 0,
    rejected: 0,
    levelCounts: { MDT: 0, PAUD: 0, SMPI: 0, SMAI: 0 }
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Login form state
  const [loginRole, setLoginRole] = useState<"PESERTA" | "STAFF">("PESERTA");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Recovery Session on Mount
  useEffect(() => {
    // Fetch landing page data
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setSysSettings(data));

    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStats(data));

    fetch("/api/announcements")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAnnouncements(data));

    const savedToken = localStorage.getItem("spmb_token");
    const savedUser = localStorage.getItem("spmb_user");

    if (savedToken && savedUser) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Token kedaluwarsa");
        })
        .then((data) => {
          setToken(savedToken);
          setUser(data.user);
          if (data.user.role === Role.PESERTA) {
            setCurrentView("peserta-dashboard");
          } else {
            setCurrentView("admin-dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem("spmb_token");
          localStorage.removeItem("spmb_user");
        })
        .finally(() => {
          setRestoringSession(false);
        });
    } else {
      setRestoringSession(false);
    }
  }, []);

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal masuk. Periksa kembali akun Anda.");
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("spmb_token", data.token);
      localStorage.setItem("spmb_user", JSON.stringify(data.user));

      setLoginForm({ username: "", password: "" });
      if (data.user.role === Role.PESERTA) {
        setCurrentView("peserta-dashboard");
      } else {
        setCurrentView("admin-dashboard");
      }
    } catch (err: any) {
      setLoginError(err.message || "Terjadi kesalahan koneksi jaringan.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("spmb_token");
    localStorage.removeItem("spmb_user");
    setUser(null);
    setToken("");
    setCurrentView("landing");
  };

  // Launch Print helper from dashboard
  const handlePrintLaunch = (reg: Registration, type: "BUKTI" | "KARTU" | "KELULUSAN") => {
    setPrintReg(reg);
    setPrintType(type);
    setCurrentView("print");
  };

  if (restoringSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Verifikasi Sesi Aktif...</span>
      </div>
    );
  }

  // View: Print document renders standalone clean
  if (currentView === "print" && printReg && printType) {
    return (
      <div className="bg-slate-100 min-h-screen">
        {/* Floating print command bar */}
        <div className="bg-slate-900 text-white py-3.5 px-6 shadow-md flex justify-between items-center no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (user?.role === Role.PESERTA) {
                  setCurrentView("peserta-dashboard");
                } else {
                  setCurrentView("admin-dashboard");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-accent" />
              <span>Kembali Ke Dashboard</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">Dokumen: <b className="text-white">{printType}</b></span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-primary hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Cetak Dokumen (Print)
          </button>
        </div>

        {/* The Print document page area */}
        <div className="p-4 sm:p-8 flex justify-center bg-white min-h-screen">
          <PrintDocument
            type={printType}
            registration={printReg}
            settings={sysSettings}
            onBack={() => {
              if (user?.role === Role.PESERTA) {
                setCurrentView("peserta-dashboard");
              } else {
                setCurrentView("admin-dashboard");
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Floating Theme / Back to Home corner button on login/register view */}
      {(currentView === "login" || currentView === "register") && (
        <div className="fixed top-4 right-4 z-50 flex gap-2.5">
          <button
            onClick={() => setCurrentView("landing")}
            className="p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full shadow border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer"
            title="Kembali ke Beranda"
          >
            <Home className="w-4 h-4 text-primary dark:text-teal-400" />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full shadow border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer"
            title="Ganti Tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* VIEW: LANDING PAGE */}
        {currentView === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <LandingPage
              settings={sysSettings}
              stats={stats}
              announcements={announcements}
              onNavigateToRegister={() => setCurrentView("register")}
              onNavigateToLogin={() => {
                if (user) {
                  setCurrentView(user.role === Role.PESERTA ? "peserta-dashboard" : "admin-dashboard");
                } else {
                  setCurrentView("login");
                }
              }}
              darkMode={darkMode}
            />
          </motion.div>
        )}

        {/* VIEW: REGISTRATION FORM WIZARD */}
        {currentView === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex items-center justify-center p-4 py-16 sm:p-8 islamic-pattern"
          >
            <div className="w-full max-w-4xl">
              <RegistrationForm
                onSuccess={(regData) => {
                  setSuccessPopupReg(regData);
                }}
                onCancel={() => setCurrentView("landing")}
              />
            </div>
          </motion.div>
        )}

        {/* VIEW: UNIFIED PORTAL LOGIN */}
        {currentView === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center p-4 py-12 islamic-pattern bg-slate-900/10 dark:bg-slate-950/40"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 relative islamic-card-gilded">
              <IslamicCorners />
              
              {/* Login Branding */}
              <div className="bg-primary text-white p-7 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-teal-800 opacity-20 transform -rotate-12 scale-120" />
                <div className="flex justify-center mb-2">
                  <RubElHizb className="w-8 h-8 text-accent animate-pulse" />
                </div>
                <span className="text-[10px] uppercase font-bold text-teal-100 tracking-widest block mb-1">PORTAL SPMB ONLINE</span>
                <h2 className="text-xl font-cairo font-extrabold text-accent">YAYASAN ASSYAFIIYAH</h2>
                <span className="text-xs text-teal-100 block mt-1">Sumenep, Madura, Jawa Timur</span>
              </div>

              {/* Login Role Toggle tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                <button
                  type="button"
                  onClick={() => { setLoginRole("PESERTA"); setLoginError(""); }}
                  className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginRole === "PESERTA" ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:text-slate-800"
                  }`}
                >
                  <User className="w-4 h-4 text-accent" />
                  <span>Calon Wali/Peserta</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginRole("STAFF"); setLoginError(""); }}
                  className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginRole === "STAFF" ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:text-slate-800"
                  }`}
                >
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Panitia / Admin</span>
                </button>
              </div>

              {/* Login Form body */}
              <form onSubmit={handleLogin} className="p-7 space-y-5 text-sm">
                


                {loginError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                    {loginRole === "PESERTA" ? "Nomor NIK Siswa" : "Username Login"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary bg-slate-50 dark:bg-slate-900 font-semibold"
                      placeholder={loginRole === "PESERTA" ? "Masukkan NIK yang didaftarkan" : "Masukkan username Anda"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full text-sm pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary bg-slate-50 dark:bg-slate-900"
                      placeholder="Masukkan kata sandi akun"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                      title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {loginRole === "PESERTA" && (
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold italic">
                    * Catatan: Untuk login Calon Peserta baru pertama kali, gunakan <b>NIK Anda</b> sebagai username dan <b>NIK Anda</b> sebagai kata sandi awal pendaftaran.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer smooth-btn"
                >
                  {loginLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 text-accent" />
                  )}
                  <span>Masuk Portal</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* VIEW: PESERTA PORTAL DASHBOARD */}
        {currentView === "peserta-dashboard" && user && (
          <motion.div
            key="peserta-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <PesertaDashboard
              user={user}
              token={token}
              onLogout={handleLogout}
              onPrint={(type) => {
                // Fetch the registration details and trigger the print view
                fetch(`/api/registrations/${user.registrationId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                  .then((res) => res.json())
                  .then((reg) => handlePrintLaunch(reg, type));
              }}
              darkMode={darkMode}
              onUserUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem("spmb_user", JSON.stringify(updatedUser));
              }}
            />
          </motion.div>
        )}

        {/* VIEW: ADMIN PORTAL DASHBOARD */}
        {currentView === "admin-dashboard" && user && (
          <motion.div
            key="admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <AdminDashboard
              user={user}
              token={token}
              onLogout={handleLogout}
              onPrint={(reg, type) => handlePrintLaunch(reg, type)}
              darkMode={darkMode}
              onSettingsUpdate={(settings) => setSysSettings(settings)}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
