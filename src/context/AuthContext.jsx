"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {auth} from "@/lib/firebase";

export const AuthContext = createContext();

const providerGoogle = new GoogleAuthProvider();
providerGoogle.setCustomParameters({prompt: "select_account"});

/**
 * Traduz erros comuns do Firebase Auth para mensagens legíveis em PT-BR.
 *
 * @param {Error & {code?: string}} erro
 * @returns {{mensagem: string, cancelado: boolean}}
 */
const mapearErroAutenticacao = (erro) => {
  switch (erro?.code) {
    case "auth/configuration-not-found":
      return {
        mensagem:
          "O login com Google ainda não está configurado no Firebase para este projeto.",
        cancelado: false,
      };
    case "auth/popup-closed-by-user":
      return {
        mensagem: "A janela de login foi fechada antes da conclusão.",
        cancelado: true,
      };
    case "auth/popup-blocked":
      return {
        mensagem:
          "O navegador bloqueou a janela de login. Libere pop-ups e tente novamente.",
        cancelado: false,
      };
    case "auth/unauthorized-domain":
      return {
        mensagem:
          "Este domínio não está autorizado no Firebase para autenticação com Google.",
        cancelado: false,
      };
    case "auth/operation-not-supported-in-this-environment":
      return {
        mensagem:
          "Este ambiente não suporta autenticação por pop-up. Tente em um navegador comum.",
        cancelado: false,
      };
    case "auth/network-request-failed":
      return {
        mensagem:
          "Falha de rede durante o login. Verifique sua conexão e tente novamente.",
        cancelado: false,
      };
    default:
      return {
        mensagem:
          erro?.message || "Não foi possível iniciar sua sessão neste momento.",
        cancelado: false,
      };
  }
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error(
        "O serviço de autenticação não foi inicializado. Verifique as variáveis do Firebase.",
      );
    }

    try {
      const result = await signInWithPopup(auth, providerGoogle);
      return result.user;
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);

      const {mensagem, cancelado} = mapearErroAutenticacao(error);

      if (cancelado) {
        return null;
      }

      const erroNormalizado = new Error(mensagem);
      erroNormalizado.code = error?.code;
      throw erroNormalizado;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw new Error("Não foi possível encerrar a sessão neste momento.");
    }
  }, []);

  const value = {user, loading, signInWithGoogle, logout};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }

  return contexto;
};
