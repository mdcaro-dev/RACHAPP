export type Block = 'calor' | 'zona-media' | 'musculacion' | 'cardio'

export interface Exercise {
  id: string
  block: Block
  blockLabel: string
  blockIcon: string
  name: string
  series: string
  reps: string
  hasWeight: boolean // true = musculación con peso trackeable
}

export interface GymDay {
  day: 1 | 2 | 3
  label: string
  exercises: Exercise[]
}

export const GYM_DAYS: GymDay[] = [
  {
    day: 1,
    label: 'DÍA 1',
    exercises: [
      { id: 'd1_bici',          block: 'calor',       blockLabel: 'Entrada en calor', blockIcon: '🚴', name: 'Bici',                          series: '—',   reps: "10'",    hasWeight: false },
      { id: 'd1_espinales',     block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Espinales colchoneta',           series: '3',   reps: '10-12',  hasWeight: false },
      { id: 'd1_abdominales',   block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Abdominales colchoneta',         series: '3',   reps: '20-15',  hasWeight: false },
      { id: 'd1_chest_press',   block: 'musculacion', blockLabel: 'Pectoral',         blockIcon: '💪', name: 'Chest Press',                    series: '3-4', reps: '10',     hasWeight: true  },
      { id: 'd1_low_row',       block: 'musculacion', blockLabel: 'Espalda',          blockIcon: '💪', name: 'Low Row (Remo bajo)',             series: '3-4', reps: '12',     hasWeight: true  },
      { id: 'd1_biceps_hombro', block: 'musculacion', blockLabel: 'Bíceps',           blockIcon: '💪', name: 'Bíceps + Hombros Mancuerna',     series: '3',   reps: '10-8',   hasWeight: true  },
      { id: 'd1_leg_curl',      block: 'musculacion', blockLabel: 'Piernas',          blockIcon: '💪', name: 'Leg Curl (Femorales)',            series: '4',   reps: '8',      hasWeight: true  },
      { id: 'd1_leg_ext',       block: 'musculacion', blockLabel: 'Piernas',          blockIcon: '💪', name: 'Leg Extension (Cuádriceps)',      series: '4',   reps: '8',      hasWeight: true  },
      { id: 'd1_cardio',        block: 'cardio',      blockLabel: 'Cardio',           blockIcon: '🏃', name: 'Cinta / Bici / Remo (alternar)', series: '—',   reps: "10'-15'", hasWeight: false },
    ],
  },
  {
    day: 2,
    label: 'DÍA 2',
    exercises: [
      { id: 'd2_bici',          block: 'calor',       blockLabel: 'Entrada en calor', blockIcon: '🚴', name: 'Bici',                           series: '—',   reps: "10'",    hasWeight: false },
      { id: 'd2_plancha',       block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Abdominales plancha',             series: '3',   reps: "30''",   hasWeight: false },
      { id: 'd2_oblicuos',      block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Oblicuos colchoneta',             series: '3',   reps: '15/15',  hasWeight: false },
      { id: 'd2_pectorales',    block: 'musculacion', blockLabel: 'Pectoral',         blockIcon: '💪', name: 'Pectorales (A1)',                 series: '4',   reps: '8-10',   hasWeight: true  },
      { id: 'd2_vuelo_lat',     block: 'musculacion', blockLabel: 'Hombros',          blockIcon: '💪', name: 'Vuelo Lateral Mancuerna (A2)',    series: '3-4', reps: '10-12',  hasWeight: true  },
      { id: 'd2_lat_barra',     block: 'musculacion', blockLabel: 'Espalda',          blockIcon: '💪', name: 'Lat con Barra',                   series: '4',   reps: '8',      hasWeight: true  },
      { id: 'd2_triceps_polea', block: 'musculacion', blockLabel: 'Tríceps',          blockIcon: '💪', name: 'Extensión en Polea con Barra',    series: '3',   reps: '10-12',  hasWeight: true  },
      { id: 'd2_aductores',     block: 'musculacion', blockLabel: 'Piernas',          blockIcon: '💪', name: 'Máquina Aductores',               series: '4',   reps: '12',     hasWeight: true  },
      { id: 'd2_abductores',    block: 'musculacion', blockLabel: 'Piernas',          blockIcon: '💪', name: 'Máquina Abductores',              series: '4',   reps: '12',     hasWeight: true  },
      { id: 'd2_cardio',        block: 'cardio',      blockLabel: 'Cardio',           blockIcon: '🏃', name: 'Cinta / Bici / Remo (alternar)',  series: '—',   reps: "10'-15'", hasWeight: false },
    ],
  },
  {
    day: 3,
    label: 'DÍA 3',
    exercises: [
      { id: 'd3_bici',          block: 'calor',       blockLabel: 'Entrada en calor', blockIcon: '🚴', name: 'Bici',                           series: '—',   reps: "10'",    hasWeight: false },
      { id: 'd3_superman',      block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Superman',                       series: '3',   reps: '10',     hasWeight: false },
      { id: 'd3_obli_cruzados', block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Oblicuos cruzados',               series: '3',   reps: '15/15',  hasWeight: true  },
      { id: 'd3_obli_tacones',  block: 'zona-media',  blockLabel: 'Zona media',       blockIcon: '🔥', name: 'Oblicuos tacones',                series: '3',   reps: '20-20',  hasWeight: false },
      { id: 'd3_press_banco',   block: 'musculacion', blockLabel: 'Pectoral',         blockIcon: '💪', name: 'Press en Banco con Mancuerna',    series: '4',   reps: '8',      hasWeight: true  },
      { id: 'd3_vertical_trac', block: 'musculacion', blockLabel: 'Espalda',          blockIcon: '💪', name: 'Vertical Trac',                   series: '4',   reps: '12',     hasWeight: true  },
      { id: 'd3_curl_martillo', block: 'musculacion', blockLabel: 'Bíceps',           blockIcon: '💪', name: 'Curl Mancuerna Martillo (A1)',     series: '3',   reps: '8',      hasWeight: true  },
      { id: 'd3_press_copa',    block: 'musculacion', blockLabel: 'Hombros',          blockIcon: '💪', name: 'Press Mancuerna + Copa (A2)',      series: '3',   reps: '10',     hasWeight: true  },
      { id: 'd3_prensa',        block: 'musculacion', blockLabel: 'Piernas',          blockIcon: '💪', name: 'Prensa 90°',                      series: '4',   reps: '12',     hasWeight: true  },
      { id: 'd3_sentadilla',    block: 'musculacion', blockLabel: 'Piernas',          blockIcon: '💪', name: 'Sentadilla con Mancuerna',         series: '4',   reps: '8',      hasWeight: true  },
      { id: 'd3_cardio',        block: 'cardio',      blockLabel: 'Cardio',           blockIcon: '🏃', name: 'Cinta / Bici / Remo (alternar)',  series: '—',   reps: "10'-15'", hasWeight: false },
    ],
  },
]
