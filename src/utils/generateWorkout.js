import exercisesData from "@/data/exercises.json";
import {exercicioPertenceAoGrupo} from "@/utils/gruposMusculares";

/**
 * Define o volume de exercícios baseado na experiência do usuário.
 * @param {string} experience
 * @param {boolean} isLargeMuscle
 * @returns {number} Quantidade de exercícios
 */
const getVolumeByExperience = (experience, isLargeMuscle) => {
  if (experience === "Iniciante") return isLargeMuscle ? 2 : 1;
  if (experience === "Intermediário") return isLargeMuscle ? 3 : 2;
  return isLargeMuscle ? 4 : 3; // Avançado
};

/**
 * Define a cadência (Séries x Reps) e o Descanso baseado no objetivo.
 * @param {string} goal
 * @returns {{meta: string, rest: string}}
 */
const getMetaByGoal = (goal) => {
  switch (goal) {
    case "Emagrecimento":
      return {meta: "4 x 15", rest: "⏱️ 45s"};
    case "Força":
      return {meta: "5 x 5", rest: "⏱️ 180s"};
    case "Resistência":
      return {meta: "3 x 20", rest: "⏱️ 45s"};
    default:
      return {meta: "4 x 10-12", rest: "⏱️ 90s"}; // Hipertrofia
  }
};

/**
 * Seleciona exercícios aleatórios do banco baseando-se no grupo muscular e volume.
 */
const getRandomExercises = (muscle, count) => {
  const filtered = exercisesData.filter((e) =>
    exercicioPertenceAoGrupo(e, muscle),
  );
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Motor principal de geração de treino (Série).
 *
 * @param {Object} config - Configurações do formulário (experience, goal, days).
 * @param {Object} trackingData - Dados de evolução (ex: gorduraCorporal).
 * @returns {Array} Array estruturado com os dias de treino.
 */
export const generateWorkout = (config, trackingData = {}) => {
  const {experience, goal, days} = config;
  const {gorduraCorporal} = trackingData;

  const {meta: defaultMeta, rest: defaultRest} = getMetaByGoal(goal);
  const largeMuscles = ["Peito", "Costas", "Pernas"];

  // Mapeamento de divisão de treinos (Splits)
  const splits = {
    "3 dias": [
      {
        id: "A",
        title: "Treino A",
        badge: "Push",
        muscles: ["Peito", "Ombro", "Tríceps"],
      },
      {
        id: "B",
        title: "Treino B",
        badge: "Pull",
        muscles: ["Costas", "Bíceps", "Abdômen"],
      },
      {
        id: "C",
        title: "Treino C",
        badge: "Legs",
        muscles: ["Pernas", "Panturrilha"],
      },
    ],
    "4 dias": [
      {
        id: "A",
        title: "Treino A",
        badge: "Peito & Tríceps",
        muscles: ["Peito", "Tríceps"],
      },
      {
        id: "B",
        title: "Treino B",
        badge: "Costas & Bíceps",
        muscles: ["Costas", "Bíceps"],
      },
      {
        id: "C",
        title: "Treino C",
        badge: "Pernas",
        muscles: ["Pernas", "Panturrilha"],
      },
      {
        id: "D",
        title: "Treino D",
        badge: "Ombro & Core",
        muscles: ["Ombro", "Abdômen"],
      },
    ],
    "5 dias": [
      {id: "A", title: "Treino A", badge: "Peito", muscles: ["Peito"]},
      {id: "B", title: "Treino B", badge: "Costas", muscles: ["Costas"]},
      {
        id: "C",
        title: "Treino C",
        badge: "Pernas",
        muscles: ["Pernas", "Panturrilha"],
      },
      {id: "D", title: "Treino D", badge: "Ombro", muscles: ["Ombro"]},
      {
        id: "E",
        title: "Treino E",
        badge: "Braços & Core",
        muscles: ["Bíceps", "Tríceps", "Abdômen"],
      },
    ],
    "6 dias": [
      {
        id: "A",
        title: "Treino A",
        badge: "Push 1",
        muscles: ["Peito", "Ombro", "Tríceps"],
      },
      {
        id: "B",
        title: "Treino B",
        badge: "Pull 1",
        muscles: ["Costas", "Bíceps", "Abdômen"],
      },
      {
        id: "C",
        title: "Treino C",
        badge: "Legs 1",
        muscles: ["Pernas", "Panturrilha"],
      },
      {
        id: "D",
        title: "Treino D",
        badge: "Push 2",
        muscles: ["Peito", "Ombro", "Tríceps"],
      },
      {
        id: "E",
        title: "Treino E",
        badge: "Pull 2",
        muscles: ["Costas", "Bíceps", "Abdômen"],
      },
      {
        id: "F",
        title: "Treino F",
        badge: "Legs 2",
        muscles: ["Pernas", "Panturrilha"],
      },
    ],
  };

  const selectedSplit = splits[days] || splits["3 dias"];

  return selectedSplit.map((day) => {
    let allExercises = [];

    // Monta a lista de exercícios do dia
    day.muscles.forEach((muscle) => {
      const isLarge = largeMuscles.includes(muscle);
      const volume = getVolumeByExperience(experience, isLarge);

      const selected = getRandomExercises(muscle, volume).map((ex, idx) => ({
        ...ex,
        name: `${allExercises.length + idx + 1}. ${ex.name.replace(/^\d+\.\s*/, "")}`, // Remove numeração antiga e reinsere ordenado
        meta: defaultMeta,
        rest: defaultRest,
        muscle, // Preserva o grupo atual da seção mesmo quando o exercício pertence a múltiplos grupos
      }));

      allExercises = [...allExercises, ...selected];
    });

    const sections = [{label: day.badge, exercises: allExercises}];

    // Regra de Negócio Integrada (Evolução x Objetivo)
    const needsCardio =
      goal === "Emagrecimento" ||
      (gorduraCorporal && parseFloat(gorduraCorporal) > 20);

    if (needsCardio) {
      sections.push({
        label: "🔥 Protocolo Metabólico",
        exercises: [
          {
            id: "cardio_final",
            name: "Esteira / Bike / Elíptico",
            meta: "20 a 30 min",
            muscle: "Cardio",
            rest: "N/A",
            detail: goal === "Emagrecimento" ? "HIIT" : "LISS Moderado",
            color: "red",
            instruction:
              "Realizar estritamente no final do treino para priorizar a depleção de glicogênio na musculação.",
          },
        ],
      });
    }

    return {id: day.id, title: day.title, badge: day.badge, sections};
  });
};
