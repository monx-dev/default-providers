import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Firebase from 'firebase';

import { useFirebase } from './Firebase';

interface AuthFunctions {
  loginWithGoogle: () => void;
  loginWithFacebook: (scopes?: string[]) => void;
  loginWithEmailAndPassword: (email: string, password: string) => void;
  signUpWithEmailAndPassword: (email: string, password: string) => void;
  logout: () => void;
}

interface Status {
  loading: boolean;
  error?: Error;
}

type AuthContext = [AuthFunctions, Firebase.User | null, Status];

export const authContext = createContext<AuthContext>([{} as any, null, { loading: true }]);

const { Provider } = authContext;

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Firebase.User | null>(null);
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);
  const { auth } = useFirebase();

  const successCall = useCallback(() => {
    setLoading(false);
    setError(undefined);
  }, []);

  const errorCall = useCallback((error: Error) => {
    setLoading(false);
    setError(error);
  }, []);

  const startCall = useCallback(() => {
    setLoading(true);
    setError(undefined);
  }, []);

  const setToken = useCallback(async (user: Firebase.User | null) => {
    if (!user) {
      document.cookie = '';
      setUser(user);
      setLoading(false);
      return;
    }

    startCall();

    user
      .getIdToken()
      .then((token) => {
        document.cookie = `token=${token}`;
        setUser(user);
        setLoading(false);
        console.log(document.cookie);
      })
      .catch(errorCall);
  }, []);

  useEffect(() => {
    auth().onIdTokenChanged(setToken);

    auth().onAuthStateChanged(setToken);
  }, []);

  const loginWithGoogle = useCallback(() => {
    startCall();
    const provider = new auth.GoogleAuthProvider();

    auth()
      .signInWithPopup(provider)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const loginWithFacebook = useCallback((scopes?: string[]) => {
    startCall();
    const provider = new auth.FacebookAuthProvider();

    if (scopes) scopes.forEach((scope) => provider.addScope(scope));

    auth()
      .signInWithPopup(provider)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const loginWithEmailAndPassword = useCallback(async (email: string, password: string) => {
    startCall();
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const signUpWithEmailAndPassword = useCallback((email: string, password: string) => {
    startCall();
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const logout = useCallback(() => {
    startCall();
    auth()
      .signOut()
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  return (
    <Provider
      value={[
        {
          loginWithEmailAndPassword,
          loginWithFacebook,
          loginWithGoogle,
          logout,
          signUpWithEmailAndPassword,
        },
        user,
        { loading, error },
      ]}
    >
      {children}
    </Provider>
  );
};

export const useAuth = () => useContext(authContext);
