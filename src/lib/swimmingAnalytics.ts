// Swimming analytics functions for 200m races

export interface SwimmingTest {
  athlete: string;
  date: string;
  event: string;
  distance: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  t5: number;
  t6: number;
  t7: number;
  t8: number;
}

export interface Indices {
  IDG: number; // Índice Global de Desaceleração
  CV_t: number; // Coeficiente de variação dos tempos
  ICF: number; // Índice de Colapso Final
  ISM: number; // Split primeiro 100 vs segundo 100
  ICPE: number; // Distância ao padrão de referência
}

export interface SemaforoResult {
  emoji: string;
  description: string;
}

export interface AthleteProfile {
  profile: string;
  description: string;
}

export interface RadarValues {
  stability: number;
  globalDeceleration: number;
  finalPerformance: number;
  balance: number;
  patternCompliance: number;
}

export function getSplits(test: SwimmingTest): number[] {
  return [test.t1, test.t2, test.t3, test.t4, test.t5, test.t6, test.t7, test.t8];
}

export function getTotalTime(test: SwimmingTest): number {
  return getSplits(test).reduce((acc, val) => acc + val, 0);
}

export function computeReferencePattern(tests: SwimmingTest[]): number[] {
  const normalizedSplits = tests.map(test => {
    const splits = getSplits(test);
    const total = splits.reduce((acc, val) => acc + val, 0);
    return splits.map(s => s / total);
  });

  const avgPattern = new Array(8).fill(0);
  normalizedSplits.forEach(splits => {
    splits.forEach((val, idx) => {
      avgPattern[idx] += val / normalizedSplits.length;
    });
  });

  return avgPattern;
}

export function computeIndices(
  test: SwimmingTest,
  referencePattern?: number[]
): Indices {
  const splits = getSplits(test);
  const T = splits.reduce((acc, val) => acc + val, 0);

  // Validate data
  if (splits.some(s => s <= 0) || T <= 0) {
    return {
      IDG: NaN,
      CV_t: NaN,
      ICF: NaN,
      ISM: NaN,
      ICPE: NaN,
    };
  }

  const t1 = splits[0];
  const t8 = splits[7];

  // IDG – Índice Global de Desaceleração (%)
  const IDG = 100 * (t8 - t1) / t1;

  // CV_t – Coeficiente de variação dos tempos (%)
  const mean = splits.reduce((acc, val) => acc + val, 0) / splits.length;
  const variance = splits.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / splits.length;
  const stdDev = Math.sqrt(variance);
  const CV_t = 100 * (stdDev / mean);

  // ICF – Índice de Colapso Final (%)
  const baseMid = (splits[2] + splits[3]) / 2; // t3, t4
  const endMid = (splits[6] + splits[7]) / 2; // t7, t8
  const ICF = 100 * (endMid - baseMid) / baseMid;

  // ISM – Split primeiro 100 vs segundo 100 (% do total)
  const first100 = splits.slice(0, 4).reduce((acc, val) => acc + val, 0);
  const last100 = splits.slice(4).reduce((acc, val) => acc + val, 0);
  const ISM = 100 * (last100 - first100) / T;

  // ICPE – distância ao padrão de referência
  let ICPE = NaN;
  if (referencePattern) {
    const p = splits.map(s => s / T);
    const diff = p.map((val, idx) => val - referencePattern[idx]);
    ICPE = Math.sqrt(diff.reduce((acc, val) => acc + val * val, 0));
  }

  return { IDG, CV_t, ICF, ISM, ICPE };
}

export function semaforoIDG(IDG: number): SemaforoResult {
  if (isNaN(IDG)) {
    return { emoji: "⚪", description: "Sem dado" };
  }
  if (IDG <= 5) {
    return { emoji: "🟢", description: "Desaceleração global muito boa" };
  } else if (IDG <= 8) {
    return { emoji: "🟡", description: "Desaceleração dentro de faixa aceitável" };
  } else {
    return { emoji: "🔴", description: "Queda de ritmo acima do ideal" };
  }
}

export function semaforoICF(ICF: number): SemaforoResult {
  if (isNaN(ICF)) {
    return { emoji: "⚪", description: "Sem dado" };
  }
  if (ICF <= 3) {
    return { emoji: "🟢", description: "Final muito bem sustentado" };
  } else if (ICF <= 6) {
    return { emoji: "🟡", description: "Queda moderada no final" };
  } else {
    return { emoji: "🔴", description: "Colapso marcado no último quarto" };
  }
}

export function semaforoISM(ISM: number): SemaforoResult {
  if (isNaN(ISM)) {
    return { emoji: "⚪", description: "Sem dado" };
  }
  if (ISM <= 3) {
    return { emoji: "🟢", description: "Prova bem equilibrada entre 1º e 2º 100m" };
  } else if (ISM <= 6) {
    return { emoji: "🟡", description: "Segundo 100 sensivelmente mais lento" };
  } else {
    return { emoji: "🔴", description: "Pacing agressivo demais no primeiro 100m" };
  }
}

export function semaforoCVt(CV_t: number): SemaforoResult {
  if (isNaN(CV_t)) {
    return { emoji: "⚪", description: "Sem dado" };
  }
  if (CV_t <= 2.0) {
    return { emoji: "🟢", description: "Pacing muito estável" };
  } else if (CV_t <= 3.5) {
    return { emoji: "🟡", description: "Oscilações moderadas nos parciais" };
  } else {
    return { emoji: "🔴", description: "Ritmo irregular (oscilações grandes)" };
  }
}

