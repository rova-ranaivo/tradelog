import React, { useState, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { DisciplineBanner } from './components/DisciplineBanner';
import { TradeForm } from './components/TradeForm';
import { Trade, Account } from './types/trade';
import { TrendingUp, Plus, Search } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  
  // Sample Data (In a real app, this would come from a Store/Supabase)
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts] = useState<Account[]>([
    { id: '1', name: 'Principal', startCapital: 10000, color: '#2558CE' },
    { id: '2', name: 'Prop Firm', startCapital: 50000, color: '#8E6B1E' }
  ]);

  const stats = useMemo(() => {
    const closed = trades.filter(t => t.resultat !== 'En cours');
    const wins = closed.filter(t => t.resultat === 'Win').length;
    const pnl = closed.reduce((acc, t) => acc + t.gainPerte, 0);
    const winRate = closed.length ? Math.round((wins / closed.length) * 100) : 0;
    
    return {
      total: closed.length,
      pnl,
      winRate,
      wins,
      losses: closed.length - wins,
    };
  }, [trades]);

  const handleAddTrade = useCallback((tradeData: Partial<Trade>) => {
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      ...tradeData,
    } as Trade;
    setTrades(prev => [newTrade, ...prev]);
    setIsTradeModalOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-surface-3 font-sans text-text">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-accent-border bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-widest text-text-muted">
              {activePage}
            </h1>
            <span className="text-[10px] text-text-dim font-medium">
              {trades.length} TRADES · {accounts.length} COMPTES
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-1 border border-accent-border rounded px-3 py-1.5 gap-2">
              <Search size={14} className="text-text-dim" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none text-xs focus:outline-none w-48"
              />
            </div>
            <button 
              onClick={() => setIsTradeModalOpen(true)}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded text-xs font-bold shadow-lg hover:bg-accent-dark transition-all"
            >
              <Plus size={14} />
              <span>NOUVEAU TRADE</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && (
              <>
                <div className="mb-8 p-6 bg-terminal rounded-lg shadow-xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">P&L NET RÉALISÉ</span>
                    <div className={`text-4xl font-mono font-bold mt-1 ${stats.pnl >= 0 ? 'text-pnl-green' : 'text-pnl-red'}`}>
                      {stats.pnl >= 0 ? '+' : '-'}${Math.abs(stats.pnl).toLocaleString()}
                    </div>
                    <div className="mt-4 flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase font-bold">Win Rate</span>
                        <span className="text-lg font-mono font-bold">{stats.winRate}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase font-bold">Trades</span>
                        <span className="text-lg font-mono font-bold">{stats.total}</span>
                      </div>
                    </div>
                  </div>
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
                </div>

                <DisciplineBanner trades={trades} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Win Rate', value: `${stats.winRate}%`, sub: `${stats.wins} Gagnants`, color: 'text-pnl-green' },
                    { label: 'P&L Total', value: `$${stats.pnl.toLocaleString()}`, sub: 'Gains nets', color: stats.pnl >= 0 ? 'text-pnl-green' : 'text-pnl-red' },
                    { label: 'Trades', value: stats.total, sub: `${stats.wins}W · ${stats.losses}L`, color: 'text-accent' },
                    { label: 'RR Moyen', value: '2.4', sub: 'Trades fermés', color: 'text-pnl-amber' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded border border-accent-border shadow-sm">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
                      <div className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-text-dim mt-1">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activePage !== 'dashboard' && (
              <div className="flex flex-col items-center justify-center py-20 text-text-dim">
                <div className="bg-surface-2 p-6 rounded-full mb-4">
                  <TrendingUp size={48} className="opacity-20" />
                </div>
                <h2 className="text-xl font-bold text-text-muted">Page {activePage} en cours de migration</h2>
                <p className="text-sm">Consultez le Dashboard pour voir les fonctionnalités implémentées.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isTradeModalOpen && (
        <TradeForm 
          accounts={accounts} 
          onSubmit={handleAddTrade} 
          onClose={() => setIsTradeModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
