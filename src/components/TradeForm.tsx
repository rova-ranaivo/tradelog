import React, { useState, useEffect } from 'react';
import { Trade, Account, Instrument, Session, Structure, Etat, Resultat } from '../types/trade';
import { INSTRUMENTS, SESSIONS, STRUCTURES, ETATS, RESULTATS, SESSION_HOURS } from '../config/constants';
import { Star, X } from 'lucide-react';

interface TradeFormProps {
  accounts: Account[];
  onSubmit: (trade: Partial<Trade>) => void;
  onClose: () => void;
  initialData?: Partial<Trade>;
}

export const TradeForm: React.FC<TradeFormProps> = ({ accounts, onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toTimeString().slice(0, 5),
    stars: 3,
    direction: 'Buy',
    resultat: 'En cours',
    ...initialData
  });

  // Automatic Hors Zone detection
  useEffect(() => {
    if (formData.heure) {
      const h = parseInt(formData.heure.split(':')[0], 10);
      let session: Session = 'Hors session';
      
      if (h >= SESSION_HOURS.ASIAN.start && h < SESSION_HOURS.ASIAN.end) session = 'Asian';
      else if (h >= SESSION_HOURS.LONDON.start && h < SESSION_HOURS.LONDON.end) session = 'London';
      else if (h >= SESSION_HOURS.NY.start && h < SESSION_HOURS.NY.end) session = 'New York';
      
      setFormData(prev => ({
        ...prev,
        session,
        horsZone: session === 'Hors session'
      }));
    }
  }, [formData.heure]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const parsed = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(parsed) ? undefined : parsed }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStarClick = (stars: number) => {
    setFormData(prev => ({ ...prev, stars }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden ${formData.horsZone ? 'ring-2 ring-pnl-amber' : ''}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent-border">
          <h2 className="text-lg font-bold text-text">Nouveau Trade</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Compte</label>
              <select 
                name="compte" 
                value={formData.compte} 
                onChange={handleChange}
                className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                required
              >
                <option value="">Sélectionner un compte</option>
                {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Instrument</label>
              <select 
                name="instrument" 
                value={formData.instrument} 
                onChange={handleChange}
                className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                required
              >
                <option value="">Instrument</option>
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange}
                className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Heure</label>
              <input 
                type="time" 
                name="heure" 
                value={formData.heure} 
                onChange={handleChange}
                className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Confiance</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStarClick(s)}
                    aria-label={`Confiance ${s} sur 5`}
                    className="focus:outline-none"
                  >
                    <Star 
                      size={20} 
                      className={`${s <= (formData.stars || 0) ? 'fill-pnl-amber text-pnl-amber' : 'text-text-dim'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Structure</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, structureFragile: false }))}
                  className={`px-3 py-1 text-xs rounded border ${!formData.structureFragile ? 'bg-pnl-green text-white border-pnl-green' : 'border-accent-border text-text-muted'}`}
                >
                  Solide
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, structureFragile: true }))}
                  className={`px-3 py-1 text-xs rounded border ${formData.structureFragile ? 'bg-pnl-red text-white border-pnl-red' : 'border-accent-border text-text-muted'}`}
                >
                  Fragile
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Montant Risqué ($)</label>
              <input 
                type="number" 
                name="montantRisque" 
                value={formData.montantRisque} 
                onChange={handleChange}
                className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">Gain / Perte ($)</label>
              <input 
                type="number" 
                name="gainPerte" 
                value={formData.gainPerte} 
                onChange={handleChange}
                className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Pourquoi Entrer ?</label>
            <textarea
              name="pourquoi"
              value={formData.pourquoi}
              onChange={handleChange}
              className="w-full bg-surface-1 border border-accent-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
              placeholder="Décrivez votre setup..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-accent-border">
            <div className="flex items-center gap-2">
              {formData.horsZone && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-pnl-amber uppercase bg-pnl-amber-bg px-2 py-1 rounded">
                  ⚠️ Hors Zone Trading
                </span>
              )}
              <span className="text-[10px] font-bold text-accent uppercase bg-accent-light px-2 py-1 rounded">
                Session : {formData.session}
              </span>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-accent text-white rounded text-sm font-bold shadow-lg hover:bg-accent-dark transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
