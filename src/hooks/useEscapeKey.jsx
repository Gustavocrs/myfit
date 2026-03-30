import {useEffect} from "react";

/**
 * Hook customizado que executa um callback quando a tecla "Escape" é pressionada.
 * @param {function} onEscape - A função a ser chamada ao pressionar a tecla Escape.
 */
export const useEscapeKey = (onEscape) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]); // O efeito depende do callback para se manter atualizado.
};
