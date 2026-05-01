import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, Filler, ArcElement 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, Wallet, Settings, 
  RefreshCw, TrendingUp, AlertTriangle, Zap, ChevronLeft, ChevronRight, 
  Plus, Trash2, Sun, Moon, BrainCircuit, CheckCircle2, XCircle, 
  Filter, Search, X, Briefcase, DollarSign, ArrowUpRight, ArrowDownLeft, Tag as TagIcon,
  ShieldCheck
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://nakykfuduehcwsjuicpb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha3lrZnVkdWVoY3dzanVpY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTM0MjAsImV4cCI6MjA4ODk4OTQyMH0.dGd4UnYdzOZRrExSW22AJE4RJEtU8y4U4SuXvOY-MMQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FONCTIONS SUPABASE (STRICTES) ---

// TRADES (colonne data JSONB)
async function sbLoadTrades() {
  const { data, error } = await supabase.from('trades').select('data');
  if (error) throw error;
  return (data || []).map(row => row.data);
}
async function sbUpsertTrade(trade) {
  await supabase.from('trades').upsert({
    id: trade.id,
    data: trade,
    updated_at: new Date().toISOString()
  });
}
async function sbDeleteTrade(id) {
  await supabase.from('trades').delete().eq('id', id);
}

// ACCOUNTS (colonnes classiques)
async function sbLoadAccounts() {
  const { data } = await supabase.from('accounts').select('*');
  return (data || []).map(a => ({ id: String(a.id), name: a.name, startCapital: a.start_capital, color: a.color }));
}
async function sbUpsertAccount(acc) {
  await supabase.from('accounts').upsert({
    id: String(acc.id), name: acc.name, start_capital: acc.startCapital, color: acc.color,
    updated_at: new Date().toISOString()
  });
}
async function sbDeleteAccount(id) { await supabase.from('accounts').delete().eq('id', String(id)); }

// CASHFLOW (colonnes classiques)
async function sbLoadCashflow() {
  const { data } = await supabase.from('cashflow').select('*');
  return (data || []).map(c => ({ id: String(c.id), type: c.type, date: c.date, compte: c.compte, montantUSD: c.montant_usd, montantMUR: c.montant_mur, taux: c.taux, note: c.note }));
}
async function sbUpsertCF(cf) {
  await supabase.from('cashflow').upsert({
    id: String(cf.id), type: cf.type, date: cf.date, compte: cf.compte,
    montant_usd: cf.montantUSD, montant_mur: cf.montantMUR, taux: cf.taux, note: cf.note,
    updated_at: new Date().toISOString()
  });
}
async function sbDeleteCF(id) { await supabase.from('cashflow').delete().eq('id', String(id)); }

// TAGS
async function sbLoadTags() {
  const { data } = await supabase.from('tags').select('name');
  return (data || []).map(row => row.name);
}
async function sbUpsertTag(name) {
  await supabase.from('tags').upsert({ name }, { onConflict: 'name' });
}

// --- CONSTANTES MÉTIER ---
const ALLOWED_PAIRS = ['EURUSD', 'GBPUSD', 'GBPJPY', 'EURJPY', 'USDJPY', 'XAUUSD'];
const RESULTATS = ['Win', 'Loss', 'Breakeven', 'En cours'];

// --- HELPERS ---
function getSessionFromTime(timeStr) {
  if (!timeStr) return 'Hors Session';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const msm = hours * 60 + (minutes || 0);
  if (msm >= 9 * 60 && msm < 14 * 60) return 'Londres';
  if (msm >= 15 * 60 + 30 && msm < 19 * 60 + 30) return 'NYSE';
  return 'Hors Session';
}

