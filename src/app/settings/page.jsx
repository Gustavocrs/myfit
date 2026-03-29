"use client";

import {useState, useContext, useEffect} from "react";
import Header from "@/components/Header";
import {Switch} from "@/components/Switch";
import {Button} from "@/components/Button";
import {Input} from "@/components/Input";
import {FiMoon, FiTrash2, FiLogOut, FiPlusCircle, FiEye} from "react-icons/fi";
import {generateWorkout} from "@/utils/generateWorkout";
import {useRouter} from "next/navigation";
import {AuthContext} from "@/context/AuthContext";

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutConfig, setWorkoutConfig] = useState({
    experience: "",
    goal: "",
    days: "",
  });
  const router = useRouter();
  const {logout} = useContext(AuthContext);

  useEffect(() => {
    const savedSetting = localStorage.getItem(
      "myfit_settings_show_all_workouts",
    );
    setShowAllWorkouts(savedSetting === "true");
  }, []);

  const handleShowAllWorkoutsToggle = () => {
    const newValue = !showAllWorkouts;
    setShowAllWorkouts(newValue);
    localStorage.setItem("myfit_settings_show_all_workouts", String(newValue));
  };

  // Mock handlers for now
  const handleClearData = () => {
    console.log("Limpando dados...");
    localStorage.removeItem("myfit_workout_plan");
    alert("Dados locais limpos com sucesso!");
    // A lógica para limpar o localStorage/IndexedDB será implementada aqui.
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleWorkoutConfigChange = (e) => {
    setWorkoutConfig({...workoutConfig, [e.target.name]: e.target.value});
  };

  const handleGenerateWorkout = () => {
    if (
      !workoutConfig.experience ||
      !workoutConfig.goal ||
      !workoutConfig.days
    ) {
      alert("Por favor, preencha todos os campos para gerar o treino.");
      return;
    }

    // Busca os dados de bioimpedância (caso existam) para injetar na lógica
    const savedBio = localStorage.getItem("myfit_bio_data");
    const trackingData = savedBio ? JSON.parse(savedBio) : {};

    const newWorkoutPlan = generateWorkout(workoutConfig, trackingData);

    localStorage.setItem("myfit_workout_plan", JSON.stringify(newWorkoutPlan));
    // Força a exibição de todos os treinos após a geração para melhor UX
    localStorage.setItem("myfit_settings_show_all_workouts", "true");

    setShowWorkoutForm(false);

    router.push("/workouts"); // Redireciona o usuário para ver a nova grade
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
            <Button
              wfull
              onClick={() => setShowWorkoutForm(true)}
              className="!justify-start !h-12 !text-base !font-semibold !bg-orange-600 hover:!bg-orange-700 text-white"
            >
              <FiPlusCircle size={18} className="mr-3" />
              Criar Novo Treino
            </Button>
          ) : (
            <div className="flex flex-col gap-4 mt-2 border-t border-slate-100 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Input
                type="select"
                name="experience"
                label="Nível de Experiência"
                value={workoutConfig.experience}
                onChange={handleWorkoutConfigChange}
                data={["Iniciante", "Intermediário", "Avançado"]}
              />
              <Input
                type="select"
                name="goal"
                label="Objetivo Principal"
                value={workoutConfig.goal}
                onChange={handleWorkoutConfigChange}
                data={["Hipertrofia", "Emagrecimento", "Resistência", "Força"]}
              />
              <Input
                type="select"
                name="days"
                label="Dias disponíveis na semana"
                value={workoutConfig.days}
                onChange={handleWorkoutConfigChange}
                data={["3 dias", "4 dias", "5 dias", "6 dias"]}
              />

              <div className="flex gap-3 mt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowWorkoutForm(false)}
                  className="flex-1 !h-12"
                >
                  Cancelar
                </Button>
                <Button
                  wfull
                  onClick={handleGenerateWorkout}
                  className="flex-1 !bg-orange-600 hover:!bg-orange-700 text-white !h-12"
                >
                  Gerar Treino
                </Button>
              </div>
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
