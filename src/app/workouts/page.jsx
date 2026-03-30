"use client";

import {useState, useEffect} from "react";
import Header from "@/components/Header";
import DayDivider from "@/components/DayDivider";
import ExerciseCard from "@/components/ExerciseCard";
import Loading from "@/components/Loading";
import {useAuth} from "@/context/AuthContext";
import {notifyError, notifySuccess} from "@/components/Notify";
import {db} from "@/lib/firebase";
import {obterGrupoMuscularExibicao} from "@/utils/gruposMusculares";
import {doc, getDoc, setDoc} from "firebase/firestore";
import Link from "next/link";

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [showTodayWorkoutOnly, setShowTodayWorkoutOnly] = useState(false);
  const {user} = useAuth();

  // Simula o carregamento dos dados do treino ao montar o componente.
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        if (user?.uid) {
          const docRef = doc(db, "workoutPlans", user.uid);
          const docSnap = await getDoc(docRef);

          let fetchedPlans = [];
          if (docSnap.exists() && docSnap.data().plans?.length > 0) {
            fetchedPlans = docSnap.data().plans;
            setWorkouts(fetchedPlans);
          } else {
            setWorkouts([]);
          }

          const settingsRef = doc(db, "userSettings", user.uid);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setShowTodayWorkoutOnly(
              settingsSnap.data().showTodayWorkoutOnly || false,
            );
          }

          // Identificar o treino de hoje baseado na configuração
          const todayStr = new Date().getDay().toString();
          let todayWorkoutId = null;

          const workoutForToday = fetchedPlans.find(
            (w) => w.daysOfWeek && w.daysOfWeek.includes(todayStr),
          );

          if (workoutForToday) {
            todayWorkoutId = workoutForToday.id;
          } else {
            // Fallback para a lógica de dias fixos caso não exista customização
            const todayNum = new Date().getDay();
            switch (todayNum) {
              case 1:
              case 4:
                todayWorkoutId = "A";
                break;
              case 2:
              case 5:
                todayWorkoutId = "B";
                break;
              case 3:
                todayWorkoutId = "C";
                break;
            }
          }

          setActiveWorkoutId(todayWorkoutId);
        } else {
          setWorkouts([]);
        }
      } catch (error) {
        console.error("Erro ao buscar treinos do Firebase:", error);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [user]);

  /**
   * Atualiza o meta (séries/repetições) de um exercício específico no estado.
   * @param {string} dayId - O ID do dia de treino (ex: 'A').
   * @param {number} sectionIndex - O índice da seção.
   * @param {number} exerciseIndex - O índice do exercício.
   * @param {string} newMeta - O novo valor para o meta.
   */
  const handleMetaChange = async (
    dayId,
    sectionIndex,
    exerciseIndex,
    newMeta,
  ) => {
    const updatedWorkouts = workouts.map((day) => {
      if (day.id === dayId) {
        const updatedSections = day.sections.map((section, sIdx) => {
          if (sIdx === sectionIndex) {
            const updatedExercises = section.exercises.map((exercise, eIdx) => {
              if (eIdx === exerciseIndex) {
                return {...exercise, meta: newMeta};
              }
              return exercise;
            });
            return {...section, exercises: updatedExercises};
          }
          return section;
        });
        return {...day, sections: updatedSections};
      }
      return day;
    });

    setWorkouts(updatedWorkouts);

    if (user?.uid) {
      try {
        const docRef = doc(db, "workoutPlans", user.uid);
        await setDoc(docRef, {plans: updatedWorkouts}, {merge: true});
        notifySuccess("Alteração salva!");
      } catch (error) {
        console.error("Erro ao salvar séries no Firebase:", error);
        notifyError("Erro ao salvar a alteração.");
      }
    }
  };

  if (loading) {
    return <Loading message="Carregando treinos..." />;
  }

  const todayWorkout = workouts.find((day) => day.id === activeWorkoutId);

  // Define quais treinos serão renderizados com base na configuração do usuário
  const workoutsToRender = showTodayWorkoutOnly
    ? todayWorkout
      ? [todayWorkout]
      : []
    : workouts;

  // Função auxiliar para renderizar a estrutura de um treino
  const renderWorkout = (workout) => (
    <div key={workout.id} className="mb-8">
      <DayDivider title={workout.title} badge={workout.badge} />

      {workout.sections.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          {section.exercises.map((ex, exIdx) => (
            <ExerciseCard
              key={exIdx}
              name={ex.name}
              meta={ex.meta || ex.defaultMeta}
              muscle={obterGrupoMuscularExibicao(ex)}
              rest={ex.rest || ex.restTime}
              detail={ex.detail || ex.details}
              color={ex.color}
              onMetaChange={(newMeta) =>
                handleMetaChange(workout.id, sectionIdx, exIdx, newMeta)
              }
            >
              {ex.instruction || ex.instructions}
            </ExerciseCard>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        {workoutsToRender.length > 0 ? (
          workoutsToRender.map(renderWorkout)
        ) : (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center mt-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
              {workouts.length === 0
                ? "Nenhum Treino Criado 📝"
                : "Dia de Descanso! 🛌"}
            </h3>
            <p className="text-[0.9rem] text-slate-500 dark:text-slate-400 font-medium mb-4">
              {workouts.length === 0
                ? "Você ainda não possui treinos cadastrados. Acesse os ajustes para gerar sua ficha."
                : "Você não tem treinos programados para hoje. Aproveite para recuperar as energias ou faça um cardio leve."}
            </p>
            {workouts.length === 0 && (
              <Link
                href="/settings"
                className="inline-block bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-sm hover:bg-orange-700 transition-colors"
              >
                Criar Meu Treino
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default WorkoutsPage;
