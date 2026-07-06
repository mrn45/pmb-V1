import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

async function create() {
  try {
    const user = await createUserWithEmailAndPassword(auth, 'server@ai-studio.local', 'serverpassword123');
    console.log("Created server user:", user.user.uid);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
create();
