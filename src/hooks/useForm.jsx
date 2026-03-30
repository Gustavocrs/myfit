"use client";
import { useState, useCallback } from "react";

/**
 * Hook personalizado para gerenciar o estado de formulários,
 * incluindo valores dos campos, erros e validação.
 *
 * @param {object} initialState - O estado inicial do formulário.
 * @returns {object} - Retorna o estado do formulário (formData),
 * uma função para atualizar campos (setField), o objeto de erros (errors),
 * e uma função para executar a validação (validate).
 */
export const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Atualiza um campo específico no estado do formulário.
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Função de validação (pode ser expandida conforme necessário).
  const validate = useCallback(() => {
    const newErrors = {};
    // Exemplo de validação: if (!formData.aluno) newErrors.aluno = "Aluno é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    setField,
    errors,
    validate,
  };
};
