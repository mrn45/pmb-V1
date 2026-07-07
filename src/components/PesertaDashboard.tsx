/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  User,
  Activity,
  Megaphone,
  Printer,
  Lock,
  LogOut,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  ShieldAlert,
  Save,
  Menu,
  X
} from "lucide-react";
import { User as UserType, Registration, StatusPendaftaran, Announcement, Jenjang } from "../types.js";
import { BismillahCalligraphy, IslamicDivider, IslamicCorners, RubElHizb } from "./IslamicOrnaments.js";

interface PesertaDashboardProps {
  user: UserType;
  token: string;
  onLogout: () => void;
  onPrint: (type: "BUKTI" | "KARTU" | "KELULUSAN") => void;
  darkMode: boolean;
  onUserUpdate?: (user: UserType) => void;
}

export default function PesertaDashboard({
  user,
  token,
  onLogout,
  onPrint,
  darkMode,
  onUserUpdate
}: PesertaDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "profil" | "status" | "pengumuman" | "cetak" | "password">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Change Password state
  const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Fetch Registration detail & announcements
  const fetchDashboardData = async () => {
    if (!user.registrationId) return;
    setLoading(true);
    try {
      // Fetch Registration Detail
      const regRes = await fetch(`/api/registrations/${user.registrationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistration(regData);
        setProfileForm(regData);
      }

      // Fetch Announcements
      const annRes = await fetch("/api/announcements");
      if (annRes.ok) {
        const annData = await annRes.json();
        // Filter announcements targeting ALL or PESERTA
        const filtered = annData.filter((a: Announcement) => a.targetRole === "ALL" || a.targetRole === "PESERTA");
        setAnnouncements(filtered);
      }
    } catch (e) {
      console.error("Gagal memuat data dashboard peserta:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.registrationId]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSaveLoading(true);

    try {
      const response = await fetch(`/api/registrations/${user.registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Gagal memperbarui profil.");
      }

      setRegistration(resData.registration);
      setProfileForm(resData.registration);
      if (onUserUpdate && resData.registration.fullName) {
        onUserUpdate({ ...user, fullName: resData.registration.fullName });
      }
      setSuccessMsg("Profil pendaftaran Anda berhasil diperbarui!");
      setEditMode(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("Kata sandi baru dan konfirmasi tidak cocok.");
      return;
    }

    if (passForm.newPassword.length < 5) {
      setPassError("Kata sandi baru minimal 5 karakter.");
      return;
    }

    setPassLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passForm.oldPassword,
          newPassword: formDataChangePassSanitize(passForm.newPassword)
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Gagal mengubah kata sandi.");
      }

      setPassSuccess("Kata sandi Anda berhasil diperbarui!");
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPassError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setPassLoading(false);
    }
  };

  const formDataChangePassSanitize = (val: string) => val; // Dummy helper

  const getStatusBadge = (status?: StatusPendaftaran) => {
    switch (status) {
      case StatusPendaftaran.MENUNGGU:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
      case StatusPendaftaran.DIVERIFIKASI:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-full">
            <Activity className="w-3.5 h-3.5" />
            <span>Terverifikasi Berkas</span>
          </span>
        );
      case StatusPendaftaran.DITERIMA:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Diterima (Lulus Seleksi)</span>
          </span>
        );
      case StatusPendaftaran.TIDAK_DITERIMA:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-800 border border-red-200 text-xs font-bold rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Tidak Diterima</span>
          </span>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profil", label: "Profil Pendaftar", icon: User },
    { id: "status", label: "Status Kelulusan", icon: Activity },
    { id: "pengumuman", label: "Pengumuman", icon: Megaphone },
    { id: "cetak", label: "Cetak Dokumen", icon: Printer },
    { id: "password", label: "Ganti Password", icon: Lock }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-slate-500 font-semibold text-sm">Sedang memuat data akun peserta...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row islamic-pattern ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 no-print">
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border border-accent/20">
              <RubElHizb className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="block font-cairo font-bold text-xs tracking-wider text-teal-400">YAYASAN ASSYAFIIYAH</span>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Peserta Portal</span>
            </div>
          </div>
          {/* Mobile hamburger collapse */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 rounded md:hidden hover:bg-slate-800">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Menu Nav Items */}
        <nav className={`flex-1 p-4 space-y-1 ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="mb-4 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="w-12 h-12 bg-primary/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-2 font-bold font-cairo">
              {registration?.fullName ? registration.fullName[0].toUpperCase() : "P"}
            </div>
            <span className="block text-xs font-bold text-white max-w-[180px] truncate mx-auto uppercase">{registration?.fullName}</span>
            <span className="block text-[9px] font-mono text-slate-400 mt-0.5">{registration?.registrationNumber}</span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isSel
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSel ? "text-accent" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-colors mt-6 cursor-pointer border border-dashed border-red-900/20"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Aplikasi</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Portal Penerimaan Siswa Baru</span>
            <h1 className="text-2xl font-cairo font-extrabold text-slate-900">
              {activeTab === "dashboard" && "Dashboard Pendaftar"}
              {activeTab === "profil" && "Profil Formulir Pendaftaran"}
              {activeTab === "status" && "Status Hasil Seleksi"}
              {activeTab === "pengumuman" && "Informasi Dari Panitia"}
              {activeTab === "cetak" && "Cetak Berkas Kelulusan"}
              {activeTab === "password" && "Keamanan Akun"}
            </h1>
          </div>
          <div>
            {getStatusBadge(registration?.status)}
          </div>
        </header>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && registration && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: ID Card */}
              <div className="bg-primary text-white rounded-2xl p-6 shadow-md relative overflow-hidden md:col-span-2 islamic-card-gilded">
                <IslamicCorners />
                <div className="absolute right-0 top-0 w-32 h-32 bg-accent/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-100 relative z-10">KARTU PENDAFTAR ONLINE</span>
                <span className="block text-xl font-cairo font-extrabold text-accent mt-1 tracking-wide uppercase relative z-10">{registration.fullName}</span>
                <span className="block text-sm font-mono text-teal-200 mt-1 relative z-10">{registration.registrationNumber}</span>

                <div className="grid grid-cols-2 gap-4 mt-6 text-xs border-t border-teal-600/50 pt-4 relative z-10">
                  <div>
                    <span className="block text-teal-200 text-[10px] uppercase">Jenjang Dituju:</span>
                    <span className="font-bold">{registration.level}</span>
                  </div>
                  <div>
                    <span className="block text-teal-200 text-[10px] uppercase">Nomor NIK:</span>
                    <span className="font-bold">{registration.nik}</span>
                  </div>
                  <div>
                    <span className="block text-teal-200 text-[10px] uppercase">Nomor KK:</span>
                    <span className="font-bold">{registration.noKK || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-teal-200 text-[10px] uppercase">Tanggal Daftar:</span>
                    <span className="font-bold">{new Date(registration.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <div>
                    <span className="block text-teal-200 text-[10px] uppercase">Nomor HP Wali:</span>
                    <span className="font-bold">{registration.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: QR Scanner Container */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-between text-center islamic-card-gilded relative overflow-hidden smooth-shadow-lg">
                <IslamicCorners />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">QR Code Verifikasi</span>
                {registration.qrCodeUrl ? (
                  <img src={registration.qrCodeUrl} alt="Verification QR" className="w-28 h-28 border border-slate-100 rounded-lg p-1.5 relative z-10" />
                ) : (
                  <div className="w-28 h-28 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-mono relative z-10">NO QR</div>
                )}
                <span className="text-[9px] font-mono text-slate-400 mt-2 relative z-10">DIPERLUKAN SAAT DAFTAR ULANG FISIK</span>
              </div>
            </div>

            {/* Application Progress Map */}
            <div className="glass-panel rounded-2xl p-6 islamic-card-gilded relative overflow-hidden smooth-shadow-lg">
              <IslamicCorners />
              <h3 className="font-cairo font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider relative z-10">Tahapan Pengolahan Berkas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center relative z-10">
                {[
                  { step: 1, label: "Isi Formulir", status: "Selesai", desc: "Data online sudah tersimpan" },
                  { step: 2, label: "Verifikasi Berkas", status: registration.status !== StatusPendaftaran.MENUNGGU ? "Selesai" : "Proses", desc: "Verifikasi dokumen oleh panitia" },
                  { step: 3, label: "Pengumuman", status: (registration.status === StatusPendaftaran.DITERIMA || registration.status === StatusPendaftaran.TIDAK_DITERIMA) ? "Selesai" : "Proses", desc: "Pengumuman hasil seleksi masuk" },
                  { step: 4, label: "Daftar Ulang", status: registration.status === StatusPendaftaran.DITERIMA ? "Menunggu" : "Terkunci", desc: "Penyerahan berkas fisik asli" }
                ].map((s) => (
                  <div key={s.step} className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                    s.status === "Selesai"
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                      : s.status === "Proses"
                        ? "bg-yellow-50/50 border-yellow-100 text-yellow-800 animate-pulse"
                        : s.status === "Menunggu"
                          ? "bg-primary/5 border-primary/10 text-primary"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}>
                    <div>
                      <span className="font-bold text-[10px] uppercase block">Tahap {s.step}</span>
                      <span className="font-cairo font-bold text-sm block mt-0.5">{s.label}</span>
                    </div>
                    <span className="text-[10px] block mt-2 text-slate-500 leading-relaxed font-semibold">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions list card */}
            <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-2xl p-6 space-y-3.5">
              <h3 className="font-cairo font-bold text-yellow-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <span>Panduan Langkah Berikutnya:</span>
              </h3>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2 leading-relaxed">
                {registration.status === StatusPendaftaran.MENUNGGU && (
                  <li>Berkas Anda sedang berada di antrean pemeriksaan panitia. Pastikan data yang Anda masukkan valid. Anda dapat mengedit data di tab <b>"Profil Pendaftar"</b> sebelum berkas terverifikasi.</li>
                )}
                {registration.status === StatusPendaftaran.DIVERIFIKASI && (
                  <li>Dokumen online Anda sudah diverifikasi oleh panitia dan dinyatakan VALID. Harap bersiap mengikuti wawancara atau pengumuman kelulusan di tab <b>"Status Kelulusan"</b>.</li>
                )}
                {registration.status === StatusPendaftaran.DITERIMA && (
                  <li><b>Selamat!</b> Anda dinyatakan DITERIMA sebagai calon siswa baru. Segera klik menu <b>"Cetak Dokumen"</b>, cetak Surat Kelulusan, lalu kunjungi kantor sekretariat Yayasan untuk melengkapi pendaftaran ulang fisik sebelum kuota ditutup.</li>
                )}
                {registration.status === StatusPendaftaran.TIDAK_DITERIMA && (
                  <li>Kami memohon maaf yang sebesar-besarnya, data pendaftaran Anda dinyatakan belum memenuhi syarat penerimaan. Terima kasih telah mengikuti proses pendaftaran online Yayasan Assyafiiyah.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* TAB: PROFIL PENDAFTAR (EDIT FORM) */}
        {activeTab === "profil" && registration && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 smooth-shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-cairo font-bold text-primary flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                <span>Biodata Formulir Pendaftaran</span>
              </h2>
              {registration.status === StatusPendaftaran.MENUNGGU ? (
                <button
                  type="button"
                  onClick={() => {
                    if (editMode) {
                      // Reset profile form to current registration to discard changes
                      setProfileForm({ ...registration });
                    }
                    setEditMode(!editMode);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {editMode ? "Batal Edit" : "Edit Formulir"}
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 font-bold italic bg-slate-50 py-1.5 px-3 border border-slate-200 rounded-full">
                  Form Terkunci (Sudah Terverifikasi)
                </span>
              )}
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Lengkap Siswa</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.fullName || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary uppercase disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenis Kelamin</label>
                  <select
                    disabled={!editMode}
                    value={profileForm?.gender || "Laki-laki"}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* NIK */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">NIK (KTP/KK)</label>
                  <input
                    disabled
                    type="text"
                    value={registration.nik}
                    className="w-full text-sm px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 focus:outline-none cursor-not-allowed font-mono font-bold"
                  />
                </div>

                {/* No KK */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nomor Kartu Keluarga</label>
                  <input
                    disabled
                    type="text"
                    value={registration.noKK || "-"}
                    className="w-full text-sm px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 focus:outline-none cursor-not-allowed font-mono font-bold"
                  />
                </div>

                {/* Birth Place / Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tempat Lahir</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.birthPlace || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, birthPlace: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tanggal Lahir</label>
                  <input
                    disabled={!editMode}
                    required
                    type="date"
                    value={profileForm?.birthDate?.split("T")[0] || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold"
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nomor HP / WhatsApp Wali</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.parentPhone || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, parentPhone: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email (Opsional)</label>
                  <input
                    disabled={!editMode}
                    type="email"
                    value={profileForm?.email || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* School */}
                {profileForm?.level !== Jenjang.PAUD && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sekolah Asal</label>
                    <input
                      disabled={!editMode}
                      type="text"
                      value={profileForm?.previousSchool || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, previousSchool: e.target.value })}
                      className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                )}

                {/* Ijazah */}
                {(profileForm?.level === Jenjang.SMPI || profileForm?.level === Jenjang.SMAI) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nomor Ijazah (Opsional)</label>
                    <input
                      disabled={!editMode}
                      type="text"
                      value={profileForm?.ijazahNumber || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, ijazahNumber: e.target.value })}
                      className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                )}

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Alamat Jalan / Dusun</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.address || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Village / District / Regency */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Desa / Kelurahan</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.village || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kecamatan</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.district || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Father & Mother info */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Ayah Kandung</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.fatherName || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Ibu Kandung</label>
                  <input
                    disabled={!editMode}
                    required
                    type="text"
                    value={profileForm?.motherName || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, motherName: e.target.value })}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                  />
                </div>
              </div>

              {editMode && (
                <div className="flex justify-end pt-4 border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-5 py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB: STATUS KELULUSAN */}
        {activeTab === "status" && registration && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 smooth-shadow-lg">
            <h2 className="text-lg font-cairo font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              <span>Status Hasil Seleksi Kelulusan</span>
            </h2>

            <div className="max-w-2xl mx-auto text-center py-10 space-y-6">
              {registration.status === StatusPendaftaran.MENUNGGU && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-yellow-200">
                    <Clock className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-xl font-cairo font-bold text-slate-800">Menunggu Proses Seleksi</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Berkas pendaftaran Anda telah terekam dan sedang menanti proses verifikasi menyeluruh oleh tim panitia SPMB Yayasan Assyafiiyah. Silakan cek berkala halaman ini.
                  </p>
                </div>
              )}

              {registration.status === StatusPendaftaran.DIVERIFIKASI && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-200">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-cairo font-bold text-slate-800">Berkas Terverifikasi</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Dokumen Anda dinyatakan VALID. Tahap selanjutnya adalah menunggu keputusan kelulusan seleksi akhir atau undangan wawancara yang akan segera dikirimkan panitia.
                  </p>
                </div>
              )}

              {registration.status === StatusPendaftaran.DITERIMA && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow border border-emerald-200 animate-bounce">
                    <Award className="w-10 h-10" />
                  </div>
                  <span className="text-xs uppercase font-bold text-emerald-600 bg-emerald-100/50 py-1 px-3.5 rounded-full tracking-widest">Keputusan Panitia</span>
                  <h3 className="text-2xl font-cairo font-extrabold text-emerald-800">Selamat! Anda Dinyatakan Lulus</h3>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-semibold">
                    Selamat, Anda dinyatakan DITERIMA sebagai calon siswa baru Yayasan Assyafiiyah Tahun Pelajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}. Segera selesaikan berkas administrasi Anda.
                  </p>
                  <div className="pt-4 flex justify-center gap-4">
                    <button
                      onClick={() => onPrint("KELULUSAN")}
                      className="px-5 py-3 bg-primary text-white hover:bg-teal-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak Surat Kelulusan</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("cetak")}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      Lihat Dokumen Lainnya
                    </button>
                  </div>
                </div>
              )}

              {registration.status === StatusPendaftaran.TIDAK_DITERIMA && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-red-200">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-cairo font-bold text-red-800">Proses Seleksi Belum Berhasil</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Terima kasih telah mengikuti proses pendaftaran online Yayasan Assyafiiyah. Berdasarkan hasil seleksi administrasi dan kuota pendaftaran yang sangat terbatas, kami memohon maaf data Anda belum dinyatakan lulus pada tahun ajaran ini. Tetap semangat!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PENGUMUMAN */}
        {activeTab === "pengumuman" && (
          <div className="space-y-6">
            {announcements && announcements.length > 0 ? (
              <div className="space-y-6">
                {announcements.map((ann) => (
                  <div key={ann.id} className="glass-panel rounded-2xl p-6 relative overflow-hidden group smooth-shadow-hover">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-semibold">
                      <span>Panitia SPMB Yayasan</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <h3 className="text-lg font-cairo font-bold text-slate-900 group-hover:text-primary transition-colors">{ann.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed whitespace-pre-line">{ann.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center smooth-shadow-lg">
                <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-cairo font-bold text-slate-800 text-base">Belum Ada Pengumuman</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mt-1">
                  Saat ini panitia belum merilis informasi baru khusus untuk kelompok pendaftar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: CETAK DOKUMEN */}
        {activeTab === "cetak" && registration && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 smooth-shadow-lg">
            <h2 className="text-lg font-cairo font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
              <Printer className="w-5 h-5 text-accent" />
              <span>Cetak Dokumen Resmi Pendaftaran</span>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Cetak berkas-berkas resmi pendaftaran langsung dari browser Anda. Harap pastikan printer Anda terhubung dengan baik atau Anda dapat menyimpan file dalam format PDF di dialog cetak browser.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Card 1: Bukti Daftar */}
              <div className="border border-slate-150 rounded-2xl p-6 flex flex-col justify-between hover:border-primary transition-colors bg-slate-50/40 backdrop-blur-sm">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-bold rounded uppercase">SELALU TERSEDIA</span>
                  <h3 className="font-cairo font-bold text-slate-800 text-sm mt-1.5">Bukti Pendaftaran Online</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Struk tanda bukti pendaftaran online lengkap dengan NIK, nomor pendaftaran, dan data pribadi calon siswa.
                  </p>
                </div>
                <button
                  onClick={() => onPrint("BUKTI")}
                  className="w-full mt-6 py-2.5 bg-primary text-white hover:bg-teal-800 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 smooth-btn smooth-btn"
                >
                  <Printer className="w-4 h-4 text-accent" />
                  <span>Cetak Bukti</span>
                </button>
              </div>

              {/* Card 2: Kartu Peserta */}
              <div className="border border-slate-150 rounded-2xl p-6 flex flex-col justify-between hover:border-primary transition-colors bg-slate-50/40 backdrop-blur-sm">
                <div className="space-y-2">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-bold rounded uppercase">SELALU TERSEDIA</span>
                  <h3 className="font-cairo font-bold text-slate-800 text-sm mt-1.5">Kartu Peserta Ujian</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Kartu identitas peserta ujian seleksi masuk dan wawancara. Dilengkapi pasfoto box tempel dan QR code.
                  </p>
                </div>
                <button
                  onClick={() => onPrint("KARTU")}
                  className="w-full mt-6 py-2.5 bg-primary text-white hover:bg-teal-800 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 smooth-btn smooth-btn"
                >
                  <Printer className="w-4 h-4 text-accent" />
                  <span>Cetak Kartu</span>
                </button>
              </div>

              {/* Card 3: Surat Kelulusan */}
              <div className={`border rounded-2xl p-6 flex flex-col justify-between bg-slate-50/40 backdrop-blur-sm ${
                registration.status === StatusPendaftaran.DITERIMA
                  ? "border-emerald-200 hover:border-emerald-500"
                  : "border-slate-150 opacity-60"
              }`}>
                <div className="space-y-2">
                  {registration.status === StatusPendaftaran.DITERIMA ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded uppercase">TERSEDIA (LULUS)</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-bold rounded uppercase">BELUM TERSEDIA</span>
                  )}
                  <h3 className="font-cairo font-bold text-slate-800 text-sm mt-1.5">Surat Pengumuman Kelulusan</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Surat keputusan resmi panitia penerimaan siswa yang menerangkan status kelulusan akhir peserta pendaftaran.
                  </p>
                </div>
                {registration.status === StatusPendaftaran.DITERIMA ? (
                  <button
                    onClick={() => onPrint("KELULUSAN")}
                    className="w-full mt-6 py-2.5 bg-secondary text-white hover:bg-green-700 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 smooth-btn smooth-btn"
                  >
                    <Printer className="w-4 h-4 text-accent" />
                    <span>Cetak Kelulusan</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full mt-6 py-2 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed"
                  >
                    Terkunci
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GANTI PASSWORD */}
        {activeTab === "password" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-6 smooth-shadow-lg">
            <h2 className="text-lg font-cairo font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              <span>Ganti Kata Sandi Akun</span>
            </h2>

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                {passSuccess}
              </div>
            )}
            {passError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-lg">
                {passError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Kata Sandi Lama</label>
                <input
                  required
                  type="password"
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Masukkan kata sandi saat ini"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Kata Sandi Baru</label>
                <input
                  required
                  type="password"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Masukkan kata sandi baru (min 5 karakter)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Konfirmasi Kata Sandi Baru</label>
                <input
                  required
                  type="password"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Masukkan kembali kata sandi baru"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {passLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>Ganti Password</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
