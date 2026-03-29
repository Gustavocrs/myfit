/**
 * Subtítulo estendido padronizado para uso dentro do InfoBox.
 *
 * @param {Object} props
 * @param {boolean} [props.isGreen=false]
 * @param {React.ReactNode} props.children
 */
export const InfoSubtitle = ({children, isGreen = false}) => (
  <span
    className={`block mt-3 font-extrabold text-[0.85rem] uppercase mb-1.5 ${isGreen ? "text-green-700" : "text-orange-600"}`}
  >
    {children}
  </span>
);

/**
 * Grid final com boxes de informações extras do app.
 *
 * @param {Object} props
 * @param {string} props.title - Título principal da caixa de info
 * @param {boolean} [props.isGreen=false] - Ativa a variação verde (nutrição)
 * @param {React.ReactNode} props.children - Conteúdo interno flexível
 */
const InfoBox = ({title, isGreen = false, children}) => {
  const baseClass = isGreen
    ? "bg-green-50 border-green-300"
    : "bg-orange-50 border-orange-300";

  const titleClass = isGreen ? "text-green-800" : "text-red-600";

  return (
    <div
      className={`p-4 rounded-xl text-[0.9rem] leading-relaxed shadow-sm border-2 ${baseClass}`}
    >
      <h2
        className={`m-0 text-[clamp(1rem,5vw,1.2rem)] uppercase font-bold mb-2 ${titleClass}`}
      >
        {title}
      </h2>
      <div className="text-slate-700 font-medium text-[0.95rem]">
        {children}
      </div>
    </div>
  );
};

export default InfoBox;
