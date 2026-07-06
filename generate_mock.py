content = """
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
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as any).url;
    
    if (url.startsWith('/api/')) {
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
        if (url === '/api/health') return res(200, { status: 'ok', vercel: false });
        
        if (url === '/api/auth/login' && method === 'POST') {
          const { username, password } = body;
          const snap = await getDocs(collection(db, 'users'));
          let user = null;
          snap.forEach(d => {
            const u = d.data();
            if (u.username === username && u.password === password) user = u;
          });
          if (user) return res(200, { token: 'mock-token', user });
          
          // Seed admin if no users exist
          if (snap.size === 0 && username === 'admin' && password === 'admin123') {
            const admin = { id: crypto.randomUUID(), username: 'admin', password: 'admin123', role: 'ADMIN', fullName: 'Administrator', createdAt: new Date().toISOString() };
            await setDoc(doc(db, 'users', admin.id), admin);
            return res(200, { token: 'mock-token', user: admin });
          }
          return res(401, { message: 'Invalid credentials' });
        }
        
        if (url === '/api/auth/me' && method === 'GET') {
          const userStr = localStorage.getItem('spmb_user');
          if (userStr) return res(200, { user: JSON.parse(userStr) });
          return res(401, { message: 'Unauthorized' });
        }

        if (url === '/api/auth/change-password' && method === 'POST') {
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
        
        if (url === '/api/settings' && method === 'GET') {
          const docSnap = await getDoc(doc(db, 'settings', 'system'));
          if (docSnap.exists()) return res(200, docSnap.data());
          return res(200, { year: "2026/2027", gelombang: "Gelombang 1", statusActive: true, quota: { MDT: 100, PAUD: 50, SMPI: 200, SMAI: 150 } });
        }
        
        if (url === '/api/settings' && method === 'PUT') {
          await setDoc(doc(db, 'settings', 'system'), body, { merge: true });
          return res(200, body);
        }

        if (url === '/api/announcements' && method === 'GET') {
          const snap = await getDocs(collection(db, 'announcements'));
          const anns = [];
          snap.forEach(d => anns.push(d.data()));
          return res(200, anns.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }

        if (url === '/api/announcements' && method === 'POST') {
          const ann = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
          await setDoc(doc(db, 'announcements', ann.id), ann);
          return res(201, ann);
        }

        if (url.startsWith('/api/announcements/') && method === 'DELETE') {
          const id = url.split('/').pop();
          await deleteDoc(doc(db, 'announcements', id));
          return res(200, { message: 'Deleted' });
        }

        if (url === '/api/users' && method === 'GET') {
          const snap = await getDocs(collection(db, 'users'));
          const users = [];
          snap.forEach(d => users.push(d.data()));
          return res(200, users);
        }

        if (url === '/api/users' && method === 'POST') {
          const u = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
          await setDoc(doc(db, 'users', u.id), u);
          return res(201, u);
        }

        if (url.startsWith('/api/users/') && method === 'DELETE') {
          const id = url.split('/').pop();
          await deleteDoc(doc(db, 'users', id));
          return res(200, { message: 'Deleted' });
        }
        
        if (url === '/api/registrations' && method === 'GET') {
          const snap = await getDocs(collection(db, 'registrations'));
          const regs = [];
          snap.forEach(d => regs.push(d.data()));
          return res(200, regs);
        }
        
        if (url === '/api/registrations' && method === 'POST') {
          const newReg = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'Menunggu', registrationNumber: 'REG-' + Date.now() };
          await setDoc(doc(db, 'registrations', newReg.id), newReg);
          
          const newUser = {
            id: crypto.randomUUID(),
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

        if (url.match(/\/api\/registrations\/[^\/]+$/) && method === 'GET') {
          const id = url.split('/').pop();
          const docSnap = await getDoc(doc(db, 'registrations', id));
          if (docSnap.exists()) return res(200, docSnap.data());
          return res(404, { message: 'Not found' });
        }

        if (url.match(/\/api\/registrations\/[^\/]+\/status$/) && method === 'PUT') {
          const id = url.split('/')[3];
          await updateDoc(doc(db, 'registrations', id), { status: body.status });
          return res(200, { message: 'Updated' });
        }

        if (url === '/api/stats' && method === 'GET') {
          const snap = await getDocs(collection(db, 'registrations'));
          let total = 0, mdt = 0, paud = 0, smpi = 0, smai = 0;
          let statusCounts = { "Menunggu": 0, "Diverifikasi": 0, "Diterima": 0, "Tidak Diterima": 0 };
          const recent = [];
          snap.forEach(d => {
            const r = d.data();
            total++;
            if (r.level === 'MDT') mdt++;
            if (r.level === 'PAUD') paud++;
            if (r.level === 'SMPI') smpi++;
            if (r.level === 'SMAI') smai++;
            if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
            recent.push(r);
          });
          recent.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          return res(200, {
            totalRegistrations: total,
            byLevel: { MDT: mdt, PAUD: paud, SMPI: smpi, SMAI: smai },
            recentRegistrations: recent.slice(0, 5),
            statusCounts
          });
        }
        
        if (url === '/api/logs' && method === 'GET') {
           return res(200, []);
        }

        return res(404, { message: 'Route not mocked: ' + url });
      } catch (err: any) {
        console.error("Mock API Error:", err);
        return res(500, { message: err.message });
      }
    }
    
    return originalFetch(...args);
  };
}
"""
with open('src/mockApi.ts', 'w') as f:
    f.write(content)

