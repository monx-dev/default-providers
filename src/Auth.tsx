import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import cookie from 'react-cookies';
import * as firebase from 'firebase/app';

type User = firebase.default.User;

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

type AuthContext = [AuthFunctions, User | null, Status];

export const authContext = createContext<AuthContext>([{} as any, null, { loading: true }]);

const { Provider } = authContext;

interface AuthProviderProps {
  children: React.ReactNode;
  authAsync: () => Promise<typeof firebase.default.auth>;
}

export const AuthProvider = ({ children, authAsync }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(false);

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

  const setToken = useCallback(async (user: User | null) => {
    if (!user) {
      cookie.remove('token');
      setUser(user);
      setLoading(false);
      return;
    }

    startCall();

    user
      .getIdToken(true)
      .then((token) => {
        cookie.save('token', token, { path: '/' });
        setUser(user);
        setLoading(false);
      })
      .catch(errorCall);
  }, []);

  useEffect(() => {
    authAsync().then((auth) => {
      auth().onIdTokenChanged(setToken);

      auth().onAuthStateChanged(setToken);
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    startCall();

    const auth = await authAsync();

    const provider = new auth.GoogleAuthProvider();

    auth()
      .signInWithPopup(provider)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const loginWithFacebook = useCallback(async (scopes?: string[]) => {
    startCall();
    const auth = await authAsync();
    const provider = new auth.FacebookAuthProvider();

    if (scopes) scopes.forEach((scope) => provider.addScope(scope));

    auth()
      .signInWithPopup(provider)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const loginWithEmailAndPassword = useCallback(async (email: string, password: string) => {
    const auth = await authAsync();
    startCall();
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const signUpWithEmailAndPassword = useCallback(async (email: string, password: string) => {
    const auth = await authAsync();
    startCall();
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => successCall())
      .catch(errorCall);
  }, []);

  const logout = useCallback(async () => {
    const auth = await authAsync();
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
