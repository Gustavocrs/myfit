"use client";

import {useState} from "react";

/**
 * Hook para gerenciar diálogos de confirmação usando AlertDialog
 * Compatível com o componente AlertDialog existente no projeto
 * 
 * @returns {Object} { alertState, openAlert, closeAlert, onEdit }
 */
export const useConfirmDialog = () => {
  const [alertState, setAlertState] = useState(false);
  const [onEditCallback, setOnEditCallback] = useState(null);

  /**
   * Abre o diálogo de confirmação
   * @param {Function} onConfirm - Callback executado quando o usuário clica em "Editar"
   */
  const openAlert = (onConfirm = () => {}) => {
    setOnEditCallback(() => onConfirm);
    setAlertState(true);
  };

  const closeAlert = () => {
    setAlertState(false);
  };

  // Mapeia para o padrão do AlertDialog (onEdit)
  const onEdit = () => {
    onEditCallback?.();
    closeAlert();
  };

  return {
    alertState,
    openAlert,
    closeAlert,
    onEdit,
  };
};
