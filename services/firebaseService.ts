import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { SavedProject } from "../types";

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID
};

const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

const app = isConfigured 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) 
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const firebaseLogin = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase is niet geconfigureerd. Controleer de omgevingsvariabelen.");
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const saveProjectToCloud = async (project: SavedProject) => {
  if (!db) return;
  const docRef = doc(db, "projects", project.id);
  await setDoc(docRef, {
    ...project,
    updatedAt: new Date().toISOString()
  });
};

export const fetchProjectsFromCloud = async (): Promise<SavedProject[]> => {
  if (!db) return [];
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  const projects: SavedProject[] = [];
  querySnapshot.forEach((doc) => {
    projects.push(doc.data() as SavedProject);
  });
  return projects;
};

export const uploadPhotoToCloud = async (roomId: string, base64: string): Promise<string> => {
  if (!storage) throw new Error("Firebase Storage is niet geconfigureerd.");
  const photoId = Date.now();
  const storageRef = ref(storage, `opnames/${roomId}/${photoId}.jpg`);
  await uploadString(storageRef, base64, 'data_url');
  return await getDownloadURL(storageRef);
};

export const firebaseLogout = () => auth && signOut(auth);