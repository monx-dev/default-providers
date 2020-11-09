interface FirebaseConfig {
  auth?: boolean;
}

export const firebaseAsync = async (config?: FirebaseConfig) => {
  const firebase = await import('firebase/app');

  if (config?.auth) await import('firebase/auth');

  try {
    firebase.default.initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    });
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack);
    }
  }

  return firebase.default;
};
