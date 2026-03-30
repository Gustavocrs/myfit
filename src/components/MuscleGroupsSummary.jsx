/**
 * Componente que exibe resumo visual dos grupos musculares e quantidade de exercícios.
 *
 * @param {Object} props
 * @param {Array<string>} props.areas - Lista de grupos musculares selecionados
 * @param {Object} props.selectedExercises - Exercícios selecionados por área {area: [id1, id2, ...]}
 * @param {Object} props.areaCounts - Contagem de exercícios por área {area: count}
 */
const MuscleGroupsSummary = ({areas, selectedExercises, areaCounts}) => {
  const colorMap = {
    Peito: "bg-red-100 text-red-700 border-red-300",
    Costas: "bg-blue-100 text-blue-700 border-blue-300",
    Ombro: "bg-purple-100 text-purple-700 border-purple-300",
    Tríceps: "bg-orange-100 text-orange-700 border-orange-300",
    Bíceps: "bg-pink-100 text-pink-700 border-pink-300",
    Pernas: "bg-green-100 text-green-700 border-green-300",
    Panturrilha: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Abdômen: "bg-indigo-100 text-indigo-700 border-indigo-300",
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-[0.75rem] font-bold text-slate-500 uppercase tracking-wider">
        Grupos Musculares
      </h4>
      <div className="flex flex-wrap gap-2">
        {areas && areas.length > 0 ? (
          areas.map((area) => {
            const count =
              selectedExercises?.[area]?.length || areaCounts?.[area] || 0;
            const colors =
              colorMap[area] || "bg-slate-100 text-slate-700 border-slate-300";

            return (
              <div
                key={area}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-[0.75rem] font-bold whitespace-nowrap ${colors}`}
              >
                <span>{area}</span>
                <span className="bg-white bg-opacity-50 px-1.5 py-0 rounded-full text-[0.7rem] font-extrabold">
                  {count}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-[0.75rem] text-slate-400 italic">
            Nenhuma área selecionada
          </p>
        )}
      </div>
    </div>
  );
};

export default MuscleGroupsSummary;
