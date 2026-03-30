"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/Button";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {notifyError} from "@/components/Notify";
import {FcGoogle} from "react-icons/fc";
import {
  FiActivity,
  FiAlertCircle,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";

const DESTAQUES_LOGIN = [
  {
    titulo: "Treino do dia",
    descricao: "Acesse sua divisão atual e ajuste metas sem perder contexto.",
    icone: FiActivity,
  },
  {
    titulo: "Evolução real",
    descricao: "Compare peso, massa muscular e gordura em um painel só.",
    icone: FiTrendingUp,
  },
  {
    titulo: "Acesso seguro",
    descricao:
      "Sua sessão fica vinculada à conta Google autorizada no Firebase.",
    icone: FiShield,
  },
];

const LoginPage = () => {
  const {user, loading, signInWithGoogle} = useAuth();
  const router = useRouter();
  const [autenticando, setAutenticando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleLoginGoogle = async () => {
    setErroLogin("");
    setAutenticando(true);

    try {
      const usuario = await signInWithGoogle();

      if (usuario) {
        router.replace("/");
      }
    } catch (error) {
      const mensagem =
        error?.message || "Não foi possível iniciar a sessão agora.";

      setErroLogin(mensagem);
      notifyError(mensagem);
    } finally {
      setAutenticando(false);
    }
  };

  if (loading) {
    return <Loading message="Verificando sessão..." />;
  }

  if (user) {
    return <Loading message="Redirecionando..." />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-7 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 sm:px-8 sm:py-9">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-sky-500" />
            <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-400/10" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-400/10" />

            <div className="relative">
              <Header />

              <div className="mt-8">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.18em] text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
                  Painel pessoal
                </span>

                <h2 className="mt-4 max-w-xl text-[clamp(2rem,5vw,3.5rem)] font-black leading-[0.95] tracking-tight text-slate-950 dark:text-white">
                  Seu treino, sua evolução e sua rotina no mesmo painel.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Entre com sua conta Google para acessar os treinos salvos,
                  acompanhar o histórico corporal e manter suas preferências
                  sincronizadas.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {DESTAQUES_LOGIN.map(({titulo, descricao, icone: Icone}) => (
                  <article
                    key={titulo}
                    className="rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      <Icone size={18} />
                    </div>
                    <h3 className="mt-4 text-sm font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white">
                      {titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {descricao}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-7 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 sm:px-8 sm:py-9">
            <div className="flex h-full flex-col justify-center">
              <span className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.18em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
                Entrar
              </span>

              <h3 className="mt-4 text-3xl font-black leading-tight text-slate-950 dark:text-white">
                Acesse o MyFit com sua conta Google
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                O login é feito por pop-up seguro do Google. Depois da
                autenticação, você volta direto para o painel principal.
              </p>

              {erroLogin ? (
                <div className="mt-6 rounded-[1.4rem] border border-red-200 bg-red-50 p-4 text-left dark:border-red-500/30 dark:bg-red-500/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-red-600 dark:text-red-300">
                      <FiAlertCircle size={18} />
                    </div>
                    <div>
                      <strong className="block text-sm font-black text-red-700 dark:text-red-200">
                        Falha ao autenticar
                      </strong>
                      <p className="mt-1 text-sm leading-6 text-red-700/90 dark:text-red-100">
                        {erroLogin}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6">
                <Button
                  wfull
                  loading={autenticando}
                  onClick={handleLoginGoogle}
                  className="h-16 rounded-2xl px-5 text-base"
                >
                  <span className="flex items-center gap-3">
                    <FcGoogle size={24} />
                    {autenticando
                      ? "Conectando com Google..."
                      : "Entrar com Google"}
                  </span>
                </Button>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <FiShield size={16} />
                  Sessão protegida
                </div>
                {/* <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Se a janela de login não abrir, libere pop-ups no navegador e
                  confirme se o domínio está autorizado no Firebase.
                </p> */}
              </div>

              <p className="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">
                O acesso libera seus treinos, métricas corporais e preferências
                sincronizadas no mesmo ambiente.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
