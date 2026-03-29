/**
 * Componente de Cabeçalho principal.
 */
const Header = () => {
  return (
    <header className="text-center mb-6 pb-4 border-b-2 border-slate-200">
      <h1 className="text-[clamp(1.8rem,6vw,2.5rem)] text-orange-600 uppercase font-black italic m-0 leading-[1.1]">
        V-Taper
      </h1>
      <div className="text-[clamp(0.85rem,3vw,1rem)] text-slate-500 uppercase font-bold mt-1.5 tracking-[0.5px]">
        Fase Natural • Gym • Lombar Safe
      </div>
    </header>
  );
};

export default Header;
