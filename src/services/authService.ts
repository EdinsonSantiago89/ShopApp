import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { type Company, type UserProfile } from "../types";

export interface RegisterCompanyData {
  companyName: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  businessType: 'retail' | 'restaurant' | 'services';
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export const registerCompanyAndAdmin = async (data: RegisterCompanyData) => {
  // 1. Crear el documento de la empresa para obtener su ID
  const companyRef = doc(collection(db, "companies"));
  const companyId = companyRef.id;

  const newCompany: Company = {
    id: companyId,
    name: data.companyName,
    nit: data.nit,
    phone: data.phone,
    email: data.email,
    address: data.address,
    businessType: data.businessType,
    subscription: {
      plan: 'demo',
      status: 'trial',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días gratis
    },
    createdAt: new Date().toISOString(),
  };

  await setDoc(companyRef, newCompany);

  // 2. Crear el usuario en Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.adminEmail,
    data.adminPassword
  );
  const user = userCredential.user;

  // 3. Guardar el perfil del usuario administrador en Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: data.adminEmail,
    name: data.adminName,
    role: 'admin',
    companyId: companyId,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", user.uid), userProfile);

  return { user, companyId };
};