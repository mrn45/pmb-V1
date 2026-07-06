import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    console.log("Success! Users count:", snap.size);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
test();
