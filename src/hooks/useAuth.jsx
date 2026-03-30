/**
 * @file useAuth.jsx
 * @description Hook customizado para gerenciar o ciclo de vida da autenticação do Firebase.
 * Atualizado com tratamento avançado de erros (Error Mapping) para falhas de infraestrutura.
 */

"use client";

import {useState, useEffect} from "react";
import {auth} from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) {
      console.error("Firebase Auth não inicializado.");
      throw new Error(
        "Firebase Auth não inicializado. Verifique as variáveis de ambiente.",
      );
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);

      // Mapeamento de erros comuns do Firebase Auth
      if (error.code === "auth/configuration-not-found") {
        throw new Error(
          "Erro de Infraestrutura: O provedor Google não está ativado no Firebase Console (Sign-in method).",
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        console.warn("Usuário cancelou o login.");
        return null;
      } else if (error.code === "auth/unauthorized-domain") {
        throw new Error(
          "Erro de Domínio: O domínio atual não está autorizado no Firebase Console.",
        );
      } else if (
        error.code === "auth/operation-not-supported-in-this-environment"
      ) {
        throw new Error(
          "Autenticação pop-up não suportada neste ambiente. Tente em um navegador desktop.",
        );
      } else {
        throw new Error(`Falha no login: ${error.message}`);
      }
    }
  };

  return {user, loading, loginWithGoogle, logout};
};
