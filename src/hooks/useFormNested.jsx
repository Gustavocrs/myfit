"use client";

import {useState, useCallback} from "react";

/**
 * Hook personalizado para gerenciar formulários com estrutura aninhada.
 * Estende useForm para suportar campos como "section.field".
 *
 * @param {object} initialState - O estado inicial do formulário (com estrutura aninhada).
 * @returns {object} - { formData, setNestedField, reset, errors, validate }
 *
 * @example
 * const form = useFormNested({
 *   bio: { peso: "", gordura: "" },
 *   medidas: { torax: "", cintura: "" }
 * });
 * form.setNestedField("bio", "peso", "75.5");
 */
export const useFormNested = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Atualiza um campo aninhado (section.field)
  const setNestedField = useCallback(
    (section, field, value) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));

      // Limpa erro se existir
      const errorKey = `${section}.${field}`;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = {...prev};
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    },
    [errors],
  );

  // Reseta para estado inicial
  const reset = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  // Validação básica
  const validate = useCallback(
    (validationRules = {}) => {
      const newErrors = {};

      Object.keys(validationRules).forEach((sectionKey) => {
        const sectionRules = validationRules[sectionKey];

        Object.keys(sectionRules).forEach((fieldKey) => {
          const rule = sectionRules[fieldKey];
          const value = formData[sectionKey]?.[fieldKey];
          const errorKey = `${sectionKey}.${fieldKey}`;

          if (rule.required && (!value || value.toString().trim() === "")) {
            newErrors[errorKey] = `${fieldKey} é obrigatório`;
          }
        });
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData],
  );

  return {
    formData,
    setNestedField,
    reset,
    errors,
    validate,
    setFormData,
  };
};
