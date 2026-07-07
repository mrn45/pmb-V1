/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Settings,
  Megaphone,
  Database,
  Search,
  Filter,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  Check,
  UserPlus,
  RefreshCw,
  LogOut,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Save,
  Printer,
  Building,
  Phone,
  Image,
  Facebook,
  Instagram,
  Youtube,
  Calendar,
  FileText
} from "lucide-react";
import { User, Registration, StatusPendaftaran, Jenjang, Role, SystemSettings, Announcement } from "../types.js";
import { BismillahCalligraphy, IslamicDivider, IslamicCorners, RubElHizb } from "./IslamicOrnaments.js";

interface AdminDashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
  onPrint: (registration: Registration, type: "BUKTI" | "KARTU" | "KELULUSAN") => void;
  darkMode: boolean;
  onSettingsUpdate?: (settings: SystemSettings) => void;
}

export default function AdminDashboard({
  user,
  token,
  onLogout,
  onPrint,
  darkMode,
  onSettingsUpdate
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "peserta" | "settings" | "announcements" | "panitia" | "database">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Backend state
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [committeeUsers, setCommitteeUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/Search states for table
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [editRegForm, setEditRegForm] = useState<any>(null);
  const [isEditingReg, setIsEditingReg] = useState(false);

  // Create announcement state
  const [annForm, setAnnForm] = useState({ title: "", content: "", targetRole: "ALL" });
  const [annLoading, setAnnLoading] = useState(false);

  // Create Panitia User state
  const [newUserForm, setNewUserForm] = useState({ username: "", password: "", fullName: "", role: Role.PANITIA });
  const [newUserError, setNewUserError] = useState("");
  const [newUserSuccess, setNewUserSuccess] = useState("");

  // DB file upload state
  const [dbBackupString, setDbBackupString] = useState("");
  const [dbRestoreStatus, setDbRestoreStatus] = useState({ success: "", error: "" });

  // System Config form state
  const [configForm, setConfigForm] = useState<any>(null);

  // Custom Alert Modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const showAlert = (title: string, message: string, type: "success" | "error" | "info" = "info") => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Load all necessary dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Stats
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // 2. Settings
      const setRes = await fetch("/api/settings");
      if (setRes.ok) {
        const sData = await setRes.json();
        setSysSettings(sData);
        setConfigForm(sData);
      }

      // 3. Registrations (Initial fetch)
      fetchRegistrations();

      // 4. Announcements
      const annRes = await fetch("/api/announcements");
      if (annRes.ok) {
        setAnnouncements(await annRes.json());
      }

      // 5. Users (Admin Only)
      if (user.role === Role.ADMIN) {
        const usersRes = await fetch("/api/users", { headers });
        if (usersRes.ok) {
          setCommitteeUsers(await usersRes.json());
        }
      }

    } catch (e) {
      console.error("Gagal memuat data panel admin:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const url = `/api/registrations?search=${encodeURIComponent(searchQuery)}&level=${filterLevel}&status=${filterStatus}&sortField=${sortField}&sortOrder=${sortOrder}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error("Gagal fetch registran:", e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Re-fetch registrations when page/filters change
  useEffect(() => {
    fetchRegistrations();
  }, [currentPage, filterLevel, filterStatus, sortField, sortOrder, searchQuery, pageSize]);

  // Handle Level/Status counts or sorting
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // verifikasi status of a registration
  const handleUpdateStatus = async (regId: string, status: StatusPendaftaran) => {
    try {
      const response = await fetch(`/api/registrations/${regId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal memperbarui status.");
      }

      // Refresh data
      fetchRegistrations();
      // Reload stats
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      // If selected details modal is open, update its state
      if (selectedReg && selectedReg.id === regId) {
        setSelectedReg({ ...selectedReg, status });
      }

    } catch (e: any) {
      showAlert("Error", e.message || "Gagal mengubah status.", "error");
    }
  };

  // Delete registration (Admin & Panitia)
  const handleDeleteRegistration = (regId: string) => {
    if (user.role !== Role.ADMIN && user.role !== Role.PANITIA) return;

    showConfirm(
      "Hapus Pendaftaran",
      "Apakah Anda yakin ingin menghapus data pendaftaran ini secara permanen? Akun peserta juga akan dihapus.",
      async () => {
        try {
          const response = await fetch(`/api/registrations/${regId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            fetchRegistrations();
            setSelectedReg(null);
            // Reload stats
            const statsRes = await fetch("/api/stats");
            if (statsRes.ok) setStats(await statsRes.json());
          } else {
            const errData = await response.json();
            showAlert("Error", errData.message || "Gagal menghapus.", "error");
          }
        } catch (e) {
          console.error(e);
        }
      }
    );
  };

  // Save Settings Config (Admin & Panitia)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role !== Role.ADMIN && user.role !== Role.PANITIA) return;

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(configForm)
      });

      if (response.ok) {
        const rData = await response.json();
        setSysSettings(rData.settings);
        if (onSettingsUpdate) {
          onSettingsUpdate(rData.settings);
        }
        showAlert("Berhasil", "Konfigurasi sistem berhasil disimpan!", "success");
      } else {
        showAlert("Error", "Gagal menyimpan konfigurasi.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;

    setAnnLoading(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(annForm)
      });

      if (response.ok) {
        const rData = await response.json();
        setAnnouncements([rData.announcement, ...announcements]);
        setAnnForm({ title: "", content: "", targetRole: "ALL" });
        showAlert("Berhasil", "Pengumuman berhasil diterbitkan!", "success");
      } else {
        showAlert("Error", "Gagal membuat pengumuman.", "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnnLoading(false);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    showConfirm(
      "Hapus Pengumuman",
      "Apakah Anda yakin ingin menghapus pengumuman ini?",
      async () => {
        try {
          const response = await fetch(`/api/announcements/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            setAnnouncements(announcements.filter(a => a.id !== id));
          } else {
            showAlert("Error", "Gagal menghapus pengumuman.", "error");
          }
        } catch (e) {
          console.error(e);
        }
      }
    );
  };

  // Create User Account (Admin Only)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError("");
    setNewUserSuccess("");

    if (!newUserForm.username || !newUserForm.password || !newUserForm.fullName) {
      setNewUserError("Semua kolom wajib diisi.");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Gagal membuat pengguna.");
      }

      setCommitteeUsers([...committeeUsers, resData.user]);
      showAlert("Berhasil", `Akun Panitia "${resData.user.fullName}" berhasil dibuat!`, "success");
      setNewUserForm({ username: "", password: "", fullName: "", role: Role.PANITIA });
    } catch (err: any) {
      setNewUserError(err.message || "Terjadi kesalahan jaringan.");
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === "usr-admin") {
      showAlert("Peringatan", "Admin utama tidak dapat dihapus!", "error");
      return;
    }

    showConfirm(
      "Hapus Akun Panitia",
      "Apakah Anda yakin ingin menghapus akun panitia ini?",
      async () => {
        try {
          const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            setCommitteeUsers(committeeUsers.filter(u => u.id !== id));
          } else {
            const resData = await response.json();
            showAlert("Error", resData.message || "Gagal menghapus.", "error");
          }
        } catch (e) {
          console.error(e);
        }
      }
    );
  };

  // Database Backup / Restore
  const triggerDatabaseBackup = () => {
    window.open(`/api/db/backup?authorization=Bearer ${token}`, "_blank");
  };

  const handleDatabaseRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbRestoreStatus({ success: "", error: "" });

    if (!dbBackupString.trim()) {
      setDbRestoreStatus({ success: "", error: "Harap tempel salinan payload JSON database terlebih dahulu." });
      return;
    }

    try {
      const parsed = JSON.parse(dbBackupString);
      const response = await fetch("/api/db/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(parsed)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Restore gagal.");
      }

      setDbRestoreStatus({ success: "Database sistem berhasil direstore secara penuh!", error: "" });
      setDbBackupString("");
      // Reload everything
      loadDashboardData();
    } catch (err: any) {
      setDbRestoreStatus({ success: "", error: err.message || "Format JSON tidak valid atau korup." });
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    // Header
    csvContent += "No Pendaftaran,Jenjang,NIK,No KK,NISN,Nama Lengkap,Jenis Kelamin,Tanggal Lahir,Kabupaten,Desa,No HP,Sekolah Asal,Status,Tanggal Daftar\n";

    registrations.forEach(r => {
      let formattedBirthDate = "-";
      if (r.birthDate) {
        // Handle YYYY-MM-DD or standard dates
        const parts = r.birthDate.split('-');
        if (parts.length === 3) {
          formattedBirthDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          try {
            const d = new Date(r.birthDate);
            if (!isNaN(d.getTime())) {
              formattedBirthDate = d.toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' });
            } else {
              formattedBirthDate = r.birthDate;
            }
          } catch(e) {
            formattedBirthDate = r.birthDate;
          }
        }
      }

      const row = [
        r.registrationNumber,
        r.level,
        `="${r.nik}"`,
        `="${r.noKK || "-"}"`,
        `="${r.nisn || "-"}"`,
        `"${r.fullName.replace(/"/g, '""')}"`,
        r.gender,
        formattedBirthDate,
        `"${r.regency || "-"}"`,
        `"${r.village || "-"}"`,
        `="${r.parentPhone || "-"}"`,
        `"${(r.previousSchool || "-").replace(/"/g, '""')}"`,
        r.status,
        new Date(r.createdAt).toLocaleDateString("id-ID")
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent.replace("data:text/csv;charset=utf-8,", "")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `data_spmb_yayasan_assyafiiyah_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color mappings for recharts
  const COLORS = ["#0F766E", "#16A34A", "#D4AF37", "#2563EB", "#EF4444"];

  // Recharts custom level data formatter
  const getLevelChartData = () => {
    if (!stats?.levelCounts) return [];
    return Object.keys(stats.levelCounts).map(key => ({
      name: key,
      Pendaftar: stats.levelCounts[key]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-slate-500 font-semibold text-sm">Memuat halaman manajemen pendaftaran...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row islamic-pattern ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 no-print">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border border-accent/20">
              <RubElHizb className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="block font-cairo font-bold text-xs tracking-wider text-teal-400">YAYASAN ASSYAFIIYAH</span>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">SPMB Staff Portal</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 rounded md:hidden hover:bg-slate-800">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className={`flex-1 p-4 space-y-1 ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="mb-4 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Pengguna Aktif</span>
            <span className="block text-xs font-bold text-white uppercase truncate">{user.fullName}</span>
            <span className="inline-block mt-1 px-2 py-0.5 bg-accent/20 text-accent font-bold text-[8px] rounded uppercase">{user.role}</span>
          </div>

          <button
            onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "dashboard" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab("peserta"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "peserta" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Peserta</span>
          </button>

          {user.role === Role.ADMIN && (
            <button
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                activeTab === "settings" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Sistem</span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab("announcements"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "announcements" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Kelola Pengumuman</span>
          </button>

          {user.role === Role.ADMIN && (
            <>
              <button
                onClick={() => { setActiveTab("panitia"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  activeTab === "panitia" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Kelola Panitia</span>
              </button>

              <button
                onClick={() => { setActiveTab("database"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  activeTab === "database" ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Backup & Restore</span>
              </button>
            </>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-colors mt-6 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Sekretariat Penerimaan Yayasan Assyafiiyah</span>
            <h1 className="text-2xl font-cairo font-extrabold text-slate-900">
              {activeTab === "dashboard" && "Dashboard Pengawasan Realtime"}
              {activeTab === "peserta" && "Master Data Calon Siswa"}
              {activeTab === "settings" && "Pengaturan Sistem & Profil Lembaga"}
              {activeTab === "announcements" && "Editor Pengumuman Kelompok"}
              {activeTab === "panitia" && "Manajemen Hak Akses Panitia"}
              {activeTab === "database" && "Pemeliharaan Cadangan Database"}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadDashboardData}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-primary rounded-xl cursor-pointer shadow-sm transition-transform active:rotate-180"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TAB: DASHBOARD STATS OVERVIEW */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 islamic-card-gilded relative overflow-hidden smooth-shadow-hover cursor-default">
                <IslamicCorners />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block relative z-10">Total Pendaftar</span>
                <span className="text-3xl font-extrabold text-primary block mt-1 relative z-10">{stats.total}</span>
                <span className="text-[10px] text-slate-400 block mt-1 font-semibold relative z-10">Seluruh jenjang</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 islamic-card-gilded relative overflow-hidden smooth-shadow-hover cursor-default">
                <IslamicCorners />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block relative z-10">Belum Diverifikasi</span>
                <span className="text-3xl font-extrabold text-yellow-600 block mt-1 relative z-10">{stats.pending}</span>
                <span className="text-[10px] text-yellow-600/70 block mt-1 font-semibold relative z-10">Menunggu berkas</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 islamic-card-gilded relative overflow-hidden smooth-shadow-hover cursor-default">
                <IslamicCorners />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block relative z-10">Terverifikasi</span>
                <span className="text-3xl font-extrabold text-blue-600 block mt-1 relative z-10">{stats.verified}</span>
                <span className="text-[10px] text-blue-600/70 block mt-1 font-semibold relative z-10">Menunggu seleksi</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 islamic-card-gilded relative overflow-hidden smooth-shadow-hover cursor-default">
                <IslamicCorners />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block relative z-10">Lulus Seleksi</span>
                <span className="text-3xl font-extrabold text-secondary block mt-1 relative z-10">{stats.accepted}</span>
                <span className="text-[10px] text-green-600/70 block mt-1 font-semibold relative z-10">Siap daftar ulang</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 islamic-card-gilded relative overflow-hidden smooth-shadow-hover cursor-default">
                <IslamicCorners />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block relative z-10">Ditolak Seleksi</span>
                <span className="text-3xl font-extrabold text-red-600 block mt-1 relative z-10">{stats.rejected}</span>
                <span className="text-[10px] text-red-600/70 block mt-1 font-semibold relative z-10">Gagal kualifikasi</span>
              </div>
            </div>

            {/* Recharts Graphs */}
            <div className="grid grid-cols-1 gap-6">
              {/* level distribution chart */}
              <div className="glass-panel rounded-2xl p-6 islamic-card-gilded relative overflow-hidden smooth-shadow-lg">
                <IslamicCorners />
                <h3 className="font-cairo font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider relative z-10">Pendaftar Per Jenjang</h3>
                <div className="h-64 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getLevelChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="Pendaftar" fill="#0F766E" radius={[4, 4, 0, 0]}>
                        {getLevelChartData().map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Geographic & Regional Bento info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl p-6 smooth-shadow-lg">
                <h3 className="font-cairo font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Asal Kecamatan Pendaftar</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.keys(stats.districtCounts || {}).map((dist, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 uppercase">{dist}</span>
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full">{stats.districtCounts[dist]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 smooth-shadow-lg">
                <h3 className="font-cairo font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Asal Desa Pendaftar</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.keys(stats.villageCounts || {}).map((village, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 uppercase">{village}</span>
                      <div className="flex items-center gap-3">
                        <span className="bg-secondary/10 text-secondary font-bold px-2.5 py-0.5 rounded-full">{stats.villageCounts[village]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DATA PESERTA (MASTER LIST) */}
        {activeTab === "peserta" && (
          <div className="glass-panel rounded-2xl overflow-hidden space-y-4 p-6 smooth-shadow-lg">
            {/* Table Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary w-full sm:w-60"
                    placeholder="Cari nama, NIK, No pendaftaran..."
                  />
                </div>

                {/* Level Filter */}
                <select
                  value={filterLevel}
                  onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                  className="text-xs border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-600 focus:outline-none focus:border-primary"
                >
                  <option value="">Semua Jenjang</option>
                  <option value={Jenjang.MDT}>MDT</option>
                  <option value={Jenjang.PAUD}>PAUD</option>
                  <option value={Jenjang.SMPI}>SMP Islam</option>
                  <option value={Jenjang.SMAI}>SMA Islam</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="text-xs border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-600 focus:outline-none focus:border-primary"
                >
                  <option value="">Semua Status</option>
                  <option value={StatusPendaftaran.MENUNGGU}>Menunggu</option>
                  <option value={StatusPendaftaran.DIVERIFIKASI}>Diverifikasi</option>
                  <option value={StatusPendaftaran.DITERIMA}>Diterima</option>
                  <option value={StatusPendaftaran.TIDAK_DITERIMA}>Tidak Diterima</option>
                </select>
              </div>

              {/* Data Export / Actions */}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-white border border-slate-200 hover:text-secondary rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-secondary" />
                  <span>Export Excel (CSV)</span>
                </button>
              </div>
            </div>

            {/* Grid Table Container */}
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5 cursor-pointer select-none" onClick={() => toggleSort("registrationNumber")}>
                      <div className="flex items-center gap-1.5">
                        <span>No. Daftar</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="p-3.5 cursor-pointer select-none" onClick={() => toggleSort("fullName")}>
                      <div className="flex items-center gap-1.5">
                        <span>Nama Lengkap</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="p-3.5 cursor-pointer select-none" onClick={() => toggleSort("level")}>
                      <div className="flex items-center gap-1.5">
                        <span>Jenjang</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="p-3.5">Asal Sekolah</th>
                    <th className="p-3.5">Kecamatan</th>
                    <th className="p-3.5 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {registrations.length > 0 ? (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/40 backdrop-blur-sm transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary">{reg.registrationNumber}</td>
                        <td className="p-3.5 font-semibold text-slate-900 uppercase tracking-wide">{reg.fullName}</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded">{reg.level}</span></td>
                        <td className="p-3.5 max-w-[120px] truncate">{reg.previousSchool || "-"}</td>
                        <td className="p-3.5">{reg.district}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            reg.status === StatusPendaftaran.MENUNGGU ? "bg-yellow-50 text-yellow-800 border border-yellow-200" :
                            reg.status === StatusPendaftaran.DIVERIFIKASI ? "bg-blue-50 text-blue-800 border border-blue-200" :
                            reg.status === StatusPendaftaran.DITERIMA ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            "bg-red-50 text-red-800 border border-red-200"
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => { setSelectedReg(reg); setEditRegForm(reg); setIsEditingReg(false); }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded shadow-sm text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Detail & Verifikasi</span>
                          </button>
                          {(user.role === Role.ADMIN || user.role === Role.PANITIA) && (
                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                        Tidak ada data pendaftaran yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-50">
              <span>Halaman <b>{currentPage}</b> dari <b>{totalPages}</b></span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PENGATURAN SISTEM & PROFIL ADMINISTRATOR */}
        {activeTab === "settings" && user.role === Role.ADMIN && sysSettings && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 mb-2 gap-4">
              <div>
                <h2 className="text-xl font-cairo font-extrabold text-slate-800">Pengaturan Sistem & Profil Lembaga</h2>
                <p className="text-xs text-slate-500">Kelola kuota, gelombang pendaftaran, informasi yayasan, dan logo resmi lembaga.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="self-start md:self-auto px-5 py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer border border-accent/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4 text-accent" />
                <span>Simpan Seluruh Pengaturan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* LEFT CARD: GELOMBANG & KUOTA */}
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 smooth-shadow-lg">
                <h3 className="text-sm font-cairo font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Settings className="w-5 h-5 text-accent" />
                  <span>Konfigurasi Gelombang & Kuota</span>
                </h3>

                <form onSubmit={handleSaveSettings} className="space-y-5 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tahun Pelajaran</label>
                      <input
                        required
                        type="text"
                        value={configForm?.year || ""}
                        onChange={(e) => setConfigForm({ ...configForm, year: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-slate-800"
                        placeholder="Contoh: 2026/2027"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Gelombang Aktif</label>
                      <input
                        required
                        type="text"
                        value={configForm?.gelombang || ""}
                        onChange={(e) => setConfigForm({ ...configForm, gelombang: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-slate-800"
                        placeholder="Contoh: Gelombang 1"
                      />
                    </div>
                  </div>

                  {/* System Active switch */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configForm?.statusActive || false}
                        onChange={(e) => setConfigForm({ ...configForm, statusActive: e.target.checked })}
                        className="mt-0.5 w-4.5 h-4.5 text-primary rounded focus:ring-primary shrink-0"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">Status Pendaftaran Online (Buka/Tutup)</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Jika dinonaktifkan, formulir pendaftaran online akan ditutup untuk publik.</span>
                      </div>
                    </label>
                  </div>

                  {/* Quota parameters */}
                  <div className="space-y-4 pt-2">
                    <h4 className="font-cairo font-bold text-xs uppercase tracking-wide text-slate-500 border-b border-slate-50 pb-1 flex items-center gap-1">
                      <Users className="w-4 h-4 text-accent/80" />
                      <span>Batasan Kuota Per Jenjang</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(Jenjang).map((level) => (
                        <div key={level} className="p-3 bg-slate-50/40 backdrop-blur-sm border border-slate-100 rounded-xl flex items-center justify-between">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">{level}</label>
                            <span className="text-[10px] text-slate-400">Target Siswa</span>
                          </div>
                          <input
                            type="number"
                            value={configForm?.quota?.[level] || 0}
                            onChange={(e) => setConfigForm({
                              ...configForm,
                              quota: { ...configForm.quota, [level]: parseInt(e.target.value) || 0 }
                            })}
                            className="w-20 text-right text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-mono font-bold bg-white text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* RIGHT CARD: ADMINISTRATOR SETTINGS (PROFIL & LOGO) */}
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 smooth-shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-cairo font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                    <Building className="w-5 h-5 text-accent" />
                    <span>Identitas & Profil Lembaga</span>
                  </h3>
                  {user.role !== Role.ADMIN ? (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Hanya Admin Utama</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Admin Utama Aktif</span>
                    </span>
                  )}
                </div>

                <div className="space-y-5 text-sm">
                  {/* LOGO & LIVE PREVIEW GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Live Preview Circle */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl h-36">
                      {configForm?.logoUrl ? (
                        <div className="relative group">
                          <img
                            src={configForm.logoUrl}
                            alt="Preview Logo"
                            className="w-20 h-20 object-contain p-1 rounded-full bg-primary shadow-md border-2 border-accent"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                      <span className="text-[9px] font-semibold text-slate-400 mt-2">Live Preview Logo</span>
                    </div>

                    {/* Logo Input & Presets */}
                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Logo Sekolah / Yayasan (URL)</label>
                        <input
                          type="text"
                          disabled={user.role !== Role.ADMIN}
                          value={configForm?.logoUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, logoUrl: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-sans"
                          placeholder="Pilih preset di bawah atau tempel URL logo..."
                        />
                      </div>

                      {/* Presets Grid */}
                      {user.role === Role.ADMIN && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block">Preset Logo Cepat:</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { name: "Green", url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=120&auto=format&fit=crop&q=80" },
                              { name: "Shield", url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80" },
                              { name: "Teal", url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80" },
                              { name: "Navy", url: "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d28?w=120&auto=format&fit=crop&q=80" }
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setConfigForm({ ...configForm, logoUrl: preset.url })}
                                className={`px-1.5 py-1 text-[9px] font-bold rounded-md border text-center truncate transition-colors cursor-pointer ${
                                  configForm?.logoUrl === preset.url
                                    ? "bg-accent border-accent text-slate-900"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ketua Panitia / Kepala Sekolah */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Ketua Panitia / Kepala Lembaga</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Users className="w-3.5 h-3.5 animate-pulse" />
                      </span>
                      <input
                        type="text"
                        disabled={user.role !== Role.ADMIN}
                        value={configForm?.ketuaPanitia || ""}
                        onChange={(e) => setConfigForm({ ...configForm, ketuaPanitia: e.target.value })}
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-bold text-slate-800"
                        placeholder="Nama Ketua Panitia SPMB"
                      />
                    </div>
                  </div>

                  {/* Profil Yayasan */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Profil Singkat Yayasan / Lembaga</label>
                    <textarea
                      rows={3}
                      disabled={user.role !== Role.ADMIN}
                      value={configForm?.profilYayasan || ""}
                      onChange={(e) => setConfigForm({ ...configForm, profilYayasan: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 leading-relaxed font-sans"
                      placeholder="Tulis profil singkat yayasan yang akan ditampilkan di halaman utama..."
                    />
                  </div>

                  {/* Kontak Panitia */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Informasi Kontak & Sekretariat</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        disabled={user.role !== Role.ADMIN}
                        value={configForm?.kontakPanitia || ""}
                        onChange={(e) => setConfigForm({ ...configForm, kontakPanitia: e.target.value })}
                        className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-semibold"
                        placeholder="Contoh: 085929800093 (Panitia 1), 081234567890 (Panitia 2)"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      * Bisa memasukkan lebih dari satu kontak WhatsApp dipisah dengan tanda koma ( , )
                    </span>
                  </div>

                  {/* Sosial Media */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="font-cairo font-bold text-xs uppercase tracking-wide text-slate-600 flex items-center gap-1">
                      <span>Edit Link Media Sosial (Hanya Admin)</span>
                    </h4>
                    
                    {/* Facebook */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Facebook URL</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                          <Facebook className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          disabled={user.role !== Role.ADMIN}
                          value={configForm?.facebookUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, facebookUrl: e.target.value })}
                          className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-semibold"
                          placeholder="https://facebook.com/nama-halaman"
                        />
                      </div>
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Instagram URL</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                          <Instagram className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          disabled={user.role !== Role.ADMIN}
                          value={configForm?.instagramUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, instagramUrl: e.target.value })}
                          className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-semibold"
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                    </div>

                    {/* YouTube */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">YouTube Channel URL</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                          <Youtube className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          disabled={user.role !== Role.ADMIN}
                          value={configForm?.youtubeUrl || ""}
                          onChange={(e) => setConfigForm({ ...configForm, youtubeUrl: e.target.value })}
                          className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-semibold"
                          placeholder="https://youtube.com/c/nama-channel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: TIMELINE & JADWAL SELEKSI (ADMIN ONLY) */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 smooth-shadow-lg mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-cairo font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span>Pengaturan Timeline & Jadwal Seleksi</span>
                </h3>
                
                {/* On/Off Switch for Gelombang dan Jadwal */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">Status Tampilan Jadwal:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={user.role !== Role.ADMIN}
                      checked={configForm?.showJadwal !== false}
                      onChange={(e) => setConfigForm({ ...configForm, showJadwal: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {configForm?.showJadwal !== false ? "AKTIF / ON" : "NONAKTIF / OFF"}
                    </span>
                  </label>
                </div>
              </div>

              {configForm?.showJadwal === false && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Tampilan Jadwal Dinonaktifkan:</strong> Seluruh bagian agenda penting dan timeline gelombang tidak akan dimunculkan di halaman utama (Landing Page) bagi calon pendaftar.
                  </p>
                </div>
              )}

              {/* Dynamic Waves Management */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 font-cairo uppercase tracking-wider">Daftar Gelombang Pendaftaran</span>
                  {user.role === Role.ADMIN && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentList = configForm?.gelombangList || [
                          {
                            id: "g1",
                            name: "Gelombang 1",
                            pendaftaran: configForm?.g1Pendaftaran || `1 Maret – 30 April ${configForm?.year || "2026"}`,
                            verifikasi: configForm?.g1Verifikasi || `1 Mei – 3 Mei ${configForm?.year || "2026"}`,
                            pengumuman: configForm?.g1Pengumuman || `5 Mei ${configForm?.year || "2026"}`,
                            daftarUlang: configForm?.g1DaftarUlang || `6 Mei – 12 Mei ${configForm?.year || "2026"}`,
                          },
                          {
                            id: "g2",
                            name: "Gelombang 2",
                            pendaftaran: configForm?.g2Pendaftaran || `1 Mei – 30 Juni ${configForm?.year || "2026"}`,
                            verifikasi: configForm?.g2Verifikasi || `1 Juli – 3 Juli ${configForm?.year || "2026"}`,
                            pengumuman: configForm?.g2Pengumuman || `5 Juli ${configForm?.year || "2026"}`,
                            daftarUlang: configForm?.g2DaftarUlang || `6 Juli – 12 Juli ${configForm?.year || "2026"}`,
                          }
                        ];
                        const newWave = {
                          id: "g_" + Date.now(),
                          name: `Gelombang ${currentList.length + 1}`,
                          pendaftaran: "",
                          verifikasi: "",
                          pengumuman: "",
                          daftarUlang: ""
                        };
                        setConfigForm({
                          ...configForm,
                          gelombangList: [...currentList, newWave]
                        });
                      }}
                      className="px-3.5 py-2 bg-primary text-white hover:bg-teal-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Gelombang Baru</span>
                    </button>
                  )}
                </div>

                {/* Render Gelombang List */}
                <div className="space-y-8">
                  {(() => {
                    const currentList = configForm?.gelombangList || [
                      {
                        id: "g1",
                        name: "Gelombang 1",
                        pendaftaran: configForm?.g1Pendaftaran || `1 Maret – 30 April ${configForm?.year || "2026"}`,
                        verifikasi: configForm?.g1Verifikasi || `1 Mei – 3 Mei ${configForm?.year || "2026"}`,
                        pengumuman: configForm?.g1Pengumuman || `5 Mei ${configForm?.year || "2026"}`,
                        daftarUlang: configForm?.g1DaftarUlang || `6 Mei – 12 Mei ${configForm?.year || "2026"}`,
                      },
                      {
                        id: "g2",
                        name: "Gelombang 2",
                        pendaftaran: configForm?.g2Pendaftaran || `1 Mei – 30 Juni ${configForm?.year || "2026"}`,
                        verifikasi: configForm?.g2Verifikasi || `1 Juli – 3 Juli ${configForm?.year || "2026"}`,
                        pengumuman: configForm?.g2Pengumuman || `5 Juli ${configForm?.year || "2026"}`,
                        daftarUlang: configForm?.g2DaftarUlang || `6 Juli – 12 Juli ${configForm?.year || "2026"}`,
                      }
                    ];

                    return currentList.map((g) => (
                      <div key={g.id} className="p-5 sm:p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-4 relative">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2 w-full max-w-md">
                            <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                            <input
                              type="text"
                              disabled={user.role !== Role.ADMIN}
                              value={g.name}
                              onChange={(e) => {
                                const updated = currentList.map(item => item.id === g.id ? { ...item, name: e.target.value } : item);
                                setConfigForm({ ...configForm, gelombangList: updated });
                              }}
                              className="w-full text-xs font-bold font-cairo text-primary uppercase bg-transparent border-b border-slate-200 hover:border-slate-300 focus:border-primary focus:outline-none py-0.5 px-1"
                              placeholder="Nama Gelombang"
                            />
                          </div>

                          {user.role === Role.ADMIN && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentList.filter(item => item.id !== g.id);
                                setConfigForm({ ...configForm, gelombangList: updated });
                              }}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Gelombang"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 1: Pendaftaran Online</label>
                            <input
                              type="text"
                              disabled={user.role !== Role.ADMIN}
                              value={g.pendaftaran}
                              onChange={(e) => {
                                const updated = currentList.map(item => item.id === g.id ? { ...item, pendaftaran: e.target.value } : item);
                                setConfigForm({ ...configForm, gelombangList: updated });
                              }}
                              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-semibold text-slate-800"
                              placeholder="Contoh: 1 Mar – 30 Apr 2026"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 2: Seleksi & Verifikasi</label>
                            <input
                              type="text"
                              disabled={user.role !== Role.ADMIN}
                              value={g.verifikasi}
                              onChange={(e) => {
                                const updated = currentList.map(item => item.id === g.id ? { ...item, verifikasi: e.target.value } : item);
                                setConfigForm({ ...configForm, gelombangList: updated });
                              }}
                              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-semibold text-slate-800"
                              placeholder="Contoh: 1 Mei – 3 Mei 2026"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 3: Pengumuman Kelulusan</label>
                            <input
                              type="text"
                              disabled={user.role !== Role.ADMIN}
                              value={g.pengumuman}
                              onChange={(e) => {
                                const updated = currentList.map(item => item.id === g.id ? { ...item, pengumuman: e.target.value } : item);
                                setConfigForm({ ...configForm, gelombangList: updated });
                              }}
                              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-semibold text-slate-800"
                              placeholder="Contoh: 5 Mei 2026"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 4: Daftar Ulang Fisik</label>
                            <input
                              type="text"
                              disabled={user.role !== Role.ADMIN}
                              value={g.daftarUlang}
                              onChange={(e) => {
                                const updated = currentList.map(item => item.id === g.id ? { ...item, daftarUlang: e.target.value } : item);
                                setConfigForm({ ...configForm, gelombangList: updated });
                              }}
                              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-semibold text-slate-800"
                              placeholder="Contoh: 6 Mei – 12 Mei 2026"
                            />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: KELOLA PENGUMUMAN */}
        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-cairo font-bold text-primary text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Plus className="w-4.5 h-4.5" />
                <span>Terbitkan Pengumuman</span>
              </h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Judul Pengumuman</label>
                  <input
                    required
                    type="text"
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Contoh: Jadwal Ujian Wawancara"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Penerima Sasaran</label>
                  <select
                    value={annForm.targetRole}
                    onChange={(e) => setAnnForm({ ...annForm, targetRole: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="ALL">Semua Pengunjung (Landing Page)</option>
                    <option value={Role.PESERTA}>Hanya Calon Peserta (Portal login)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Isi Pengumuman</label>
                  <textarea
                    required
                    rows={5}
                    value={annForm.content}
                    onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Tuliskan detail pengumuman penting di sini..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={annLoading}
                  className="w-full py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {annLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Megaphone className="w-4 h-4 text-accent" />
                  )}
                  <span>Terbitkan Sekarang</span>
                </button>
              </form>
            </div>

            {/* List Announcements */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="font-cairo font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Pengumuman Aktif</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div key={ann.id} className="border border-slate-100 rounded-xl p-4 flex justify-between gap-4 relative">
                      <div className="space-y-1.5">
                        <div className="flex gap-2 items-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded">
                            {ann.targetRole === "ALL" ? "UMUM" : "PESERTA"}
                          </span>
                          <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString("id-ID")}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm font-cairo">{ann.title}</h4>
                        <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{ann.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1 text-slate-400 hover:text-red-500 self-start cursor-pointer rounded hover:bg-slate-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8 font-medium">Belum ada pengumuman terbit.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: KELOLA PANITIA (ADMIN ONLY) */}
        {activeTab === "panitia" && user.role === Role.ADMIN && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create account form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-cairo font-bold text-primary text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <UserPlus className="w-4.5 h-4.5" />
                <span>Buat Akun Panitia</span>
              </h3>

              {newUserSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                  {newUserSuccess}
                </div>
              )}
              {newUserError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-lg">
                  {newUserError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nama Lengkap Panitia</label>
                  <input
                    required
                    type="text"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Contoh: Muhammad Syafi'i, M.Pd"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Username Login</label>
                  <input
                    required
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Contoh: syapii12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Password Awal</label>
                  <input
                    required
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Min 5 karakter"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-accent" />
                  <span>Daftarkan Staff</span>
                </button>
              </form>
            </div>

            {/* List Committee Users */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="font-cairo font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Daftar Panitia & Pengawas</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {committeeUsers.filter(u => u.role !== Role.PESERTA).map((u) => (
                  <div key={u.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-50/40 backdrop-blur-sm">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-cairo">{u.fullName}</h4>
                      <div className="flex gap-2 items-center mt-1 text-[10px] font-semibold text-slate-400">
                        <span>Username: <b>{u.username}</b></span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-primary">{u.role}</span>
                      </div>
                    </div>
                    {u.id !== "usr-admin" && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50 cursor-pointer"
                        title="Hapus Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BACKUP & RESTORE DATABASE (ADMIN ONLY) */}
        {activeTab === "database" && user.role === Role.ADMIN && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 smooth-shadow-lg">
            <h2 className="text-lg font-cairo font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              <span>Pemeliharaan Database & Backup Cadangan</span>
            </h2>

            <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Peringatan Kritis:</span>
                Melakukan restore database akan menimpa seluruh data pendaftaran, akun pengguna, logs, dan setelan konfigurasi saat ini secara permanen. Pastikan Anda menyalin cadangan valid terlebih dahulu.
              </div>
            </div>

            {/* Backup block */}
            <div className="space-y-3.5">
              <h3 className="font-cairo font-bold text-sm text-slate-800">1. Unduh Cadangan JSON (.json)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unduh file cadangan database sistem lengkap untuk diarsipkan secara offline guna dipulihkan di masa depan.
              </p>
              <button
                onClick={triggerDatabaseBackup}
                className="px-4 py-2.5 bg-primary text-white hover:bg-teal-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-accent" />
                <span>Download Backup Sekarang</span>
              </button>
            </div>

            {/* Restore block */}
            <form onSubmit={handleDatabaseRestore} className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="font-cairo font-bold text-sm text-slate-800">2. Pulihkan Database Sistem</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tempel salinan isi file JSON database backup Anda di bawah ini, lalu klik Pulihkan Database.
              </p>

              {dbRestoreStatus.success && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                  {dbRestoreStatus.success}
                </div>
              )}
              {dbRestoreStatus.error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-lg">
                  {dbRestoreStatus.error}
                </div>
              )}

              <textarea
                rows={5}
                value={dbBackupString}
                onChange={(e) => setDbBackupString(e.target.value)}
                placeholder='Tempel salinan payload JSON di sini... (Contoh: { "users": [], "registrations": [], "settings": {} })'
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />

              <button
                type="submit"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Database className="w-4 h-4" />
                <span>Pulihkan Database</span>
              </button>
            </form>
          </div>
        )}

        {/* MODAL: DETAIL & VERIFIKASI PESERTA */}
        {selectedReg && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-widest">{selectedReg.registrationNumber}</span>
                  <h3 className="text-base sm:text-lg font-cairo font-bold text-slate-900 uppercase">{selectedReg.fullName}</h3>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
                
                {/* Visual Status Indicator & Actions for Panitia */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Status Verifikasi</span>
                      <span className="text-sm font-bold font-cairo text-slate-800">Ubah Keputusan Pendaftaran:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedReg.id, StatusPendaftaran.DIVERIFIKASI)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wide transition-colors cursor-pointer ${
                          selectedReg.status === StatusPendaftaran.DIVERIFIKASI
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white hover:bg-blue-50 border border-slate-200 text-blue-600"
                        }`}
                      >
                        Verifikasi Berkas
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedReg.id, StatusPendaftaran.DITERIMA)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wide transition-colors cursor-pointer ${
                          selectedReg.status === StatusPendaftaran.DITERIMA
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-600"
                        }`}
                      >
                        Lulus (Terima)
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedReg.id, StatusPendaftaran.TIDAK_DITERIMA)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wide transition-colors cursor-pointer ${
                          selectedReg.status === StatusPendaftaran.TIDAK_DITERIMA
                            ? "bg-red-600 text-white shadow-sm"
                            : "bg-white hover:bg-red-50 border border-slate-200 text-red-600"
                        }`}
                      >
                        Tolak Pendaftaran
                      </button>
                    </div>
                  </div>
                </div>

                {/* Print Quick buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onPrint(selectedReg, "BUKTI")}
                    className="py-2 bg-slate-100 hover:bg-primary hover:text-white font-bold rounded-xl transition-all text-[10px] cursor-pointer flex items-center justify-center gap-1.5 smooth-btn text-slate-700 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Bukti</span>
                  </button>
                  <button
                    onClick={() => onPrint(selectedReg, "KARTU")}
                    className="py-2 bg-slate-100 hover:bg-primary hover:text-white font-bold rounded-xl transition-all text-[10px] cursor-pointer flex items-center justify-center gap-1.5 smooth-btn text-slate-700 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Kartu</span>
                  </button>
                  <button
                    disabled={selectedReg.status !== StatusPendaftaran.DITERIMA}
                    onClick={() => onPrint(selectedReg, "KELULUSAN")}
                    className="py-2 bg-slate-100 hover:bg-secondary hover:text-white font-bold rounded-xl transition-all text-[10px] cursor-pointer flex items-center justify-center gap-1.5 smooth-btn text-slate-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Kelulusan</span>
                  </button>
                </div>

                {/* Grid Fields Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-5 text-xs sm:text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Jenjang Sekolah</span>
                    <span className="font-semibold text-slate-800">{selectedReg.level}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">NIK Calon Siswa</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedReg.nik}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Nomor KK</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedReg.noKK || "-"}</span>
                  </div>
                  {selectedReg.nisn && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">NISN</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedReg.nisn}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-800">{selectedReg.gender}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Tempat, Tanggal Lahir</span>
                    <span className="font-semibold text-slate-800">{selectedReg.birthPlace}, {new Date(selectedReg.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">No. HP Orang Tua</span>
                    <span className="font-semibold text-slate-800">{selectedReg.parentPhone}</span>
                  </div>
                  {selectedReg.email && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Email</span>
                      <span className="font-semibold text-slate-800">{selectedReg.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Sekolah Asal</span>
                    <span className="font-semibold text-slate-800">{selectedReg.previousSchool || "-"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</span>
                    <span className="font-semibold text-slate-800 uppercase">
                      {selectedReg.address}, Ds. {selectedReg.village}, Kec. {selectedReg.district}, Kab. {selectedReg.regency}, {selectedReg.province}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Nama Ayah / Pekerjaan</span>
                    <span className="font-semibold text-slate-800">{selectedReg.fatherName} ({selectedReg.fatherOccupation || "Tidak ada data"})</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Nama Ibu / Pekerjaan</span>
                    <span className="font-semibold text-slate-800">{selectedReg.motherName} ({selectedReg.motherOccupation || "Tidak ada data"})</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Memiliki KIP / PKH</span>
                    <span className="font-semibold text-slate-800">
                      KIP: {selectedReg.hasKip ? "Ya (Dicentang)" : "Tidak"} | PKH: {selectedReg.hasPkh ? "Ya (Dicentang)" : "Tidak"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedReg(null)}
                  className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-center font-cairo font-bold text-slate-900 text-lg mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-center text-xs text-slate-500 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-colors"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Custom Alert Modal */}
        <AnimatePresence>
          {alertModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden flex flex-col items-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <RubElHizb className="w-24 h-24 text-primary" />
                </div>
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  alertModal.type === 'success' ? 'bg-green-100 text-green-600' : 
                  alertModal.type === 'error' ? 'bg-red-100 text-red-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {alertModal.type === 'success' && <CheckCircle className="w-8 h-8" />}
                  {alertModal.type === 'error' && <AlertTriangle className="w-8 h-8" />}
                  {alertModal.type === 'info' && <Info className="w-8 h-8" />}
                </div>
                
                <h3 className="text-xl font-cairo font-bold text-slate-900 dark:text-white mb-2">
                  {alertModal.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 px-2">
                  {alertModal.message}
                </p>
                
                <button
                  onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all text-sm"
                >
                  Mengerti
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
