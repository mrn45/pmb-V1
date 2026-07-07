/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  User,
  MapPin,
  Users,
  CheckCircle,
  Info
} from "lucide-react";
import { Jenjang, Registration } from "../types.js";
import { BismillahCalligraphy, IslamicDivider, IslamicCorners, RubElHizb } from "./IslamicOrnaments.js";

interface RegistrationFormProps {
  initialLevel?: Jenjang;
  onSuccess: (reg: Registration) => void;
  onCancel: () => void;
}

export default function RegistrationForm({
  initialLevel,
  onSuccess,
  onCancel
}: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    level: initialLevel || Jenjang.SMPI,
    nik: "",
    noKK: "",
    nisn: "",
    fullName: "",
    gender: "Laki-laki" as "Laki-laki" | "Perempuan",
    birthPlace: "",
    birthDate: "",
    religion: "Islam",
    address: "",
    village: "",
    district: "Lenteng",
    regency: "Sumenep",
    province: "Jawa Timur",
    postalCode: "",
    parentPhone: "",
    email: "",
    previousSchool: "",
    schoolAddress: "",
    ijazahNumber: "",
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    siblings: "0",
    childOrder: "1",
    hasKip: false,
    hasPkh: false,
    agree: false
  });

  // Client Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Duplicate Check and Dialog states
  const [isCheckingNik, setIsCheckingNik] = useState(false);
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

  const validateField = (name: string, value: any) => {
    let err = "";
    if (name === "nik") {
      if (!value) err = "NIK wajib diisi";
      else if (!/^\d{16}$/.test(value)) err = "NIK harus tepat 16 digit angka";
    } else if (name === "noKK") {
      if (!value) err = "No. KK wajib diisi";
      else if (!/^\d{16}$/.test(value)) err = "No. KK harus tepat 16 digit angka";
    } else if (name === "nisn") {
      // NISN optional for MDT / PAUD
      const levelIsMdtOrPaud = formData.level === Jenjang.MDT || formData.level === Jenjang.PAUD;
      if (!levelIsMdtOrPaud && !value) {
        err = "NISN wajib diisi untuk jenjang SMP dan SMA";
      } else if (value && !/^\d{10}$/.test(value)) {
        err = "NISN harus tepat 10 digit angka";
      }
    } else if (name === "fullName") {
      if (!value) err = "Nama lengkap wajib diisi";
      else if (value.length < 3) err = "Nama lengkap minimal 3 karakter";
    } else if (name === "birthPlace") {
      if (!value) err = "Tempat lahir wajib diisi";
    } else if (name === "birthDate") {
      if (!value) err = "Tanggal lahir wajib diisi";
    } else if (name === "address") {
      if (!value) err = "Alamat rumah wajib diisi";
    } else if (name === "village") {
      if (!value) err = "Desa/Kelurahan wajib diisi";
    } else if (name === "postalCode") {
      if (value && !/^\d{5}$/.test(value)) err = "Kode pos harus 5 digit angka";
    } else if (name === "parentPhone") {
      if (!value) err = "Nomor HP wajib diisi";
      else if (!/^\d{10,14}$/.test(value)) err = "Nomor HP tidak valid (10-14 digit)";
    } else if (name === "email") {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = "Alamat email tidak valid";
    } else if (name === "fatherName") {
      if (!value) err = "Nama ayah kandung wajib diisi";
    } else if (name === "motherName") {
      if (!value) err = "Nama ibu kandung wajib diisi";
    }

    setErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleCheckNikDuplicate = async (nikVal: string) => {
    if (!nikVal || nikVal.length !== 16 || !/^\d{16}$/.test(nikVal)) return false;
    setIsCheckingNik(true);
    try {
      const response = await fetch(`/api/registrations/check-nik/${nikVal}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setAlertModal({
            isOpen: true,
            title: "Siswa Sudah Terdaftar",
            message: `Mohon maaf, calon siswa dengan NIK ${nikVal} sudah terdaftar di sistem kami. Silakan periksa kembali NIK yang dimasukkan.`,
            type: "error"
          });
          return true;
        }
      }
    } catch (err) {
      console.error("Error checking NIK duplicate:", err);
    } finally {
      setIsCheckingNik(false);
    }
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      // Clear NISN error if level is changed to MDT/PAUD
      if (name === "level") {
        if (val === Jenjang.MDT || val === Jenjang.PAUD) {
          setErrors((prevErr) => {
            const copy = { ...prevErr };
            delete copy.nisn;
            return copy;
          });
        }
      }
      if (name === "nik" && typeof val === "string" && val.length === 16) {
        handleCheckNikDuplicate(val);
      }
      return updated;
    });

    validateField(name, val);
  };

  // Validate current step
  const validateStep = (step: number) => {
    let isValid = true;
    if (step === 1) {
      // Validate Level & Personal Data
      const levelIsMdtOrPaud = formData.level === Jenjang.MDT || formData.level === Jenjang.PAUD;
      const f1 = validateField("nik", formData.nik);
      const f2 = levelIsMdtOrPaud ? true : validateField("nisn", formData.nisn);
      const f3 = validateField("fullName", formData.fullName);
      const f4 = validateField("birthPlace", formData.birthPlace);
      const f5 = validateField("birthDate", formData.birthDate);
      isValid = f1 && f2 && f3 && f4 && f5;
    } else if (step === 2) {
      // Validate Address & Contact
      const f1 = validateField("address", formData.address);
      const f2 = validateField("village", formData.village);
      const f3 = validateField("parentPhone", formData.parentPhone);
      const f4 = validateField("email", formData.email);
      isValid = f1 && f2 && f3 && f4;
    } else if (step === 3) {
      // Validate Parents
      const f1 = validateField("fatherName", formData.fatherName);
      const f2 = validateField("motherName", formData.motherName);
      isValid = f1 && f2;
    } else if (step === 4) {
      // Verify agreement checkbox
      if (!formData.agree) {
        setErrors((prev) => ({ ...prev, agree: "Anda harus menyetujui pernyataan kebenaran data" }));
        isValid = false;
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.agree;
          return copy;
        });
      }
    }
    return isValid;
  };

  const handleNextStep = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        const isDuplicate = await handleCheckNikDuplicate(formData.nik);
        if (isDuplicate) return;
      }
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateStep(4)) return;

    setLoading(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Gagal menyimpan data pendaftaran.");
      }

      onSuccess(resData.registration);
    } catch (err: any) {
      setServerError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header and Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-primary shadow-sm cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Formulir Penerimaan</span>
          <h1 className="text-2xl sm:text-3xl font-cairo font-extrabold text-primary">Pendaftaran Murid Baru</h1>
        </div>
      </div>

      {/* Bismillah Calligraphy Greeting Panel */}
      <div className="mb-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-5 rounded-2xl border border-accent/15 islamic-card-gilded relative overflow-hidden">
        <IslamicCorners />
        <BismillahCalligraphy />
      </div>

      {/* Steps Indicator Progress Bar */}
      <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <IslamicCorners />
        <div className="flex justify-between items-center relative z-10">
          <div className="absolute left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
          <div
            className="absolute left-4 h-1 bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {[
            { step: 1, label: "Pendidikan & Diri", icon: GraduationCap },
            { step: 2, label: "Kontak & Alamat", icon: MapPin },
            { step: 3, label: "Keluarga & Sekolah", icon: Users },
            { step: 4, label: "Konfirmasi", icon: Check }
          ].map((s) => {
            const IconComp = s.icon;
            const isCompleted = currentStep > s.step;
            const isActive = currentStep === s.step;

            return (
              <div key={s.step} className="flex flex-col items-center z-10 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md border transition-all duration-300 ${
                  isCompleted
                    ? "bg-secondary text-white border-secondary"
                    : isActive
                      ? "bg-primary text-white border-primary ring-4 ring-teal-700/10 scale-110"
                      : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <IconComp className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                  isActive ? "text-primary font-bold" : isCompleted ? "text-secondary" : "text-slate-400"
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Gagal Mendaftar:</span> {serverError}
          </div>
        </div>
      )}

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative islamic-card-gilded">
        <IslamicCorners />
        {/* Step 1: Pilihan Jenjang & Data Pribadi */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6 relative z-10">
            <h2 className="text-xl font-cairo font-bold text-primary border-b border-slate-100 pb-3">
              1. Pilihan Jenjang & Data Pribadi Siswa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jenjang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Jenjang Pendidikan yang Dituju <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-semibold"
                >
                  <option value={Jenjang.MDT}>MDT (Madrasah Diniyah Takmiliyah)</option>
                  <option value={Jenjang.PAUD}>PAUD Assyafiiyah</option>
                  <option value={Jenjang.SMPI}>SMP Islam Assyafiiyah (SMPI)</option>
                  <option value={Jenjang.SMAI}>SMA Islam Assyafiiyah (SMAI)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Pilih jenjang sekolah yang ingin didaftar.
                </span>
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  NIK Calon Siswa (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="nik"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleInputChange}
                  placeholder="Contoh: 352901xxxxxxxxxx"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.nik ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.nik ? (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.nik}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sesuai dengan NIK yang tertera pada Kartu Keluarga (KK).
                  </span>
                )}
              </div>

              {/* No KK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Nomor Kartu Keluarga (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="noKK"
                  maxLength={16}
                  value={formData.noKK}
                  onChange={handleInputChange}
                  placeholder="Contoh: 352901xxxxxxxxxx"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.noKK ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.noKK ? (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.noKK}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Masukkan 16 digit Nomor Kartu Keluarga.
                  </span>
                )}
              </div>

              {/* NISN */}
              {(formData.level === Jenjang.SMPI || formData.level === Jenjang.SMAI) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    NISN (10 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="nisn"
                    maxLength={10}
                    value={formData.nisn}
                    onChange={handleInputChange}
                    placeholder="Masukkan 10 digit NISN"
                    className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                      errors.nisn ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {errors.nisn ? (
                    <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.nisn}</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Wajib diisi untuk jenjang SMP dan SMA.
                    </span>
                  )}
                </div>
              )}

              {/* Nama Lengkap */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Nama Lengkap Calon Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap siswa (Sesuai Akta Kelahiran)"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary uppercase ${
                    errors.fullName ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.fullName}</span>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 cursor-pointer w-full justify-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Laki-laki"
                      checked={formData.gender === "Laki-laki"}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 cursor-pointer w-full justify-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Perempuan"
                      checked={formData.gender === "Perempuan"}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              {/* Agama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Agama <span className="text-red-500">*</span>
                </label>
                <input
                  disabled
                  type="text"
                  name="religion"
                  value="Islam"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-semibold focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  placeholder="Contoh: Sumenep"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.birthPlace ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.birthPlace && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.birthPlace}</span>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.birthDate ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.birthDate && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.birthDate}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Alamat & Kontak */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6 relative z-10">
            <h2 className="text-xl font-cairo font-bold text-primary border-b border-slate-100 pb-3">
              2. Kontak & Alamat Lengkap
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alamat Rumah */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Alamat Lengkap (Dusun, RT/RW, Jalan) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Contoh: Jl. Raya Lenteng No. 15, Dusun Mawar RT 02/RW 01"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.address ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.address && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.address}</span>
                )}
              </div>

              {/* Desa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Desa / Kelurahan <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama desa"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.village ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.village && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.village}</span>
                )}
              </div>

              {/* Kecamatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Kabupaten */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Kabupaten <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="regency"
                  value={formData.regency}
                  onChange={handleInputChange}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Provinsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Kode Pos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="postalCode"
                  maxLength={5}
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Contoh: 69461"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.postalCode ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.postalCode && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.postalCode}</span>
                )}
              </div>

              {/* Nomor HP Orang Tua */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Nomor HP / WhatsApp Orang Tua <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="parentPhone"
                  maxLength={14}
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  placeholder="Contoh: 08123456789"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.parentPhone ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.parentPhone ? (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.parentPhone}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Digunakan untuk konfirmasi verifikasi pendaftaran.
                  </span>
                )}
              </div>

              {/* Email (Opsional) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: maba@example.com"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.email ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.email && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.email}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Keluarga & Sekolah Asal */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6 relative z-10">
            <h2 className="text-xl font-cairo font-bold text-primary border-b border-slate-100 pb-3">
              3. Data Keluarga & Sekolah Asal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sekolah Asal (Not for PAUD) */}
              {formData.level !== Jenjang.PAUD && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Nama Sekolah Asal TK/SD/SMP
                    </label>
                    <input
                      type="text"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama sekolah sebelumnya"
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Alamat Sekolah Asal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Alamat Sekolah Asal
                    </label>
                    <input
                      type="text"
                      name="schoolAddress"
                      value={formData.schoolAddress}
                      onChange={handleInputChange}
                      placeholder="Kabupaten/Kota asal sekolah"
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              {/* Nomor Ijazah (SMP/SMA Only) */}
              {(formData.level === Jenjang.SMPI || formData.level === Jenjang.SMAI) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Nomor Ijazah <span className="text-slate-400 normal-case font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    name="ijazahNumber"
                    value={formData.ijazahNumber}
                    onChange={handleInputChange}
                    placeholder="Masukkan Nomor Ijazah"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              {/* Nama Ayah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Nama Lengkap Ayah Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap ayah"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.fatherName ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.fatherName && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.fatherName}</span>
                )}
              </div>

              {/* Pekerjaan Ayah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Pekerjaan Ayah
                </label>
                <input
                  type="text"
                  name="fatherOccupation"
                  value={formData.fatherOccupation}
                  onChange={handleInputChange}
                  placeholder="Contoh: Wiraswasta, PNS, Petani"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Nama Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Nama Lengkap Ibu Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap ibu"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.motherName ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.motherName && (
                  <span className="text-red-500 text-[10px] mt-1 block font-semibold">{errors.motherName}</span>
                )}
              </div>

              {/* Pekerjaan Ibu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Pekerjaan Ibu
                </label>
                <input
                  type="text"
                  name="motherOccupation"
                  value={formData.motherOccupation}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ibu Rumah Tangga"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Jumlah Saudara */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Jumlah Saudara Kandung
                </label>
                <input
                  type="number"
                  name="siblings"
                  min={0}
                  value={formData.siblings}
                  onChange={handleInputChange}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Anak Ke */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Anak Ke
                </label>
                <input
                  type="number"
                  name="childOrder"
                  min={1}
                  value={formData.childOrder}
                  onChange={handleInputChange}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Konfirmasi & Submit */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6 relative z-10">
            <h2 className="text-xl font-cairo font-bold text-primary border-b border-slate-100 pb-3">
              4. Review & Konfirmasi Pendaftaran
            </h2>

            {/* Quick Summary View */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 text-sm">
              <h3 className="font-cairo font-bold text-primary text-base">Ikhtisar Formulir Calon Siswa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Jenjang Dituju:</span>
                  <span className="font-bold text-slate-800">{formData.level}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">NIK Calon Siswa:</span>
                  <span className="font-bold text-slate-800">{formData.nik}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nomor KK:</span>
                  <span className="font-bold text-slate-800">{formData.noKK}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nama Lengkap:</span>
                  <span className="font-bold text-slate-800 uppercase">{formData.fullName}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Jenis Kelamin:</span>
                  <span className="font-bold text-slate-800">{formData.gender}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Alamat Tempat Tinggal:</span>
                  <span className="font-semibold text-slate-700">
                    {formData.address}, Ds. {formData.village}, Kec. {formData.district}, Kab. {formData.regency}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">No. HP Orang Tua:</span>
                  <span className="font-bold text-slate-800">{formData.parentPhone}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Nama Ayah / Ibu:</span>
                  <span className="font-semibold text-slate-700">{formData.fatherName} / {formData.motherName}</span>
                </div>
                {formData.level !== Jenjang.PAUD && (
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Sekolah Asal:</span>
                    <span className="font-semibold text-slate-700">{formData.previousSchool || "-"}</span>
                  </div>
                )}
                {(formData.level === Jenjang.SMPI || formData.level === Jenjang.SMAI) && formData.ijazahNumber && (
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Nomor Ijazah:</span>
                    <span className="font-semibold text-slate-700">{formData.ijazahNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Jaminan Sosial Checkboxes */}
            <div className="space-y-3">
              <h3 className="font-cairo font-bold text-slate-800 text-xs uppercase tracking-wide">
                Kepemilikan Jaminan Sosial (Bantuan Pemerintah)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    name="hasKip"
                    checked={formData.hasKip}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Memiliki Kartu Indonesia Pintar (KIP)</span>
                    <span className="block text-[10px] text-slate-400">Cocentang apabila memiliki kartu jaminan KIP aktif.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    name="hasPkh"
                    checked={formData.hasPkh}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Memiliki Program Keluarga Harapan (PKH)</span>
                    <span className="block text-[10px] text-slate-400">Cocentang apabila terdaftar dalam program PKH.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Verification Checklist Agreement */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  required
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary rounded focus:ring-primary shrink-0 mt-1"
                />
                <div className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-800 block mb-0.5">Persetujuan Kebenaran Data</span>
                  Saya menyatakan dengan sesungguhnya bahwa seluruh data yang saya isikan pada formulir pendaftaran online ini adalah <span className="font-bold text-primary">BENAR dan SAH</span> sesuai dokumen asli. Apabila di kemudian hari ditemukan ketidakcocokan, saya bersedia menerima sanksi pembatalan kelulusan pendaftaran calon siswa.
                </div>
              </label>
              {errors.agree && (
                <span className="text-red-500 text-[10px] mt-2 block font-semibold">{errors.agree}</span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold text-sm hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 smooth-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 font-semibold text-sm hover:bg-slate-100 cursor-pointer smooth-btn"
            >
              Batal
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-primary hover:bg-teal-800 text-white font-bold rounded-lg text-sm cursor-pointer flex items-center gap-1.5 smooth-btn"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-secondary hover:bg-green-700 text-white font-extrabold rounded-lg text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed smooth-btn"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang Mendaftar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Daftar Sekarang (Kirim Form)</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

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
                alertModal.type === 'error' ? 'bg-rose-100 text-rose-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                {alertModal.type === 'success' && <CheckCircle className="w-8 h-8" />}
                {alertModal.type === 'error' && <AlertCircle className="w-8 h-8" />}
                {alertModal.type === 'info' && <Info className="w-8 h-8" />}
              </div>
              
              <h3 className="text-lg font-cairo font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {alertModal.title}
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 px-2 leading-relaxed">
                {alertModal.message}
              </p>
              
              <button
                type="button"
                onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 bg-primary hover:bg-teal-800 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm"
              >
                Saya Mengerti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
