"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {AuthContext} from "@/context/AuthContext";
import {db} from "@/lib/firebase";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const {user} = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aplica o tema ao documento (síncrono)
  const applyTheme = (isDark) => {
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Carrega o tema do localStorage e do Firebase na inicialização
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Tenta carregar do localStorage primeiro (para inicialização rápida)
        const savedDarkMode = localStorage.getItem("isDarkMode");
        if (savedDarkMode !== null) {
          const isDark = JSON.parse(savedDarkMode);
          setIsDarkMode(isDark);
          applyTheme(isDark);
        } else {
          // Se não há no localStorage, assume light mode por padrão
          applyTheme(false);
        }
      } catch (error) {
        console.error("Erro ao carregar tema do localStorage:", error);
        applyTheme(false);
      } finally {
        setLoading(false);
      }
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    const sincronizarTemaDoUsuario = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const settingsRef = doc(db, "userSettings", user.uid);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const isDark = Boolean(settingsSnap.data().isDarkMode);
          setIsDarkMode(isDark);
          applyTheme(isDark);
          localStorage.setItem("isDarkMode", JSON.stringify(isDark));
        }
      } catch (error) {
        console.error("Erro ao sincronizar tema do Firebase:", error);
      }
    };

    sincronizarTemaDoUsuario();
  }, [user]);

  const toggleDarkMode = async (activeUser = user) => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    applyTheme(newValue);

    // Salva no localStorage
    localStorage.setItem("isDarkMode", JSON.stringify(newValue));

    // Salva no Firebase se o usuário está autenticado
    if (activeUser?.uid) {
      try {
        await setDoc(
          doc(db, "userSettings", activeUser.uid),
          {isDarkMode: newValue},
          {merge: true},
        );
      } catch (error) {
        console.error("Erro ao salvar tema no Firebase:", error);
      }
    }
  };

  // Sincroniza com Firebase quando o usuário fizer login
  const syncWithFirebase = async (activeUser = user) => {
    if (activeUser?.uid) {
      try {
        const settingsRef = doc(db, "userSettings", activeUser.uid);
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const isDark = Boolean(settingsSnap.data().isDarkMode);
          setIsDarkMode(isDark);
          applyTheme(isDark);
          localStorage.setItem("isDarkMode", JSON.stringify(isDark));
        }
      } catch (error) {
        console.error("Erro ao sincronizar tema do Firebase:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{isDarkMode, toggleDarkMode, syncWithFirebase, loading}}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
};
