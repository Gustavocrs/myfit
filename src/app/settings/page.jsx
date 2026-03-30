"use client";

import {useState, useContext, useEffect} from "react";
import Header from "@/components/Header";
import {Switch} from "@/components/Switch";
import {Button} from "@/components/Button";
import {Input} from "@/components/Input";
import MuscleGroupsSummary from "@/components/MuscleGroupsSummary";
import {ConfirmDialog} from "@/components/ConfirmDialog";
import {notifySuccess, notifyError} from "@/components/Notify";
import {useConfirmDialog} from "@/hooks/useConfirmDialog";
import {
  FiMoon,
  FiTrash2,
  FiLogOut,
  FiPlusCircle,
  FiEye,
  FiEdit2,
} from "react-icons/fi";
import {AuthContext} from "@/context/AuthContext";
import {ThemeContext} from "@/context/ThemeContext";
import exercisesData from "@/data/exercises.json";
import {
  exercicioPertenceAoGrupo,
  normalizarGruposMusculares,
  obterGruposMuscularesExercicio,
} from "@/utils/gruposMusculares";
import {db} from "@/lib/firebase";
import {deleteDoc, doc, getDoc, setDoc} from "firebase/firestore";

const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombro",
  "Tríceps",
  "Bíceps",
  "Pernas",
  "Panturrilha",
  "Abdômen",
];

const ordenarGruposMusculares = (grupos = []) => {
  const gruposUnicos = [...new Set(grupos)].filter(Boolean);
  const gruposConhecidos = MUSCLE_GROUPS.filter((grupo) =>
    gruposUnicos.includes(grupo),
  );
  const gruposRestantes = gruposUnicos.filter(
    (grupo) => !MUSCLE_GROUPS.includes(grupo),
  );

  return [...gruposConhecidos, ...gruposRestantes];
};

const limparLabelFoco = (label = "") =>
  label.replace(/^👑\s*Foco:\s*/, "").replace(/^Foco:\s*/, "").trim();

const montarLabelFoco = (grupos = []) => grupos.join(" + ");

const montarBadgeTreino = (sections = []) =>
  sections
    .map((section) => `${limparLabelFoco(section.label)} (${section.exercises.length})`)
    .join(" • ");

const obterGruposDaSecao = (section = {}) => {
  return ordenarGruposMusculares(
    normalizarGruposMusculares(limparLabelFoco(section.label)),
  ).filter((grupo) => MUSCLE_GROUPS.includes(grupo));
};

const mapearConfiguracaoDoTreino = (workout = {}) => {
  const selectedExercises = {};
  const areaCounts = {};

  (workout.sections || []).forEach((section) => {
    const gruposDaSecao = obterGruposDaSecao(section);

    gruposDaSecao.forEach((grupo) => {
      selectedExercises[grupo] = selectedExercises[grupo] || [];
    });

    (section.exercises || []).forEach((exercise) => {
      gruposDaSecao.forEach((grupo) => {
        if (!selectedExercises[grupo].includes(exercise.id)) {
          selectedExercises[grupo].push(exercise.id);
        }
      });
    });
  });

  const areas = MUSCLE_GROUPS.filter((grupo) => selectedExercises[grupo]?.length);

  areas.forEach((grupo) => {
    areaCounts[grupo] = selectedExercises[grupo]?.length || 3;
  });

  return {
    areas,
    selectedExercises,
    areaCounts,
  };
};

const construirSecoesTreino = ({
  areas = [],
  selectedExercises = {},
  areaCounts = {},
  generateExercises = false,
  existingSections = [],
}) => {
  return areas.reduce((sections, area) => {
    let selectedForArea = [];
    const matching = exercisesData.filter((exercise) =>
      exercicioPertenceAoGrupo(exercise, area),
    );

    if (selectedExercises?.[area]?.length > 0) {
      const selectedIds = selectedExercises[area];
      selectedForArea = selectedIds
        .map((id) => matching.find((exercise) => exercise.id === id))
        .filter(Boolean);
    } else if (generateExercises && matching.length > 0) {
      const count = areaCounts?.[area] || 3;
      const shuffled = [...matching].sort(() => 0.5 - Math.random());
      selectedForArea = shuffled.slice(0, count);
    } else {
      const existingSection = existingSections.find(
        (section) => limparLabelFoco(section.label) === area,
      );

      if (existingSection?.exercises) {
        selectedForArea = existingSection.exercises;
      }
    }

    if (selectedForArea.length > 0) {
      sections.push({
        label: montarLabelFoco([area]),
        exercises: selectedForArea.map((exercise) => {
          const gruposDoExercicio = ordenarGruposMusculares(
            obterGruposMuscularesExercicio(exercise),
          ).filter((grupo) => MUSCLE_GROUPS.includes(grupo));

          return {
            ...exercise,
            muscle:
              gruposDoExercicio.length > 0
                ? gruposDoExercicio.join(" + ")
                : area,
          };
        }),
      });
    }

    return sections;
  }, []);
};

