"use client";
import { useState, useEffect } from "react";

/**
 * Hook personalizado para obter os dados do usuário logado.
 * Ele lê as informações do usuário armazenadas no localStorage.
 *
 * @returns {object} - Retorna um objeto contendo os dados do usuário logado (`loggedUser`).
 *                     Retorna `null` se o usuário não estiver logado ou os dados não forem encontrados.
 */
export const useLoggedUser = () => {
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    // O código do lado do cliente (client-side) é executado dentro do useEffect.
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setLoggedUser(userData);
      }
    } catch (error) {
      console.error("Falha ao ler dados do usuário do localStorage:", error);
      setLoggedUser(null);
    }
  }, []); // O array vazio garante que este efeito rode apenas uma vez.

  return { loggedUser };
};
