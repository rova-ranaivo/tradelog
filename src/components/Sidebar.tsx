import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Wallet, 
  Users, 
  Settings, 
  Menu, 
  X,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'journal', label: 'Journal de trades', icon: BookOpen },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'cashflow', label: 'Dépôts & Retraits', icon: Wallet },
  { id: 'accounts', label: 'Gestion des comptes', icon: Users },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={toggleSidebar}
          className="bg-accent text-white p-3 rounded-full shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-terminal border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-accent p-1.5 rounded">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TradeLog <span className="text-accent">V5</span></span>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-accent/20 text-white border-l-2 border-accent' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="mt-auto border-t border-white/10 pt-4 px-2">
            <div className="flex items-center gap-3 text-white/40 text-xs">
              <span className="w-2 h-2 rounded-full bg-pnl-green animate-pulse" />
              Supabase Connected
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
