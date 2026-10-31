import React from 'react';
import { User, Company } from '../types/index.ts';
import { Maximize2 } from 'lucide-react';

interface TopBarProps {
  currentView: 'observatory' | 'core' | 'departments' | 'companies' | 'audit' | 'subscriptions';
  onNavigate: (view: 'observatory' | 'core' | 'departments' | 'companies' | 'audit' | 'subscriptions') => void;
  currentUser: User | null;
  currentCompany: Company | null;
  onOpenMasterPanel: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onToggleTotalFocus?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  currentCompany,
  onOpenMasterPanel,
  onOpenAuthModal,
  onLogout,
  onToggleTotalFocus
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#050508]/90 backdrop-blur-md border-b border-purple-900/20">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onNavigate('observatory')} 
        className="text-base font-cinzel font-bold text-white tracking-widest whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
      >
        <span>SHEFA AYIN</span>
        <span className="text-amber-400/80 text-xs font-normal">עין השפע</span>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => onNavigate('observatory')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'observatory' ? 'text-amber-400 underline underline-offset-4' : ''
          }`}
        >
          Observatório 3D
        </button>

        <button
          onClick={() => onNavigate('core')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'core' ? 'text-amber-400 underline underline-offset-4' : ''
          }`}
        >
          AYIN Core
        </button>

        <button
          onClick={() => onNavigate('departments')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'departments' ? 'text-amber-400 underline underline-offset-4' : ''
          }`}
        >
          Departamentos
        </button>

        <button
          onClick={() => onNavigate('subscriptions')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'subscriptions' ? 'text-amber-400 underline underline-offset-4' : ''
          }`}
        >
          Assinaturas & Pix
        </button>

        <button
          onClick={() => onNavigate('companies')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'companies' ? 'text-amber-400 underline underline-offset-4' : ''
          }`}
        >
          Empresas Clientes
        </button>

        <button
          onClick={() => onNavigate('audit')}
          className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'audit' ? 'text-amber-400 underline underline-offset-4' : ''
          }`}
        >
          Auditoria & Logs
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleTotalFocus && (
          <button
            onClick={onToggleTotalFocus}
            title="Entrar no Modo de Foco Total (F)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-200 glass-obsidian hover:text-amber-300 hover:border-amber-400/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Foco Total</span>
          </button>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2">
            {currentUser.role === 'MASTER_OWNER' ? (
              <button
                onClick={onOpenMasterPanel}
                className="px-3.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg hover:bg-amber-900/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>Console Master Owner</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('companies')}
                className="px-3 py-1.5 text-xs font-medium text-purple-200 bg-purple-950/40 border border-purple-500/30 rounded-lg hover:bg-purple-900/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {currentCompany ? currentCompany.tradeName : 'Painel Cliente'}
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Desconectar"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-1.5 text-xs font-medium text-white bg-purple-700 hover:bg-purple-600 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Acesso Seguro
          </button>
        )}
      </div>
    </header>
  );
};
