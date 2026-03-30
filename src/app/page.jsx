"use client";

import {useEffect, useState} from "react";
import Header from "@/components/Header";
import Link from "next/link";
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import {useAuth} from "@/context/AuthContext";
import {db} from "@/lib/firebase";
import {doc, getDoc} from "firebase/firestore";
import {obterGrupoMuscularExibicao} from "@/utils/gruposMusculares";

/**
 * Converte valores numéricos vindos do Firebase para `number`.
 * Suporta tanto vírgula quanto ponto decimal.
 *
 * @param {string|number|null|undefined} valor
 * @returns {number|null}
 */
const converterNumero = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  const valorTexto = String(valor).trim();
  if (!valorTexto) {
    return null;
  }

  const valorNormalizado = valorTexto.includes(",")
    ? valorTexto.replace(/\./g, "").replace(",", ".")
    : valorTexto;

  const numero = Number(valorNormalizado);
  return Number.isFinite(numero) ? numero : null;
};

/**
 * Interpreta datas em `pt-BR` para evitar inconsistência entre navegadores.
 *
 * @param {string} data
 * @returns {Date}
 */
const converterDataPtBr = (data) => {
  if (!data) {
    return new Date(0);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  const dataConvertida = new Date(data);
  return Number.isNaN(dataConvertida.getTime()) ? new Date(0) : dataConvertida;
};

/**
 * Ordena o histórico de avaliações da mais recente para a mais antiga.
 *
 * @param {Array} historico
 * @returns {Array}
 */
const ordenarAvaliacoesPorData = (historico = []) =>
  [...historico].sort(
    (a, b) => converterDataPtBr(b?.date) - converterDataPtBr(a?.date),
  );

const formatarNumero = (valor, casas = 1) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);

const formatarValorMetrica = (valor, unidade, casas = 1) =>
  valor === null ? "--" : `${formatarNumero(valor, casas)} ${unidade}`.trim();

const limparRotuloSecao = (rotulo = "") =>
  rotulo
    .replace(/^👑\s*Foco:\s*/, "")
    .replace(/^Foco:\s*/, "")
    .replace(/^🔥\s*Protocolo Metabólico$/, "Cardio")
    .trim();

/**
 * Descobre o treino do dia usando primeiro a agenda configurada e depois o fallback legado.
 *
 * @param {Array} treinos
 * @param {Date} [dataAtual=new Date()]
 * @returns {Object|null}
 */
const obterTreinoDoDia = (treinos = [], dataAtual = new Date()) => {
  const diaAtual = dataAtual.getDay();
  const diaAtualTexto = String(diaAtual);

  const treinoCustomizado = treinos.find(
    (treino) =>
      Array.isArray(treino?.daysOfWeek) &&
      treino.daysOfWeek.map(String).includes(diaAtualTexto),
  );

  if (treinoCustomizado) {
    return treinoCustomizado;
  }

  const treinoPadraoPorDia = {
    1: "A",
    2: "B",
    3: "C",
    4: "A",
    5: "B",
  };

  const identificadorTreino = treinoPadraoPorDia[diaAtual];
  return identificadorTreino
    ? treinos.find((treino) => treino.id === identificadorTreino) || null
    : null;
};

/**
 * Resume o foco muscular do treino do dia com base nas seções e exercícios já salvos.
 *
 * @param {Object|null} treino
 * @returns {string}
 */
const obterFocoMuscularTreino = (treino) => {
  if (!treino?.sections?.length) {
    return treino?.badge || "Treino planejado";
  }

  const grupos = treino.sections
    .flatMap((secao) => {
      const grupoAtual = limparRotuloSecao(secao.label);

      return (secao.exercises || []).map((exercicio) =>
        obterGrupoMuscularExibicao(exercicio, grupoAtual),
      );
    })
    .filter(Boolean)
    .filter((grupo) => grupo !== "Cardio");

  const gruposUnicos = [...new Set(grupos)];
  return gruposUnicos.length > 0
    ? gruposUnicos.join(" • ")
    : treino.badge || "Treino planejado";
};

