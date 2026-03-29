"use client";

import {useState, useEffect} from "react";
import Header from "@/components/Header";
import DayDivider from "@/components/DayDivider";
import SectionLabel from "@/components/SectionLabel";
import ExerciseCard from "@/components/ExerciseCard";
import Loading from "@/components/Loading";

// A constante foi movida para fora para ser usada como estado inicial.
// No futuro, isso virá de uma chamada de API para o Firebase.
import {WORKOUT_DATA as INITIAL_WORKOUT_DATA} from "@/data/mockWorkouts";

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);

  // Simula o carregamento dos dados do treino ao montar o componente.
  useEffect(() => {
    setTimeout(() => {
      // Tenta buscar o treino gerado dinamicamente no Settings
      const savedWorkout = localStorage.getItem("myfit_workout_plan");

      if (savedWorkout) {
        setWorkouts(JSON.parse(savedWorkout));
      } else {
        // Fallback: Se não existe treino criado, carrega o mock
        setWorkouts(INITIAL_WORKOUT_DATA);
      }

      // Lógica de mapeamento dos dias da semana (0 = Domingo ... 6 = Sábado)
      const today = new Date().getDay();
      let todayWorkoutId = null;

      switch (today) {
        case 1: // Segunda
        case 4: // Quinta
          todayWorkoutId = "A";
          break;
        case 2: // Terça
        case 5: // Sexta
          todayWorkoutId = "B";
          break;
        case 3: // Quarta
          todayWorkoutId = "C";
          break;
      }

      setActiveWorkoutId(todayWorkoutId);
      setLoading(false);
    }, 500); // Atraso de 500ms para simular uma chamada de rede.
  }, []);

  /**
   * Atualiza o meta (séries/repetições) de um exercício específico no estado.
   * @param {string} dayId - O ID do dia de treino (ex: 'A').
   * @param {number} sectionIndex - O índice da seção.
   * @param {number} exerciseIndex - O índice do exercício.
   * @param {string} newMeta - O novo valor para o meta.
   */
  const handleMetaChange = (dayId, sectionIndex, exerciseIndex, newMeta) => {
    setWorkouts((currentWorkouts) => {
      const updatedWorkouts = currentWorkouts.map((day) => {
        if (day.id === dayId) {
          const updatedSections = day.sections.map((section, sIdx) => {
            if (sIdx === sectionIndex) {
              const updatedExercises = section.exercises.map(
                (exercise, eIdx) => {
                  if (eIdx === exerciseIndex) {
                    // Em uma aplicação real, aqui seria o local para disparar
                    // uma função que salva a alteração no Firebase.
                    const updatedEx = {...exercise, meta: newMeta};
                    // Atualiza o local storage para refletir as edições de séries feitas pelo usuário
                    const currentStorage = JSON.parse(
                      localStorage.getItem("myfit_workout_plan") || "[]",
                    );
                    // Em um cenário real com ID único de usuário iteraríamos sobre a store.

                    return {...exercise, meta: newMeta};
                  }
                  return exercise;
                },
              );
              return {...section, exercises: updatedExercises};
            }
            return section;
          });
          return {...day, sections: updatedSections};
        }
        return day;
      });
      return updatedWorkouts;
    });
  };

  if (loading) {
    return <Loading message="Carregando treinos..." />;
  }

  // Filtra apenas o treino do dia atual
  const todayWorkout = workouts.find((day) => day.id === activeWorkoutId);

  return (
    <main className="min-h-screen bg-slate-100 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        {todayWorkout ? (
          <div key={todayWorkout.id}>
            <DayDivider title={todayWorkout.title} badge={todayWorkout.badge} />

            {todayWorkout.sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <SectionLabel text={section.label} />

                {section.exercises.map((ex, exIdx) => (
                  <ExerciseCard
                    key={exIdx}
                    name={ex.name}
                    meta={ex.meta}
                    muscle={ex.muscle}
                    rest={ex.rest}
                    detail={ex.detail}
                    color={ex.color}
                    onMetaChange={(newMeta) =>
                      handleMetaChange(
                        todayWorkout.id,
                        sectionIdx,
                        exIdx,
                        newMeta,
                      )
                    }
                  >
                    {ex.instruction}
                  </ExerciseCard>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Dia de Descanso! 🛌
            </h3>
            <p className="text-[0.9rem] text-slate-500 font-medium">
              Você não tem treinos programados para hoje. Aproveite para
              recuperar as energias ou faça um cardio leve.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default WorkoutsPage;
