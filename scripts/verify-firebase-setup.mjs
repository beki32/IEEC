/**
 * Quick check that Auth users + Firestore staff docs exist.
 *
 *   export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Downloads/key.json"
 *   export FIREBASE_PROJECT_ID="ieec-ya-connect-a1ae1"
 *   npm run verify:firebase
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'ieec-ya-connect-a1ae1';

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const auth = getAuth();
const db = getFirestore();

const emails = ['leader@ieec.demo', 'assistant@ieec.demo', 'minister@ieec.demo'];

async function main() {
  console.log('Project:', PROJECT_ID);
  for (const email of emails) {
    try {
      const user = await auth.getUserByEmail(email);
      const account = await db.collection('userAccounts').doc(user.uid).get();
      console.log(
        `✓ ${email}\n  authUid=${user.uid}\n  userAccounts=${account.exists ? 'YES' : 'MISSING'}` +
          (account.exists
            ? ` org=${account.data()?.organizationId} status=${account.data()?.accountStatus}`
            : ''),
      );
    } catch (err) {
      console.log(`✗ ${email}: ${err.message}`);
    }
  }
  const org = await db.collection('organizations').doc('ieec_ya').get();
  console.log(`organizations/ieec_ya: ${org.exists ? 'YES' : 'MISSING'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
