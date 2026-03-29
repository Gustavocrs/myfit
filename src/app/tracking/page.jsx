"use client";

import {useState} from "react";
import Header from "@/components/Header";
import {FiSave, FiCamera, FiActivity, FiSliders} from "react-icons/fi";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";

const TrackingPage = () => {
  const [activeTab, setActiveTab] = useState("bio");
  const [photoPreview, setPhotoPreview] = useState(null);

  // Gerenciamento de Estado para os formulários
  const [bioData, setBioData] = useState({
    peso: "",
    massaMuscular: "",
    gorduraCorporal: "",
    gorduraVisceral: "",
  });

  const [medidasData, setMedidasData] = useState({
    torax: "",
    cintura: "",
    abdomen: "",
    quadril: "",
    bracoDir: "",
    bracoEsq: "",
    coxaDir: "",
    coxaEsq: "",
    pantDir: "",
    pantEsq: "",
  });

  const handleBioChange = (e) => {
    setBioData({...bioData, [e.target.name]: e.target.value});
  };

  const handleMedidasChange = (e) => {
    setMedidasData({...medidasData, [e.target.name]: e.target.value});
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-3 px-3">
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        <h2 className="text-[1.1rem] font-extrabold text-slate-800 uppercase mb-4 mt-2">
          Evolução
        </h2>

        {/* TABS DE NAVEGAÇÃO INTERNA */}
        <div className="flex bg-slate-200 p-1 rounded-lg mb-6 shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveTab("bio")}
            className={`flex-1 min-w-[100px] py-2 text-[0.8rem] uppercase font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === "bio" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <FiActivity size={16} /> Bio
          </button>
          <button
            onClick={() => setActiveTab("medidas")}
            className={`flex-1 min-w-[100px] py-2 text-[0.8rem] uppercase font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === "medidas" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <FiSliders size={16} /> Medidas
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex-1 min-w-[100px] py-2 text-[0.8rem] uppercase font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === "photos" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <FiCamera size={16} /> Fotos
          </button>
        </div>

        {/* CONTEÚDO: BIOIMPEDÂNCIA */}
        {activeTab === "bio" && (
          <form className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="peso"
                value={bioData.peso}
                onChange={handleBioChange}
                label="Peso (kg)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="massaMuscular"
                value={bioData.massaMuscular}
                onChange={handleBioChange}
                label="Massa Musc. (kg)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="gorduraCorporal"
                value={bioData.gorduraCorporal}
                onChange={handleBioChange}
                label="Gordura Corp. (%)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="gorduraVisceral"
                value={bioData.gorduraVisceral}
                onChange={handleBioChange}
                label="Gordura Visceral"
                type="number"
                placeholder="Ex: 4"
              />
            </div>

            <Button
              wfull
              className="mt-2 !bg-orange-600 hover:!bg-orange-700 text-white uppercase tracking-wide"
            >
              <FiSave size={18} className="mr-2" /> Salvar Bioimpedância
            </Button>
          </form>
        )}

        {/* CONTEÚDO: MEDIDAS CORPORAIS */}
        {activeTab === "medidas" && (
          <form className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="torax"
                value={medidasData.torax}
                onChange={handleMedidasChange}
                label="Tórax (cm)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="cintura"
                value={medidasData.cintura}
                onChange={handleMedidasChange}
                label="Cintura (cm)"
                type="number"
                placeholder="00.0"
              />

              <Input
                name="abdomen"
                value={medidasData.abdomen}
                onChange={handleMedidasChange}
                label="Abdômen (cm)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="quadril"
                value={medidasData.quadril}
                onChange={handleMedidasChange}
                label="Quadril (cm)"
                type="number"
                placeholder="00.0"
              />

              <Input
                name="bracoDir"
                value={medidasData.bracoDir}
                onChange={handleMedidasChange}
                label="Braço Dir. (cm)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="bracoEsq"
                value={medidasData.bracoEsq}
                onChange={handleMedidasChange}
                label="Braço Esq. (cm)"
                type="number"
                placeholder="00.0"
              />

              <Input
                name="coxaDir"
                value={medidasData.coxaDir}
                onChange={handleMedidasChange}
                label="Coxa Dir. (cm)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="coxaEsq"
                value={medidasData.coxaEsq}
                onChange={handleMedidasChange}
                label="Coxa Esq. (cm)"
                type="number"
                placeholder="00.0"
              />

              <Input
                name="pantDir"
                value={medidasData.pantDir}
                onChange={handleMedidasChange}
                label="Pant. Dir. (cm)"
                type="number"
                placeholder="00.0"
              />
              <Input
                name="pantEsq"
                value={medidasData.pantEsq}
                onChange={handleMedidasChange}
                label="Pant. Esq. (cm)"
                type="number"
                placeholder="00.0"
              />
            </div>

            <Button
              wfull
              className="mt-2 !bg-orange-600 hover:!bg-orange-700 text-white uppercase tracking-wide"
            >
              <FiSave size={18} className="mr-2" /> Salvar Medidas
            </Button>
          </form>
        )}

        {/* CONTEÚDO: FOTOS */}
        {activeTab === "photos" && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <p className="text-[0.85rem] text-slate-500 font-medium text-center">
              Faça o upload do seu shape atual para comparar sua evolução ao
              longo das semanas.
            </p>

            <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors group">
              <FiCamera
                size={32}
                className="text-slate-400 group-hover:text-orange-500 transition-colors"
              />
              <span className="text-[0.9rem] font-bold text-slate-600 group-hover:text-orange-600 transition-colors">
                Tocar para abrir a câmera
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            {photoPreview && (
              <div className="mt-2 flex flex-col gap-3">
                <span className="text-[0.8rem] font-extrabold text-slate-800 uppercase pl-1">
                  Pré-visualização:
                </span>
                <img
                  src={photoPreview}
                  alt="Shape atual"
                  className="w-full h-auto object-cover rounded-lg shadow-sm border border-slate-200"
                />
                <Button
                  wfull
                  className="mt-2 !bg-slate-900 hover:!bg-slate-800 text-white uppercase tracking-wide"
                >
                  <FiSave size={18} className="mr-2" /> Salvar Foto
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default TrackingPage;
