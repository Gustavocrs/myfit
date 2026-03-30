/**
 * Normaliza o valor de grupo muscular para sempre devolver um array de grupos.
 *
 * @param {string|string[]|undefined|null} grupoMuscular
 * @returns {string[]}
 */
export const normalizarGruposMusculares = (grupoMuscular) => {
  if (Array.isArray(grupoMuscular)) {
    return grupoMuscular.filter(Boolean);
  }

  return grupoMuscular ? [grupoMuscular] : [];
};

/**
 * Verifica se um exercício pertence a um grupo muscular específico.
 * Compatível com registros antigos que usam `muscle` e com o novo formato em array.
 *
 * @param {Object} exercicio
 * @param {string} grupo
 * @returns {boolean}
 */
export const exercicioPertenceAoGrupo = (exercicio, grupo) => {
  const grupos = [
    ...normalizarGruposMusculares(exercicio?.muscleGroup),
    ...normalizarGruposMusculares(exercicio?.muscle),
  ];

  return grupos.includes(grupo);
};

/**
 * Resolve qual grupo muscular deve aparecer no card do exercício.
 * Quando o exercício pertence a mais de um grupo, prioriza o grupo da seção atual.
 *
 * @param {Object} exercicio
 * @param {string} [grupoAtual=""]
 * @returns {string}
 */
export const obterGrupoMuscularExibicao = (exercicio, grupoAtual = "") => {
  const grupos = [
    ...normalizarGruposMusculares(exercicio?.muscle),
    ...normalizarGruposMusculares(exercicio?.muscleGroup),
  ];

  if (grupoAtual && grupos.includes(grupoAtual)) {
    return grupoAtual;
  }

  return grupos[0] || "";
};
