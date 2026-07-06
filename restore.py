import re
import json

with open('firebase-applet-config.json', 'r') as f:
    config = json.load(f)
db_id = config.get("firestoreDatabaseId", "(default)")
project_id = config.get("projectId")

with open('server.ts', 'r') as f:
    content = f.read()

firebase_init = f"""
async function readDb(): Promise<DbSchema> {{
  const db: DbSchema = {{
    users: [],
    registrations: [],
    settings: {{}} as SystemSettings,
    announcements: [],
    logs: []
  }};

  try {{
    const usersSnap = await firestoreDb.collection("users").get();
    usersSnap.forEach(doc => db.users.push(doc.data() as User));

    const regSnap = await firestoreDb.collection("registrations").get();
    regSnap.forEach(doc => db.registrations.push(doc.data() as Registration));

    const annSnap = await firestoreDb.collection("announcements").get();
    annSnap.forEach(doc => db.announcements.push(doc.data() as Announcement));

    const logsSnap = await firestoreDb.collection("logs").get();
    logsSnap.forEach(doc => db.logs.push(doc.data() as AuditLog));

    const settingsDoc = await firestoreDb.collection("settings").doc("system").get();
    if (settingsDoc.exists) {{
      db.settings = settingsDoc.data() as SystemSettings;
    }} else {{
      const seeded = await seedDatabase();
      await writeDb(seeded);
      return seeded;
    }}

    // Check if it's empty, if so, seed
    if (db.users.length === 0) {{
      const seeded = await seedDatabase();
      await writeDb(seeded);
      return seeded;
    }}

    return db;
  }} catch (e) {{
    console.error("Error reading from Firestore:", e);
    // fallback to seed if everything fails
    const seeded = await seedDatabase();
    return seeded;
  }}
}}

async function writeDb(db: DbSchema) {{
  try {{
    let batches = [];
    let currentBatch = firestoreDb.batch();
    let count = 0;

    const commitCurrent = () => {{
      if (count > 0) {{
        batches.push(currentBatch.commit());
        currentBatch = firestoreDb.batch();
        count = 0;
      }}
    }};

    const addOperation = (collectionName, docId, data) => {{
      const ref = firestoreDb.collection(collectionName).doc(docId);
      currentBatch.set(ref, data);
      count++;
      if (count === 490) commitCurrent();
    }};

    for (const u of db.users) addOperation("users", u.id, u);
    for (const r of db.registrations) addOperation("registrations", r.id, r);
    for (const a of db.announcements) addOperation("announcements", a.id, a);
    for (const l of db.logs) addOperation("logs", l.id, l);
    addOperation("settings", "system", db.settings);

    commitCurrent();
    await Promise.all(batches);
  }} catch (e) {{
    console.error("Error writing to Firestore:", e);
  }}
}}
"""

# Now, we find `const firestoreDb = ...` and append `firebase_init` after it
content = re.sub(r'async\s*async\s*async\s*function\s+writeDb[^}]+}', '', content, flags=re.DOTALL)

# Remove `async;async;async;` and `async ` that were left behind
content = re.sub(r'async\s*;\s*', '', content)
content = re.sub(r'async\s*function\s+writeDb[^}]+}', '', content, flags=re.DOTALL)
content = re.sub(r'(const firestoreDb\s*=\s*getFirestore\([^)]+\);)', r'\1\n' + firebase_init, content)

with open('server.ts', 'w') as f:
    f.write(content)

