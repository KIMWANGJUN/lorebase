// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isServer = typeof window === 'undefined';
console.log(`[Firebase] Initialization Environment: ${isServer ? 'Server' : 'Client'}`);

// Validate and prepare config
if (!firebaseConfigValues.apiKey && !isServer) {
  console.warn('[Firebase] .env.local not loaded or API Key missing. Attempting fallback for client-side IDE/Studio environment (NOT FOR PRODUCTION).');
  Object.assign(firebaseConfigValues, {
    apiKey: "AlzaSyAMoPasnL5uf-_svvROzsUpWCiCfLD1fJU", // Ensure this is your actual key if using fallback
    authDomain: "lorebase-a8b3b.firebaseapp.com",
    projectId: "lorebase-a8b3b",
    storageBucket: "lorebase-a8b3b.appspot.com", // Standard format for config
    messagingSenderId: "978818851697",
    appId: "1:978818851697:web:9b100c52d4f976d62a8cd0",
    measurementId: "G-BZNR54SCJN"
  });
}

if (!firebaseConfigValues.apiKey) {
  console.error("[Firebase] CRITICAL: Firebase API Key is missing. Authentication and other Firebase services will not work. Check your .env.local file and ensure it's loaded correctly by Next.js.");
} else {
  console.log('[Firebase] Config (from .env.local or fallback):', {
    apiKey: firebaseConfigValues.apiKey ? `${firebaseConfigValues.apiKey.substring(0, 5)}... (length: ${firebaseConfigValues.apiKey.length})` : '❌ MISSING!',
    authDomain: firebaseConfigValues.authDomain,
    projectId: firebaseConfigValues.projectId,
    storageBucket: firebaseConfigValues.storageBucket,
  });
  if (firebaseConfigValues.storageBucket && firebaseConfigValues.storageBucket.includes('.firebasestorage.app')) {
    console.warn(`[Firebase] storageBucket in config ("${firebaseConfigValues.storageBucket}") looks like a URL. It should typically be the bucket ID (e.g., "your-project-id.appspot.com"). Please verify in Firebase console > Storage.`);
  }
}

let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApp();
  console.log('[Firebase] Using existing Firebase app instance.');
} else {
  if (!firebaseConfigValues.apiKey) {
    console.error("[Firebase] Cannot initialize Firebase app due to missing API Key.");
    // Create a dummy app to prevent crashes, but services will not work.
    app = ({ options: { projectId: firebaseConfigValues.projectId || "unknown-project" } } as unknown) as FirebaseApp;
  } else {
    try {
      app = initializeApp(firebaseConfigValues);
      console.log('[Firebase] New Firebase app initialized successfully.');
    } catch (e: any) {
      console.error("[Firebase] CRITICAL: Firebase app initialization failed:", e.message);
      app = ({ options: { projectId: firebaseConfigValues.projectId || "unknown-project" } } as unknown) as FirebaseApp;
    }
  }
}

if (app.options && app.options.projectId && app.options.projectId !== "unknown-project") {
  console.log('[Firebase] App Project ID:', app.options.projectId);
} else {
  console.error('[Firebase] App does not seem to be initialized correctly or is a dummy instance.');
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let analyticsInstance: Analytics | null = null;

if (!isServer && app.options.apiKey) { // Initialize client-side services only if API key exists and on client
  console.log('[Firebase] Attempting to initialize client-side Firebase services...');
  try {
    authInstance = getAuth(app);
    console.log('[Firebase] Auth instance: Initialized');
  } catch (e: any) {
    console.error('[Firebase] Failed to initialize Auth:', e.message);
  }

  try {
    dbInstance = getFirestore(app);
    console.log('[Firebase] Firestore instance: Initialized');
  } catch (e: any) {
    console.error('[Firebase] Failed to initialize Firestore:', e.message);
  }

  try {
    storageInstance = getStorage(app);
    console.log('[Firebase] Storage instance: Initialized');
  } catch (e: any) {
    console.error('[Firebase] Failed to initialize Storage:', e.message);
  }

  isAnalyticsSupported().then((supported) => {
    if (supported && firebaseConfigValues.measurementId) {
      try {
        analyticsInstance = getAnalytics(app);
        console.log('[Firebase] Analytics instance: Initialized');
      } catch (e: any) {
        console.error('[Firebase] Failed to initialize Analytics:', e.message);
      }
    } else {
      console.log(`[Firebase] Analytics: Not supported or Measurement ID missing (Supported: ${supported}, Has ID: ${!!firebaseConfigValues.measurementId})`);
    }
  }).catch(err => console.warn('[Firebase] Analytics support check error:', err.message));
} else if (isServer) {
  console.log('[Firebase] Skipping client-side service initialization on the server.');
} else if (!app.options.apiKey) {
  console.warn('[Firebase] Skipping client-side service initialization due to missing API Key in app config.');
}

export { authInstance as auth, dbInstance as db, storageInstance as storage, analyticsInstance as analytics };
export default app;
