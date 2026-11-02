import React from 'react';
import { User, Company } from '../types/index.ts';
import { Maximize2, Sparkles, Eye, Code2, Bot, Layers, CreditCard, Building2, History, Lock } from 'lucide-react';
import { livingAudio } from '../services/livingAudio.ts';

export type StudioView = 
  | 'landing' 
  | 'observatory' 
  | 'digital' 
  | 'labs' 
  | 'agents' 
  | 'core' 
  | 'departments' 
  | 'companies' 
  | 'audit' 
  | 'subscriptions';

interface TopBarProps {
  currentView: StudioView;
  onNavigate: (view: StudioView) => void;
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
  const handleNav = (v: StudioView) => {
    livingAudio.play('click');
    onNavigate(v);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-[#17142B]/90 backdrop-blur-md border-b border-violet-500/20">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => handleNav('landing')} 
        className="text-base font-cinzel font-bold text-white tracking-widest whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 group"
      >
        <span>SHEFA AYIN</span>
        <span className="text-violet-400 font-sans font-semibold text-xs tracking-wider">STUDIO</span>
        <span className="text-amber-400/80 text-xs font-normal font-cinzel hidden sm:inline">עין השפע</span>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-300">
        <button
          onClick={() => handleNav('landing')}
          className={`hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'landing' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          Studio
        </button>

        <button
          onClick={() => handleNav('observatory')}
          className={`flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'observatory' ? 'text-amber-400 font-bold underline underline-offset-4' : ''
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Observatório 3D</span>
        </button>

        <button
          onClick={() => handleNav('digital')}
          className={`flex items-center gap-1.5 hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'digital' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Digital (Projetos)</span>
        </button>

        <button
          onClick={() => handleNav('labs')}
          className={`flex items-center gap-1.5 hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'labs' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Labs & Assinaturas</span>
        </button>

        <button
          onClick={() => handleNav('agents')}
          className={`flex items-center gap-1.5 hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'agents' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>11 Agentes</span>
        </button>

        <button
          onClick={() => handleNav('core')}
          className={`hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'core' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          Terminal AYIN
        </button>

        <button
          onClick={() => handleNav('companies')}
          className={`hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'companies' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          Portal Clientes
        </button>

        <button
          onClick={() => handleNav('audit')}
          className={`hover:text-violet-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'audit' ? 'text-violet-300 font-bold underline underline-offset-4' : ''
          }`}
        >
          Auditoria
        </button>
      </nav>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleTotalFocus && (
          <button
            onClick={() => {
              livingAudio.play('click');
              onToggleTotalFocus();
            }}
            title="Entrar no Modo de Foco Total (F)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-200 bg-[#1D1835] hover:text-amber-300 border border-violet-500/30 hover:border-amber-400/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Foco Total</span>
          </button>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2">
            {currentUser.role === 'MASTER_OWNER' ? (
              <button
                onClick={() => {
                  livingAudio.play('click');
                  onOpenMasterPanel();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/40 rounded-lg hover:bg-amber-900/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Console Master</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('companies')}
                className="px-3 py-1.5 text-xs font-medium text-violet-200 bg-[#1D1835] border border-violet-500/30 rounded-lg hover:bg-violet-900/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {currentCompany ? currentCompany.tradeName : 'Painel Cliente'}
              </button>
            )}
            <button
              onClick={() => {
                livingAudio.play('click');
                onLogout();
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Desconectar"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              livingAudio.play('click');
              onOpenAuthModal();
            }}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Acesso Seguro
          </button>
        )}
      </div>
    </header>
  );
};
