/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Printer, ArrowLeft, Check, Award, AlertCircle } from "lucide-react";
import { Registration, StatusPendaftaran, Jenjang } from "../types.js";

interface PrintDocumentProps {
  type: "BUKTI" | "KARTU" | "KELULUSAN";
  registration: Registration;
  onBack?: () => void;
  autoPrint?: boolean;
  settings?: any;
}

export default function PrintDocument({
  type,
  registration,
  onBack,
  autoPrint = false,
  settings
}: PrintDocumentProps) {

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (type) {
      case "BUKTI":
        return "BUKTI PENDAFTARAN ONLINE";
      case "KARTU":
        return "KARTU PESERTA UJIAN SELEKSI";
      case "KELULUSAN":
        return "SURAT PENGUMUMAN KELULUSAN";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 no-print">
      {/* Control Navigation Header (Invisible when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={() => onBack?.()}
          className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="text-center hidden sm:block">
          <span className="text-xs font-bold text-slate-400 uppercase">Dokumen Cetak</span>
          <span className="block font-bold text-slate-800 text-sm font-cairo">{getDocTitle()}</span>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary text-white hover:bg-teal-800 font-bold rounded-lg text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Sekarang</span>
        </button>
      </div>

      {/* Printable Sheet Frame */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-md p-8 sm:p-12 text-slate-800 font-sans relative overflow-hidden" id="printable-area">
        {/* Subtle Watermark BG */}
        <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none z-0">
          <div className="w-[500px] h-[500px] border-[12px] border-primary rounded-full transform rotate-45 flex items-center justify-center">
            <span className="text-primary font-cairo font-extrabold text-9xl">A</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Official Letterhead Header */}
          <div className="flex items-center justify-between border-b-4 border-double border-primary pb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center border-2 border-accent p-1 shadow shrink-0 overflow-hidden">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white font-cairo font-bold text-3xl">A</span>
              )}
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-base sm:text-xl font-cairo font-extrabold text-primary tracking-wide leading-tight uppercase">
                PANITIA PENERIMAAN MURID BARU (SPMB)
              </h1>
              <h2 className="text-lg sm:text-2xl font-cairo font-extrabold text-slate-900 leading-tight tracking-wide">
                YAYASAN ASSYAFIIYAH
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Alamat: Lenteng Barat, Kecamatan Lenteng, Kabupaten Sumenep, Jawa Timur (69461)
              </p>
              <p className="text-[9px] sm:text-[10px] text-accent font-bold italic font-mono uppercase tracking-wide">
                MDT • PAUD ASSYAFIIYAH • SMP ISLAM ASSYAFIIYAH • SMA ISLAM ASSYAFIIYAH
              </p>
            </div>
            <div className="w-16 h-16 opacity-0 shrink-0 hidden sm:block" /> {/* Layout balancer */}
          </div>

          {/* Document Identity Block */}
          <div className="text-center space-y-1 py-2">
            <h3 className="text-base sm:text-lg font-cairo font-bold text-slate-900 uppercase tracking-widest decoration-accent underline decoration-2 underline-offset-4">
              {getDocTitle()}
            </h3>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 block font-bold">
              Nomor Dokumen: {registration.registrationNumber}/{type}/{new Date(registration.createdAt).getFullYear()}
            </span>
          </div>

          {/* BUKTI PENDAFTARAN CONTENT */}
          {type === "BUKTI" && (
            <div className="space-y-6 text-xs sm:text-sm">
              <p className="leading-relaxed">
                Telah terdaftar secara online Calon Peserta Didik Baru pada lembaga pendidikan di bawah naungan Yayasan Assyafiiyah Sumenep dengan rincian data sebagai berikut:
              </p>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nomor Pendaftaran:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm text-primary">{registration.registrationNumber}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Jenjang Dituju:</span>
                  <span className="font-bold text-slate-900">{registration.level}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">NIK Calon Siswa:</span>
                  <span className="font-semibold text-slate-800">{registration.nik}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nomor KK:</span>
                  <span className="font-semibold text-slate-800">{registration.noKK || "-"}</span>
                </div>
                {registration.nisn && (
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">NISN:</span>
                    <span className="font-semibold text-slate-800">{registration.nisn}</span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nama Lengkap Siswa:</span>
                  <span className="font-extrabold text-slate-900 uppercase tracking-wide text-sm">{registration.fullName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Jenis Kelamin:</span>
                  <span className="font-semibold text-slate-800">{registration.gender}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Tempat, Tanggal Lahir:</span>
                  <span className="font-semibold text-slate-800">{registration.birthPlace}, {formatDate(registration.birthDate)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nomor HP Orang Tua:</span>
                  <span className="font-bold text-slate-900">{registration.parentPhone}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Sekolah Asal:</span>
                  <span className="font-semibold text-slate-800">{registration.previousSchool || "-"}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Alamat Tempat Tinggal:</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {registration.address}, Desa {registration.village}, Kec. {registration.district}, Kab. {registration.regency}, {registration.province}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nama Ayah Kandung:</span>
                  <span className="font-bold text-slate-800">{registration.fatherName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nama Ibu Kandung:</span>
                  <span className="font-bold text-slate-800">{registration.motherName}</span>
                </div>
              </div>

              {/* QR Code and Instructions Block */}
              <div className="flex flex-col sm:flex-row gap-6 items-center p-5 border border-slate-200 rounded-xl bg-teal-900/[0.01]">
                {registration.qrCodeUrl && (
                  <div className="p-2 border border-slate-200 bg-white rounded-lg shrink-0 shadow-sm flex flex-col items-center">
                    <img src={registration.qrCodeUrl} alt="QR Verification" className="w-24 h-24" />
                    <span className="text-[8px] font-mono font-bold mt-1 text-slate-400">SCAN VERIFICATION</span>
                  </div>
                )}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-primary">Catatan Penting Untuk Calon Siswa & Wali:</h4>
                  <ul className="list-decimal pl-4 space-y-1 text-slate-500">
                    <li>Bukti pendaftaran online ini wajib dicetak dan disimpan baik-baik.</li>
                    <li>Siswa terdaftar otomatis mendapatkan akun pendaftaran dengan Username berupa <b>{registration.registrationNumber}</b> dan Password default berupa <b>NIK Pendaftar</b>.</li>
                    <li>Harap membawa bukti pendaftaran ini beserta dokumen asli (Akta Kelahiran, KK, KTP Orang Tua, Ijazah sebelumnya) ke kantor sekretariat pendaftaran Yayasan Assyafiiyah untuk melakukan verifikasi berkas dan Daftar Ulang.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* KARTU PESERTA CONTENT */}
          {type === "KARTU" && (
            <div className="space-y-6 text-xs sm:text-sm">
              <p className="leading-relaxed">
                Kartu ini merupakan tanda bukti kepesertaan yang sah untuk mengikuti rangkaian proses asesmen/ujian masuk dan wawancara pada Yayasan Assyafiiyah Sumenep.
              </p>

              <div className="border border-slate-300 rounded-xl p-5 bg-slate-50 flex flex-col sm:flex-row justify-between gap-6 relative">
                {/* Stamp visual accent */}
                <div className="absolute top-2 right-2 border border-emerald-600/30 text-emerald-600/30 text-[9px] font-bold py-1 px-2 rounded tracking-widest uppercase rotate-12 select-none">
                  TERDAFTAR ONLINE
                </div>

                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-3 gap-y-2.5">
                    <span className="col-span-1 text-[10px] uppercase font-bold text-slate-400">No. Pendaftaran</span>
                    <span className="col-span-2 font-mono font-bold text-sm text-primary">: {registration.registrationNumber}</span>

                    <span className="col-span-1 text-[10px] uppercase font-bold text-slate-400">Nama Peserta</span>
                    <span className="col-span-2 font-extrabold text-slate-900 uppercase tracking-wide">: {registration.fullName}</span>

                    <span className="col-span-1 text-[10px] uppercase font-bold text-slate-400">Jenjang Tujuan</span>
                    <span className="col-span-2 font-bold text-slate-800">: {registration.level}</span>

                    <span className="col-span-1 text-[10px] uppercase font-bold text-slate-400">Tempat Lahir</span>
                    <span className="col-span-2 font-semibold text-slate-800">: {registration.birthPlace}</span>

                    <span className="col-span-1 text-[10px] uppercase font-bold text-slate-400">Tanggal Lahir</span>
                    <span className="col-span-2 font-semibold text-slate-800">: {formatDate(registration.birthDate)}</span>

                    <span className="col-span-1 text-[10px] uppercase font-bold text-slate-400">No. HP Wali</span>
                    <span className="col-span-2 font-bold text-slate-800">: {registration.parentPhone}</span>
                  </div>

                  {/* Exam Schedule placeholders */}
                  <div className="mt-4 p-3.5 bg-white border border-slate-200 rounded-lg space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block mb-1 font-cairo">Informasi Ujian Masuk & Wawancara</span>
                    <div className="grid grid-cols-3 text-slate-500 text-[11px]">
                      <span>Hari & Tanggal</span>
                      <span className="col-span-2 font-semibold text-slate-700">: Akan diumumkan via Dashboard & WhatsApp</span>
                      <span>Waktu</span>
                      <span className="col-span-2 font-semibold text-slate-700">: 08:00 WIB - Selesai</span>
                      <span>Lokasi Seleksi</span>
                      <span className="col-span-2 font-semibold text-slate-700">: Ruang Aula Gedung Yayasan Assyafiiyah</span>
                    </div>
                  </div>
                </div>

                {/* QR Code and photo box */}
                <div className="flex flex-col items-center justify-between shrink-0 gap-4 sm:w-32 border-l border-slate-200 sm:pl-6 pt-4 sm:pt-0">
                  {registration.qrCodeUrl && (
                    <div className="p-1 border border-slate-200 bg-white rounded shadow-sm flex flex-col items-center">
                      <img src={registration.qrCodeUrl} alt="QR Verification" className="w-20 h-20" />
                      <span className="text-[7px] font-mono font-bold mt-1 text-slate-400">SCAN EXAM CODE</span>
                    </div>
                  )}

                  {/* Photo Frame Placeholder */}
                  <div className="w-24 h-32 border border-slate-300 bg-white rounded flex items-center justify-center text-[10px] text-slate-400 font-bold border-dashed shrink-0 p-2 text-center select-none">
                    Foto 3 x 4<br />Tempel Disini
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SURAT KELULUSAN CONTENT */}
          {type === "KELULUSAN" && (
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="text-right text-xs font-semibold text-slate-500 mb-2">
                Sumenep, {formatDate(new Date().toISOString())}
              </div>

              <div className="space-y-1.5 leading-relaxed text-slate-800">
                <div className="grid grid-cols-4 max-w-sm">
                  <span>Sifat</span>
                  <span className="col-span-3">: Penting & Rahasia</span>
                  <span>Lampiran</span>
                  <span className="col-span-3">: -</span>
                  <span>Perihal</span>
                  <span className="col-span-3 font-bold text-slate-900">: Pengumuman Kelulusan Seleksi SPMB</span>
                </div>
                <p className="mt-4">
                  Kepada Yth.<br />
                  <b>Orang Tua / Wali dari Ananda {registration.fullName}</b><br />
                  di Tempat
                </p>
                <p className="font-semibold italic text-slate-700 mt-3 font-cairo">
                  Assalamu'alaikum Warahmatullahi Wabarakatuh,
                </p>
                <p className="mt-2.5">
                  Dengan memanjatkan puji syukur kehadirat Allah SWT serta berdasarkan hasil rapat panitia penerimaan siswa baru Yayasan Assyafiiyah Lenteng Sumenep Tahun Pelajaran <b>{registration.level === Jenjang.MDT || registration.level === Jenjang.PAUD ? "2026/2027" : "2026/2027"}</b>, menyatakan bahwa calon peserta didik:
                </p>
              </div>

              {/* Status Visual Card */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2 flex-1">
                  <div className="grid grid-cols-3 gap-y-1.5">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">No. Pendaftaran</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900">: {registration.registrationNumber}</span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Nama Lengkap</span>
                    <span className="col-span-2 font-bold text-slate-900 uppercase tracking-wide">: {registration.fullName}</span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Jenjang Tujuan</span>
                    <span className="col-span-2 font-bold text-slate-800">: {registration.level}</span>
                  </div>
                </div>

                {registration.status === StatusPendaftaran.DITERIMA ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-xl flex items-center gap-3 shrink-0 text-center font-bold font-cairo text-base flex-col">
                    <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase text-emerald-600 font-bold tracking-widest">Keputusan Akhir</span>
                      <span className="text-lg">DITERIMA</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-200 text-slate-700 border-2 border-slate-300 rounded-xl flex items-center gap-3 shrink-0 text-center font-bold font-cairo text-base flex-col">
                    <AlertCircle className="w-8 h-8 text-slate-500 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-widest">Keputusan Akhir</span>
                      <span className="text-sm">TIDAK DITERIMA</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Kelulusan Explanation Text */}
              <div className="text-slate-700 space-y-3 leading-relaxed">
                {registration.status === StatusPendaftaran.DITERIMA ? (
                  <>
                    <p className="font-bold text-slate-900">Selamat! Ananda dinyatakan DITERIMA sebagai calon peserta didik baru di Yayasan Assyafiiyah Sumenep.</p>
                    <p>Bagi calon peserta didik baru yang dinyatakan Diterima, harap melakukan pendaftaran ulang fisik di kantor sekretariat pendaftaran pada tanggal <b>08 Juli - 15 Juli 2026</b> dengan membawa kelengkapan dokumen asli sesuai ketentuan pendaftaran.</p>
                  </>
                ) : (
                  <>
                    <p>Panitia mengucapkan terima kasih sebesar-besarnya atas partisipasi Ananda dalam mengikuti seleksi ini. Mengingat keterbatasan kuota pendaftaran yang tersedia, dengan berat hati panitia belum dapat meluluskan Ananda pada tahun ajaran ini.</p>
                    <p>Semoga Ananda tetap bersemangat menuntut ilmu di tempat terbaik lainnya.</p>
                  </>
                )}
                <p className="font-semibold italic text-slate-700 font-cairo pt-3">
                  Wassalamu'alaikum Warahmatullahi Wabarakatuh,
                </p>
              </div>
            </div>
          )}

          {/* Signature and Authentication block */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-12">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Pernyataan Orang Tua/Wali</span>
                <span className="block text-slate-800 font-semibold font-mono tracking-wide">Orang Tua / Wali Siswa,</span>
              </div>
              <div className="pt-4">
                <div className="w-32 h-[1px] bg-slate-400 mx-auto" />
                <span className="block text-slate-500 mt-1 italic">Tanda Tangan & Nama Terang</span>
              </div>
            </div>

            <div className="space-y-12 relative">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Sekretariat SPMB Sumenep</span>
                <span className="block text-slate-800 font-semibold font-mono tracking-wide">Ketua Panitia SPMB,</span>
              </div>
              <div className="pt-4 relative">
                {/* Simulated official stamp watermark */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-double border-teal-700/15 rounded-full w-20 h-20 flex items-center justify-center font-bold text-[8px] tracking-wider text-teal-700/15 rotate-12 select-none pointer-events-none">
                  STAMP SPBM
                </div>
                <div className="w-40 h-[1px] bg-slate-400 mx-auto" />
                <span className="block text-slate-900 font-bold mt-1 font-cairo text-[10px]">{settings?.ketuaPanitia || "Ahmad Syarif, S.Pd"}</span>
                <span className="block text-[8px] text-slate-400 font-mono">{settings?.ketuaPanitia ? "Ketua Panitia SPMB Yayasan" : "NIPY. 198804022012091001"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
