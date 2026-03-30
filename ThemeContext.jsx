"use client";

import {createContext, useState, useEffect, useCallback} from "react";
import {db} from "@/lib/firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    // Inicia o estado com o valor do localStorage para evitar piscar a tela
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // Efeito que aplica/remove a classe 'dark' no HTML e salva no localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Sincroniza o tema com o Firebase na inicialização
  const syncWithFirebase = useCallback(async (user) => {
    if (!user?.uid) return;
    try {
      const settingsRef = doc(db, "userSettings", user.uid);
      const settingsSnap = await getDoc(settingsRef);
      if (
        settingsSnap.exists() &&
        settingsSnap.data().hasOwnProperty("isDarkMode")
      ) {
        setIsDarkMode(settingsSnap.data().isDarkMode);
      }
    } catch (error) {
      console.error("Erro ao sincronizar tema com Firebase:", error);
    }
  }, []);

  // Alterna o tema e salva a preferência no Firebase
  const toggleDarkMode = useCallback(async (user) => {
    setIsDarkMode((currentIsDarkMode) => {
      const newIsDarkMode = !currentIsDarkMode;
      if (user?.uid) {
        setDoc(
          doc(db, "userSettings", user.uid),
          {isDarkMode: newIsDarkMode},
          {merge: true},
        ).catch((error) =>
          console.error("Erro ao salvar tema no Firebase:", error),
        );
      }
      return newIsDarkMode;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{isDarkMode, toggleDarkMode, syncWithFirebase}}
    >
      {children}
    </ThemeContext.Provider>
  );
};
