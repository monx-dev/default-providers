interface FirebaseConfig {
  auth?: boolean;
  analytics?: boolean;
  storage?: boolean;
}

export const firebaseAsync = async (config?: FirebaseConfig) => {
  const firebase = (await import('firebase/app')).default;

  if (config?.auth) await import('firebase/auth');
  if (config?.analytics) await import('firebase/analytics');
  if (config?.storage) await import('firebase/storage');

  try {
    firebase.initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    });
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
    }
  }
  return firebase;
};
