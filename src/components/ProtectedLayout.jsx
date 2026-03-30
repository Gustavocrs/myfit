"use client";

import {useAuth} from "@/context/AuthContext";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import Loading from "@/components/Loading";
import BottomNav from "@/components/BottomNav";

const ProtectedLayout = ({children}) => {
  const {user, loading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading && pathname !== "/login") {
    return <Loading message="Carregando sessão..." />;
  }

  if (!user && pathname !== "/login") {
    return null; // Evita renderizar o conteúdo protegido antes do redirecionamento
  }

  // Permite o acesso à página de login sem proteção
  if (pathname === "/login") {
    return children;
  }

  return (
    <div className="min-h-full flex flex-col pb-[72px]">
      {children}
      <BottomNav />
    </div>
  );
};

export default ProtectedLayout;
