"use client";

import {useState, useContext, useEffect} from "react";
import Header from "@/components/Header";
import {Switch} from "@/components/Switch";
import {Button} from "@/components/Button";
import {Input} from "@/components/Input";
import {
  FiMoon,
  FiTrash2,
  FiLogOut,
  FiPlusCircle,
  FiEye,
  FiEdit2,
} from "react-icons/fi";
import {AuthContext} from "@/context/AuthContext";
import exercisesData from "@/data/exercises.json";
import {db} from "@/lib/firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombro",
  "Tríceps",
  "Bíceps",
  "Perna",
  "Panturrilha",
  "Abdômen",
];

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutConfig, setWorkoutConfig] = useState({
    name: "",
    day: "A",
    areas: [],
    areaCounts: {},
  });
  const {logout, user} = useContext(AuthContext);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [pendingDays, setPendingDays] = useState([]); // Guarda os dias durante a criação

  useEffect(() => {
    const savedSetting = localStorage.getItem(
      "myfit_settings_show_all_workouts",
    );
    setShowAllWorkouts(savedSetting === "true");

    const fetchSavedWorkouts = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "workoutPlans", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().plans) {
            setSavedWorkouts(docSnap.data().plans);
          } else {
            setSavedWorkouts([]);
          }
        } catch (error) {
          console.error("Erro ao buscar treinos do Firebase:", error);
        }
      }
    };
    fetchSavedWorkouts();
  }, [user]);

  const handleShowAllWorkoutsToggle = () => {
    const newValue = !showAllWorkouts;
    setShowAllWorkouts(newValue);
    localStorage.setItem("myfit_settings_show_all_workouts", String(newValue));
  };

  // Mock handlers for now
  const handleClearData = async () => {
    console.log("Limpando dados...");
    setSavedWorkouts([]);
    if (user?.uid) {
      try {
        await setDoc(doc(db, "workoutPlans", user.uid), {plans: []});
      } catch (error) {
        console.error("Erro ao limpar no Firebase:", error);
      }
    }
    alert("Dados locais limpos com sucesso!");
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

      const newAreaCounts = {...prev.areaCounts};
      if (isSelected) {
        delete newAreaCounts[area];
      } else {
        newAreaCounts[area] = 4; // Padrão de 4 exercícios ao selecionar
      }

      return {
        ...prev,
        areas: newAreas,
        areaCounts: newAreaCounts,
      };
    });
  };

  const handleEditWorkout = (index) => {
    const wk = savedWorkouts[index];
    const areas = wk.badge.split(" • ");
    const areaCounts = {};
    areas.forEach((area) => {
      const sec = wk.sections?.find((s) => s.label === `Foco: ${area}`);
      areaCounts[area] = sec?.exercises?.length || 4;
    });

    setWorkoutConfig({
      name: wk.title,
      day: wk.id,
      areas: areas,
      areaCounts: areaCounts,
    });
    setEditingIndex(index);
    setShowWorkoutForm(true);
  };

  const handleAddPendingDay = () => {
    if (
      !workoutConfig.name ||
      !workoutConfig.day ||
      workoutConfig.areas.length === 0
    ) {
      alert(
        "Por favor, preencha o nome, selecione o dia e pelo menos uma área.",
      );
      return;
    }

    setPendingDays([...pendingDays, workoutConfig]);

    // Auto-avança o select de dias para facilitar a digitação (A -> B -> C...)
    const nextDays = {A: "B", B: "C", C: "D", D: "E", E: "F", F: "A"};
    setWorkoutConfig({
      name: "",
      day: nextDays[workoutConfig.day] || "A",
      areas: [],
      areaCounts: {},
    });
  };

  const handleRemovePendingDay = (index) => {
    setPendingDays(pendingDays.filter((_, i) => i !== index));
  };

  // Função que gera a Ficha Completa após acumular vários dias
  const handleSavePlan = async (generateExercises = false) => {
    let newDays = [];

    pendingDays.forEach((dayConf) => {
      let sections = [];
      if (generateExercises) {
        dayConf.areas.forEach((area) => {
          const matching = exercisesData.filter(
            (ex) => ex.muscleGroup === area || ex.muscle === area,
          );
          if (matching.length > 0) {
            const count = dayConf.areaCounts?.[area] || 4;
            const shuffled = [...matching].sort(() => 0.5 - Math.random());
            sections.push({
              label: `Foco: ${area}`,
              exercises: shuffled.slice(0, count),
            });
          }
        });
      }

      newDays.push({
        id: dayConf.day,
        title: dayConf.name,
        badge: dayConf.areas.join(" • "),
        sections: sections,
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

    alert("Ficha de treino gerada e salva com sucesso!");

    setShowWorkoutForm(false);
    setPendingDays([]);
    setWorkoutConfig({name: "", day: "A", areas: [], areaCounts: {}});
  };

  // Função específica para quando o usuário edita apenas um dia isolado
  const handleSaveSingleDay = async (generateExercises = false) => {
    if (
      !workoutConfig.name ||
      !workoutConfig.day ||
      workoutConfig.areas.length === 0
    ) {
      alert(
        "Por favor, preencha o nome, selecione o dia e pelo menos uma área.",
      );
      return;
    }

    let sections = savedWorkouts[editingIndex].sections || [];

    if (generateExercises) {
      sections = [];
      workoutConfig.areas.forEach((area) => {
        const matching = exercisesData.filter(
          (ex) => ex.muscleGroup === area || ex.muscle === area,
        );
        if (matching.length > 0) {
          const count = workoutConfig.areaCounts?.[area] || 4;
          const shuffled = [...matching].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, count);
          sections.push({
            label: `Foco: ${area}`,
            exercises: selected,
          });
        }
      });
    }

    const newWorkout = {
      id: workoutConfig.day,
      title: workoutConfig.name,
      badge: workoutConfig.areas.join(" • "),
      sections: sections,
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

    alert("Treino atualizado com sucesso!");

    setShowWorkoutForm(false);
    setEditingIndex(null);
    setWorkoutConfig({name: "", day: "A", areas: [], areaCounts: {}});
  };

  const handleDeleteWorkout = async (index) => {
    if (window.confirm("Tem certeza que deseja excluir este treino?")) {
      const updated = savedWorkouts.filter((_, i) => i !== index);
      setSavedWorkouts(updated);
      if (user?.uid) {
        try {
          await setDoc(doc(db, "workoutPlans", user.uid), {plans: updated});
        } catch (error) {
          console.error("Erro ao excluir no Firebase:", error);
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />
        <h2 className="text-[1.1rem] font-extrabold text-slate-800 uppercase mb-4 mt-6">
          Ajustes
        </h2>

        {/* Seção de Aparência */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
          <h3 className="text-[0.8rem] font-bold text-slate-400 uppercase mb-3">
            Aparência
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiMoon size={20} className="text-slate-600" />
              <span className="font-semibold text-slate-800">Tema Escuro</span>
            </div>
            <Switch
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
          </div>
          <div className="flex items-center justify-between mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-3">
              <FiEye size={20} className="text-slate-600" />
              <span className="font-semibold text-slate-800">
                Ver todos os treinos
              </span>
            </div>
            <Switch
              checked={showAllWorkouts}
              onChange={handleShowAllWorkoutsToggle}
            />
          </div>
        </div>

        {/* Seção de Treinos */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
          <h3 className="text-[0.8rem] font-bold text-slate-400 uppercase mb-3">
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
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 mt-2">
                  <h4 className="text-[0.75rem] font-bold text-slate-400 uppercase">
                    Treinos Salvos
                  </h4>
                  {savedWorkouts.map((wk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[0.95rem]">
                          {wk.title}{" "}
                          <span className="text-orange-600 ml-1">
                            ({wk.id})
                          </span>
                        </span>
                        <span className="text-[0.8rem] text-slate-500 font-medium">
                          {wk.badge}
                        </span>
                        <span className="text-[0.75rem] text-slate-400 font-bold mt-1">
                          {wk.sections?.reduce(
                            (acc, sec) => acc + sec.exercises.length,
                            0,
                          ) || 0}{" "}
                          exercícios
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditWorkout(idx)}
                          className="p-2 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(idx)}
                          className="p-2 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
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
            <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Input
                type="text"
                name="name"
                label="Nome do Treino"
                value={workoutConfig.name}
                onChange={handleWorkoutConfigChange}
                placeholder="Ex: Treino A - Superior"
              />
              <Input
                type="select"
                name="day"
                label="Identificador (Dia)"
                value={workoutConfig.day}
                onChange={handleWorkoutConfigChange}
                data={["A", "B", "C", "D", "E", "F"]}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-slate-700">
                  Áreas Focadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((area) => {
                    const isSelected = workoutConfig.areas.includes(area);
                    return isSelected ? (
                      <div
                        key={area}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 border border-orange-600 rounded-full shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => toggleArea(area)}
                          className="text-[0.8rem] font-semibold text-orange-800 hover:text-orange-900"
                        >
                          {area}
                        </button>
                        <div className="h-4 w-[1px] bg-orange-300"></div>
                        <div className="flex items-center gap-1">
                          <span className="text-[0.7rem] text-orange-700 font-bold">
                            Qtd:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={workoutConfig.areaCounts?.[area] || 4}
                            onChange={(e) =>
                              setWorkoutConfig((prev) => ({
                                ...prev,
                                areaCounts: {
                                  ...prev.areaCounts,
                                  [area]: parseInt(e.target.value) || 1,
                                },
                              }))
                            }
                            className="w-10 h-6 text-center text-[0.8rem] font-bold rounded-md bg-white border border-orange-300 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className="px-3 py-1.5 text-[0.8rem] font-semibold rounded-full border transition-colors bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                          name: "",
                          day: "A",
                          areas: [],
                          areaCounts: {},
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
                    className="!h-12 border-dashed border-2 border-slate-300"
                  >
                    + Adicionar
                  </Button>

                  {pendingDays.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 border-t border-slate-100 pt-3">
                      <h4 className="text-[0.8rem] font-bold text-slate-500 uppercase">
                        Dias Adicionados
                      </h4>
                      {pendingDays.map((pd, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-200"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-[0.85rem]">
                              {pd.day} - {pd.name}
                            </span>
                            <span className="text-[0.75rem] text-slate-500 font-medium">
                              {pd.areas.join(" • ")}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemovePendingDay(i)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowWorkoutForm(false);
                        setPendingDays([]);
                        setWorkoutConfig({
                          name: "",
                          day: "A",
                          areas: [],
                          areaCounts: {},
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
                      Gerar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Seção de Gerenciamento de Dados */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
          <h3 className="text-[0.8rem] font-bold text-slate-400 uppercase mb-2">
            Gerenciamento
          </h3>
          <Button
            variant="secondary"
            wfull
            onClick={handleClearData}
            className="!justify-start !h-12 !text-base !font-semibold"
          >
            <FiTrash2 size={18} className="mr-3" />
            Limpar Dados Locais
          </Button>
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
