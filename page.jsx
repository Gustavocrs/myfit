"use client";

import {useContext, useEffect} from "react";
import {useRouter} from "next/navigation";
import {AuthContext} from "@/context/AuthContext";
import {Button} from "@/components/Button";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {FcGoogle} from "react-icons/fc";

const LoginPage = () => {
  const {user, loading, signInWithGoogle} = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (loading || user) {
    return <Loading message="Verificando sessão..." />;
  }

  return (
    <main className="min-h-screen bg-slate-100 py-3 px-3 flex items-center justify-center">
      <div className="max-w-[600px] w-full mx-auto pb-6 text-center">
        <Header />
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Bem-vindo!</h2>
          <p className="text-slate-500 mb-6">
            Acesse sua conta para continuar.
          </p>
          <Button wfull onClick={signInWithGoogle}>
            <FcGoogle size={24} className="mr-3" />
            Entrar com Google
          </Button>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
