"use client";

import {useEffect, useContext, useState} from "react";
import Header from "@/components/Header";
import InfoBox, {InfoSubtitle} from "@/components/InfoBox";
import Link from "next/link";
import {FiActivity, FiTrendingUp} from "react-icons/fi";
import {AuthContext} from "@/context/AuthContext";
import {db} from "@/lib/firebase";
import {doc, getDoc} from "firebase/firestore";

const Home = () => {
  const {user} = useContext(AuthContext);
  const [pesoAtual, setPesoAtual] = useState("--");

  useEffect(() => {
    const fetchSettingsAndEvals = async () => {
      if (user?.uid) {
        try {
          // Aplica o tema escuro se estiver ativado
          const settingsRef = doc(db, "userSettings", user.uid);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists() && settingsSnap.data().isDarkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }

          // Puxa o último peso registrado na Evolução
          const evalsRef = doc(db, "evaluations", user.uid);
          const evalsSnap = await getDoc(evalsRef);
          if (evalsSnap.exists() && evalsSnap.data().history?.length > 0) {
            const latestEval = evalsSnap.data().history[0];
            if (latestEval.bio?.peso) {
              setPesoAtual(latestEval.bio.peso);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados da Home:", error);
        }
      }
    };
    fetchSettingsAndEvals();
  }, [user]);

  return (
    <main className="min-h-screen bg-slate-100 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        <h2 className="text-[1.1rem] font-extrabold text-slate-800 uppercase mb-4 mt-6">
          Visão Geral
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center gap-2">
            <FiActivity size={28} className="text-orange-600" />
            <span className="text-[0.8rem] text-slate-500 font-bold uppercase">
              Treino Atual
            </span>
            <span className="text-[1.1rem] font-black text-slate-800 uppercase">
              Treino A
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center gap-2">
            <FiTrendingUp size={28} className="text-green-600" />
            <span className="text-[0.8rem] text-slate-500 font-bold uppercase">
              Peso Atual
            </span>
            <span className="text-[1.1rem] font-black text-slate-800 uppercase">
              {pesoAtual !== "--" ? `${pesoAtual} kg` : "-- kg"}
            </span>
          </div>
        </div>

        <Link
          href="/workouts"
          className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl font-extrabold uppercase tracking-wide shadow-md mb-8 transition-transform active:scale-[0.98]"
        >
          Acessar Meus Treinos
        </Link>

        <div className="flex flex-col gap-4 mt-10">
          <InfoBox title="🔥 Próximos Passos">
            <InfoSubtitle>Configuração Inicial</InfoSubtitle>
            Acesse a aba de evolução para registrar suas medidas e sua primeira
            foto de acompanhamento.
          </InfoBox>
        </div>
      </div>
    </main>
  );
};

export default Home;
