"use client";

import {useState} from "react";
/**
 * Componente interativo sanfona para detalhamento de exercícios.
 *
 * @param {Object} props
 * @param {string} props.name - Nome do exercício
 * @param {string} props.meta - Séries e repetições
 * @param {string} props.muscle - Músculo principal
 * @param {string} props.rest - Tempo de descanso
 * @param {string} props.detail - Detalhe extra sobre o foco da execução
 * @param {'none'|'orange'|'purple'|'blue'|'red'|'green'} [props.color='none'] - Cor de foco lateral
 * @param {function(string): void} [props.onMetaChange] - Função para atualizar o meta
 * @param {React.ReactNode} props.children - O conteúdo de texto ou nós react com as instruções
 */
const ExerciseCard = ({
  name,
  meta,
  muscle,
  rest,
  detail,
  color = "none",
  onMetaChange,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableMeta, setEditableMeta] = useState(meta);
  const colorMap = {
    none: "border-l-slate-300",
    orange: "border-l-orange-600",
    purple: "border-l-purple-600",
    blue: "border-l-blue-600",
    red: "border-l-red-600",
    green: "border-l-green-600",
  };

  const handleSave = () => {
    if (onMetaChange && editableMeta.trim() !== "") {
      onMetaChange(editableMeta);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditableMeta(meta); // Reverte as alterações
      setIsEditing(false);
    }
  };
  return (
    <details
      className={`bg-white mb-3 rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.06)] border-l-[6px] overflow-hidden transition-colors duration-200 group open:bg-slate-50 open:border-l-8 ${colorMap[color] || colorMap.none}`}
    >
      <summary className="p-4 cursor-pointer list-none flex flex-col gap-2 relative min-h-[48px] [&::-webkit-details-marker]:hidden">
        <div className="flex justify-between items-start w-full gap-3">
          <span className="text-[clamp(1rem,4.5vw,1.15rem)] font-extrabold text-slate-900 leading-[1.2] flex-1">
            {name}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editableMeta}
              onChange={(e) => setEditableMeta(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="bg-white text-orange-600 py-1.5 px-2.5 rounded-lg text-[clamp(0.85rem,3.5vw,0.95rem)] font-black whitespace-nowrap border-2 border-orange-500 outline-none w-28 text-center"
            />
          ) : (
            <span
              onClick={(e) => {
                e.preventDefault(); // Impede que o <details> abra/feche
                if (onMetaChange) {
                  setIsEditing(true);
                }
              }}
              className={`bg-slate-100 text-orange-600 py-1.5 px-2.5 rounded-lg text-[clamp(0.85rem,3.5vw,0.95rem)] font-black whitespace-nowrap border border-slate-200 ${
                onMetaChange ? "cursor-text hover:bg-orange-100" : ""
              }`}
            >
              {meta}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span className="bg-slate-700 text-slate-50 text-[0.65rem] font-extrabold uppercase py-1 px-1.5 rounded tracking-[0.5px]">
            {muscle}
          </span>
          <span className="bg-slate-100 text-slate-600 text-[0.7rem] font-bold py-1 px-2 rounded border border-slate-300">
            {rest}
          </span>
          <span className="text-[0.75rem] text-slate-500 uppercase font-bold">
            {detail}
          </span>
        </div>
      </summary>
      <div className="text-[0.95rem] text-slate-700 leading-relaxed px-4 pb-4 border-t border-dashed border-slate-200 mt-1 pt-3">
        {children}
      </div>
    </details>
  );
};

export default ExerciseCard;
