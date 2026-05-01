import React, { useState, useEffect, useMemo, createContext, useContext, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, Filler, ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  LayoutDashboard, BookOpen, Calendar as CalendarIcon, Wallet, Settings, 
  RefreshCw, TrendingUp, AlertTriangle, Zap, ChevronLeft, ChevronRight, 
  Plus, Trash2, Sun, Moon, BrainCircuit, CheckCircle2, XCircle, 
  Filter, Search, X, Briefcase, DollarSign, ArrowUpRight, ArrowDownLeft, 
  Tag as TagIcon, Download, Upload, ShieldCheck, Image as ImageIcon,
  CheckSquare, MessageSquare, Info, AlertCircle, Maximize2, Menu, Edit
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://nakykfuduehcwsjuicpb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ha3lrZnVkdWVoY3dzanVpY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTM0MjAsImV4cCI6MjA4ODk4OTQyMH0.dGd4UnYdzOZRrExSW22AJE4RJEtU8y4U4SuXvOY-MMQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

// --- CONSTANTES MÉTIER ---
const ALLOWED_PAIRS = ['EURUSD', 'GBPUSD', 'GBPJPY', 'EURJPY', 'USDJPY', 'XAUUSD'];
const RESULTATS = ['Win', 'Loss', 'Breakeven', 'En cours'];
const SESSIONS = ['Londres', 'NYSE', 'Hors Session'];

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

// --- FONCTIONS SUPABASE ---
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

async function sbLoadTags() {
  const { data } = await supabase.from('tags').select('name');
  return (data || []).map(row => row.name);
}
async function sbUpsertTag(name) { await supabase.from('tags').upsert({ name }, { onConflict: 'name' }); }

// --- CONTEXTE ---
const AppContext = createContext();
const useApp = () => useContext(AppContext);

// --- COMPOSANTS UI ---
const Card = ({ children, className = "", noPadding = false }) => {
  const { theme } = useApp();
  return (
    <div className={`transition-all duration-500 rounded-2xl ${
      theme === 'dark' ? 'bg-slate-900/40 border border-white/5 shadow-xl backdrop-blur-3xl' : 'bg-white border border-gray-100 shadow-sm'
    } ${noPadding ? '' : 'p-4'} ${className}`}>{children}</div>
  );
};

const AccountMultiSelect = () => {
  const { accounts, activeAccountIds, setActiveAccountIds } = useApp();
  
  const toggle = (id) => {
    const next = new Set(activeAccountIds);
    if (id === 'all') {
      setActiveAccountIds(new Set(['all']));
    } else {
      next.delete('all');
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) next.add('all');
      } else {
        next.add(id);
      }
      setActiveAccountIds(next);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      <button 
        onClick={() => toggle('all')}
        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
          activeAccountIds.has('all') ? 'bg-apple-blue text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
        }`}
      >Tous</button>
      {accounts.map(a => (
        <button 
          key={a.id}
          onClick={() => toggle(a.id)}
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
            activeAccountIds.has(a.id) ? 'bg-apple-blue text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
          {a.name}
        </button>
      ))}
    </div>
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
  return <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${variants[variant]}`}>{children}</span>;
};

