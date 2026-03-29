export const WORKOUT_DATA = [
  {
    id: "A",
    title: "Treino A: Seg / Qui",
    badge: "Braços & Ombros",
    sections: [
      {
        label: "👑 Bíceps e Tríceps",
        exercises: [
          {
            name: "1. Bi-Set: Rosca Scott (Máq) + Tríceps Corda",
            meta: "4 x 10-12",
            muscle: "Bíceps / Tríceps",
            rest: "⏱️ 90s",
            detail: "Isolamento",
            color: "purple",
            instruction: (
              <>
                <strong className="text-slate-900">
                  Sem descanso entre os dois:
                </strong>{" "}
                Faça a Rosca na máquina Scott e vá direto para a polia alta. Só
                descanse 90s após completar ambos. Falha total apenas na série
                4.
              </>
            ),
          },
          {
            name: "2. Bi-Set: Rosca 45º + Tríceps Francês (Polia)",
            meta: "3 x 10-12",
            muscle: "Bíceps / Tríceps",
            rest: "⏱️ 90s",
            detail: "Alongamento",
            color: "purple",
            instruction:
              "No francês, banco a 90º de costas para a polia baixa com corda. Coluna totalmente colada no banco, zerando a compressão discal.",
          },
        ],
      },
      {
        label: "🛡️ Construção V-Taper",
        exercises: [
          {
            name: "3. Elevação Lateral (Sentado)",
            meta: "4 x 12-15",
            muscle: "Ombro",
            rest: "⏱️ 60s",
            detail: "1 Drop-Set",
            color: "red",
            instruction: (
              <>
                <strong className="text-slate-900">Obrigatório sentado.</strong>{" "}
                Elimina oscilação lombar. Faça 1 único Drop-set na última série
                (reduza o peso 30% e vá até falhar de novo).
              </>
            ),
          },
          {
            name: "4. Desenv. Arnold (Sentado)",
            meta: "3 x 10",
            muscle: "Ombro",
            rest: "⏱️ 90s",
            detail: "Massa Anterior",
            color: "none",
            instruction:
              "Costas 100% coladas no encosto. Empurre focado na contração. Não crie arco lombar em nenhuma hipótese.",
          },
          {
            name: "5. Crucifixo Inverso (Máquina)",
            meta: "3 x 12-15",
            muscle: "Ombro Posterior",
            rest: "⏱️ 60s",
            detail: "Postura",
            color: "none",
            instruction:
              "Foque em esmagar a parte de trás do ombro para tracionar a postura de quem trabalha sentado o dia todo.",
          },
        ],
      },
    ],
  },
  {
    id: "B",
    title: "Treino B: Ter / Sex",
    badge: "Peito & Costas",
    sections: [
      {
        label: "👑 Densidade e Estética",
        exercises: [
          {
            name: "1. Puxada Alta (Pulley)",
            meta: "4 x 10-12",
            muscle: "Costas",
            rest: "⏱️ 90 a 120s",
            detail: "Expansão",
            color: "blue",
            instruction:
              "Coluna estritamente vertical. Traga a barra até o topo do peito e segure contração isométrica por 2s.",
          },
          {
            name: "2. Supino Inclinado (Halter)",
            meta: "4 x 10",
            muscle: "Peito",
            rest: "⏱️ 90 a 120s",
            detail: "Peitoral Superior",
            color: "orange",
            instruction:
              'Preenche a porção clavicular combatendo o aspecto de "peito caído". Desça o peso em 3 a 4 segundos.',
          },
          {
            name: "3. Remada Baixa (Triângulo)",
            meta: "3 x 12",
            muscle: "Costas",
            rest: "⏱️ 90s",
            detail: "Miolo das Costas",
            color: "blue",
            instruction: (
              <>
                <strong className="text-slate-900">Alerta Hérnia:</strong>{" "}
                Joelhos semiflexionados. O tronco fica imóvel como estátua;
                apenas os braços puxam.
              </>
            ),
          },
        ],
      },
      {
        label: "🛡️ Tensão Contínua",
        exercises: [
          {
            name: "4. Peck Deck (Voador)",
            meta: "3 x 12-15",
            muscle: "Peito",
            rest: "⏱️ 60s",
            detail: "Rest-Pause",
            color: "none",
            instruction:
              "Costas apoiadas. Na última série, alcance a falha, descanse 15s na própria máquina e faça mais repetições.",
          },
          {
            name: "5. Cross-over (Polia Alta)",
            meta: "3 x 12-15",
            muscle: "Peito",
            rest: "⏱️ 60 a 90s",
            detail: "Corte Inferior",
            color: "orange",
            instruction:
              "Fechamento dos cabos de cima para baixo. Isola a porção externa do peito (flacidez). Core muito contraído.",
          },
          {
            name: "6. Elev. Lateral (Cabo Uni)",
            meta: "3 x 15",
            muscle: "Ombro",
            rest: "⏱️ 60s",
            detail: "Pump Final",
            color: "red",
            instruction:
              "Tensão constante da polia baixa. Carga leve a moderada apenas para manter o músculo bombeado.",
          },
        ],
      },
    ],
  },
  {
    id: "C",
    title: "Treino C: Quarta",
    badge: "Glúteos & Pernas",
    sections: [
      {
        label: "👑 Construção (Lombar Safe)",
        exercises: [
          {
            name: "1. Elevação Pélvica (Máquina/Barra)",
            meta: "4 x 10-12",
            muscle: "Glúteo Máximo",
            rest: "⏱️ 120s",
            detail: "Pico de Contração",
            color: "green",
            instruction: (
              <>
                Apoie as escápulas no banco. Suba o quadril e{" "}
                <strong className="text-slate-900">
                  contraia o glúteo intencionalmente no topo por 2 a 3 segundos
                </strong>
                . Sem carga compressiva na coluna.
              </>
            ),
          },
          {
            name: "2. Leg Press 45º (Pés Altos)",
            meta: "3 x 10-12",
            muscle: "Glúteo / Posterior",
            rest: "⏱️ 120s",
            detail: "Foco Inferior",
            color: "green",
            instruction:
              "Pés posicionados na parte alta e afastada da plataforma. A força deve sair estritamente dos calcanhares. Não desça o peso a ponto de descolar a lombar do encosto.",
          },
          {
            name: "3. Cadeira Abdutora",
            meta: "3 x 15-20",
            muscle: "Glúteo Médio",
            rest: "⏱️ 90s",
            detail: "Formato Redondo",
            color: "green",
            instruction: (
              <>
                Descole as costas do encosto e{" "}
                <strong className="text-slate-900">
                  incline o tronco a 45º para a frente
                </strong>{" "}
                segurando na máquina. Isso elimina o hip dip e recruta a
                lateral.
              </>
            ),
          },
        ],
      },
    ],
  },
];
