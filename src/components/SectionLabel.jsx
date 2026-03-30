const normalizarTextoSecao = (text = "") =>
  text.replace(/^👑\s*Foco:\s*/, "").replace(/^Foco:\s*/, "").trim();

const SectionLabel = ({text}) => {
  return (
    <h4 className="text-[0.8rem] font-bold text-slate-500 dark:text-slate-400 uppercase my-4 ml-1">
      {normalizarTextoSecao(text)}
    </h4>
  );
};

export default SectionLabel;
