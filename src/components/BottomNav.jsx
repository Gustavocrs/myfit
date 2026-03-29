"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {FiHome, FiActivity, FiTarget, FiSettings} from "react-icons/fi";

/**
 * Componente de Navegação Inferior (Mobile First).
 */
const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {label: "Início", path: "/", icon: FiHome},
    {label: "Treinos", path: "/workouts", icon: FiActivity},
    {label: "Evolução", path: "/tracking", icon: FiTarget},
    {label: "Ajustes", path: "/settings", icon: FiSettings},
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-[72px] pb-[env(safe-area-inset-bottom)] z-50 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Marca como ativo se for a rota exata ou sub-rota
        const isActive =
          pathname === item.path ||
          (item.path !== "/" && pathname.startsWith(item.path));

        return (
          <Link
            href={item.path}
            key={item.path}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive
                ? "text-orange-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[0.65rem] font-extrabold uppercase tracking-wide">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
