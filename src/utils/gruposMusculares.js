/**
 * Normaliza o valor de grupo muscular para sempre devolver um array de grupos.
 *
 * @param {string|string[]|undefined|null} grupoMuscular
 * @returns {string[]}
 */
export const normalizarGruposMusculares = (grupoMuscular) => {
  if (Array.isArray(grupoMuscular)) {
    return grupoMuscular
      .flatMap((grupo) => normalizarGruposMusculares(grupo))
      .filter(Boolean);
  }

  if (typeof grupoMuscular === "string") {
    return grupoMuscular
      .split(/\s*\+\s*/)
      .map((grupo) => grupo.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Retorna os grupos musculares únicos associados ao exercício.
 *
 * @param {Object} exercicio
 * @returns {string[]}
 */
export const obterGruposMuscularesExercicio = (exercicio) => [
  ...new Set([
    ...normalizarGruposMusculares(exercicio?.muscle),
    ...normalizarGruposMusculares(exercicio?.muscleGroup),
  ]),
];

/**
 * Verifica se um exercício pertence a um grupo muscular específico.
 * Compatível com registros antigos que usam `muscle` e com o novo formato em array.
 *
 * @param {Object} exercicio
 * @param {string} grupo
 * @returns {boolean}
 */
export const exercicioPertenceAoGrupo = (exercicio, grupo) => {
  const grupos = obterGruposMuscularesExercicio(exercicio);

  return grupos.includes(grupo);
};

/**
 * Resolve qual grupo muscular deve aparecer no card do exercício.
 * Quando o exercício pertence a mais de um grupo, prioriza os grupos da seção atual.
 *
 * @param {Object} exercicio
 * @param {string} [grupoAtual=""]
 * @returns {string}
 */
export const obterGrupoMuscularExibicao = (exercicio, grupoAtual = "") => {
  const grupos = obterGruposMuscularesExercicio(exercicio);
  const gruposDaSecao = normalizarGruposMusculares(grupoAtual);

  if (gruposDaSecao.length > 0) {
    const gruposCorrespondentes = grupos.filter((grupo) =>
      gruposDaSecao.includes(grupo),
    );

    if (gruposCorrespondentes.length > 0) {
      return gruposCorrespondentes.join(" + ");
    }
  }

  return grupos.join(" + ");
};
