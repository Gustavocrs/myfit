"use client";

import {useState} from "react";

/**
 * Hook para gerenciar diálogos de confirmação reutilizáveis.
 *
 * @returns {Object} Estado e ações do diálogo de confirmação
 */
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "Confirmar ação",
    message: "Tem certeza que deseja continuar?",
    onConfirm: null,
  });

  /**
   * Abre o diálogo com título, mensagem e callback de confirmação.
   *
   * @param {Object} params
   * @param {string} params.title
   * @param {string} params.message
   * @param {Function} params.onConfirm
   */
  const openDialog = ({
    title = "Confirmar ação",
    message = "Tem certeza que deseja continuar?",
    onConfirm = async () => {},
  } = {}) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleConfirm = async () => {
    try {
      await dialogState.onConfirm?.();
    } finally {
      closeDialog();
    }
  };

  return {
    isOpen: dialogState.isOpen,
    title: dialogState.title,
    message: dialogState.message,
    openDialog,
    closeDialog,
    handleConfirm,
    // Compatibilidade com a API anterior para evitar regressão em chamadas legadas.
    alertState: dialogState.isOpen,
    openAlert: (onConfirm = async () => {}) =>
      openDialog({
        onConfirm,
      }),
    closeAlert: closeDialog,
    onEdit: handleConfirm,
  };
};
