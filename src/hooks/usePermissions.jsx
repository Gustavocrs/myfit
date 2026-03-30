import {useCallback} from "react";
import {useAuth} from "@/context/AuthContext";
import {
  PERMISSIONS_MATRIX,
  ROLES,
  ROLE_HIERARCHY,
} from "@/constants/permissions";

export const DEFAULT_PERMISSIONS_MODEL = PERMISSIONS_MATRIX;

export const usePermissions = (userOverride = null) => {
  const {user: contextUser} = useAuth();
  const user = userOverride || contextUser;

  /**
   * Verifica se o usuário tem permissão para uma determinada ação em um módulo.
   * @param {string} module - Nome do módulo (ex: 'advertencia', 'buscaativa').
   * @param {string|string[]} action - Ação (ex: 'consultar', 'criar') ou array de ações. Default: 'consultar'.
   * @returns {boolean}
   */
  const can = useCallback(
    (module, action = "consultar") => {
      if (!user) {
        return false;
      }

      // 0. Bypass para Admin: Se for admin, tem permissão total irrestrita.
      if (user.userType === ROLES.ADMIN || user.tipo === "admin") {
        return true;
      }

      // 1. Identifica o modelo base pelo userType (comum ou indefinido vira default)
      let userType = user.userType;
      if (!userType || !DEFAULT_PERMISSIONS_MODEL[userType]) {
        userType = ROLES.COMUM;
      }

      const rolePermissions = DEFAULT_PERMISSIONS_MODEL[userType];

      // 2. Identifica overrides do usuário (do banco de dados)
      const userOverrides = user.permissoes || {};

      const checkPermission = (act) => {
        // Prioridade 1: Override do usuário (se definido explicitamente)
        if (
          userOverrides[module] &&
          typeof userOverrides[module][act] === "boolean"
        ) {
          return userOverrides[module][act];
        }
        // Prioridade 2: Modelo base do papel (Role)
        if (
          rolePermissions[module] &&
          typeof rolePermissions[module][act] === "boolean"
        ) {
          return rolePermissions[module][act];
        }
        return false;
      };

      if (Array.isArray(action)) {
        return action.every((act) => checkPermission(act));
      }

      const hasPermission = checkPermission(action);

      return hasPermission;
    },
    [user],
  );

  /**
   * Verifica se o usuário logado tem poder hierárquico sobre o recurso de outro usuário.
   * @param {string} resourceOwnerId - ID do usuário dono/criador do recurso.
   * @param {string} resourceOwnerRole - Role (userType) do dono/criador do recurso.
   * @returns {boolean}
   */
  const canManageResource = useCallback(
    (resourceOwnerId, resourceOwnerRole) => {
      if (!user) return false;

      // O próprio usuário pode gerenciar seu conteúdo (verificação de posse)
      if (user._id === resourceOwnerId || user.id === resourceOwnerId) {
        return true;
      }

      // Admin tem acesso irrestrito a qualquer recurso de terceiros
      if (user.userType === ROLES.ADMIN || user.tipo === "admin") {
        return true;
      }

      // Validação de nível hierárquico
      const currentUserLevel = ROLE_HIERARCHY[user.userType] || 0;
      const targetUserLevel = ROLE_HIERARCHY[resourceOwnerRole] || 0;

      // Usuário logado pode gerenciar se seu nível for estritamente maior que o do dono do recurso
      // Ex: Gestor (2) > Comum (1) = true. Gestor (2) > Gestor (2) = false.
      return currentUserLevel > targetUserLevel;
    },
    [user],
  );

  /**
   * Retorna o objeto completo de permissões efetivas (Role + Overrides).
   * Útil para preencher checkboxes na UI de gerenciamento de permissões.
   */
  const getEffectivePermissions = useCallback(() => {
    if (!user) return DEFAULT_PERMISSIONS_MODEL[ROLES.COMUM];

    // Admin sempre tem todas as permissões do modelo admin (ignora overrides restritivos)
    if (user.userType === ROLES.ADMIN || user.tipo === "admin") {
      return DEFAULT_PERMISSIONS_MODEL[ROLES.ADMIN];
    }

    let userType = user.userType;
    if (!userType || !DEFAULT_PERMISSIONS_MODEL[userType]) {
      userType = ROLES.COMUM;
    }

    const rolePermissions = DEFAULT_PERMISSIONS_MODEL[userType];
    const userOverrides = user.permissoes || {};

    // Deep merge: Começa com as permissões do papel e aplica os overrides
    const effective = {};

    // Copia estrutura base
    Object.keys(rolePermissions).forEach((mod) => {
      effective[mod] = {...rolePermissions[mod]};
    });

    // Aplica overrides
    Object.keys(userOverrides).forEach((mod) => {
      if (!effective[mod]) effective[mod] = {};
      if (userOverrides[mod]) {
        Object.keys(userOverrides[mod]).forEach((act) => {
          if (typeof userOverrides[mod][act] === "boolean") {
            effective[mod][act] = userOverrides[mod][act];
          }
        });
      }
    });

    return effective;
  }, [user]);

  return {can, canManageResource, getEffectivePermissions};
};
