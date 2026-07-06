with open('server.ts', 'r') as f:
    content = f.read()

start_str = "const firestoreDb ="
end_str = "const PORT = 3000;"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    # Find the end of the firestoreDb line
    eol = content.find(";", start_idx) + 1
    
    firebase_init = """
async function readDb(): Promise<DbSchema> {
  const db: DbSchema = {
    users: [],
    registrations: [],
    settings: {} as SystemSettings,
    announcements: [],
    logs: []
  };

  try {
    const usersSnap = await firestoreDb.collection("users").get();
    usersSnap.forEach(doc => db.users.push(doc.data() as User));

    const regSnap = await firestoreDb.collection("registrations").get();
    regSnap.forEach(doc => db.registrations.push(doc.data() as Registration));

    const annSnap = await firestoreDb.collection("announcements").get();
    annSnap.forEach(doc => db.announcements.push(doc.data() as Announcement));

    const logsSnap = await firestoreDb.collection("logs").get();
    logsSnap.forEach(doc => db.logs.push(doc.data() as AuditLog));

    const settingsDoc = await firestoreDb.collection("settings").doc("system").get();
    if (settingsDoc.exists) {
      db.settings = settingsDoc.data() as SystemSettings;
    } else {
      const seeded = await seedDatabase();
      await writeDb(seeded);
      return seeded;
    }

    if (db.users.length === 0) {
      const seeded = await seedDatabase();
      await writeDb(seeded);
      return seeded;
    }

    return db;
  } catch (e) {
    console.error("Error reading from Firestore:", e);
    const seeded = await seedDatabase();
    return seeded;
  }
}

async function writeDb(db: DbSchema) {
  try {
    let batches = [];
    let currentBatch = firestoreDb.batch();
    let count = 0;

    const commitCurrent = () => {
      if (count > 0) {
        batches.push(currentBatch.commit());
        currentBatch = firestoreDb.batch();
        count = 0;
      }
    };

    const addOperation = (collectionName, docId, data) => {
      const ref = firestoreDb.collection(collectionName).doc(docId);
      currentBatch.set(ref, data);
      count++;
      if (count === 490) commitCurrent();
    };

    for (const u of db.users) addOperation("users", u.id, u);
    for (const r of db.registrations) addOperation("registrations", r.id, r);
    for (const a of db.announcements) addOperation("announcements", a.id, a);
    for (const l of db.logs) addOperation("logs", l.id, l);
    addOperation("settings", "system", db.settings);

    commitCurrent();
    await Promise.all(batches);
  } catch (e) {
    console.error("Error writing to Firestore:", e);
  }
}
"""
    new_content = content[:eol] + "\n" + firebase_init + "\n" + content[end_idx:]
    with open('server.ts', 'w') as f:
        f.write(new_content)
else:
    print("Could not find delimiters")
