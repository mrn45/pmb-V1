
import { initializeApp } from 'firebase/app';
import { initializeFirestore, getFirestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "balmy-simplicity-c8gvj",
  appId: "1:983351224519:web:15247b21788925941db6e2",
  apiKey: "AIzaSyAcVQjkuoNs7l6pp5CoocquyE94sKEvXPA",
  authDomain: "balmy-simplicity-c8gvj.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-spmbonlineassyaf-f9e547ff-e906-4f75-9064-54b0ffc91b26"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

const getActiveUser = () => {
  try {
    const userStr = localStorage.getItem('spmb_user');
    if (userStr) return JSON.parse(userStr);
  } catch (e) {}
  return { username: "SISTEM", role: "SISTEM", fullName: "SISTEM" };
};

async function logAction(username: string, role: string, action: string, details: string) {
  const logId = 'log_' + Math.random().toString(36).substring(2, 11);
  const newLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    username,
    role,
    action,
    details
  };
  try {
    await setDoc(doc(db, 'logs', logId), newLog);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export function setupMockApi() {

  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    value: async (...args: any[]) => {

    const url = typeof args[0] === 'string' ? args[0] : (args[0] as any).url;
    const pathname = url.split('?')[0];
    
    if (pathname.startsWith('/api/')) {
      const options = args[1] || {};
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body as string) : null;
      
      const res = (status: number, data: any) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      try {
        if (pathname === '/api/health') return res(200, { status: 'ok', vercel: false });
        
        if (pathname === '/api/auth/login' && method === 'POST') {
          const { username, password } = body;
          const snap = await getDocs(collection(db, 'users'));
          let user = null;
          snap.forEach(d => {
            const u = d.data();
            if (u.username === username && u.password === password) user = u;
          });

          if (user) {
            await logAction(user.username, user.role, 'LOGIN', `Pengguna ${user.fullName} (${user.username}) berhasil masuk ke sistem.`);
            return res(200, { token: 'mock-token', user });
          }
          
          // Seed admin if no admin user exists and username is admin
          if (username === 'admin' && password === '51001n') {
            const admin = { id: Date.now().toString(36) + Math.random().toString(36).substring(2), username: 'admin', password: '51001n', role: 'ADMIN', fullName: 'Administrator', createdAt: new Date().toISOString() };
            await setDoc(doc(db, 'users', admin.id), admin);
            await logAction(admin.username, admin.role, 'LOGIN', `Pengguna ${admin.fullName} (${admin.username}) berhasil masuk ke sistem (Inisialisasi admin pertama).`);
            return res(200, { token: 'mock-token', user: admin });
          }
          return res(401, { message: 'Invalid credentials' });

        }
        
        if (pathname === '/api/auth/me' && method === 'GET') {
          const userStr = localStorage.getItem('spmb_user');
          if (userStr) return res(200, { user: JSON.parse(userStr) });
          return res(401, { message: 'Unauthorized' });
        }

        if (pathname === '/api/auth/change-password' && method === 'POST') {
           const { currentPassword, newPassword } = body;
           const userStr = localStorage.getItem('spmb_user');
           if (!userStr) return res(401, { message: 'Unauthorized' });
           const user = JSON.parse(userStr);
           
           const docRef = doc(db, 'users', user.id);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists() && docSnap.data().password === currentPassword) {
             await updateDoc(docRef, { password: newPassword });
             return res(200, { message: 'Success' });
           }
           return res(400, { message: 'Password salah' });
        }
        
        if (pathname === '/api/settings' && method === 'GET') {
          const docSnap = await getDoc(doc(db, 'settings', 'system'));
          if (docSnap.exists()) return res(200, docSnap.data());
          return res(200, { year: "2026/2027", gelombang: "Gelombang 1", statusActive: true, quota: { MDT: 100, PAUD: 50, SMPI: 200, SMAI: 150 } });
        }
        
        if (pathname === '/api/settings' && method === 'PUT') {
          await setDoc(doc(db, 'settings', 'system'), body, { merge: true });
          const active = getActiveUser();
          await logAction(active.username, active.role, 'PENGATURAN', 'Memperbarui konfigurasi sistem dan pembagian kuota pendaftaran.');
          return res(200, { settings: body });
        }

        if (pathname === '/api/announcements' && method === 'GET') {
          const snap = await getDocs(collection(db, 'announcements'));
          const anns = [];
          snap.forEach(d => anns.push(d.data()));
          return res(200, anns.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }

        if (pathname === '/api/announcements' && method === 'POST') {
          const ann = { ...body, id: Date.now().toString(36) + Math.random().toString(36).substring(2), createdAt: new Date().toISOString() };
          await setDoc(doc(db, 'announcements', ann.id), ann);
          const active = getActiveUser();
          await logAction(active.username, active.role, 'PENGUMUMAN', `Membuat pengumuman baru: "${ann.title}".`);
          return res(201, { announcement: ann });
        }

        if (pathname.startsWith('/api/announcements/') && method === 'DELETE') {
          const id = pathname.split('/').pop();
          await deleteDoc(doc(db, 'announcements', id));
          const active = getActiveUser();
          await logAction(active.username, active.role, 'PENGUMUMAN', `Menghapus pengumuman.`);
          return res(200, { message: 'Deleted' });
        }

        if (pathname === '/api/users' && method === 'GET') {
          const snap = await getDocs(collection(db, 'users'));
          const users = [];
          snap.forEach(d => users.push(d.data()));
          return res(200, users);
        }

        if (pathname === '/api/users' && method === 'POST') {
          const u = { ...body, id: Date.now().toString(36) + Math.random().toString(36).substring(2), createdAt: new Date().toISOString() };
          await setDoc(doc(db, 'users', u.id), u);
          const active = getActiveUser();
          await logAction(active.username, active.role, 'PENGGUNA', `Membuat akun pengguna baru: "${u.username}" (${u.fullName}) dengan peran ${u.role}.`);
          return res(201, { user: u });
        }

        if (pathname.startsWith('/api/users/') && method === 'DELETE') {
          const id = pathname.split('/').pop();
          await deleteDoc(doc(db, 'users', id));
          const active = getActiveUser();
          await logAction(active.username, active.role, 'PENGGUNA', `Menghapus akun pengguna.`);
          return res(200, { message: 'Deleted' });
        }
        
        if (pathname === '/api/registrations' && method === 'GET') {
          const searchParams = new URLSearchParams(url.split('?')[1] || '');
          const search = searchParams.get('search') || '';
          const level = searchParams.get('level') || 'ALL';
          const status = searchParams.get('status') || 'ALL';
          const sortField = searchParams.get('sortField') || 'createdAt';
          const sortOrder = searchParams.get('sortOrder') || 'desc';
          const page = parseInt(searchParams.get('page') || '1');
          const limit = parseInt(searchParams.get('limit') || '10');

          const snap = await getDocs(collection(db, 'registrations'));
          let regs = [];
          snap.forEach(d => regs.push(d.data()));

          // Apply filters
          if (level !== 'ALL') {
            regs = regs.filter(r => r.level === level);
          }
          if (status !== 'ALL') {
            regs = regs.filter(r => r.status === status);
          }
          if (search.trim() !== '') {
            const query = search.toLowerCase();
            regs = regs.filter(r => 
              (r.fullName && r.fullName.toLowerCase().includes(query)) ||
              (r.nik && r.nik.toLowerCase().includes(query)) ||
              (r.registrationNumber && r.registrationNumber.toLowerCase().includes(query))
            );
          }

          // Apply sorting
          regs.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });

          // Apply pagination
          const total = regs.length;
          const totalPages = Math.ceil(total / limit);
          const startIndex = (page - 1) * limit;
          const paginatedRegs = regs.slice(startIndex, startIndex + limit);

          return res(200, { data: paginatedRegs, totalPages, total });
        }
        
        if (pathname === '/api/registrations' && method === 'POST') {
          const newReg = { ...body, id: Date.now().toString(36) + Math.random().toString(36).substring(2), createdAt: new Date().toISOString(), status: 'Menunggu', registrationNumber: 'REG-' + Date.now() };
          await setDoc(doc(db, 'registrations', newReg.id), newReg);
          
          const newUser = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            username: newReg.nik,
            password: newReg.nik, // Default password is NIK
            role: 'PESERTA',
            fullName: newReg.fullName,
            jenjang: newReg.level,
            registrationId: newReg.id,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', newUser.id), newUser);
          await logAction(newReg.nik, 'PESERTA', 'DAFTAR', `Pendaftaran online berhasil dikirim oleh "${newReg.fullName}" (No. NIK: ${newReg.nik}) pada jenjang ${newReg.level}.`);
          return res(201, { message: 'Success', registration: newReg, user: newUser });
        }

        if (pathname.match(/\/api\/registrations\/[^\/]+$/) && method === 'GET') {
          const id = pathname.split('/').pop();
          const docSnap = await getDoc(doc(db, 'registrations', id));
          if (docSnap.exists()) return res(200, docSnap.data());
          return res(404, { message: 'Not found' });
        }

                if (pathname.match(/\/api\/registrations\/[^\/]+$/) && method === 'DELETE') {
          const id = pathname.split('/').pop();
          if (id) {
            await deleteDoc(doc(db, 'registrations', id));
            const usersSnap = await getDocs(collection(db, 'users'));
            usersSnap.forEach(async (uDoc) => {
              const uData = uDoc.data();
              if (uData.registrationId === id) {
                await deleteDoc(doc(db, 'users', uDoc.id));
              }
            });
            const active = getActiveUser();
            await logAction(active.username, active.role, 'PENDAFTARAN', `Menghapus berkas pendaftaran dengan ID: ${id}.`);
            return res(200, { message: 'Deleted' });
          }
        }

        if (pathname.match(/\/api\/registrations\/[^\/]+$/) && method === 'PUT') {
          const id = pathname.split('/').pop();
          const docRef = doc(db, 'registrations', id);
          await updateDoc(docRef, body);
          const docSnap = await getDoc(docRef);
          const active = getActiveUser();
          await logAction(active.username, active.role, 'PENDAFTARAN', `Memperbarui detail profil calon peserta: "${docSnap.data()?.fullName || ''}".`);
          return res(200, { registration: docSnap.data() });
        }

        if (pathname.match(/\/api\/registrations\/[^\/]+\/status$/) && method === 'PUT') {
          const id = pathname.split('/')[3];
          await updateDoc(doc(db, 'registrations', id), { status: body.status });
          const docSnap = await getDoc(doc(db, 'registrations', id));
          const active = getActiveUser();
          await logAction(active.username, active.role, 'STATUS', `Mengubah status pendaftaran siswa "${docSnap.data()?.fullName || ''}" menjadi "${body.status}".`);
          return res(200, { message: 'Updated' });
        }

        if (pathname === '/api/stats' && method === 'GET') {
          const snap = await getDocs(collection(db, 'registrations'));
          let total = 0, mdt = 0, paud = 0, smpi = 0, smai = 0;
          let statusCounts: Record<string, number> = { "Menunggu": 0, "Diverifikasi": 0, "Diterima": 0, "Tidak Diterima": 0 };
          let districtCounts: Record<string, number> = {};
          let villageCounts: Record<string, number> = {};
          let dailyTrendMap: Record<string, number> = {};
          
          snap.forEach(d => {
            const r = d.data();
            total++;
            if (r.level === 'MDT') mdt++;
            if (r.level === 'PAUD') paud++;
            if (r.level === 'SMPI') smpi++;
            if (r.level === 'SMAI') smai++;
            if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
            
            if (r.district) {
              districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
            }
            if (r.village) {
              villageCounts[r.village] = (villageCounts[r.village] || 0) + 1;
            }
            
            if (r.createdAt) {
              const dateObj = new Date(r.createdAt);
              const day = dateObj.getDate().toString().padStart(2, '0');
              const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
              const dateStr = `${day}/${month}`;
              dailyTrendMap[dateStr] = (dailyTrendMap[dateStr] || 0) + 1;
            }
          });
          
          const dailyTrend = [];
          for (let i = 9; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = `${day}/${month}`;
            dailyTrend.push({ date: dateStr, pendaftar: dailyTrendMap[dateStr] || 0 });
          }
          
          return res(200, {
            total,
            pending: statusCounts["Menunggu"],
            verified: statusCounts["Diverifikasi"],
            accepted: statusCounts["Diterima"],
            rejected: statusCounts["Tidak Diterima"],
            levelCounts: { MDT: mdt, PAUD: paud, SMPI: smpi, SMAI: smai },
            districtCounts,
            villageCounts,
            dailyTrend
          });
        }
        
        if (pathname === '/api/logs' && method === 'GET') {
          const snap = await getDocs(collection(db, 'logs'));
          const logs: any[] = [];
          snap.forEach(d => logs.push(d.data()));
          
          if (logs.length === 0) {
            const seedLogs = [
              {
                id: 'log_seed1',
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
                username: 'admin',
                role: 'ADMIN',
                action: 'SISTEM',
                details: 'Inisialisasi sistem pendaftaran PSB online Madrasah & Sekolah Assyafiiyah.'
              },
              {
                id: 'log_seed2',
                timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
                username: 'admin',
                role: 'ADMIN',
                action: 'PENGATURAN',
                details: 'Memperbarui konfigurasi kuota pendaftaran Gelombang 1.'
              },
              {
                id: 'log_seed3',
                timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
                username: 'panitia_1',
                role: 'PANITIA',
                action: 'LOGIN',
                details: 'Panitia masuk ke sistem dan memperbarui data pendaftar.'
              },
              {
                id: 'log_seed4',
                timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
                username: 'admin',
                role: 'ADMIN',
                action: 'PENGUMUMAN',
                details: 'Membuat pengumuman baru mengenai jadwal verifikasi dokumen fisik.'
              },
              {
                id: 'log_seed5',
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                username: 'SISTEM',
                role: 'SISTEM',
                action: 'DAFTAR',
                details: 'Calon peserta baru melakukan pendaftaran mandiri online.'
              }
            ];
            for (const item of seedLogs) {
              await setDoc(doc(db, 'logs', item.id), item);
              logs.push(item);
            }
          }
          return res(200, logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }

        return res(404, { message: 'Route not mocked: ' + url });
      } catch (err: any) {
        console.error("Mock API Error:", err);
        return res(500, { message: err.message });
      }
    }
    
    return originalFetch(args[0], args[1]);
  }
  });
}
