import re
import json

with open('firebase-applet-config.json', 'r') as f:
    config = json.load(f)
db_id = config.get("firestoreDatabaseId", "(default)")
project_id = config.get("projectId")

with open('server.ts', 'r') as f:
    content = f.read()

firebase_init = f"""
import {{ initializeApp, applicationDefault }} from 'firebase-admin/app';
import {{ getFirestore }} from 'firebase-admin/firestore';

const appAdmin = initializeApp({{
  credential: applicationDefault(),
  projectId: "{project_id}"
}});
const firestoreDb = getFirestore(appAdmin, "{db_id}");

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
      const seeded = seedDatabase();
      await writeDb(seeded);
      return seeded;
    }}

    // Check if it's empty, if so, seed
    if (db.users.length === 0) {{
      const seeded = seedDatabase();
      await writeDb(seeded);
      return seeded;
    }}

    return db;
  }} catch (e) {{
    console.error("Error reading from Firestore:", e);
    // fallback to seed if everything fails
    const seeded = seedDatabase();
    return seeded;
  }}
}}

async function writeDb(db: DbSchema) {{
  // For each collection, we could do a batch write, but let's just do individual writes or batches.
  try {{
    const batch = firestoreDb.batch();
    
    // Clear existing? Wait, if we just overwrite matching IDs, it's fine.
    // Actually, in the current app, writeDb replaces the whole DB. 
    // It's safer to just iterate and set.
    for (const u of db.users) {{
      batch.set(firestoreDb.collection("users").doc(u.id), u);
    }}
    for (const r of db.registrations) {{
      batch.set(firestoreDb.collection("registrations").doc(r.id), r);
    }}
    for (const a of db.announcements) {{
      batch.set(firestoreDb.collection("announcements").doc(a.id), a);
    }}
    for (const l of db.logs) {{
      batch.set(firestoreDb.collection("logs").doc(l.id), l);
    }}
    batch.set(firestoreDb.collection("settings").doc("system"), db.settings);

    // Note: Firestore batch has a limit of 500 writes. 
    // If we exceed 500, we need to split it. But for this small app it might be ok for now.
    // Let's implement batch splitting to be safe.
  }} catch (e) {{
    console.error("Error writing to Firestore:", e);
  }}
}}

async function writeDbSafe(db: DbSchema) {{
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

# We need to replace readDb and writeDb in the file
import re
# First, remove getBundledDbPath, DB_FILE, readDb, writeDb
# Let's just find where `function readDb()` starts and where `writeDb()` ends
# Wait, let's just use simple text replacements
content = re.sub(r'function readDb\(\): DbSchema \{.*?\n\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'function writeDb\(db: DbSchema\) \{.*?\n\}\n', '', content, flags=re.DOTALL)
content = re.sub(r'function getBundledDbPath\(\): string \{.*?\n\}\n', '', content, flags=re.DOTALL)

content = content.replace("const DB_FILE = process.env.VERCEL\n  ? \"/tmp/db.json\"\n  : path.join(process.cwd(), \"db.json\");\n\nconst BUNDLED_DB_FILE = getBundledDbPath();", firebase_init.replace("writeDbSafe", "writeDb"))

# Also, we should add async to app.get, app.post, etc.
# But wait, my previous script already did that! Let's check.
with open('server.ts', 'w') as f:
    f.write(content)

