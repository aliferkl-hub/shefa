import React from 'react';
import { 
  Eye, 
  Code2, 
  Layers, 
  FolderKanban, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Bot, 
  Palette, 
  Settings, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { User } from '../../types/index.ts';
import { livingAudio } from '../../services/livingAudio.ts';

export type MainNavSection = 
  | 'OBSERVATORY'
  | 'DIGITAL'
  | 'LABS'
  | 'PROJECTS'
  | 'CLIENTS'
  | 'COMMERCIAL'
  | 'FINANCE'
  | 'AI_CORE'
  | 'AI_AGENTS'
  | 'CREATIVE_STUDIO'
  | 'SETTINGS'
  | 'MASTER_OWNER';

interface StudioSidebarProps {
  currentSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  currentUser: User | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  currentSection,
  onSelectSection,
  currentUser,
  onLogout,
  isOpenMobile,
  onToggleMobile
}) => {
  const menuItems: { id: MainNavSection; label: string; icon: any; subtitle: string; badge?: string }[] = [
    {
      id: 'OBSERVATORY',
      label: 'OBSERVATORY',
      icon: Eye,
      subtitle: 'Central de Comando',
      badge: 'Principal'
    },
    {
      id: 'DIGITAL',
      label: 'DIGITAL',
      icon: Code2,
      subtitle: 'Desenvolvimento Sob Medida'
    },
    {
      id: 'LABS',
      label: 'LABS',
      icon: Layers,
      subtitle: 'Produtos & Assinaturas'
    },
    {
      id: 'PROJECTS',
      label: 'PROJECTS',
      icon: FolderKanban,
      subtitle: 'Gerenciamento de Projetos'
    },
    {
      id: 'CLIENTS',
      label: 'CLIENTS',
      icon: Building2,
      subtitle: 'Cadastro & Clientes'
    },
    {
      id: 'COMMERCIAL',
      label: 'COMMERCIAL',
      icon: TrendingUp,
      subtitle: 'Leads, Propostas & Vendas'
    },
    {
      id: 'FINANCE',
      label: 'FINANCE',
      icon: DollarSign,
      subtitle: 'Receitas, Despesas & Pix'
    },
    {
      id: 'AI_CORE',
      label: 'AI CORE',
      icon: Cpu,
      subtitle: 'Núcleo Neural AYIN CORE',
      badge: 'Neural'
    },
    {
      id: 'AI_AGENTS',
      label: 'AI AGENTS',
      icon: Bot,
      subtitle: '11 Agentes Autônomos 24/7'
    },
    {
      id: 'CREATIVE_STUDIO',
      label: 'CREATIVE STUDIO',
      icon: Palette,
      subtitle: 'Criação & Identidade Visual'
    },
    {
      id: 'SETTINGS',
      label: 'SETTINGS',
      icon: Settings,
      subtitle: 'Configurações & Parâmetros'
    },
    {
      id: 'MASTER_OWNER',
      label: 'MASTER OWNER',
      icon: ShieldCheck,
      subtitle: 'Administração & Soberania',
      badge: 'Master'
    }
  ];

  const handleItemClick = (id: MainNavSection) => {
    livingAudio.playTone('click');
    onSelectSection(id);
    if (isOpenMobile) onToggleMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onToggleMobile} 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#17142B] border-r border-[#8B5CF6]/20 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-5 border-b border-[#8B5CF6]/20">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => handleItemClick('OBSERVATORY')}
              className="cursor-pointer group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] shadow-lg group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="text-base font-cinzel font-black tracking-wider text-white">
                  SHEFA AYIN
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#A78BFA]">
                  <span>STUDIO</span>
                  <span className="text-amber-400 font-cinzel">עין השפע</span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onToggleMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 px-2 py-1 rounded bg-[#121024] border border-[#8B5CF6]/15 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SISTEMA OPERACIONAL
            </span>
            <span className="text-[#A78BFA]">24/7 AUTÔNOMO</span>
          </div>
        </div>

        {/* Center: Navigation Options List (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8B5CF6]/25 to-[#1D1835] text-white border border-[#8B5CF6]/50 shadow-lg shadow-violet-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-[#1D1835]/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-[#8B5CF6] text-white' 
                      : 'bg-[#1D1835] text-[#A78BFA] group-hover:text-white border border-[#8B5CF6]/20'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <span className={`block text-xs font-bold tracking-wide truncate ${
                      isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-light truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                        : 'bg-violet-950/60 text-[#A78BFA] border border-[#8B5CF6]/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Master Owner Profile & System Session */}
        <div className="p-4 border-t border-[#8B5CF6]/20 bg-[#121024]/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
                AM
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">
                  Alifer Madeiro
                </span>
                <span className="block text-[10px] font-mono text-amber-400 truncate">
                  Master Owner (Autoridade Global)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                livingAudio.playTone('click');
                onLogout();
              }}
              title="Desconectar da sessão"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center pt-1 border-t border-[#8B5CF6]/10">
            SHEFA AYIN v2.6 · Chave Pix: 11973479473
          </div>
        </div>
      </aside>
    </>
  );
};
