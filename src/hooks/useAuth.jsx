"use client";

/**
 * @file useAuth.jsx
 * @description Hook público de autenticação do projeto.
 * Mantém compatibilidade com imports antigos e delega toda a lógica ao AuthContext.
 */

import {useAuth as useAuthContexto} from "@/context/AuthContext";

export const useAuth = () => useAuthContexto();
