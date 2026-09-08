import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../config/firebase';

const secondaryApp =
  getApps().find((app) => app.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

export const createEmployee = async (
  email: string,
  pass: string,
  name: string,
  role: 'admin' | 'cashier',
  companyId: string
) => {
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
  const newUid = userCredential.user.uid;

  await setDoc(doc(db, 'users', newUid), {
    uid: newUid,
    email,
    name,
    role,
    companyId,
    createdAt: new Date().toISOString(),
  });

  await secondaryAuth.signOut();
};