const SettingsPage = () => {
  const {isDarkMode, toggleDarkMode} = useContext(ThemeContext);
  const [showTodayWorkoutOnly, setShowTodayWorkoutOnly] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutConfig, setWorkoutConfig] = useState({
    day: "A",
    areas: [],
    selectedExercises: {},
    areaCounts: {},
    daysOfWeek: [],
  });
  const {logout, user} = useContext(AuthContext);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [pendingDays, setPendingDays] = useState([]); // Guarda os dias durante a criação
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    const fetchSavedWorkoutsAndSettings = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "workoutPlans", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().plans) {
            setSavedWorkouts(docSnap.data().plans);
          } else {
            setSavedWorkouts([]);
          }

          const settingsRef = doc(db, "userSettings", user.uid);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setShowTodayWorkoutOnly(
              settingsSnap.data().showTodayWorkoutOnly || false,
            );
          }
        } catch (error) {
          console.error("Erro ao buscar dados do Firebase:", error);
        }
      }
    };
    fetchSavedWorkoutsAndSettings();
  }, [user]);

  const handleShowTodayWorkoutOnlyToggle = async () => {
    const newValue = !showTodayWorkoutOnly;
    setShowTodayWorkoutOnly(newValue);
    if (user?.uid) {
      await setDoc(
        doc(db, "userSettings", user.uid),
        {showTodayWorkoutOnly: newValue},
        {merge: true},
      );
    }
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode(user);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleWorkoutConfigChange = (e) => {
    setWorkoutConfig({...workoutConfig, [e.target.name]: e.target.value});
  };

  const toggleArea = (area) => {
    setWorkoutConfig((prev) => {
      const isSelected = prev.areas.includes(area);
      const newAreas = isSelected
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area];

      const newSelectedExercises = {...prev.selectedExercises};
      const newAreaCounts = {...prev.areaCounts};

      if (isSelected) {
        delete newSelectedExercises[area];
        delete newAreaCounts[area];
      } else {
        newAreaCounts[area] = 3; // Padrão de 3 exercícios ao selecionar
      }

      return {
        ...prev,
        areas: newAreas,
        selectedExercises: newSelectedExercises,
        areaCounts: newAreaCounts,
      };
    });
  };

  const handleEditWorkout = (index) => {
    const wk = savedWorkouts[index];
    const {areas, selectedExercises, areaCounts} =
      mapearConfiguracaoDoTreino(wk);

    setWorkoutConfig({
      day: wk.id,
      areas: areas,
      selectedExercises: selectedExercises,
      areaCounts: areaCounts,
      daysOfWeek: wk.daysOfWeek || [],
    });
    setEditingIndex(index);
    setShowWorkoutForm(true);
  };

  const handleAddPendingDay = () => {
    if (!workoutConfig.day || workoutConfig.areas.length === 0) {
      notifyError("Por favor, selecione o dia e pelo menos uma área.");
      return;
    }

    const dayWithNameToAdd = {
      ...workoutConfig,
      name: `Treino ${workoutConfig.day}`,
    };
    setPendingDays([...pendingDays, dayWithNameToAdd]);

    // Auto-avança o select de dias para facilitar a digitação (A -> B -> C...)
    const nextDays = {A: "B", B: "C", C: "D", D: "E", E: "F", F: "A"};
    setWorkoutConfig({
      day: nextDays[workoutConfig.day] || "A",
      areas: [],
      selectedExercises: {},
      areaCounts: {},
      daysOfWeek: [],
    });
  };

  const handleRemovePendingDay = (index) => {
    setPendingDays(pendingDays.filter((_, i) => i !== index));
  };

  const handleEditPendingDay = (index) => {
    const dayToEdit = pendingDays[index];
    setWorkoutConfig(dayToEdit);
    setPendingDays(pendingDays.filter((_, i) => i !== index));
  };

  const handleAreaCountChange = (area, delta) => {
    setWorkoutConfig((prev) => {
      const currentCount = prev.areaCounts?.[area] || 3;
      const newCount = Math.max(1, Math.min(10, currentCount + delta));
      return {
        ...prev,
        areaCounts: {
          ...prev.areaCounts,
          [area]: newCount,
        },
      };
    });
  };

  // Função que gera a Ficha Completa após acumular vários dias
  const handleSavePlan = async (generateExercises = false) => {
    let newDays = [];

    pendingDays.forEach((dayConf) => {
      const sections = construirSecoesTreino({
        areas: dayConf.areas,
        selectedExercises: dayConf.selectedExercises,
        areaCounts: dayConf.areaCounts,
        generateExercises,
      });

      newDays.push({
        id: dayConf.day,
        title: dayConf.name,
        daysOfWeek: dayConf.daysOfWeek || [],
        badge: montarBadgeTreino(sections),
        sections,
      });
    });

    // Mescla inteligente: Substitui treinos com a mesma letra, senão adiciona à lista
    let updatedWorkouts = [...savedWorkouts];
    newDays.forEach((newDay) => {
      const existingIdx = updatedWorkouts.findIndex((w) => w.id === newDay.id);
      if (existingIdx >= 0) {
        updatedWorkouts[existingIdx] = newDay;
      } else {
        updatedWorkouts.push(newDay);
      }
    });

    // Ordena para que a lista fique sempre A, B, C...
    updatedWorkouts.sort((a, b) => a.id.localeCompare(b.id));

    setSavedWorkouts(updatedWorkouts);

    if (user?.uid) {
      try {
        await setDoc(doc(db, "workoutPlans", user.uid), {
          plans: updatedWorkouts,
        });
      } catch (error) {
        console.error("Erro ao salvar no Firebase:", error);
      }
    }

    notifySuccess("Ficha de treino gerada e salva com sucesso!");

    setShowWorkoutForm(false);
    setPendingDays([]);
    setWorkoutConfig({
      day: "A",
      areas: [],
      selectedExercises: {},
      areaCounts: {},
      daysOfWeek: [],
    });
  };

  // Função específica para quando o usuário edita apenas um dia isolado
  const handleSaveSingleDay = async (generateExercises = false) => {
    if (!workoutConfig.day || workoutConfig.areas.length === 0) {
      notifyError("Por favor, selecione o dia e pelo menos uma área.");
      return;
    }

    const sections = construirSecoesTreino({
      areas: workoutConfig.areas,
      selectedExercises: workoutConfig.selectedExercises,
      areaCounts: workoutConfig.areaCounts,
      generateExercises,
      existingSections: savedWorkouts[editingIndex]?.sections || [],
    });

    const newWorkout = {
      id: workoutConfig.day,
      title: `Treino ${workoutConfig.day}`,
      daysOfWeek: workoutConfig.daysOfWeek || [],
      badge: montarBadgeTreino(sections),
      sections,
    };

    let updatedWorkouts = [...savedWorkouts];
    updatedWorkouts[editingIndex] = newWorkout;
    setSavedWorkouts(updatedWorkouts);

    if (user?.uid) {
      try {
        await setDoc(doc(db, "workoutPlans", user.uid), {
          plans: updatedWorkouts,
        });
      } catch (error) {
        console.error("Erro ao salvar no Firebase:", error);
      }
    }

    notifySuccess("Treino atualizado com sucesso!");

    setShowWorkoutForm(false);
    setEditingIndex(null);
    setWorkoutConfig({
      day: "A",
      areas: [],
      selectedExercises: {},
      areaCounts: {},
      daysOfWeek: [],
    });
  };

  const handleDeleteWorkout = async (index) => {
    confirmDialog.openDialog({
      title: "Excluir treino?",
      message:
        "Essa ação remove o treino salvo permanentemente. Deseja continuar?",
      onConfirm: async () => {
        const updated = savedWorkouts.filter((_, i) => i !== index);
        setSavedWorkouts(updated);

        if (user?.uid) {
          try {
            if (updated.length === 0) {
              await deleteDoc(doc(db, "workoutPlans", user.uid));
            } else {
              await setDoc(doc(db, "workoutPlans", user.uid), {
                plans: updated,
              });
            }
            notifySuccess("Treino excluído com sucesso!");
          } catch (error) {
            console.error("Erro ao excluir no Firebase:", error);
            notifyError("Erro ao excluir o treino.");
          }
        }
      },
    });
  };

  // Aggregate data for weekly summary
  const weeklySummary = pendingDays.reduce(
    (acc, day) => {
      day.areas.forEach((area) => {
        acc.areas.add(area);
        const count =
          day.selectedExercises?.[area]?.length || day.areaCounts?.[area] || 0;
        acc.totalCounts[area] = (acc.totalCounts[area] || 0) + count;
      });
      return acc;
    },
    {areas: new Set(), totalCounts: {}},
  );

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 py-3 px-3">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
      >
        {confirmDialog.message}
      </ConfirmDialog>
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />
        <h2 className="text-[1.1rem] font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-4 mt-6">
          Ajustes
        </h2>

        {/* Seção de Aparência */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-4">
          <h3 className="text-[0.8rem] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">
            Aparência
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiMoon
                size={20}
                className="text-slate-600 dark:text-slate-400"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Tema Escuro
              </span>
            </div>
            <Switch checked={isDarkMode} onChange={handleDarkModeToggle} />
          </div>
          <div className="flex items-center justify-between mt-2 border-t border-slate-100 dark:border-slate-700 pt-3">
            <div className="flex items-center gap-3">
              <FiEye size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Ver treinos do dia
              </span>
            </div>
            <Switch
              checked={showTodayWorkoutOnly}
              onChange={handleShowTodayWorkoutOnlyToggle}
            />
          </div>
        </div>

        {/* Seção de Treinos */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-4">
          <h3 className="text-[0.8rem] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">
            Treinos
          </h3>

          {!showWorkoutForm ? (
            <>
              <Button
                wfull
                onClick={() => setShowWorkoutForm(true)}
                className="!justify-start !h-12 !text-base !font-semibold !bg-orange-600 hover:!bg-orange-700 text-white mb-2"
              >
                <FiPlusCircle size={18} className="mr-3" />
                Criar Novo Treino
              </Button>

              {savedWorkouts.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 pt-3 mt-2">
                  <h4 className="text-[0.75rem] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Treinos Salvos
                  </h4>
                  {savedWorkouts.map((wk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[0.95rem]">
                          {wk.title}{" "}
                          <span className="text-orange-600 ml-1">
                            ({wk.id})
                          </span>
                        </span>
                        <span className="text-[0.8rem] text-slate-500 dark:text-slate-400 font-medium">
                          {wk.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditWorkout(idx)}
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-slate-500 dark:text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(idx)}
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-slate-500 dark:text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 dark:border-slate-700 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="select"
                  name="day"
                  label="Identificador (Dia)"
                  value={workoutConfig.day}
                  onChange={handleWorkoutConfigChange}
                  data={["A", "B", "C", "D", "E", "F"]}
                />
                <Input
                  type="multiselect"
                  name="daysOfWeek"
                  label="Dias da Semana"
                  placeholder="Selecione..."
                  data={[
                    {label: "Domingo", value: "0"},
                    {label: "Segunda", value: "1"},
                    {label: "Terça", value: "2"},
                    {label: "Quarta", value: "3"},
                    {label: "Quinta", value: "4"},
                    {label: "Sexta", value: "5"},
                    {label: "Sábado", value: "6"},
                  ]}
                  value={workoutConfig.daysOfWeek || []}
                  onChange={(e) => {
                    setWorkoutConfig((prev) => ({
                      ...prev,
                      daysOfWeek: e.target.value,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-slate-700 dark:text-slate-300">
                  Áreas Focadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((area) => {
                    const isSelected = workoutConfig.areas.includes(area);
                    const hasManualSelection =
                      workoutConfig.selectedExercises?.[area]?.length > 0;

                    return (
                      <div
                        key={area}
                        className="flex flex-col items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => toggleArea(area)}
                          className={`px-3 py-1.5 text-[0.8rem] font-semibold rounded-full border transition-colors ${
                            isSelected
                              ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                              : "bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-600 dark:text-slate-300 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                          }`}
                        >
                          {area}
                        </button>
                        {isSelected && !hasManualSelection && (
                          <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-1 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleAreaCountChange(area, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors active:scale-90"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-slate-900 dark:text-slate-100 text-sm font-bold">
                              {workoutConfig.areaCounts?.[area] || 3}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAreaCountChange(area, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {workoutConfig.areas.length > 0 && (
                <div className="flex flex-col gap-3 mt-3">
                  {workoutConfig.areas.map((area) => {
                    const options = exercisesData
                      .filter((ex) => exercicioPertenceAoGrupo(ex, area))
                      .map((ex) => ({label: ex.name, value: ex.id}));
                    return (
                      <Input
                        key={area}
                        type="autocomplete"
                        name={`exercises_${area}`}
                        label={`Exercícios de ${area} (Opcional)`}
                        placeholder="Pesquise, selecione ou deixe vazio p/ sortear"
                        data={options}
                        multiple
                        value={workoutConfig.selectedExercises?.[area] || []}
                        onChange={(e) => {
                          setWorkoutConfig((prev) => ({
                            ...prev,
                            selectedExercises: {
                              ...prev.selectedExercises,
                              [area]: e.target.value,
                            },
                          }));
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {editingIndex !== null ? (
                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    wfull
                    onClick={() => handleSaveSingleDay(true)}
                    className="!bg-orange-600 hover:!bg-orange-700 text-white !h-12"
                  >
                    Regerar Exercícios (Automático)
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowWorkoutForm(false);
                        setEditingIndex(null);
                        setWorkoutConfig({
                          day: "A",
                          areas: [],
                          selectedExercises: {},
                          areaCounts: {},
                          daysOfWeek: [],
                        });
                      }}
                      className="flex-1 !h-12"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleSaveSingleDay(false)}
                      className="flex-1 !bg-slate-900 hover:!bg-slate-800 text-white !h-12"
                    >
                      Salvar Edição
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <Button
                    variant="secondary"
                    wfull
                    onClick={handleAddPendingDay}
                    className="!h-12 border-dashed border-2 border-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    + Adicionar
                  </Button>

                  {pendingDays.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                      {/* Layout em duas colunas: Dias e Resumo de Grupos */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Coluna 1: Lista de Dias */}
                        <div>
                          <h4 className="text-[0.8rem] font-bold text-slate-500 uppercase mb-2">
                            Dias Adicionados
                          </h4>
                          <div className="flex flex-col gap-2">
                            {pendingDays.map((pd, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-700"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[0.85rem]">
                                    {pd.name}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <button
                                    onClick={() => handleEditPendingDay(i)}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-orange-500 transition-colors"
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleRemovePendingDay(i)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Coluna 2: Resumo de Grupos Musculares */}

                        <div>
                          <h4 className="text-[0.8rem] font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">
                            Grupos Musculares
                          </h4>

                          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                            <MuscleGroupsSummary
                              areas={Array.from(weeklySummary.areas)}
                              totalCounts={weeklySummary.totalCounts}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowWorkoutForm(false);
                        setPendingDays([]);
                        setWorkoutConfig({
                          day: "A",
                          areas: [],
                          selectedExercises: {},
                          areaCounts: {},
                          daysOfWeek: [],
                        });
                      }}
                      className="flex-1 !h-12"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleSavePlan(true)}
                      disabled={pendingDays.length === 0}
                      className="flex-1 !bg-orange-600 hover:!bg-orange-700 text-white !h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gerar/Salvar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seção de Gerenciamento de Dados */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
          <h3 className="text-[0.8rem] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
            Gerenciamento
          </h3>
          <Button
            variant="error"
            wfull
            onClick={handleLogout}
            className="!justify-start !h-12 !text-base !font-semibold"
          >
            <FiLogOut size={18} className="mr-3" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