const Button = ({ children, onClick, variant = 'primary', className = "", icon: Icon, type = "button", disabled = false }) => {
  const variants = {
    primary: 'bg-[#007aff] text-white hover:opacity-90 shadow-lg shadow-blue-500/20',
    secondary: 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-black transition-all active:scale-95 text-xs disabled:opacity-50 ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5 stroke-[3px]" />}{children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  const { theme } = useApp();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} rounded-3xl shadow-2xl animate-slide overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}>
         <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
           <h3 className="text-xl font-black tracking-tighter">{title}</h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 transition-all"><X className="w-5 h-5" /></button>
         </div>
         <div className="p-8 max-h-[85vh] overflow-y-auto hide-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- PAGES ---

const AIChat = () => {
  const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('ai_chat_history') || '[]'));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { 
    localStorage.setItem('ai_chat_history', JSON.stringify(messages)); 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${SUPABASE_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: input }] }] })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je ne peux pas répondre pour le moment.";
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion à Gemini." }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-4 animate-slide">
       <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
         {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center opacity-30">
             <MessageSquare className="w-12 h-12 mb-3" />
             <p className="font-black uppercase tracking-widest text-[10px]">IA de Trading Gemini</p>
           </div>
         )}
         {messages.map((m, i) => (
           <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
               m.role === 'user' ? 'bg-apple-blue text-white rounded-tr-none shadow-md' : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-tl-none'
             }`}>{m.content}</div>
           </div>
         ))}
         {loading && <div className="flex justify-start"><div className="bg-gray-100 dark:bg-white/5 p-3 rounded-full animate-pulse"><Zap className="w-4 h-4 text-indigo-500" /></div></div>}
         <div ref={bottomRef} />
       </div>
       <form onSubmit={send} className="relative">
         <textarea 
           value={input} 
           onChange={e => setInput(e.target.value)}
           placeholder="Posez une question technique ou psychologique..."
           className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl px-6 py-4 pr-16 text-xs font-bold focus:ring-4 focus:ring-apple-blue/10 shadow-xl resize-none"
           rows="1"
           onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }}
         />
         <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-apple-blue text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all">
           <Zap className="w-4 h-4" />
         </button>
       </form>
    </div>
  );
};

const Dashboard = () => {
  const { trades, activeAccountIds, accounts } = useApp();
  
  const filtered = useMemo(() => {
    return activeAccountIds.has('all') 
      ? trades 
      : trades.filter(t => activeAccountIds.has(accounts.find(a => a.name === t.compte)?.id));
  }, [trades, activeAccountIds, accounts]);

  const stats = useMemo(() => {
    const closed = filtered.filter(t => t.resultat !== 'En cours');
    const pnl = closed.reduce((acc, t) => acc + (parseFloat(t.gainPerte) || 0), 0);
    const winrate = closed.length ? Math.round((closed.filter(t => t.resultat === 'Win').length / closed.length) * 100) : 0;
    const disc = closed.length ? Math.round((closed.filter(t => checkConformity(t).isConform).length / closed.length) * 100) : 0;
    const profitFactor = (() => {
      const gains = closed.filter(t => parseFloat(t.gainPerte) > 0).reduce((acc, t) => acc + parseFloat(t.gainPerte), 0);
      const pertes = Math.abs(closed.filter(t => parseFloat(t.gainPerte) < 0).reduce((acc, t) => acc + parseFloat(t.gainPerte), 0));
      return pertes === 0 ? gains.toFixed(2) : (gains / pertes).toFixed(2);
    })();
    return { pnl, winrate, disc, closed: closed.length, profitFactor };
  }, [filtered]);

  // Equity Curve Data
  const chartData = useMemo(() => {
    const sorted = [...filtered].filter(t => t.resultat !== 'En cours').sort((a,b) => new Date(a.date) - new Date(b.date));
    let balance = 0;
    const points = sorted.map(t => {
      balance += parseFloat(t.gainPerte);
      return balance;
    });
    const labels = sorted.map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    return { labels, points };
  }, [filtered]);

  const instrumentData = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      map[t.instrument] = (map[t.instrument] || 0) + parseFloat(t.gainPerte);
    });
    return {
      labels: Object.keys(map),
      datasets: [{
        data: Object.values(map),
        backgroundColor: ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6']
      }]
    };
  }, [filtered]);

  const weekdayData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const values = new Array(7).fill(0);
    filtered.forEach(t => {
      const day = new Date(t.date).getDay();
      values[day] += parseFloat(t.gainPerte);
    });
    return {
      labels: days,
      datasets: [{
        label: 'P&L par jour',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? 'rgba(52, 199, 89, 0.6)' : 'rgba(255, 59, 48, 0.6)'),
        borderRadius: 8
      }]
    };
  }, [filtered]);

  return (
    <div className="space-y-4 animate-slide">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="group hover:scale-[1.01] transition-all">
          <div className="flex justify-between items-start mb-3"><TrendingUp className={`w-4 h-4 ${stats.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} /><Badge variant={stats.pnl >= 0 ? 'success' : 'error'}>{stats.pnl >= 0 ? 'Profit' : 'Perte'}</Badge></div>
          <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">P&L Net</p><h3 className={`text-2xl font-black font-mono tracking-tighter ${stats.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(stats.pnl)}</h3></div>
        </Card>
        <Card className="group hover:scale-[1.01] transition-all">
          <div className="flex justify-between items-start mb-3"><Zap className="w-4 h-4 text-blue-500" /><Badge variant="info">Performance</Badge></div>
          <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Winrate</p><h3 className="text-2xl font-black font-mono tracking-tighter">{stats.winrate}%</h3></div>
        </Card>
        <Card className="group hover:scale-[1.01] transition-all border border-indigo-500/10">
          <div className="flex justify-between items-start mb-3"><ShieldCheck className="w-4 h-4 text-indigo-500" /><Badge variant={stats.disc >= 80 ? 'success' : 'warning'}>{stats.disc}%</Badge></div>
          <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Discipline</p><h3 className={`text-2xl font-black font-mono tracking-tighter ${stats.disc >= 80 ? 'text-indigo-500' : 'text-amber-500'}`}>{stats.disc}%</h3></div>
        </Card>
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-md h-full">
          <div className="rounded-[calc(1rem-1px)] p-4 h-full flex flex-col justify-between bg-white/95 dark:bg-slate-950/90 backdrop-blur-3xl">
             <div className="flex items-center gap-2 mb-2"><BrainCircuit className="w-5 h-5 text-indigo-500" /><h3 className="font-black text-base tracking-tighter">Coach IA</h3></div>
             <p className="text-[10px] leading-relaxed italic opacity-70">Focus : session {stats.winrate > 50 ? 'optimisée' : 'à revoir'}.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-black text-lg tracking-tighter">Equity</h3>
             <div className="flex gap-1.5">
               <Badge variant="info">PF: {stats.profitFactor}</Badge>
               <Badge variant="neutral">{stats.closed} Trades</Badge>
             </div>
           </div>
           <div className="h-[250px]">
             <Line 
               data={{
                 labels: chartData.labels,
                 datasets: [{ 
                   label: 'Equity', 
                   data: chartData.points, 
                   borderColor: '#007aff', 
                   backgroundColor: 'rgba(0,122,255,0.05)', 
                   fill: true, 
                   tension: 0.4, 
                   borderWidth: 2.5, 
                   pointRadius: 0,
                   pointHoverRadius: 4
                 }]
               }}
               options={{ 
                 responsive: true, 
                 maintainAspectRatio: false, 
                 plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, 
                 scales: { 
                   x: { grid: { display: false }, ticks: { font: { size: 8 } } }, 
                   y: { grid: { color: 'rgba(0,0,0,0.02)' }, ticks: { font: { size: 8 } } } 
                 } 
               }}
             />
           </div>
        </Card>
        <Card>
           <div className="flex items-center gap-2 mb-4 text-rose-500"><AlertTriangle className="w-5 h-5" /><h3 className="font-black text-lg tracking-tighter">Anomalies</h3></div>
           <div className="space-y-2">
             {filtered.filter(t => !checkConformity(t).isConform).slice(0, 5).map(t => (
               <div key={t.id} className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex justify-between items-center group hover:bg-rose-500/10 transition-all cursor-pointer">
                 <div><p className="text-xs font-black tracking-tight">{t.instrument}</p><p className="text-[8px] text-rose-500 font-black uppercase tracking-widest">{checkConformity(t).reason}</p></div>
                 <div className="text-right">
                   <p className="text-xs font-black font-mono text-rose-500">{formatCurrency(t.gainPerte)}</p>
                 </div>
               </div>
             ))}
             {filtered.filter(t => !checkConformity(t).isConform).length === 0 && (
               <div className="py-12 flex flex-col items-center opacity-30 text-emerald-500">
                 <CheckCircle2 className="w-10 h-10 mb-2" />
                 <p className="text-[8px] font-black uppercase tracking-[0.2em]">Discipline OK</p>
               </div>
             )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-black text-base tracking-tighter mb-4">P&L Instrument</h3>
          <div className="h-[180px]">
            <Bar data={instrumentData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { font: { size: 7 } } }, x: { ticks: { font: { size: 7 } } } } }} />
          </div>
        </Card>
        <Card>
          <h3 className="font-black text-base tracking-tighter mb-4">P&L Journée</h3>
          <div className="h-[180px]">
            <Bar data={weekdayData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { font: { size: 7 } } }, x: { ticks: { font: { size: 7 } } } } }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