const checkConformity = (trade) => {
  if (!trade) return { isConform: false, reason: "" };
  const isPairOk = ALLOWED_PAIRS.includes(trade.instrument);
  const session = getSessionFromTime(trade.heure);
  const isTimeOk = session !== 'Hors Session';
  if (isPairOk && isTimeOk) return { isConform: true, reason: "" };
  if (!isPairOk && !isTimeOk) return { isConform: false, reason: "Paire & Horaire interdits" };
  if (!isPairOk) return { isConform: false, reason: "Paire hors stratégie" };
  return { isConform: false, reason: "Hors Killzone" };
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

// --- CONTEXTE ---
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// --- COMPOSANTS UI ---
const Card = ({ children, className = "", noPadding = false }) => {
  const { theme } = useApp();
  return (
    <div className={`transition-all duration-300 rounded-3xl ${
      theme === 'dark' ? 'bg-slate-900/40 backdrop-blur-3xl border border-white/5 shadow-2xl' : 'bg-white border border-gray-200 shadow-sm'
    } ${noPadding ? '' : 'p-6'} ${className}`}>{children}</div>
  );
};

const Badge = ({ children, variant = 'neutral' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    error: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-slate-400'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>{children}</span>;
};

const Button = ({ children, onClick, variant = 'primary', className = "", icon: Icon, type = "button" }) => {
  const variants = {
    primary: 'bg-[#007aff] text-white hover:opacity-90',
    secondary: 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
  };
  return (
    <button type={type} onClick={onClick} className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full font-bold transition-all active:scale-95 text-sm ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}{children}
    </button>
  );
};

// --- PAGES ---

const Dashboard = () => {
  const { trades, activeAccountId, accounts } = useApp();
  const filtered = useMemo(() => activeAccountId === 'all' ? trades : trades.filter(t => t.compte === accounts.find(a => a.id === activeAccountId)?.name), [trades, activeAccountId, accounts]);
  const stats = useMemo(() => {
    const closed = filtered.filter(t => t.resultat !== 'En cours');
    const pnl = closed.reduce((acc, t) => acc + (parseFloat(t.gainPerte) || 0), 0);
    const winrate = closed.length ? Math.round((closed.filter(t => t.resultat === 'Win').length / closed.length) * 100) : 0;
    const disc = closed.length ? Math.round((closed.filter(t => checkConformity(t).isConform).length / closed.length) * 100) : 0;
    return { pnl, winrate, disc, closed: closed.length };
  }, [filtered]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4"><TrendingUp className="w-5 h-5 text-emerald-500" /><Badge variant={stats.pnl >= 0 ? 'success' : 'error'}>{stats.pnl >= 0 ? 'Profit' : 'Perte'}</Badge></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">P&L Net</p><h3 className={`text-3xl font-black font-mono ${stats.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(stats.pnl)}</h3></div>
        </Card>
        <Card className="flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4"><Zap className="w-5 h-5 text-blue-500" /><Badge variant="info">Winrate</Badge></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Taux de Réussite</p><h3 className="text-3xl font-black font-mono">{stats.winrate}%</h3></div>
        </Card>
        <Card className="flex flex-col justify-between hover:scale-[1.02] transition-transform border-2 border-indigo-500/10">
          <div className="flex justify-between items-start mb-4"><ShieldCheck className="w-5 h-5 text-indigo-500" /><Badge variant={stats.disc >= 80 ? 'success' : 'warning'}>{stats.disc}%</Badge></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Score Discipline</p><h3 className={`text-3xl font-black font-mono ${stats.disc >= 80 ? 'text-indigo-500' : 'text-amber-500'}`}>{stats.disc}%</h3></div>
        </Card>
        <div className="p-[2px] rounded-[32px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-xl h-full">
          <div className="rounded-[30px] p-6 h-full flex flex-col justify-between bg-white/95 dark:bg-slate-950/90 backdrop-blur-3xl">
             <div className="flex items-center gap-3 mb-4"><BrainCircuit className="w-6 h-6 text-indigo-500" /><h3 className="font-black text-lg">Coach IA</h3></div>
             <p className="text-xs leading-relaxed italic opacity-60">"Analysez vos anomalies pour identifier vos biais psychologiques."</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
           <div className="flex justify-between items-center mb-8"><h3 className="font-black text-xl">Courbe de Performance</h3></div>
           <div className="h-[300px]">
             <Line 
               data={{
                 labels: filtered.filter(t => t.resultat !== 'En cours').map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                 datasets: [{ label: 'P&L', data: filtered.filter(t => t.resultat !== 'En cours').reduce((acc, t, i) => { const prev = i > 0 ? acc[i-1] : 0; acc.push(prev + parseFloat(t.gainPerte)); return acc; }, []), borderColor: '#007aff', backgroundColor: 'rgba(0,122,255,0.1)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 0 }]
               }}
               options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.03)' } } } }}
             />
           </div>
        </Card>
        <Card>
           <div className="flex items-center gap-2 mb-6 text-rose-500"><AlertTriangle className="w-6 h-6" /><h3 className="font-black text-xl">Anomalies</h3></div>
           <div className="space-y-4">
             {filtered.filter(t => !checkConformity(t).isConform).slice(0, 4).map(t => (
               <div key={t.id} className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex justify-between items-center">
                 <div><p className="text-sm font-black">{t.instrument}</p><p className="text-[9px] text-rose-500 font-black uppercase">{checkConformity(t).reason}</p></div>
                 <span className="text-sm font-black font-mono text-rose-500">{formatCurrency(t.gainPerte)}</span>
               </div>
             ))}
             {filtered.filter(t => !checkConformity(t).isConform).length === 0 && <div className="py-12 flex flex-col items-center opacity-30"><CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" /><p className="text-xs font-black uppercase">Système OK</p></div>}
           </div>
        </Card>
      </div>
    </div>
  );
};

const Journal = () => {
  const { trades, accounts, activeAccountId, fetchData } = useApp();
  const [search, setSearch] = useState('');
  const filtered = trades.filter(t => {
    const accMatch = activeAccountId === 'all' || t.compte === accounts.find(a => a.id === activeAccountId)?.name;
    return accMatch && t.instrument.toLowerCase().includes(search.toLowerCase());
  });

  const remove = async (id) => { if(confirm("Supprimer ?")) { await sbDeleteTrade(id); fetchData(); } };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center"><h2 className="text-3xl font-black">Journal</h2><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Recherche..." className="pl-12 pr-6 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100 dark:border-white/5"><th className="px-8 py-5">Instrument</th><th className="px-8 py-5 text-center">Session</th><th className="px-8 py-5 text-center">Status</th><th className="px-8 py-5 text-right">P&L</th><th className="px-8 py-5 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6"><div className="flex items-center gap-4"><div className={`w-1.5 h-10 rounded-full ${t.resultat === 'Win' ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-rose-500 shadow-xl shadow-rose-500/20'}`} /><div><p className="font-black text-base">{t.instrument}</p><p className="text-[10px] opacity-40 font-bold uppercase">{t.date} • {t.heure}</p></div></div></td>
                  <td className="px-8 py-6 text-center"><Badge variant={getSessionFromTime(t.heure) === 'NYSE' ? 'info' : 'neutral'}>{getSessionFromTime(t.heure)}</Badge></td>
                  <td className="px-8 py-6 text-center"><span className={`text-[10px] font-black px-3 py-1 rounded-lg ${t.resultat === 'Win' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{t.resultat}</span></td>
                  <td className={`px-8 py-6 text-right font-black font-mono ${parseFloat(t.gainPerte) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(t.gainPerte)}</td>
                  <td className="px-8 py-6 text-center"><button onClick={() => remove(t.id)} className="p-2 text-gray-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Cashflow = () => {
  const { cashflows, accounts, fetchData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ type: 'Dépôt', date: new Date().toISOString().split('T')[0], compte: '', montantUSD: 0, montantMUR: 0, taux: 45, note: '' });

  const save = async (e) => {
    e.preventDefault();
    await sbUpsertCF({ ...form, id: Date.now().toString() });
    setIsAdding(false);
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center"><h2 className="text-3xl font-black">Cashflow</h2><Button onClick={() => setIsAdding(true)} icon={Plus}>Mouvement</Button></div>
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-black text-gray-400"><th className="px-8 py-5">Type / Date</th><th className="px-8 py-5">Compte</th><th className="px-8 py-5 text-right">Montant USD</th><th className="px-8 py-5 text-right">Montant MUR</th><th className="px-8 py-5 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {cashflows.map(cf => (
                <tr key={cf.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6"><div className="flex items-center gap-3">{cf.type === 'Dépôt' ? <ArrowUpRight className="w-5 h-5 text-emerald-500" /> : <ArrowDownLeft className="w-5 h-5 text-rose-500" />}<div><p className="font-black">{cf.type}</p><p className="text-[10px] opacity-40">{cf.date}</p></div></div></td>
                  <td className="px-8 py-6 font-bold">{cf.compte}</td>
                  <td className="px-8 py-6 text-right font-black font-mono">{formatCurrency(cf.montantUSD)}</td>
                  <td className="px-8 py-6 text-right font-bold text-gray-500">{cf.montantMUR} Rs</td>
                  <td className="px-8 py-6 text-center"><button onClick={async () => { if(confirm("Supprimer ?")) { await sbDeleteCF(cf.id); fetchData(); } }} className="p-2 text-gray-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {isAdding && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsAdding(false)} />
          <Card className="relative w-full max-w-md animate-fade-in shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Nouveau Mouvement</h3>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">Type</label><select className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Dépôt</option><option>Retrait</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">Compte</label><select className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none" value={form.compte} onChange={e => setForm({...form, compte: e.target.value})}><option value="">Choisir...</option>{accounts.map(a => <option key={a.id}>{a.name}</option>)}</select></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">Montant USD</label><input type="number" step="0.01" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 focus:outline-none" value={form.montantUSD} onChange={e => setForm({...form, montantUSD: parseFloat(e.target.value), montantMUR: Math.round(parseFloat(e.target.value) * form.taux)})} /></div>
              <Button type="submit" className="w-full py-4 mt-4">Enregistrer</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const AccountsPage = () => {
  const { accounts, fetchData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', startCapital: 100000, color: '#007aff' });

  const save = async (e) => {
    e.preventDefault();
    await sbUpsertAccount({ ...form, id: Date.now().toString() });
    setIsAdding(false);
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center"><h2 className="text-3xl font-black">Comptes</h2><Button onClick={() => setIsAdding(true)} icon={Plus}>Nouveau Compte</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accounts.map(a => (
          <Card key={a.id} className="relative group overflow-hidden border-b-4 shadow-xl" style={{ borderBottomColor: a.color }}>
            <div className="flex justify-between mb-8"><div className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl"><Wallet className="w-8 h-8" style={{ color: a.color }} /></div><button onClick={async () => { if(confirm("Supprimer ?")){ await sbDeleteAccount(a.id); fetchData(); } }} className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button></div>
            <div><h3 className="text-2xl font-black mb-1">{a.name}</h3><p className="text-3xl font-black font-mono tracking-tight">{formatCurrency(a.startCapital)}</p></div>
          </Card>
        ))}
      </div>
      {isAdding && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsAdding(false)} />
          <Card className="relative w-full max-w-md animate-fade-in shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Nouveau Compte</h3>
            <form onSubmit={save} className="space-y-4">
               <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom</label><input type="text" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
               <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capital Initial</label><input type="number" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3" value={form.startCapital} onChange={e => setForm({...form, startCapital: parseFloat(e.target.value)})} /></div>
               <Button type="submit" className="w-full py-4">Créer</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

// --- APP CORE ---
const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, theme, setTheme } = useApp();
  const items = [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'journal', label: 'Journal', icon: BookOpen }, { id: 'calendar', label: 'Calendrier', icon: CalendarIcon }, { id: 'cashflow', label: 'Cashflow', icon: DollarSign }, { id: 'accounts', label: 'Comptes', icon: Briefcase }, { id: 'settings', label: 'Réglages', icon: Settings }];
  return (
    <aside className={`fixed left-0 top-0 h-full z-[100] transition-all duration-500 border-r ${theme === 'dark' ? 'bg-black/60 border-white/5 backdrop-blur-3xl' : 'bg-white/95 border-gray-200 backdrop-blur-xl shadow-2xl shadow-gray-200/50'} ${sidebarOpen ? 'w-72' : 'w-24'}`}>
      <div className="p-8 flex items-center gap-4"><div className="w-12 h-12 bg-[#007aff] rounded-[18px] flex items-center justify-center flex-shrink-0"><Zap className="w-6 h-6 text-white" /></div>{sidebarOpen && <h1 className="font-black text-2xl tracking-tighter">TradeLog <span className="text-[#007aff]">V5</span></h1>}</div>
      <nav className="mt-10 px-4 space-y-2">{items.map(i => (
        <button key={i.id} onClick={() => setCurrentPage(i.id)} className={`w-full flex items-center gap-5 p-4 rounded-[22px] transition-all active:scale-95 ${currentPage === i.id ? 'bg-[#007aff] text-white shadow-2xl shadow-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400'}`}>
          <i.icon className={`w-6 h-6 flex-shrink-0 ${currentPage === i.id ? 'stroke-[3px]' : 'stroke-2'}`} />{sidebarOpen && <span className="font-black text-sm tracking-tight">{i.label}</span>}
        </button>
      ))}</nav>
      <div className="absolute bottom-10 left-0 w-full px-4 space-y-3">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center gap-5 p-4 rounded-[22px] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400 transition-all">{theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}{sidebarOpen && <span className="text-sm font-black tracking-tight">Thème {theme === 'dark' ? 'Clair' : 'Sombre'}</span>}</button>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center gap-5 p-4 rounded-[22px] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400 transition-all"><ChevronLeft className={`w-6 h-6 transition-transform duration-500 ${!sidebarOpen ? 'rotate-180' : ''}`} />{sidebarOpen && <span className="text-sm font-black tracking-tight">Masquer</span>}</button>
      </div>
    </aside>
  );
};

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeAccountId, setActiveAccountId] = useState('all');
  const [trades, setTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cashflows, setCashflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, a, cf] = await Promise.all([sbLoadTrades(), sbLoadAccounts(), sbLoadCashflow()]);
      setTrades(t.sort((x, y) => new Date(y.date) - new Date(x.date)));
      setAccounts(a);
      setCashflows(cf);
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setLoading(false), 500); }
  };

  useEffect(() => { localStorage.setItem('theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { fetchData(); }, []);

  const value = { theme, setTheme, sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, activeAccountId, setActiveAccountId, trades, accounts, cashflows, fetchData };

  if (loading) return <div className="h-screen w-full bg-[#f5f5f7] dark:bg-[#02040a] flex items-center justify-center"><div className="w-12 h-12 border-[3px] border-[#007aff]/20 border-t-[#007aff] rounded-full animate-spin" /></div>;

  return (
    <AppContext.Provider value={value}>
      <div className="min-h-screen font-sans text-gray-900 dark:text-slate-100 bg-[#f5f5f7] dark:bg-[#02040a] transition-colors duration-300">
        <Sidebar />
        <main className={`transition-all duration-500 min-h-screen p-8 lg:p-12 ${sidebarOpen ? 'ml-72' : 'ml-24'}`}>
           <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
              <div><h1 className="text-5xl font-black tracking-tighter mb-4">Market <span className="text-[#007aff]">Insight</span></h1><div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 shadow-sm"><Filter className="w-4 h-4 text-gray-400" /><select className="bg-transparent text-xs font-black text-gray-500 uppercase tracking-[0.1em] focus:outline-none cursor-pointer" value={activeAccountId} onChange={e => setActiveAccountId(e.target.value)}><option value="all">Tous les comptes</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div></div>
              <Button onClick={() => setIsModalOpen(true)} icon={Plus} className="py-4 px-10 text-base shadow-2xl">Exécution</Button>
           </header>
           <div className="max-w-7xl mx-auto">
             {currentPage === 'dashboard' && <Dashboard />}
             {currentPage === 'journal' && <Journal />}
             {currentPage === 'cashflow' && <Cashflow />}
             {currentPage === 'accounts' && <AccountsPage />}
           </div>
        </main>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <div className={`relative w-full max-w-2xl rounded-[40px] shadow-2xl animate-fade-in overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}>
               <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center"><h3 className="text-2xl font-black">Nouveau Trade</h3><button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 transition-all"><X className="w-6 h-6" /></button></div>
               <div className="p-10">
                 <form onSubmit={async (e) => { e.preventDefault(); const t = { id: Date.now().toString(), instrument: e.target.p.value, date: e.target.d.value, heure: e.target.h.value, resultat: e.target.r.value, gainPerte: e.target.gp.value, compte: e.target.c.value }; await sbUpsertTrade(t); setIsModalOpen(false); fetchData(); }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-black uppercase">Paire</label><select name="p" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3">{ALLOWED_PAIRS.map(p => <option key={p}>{p}</option>)}</select></div>
                      <div className="space-y-1"><label className="text-[10px] font-black uppercase">Compte</label><select name="c" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3">{accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-black uppercase">Date</label><input name="d" type="date" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3" defaultValue={new Date().toISOString().split('T')[0]} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-black uppercase">Heure</label><input name="h" type="time" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3" defaultValue={new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-black uppercase">Résultat</label><select name="r" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3">{RESULTATS.map(r => <option key={r}>{r}</option>)}</select></div>
                      <div className="space-y-1"><label className="text-[10px] font-black uppercase">P&L ($)</label><input name="gp" type="number" step="0.01" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3" placeholder="0.00" /></div>
                    </div>
                    <Button type="submit" className="w-full py-4 mt-4">Enregistrer</Button>
                 </form>
               </div>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
