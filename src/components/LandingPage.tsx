/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Users,
  Award,
  GraduationCap,
  ArrowUp,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { Jenjang, SystemSettings, Announcement } from "../types.js";
import { BismillahCalligraphy, IslamicDivider, IslamicCorners, RubElHizb } from "./IslamicOrnaments.js";

interface LandingPageProps {
  settings: SystemSettings;
  stats: any;
  announcements: Announcement[];
  onNavigateToRegister: (level?: Jenjang) => void;
  onNavigateToLogin: () => void;
  darkMode: boolean;
}

export default function LandingPage({
  settings,
  stats,
  announcements,
  onNavigateToRegister,
  onNavigateToLogin,
  darkMode
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeGelombangTab, setActiveGelombangTab] = useState<"G1" | "G2">(
    settings.gelombang?.toLowerCase().includes("gelombang 2") || settings.gelombang?.toLowerCase().includes("g2") ? "G2" : "G1"
  );

  // Scroll Progress and Back To Top
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const levelsInfo = [
    {
      id: Jenjang.MDT,
      title: "Madrasah Diniyah Takmiliyah",
      short: "MDT Assyafiiyah",
      desc: "Madrasah sore untuk mendalami Al-Qur'an, Tajwid, Tauhid, Fiqih, Akhlak, serta Sejarah Kebudayaan Islam sejak dini.",
      quota: settings.quota[Jenjang.MDT] || 60,
      registered: stats?.levelCounts?.[Jenjang.MDT] || 0,
      icon: BookOpen,
      color: "from-teal-500 to-emerald-600"
    },
    {
      id: Jenjang.PAUD,
      title: "PAUD Assyafiiyah",
      short: "PAUD Assyafiiyah",
      desc: "Pendidikan anak usia dini yang ceria dan islami, berfokus pada pembentukan karakter dasar, motorik, serta hafalan surat-surat pendek.",
      quota: settings.quota[Jenjang.PAUD] || 40,
      registered: stats?.levelCounts?.[Jenjang.PAUD] || 0,
      icon: Award,
      color: "from-emerald-500 to-green-600"
    },
    {
      id: Jenjang.SMPI,
      title: "SMP Islam Assyafiiyah",
      short: "SMPI Assyafiiyah",
      desc: "Mempadukan kurikulum nasional (Kemendikbudristek) dengan kajian kitab kuning, program tahfidz Qur'an, dan bahasa asing.",
      quota: settings.quota[Jenjang.SMPI] || 120,
      registered: stats?.levelCounts?.[Jenjang.SMPI] || 0,
      icon: GraduationCap,
      color: "from-teal-600 to-cyan-600"
    },
    {
      id: Jenjang.SMAI,
      title: "SMA Islam Assyafiiyah",
      short: "SMAI Assyafiiyah",
      desc: "Sekolah menengah atas unggulan yang mempersiapkan siswa menuju perguruan tinggi nasional/internasional serta mencetak kader dakwah.",
      quota: settings.quota[Jenjang.SMAI] || 100,
      registered: stats?.levelCounts?.[Jenjang.SMAI] || 0,
      icon: ShieldCheck,
      color: "from-teal-700 to-emerald-700"
    }
  ];

  const timelineSteps = [
    { step: 1, title: "Pilih Jenjang", desc: "Tentukan jenjang pendidikan yang sesuai untuk calon peserta didik baru." },
    { step: 2, title: "Isi Formulir", desc: "Lengkapi data diri, alamat, serta informasi orang tua secara valid." },
    { step: 3, title: "Kirim Data", desc: "Periksa kembali semua isian lalu klik Daftar Sekarang untuk mendapatkan nomor pendaftaran." },
    { step: 4, title: "Verifikasi Panitia", desc: "Panitia akan memeriksa kecocokan data administratif secara berkala." },
    { step: 5, title: "Pengumuman", desc: "Masuk ke sistem pendaftaran menggunakan username untuk melihat hasil kelulusan seleksi." },
    { step: 6, title: "Daftar Ulang", desc: "Bawa dokumen fisik asli ke kantor sekretariat pendaftaran untuk menyelesaikan administrasi." }
  ];

  const faqs = [
    {
      q: "Bagaimana cara melakukan pendaftaran murid baru?",
      a: "Pendaftaran dapat dilakukan secara online melalui website ini dengan menekan tombol 'Daftar Sekarang', memilih jenjang pendidikan, lalu mengisi formulir secara lengkap tanpa perlu mengupload berkas apa pun."
    },
    {
      q: "Apakah ada biaya pendaftaran awal?",
      a: "Biaya pendaftaran awal untuk seluruh jenjang pendidikan di Yayasan Assyafiiyah adalah GRATIS. Biaya administrasi sekolah akan diinformasikan saat proses daftar ulang fisik."
    },
    {
      q: "Kapan dokumen asli seperti Akta Kelahiran dan KK dikumpulkan?",
      a: "Semua berkas dokumen fisik asli (Akta Kelahiran, Kartu Keluarga, KTP Orang Tua, Ijazah atau surat keterangan lulus) dibawa langsung ke sekolah saat proses Daftar Ulang fisik setelah dinyatakan lulus seleksi."
    },
    {
      q: "Bagaimana cara mengetahui hasil pengumuman kelulusan?",
      a: "Setelah mendaftar, Anda akan mendapatkan Nomor Pendaftaran, Username, dan Password. Gunakan akun tersebut untuk Login ke Dashboard Peserta. Hasil seleksi akan tertera secara realtime di halaman Dashboard Anda."
    },
    {
      q: "Di mana alamat kantor sekretariat pendaftaran Yayasan Assyafiiyah?",
      a: "Sekretariat kami berlokasi di Lenteng Barat, Kecamatan Lenteng, Kabupaten Sumenep, Jawa Timur. Peta interaktif kami dapat dilihat di bagian kontak halaman ini."
    }
  ];

  return (
    <div className={`min-h-screen islamic-pattern font-sans ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-accent z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Sticky Navbar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md shadow-sm transition-colors duration-300 border-b ${
        darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => scrollToSection("home")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 shadow-md border border-accent/20 overflow-hidden p-0.5">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white font-cairo font-bold text-lg">A</span>
                )}
              </div>
              <div>
                <span className="block font-cairo font-bold text-sm tracking-wide text-primary">YAYASAN ASSYAFIIYAH</span>
                <span className="block text-[10px] uppercase tracking-wider text-accent font-semibold">SPMB Online 2026/2027</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection("home")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Home</button>
              <button onClick={() => scrollToSection("profil")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Profil</button>
              <button onClick={() => scrollToSection("jenjang")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Jenjang</button>
              <button onClick={() => scrollToSection("alur")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Alur</button>
              <button onClick={() => scrollToSection("jadwal")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Jadwal</button>
              <button onClick={() => scrollToSection("persyaratan")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Persyaratan</button>
              <button onClick={() => scrollToSection("faq")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">FAQ</button>
              <button onClick={() => scrollToSection("kontak")} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Kontak</button>
              
              <button
                onClick={onNavigateToLogin}
                className="ml-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-teal-800 transition-all duration-200 shadow-sm border border-accent/20 flex items-center gap-1.5"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-200 transition-colors ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white"
          }`}>
            <button onClick={() => scrollToSection("home")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Home</button>
            <button onClick={() => scrollToSection("profil")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Profil</button>
            <button onClick={() => scrollToSection("jenjang")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Jenjang</button>
            <button onClick={() => scrollToSection("alur")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Alur</button>
            <button onClick={() => scrollToSection("jadwal")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Jadwal</button>
            <button onClick={() => scrollToSection("persyaratan")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Persyaratan</button>
            <button onClick={() => scrollToSection("faq")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">FAQ</button>
            <button onClick={() => scrollToSection("kontak")} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary">Kontak</button>
            <div className="pt-2 border-t border-slate-100 mt-2">
              <button
                onClick={onNavigateToLogin}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-center font-semibold hover:bg-teal-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Login Aplikasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6">
        {/* Subtle Decorative Mosque Background Geometry */}
        <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] border-[16px] border-primary rounded-full transform rotate-45 flex items-center justify-center">
            <div className="w-[600px] h-[600px] border-[8px] border-accent rounded-full transform -rotate-12 flex items-center justify-center">
              <div className="w-[400px] h-[400px] border-[4px] border-primary rounded-full transform rotate-90" />
            </div>
          </div>
        </div>

        {/* Floating Ambient Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse" />

        <div className="max-w-5xl mx-auto text-center z-10 relative glass-panel islamic-card-gilded rounded-3xl p-8 sm:p-12">
          <IslamicCorners />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-primary mx-auto rounded-full flex items-center justify-center shadow-lg border-2 border-accent p-1 relative overflow-hidden">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white font-cairo font-bold text-3xl">A</span>
              )}
              {/* Spinning star accent around the logo */}
              <div className="absolute -inset-1 border border-dashed border-accent/30 rounded-full animate-spin [animation-duration:12s]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <BismillahCalligraphy className="mb-6" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-cairo font-extrabold tracking-tight"
          >
            <span className="block text-slate-900">SPMB ONLINE</span>
            <span className="block text-primary mt-2">YAYASAN ASSYAFIIYAH</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto font-medium"
          >
            Penerimaan Murid Baru Tahun Pelajaran <span className="text-primary font-bold">{settings.year}</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-2 text-sm sm:text-lg text-accent italic font-cairo font-semibold"
          >
            "{settings.gelombang || "Gelombang 1"}: {settings.statusActive ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}"
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-4 text-xs sm:text-base text-slate-600 max-w-xl mx-auto bg-primary/5 py-2 px-4 rounded-full border border-primary/10 inline-flex items-center gap-2"
          >
            <span className="inline-block w-2.5 h-2.5 bg-secondary rounded-full animate-ping" />
            <span className="font-semibold text-primary">Tagline:</span> "Mencetak Generasi Qurani, Berprestasi, dan Berakhlakul Karimah"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            {settings.statusActive ? (
              <button
                onClick={() => onNavigateToRegister()}
                className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-bold hover:bg-teal-800 transition-all duration-200 shadow-lg border border-accent/20 cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-5 h-5 text-accent" />
              </button>
            ) : (
              <div className="px-8 py-4 bg-slate-200 text-slate-500 rounded-xl text-lg font-bold">
                Pendaftaran Sedang Ditutup
              </div>
            )}
            <button
              onClick={() => scrollToSection("profil")}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-primary border border-slate-200 rounded-xl text-lg font-bold transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              <span>Lihat Profil Yayasan</span>
              <ChevronDown className="w-5 h-5 text-accent" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Profil Yayasan Section */}
      <section id="profil" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Yayasan Assyafiiyah</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Profil & Komitmen Pendidikan</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
            <p className="mt-4 text-slate-500 whitespace-pre-line">
              {settings?.profilYayasan || "Lenteng Barat, Kecamatan Lenteng, Kabupaten Sumenep, Jawa Timur. Lembaga pendidikan terpadu yang memadukan keunggulan sains akademis dengan khazanah kepesantrenan."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-2xl glass-panel islamic-card-gilded relative overflow-hidden group">
              <IslamicCorners />
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 relative">
                <BookOpen className="w-8 h-8" />
                <div className="absolute inset-0 border border-accent/20 rounded-xl scale-95 group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-xl font-cairo font-bold mb-3 text-slate-900">Pendidikan Qurani</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Membiasakan murid mencintai, menghafal, mentadaburi, serta mengamalkan Al-Qur'anul Karim dalam akhlak kehidupan sehari-hari.
              </p>
            </div>

            <div className="p-8 rounded-2xl glass-panel islamic-card-gilded relative overflow-hidden group">
              <IslamicCorners />
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 relative">
                <Award className="w-8 h-8" />
                <div className="absolute inset-0 border border-accent/20 rounded-xl scale-95 group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-xl font-cairo font-bold mb-3 text-slate-900">Sains & Prestasi</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Mendorong kreativitas dan prestasi akademis maupun non-akademis melalui pengajaran modern berbasis riset dan teknologi informasi.
              </p>
            </div>

            <div className="p-8 rounded-2xl glass-panel islamic-card-gilded relative overflow-hidden group">
              <IslamicCorners />
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 relative">
                <Users className="w-8 h-8" />
                <div className="absolute inset-0 border border-accent/20 rounded-xl scale-95 group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-xl font-cairo font-bold mb-3 text-slate-900">Berakhlakul Karimah</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Menanamkan adab islami, rasa tawadhu, kepedulian sosial, serta cinta kepada tanah air berlandaskan paham Ahlussunnah wal Jama'ah.
              </p>
            </div>
          </div>

          {/* Quick Stat Counter Showcase */}
          <div className="mt-16 bg-primary rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <span className="block text-3xl sm:text-5xl font-extrabold text-accent">4</span>
                <span className="block text-xs sm:text-sm mt-1 uppercase tracking-wider text-teal-100 font-semibold">Jenjang Sekolah</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-5xl font-extrabold text-accent">{stats?.total || 16}+</span>
                <span className="block text-xs sm:text-sm mt-1 uppercase tracking-wider text-teal-100 font-semibold">Pendaftar Masuk</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-5xl font-extrabold text-accent">100%</span>
                <span className="block text-xs sm:text-sm mt-1 uppercase tracking-wider text-teal-100 font-semibold">Proses Online</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-5xl font-extrabold text-accent">320</span>
                <span className="block text-xs sm:text-sm mt-1 uppercase tracking-wider text-teal-100 font-semibold">Total Kuota</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jenjang Pendidikan Section */}
      <section id="jenjang" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Program Unggulan</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Empat Pilihan Jenjang Pendidikan</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
            <p className="mt-4 text-slate-500">
              Sistem satu pintu Yayasan Assyafiiyah memfasilitasi integrasi belajar dari usia dini hingga jenjang menengah atas secara terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {levelsInfo.map((lvl) => {
              const IconComp = lvl.icon;
              const quotaFilledPercent = Math.min(Math.round((lvl.registered / lvl.quota) * 100), 100);

              return (
                <div
                  key={lvl.id}
                  className="islamic-card-gilded overflow-hidden flex flex-col justify-between group relative"
                >
                  <IslamicCorners />
                  <div className="p-6 relative z-10">
                    <div className={`w-12 h-12 bg-gradient-to-br ${lvl.color} text-white rounded-xl flex items-center justify-center mb-6 shadow-md shadow-teal-700/10`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-accent font-bold uppercase tracking-wider">{lvl.id}</span>
                    <h3 className="text-lg font-cairo font-bold mt-1 text-slate-900 group-hover:text-primary transition-colors">{lvl.title}</h3>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed min-h-[72px]">{lvl.desc}</p>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Pendaftar Aktif</span>
                        <span>{lvl.registered} / {lvl.quota} Kuota</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${quotaFilledPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {settings.statusActive ? (
                      <button
                        onClick={() => onNavigateToRegister(lvl.id)}
                        className="w-full py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer smooth-btn"
                      >
                        <span>Daftar {lvl.id}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-slate-200 text-slate-500 text-center font-semibold rounded-lg text-xs">
                        Kuota Penuh/Tutup
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran Section */}
      <section id="alur" className={`py-20 px-4 sm:px-6 lg:px-8 border-t border-b transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Tahapan Penerimaan</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Alur Pendaftaran Online</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
            <p className="mt-4 text-slate-500">
              Proses pendaftaran dirancang cepat dan mudah secara digital. Silakan ikuti enam langkah mudah di bawah ini.
            </p>
          </div>

          {/* Horizontal Timeline on Large Screens, Vertical on Mobile */}
          <div className="relative mt-12">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 hidden lg:block z-0" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
              {timelineSteps.map((step) => (
                <div key={step.step} className="glass-panel rounded-2xl p-6 text-center relative group overflow-hidden smooth-shadow-hover">
                  <IslamicCorners />
                  <div className="w-12 h-12 bg-primary text-white font-bold rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-accent/20 text-lg shadow-md group-hover:scale-110 transition-transform relative z-10">
                    {step.step}
                  </div>
                  <h4 className="font-cairo font-bold text-sm text-slate-900 mb-1 relative z-10">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Seleksi / Jadwal Penting Section */}
      <section id="jadwal" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Agenda Penting</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Timeline & Jadwal Seleksi</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
            <p className="mt-4 text-slate-500">
              Perhatikan tenggat waktu dan jadwal pelaksanaan penerimaan murid baru Tahun Pelajaran <span className="text-primary font-bold">{settings.year}</span> agar tidak terlewatkan setiap tahapannya.
            </p>
          </div>

          {/* Gelombang Tabs & Active Wave Indicator */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveGelombangTab("G1")}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeGelombangTab === "G1"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Gelombang 1</span>
                {(settings.gelombang?.toLowerCase().includes("1") || !settings.gelombang?.toLowerCase().includes("2")) && (
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveGelombangTab("G2")}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeGelombangTab === "G2"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Gelombang 2</span>
                {settings.gelombang?.toLowerCase().includes("2") && (
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </button>
            </div>

            {/* Sub-label showing current active wave from system settings */}
            <div className="text-xs text-slate-500 font-semibold bg-primary/5 py-1.5 px-4 rounded-full border border-primary/10 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>Gelombang Aktif Sistem Saat Ini: <strong className="text-primary uppercase font-bold">{settings.gelombang || "Gelombang 1"}</strong></span>
            </div>
          </div>

          {/* Interactive Timeline Body */}
          <div className="relative max-w-3xl mx-auto">
            {/* Center line */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2 z-0" />

            <div className="space-y-12">
              {/* STAGE 1 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 z-10">
                {/* Connector Node */}
                <div className="absolute left-6 md:left-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center -translate-x-1/2 z-20 shadow-md transform hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>

                {/* Left Card: Gelombang 1 or Gelombang 2 info */}
                <div className="w-full md:w-[45%] pl-14 md:pl-0 md:text-right">
                  <div className="glass-panel rounded-2xl p-6 islamic-card-gilded relative overflow-hidden smooth-shadow-hover hover:-translate-y-0.5 transition-all">
                    <IslamicCorners />
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded uppercase mb-2">Tahap 1</span>
                    <h3 className="text-base font-cairo font-bold text-slate-900">Pendaftaran & Formulir Online</h3>
                    <p className="text-xs font-semibold text-accent mt-1">
                      {activeGelombangTab === "G1"
                        ? (settings.g1Pendaftaran || `1 Maret – 30 April ${settings.year}`)
                        : (settings.g2Pendaftaran || `1 Mei – 30 Juni ${settings.year}`)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Calon murid baru mendaftarkan akun secara mandiri lewat portal online, melengkapi data diri, profil keluarga, dan memilih jenjang pendidikan.
                    </p>
                  </div>
                </div>

                {/* Empty block for layout alignment on desktop */}
                <div className="hidden md:block w-[45%]" />
              </div>

              {/* STAGE 2 */}
              <div className="relative flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-4 md:gap-8 z-10">
                {/* Connector Node */}
                <div className="absolute left-6 md:left-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center -translate-x-1/2 z-20 shadow-md transform hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-primary" />
                </div>

                {/* Right Card */}
                <div className="w-full md:w-[45%] pl-14 md:pl-0 text-left">
                  <div className="glass-panel rounded-2xl p-6 islamic-card-gilded relative overflow-hidden smooth-shadow-hover hover:-translate-y-0.5 transition-all">
                    <IslamicCorners />
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded uppercase mb-2">Tahap 2</span>
                    <h3 className="text-base font-cairo font-bold text-slate-900">Seleksi Berkas & Verifikasi</h3>
                    <p className="text-xs font-semibold text-accent mt-1">
                      {activeGelombangTab === "G1"
                        ? (settings.g1Verifikasi || `1 Mei – 3 Mei ${settings.year}`)
                        : (settings.g2Verifikasi || `1 Juli – 3 Juli ${settings.year}`)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Panitia pendaftaran menyeleksi dan memverifikasi kelengkapan administrasi calon pendaftar sesuai kuota pendaftaran masing-masing jenjang.
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[45%]" />
              </div>

              {/* STAGE 3 */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 z-10">
                {/* Connector Node */}
                <div className="absolute left-6 md:left-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center -translate-x-1/2 z-20 shadow-md transform hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>

                {/* Left Card */}
                <div className="w-full md:w-[45%] pl-14 md:pl-0 md:text-right">
                  <div className="glass-panel rounded-2xl p-6 islamic-card-gilded relative overflow-hidden smooth-shadow-hover hover:-translate-y-0.5 transition-all">
                    <IslamicCorners />
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded uppercase mb-2">Tahap 3</span>
                    <h3 className="text-base font-cairo font-bold text-slate-900">Pengumuman Kelulusan</h3>
                    <p className="text-xs font-semibold text-accent mt-1">
                      {activeGelombangTab === "G1"
                        ? (settings.g1Pengumuman || `5 Mei ${settings.year}`)
                        : (settings.g2Pengumuman || `5 Juli ${settings.year}`)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Status penerimaan langsung diumumkan secara realtime melalui Dashboard Peserta masing-masing calon siswa (menggunakan username & password NIK pendaftar).
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[45%]" />
              </div>

              {/* STAGE 4 */}
              <div className="relative flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-4 md:gap-8 z-10">
                {/* Connector Node */}
                <div className="absolute left-6 md:left-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center -translate-x-1/2 z-20 shadow-md transform hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-primary" />
                </div>

                {/* Right Card */}
                <div className="w-full md:w-[45%] pl-14 md:pl-0 text-left">
                  <div className="glass-panel rounded-2xl p-6 islamic-card-gilded relative overflow-hidden smooth-shadow-hover hover:-translate-y-0.5 transition-all">
                    <IslamicCorners />
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded uppercase mb-2">Tahap 4</span>
                    <h3 className="text-base font-cairo font-bold text-slate-900">Daftar Ulang Fisik</h3>
                    <p className="text-xs font-semibold text-accent mt-1">
                      {activeGelombangTab === "G1"
                        ? (settings.g1DaftarUlang || `6 Mei – 12 Mei ${settings.year}`)
                        : (settings.g2DaftarUlang || `6 Juli – 12 Juli ${settings.year}`)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Peserta yang dinyatakan Lulus membawa lembar cetak bukti pendaftaran beserta dokumen fisik (KK, Akta, KTP, Surat Kelulusan) asli ke Sekretariat Yayasan.
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[45%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Persyaratan Pendaftaran Section */}
      <section id="persyaratan" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Kelengkapan Administrasi</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Ketentuan & Persyaratan</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
            <p className="mt-4 text-slate-500">
              Sistem pendaftaran online tidak mewajibkan upload file apa pun. Semua berkas fisik dikumpulkan langsung saat Daftar Ulang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel rounded-2xl p-8 relative overflow-hidden smooth-shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <IslamicCorners />
              <h3 className="text-lg font-cairo font-bold mb-4 text-primary flex items-center gap-2 relative z-10">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Persyaratan Umum</span>
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-500 relative z-10">
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Calon siswa beragama Islam dan siap menaati tata tertib Yayasan Assyafiiyah.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Mengisi form pendaftaran online secara jujur, akurat, dan lengkap.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Mencetak Bukti Pendaftaran online setelah berhasil melakukan registrasi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Hadir pada waktu Daftar Ulang fisik sesuai jadwal kelulusan yang ditentukan.</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-8 relative overflow-hidden smooth-shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <IslamicCorners />
              <h3 className="text-lg font-cairo font-bold mb-4 text-primary flex items-center gap-2 relative z-10">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Berkas Fisik Saat Daftar Ulang</span>
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-500 relative z-10">
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Lembar Bukti Pendaftaran Online yang dicetak dari dashboard.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Fotokopi Kartu Keluarga (KK) & Akta Kelahiran (3 lembar).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Fotokopi KTP kedua orang tua/wali siswa (2 lembar).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Fotokopi Ijazah/Rapor Terakhir/Surat Keterangan Lulus (untuk SMPI/SMAI).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RubElHizb className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                  <span>Fotokopi kartu jaminan KIP / PKH (jika ada dan dicentang saat form).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements && announcements.length > 0 && (
        <section id="pengumuman" className={`py-20 px-4 sm:px-6 lg:px-8 border-t border-b transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-teal-900/5 border-slate-100"
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Informasi Penting</span>
              <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Pengumuman Terbaru</h2>
              <IslamicDivider className="mt-4 max-w-md mx-auto" />
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {announcements.map((ann) => (
                <div key={ann.id} className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden group smooth-shadow-hover">
                  <IslamicCorners />
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">
                      Untuk {ann.targetRole === "ALL" ? "Semua Pengunjung" : "Calon Peserta"}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="text-xl font-cairo font-bold text-slate-900 group-hover:text-primary transition-colors">{ann.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-2 whitespace-pre-line">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Pertanyaan Umum</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Tanya Jawab (FAQ)</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-panel rounded-xl overflow-hidden smooth-shadow-hover">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-slate-900 hover:text-primary focus:outline-none"
                >
                  <span className="font-cairo flex items-center gap-2.5">
                    <HelpCircle className="w-5 h-5 text-accent" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === index ? "transform rotate-180" : ""}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak Section */}
      <section id="kontak" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-accent uppercase tracking-widest text-sm font-bold font-cairo">Hubungi Kami</span>
            <h2 className="text-3xl sm:text-4xl font-cairo font-extrabold mt-2 text-primary">Lokasi & Pelayanan</h2>
            <IslamicDivider className="mt-4 max-w-md mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Details and Map */}
            <div className="space-y-8">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                <IslamicCorners />
                <h3 className="text-xl font-cairo font-bold text-primary relative z-10">Informasi Sekretariat</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm text-slate-500">
                    <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">Alamat Lengkap</span>
                      <span>Lenteng Barat, Kecamatan Lenteng, Kabupaten Sumenep, Jawa Timur (69461)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-500">
                    <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900 mb-1">Kontak Panitia (WhatsApp)</span>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                        {settings?.kontakPanitia ? (
                          settings.kontakPanitia.split(",").map((contact, idx) => {
                            const trimmed = contact.trim();
                            if (!trimmed) return null;
                            
                            // Extract numbers to build standard WhatsApp API url
                            const numMatch = trimmed.match(/[0-9+-\s]{8,}/);
                            let cleanNum = "";
                            if (numMatch) {
                              cleanNum = numMatch[0].replace(/[^0-9]/g, "");
                            }
                            if (cleanNum.startsWith("0")) {
                              cleanNum = "62" + cleanNum.slice(1);
                            } else if (cleanNum.startsWith("8")) {
                              cleanNum = "62" + cleanNum;
                            }
                            
                            return (
                              <a
                                key={idx}
                                href={cleanNum ? `https://wa.me/${cleanNum}` : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 font-bold text-xs rounded-lg transition-all w-fit shadow-xs cursor-pointer group"
                                title="Hubungi via WhatsApp"
                              >
                                <svg className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                                  <path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.88.521 3.639 1.42 5.148L2.039 22l5.02-1.341C8.455 21.439 10.16 22 12.004 22 17.52 22 22 17.52 22 12S17.52 2 12.004 2zM12 20.353c-1.636 0-3.149-.475-4.43-1.289l-.317-.2-.303.081-2.951.787.801-2.881-.22-.351c-.888-1.42-1.36-3.071-1.36-4.793 0-4.941 4.02-8.96 8.96-8.96s8.961 4.019 8.961 8.96-4.02 8.96-8.96 8.96zm4.904-6.702c-.268-.135-1.593-.787-1.839-.877-.247-.09-.427-.135-.607.135-.179.27-.696.877-.853 1.058-.157.179-.315.202-.584.067-.268-.135-1.135-.419-2.162-1.335-.798-.711-1.336-1.59-1.493-1.861-.157-.27-.017-.417.118-.551.121-.121.268-.315.404-.473.135-.157.179-.27.269-.45.09-.179.045-.337-.023-.473-.067-.135-.607-1.462-.831-2.002-.219-.529-.441-.456-.607-.464-.157-.008-.337-.01-.517-.01s-.473.067-.719.337c-.247.27-.944.922-.944 2.25s.966 2.61 1.101 2.79c.135.179 1.901 2.904 4.606 4.072.643.278 1.144.444 1.536.568.646.205 1.233.176 1.698.107.517-.077 1.593-.652 1.817-1.25.225-.597.225-1.11.157-1.21-.067-.101-.247-.157-.516-.292z" />
                                </svg>
                                <span>{trimmed}</span>
                              </a>
                            );
                          })
                        ) : (
                          <a
                            href="https://wa.me/6285929800093"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 font-bold text-xs rounded-lg transition-all w-fit shadow-xs cursor-pointer group"
                          >
                            <svg className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                              <path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.88.521 3.639 1.42 5.148L2.039 22l5.02-1.341C8.455 21.439 10.16 22 12.004 22 17.52 22 22 17.52 22 12S17.52 2 12.004 2zM12 20.353c-1.636 0-3.149-.475-4.43-1.289l-.317-.2-.303.081-2.951.787.801-2.881-.22-.351c-.888-1.42-1.36-3.071-1.36-4.793 0-4.941 4.02-8.96 8.96-8.96s8.961 4.019 8.961 8.96-4.02 8.96-8.96 8.96zm4.904-6.702c-.268-.135-1.593-.787-1.839-.877-.247-.09-.427-.135-.607.135-.179.27-.696.877-.853 1.058-.157.179-.315.202-.584.067-.268-.135-1.135-.419-2.162-1.335-.798-.711-1.336-1.59-1.493-1.861-.157-.27-.017-.417.118-.551.121-.121.268-.315.404-.473.135-.157.179-.27.269-.45.09-.179.045-.337-.023-.473-.067-.135-.607-1.462-.831-2.002-.219-.529-.441-.456-.607-.464-.157-.008-.337-.01-.517-.01s-.473.067-.719.337c-.247.27-.944.922-.944 2.25s.966 2.61 1.101 2.79c.135.179 1.901 2.904 4.606 4.072.643.278 1.144.444 1.536.568.646.205 1.233.176 1.698.107.517-.077 1.593-.652 1.817-1.25.225-.597.225-1.11.157-1.21-.067-.101-.247-.157-.516-.292z" />
                            </svg>
                            <span>085929800093 (Sekretariat SPMB)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-500">
                    <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">Email Resmi</span>
                      <span>spmb@yayasan-assyafiiyah.sch.id</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-500">
                    <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">Jam Layanan Fisik</span>
                      <span>Sabtu - Kamis, 08:00 - 13:00 WIB (Hari Jumat & Libur Nasional Libur)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Fidelity Custom Vector Simulated Map */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-64 bg-slate-100 relative">
                <div className="absolute inset-0 bg-teal-900/5 flex flex-col justify-between p-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200 max-w-[200px]">
                      <span className="block text-xs font-bold text-primary font-cairo">Yayasan Assyafiiyah</span>
                      <span className="text-[10px] text-slate-500">Lenteng Barat, Sumenep, Jawa Timur</span>
                    </div>
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shadow-md">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-slate-300 h-1.5 rounded-full" />
                    <div className="w-3/4 bg-slate-300 h-1.5 rounded-full" />
                    <div className="w-5/6 bg-slate-300 h-1.5 rounded-full" />
                  </div>

                  <div className="text-right">
                    <a
                      href="https://maps.google.com/?q=Lenteng+Barat+Sumenep"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 py-1.5 px-3 bg-primary text-white rounded-md text-[10px] font-bold shadow hover:bg-teal-800 transition-colors"
                    >
                      <span>Buka di Google Maps</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 space-y-6 relative overflow-hidden">
              <IslamicCorners />
              <h3 className="text-xl font-cairo font-bold text-primary relative z-10">Kirim Pesan Cepat</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Pesan Anda berhasil dikirim! Panitia kami akan menghubungi Anda segera."); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                  <input required type="text" className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary" placeholder="Masukkan nama Anda" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor WhatsApp / HP</label>
                  <input required type="text" className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary" placeholder="Contoh: 081234567890" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pesan / Pertanyaan</label>
                  <textarea required rows={4} className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary" placeholder="Tuliskan pertanyaan Anda mengenai pendaftaran di sini..." />
                </div>
                <button type="submit" className="w-full py-3 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md cursor-pointer">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center mr-2 shadow border border-accent/20 overflow-hidden p-0.5">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white font-cairo font-bold text-sm">A</span>
                )}
              </div>
              <span className="font-cairo font-bold text-base text-white tracking-wide">YAYASAN ASSYAFIIYAH</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Mendidik dengan hati, mencetak alumni berpengetahuan luas, berkarakter islami kuat, dan berprestasi unggul secara nasional.
            </p>
          </div>

          <div>
            <h4 className="font-cairo font-bold text-sm text-white mb-4">Jenjang Pendidikan</h4>
            <ul className="space-y-2 text-xs">
              <li>MDT Madrasah Diniyah Takmiliyah</li>
              <li>PAUD Assyafiiyah</li>
              <li>SMP Islam Assyafiiyah (SMPI)</li>
              <li>SMA Islam Assyafiiyah (SMAI)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-cairo font-bold text-sm text-white mb-4">Sosial Media & Informasi</h4>
            <p className="text-xs leading-relaxed mb-3">
              Ikuti perkembangan terbaru kami di media sosial resmi Yayasan Assyafiiyah Sumenep.
            </p>
            <div className="flex gap-3 text-xs text-white">
              {settings?.facebookUrl ? (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 px-3 py-1.5 rounded hover:text-accent transition-colors font-semibold"
                >
                  Facebook
                </a>
              ) : (
                <span className="bg-slate-800/50 px-3 py-1.5 rounded text-slate-500 cursor-not-allowed">Facebook</span>
              )}
              {settings?.instagramUrl ? (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 px-3 py-1.5 rounded hover:text-accent transition-colors font-semibold"
                >
                  Instagram
                </a>
              ) : (
                <span className="bg-slate-800/50 px-3 py-1.5 rounded text-slate-500 cursor-not-allowed">Instagram</span>
              )}
              {settings?.youtubeUrl ? (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 px-3 py-1.5 rounded hover:text-accent transition-colors font-semibold"
                >
                  YouTube
                </a>
              ) : (
                <span className="bg-slate-800/50 px-3 py-1.5 rounded text-slate-500 cursor-not-allowed">YouTube</span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 Yayasan Assyafiiyah Lenteng Sumenep. All Rights Reserved.</span>
          <span className="font-mono text-[10px]">Tahun Ajaran 2026/2027 • Sistem SPMB v1.0.0</span>
        </div>
      </footer>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 bg-accent text-slate-900 rounded-full shadow-lg hover:bg-yellow-500 transition-colors z-40 focus:outline-none cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