/**
 * Gera o resumo visual da variação entre a avaliação atual e a anterior.
 *
 * @param {number|null} valorAtual
 * @param {number|null} valorAnterior
 * @param {Object} configuracao
 * @param {number} [configuracao.casas=1]
 * @param {string} [configuracao.unidade=""]
 * @param {'neutro'|'musculo'|'gordura'} [configuracao.tipoAnalise='neutro']
 * @param {string} [configuracao.dataAnterior=""]
 * @returns {{texto: string, apoio: string, status: string}}
 */
const montarVariacao = (
  valorAtual,
  valorAnterior,
  {
    casas = 1,
    unidade = "",
    tipoAnalise = "neutro",
    dataAnterior = "",
  } = {},
) => {
  if (valorAtual === null) {
    return {
      texto: "Sem dados",
      apoio: "Preencha na Evolução",
      status: "padrao",
    };
  }

  if (valorAnterior === null) {
    return {
      texto: "Sem comparação",
      apoio: "Adicione outra avaliação",
      status: "padrao",
    };
  }

  const delta = Number((valorAtual - valorAnterior).toFixed(casas));
  if (delta === 0) {
    return {
      texto: "Sem alteração",
      apoio: dataAnterior ? `Comparado com ${dataAnterior}` : "Última comparação",
      status: "padrao",
    };
  }

  const valorAbsoluto = formatarNumero(Math.abs(delta), casas);
  let status = "neutro";

  if (tipoAnalise === "musculo") {
    status = delta > 0 ? "favoravel" : "perda";
  }

  if (tipoAnalise === "gordura") {
    status = delta < 0 ? "favoravel" : "alerta";
  }

  return {
    texto: `${delta > 0 ? "+" : "-"}${valorAbsoluto}${unidade ? ` ${unidade}` : ""}`,
    apoio: dataAnterior ? `Comparado com ${dataAnterior}` : "Última comparação",
    status,
  };
};

const estilosVariacao = {
  favoravel:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  alerta:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  perda:
    "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  neutro: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  padrao:
    "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-700/70 dark:text-slate-300",
};

