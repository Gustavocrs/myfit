"use client";

import {createContext, useState, useEffect, useCallback} from "react";
import {useAuth} from "@/context/AuthContext";
import {db} from "@/lib/firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

export const ThemeContext = createContext();

const CHAVE_TEMA = "isDarkMode";
const CHAVE_TEMA_LEGADO = "theme";

const obterTemaInicial = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const temaBooleano = localStorage.getItem(CHAVE_TEMA);

  if (temaBooleano === "true") {
    return true;
  }

  if (temaBooleano === "false") {
    return false;
  }

  return localStorage.getItem(CHAVE_TEMA_LEGADO) === "dark";
};

export const ThemeProvider = ({children}) => {
  const {user} = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(obterTemaInicial);

  // Efeito que aplica/remove a classe 'dark' no HTML e salva no localStorage
  useEffect(() => {
    const root = window.document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem(CHAVE_TEMA, "true");
      localStorage.setItem(CHAVE_TEMA_LEGADO, "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(CHAVE_TEMA, "false");
      localStorage.setItem(CHAVE_TEMA_LEGADO, "light");
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

  useEffect(() => {
    syncWithFirebase(user);
  }, [syncWithFirebase, user]);

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
