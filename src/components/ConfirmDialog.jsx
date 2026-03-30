"use client";

import {useEffect} from "react";

/**
 * Diálogo de confirmação reutilizável para ações destrutivas ou sensíveis.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controla se o diálogo está visível.
 * @param {function} props.onClose - Função para fechar o diálogo.
 * @param {function} props.onConfirm - Função a ser executada ao confirmar.
 * @param {string} props.title - O título do diálogo.
 * @param {React.ReactNode} props.children - O conteúdo/mensagem do diálogo.
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-black text-slate-50">{title}</h2>
        <div className="mb-6 text-[0.95rem] leading-relaxed text-slate-300">
          {children}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
