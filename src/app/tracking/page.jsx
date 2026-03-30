"use client";

import {useState, useEffect, useContext} from "react";
import Header from "@/components/Header";
import AlertDialog from "@/components/AlertDialog";
import {
  FiSave,
  FiCamera,
  FiActivity,
  FiSliders,
  FiPlusCircle,
  FiArrowLeft,
  FiTrash2,
} from "react-icons/fi";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button";
import {notifySuccess, notifyError, notifyWarn} from "@/components/Notify";
import {useConfirmDialog} from "@/hooks/useConfirmDialog";
import {useEscapeKey} from "@/hooks/useEscapeKey";
import {AuthContext} from "@/context/AuthContext";
import {ThemeContext} from "@/context/ThemeContext";
import {db} from "@/lib/firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

const TrackingPage = () => {
  const [activeTab, setActiveTab] = useState("bio");
  const [evaluations, setEvaluations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEval, setCurrentEval] = useState(null);
  const {user} = useContext(AuthContext);
  const {syncWithFirebase} = useContext(ThemeContext);
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    const fetchEvals = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "evaluations", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().history) {
            setEvaluations(docSnap.data().history);
          }
          const settingsRef = doc(db, "userSettings", user.uid);
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            if (settingsSnap.data().isDarkMode) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        } catch (error) {
          console.error("Erro ao buscar avaliações:", error);
        }
      }
    };
    fetchEvals();
  }, [user]);

  const handleNewEval = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString("pt-BR");
    setCurrentEval({
      id: Date.now().toString(),
      date: dateStr,
      bio: {
        peso: "",
        massaMuscular: "",
        gorduraCorporal: "",
        gorduraVisceral: "",
      },
      medidas: {
        ombro: "",
        torax: "",
        cintura: "",
        abdomen: "",
        quadril: "",
        bracoDir: "",
        bracoEsq: "",
        antebracoDir: "",
        antebracoEsq: "",
        coxaDir: "",
        coxaEsq: "",
        pantDir: "",
        pantEsq: "",
      },
      photos: [], // Agora um array para múltiplas fotos
    });
    setIsEditing(true);
    setActiveTab("bio");
  };

  const handleEditEval = (ev) => {
    setCurrentEval(ev);
    setIsEditing(true);
    setActiveTab("bio");
  };

  const handleNestedChange = (category, field, value) => {
    setCurrentEval((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSaveEval = async () => {
    if (user?.uid) {
      try {
        const evalData = {...currentEval};

        // 1. Separa os arquivos novos das URLs existentes
        const newFiles = evalData.photos.filter((p) => p instanceof File);
        const existingUrls = evalData.photos.filter(
          (p) => typeof p === "string",
        );

        let uploadedUrls = [];
        if (newFiles.length > 0) {
          const formData = new FormData();
          newFiles.forEach((file) => formData.append("files", file));

          // 2. Envia os novos arquivos para a API de upload
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || "Falha no upload das imagens.");
          }
          uploadedUrls = result.urls;
        }

        // 3. Combina as URLs antigas e as novas para salvar no DB
        evalData.photos = [...existingUrls, ...uploadedUrls];

        // 4. Atualiza o histórico de avaliações
        const existingIdx = evaluations.findIndex((e) => e.id === evalData.id);
        let updatedHistory = [...evaluations];
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = evalData;
        } else {
          updatedHistory.unshift(evalData);
        }
        updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        await setDoc(
          doc(db, "evaluations", user.uid),
          {history: updatedHistory},
          {merge: true},
        );

        setEvaluations(updatedHistory);
        notifySuccess("Avaliação salva com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        notifyError(error.message || "Erro ao salvar a avaliação.");
      }
    } else {
      notifyWarn("Você precisa estar logado para salvar.");
    }

    setIsEditing(false);
    setCurrentEval(null);
  };

  const handleDeleteEval = (id, e) => {
    e.stopPropagation(); // Evita abrir o modo de edição ao clicar na lixeira
    confirmDialog.openAlert(async () => {
      try {
        const updated = evaluations.filter((ev) => ev.id !== id);
        if (user?.uid) {
          await setDoc(doc(db, "evaluations", user.uid), {
            history: updated,
          });
        }
        setEvaluations(updated);
        notifySuccess("Avaliação excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        notifyError("Erro ao excluir a avaliação.");
      }
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setCurrentEval((prev) => ({
        ...prev,
        // Adiciona os File objects diretamente ao estado
        photos: [...(prev.photos || []), ...files],
      }));
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    if (!currentEval) return;

    setCurrentEval((prev) => {
      const updatedPhotos = prev.photos.filter(
        (_, index) => index !== indexToRemove,
      );
      return {...prev, photos: updatedPhotos};
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 py-3 px-3">
      <AlertDialog
        state={confirmDialog.alertState}
        setState={confirmDialog.closeAlert}
        onEdit={confirmDialog.onEdit}
      />
      <div className="max-w-[600px] w-full mx-auto pb-6">
        <Header />

        {!isEditing ? (
          <>
            <h2 className="text-[1.1rem] font-extrabold text-slate-800 uppercase mb-4 mt-6">
              Minhas Avaliações
            </h2>
            <Button
              wfull
              onClick={handleNewEval}
              className="!bg-orange-600 hover:!bg-orange-700 text-white mb-6 !h-12 !justify-start"
            >
              <FiPlusCircle size={20} className="mr-3" />
              Nova Avaliação
            </Button>

            <div className="flex flex-col gap-4">
              {evaluations.length === 0 ? (
                <p className="text-center text-slate-500 text-[0.9rem] py-4 bg-white rounded-xl border border-slate-200">
                  Nenhuma avaliação registrada no histórico.
                </p>
              ) : (
                evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => handleEditEval(ev)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center cursor-pointer hover:border-orange-300 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <FiActivity size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-800">
                          Avaliação {ev.date}
                        </span>
                        <span className="text-[0.8rem] text-slate-500 font-medium mt-0.5">
                          {ev.bio?.peso ? `${ev.bio.peso} kg` : "S/ Peso"} •{" "}
                          {ev.bio?.gorduraCorporal
                            ? `${ev.bio.gorduraCorporal}% BF`
                            : "S/ BF"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteEval(ev.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentEval(null);
                }}
                className="p-2 bg-slate-200 rounded-full text-slate-600 hover:bg-slate-300 transition-colors"
              >
                <FiArrowLeft size={18} />
              </button>
              <h2 className="text-[1.1rem] font-extrabold text-slate-800 uppercase">
                Avaliação {currentEval.date}
              </h2>
            </div>

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
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="peso"
                    value={currentEval.bio.peso}
                    onChange={(e) =>
                      handleNestedChange("bio", e.target.name, e.target.value)
                    }
                    label="Peso (kg)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="massaMuscular"
                    value={currentEval.bio.massaMuscular}
                    onChange={(e) =>
                      handleNestedChange("bio", e.target.name, e.target.value)
                    }
                    label="Massa Musc. (kg)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="gorduraCorporal"
                    value={currentEval.bio.gorduraCorporal}
                    onChange={(e) =>
                      handleNestedChange("bio", e.target.name, e.target.value)
                    }
                    label="Gordura Corp. (%)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="gorduraVisceral"
                    value={currentEval.bio.gorduraVisceral}
                    onChange={(e) =>
                      handleNestedChange("bio", e.target.name, e.target.value)
                    }
                    label="Gordura Visceral"
                    type="number"
                    placeholder="Ex: 4"
                  />
                </div>
              </div>
            )}

            {/* CONTEÚDO: MEDIDAS CORPORAIS */}
            {activeTab === "medidas" && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="ombro"
                    value={currentEval.medidas.ombro || ""}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Ombro (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="torax"
                    value={currentEval.medidas.torax}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Tórax (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="cintura"
                    value={currentEval.medidas.cintura}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Cintura (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="abdomen"
                    value={currentEval.medidas.abdomen}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Abdômen (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="quadril"
                    value={currentEval.medidas.quadril}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Quadril (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="bracoDir"
                    value={currentEval.medidas.bracoDir}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Braço Dir. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="bracoEsq"
                    value={currentEval.medidas.bracoEsq}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Braço Esq. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="antebracoDir"
                    value={currentEval.medidas.antebracoDir || ""}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Antebraço Dir. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="antebracoEsq"
                    value={currentEval.medidas.antebracoEsq || ""}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Antebraço Esq. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="coxaDir"
                    value={currentEval.medidas.coxaDir}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Coxa Dir. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="coxaEsq"
                    value={currentEval.medidas.coxaEsq}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Coxa Esq. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="pantDir"
                    value={currentEval.medidas.pantDir}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Pant. Dir. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                  <Input
                    name="pantEsq"
                    value={currentEval.medidas.pantEsq}
                    onChange={(e) =>
                      handleNestedChange(
                        "medidas",
                        e.target.name,
                        e.target.value,
                      )
                    }
                    label="Pant. Esq. (cm)"
                    type="number"
                    placeholder="00.0"
                  />
                </div>
              </div>
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
                    className="hidden"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                </label>

                {currentEval.photos && currentEval.photos.length > 0 && (
                  <div className="mt-2 flex flex-col gap-3">
                    <span className="text-[0.8rem] font-extrabold text-slate-800 uppercase pl-1">
                      Pré-visualização:
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      {(currentEval.photos || []).map((photo, index) => {
                        // Se for um File, cria uma URL temporária para preview. Se for string, já é uma URL.
                        const previewUrl =
                          photo instanceof File
                            ? URL.createObjectURL(photo)
                            : photo;

                        return (
                          <div key={index} className="relative">
                            <img
                              src={previewUrl}
                              alt={`Shape atual ${index + 1}`}
                              className="w-full h-auto object-cover rounded-lg shadow-sm border border-slate-200"
                            />
                            <button
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                              aria-label={`Remover foto ${index + 1}`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {(currentEval.photos || []).length > 0 && (
                  <p className="text-[0.75rem] text-slate-500 font-medium text-center">
                    {currentEval.photos.length} foto(s) anexada(s).
                  </p>
                )}
              </div>
            )}

            {/* BOTÃO ÚNICO DE SALVAR TUDO */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                wfull
                onClick={handleSaveEval}
                className="!bg-orange-600 hover:!bg-orange-700 text-white !h-12 uppercase tracking-wide"
              >
                <FiSave size={18} className="mr-2" /> Salvar Avaliação Completa
              </Button>
              <Button
                wfull
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentEval(null);
                }}
                className="!h-12 uppercase tracking-wide"
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default TrackingPage;
