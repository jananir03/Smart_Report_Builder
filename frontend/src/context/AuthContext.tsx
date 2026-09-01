import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
} from "../api/authApi";

import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    null
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const loadUser = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUser =
        await getCurrentUser();

      setUser(currentUser);
    } catch {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "token_type"
      );

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const tokenResponse =
      await loginUser(
        email,
        password
      );

    localStorage.setItem(
      "access_token",
      tokenResponse.access_token
    );

    localStorage.setItem(
      "token_type",
      tokenResponse.token_type
    );

    const currentUser =
      await getCurrentUser();

    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "token_type"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}