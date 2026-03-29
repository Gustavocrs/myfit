import React from "react";

/**
 * Componente global de Loading (Overlay).
 * Utiliza Tailwind CSS para sobrepor a interface com um z-index alto.
 */
const Loading = ({open = true, message = "Carregando..."}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm text-white">
      <div className="w-14 h-14 border-4 border-slate-300 border-t-orange-500 rounded-full animate-spin mb-4 shadow-md"></div>
      {message && (
        <span className="text-lg font-semibold tracking-wide animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
};

export default Loading;
