/**
 * Rótulo de seção interna para agrupamentos de exercícios.
 *
 * @param {Object} props
 * @param {string} props.text - Título da sub-seção
 */
const SectionLabel = ({text}) => {
  return (
    <div className="text-[0.9rem] uppercase text-slate-500 dark:text-orange-400 font-extrabold my-6 pl-1">
      {text}
    </div>
  );
};

export default SectionLabel;