const TradeModal = ({ isOpen, onClose, accounts, ALLOWED_PAIRS, RESULTATS, sbUpsertTrade, fetchData, editingTrade }) => {
  const [urls, setUrls] = useState({ avant: '', apres: '' });
  const { openImageModal } = useApp();

  useEffect(() => {
    if (editingTrade) {
      setUrls({ avant: editingTrade.urlAvant || '', apres: editingTrade.urlApres || '' });
    } else {
      setUrls({ avant: '', apres: '' });
    }
  }, [editingTrade, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTrade ? "Modifier le Trade" : "Exécuter un Trade"} maxWidth="max-w-5xl">
      <form onSubmit={async (e) => { 
        e.preventDefault(); 
        const formData = new FormData(e.target);
        const trade = {
          id: editingTrade ? editingTrade.id : Date.now().toString(),
          instrument: formData.get('p'),
          date: formData.get('d'),
          heure: formData.get('h'),
          resultat: formData.get('r'),
          gainPerte: formData.get('gp'),
          compte: formData.get('c'),
          urlAvant: formData.get('ua'),
          urlApres: formData.get('uap'),
          note: formData.get('n'),
          tags: formData.get('t').split(',').map(s => s.trim()).filter(s => s)
        };
        await sbUpsertTrade(trade); 
        onClose(); 
        fetchData(); 
      }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Paire</label><select name="p" defaultValue={editingTrade?.instrument} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10">{ALLOWED_PAIRS.map(p => <option key={p}>{p}</option>)}</select></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Compte</label><select name="c" defaultValue={editingTrade?.compte} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10">{accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}</select></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date</label><input name="d" type="date" defaultValue={editingTrade?.date || new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" /></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Heure</label><input name="h" type="time" defaultValue={editingTrade?.heure || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" /></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Résultat</label><select name="r" defaultValue={editingTrade?.resultat} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10">{RESULTATS.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">P&L ($)</label><input name="gp" type="number" step="0.01" defaultValue={editingTrade?.gainPerte} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" required /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Capture Avant</label><input name="ua" type="url" value={urls.avant} onChange={e => setUrls({...urls, avant: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" placeholder="URL" /></div>
            <div className="w-full aspect-video rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center cursor-zoom-in" onClick={() => urls.avant && openImageModal(urls.avant)}>
              {urls.avant ? <img src={urls.avant} className="w-full h-full object-cover" alt="Avant" /> : <ImageIcon className="w-6 h-6 opacity-20" />}
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Capture Après</label><input name="uap" type="url" value={urls.apres} onChange={e => setUrls({...urls, apres: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" placeholder="URL" /></div>
            <div className="w-full aspect-video rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center cursor-zoom-in" onClick={() => urls.apres && openImageModal(urls.apres)}>
              {urls.apres ? <img src={urls.apres} className="w-full h-full object-cover" alt="Après" /> : <ImageIcon className="w-6 h-6 opacity-20" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Notes</label><textarea name="n" rows="3" defaultValue={editingTrade?.note} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" placeholder="Pourquoi ce trade ?" /></div>
          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tags</label><input name="t" type="text" defaultValue={editingTrade?.tags?.join(', ')} className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-full px-6 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" /></div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
           <Button type="submit" className="py-4 px-12 text-sm rounded-full">{editingTrade ? "Mettre à jour" : "Enregistrer"}</Button>
        </div>
      </form>
    </Modal>
  );
};

const Journal = () => {
  const { trades, accounts, activeAccountIds, fetchData, openImageModal, setEditingTrade, setIsModalOpen } = useApp();
  const [filters, setFilters] = useState({ search: '', instrument: 'all', result: 'all', session: 'all', period: 'all' });

  const filtered = trades.filter(t => {
    const accId = accounts.find(a => a.name === t.compte)?.id;
    const accMatch = activeAccountIds.has('all') || activeAccountIds.has(accId);
    const searchMatch = t.instrument.toLowerCase().includes(filters.search.toLowerCase()) || (t.note || '').toLowerCase().includes(filters.search.toLowerCase());
    const instMatch = filters.instrument === 'all' || t.instrument === filters.instrument;
    const resMatch = filters.result === 'all' || t.resultat === filters.result;
    const sessMatch = filters.session === 'all' || getSessionFromTime(t.heure) === filters.session;
    
    let periodMatch = true;
    if (filters.period !== 'all') {
      const d = new Date(t.date);
      const now = new Date();
      if (filters.period === 'today') periodMatch = d.toDateString() === now.toDateString();
      else if (filters.period === 'week') {
        const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
        periodMatch = d >= weekAgo;
      }
      else if (filters.period === 'month') periodMatch = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return accMatch && searchMatch && instMatch && resMatch && sessMatch && periodMatch;
  });

  const remove = async (id) => { if(confirm("Supprimer ce trade ?")) { await sbDeleteTrade(id); fetchData(); } };
  const edit = (trade) => { setEditingTrade(trade); setIsModalOpen(true); };

  const exportData = (format) => {
    const data = format === 'json' ? JSON.stringify(filtered, null, 2) : 
      ["Instrument,Date,Heure,Resultat,P&L,Compte,Note", ...filtered.map(t => `${t.instrument},${t.date},${t.heure},${t.resultat},${t.gainPerte},${t.compte},"${t.note || ''}"`)].join("\n");
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradelog_export_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-slide">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h2 className="text-2xl font-black tracking-tighter">Journal <span className="text-apple-blue">{filtered.length}</span></h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => exportData('csv')} icon={Download} className="px-3 py-1.5 text-[10px]">CSV</Button>
          <Button variant="secondary" onClick={() => exportData('json')} icon={Download} className="px-3 py-1.5 text-[10px]">JSON</Button>
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Recherche..." className="w-full pl-9 pr-4 py-2.5 rounded-full border-none bg-white dark:bg-slate-900 text-[10px] font-medium focus:ring-4 focus:ring-apple-blue/10 shadow-sm" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        <select className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer" value={filters.instrument} onChange={e => setFilters({...filters, instrument: e.target.value})}><option value="all">Tous Instruments</option>{ALLOWED_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}</select>
        <select className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer" value={filters.result} onChange={e => setFilters({...filters, result: e.target.value})}><option value="all">Tous Résultats</option>{RESULTATS.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <select className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer" value={filters.session} onChange={e => setFilters({...filters, session: e.target.value})}><option value="all">Toutes Sessions</option>{SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer" value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})}><option value="all">Toute Période</option><option value="today">Aujourd'hui</option><option value="week">7 jours</option><option value="month">Mois</option></select>
        <Button variant="ghost" onClick={() => setFilters({ search: '', instrument: 'all', result: 'all', session: 'all', period: 'all' })} icon={RefreshCw} className="px-2 py-1 text-[9px]">Reset</Button>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[8px] uppercase font-black text-gray-400 border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3">Instrument</th>
                <th className="px-3 py-3 text-center">Session</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-right">P&L</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map(t => {
                const isConform = checkConformity(t).isConform;
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-8 rounded-full ${t.resultat === 'Win' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : t.resultat === 'Loss' ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-gray-400'}`} />
                        <div className="flex items-center gap-2">
                          {t.urlAvant && (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden cursor-zoom-in group/img" onClick={() => openImageModal(t.urlAvant)}>
                               <img src={t.urlAvant} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Avant" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="font-black text-sm tracking-tighter">{t.instrument}</p>
                              {!isConform && <AlertCircle className="w-3 h-3 text-rose-500" title={checkConformity(t).reason} />}
                            </div>
                            <p className="text-[7px] opacity-40 font-bold uppercase">{t.date} • {t.heure}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center"><Badge variant={getSessionFromTime(t.heure) === 'NYSE' ? 'info' : getSessionFromTime(t.heure) === 'Londres' ? 'success' : 'neutral'}>{getSessionFromTime(t.heure)}</Badge></td>
                    <td className="px-3 py-3 text-center"><span className={`text-[8px] font-black px-2 py-0.5 rounded-lg ${t.resultat === 'Win' ? 'bg-emerald-500/10 text-emerald-600' : t.resultat === 'Loss' ? 'bg-rose-500/10 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>{t.resultat}</span></td>
                    <td className={`px-3 py-3 text-right font-black font-mono text-sm ${parseFloat(t.gainPerte) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(t.gainPerte)}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                         <button onClick={() => edit(t)} className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all"><Edit className="w-3.5 h-3.5" /></button>
                         <button onClick={() => remove(t.id)} className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Calendar = () => {
  const { trades, accounts, activeAccountIds, setEditingTrade, setIsModalOpen } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState(null);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  const filtered = useMemo(() => {
    return activeAccountIds.has('all') ? trades : trades.filter(t => activeAccountIds.has(accounts.find(a => a.name === t.compte)?.id));
  }, [trades, activeAccountIds, accounts]);

  const monthTrades = filtered.filter(t => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year; });

  const calendarDays = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= numDays; d++) calendarDays.push(d);

  const getDayStats = (day) => {
    const dayTrades = monthTrades.filter(t => new Date(t.date).getDate() === day);
    const pnl = dayTrades.reduce((acc, t) => acc + (parseFloat(t.gainPerte) || 0), 0);
    const count = dayTrades.length;
    return { pnl, count, trades: dayTrades };
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div className="space-y-4 animate-slide">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-black tracking-tighter">{monthNames[month]} <span className="text-apple-blue">{year}</span></h2>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-full shadow-sm">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={goToday} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">Aujourd'hui</button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} className="text-center text-[7px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-20 rounded-xl bg-gray-50/30 dark:bg-white/2" />;
          const stats = getDayStats(day);
          return (
            <div key={day} onClick={() => stats.count > 0 && setSelectedDayTrades(stats.trades)} className={`h-20 p-2 rounded-xl border transition-all flex flex-col justify-between group cursor-pointer ${stats.count > 0 ? (stats.pnl >= 0 ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10') : 'bg-white dark:bg-slate-900 border-transparent hover:border-gray-200 dark:hover:border-white/10'}`}>
              <div className="flex justify-between items-start"><span className="text-xs font-black tracking-tighter opacity-40">{day}</span>{stats.count > 0 && <Badge variant={stats.pnl >= 0 ? 'success' : 'error'}>{stats.count}</Badge>}</div>
              {stats.count > 0 && <div><p className={`text-[9px] font-black font-mono tracking-tighter ${stats.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{stats.pnl > 0 ? '+' : ''}{Math.round(stats.pnl)}</p></div>}
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!selectedDayTrades} onClose={() => setSelectedDayTrades(null)} title="Détail du Jour" maxWidth="max-w-xl">
        <div className="space-y-3">
          {selectedDayTrades?.map(t => (
            <div key={t.id} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 flex justify-between items-center cursor-pointer hover:scale-[1.01] transition-all" onClick={() => { setEditingTrade(t); setIsModalOpen(true); setSelectedDayTrades(null); }}>
              <div><p className="text-sm font-black tracking-tighter">{t.instrument}</p><p className="text-[7px] opacity-40 font-bold uppercase tracking-widest">{t.heure} • {t.compte}</p></div>
              <div className="text-right"><p className={`text-sm font-black font-mono ${parseFloat(t.gainPerte) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(t.gainPerte)}</p><Badge variant={t.resultat === 'Win' ? 'success' : 'error'}>{t.resultat}</Badge></div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

const Cashflow = () => {
  const { cashflows, accounts, fetchData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ type: 'Dépôt', date: new Date().toISOString().split('T')[0], compte: '', montantUSD: 0, montantMUR: 0, taux: 45, note: '' });

  const save = async (e) => {
    e.preventDefault();
    if (!form.compte) return alert("Choisissez un compte");
    await sbUpsertCF({ ...form, id: Date.now().toString() });
    setIsAdding(false);
    fetchData();
  };

  return (
    <div className="space-y-4 animate-slide">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tighter">Cashflow</h2>
        <Button onClick={() => setIsAdding(true)} icon={Plus} className="py-2.5 px-5">Nouveau</Button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col justify-between"><div className="flex justify-between items-start mb-2"><ArrowUpRight className="w-5 h-5 text-emerald-500" /><Badge variant="success">IN</Badge></div><div><p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Dépôts</p><h3 className="text-xl font-black font-mono text-emerald-500">{formatCurrency(cashflows.filter(c => c.type === 'Dépôt').reduce((acc, c) => acc + c.montantUSD, 0))}</h3></div></Card>
        <Card className="flex flex-col justify-between"><div className="flex justify-between items-start mb-2"><ArrowDownLeft className="w-5 h-5 text-rose-500" /><Badge variant="error">OUT</Badge></div><div><p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Retraits</p><h3 className="text-xl font-black font-mono text-rose-500">{formatCurrency(cashflows.filter(c => c.type === 'Retrait').reduce((acc, c) => acc + c.montantUSD, 0))}</h3></div></Card>
        <Card className="flex flex-col justify-between border border-apple-blue/10"><div className="flex justify-between items-start mb-2"><Wallet className="w-5 h-5 text-apple-blue" /><Badge variant="info">NET</Badge></div><div><p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Balance</p><h3 className="text-xl font-black font-mono text-apple-blue">{formatCurrency(cashflows.reduce((acc, c) => acc + (c.type === 'Dépôt' ? c.montantUSD : -c.montantUSD), 0))}</h3></div></Card>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[8px] uppercase font-black text-gray-400 border-b border-gray-100 dark:border-white/5"><th className="px-5 py-3">Mouvement</th><th className="px-3 py-3">Compte</th><th className="px-3 py-3 text-right">USD</th><th className="px-5 py-3 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {cashflows.map(cf => (
                <tr key={cf.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"><td className="px-5 py-3"><div className="flex items-center gap-2"><div className={`p-1.5 rounded-lg ${cf.type === 'Dépôt' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{cf.type === 'Dépôt' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}</div><div><p className="font-black text-sm tracking-tighter">{cf.type}</p><p className="text-[7px] opacity-40 font-bold uppercase tracking-widest">{cf.date}</p></div></div></td><td className="px-3 py-3 font-black text-gray-500 text-[10px]">{cf.compte}</td><td className={`px-3 py-3 text-right font-black font-mono text-sm ${cf.type === 'Dépôt' ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(cf.montantUSD)}</td><td className="px-5 py-3 text-center"><button onClick={async () => { if(confirm("Supprimer ?")) { await sbDeleteCF(cf.id); fetchData(); } }} className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Mouvement Cashflow">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Type</label><select className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Dépôt</option><option>Retrait</option></select></div>
            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Date</label><input type="date" className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
          </div>
          <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Compte</label><select className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" value={form.compte} onChange={e => setForm({...form, compte: e.target.value})}><option value="">Choisir...</option>{accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">USD</label><input type="number" step="0.01" className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" value={form.montantUSD} onChange={e => { const v = parseFloat(e.target.value) || 0; setForm({...form, montantUSD: v, montantMUR: Math.round(v * form.taux)}); }} /></div>
            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Taux</label><input type="number" step="0.1" className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" value={form.taux} onChange={e => { const t = parseFloat(e.target.value) || 0; setForm({...form, taux: t, montantMUR: Math.round(form.montantUSD * t)}); }} /></div>
          </div>
          <Button type="submit" className="w-full py-3 text-xs rounded-xl">Valider</Button>
        </form>
      </Modal>
    </div>
  );
};

const AccountsPage = () => {
  const { accounts, fetchData } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', startCapital: 100000, color: '#007aff' });

  const save = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    await sbUpsertAccount({ ...form, id: Date.now().toString() });
    setIsAdding(false);
    setForm({ name: '', startCapital: 100000, color: '#007aff' });
    fetchData();
  };

  return (
    <div className="space-y-4 animate-slide">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tighter">Comptes</h2>
        <Button onClick={() => setIsAdding(true)} icon={Plus} className="py-2 px-5">Nouveau</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(a => (
          <Card key={a.id} className="relative group overflow-hidden border-b-4 shadow-lg" style={{ borderBottomColor: a.color }}>
            <div className="flex justify-between items-start mb-4"><div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5" style={{ color: a.color }}><Wallet className="w-5 h-5" /></div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={async () => { if(confirm("Supprimer ?")){ await sbDeleteAccount(a.id); fetchData(); } }} className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"><Trash2 className="w-3.5 h-3.5" /></button></div></div>
            <div><h3 className="text-lg font-black tracking-tighter mb-0.5">{a.name}</h3><p className="text-2xl font-black font-mono tracking-tighter opacity-80">{formatCurrency(a.startCapital)}</p></div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Créer un Compte">
        <form onSubmit={save} className="space-y-4">
           <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Nom</label><input type="text" className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" placeholder="Ex: FTMO" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
           <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Capital ($)</label><input type="number" className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" value={form.startCapital} onChange={e => setForm({...form, startCapital: parseFloat(e.target.value) || 0})} /></div>
           <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Couleur</label><div className="flex gap-1.5 p-2 bg-gray-50 dark:bg-white/5 rounded-xl">{['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6'].map(c => (<button key={c} type="button" onClick={() => setForm({...form, color: c})} className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent opacity-40'}`} style={{ backgroundColor: c }} />))}</div></div>
           <Button type="submit" className="w-full py-3 text-xs rounded-xl">Initialiser</Button>
        </form>
      </Modal>
    </div>
  );
};

const RulesPage = () => {
  const [rules, setRules] = useState(JSON.parse(localStorage.getItem('trade_rules') || '[]'));
  const [newRule, setNewRule] = useState('');
  useEffect(() => { localStorage.setItem('trade_rules', JSON.stringify(rules)); }, [rules]);
  const add = (e) => { e.preventDefault(); if (!newRule) return; setRules([...rules, { id: Date.now(), text: newRule, active: true }]); setNewRule(''); };
  const toggle = (id) => setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const remove = (id) => setRules(rules.filter(r => r.id !== id));

  return (
    <div className="space-y-4 animate-slide">
      <h2 className="text-2xl font-black tracking-tighter">Stratégie</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><h3 className="text-base font-black tracking-tighter mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-apple-blue" />Ma Stratégie</h3><form onSubmit={add} className="flex gap-2 mb-4"><input type="text" className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-full px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-apple-blue/10" placeholder="Ajouter une règle..." value={newRule} onChange={e => setNewRule(e.target.value)} /><Button type="submit" icon={Plus} className="px-3 py-1.5">Ajouter</Button></form><div className="space-y-2">{rules.map(r => (<div key={r.id} className={`p-3 rounded-xl border transition-all flex justify-between items-center ${r.active ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5' : 'bg-gray-50 dark:bg-white/2 border-transparent opacity-40'}`}><div className="flex items-center gap-2 cursor-pointer" onClick={() => toggle(r.id)}><div className={`w-4 h-4 rounded-md flex items-center justify-center border-2 transition-all ${r.active ? 'bg-apple-blue border-apple-blue text-white' : 'border-gray-200'}`}>{r.active && <CheckSquare className="w-3 h-3" />}</div><span className="font-bold text-[10px]">{r.text}</span></div><button onClick={() => remove(r.id)} className="p-1 text-gray-300 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button></div>))}</div></Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none"><div className="flex items-center gap-2 mb-3"><Info className="w-5 h-5" /><h3 className="text-base font-black tracking-tighter">Rappel</h3></div><p className="text-xs font-bold leading-relaxed italic opacity-90">"La discipline est la seule protection contre vos propres émotions."</p></Card>
      </div>
    </div>
  );
};

// --- APP CORE ---
const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, currentPage, setCurrentPage, theme, setTheme } = useApp();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'calendar', label: 'Calendrier', icon: CalendarIcon },
    { id: 'cashflow', label: 'Cashflow', icon: DollarSign },
    { id: 'accounts', label: 'Comptes', icon: Briefcase },
    { id: 'ai-chat', label: 'IA Chat', icon: MessageSquare },
    { id: 'rules', label: 'Stratégie', icon: CheckSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full z-[150] transition-all duration-700 border-r ${theme === 'dark' ? 'bg-slate-950/80 border-white/5 backdrop-blur-3xl' : 'bg-white/90 border-gray-100 backdrop-blur-2xl shadow-xl'} ${sidebarOpen ? 'w-64 md:w-80' : 'w-16 md:w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-4 md:p-8 flex items-center gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-apple-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"><Zap className="w-6 h-6 text-white stroke-[3px]" /></div>
        {sidebarOpen && <h1 className="font-black text-lg md:text-2xl tracking-tighter">TradeLog <span className="text-apple-blue">V5</span></h1>}
      </div>
      <nav className="mt-6 px-3 space-y-1.5">
        {items.map(i => (
          <button key={i.id} onClick={() => { setCurrentPage(i.id); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${currentPage === i.id ? 'bg-apple-blue text-white shadow-xl shadow-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400'}`}>
            <i.icon className={`w-5 h-5 flex-shrink-0 transition-all ${currentPage === i.id ? 'stroke-[3px] scale-110' : 'stroke-2'}`} />
            {sidebarOpen && <span className="font-black text-[11px] md:text-xs tracking-tight">{i.label}</span>}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-8 left-0 w-full px-3 space-y-2">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400 transition-all">{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}{sidebarOpen && <span className="text-[11px] font-black tracking-tight">{theme === 'dark' ? 'Clair' : 'Sombre'}</span>}</button>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex w-full items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400 transition-all"><ChevronLeft className={`w-5 h-5 transition-transform duration-700 ${!sidebarOpen ? 'rotate-180' : ''}`} />{sidebarOpen && <span className="text-[11px] font-black tracking-tight">Réduire</span>}</button>
      </div>
    </aside>
  );
};

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeAccountIds, setActiveAccountIds] = useState(new Set(['all']));
  const [trades, setTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cashflows, setCashflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [imgModal, setImgModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, a, cf] = await Promise.all([sbLoadTrades(), sbLoadAccounts(), sbLoadCashflow()]);
      setTrades(t.sort((x, y) => new Date(y.date) - new Date(x.date)));
      setAccounts(a);
      setCashflows(cf);
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setLoading(false), 300); }
  };

  useEffect(() => { localStorage.setItem('theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { fetchData(); }, []);

  const openImageModal = (url) => setImgModal(url);

  const value = { theme, setTheme, sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, currentPage, setCurrentPage, activeAccountIds, setActiveAccountIds, trades, accounts, cashflows, fetchData, openImageModal, setEditingTrade, setIsModalOpen };

  if (loading) return (
    <div className="h-screen w-full bg-[#f5f5f7] dark:bg-[#02040a] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center animate-bounce shadow-2xl"><Zap className="w-8 h-8 text-white stroke-[3px]" /></div>
      <div className="w-40 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-apple-blue animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} /></div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }`}</style>
    </div>
  );

  return (
    <AppContext.Provider value={value}>
      <div className="min-h-screen font-sans text-slate-900 dark:text-slate-100 bg-[#f5f5f7] dark:bg-[#02040a] transition-colors duration-500">
        <Sidebar />
        {mobileSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] md:hidden" onClick={() => setMobileSidebarOpen(false)} />}
        <main className={`transition-all duration-700 min-h-screen p-4 md:p-10 ${sidebarOpen ? 'md:ml-80' : 'md:ml-20'}`}>
           <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-8 animate-slide">
              <div className="w-full">
                <div className="flex items-center justify-between md:block mb-3">
                  <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">Market <span className="text-apple-blue">Insight</span></h1>
                  <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5"><Menu className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-white/5 w-fit">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <AccountMultiSelect />
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={() => { setEditingTrade(null); setIsModalOpen(true); }} icon={Plus} className="flex-1 md:flex-none py-3 px-8 text-xs shadow-xl rounded-xl">Exécuter</Button>
              </div>
           </header>
           <div className="max-w-7xl mx-auto">
             {currentPage === 'dashboard' && <Dashboard />}
             {currentPage === 'journal' && <Journal />}
             {currentPage === 'calendar' && <Calendar />}
             {currentPage === 'cashflow' && <Cashflow />}
             {currentPage === 'accounts' && <AccountsPage />}
             {currentPage === 'ai-chat' && <AIChat />}
             {currentPage === 'rules' && <RulesPage />}
             {currentPage === 'settings' && <div className="p-20 text-center opacity-30"><Settings className="w-12 h-12 mx-auto mb-4" /><h3 className="text-sm font-black uppercase tracking-widest text-sm">Paramètres</h3></div>}
           </div>
        </main>
        <TradeModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTrade(null); }} accounts={accounts} ALLOWED_PAIRS={ALLOWED_PAIRS} RESULTATS={RESULTATS} sbUpsertTrade={sbUpsertTrade} fetchData={fetchData} editingTrade={editingTrade} />
        {imgModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setImgModal(null)} />
             <div className="relative max-w-7xl max-h-full flex flex-col items-center">
                <img src={imgModal} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl animate-slide object-contain" alt="Full" />
                <button onClick={() => setImgModal(null)} className="mt-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"><X className="w-6 h-6" /></button>
             </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
