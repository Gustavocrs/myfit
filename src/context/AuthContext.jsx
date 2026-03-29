"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {useRouter} from "next/navigation";
import {notifyError} from "@/components/Notify";
import useRequest from "@/hooks/useRequest";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {post} = useRequest() || {};

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (login, senha) => {
      if (typeof post !== "function") {
        notifyError(
          "Ocorreu um erro ao inicializar a aplicação. Tente recarregar a página.",
        );
        return;
      }
      try {
        const {data} = await post("auth", {email: login, password: senha});

        const userWithTime = {...data.usuario, loginTime: Date.now()};

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userWithTime));
        setUser(userWithTime);

        router.push("/principal");
      } catch (error) {
        const message = error.response?.data?.message || "Erro ao fazer login.";
        notifyError(message);
        throw new Error(message);
      }
    },
    [post, router],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }, [router]);

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      updateUser,
    }),
    [user, loading, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