export function classifyProfile(indices: Indices): AthleteProfile {
  const { IDG, ICF, ISM, CV_t } = indices;

  if ([IDG, ICF, ISM, CV_t].some(isNaN)) {
    return {
      profile: "Indefinido",
      description: "Faltam dados para classificar.",
    };
  }

  // Sprinter estendido
  if (IDG > 6 && ICF > 4) {
    return {
      profile: "Sprinter estendido",
      description: "Abre muito forte e perde bastante no final; precisa de mais tolerância à fadiga.",
    };
  }

  // Contador negativo ou muito equilibrado
  if (ISM < 2 && IDG <= 6 && ICF <= 4) {
    return {
      profile: "Equilibrado / negative-like",
      description: "Mantém a prova sob controle com pouca queda de ritmo; perfil mais econômico.",
    };
  }

  // Ritmo irregular
  if (CV_t > 3.5) {
    return {
      profile: "Ritmo instável",
      description: "Oscila muito entre os parciais; foco em ritmo e consistência técnica.",
    };
  }

  return {
    profile: "Equilibrado",
    description: "Pacing em geral equilibrado, com espaço para refinar final de prova e velocidade básica.",
  };
}

export function generateDiagnosis(indices: Indices): string {
  const { IDG, ICF, ISM, CV_t } = indices;
  const phrases: string[] = [];

  if (IDG > 8) {
    phrases.push("Queda global de ritmo alta (IDG elevado).");
  } else if (IDG <= 5) {
    phrases.push("Mantém boa velocidade relativa do início ao fim.");
  }

  if (ICF > 6) {
    phrases.push("Há colapso claro no último quarto da prova (ICF alto).");
  } else if (ICF <= 3) {
    phrases.push("Final bem sustentado, com pouca perda nos últimos 50m.");
  }

  if (ISM > 6) {
    phrases.push("Primeiro 100m muito agressivo em relação ao segundo.");
  } else if (ISM <= 3) {
    phrases.push("Equilíbrio bom entre primeiro e segundo 100m.");
  }

  if (CV_t > 3.5) {
    phrases.push("Ritmo bastante irregular; possíveis problemas técnicos ou de virada.");
  } else if (CV_t <= 2.0) {
    phrases.push("Pacing muito estável; boa gestão de ritmo.");
  }

  if (phrases.length === 0) {
    phrases.push("Pacing dentro de parâmetros normais, sem pontos extremos.");
  }

  return phrases.join(" ");
}

export function computeRadarValues(indices: Indices): RadarValues {
  const { IDG, ICF, ISM, CV_t, ICPE } = indices;

  function scoreInverse(x: number, low: number, high: number): number {
    if (isNaN(x)) return 0;
    if (x <= low) return 100;
    if (x >= high) return 0;
    return 100 * (high - x) / (high - low);
  }

  const stability = scoreInverse(CV_t, 2.0, 5.0);
  const globalDeceleration = scoreInverse(IDG, 5.0, 10.0);
  const finalPerformance = scoreInverse(ICF, 3.0, 8.0);
  const balance = scoreInverse(ISM, 3.0, 8.0);

  let patternCompliance = 0;
  if (!isNaN(ICPE)) {
    if (ICPE <= 0.02) {
      patternCompliance = 100;
    } else if (ICPE >= 0.08) {
      patternCompliance = 0;
    } else {
      patternCompliance = 100 * (0.08 - ICPE) / (0.08 - 0.02);
    }
  }

  return {
    stability,
    globalDeceleration,
    finalPerformance,
    balance,
    patternCompliance,
  };
}

export const sampleData: SwimmingTest[] = [
  {
    athlete: "Atleta A",
    date: "2025-11-18",
    event: "200L teste 1",
    distance: 200,
    t1: 13.0,
    t2: 13.8,
    t3: 14.2,
    t4: 14.4,
    t5: 14.8,
    t6: 15.0,
    t7: 15.2,
    t8: 15.4,
  },
  {
    athlete: "Atleta A",
    date: "2025-11-25",
    event: "200L teste 2",
    distance: 200,
    t1: 13.1,
    t2: 13.6,
    t3: 13.9,
    t4: 14.1,
    t5: 14.3,
    t6: 14.5,
    t7: 14.8,
    t8: 15.0,
  },
  {
    athlete: "Atleta B",
    date: "2025-11-18",
    event: "200L teste 1",
    distance: 200,
    t1: 13.5,
    t2: 14.1,
    t3: 14.5,
    t4: 14.9,
    t5: 15.5,
    t6: 15.9,
    t7: 16.3,
    t8: 16.8,
  },
  {
    athlete: "Atleta B",
    date: "2025-11-25",
    event: "200L teste 2",
    distance: 200,
    t1: 13.3,
    t2: 13.9,
    t3: 14.3,
    t4: 14.6,
    t5: 15.0,
    t6: 15.4,
    t7: 15.7,
    t8: 16.0,
  },
  {
    athlete: "Atleta C",
    date: "2025-11-20",
    event: "200L teste 1",
    distance: 200,
    t1: 12.8,
    t2: 13.2,
    t3: 13.6,
    t4: 13.9,
    t5: 14.2,
    t6: 14.5,
    t7: 14.8,
    t8: 15.1,
  },
];
