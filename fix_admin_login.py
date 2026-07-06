import re

with open('src/mockApi.ts', 'r') as f:
    content = f.read()

replacement = """
          if (user) return res(200, { token: 'mock-token', user });
          
          // Seed admin if no admin user exists and username is admin
          if (username === 'admin' && password === 'admin123') {
            const admin = { id: crypto.randomUUID(), username: 'admin', password: 'admin123', role: 'ADMIN', fullName: 'Administrator', createdAt: new Date().toISOString() };
            await setDoc(doc(db, 'users', admin.id), admin);
            return res(200, { token: 'mock-token', user: admin });
          }
          return res(401, { message: 'Invalid credentials' });
"""

# Replace the specific block
content = re.sub(
    r"          if \(user\) return res\(200, \{ token: 'mock-token', user \}\);\s*// Seed admin if no users exist\s*if \(snap\.size === 0 && username === 'admin' && password === 'admin123'\) \{\s*const admin = \{ id: crypto\.randomUUID\(\), username: 'admin', password: 'admin123', role: 'ADMIN', fullName: 'Administrator', createdAt: new Date\(\)\.toISOString\(\) \};\s*await setDoc\(doc\(db, 'users', admin\.id\), admin\);\s*return res\(200, \{ token: 'mock-token', user: admin \}\);\s*\}\s*return res\(401, \{ message: 'Invalid credentials' \}\);",
    replacement,
    content
)

with open('src/mockApi.ts', 'w') as f:
    f.write(content)
