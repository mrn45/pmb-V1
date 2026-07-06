import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

const app = initializeApp({
  credential: applicationDefault(),
  projectId: config.projectId,
  databaseId: config.firestoreDatabaseId // Maybe this? Or databaseURL?
});

const db = getFirestore(app);
db.settings({ databaseId: config.firestoreDatabaseId }); // Maybe this?

async function test() {
  try {
    const snap = await db.collection('users').get();
    console.log("Success! Users count:", snap.size);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
