import React, { createContext, useContext } from 'react';
import firebase from 'firebase';

export const firebaseContext = createContext<typeof firebase>(firebase);

const { Provider } = firebaseContext;

interface FirebaseProviderProps {
  children: React.ReactNode;
}

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  });
}

export const FirebaseProvider = ({ children }: FirebaseProviderProps) => {
  return <Provider value={firebase}>{children}</Provider>;
};

export const useFirebase = () => useContext(firebaseContext);
