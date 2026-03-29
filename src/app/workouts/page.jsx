"use client";

import {useState, useEffect, useContext} from "react";
import Header from "@/components/Header";
import DayDivider from "@/components/DayDivider";
import SectionLabel from "@/components/SectionLabel";
import ExerciseCard from "@/components/ExerciseCard";
import Loading from "@/components/Loading";
import {AuthContext} from "@/context/AuthContext";
import {db} from "@/lib/firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

// A constante foi movida para fora para ser usada como estado inicial.
// No futuro, isso virá de uma chamada de API para o Firebase.
import {WORKOUT_DATA as INITIAL_WORKOUT_DATA} from "@/data/mockWorkouts";

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const {user} = useContext(AuthContext);

  // Simula o carregamento dos dados do treino ao montar o componente.
  useEffect(() => {
    const fetchWorkouts = async () => {
      const showAllSetting =
        localStorage.getItem("myfit_settings_show_all_workouts") === "true";

      if (user?.uid) {
        try {
          const docRef = doc(db, "workoutPlans", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().plans?.length > 0) {
            setWorkouts(docSnap.data().plans);
          } else {
            setWorkouts(INITIAL_WORKOUT_DATA);
          }
        } catch (error) {
          console.error("Erro ao buscar treinos do Firebase:", error);
          setWorkouts(INITIAL_WORKOUT_DATA);
        }
      } else {
        setWorkouts(INITIAL_WORKOUT_DATA);
      }

      setShowAllWorkouts(showAllSetting);
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
      } catch (error) {
        console.error("Erro ao salvar séries no Firebase:", error);
      }
    }
  };

  if (loading) {
    return <Loading message="Carregando treinos..." />;
  }

  // Filtra apenas o treino do dia atual
  const todayWorkout = workouts.find((day) => day.id === activeWorkoutId);

  // Função auxiliar para renderizar a estrutura de um treino
  const renderWorkout = (workout) => (
    <div key={workout.id} className="mb-8">
      <DayDivider title={workout.title} badge={workout.badge} />

      {workout.sections.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          <SectionLabel text={section.label} />

          {section.exercises.map((ex, exIdx) => (
            <ExerciseCard
              key={exIdx}
              name={ex.name}
              meta={ex.meta || ex.defaultMeta}
              muscle={ex.muscle || ex.muscleGroup}
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
    <main className="min-h-screen bg-slate-100 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        {showAllWorkouts && workouts.length > 0 ? (
          workouts.map((workout) => renderWorkout(workout))
        ) : todayWorkout ? (
          renderWorkout(todayWorkout)
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
