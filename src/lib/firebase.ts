
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase for SSR and SSG, and prevent re-initialization on the client
let app: FirebaseApp;
if (!getApps().length) {
  // Check if all required config values are present
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    console.error("Firebase config is missing or incomplete. Please check your .env.local file.");
    // Provide a dummy app to avoid crashing the app, but services will not work.
    app = {} as FirebaseApp;
  }
} else {
  app = getApp();
}

// Initialize services
// These can be initialized on the server or client, and will use the singleton app instance.
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

let analytics: Analytics | null = null;
// Initialize Analytics only on the client side where it is supported
if (typeof window !== 'undefined') {
  isSupported().then((isAvailable) => {
    if (isAvailable) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
