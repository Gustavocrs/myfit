/**
 * Divisor visual principal para os dias de treino.
 *
 * @param {Object} props
 * @param {string} props.title - Título do dia (ex: Treino A: Seg / Qui)
 * @param {string} props.badge - Subtítulo do foco (ex: Braços & Ombros)
 */
const DayDivider = ({title, badge}) => {
  return (
    <div className="min-h-[70px] w-full bg-slate-900 text-white p-4 rounded-xl flex flex-col justify-center items-center text-center gap-2 shadow-md mt-8 mb-4">
      <h2 className="m-0 text-[clamp(1.4rem,5vw,1.8rem)] uppercase italic font-bold">
        {title}
      </h2>
      <span className="bg-orange-600 text-white py-1 px-2.5 rounded-md font-extrabold text-[0.85rem] uppercase self-center">
        {badge}
      </span>
    </div>
  );
};

export default DayDivider;
