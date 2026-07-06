
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "balmy-simplicity-c8gvj",
  appId: "1:983351224519:web:15247b21788925941db6e2",
  apiKey: "AIzaSyAcVQjkuoNs7l6pp5CoocquyE94sKEvXPA",
  authDomain: "balmy-simplicity-c8gvj.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-spmbonlineassyaf-f9e547ff-e906-4f75-9064-54b0ffc91b26"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

          if (user) return res(200, { token: 'mock-token', user });
          
          // Seed admin if no admin user exists and username is admin
          if (username === 'admin' && password === '51001n') {
            const admin = { id: Date.now().toString(36) + Math.random().toString(36).substring(2), username: 'admin', password: '51001n', role: 'ADMIN', fullName: 'Administrator', createdAt: new Date().toISOString() };
            await setDoc(doc(db, 'users', admin.id), admin);
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
          return res(201, { announcement: ann });
        }

        if (pathname.startsWith('/api/announcements/') && method === 'DELETE') {
          const id = pathname.split('/').pop();
          await deleteDoc(doc(db, 'announcements', id));
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
          return res(201, { user: u });
        }

        if (pathname.startsWith('/api/users/') && method === 'DELETE') {
          const id = pathname.split('/').pop();
          await deleteDoc(doc(db, 'users', id));
          return res(200, { message: 'Deleted' });
        }
        
        if (pathname === '/api/registrations' && method === 'GET') {
          const snap = await getDocs(collection(db, 'registrations'));
          const regs = [];
          snap.forEach(d => regs.push(d.data()));
          return res(200, { data: regs, totalPages: 1, total: regs.length });
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
          return res(201, { message: 'Success', registration: newReg, user: newUser });
        }

        if (pathname.match(/\/api\/registrations\/[^\/]+$/) && method === 'GET') {
          const id = pathname.split('/').pop();
          const docSnap = await getDoc(doc(db, 'registrations', id));
          if (docSnap.exists()) return res(200, docSnap.data());
          return res(404, { message: 'Not found' });
        }

        if (pathname.match(/\/api\/registrations\/[^\/]+$/) && method === 'PUT') {
          const id = pathname.split('/').pop();
          const docRef = doc(db, 'registrations', id);
          await updateDoc(docRef, body);
          const docSnap = await getDoc(docRef);
          return res(200, { registration: docSnap.data() });
        }

        if (pathname.match(/\/api\/registrations\/[^\/]+\/status$/) && method === 'PUT') {
          const id = pathname.split('/')[3];
          await updateDoc(doc(db, 'registrations', id), { status: body.status });
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
           return res(200, []);
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
