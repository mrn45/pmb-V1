/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  ADMIN = "ADMIN",
  PANITIA = "PANITIA",
  PESERTA = "PESERTA"
}

export enum Jenjang {
  MDT = "MDT",
  PAUD = "PAUD",
  SMPI = "SMPI",
  SMAI = "SMAI"
}

export enum StatusPendaftaran {
  MENUNGGU = "Menunggu",
  DIVERIFIKASI = "Diverifikasi",
  DITERIMA = "Diterima",
  TIDAK_DITERIMA = "Tidak Diterima"
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional when sending to client
  role: Role;
  fullName: string;
  jenjang?: Jenjang; // For participants, links to their registered level
  registrationId?: string; // For participants, links to their registration form
  createdAt: string;
}

export interface Registration {
  id: string;
  registrationNumber: string;
  level: Jenjang;
  nik: string;
  noKK: string;
  nisn?: string;
  fullName: string;
  gender: "Laki-laki" | "Perempuan";
  birthPlace: string;
  birthDate: string;
  religion: string;
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  parentPhone: string;
  email?: string;
  previousSchool: string;
  schoolAddress: string;
  ijazahNumber?: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: number;
  childOrder: number;
  hasKip: boolean;
  hasPkh: boolean;
  status: StatusPendaftaran;
  createdAt: string;
  qrCodeUrl?: string;
}

export interface GelombangItem {
  id: string;
  name: string;
  pendaftaran: string;
  verifikasi: string;
  pengumuman: string;
  daftarUlang: string;
}

export interface SystemSettings {
  year: string;
  gelombang: string;
  statusActive: boolean;
  quota: Record<Jenjang, number>;
  logoUrl?: string;
  ketuaPanitia?: string;
  profilYayasan?: string;
  kontakPanitia?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  g1Pendaftaran?: string;
  g1Verifikasi?: string;
  g1Pengumuman?: string;
  g1DaftarUlang?: string;
  g2Pendaftaran?: string;
  g2Verifikasi?: string;
  g2Pengumuman?: string;
  g2DaftarUlang?: string;
  showJadwal?: boolean;
  gelombangList?: GelombangItem[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: "ALL" | Role.PESERTA | Role.PANITIA;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  action: string;
  details: string;
}

export interface DbSchema {
  users: User[];
  registrations: Registration[];
  settings: SystemSettings;
  announcements: Announcement[];
  logs: AuditLog[];
}
