export const SESSIONS = ['Asian', 'London', 'New York', 'Hors session'] as const;
export const ETATS = ['Calme', 'Confiant', 'Stressé', 'Impatient', 'Focalisé', 'Fatigue'] as const;
export const STRUCTURES = ['BOS haussier', 'BOS baissier', 'ChoCH haussier', 'ChoCH baissier', 'Range', 'Tendance', 'Autre'] as const;
export const RESULTATS = ['Win', 'Loss', 'Breakeven', 'En cours'] as const;
export const INSTRUMENTS = ['EURUSD', 'GBPUSD', 'XAUUSD', 'GBPJPY', 'EURJPY', 'USDJPY', 'NZDUSD', 'NASDAQ'] as const;

export const ACC_COLORS = [
  '#2558CE', '#8E6B1E', '#2B8A4E', '#8A5E12', 
  '#1E6A9A', '#6B4F8A', '#B05020', '#4A6880'
];

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL as string,
  key: import.meta.env.VITE_SUPABASE_KEY as string,
};

export const SESSION_HOURS = {
  ASIAN: { start: 0, end: 7 },
  LONDON: { start: 7, end: 13 },
  NY: { start: 13, end: 18 }
};
