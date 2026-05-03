import React from 'react';
import { usePerformanceAudit } from '../hooks/usePerformanceAudit';
import { Trade } from '../types/trade';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface DisciplineBannerProps {
  trades: Trade[];
}

export const DisciplineBanner: React.FC<DisciplineBannerProps> = ({ trades }) => {
  const { score, leak, theoreticalPnl, total, undisciplinedCount } = usePerformanceAudit(trades);

  if (total === 0) return null;

  const getScoreColor = () => {
    if (score >= 80) return 'text-pnl-green';
    if (score >= 60) return 'text-text';
    return 'text-pnl-red';
  };

  const message = leak > 0
    ? `Votre indiscipline coûte $${leak.toLocaleString()} · Votre capital serait plus élevé si le plan était respecté.`
    : `Discipline parfaite sur la période — continuez sur cette lancée !`;

  return (
    <div className="bg-surface-3 border border-accent-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Discipline Score</span>
          <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}%</span>
          <span className="text-xs text-text-dim">{total - undisciplinedCount}/{total} trades conformes</span>
        </div>
        
        <div className="flex flex-col border-l border-accent-border md:pl-6">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Equity Leak</span>
          <span className="text-2xl font-bold text-pnl-amber">-${leak.toLocaleString()}</span>
          <span className="text-xs text-text-dim">pertes sur trades indisciplinés</span>
        </div>

        <div className="flex flex-col border-l border-accent-border md:pl-6">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Capital Théorique</span>
          <span className="text-2xl font-bold text-pnl-green">${theoreticalPnl.toLocaleString()}</span>
          <span className="text-xs text-text-dim">si plan respecté à 100%</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-accent-border flex items-center gap-2 text-sm text-text-muted">
        <Zap className="w-4 h-4 text-pnl-amber" />
        <span>{message}</span>
      </div>
    </div>
  );
};
