import { useMemo } from 'react';
import { Trade } from '../types/trade';

export const usePerformanceAudit = (trades: Trade[]) => {
  return useMemo(() => {
    const closedTrades = trades.filter(t => t.resultat !== 'En cours');
    
    if (closedTrades.length === 0) {
      return {
        score: 100,
        leak: 0,
        total: 0,
        undisciplinedCount: 0,
        theoreticalPnl: 0,
      };
    }

    const undisciplined = closedTrades.filter(t => {
      const isHorsZone = t.horsZone;
      const isFragile = t.structureFragile;
      const isLowConfidence = t.stars < 3;
      return isHorsZone || isFragile || isLowConfidence;
    });

    const score = Math.round((1 - undisciplined.length / closedTrades.length) * 100);
    
    const leak = Math.abs(undisciplined.reduce((acc, t) => {
      return acc + (t.gainPerte < 0 ? t.gainPerte : 0);
    }, 0));

    const actualPnl = closedTrades.reduce((acc, t) => acc + t.gainPerte, 0);
    const theoreticalPnl = actualPnl + leak;

    return {
      score,
      leak,
      total: closedTrades.length,
      undisciplinedCount: undisciplined.length,
      theoreticalPnl,
    };
  }, [trades]);
};