const CardMetrica = ({
  titulo,
  valor,
  apoio,
  variacao,
  icone: Icone,
  destaque,
}) => (
  <article className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm min-h-[168px]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          {titulo}
        </span>
        <h3 className="mt-3 text-[clamp(1.2rem,4vw,1.7rem)] font-black text-slate-900 dark:text-slate-100 leading-tight">
          {valor}
        </h3>
      </div>
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-700/70 p-3 text-orange-600">
        <Icone size={18} />
      </div>
    </div>

    <div className="mt-4 flex flex-col gap-2">
      <span
        className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.72rem] font-bold ${estilosVariacao[variacao.status] || estilosVariacao.padrao}`}
      >
        {destaque || variacao.texto}
      </span>
      <p className="text-[0.78rem] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
        {apoio}
        {variacao.apoio ? ` • ${variacao.apoio}` : ""}
      </p>
    </div>
  </article>
);

const Home = () => {
  const {user} = useAuth();
  const [carregandoPainel, setCarregandoPainel] = useState(true);
  const [dadosPainel, setDadosPainel] = useState({
    ultimaAvaliacao: null,
    avaliacaoAnterior: null,
    totalAvaliacoes: 0,
    treinoDoDia: null,
    temTreinos: false,
    mostrarApenasTreinoDoDia: false,
  });

  useEffect(() => {
    let paginaAtiva = true;

    const carregarPainel = async () => {
      if (!user?.uid) {
        if (paginaAtiva) {
          setDadosPainel({
            ultimaAvaliacao: null,
            avaliacaoAnterior: null,
            totalAvaliacoes: 0,
            treinoDoDia: null,
            temTreinos: false,
            mostrarApenasTreinoDoDia: false,
          });
          setCarregandoPainel(false);
        }
        return;
      }

      try {
        const [avaliacoesSnap, treinosSnap, ajustesSnap] = await Promise.all([
          getDoc(doc(db, "evaluations", user.uid)),
          getDoc(doc(db, "workoutPlans", user.uid)),
          getDoc(doc(db, "userSettings", user.uid)),
        ]);

        if (!paginaAtiva) {
          return;
        }

        const historicoAvaliacoes = ordenarAvaliacoesPorData(
          avaliacoesSnap.exists() ? avaliacoesSnap.data().history || [] : [],
        );

        const treinosSalvos =
          treinosSnap.exists() && Array.isArray(treinosSnap.data().plans)
            ? treinosSnap.data().plans
            : [];

        setDadosPainel({
          ultimaAvaliacao: historicoAvaliacoes[0] || null,
          avaliacaoAnterior: historicoAvaliacoes[1] || null,
          totalAvaliacoes: historicoAvaliacoes.length,
          treinoDoDia: obterTreinoDoDia(treinosSalvos),
          temTreinos: treinosSalvos.length > 0,
          mostrarApenasTreinoDoDia: Boolean(
            ajustesSnap.exists() && ajustesSnap.data().showTodayWorkoutOnly,
          ),
        });
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
      } finally {
        if (paginaAtiva) {
          setCarregandoPainel(false);
        }
      }
    };

    carregarPainel();

    return () => {
      paginaAtiva = false;
    };
  }, [user]);

  const {ultimaAvaliacao, avaliacaoAnterior, totalAvaliacoes} = dadosPainel;
  const pesoAtual = converterNumero(ultimaAvaliacao?.bio?.peso);
  const massaMuscularAtual = converterNumero(
    ultimaAvaliacao?.bio?.massaMuscular,
  );
  const gorduraCorporalAtual = converterNumero(
    ultimaAvaliacao?.bio?.gorduraCorporal,
  );
  const gorduraVisceralAtual = converterNumero(
    ultimaAvaliacao?.bio?.gorduraVisceral,
  );

  const metricas = [
    {
      id: "peso",
      titulo: "Peso Atual",
      valor: formatarValorMetrica(pesoAtual, "kg"),
      apoio: ultimaAvaliacao?.date
        ? `Última leitura em ${ultimaAvaliacao.date}`
        : "Nenhuma avaliação registrada",
      variacao: montarVariacao(
        pesoAtual,
        converterNumero(avaliacaoAnterior?.bio?.peso),
        {
          unidade: "kg",
          tipoAnalise: "neutro",
          dataAnterior: avaliacaoAnterior?.date || "",
        },
      ),
      icone: FiTrendingUp,
      destaque: pesoAtual === null ? "Sem leitura" : null,
    },
    {
      id: "massa-muscular",
      titulo: "Massa Muscular",
      valor: formatarValorMetrica(massaMuscularAtual, "kg"),
      apoio: "Ganhos e perdas de massa magra",
      variacao: montarVariacao(
        massaMuscularAtual,
        converterNumero(avaliacaoAnterior?.bio?.massaMuscular),
        {
          unidade: "kg",
          tipoAnalise: "musculo",
          dataAnterior: avaliacaoAnterior?.date || "",
        },
      ),
      icone: FiTarget,
      destaque: massaMuscularAtual === null ? "Sem leitura" : null,
    },
    {
      id: "gordura-corporal",
      titulo: "Gordura Corporal",
      valor: formatarValorMetrica(gorduraCorporalAtual, "%"),
      apoio: "Queda é evolução favorável",
      variacao: montarVariacao(
        gorduraCorporalAtual,
        converterNumero(avaliacaoAnterior?.bio?.gorduraCorporal),
        {
          unidade: "%",
          tipoAnalise: "gordura",
          dataAnterior: avaliacaoAnterior?.date || "",
        },
      ),
      icone: FiTrendingDown,
      destaque: gorduraCorporalAtual === null ? "Sem leitura" : null,
    },
    {
      id: "gordura-visceral",
      titulo: "Gordura Visceral",
      valor:
        gorduraVisceralAtual === null
          ? "--"
          : formatarNumero(gorduraVisceralAtual, 1),
      apoio: "Acompanhe com atenção e constância",
      variacao: montarVariacao(
        gorduraVisceralAtual,
        converterNumero(avaliacaoAnterior?.bio?.gorduraVisceral),
        {
          tipoAnalise: "gordura",
          dataAnterior: avaliacaoAnterior?.date || "",
        },
      ),
      icone: FiActivity,
      destaque: gorduraVisceralAtual === null ? "Sem leitura" : null,
    },
  ];

  const focoTreinoDoDia = obterFocoMuscularTreino(dadosPainel.treinoDoDia);
  const rotuloTreinoDoDia = dadosPainel.treinoDoDia
    ? dadosPainel.treinoDoDia.title
    : dadosPainel.temTreinos
      ? "Dia de Recuperação"
      : "Sem Ficha Criada";

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-800/20 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.35),transparent_35%),linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#111827_100%)] p-5 text-white shadow-xl mt-6">
          <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.18em] text-orange-100">
              Dashboard Físico
            </span>

            <h2 className="mt-4 text-[clamp(1.65rem,6vw,2.35rem)] font-black leading-[1.05]">
              Sua evolução em dados reais, sem card fake.
            </h2>

            <p className="mt-3 max-w-[28rem] text-[0.95rem] font-medium leading-relaxed text-slate-200">
              {carregandoPainel
                ? "Atualizando peso, composição corporal e planejamento do dia..."
                : ultimaAvaliacao?.date
                  ? `Baseado na sua avaliação mais recente de ${ultimaAvaliacao.date}.`
                  : "Ainda não existe avaliação cadastrada. O painel começa a ganhar valor assim que você registrar sua primeira evolução."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-orange-100/80">
                  Avaliações
                </span>
                <strong className="mt-2 block text-[1.45rem] font-black text-white">
                  {carregandoPainel ? "..." : totalAvaliacoes}
                </strong>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-orange-100/80">
                  Hoje
                </span>
                <strong className="mt-2 block text-[1.1rem] font-black text-white leading-tight">
                  {carregandoPainel ? "Carregando" : rotuloTreinoDoDia}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 mt-4">
          {metricas.map((metrica) => (
            <CardMetrica key={metrica.id} {...metrica} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-3 mt-4">
          <Link
            href="/workouts"
            className="group rounded-[1.6rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all hover:border-orange-300 dark:hover:border-orange-500/40 hover:-translate-y-[1px]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.16em] text-orange-700 dark:text-orange-300">
                  Treino de Hoje
                </span>
                <h3 className="mt-3 text-[1.3rem] font-black text-slate-900 dark:text-slate-100">
                  {carregandoPainel ? "Carregando treino..." : rotuloTreinoDoDia}
                </h3>
                <p className="mt-2 text-[0.92rem] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  {carregandoPainel
                    ? "Buscando seu treino configurado."
                    : dadosPainel.treinoDoDia
                      ? `${focoTreinoDoDia}. ${
                          dadosPainel.mostrarApenasTreinoDoDia
                            ? 'O modo "Ver treinos do dia" está ativo nos Ajustes.'
                            : "Sua ficha completa continua disponível em Treinos."
                        }`
                      : dadosPainel.temTreinos
                        ? "Você não tem treino associado a hoje. Use o dia para recuperação ou cardio leve."
                        : "Você ainda não montou uma ficha de treino. Configure seus dias e grupos musculares em Ajustes."}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-700/70 p-3 text-orange-600">
                <FiActivity size={20} />
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-orange-600">
              {dadosPainel.mostrarApenasTreinoDoDia
                ? "Abrir treino do dia"
                : "Abrir meus treinos"}
              <FiArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>

          <Link
            href="/tracking"
            className="group rounded-[1.6rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all hover:border-sky-300 dark:hover:border-sky-500/40 hover:-translate-y-[1px]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-sky-500/10 px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                  Última Avaliação
                </span>
                <h3 className="mt-3 text-[1.3rem] font-black text-slate-900 dark:text-slate-100">
                  {carregandoPainel
                    ? "Carregando avaliação..."
                    : ultimaAvaliacao?.date || "Nenhuma avaliação registrada"}
                </h3>
                <p className="mt-2 text-[0.92rem] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  {carregandoPainel
                    ? "Conferindo suas medições e comparativos."
                    : ultimaAvaliacao
                      ? `Peso ${formatarValorMetrica(pesoAtual, "kg")} • Gordura corporal ${formatarValorMetrica(
                          gorduraCorporalAtual,
                          "%",
                        )} • ${totalAvaliacoes} ${
                          totalAvaliacoes === 1 ? "registro" : "registros"
                        } no histórico.`
                      : "Cadastre peso, massa muscular e medidas para transformar a Home em um painel de evolução de verdade."}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-700/70 p-3 text-sky-600">
                <FiCalendar size={20} />
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-sky-600">
              {ultimaAvaliacao ? "Abrir evolução" : "Registrar primeira avaliação"}
              <FiArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
};

export default Home;
