import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Send, 
  Copy, 
  CheckCircle2, 
  Layers, 
  Wand2, 
  FileText, 
  Image, 
  Share2,
  Video
} from 'lucide-react';
import { livingAudio } from '../../services/livingAudio.ts';

export const CreativeStudioView: React.FC = () => {
  const [creativeType, setCreativeType] = useState<'copy' | 'script' | 'identity' | 'campaign'>('copy');
  const [targetAudience, setTargetAudience] = useState('');
  const [productFocus, setProductFocus] = useState('AYIN SALES');
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const creativeTemplates = [
    { id: 'copy', title: 'Copywriting de Alta Conversão B2B', icon: FileText, desc: 'E-mails frios, abordagens LinkedIn e mensagens WhatsApp' },
    { id: 'script', title: 'Roteiros de Vídeo & Pitch Comercial', icon: Video, desc: 'Scripts persuasivos para demonstração e reuniões de fechamento' },
    { id: 'identity', title: 'Brand Persona & Manual de Tom de Voz', icon: Palette, desc: 'Diretrizes de comunicação, arquétipos e diretrizes visuais' },
    { id: 'campaign', title: 'Campanha Integrada Omnichannel', icon: Sparkles, desc: 'Planejamento de anúncios, criativos e fluxo de nutrição' }
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    livingAudio.playTone('command_sent');

    setTimeout(() => {
      let output = '';
      if (creativeType === 'copy') {
        output = `ASSUNTO: Transformação da operação comercial com IA autônoma 24/7\n\nOlá, [Nome do Decisor]!\n\nNotei que sua empresa tem expandido o volume de clientes B2B. A maioria das operações enfrenta o mesmo gargalo: tempo excessivo de consultores qualificando contatos frios e acompanhando propostas manuais.\n\nNa SHEFA AYIN STUDIO, desenvolvemos ecossistemas autônomos onde uma rede de 11 agentes de inteligência opera 24 horas por dia em segundo plano — identificando oportunidades, nutrindo leads e sincronizando dados diretamente com seu ERP.\n\nPodemos agendar uma demonstração de 15 minutos na próxima terça-feira?\n\nAtenciosamente,\nDiretoria SHEFA AYIN STUDIO\nTechnology. Vision. Creation.`;
      } else if (creativeType === 'script') {
        output = `ROTEIRO DE PITCH - APRESENTAÇÃO EXECUTIVA (60 SEGUNDOS)\n\n[CENA 1 - 0 a 15s] ABERTURA DE IMPACTO\n"O que acontece com as oportunidades da sua empresa quando o expediente termina? Na maioria das companhias, o processo para."\n\n[CENA 2 - 15 a 35s] APRESENTAÇÃO DA SOLUÇÃO\n"Apresentamos o SHEFA AYIN STUDIO: uma central autônoma de inteligência corporativa. Com o núcleo AYIN CORE e 11 agentes autônomos no servidor, suas operações de vendas, atendimento e finanças trabalham sem interrupções."\n\n[CENA 3 - 35 a 60s] CHAMADA PARA AÇÃO SOBERANA\n"Mais do que um software, um ativo tecnológico definitivo sob medida para sua corporação. Conheça o Observatório."`;
      } else if (creativeType === 'identity') {
        output = `MANUAL DE TOM DE VOZ & BRAND PERSONA - SHEFA AYIN STUDIO\n\n1. ARQUÉTIPO PRINCIPAL: O Sábio Soberano + O Criador Visionário.\n2. PALETA DE CORES: Preto Obsidiana (#121024), Superfície Profunda (#17142B), Roxo Violeta (#8B5CF6), Lilás Lúmen (#A78BFA), Dourado (#F59E0B).\n3. LINGUAGEM: Sofisticada, precisa, cinematográfica, focada em soberania, ROI e escala exponencial. Zero gírias ou jargões passageiros.\n4. ROOT HEBRAICO: עין השפע (Shefa Ayin — O Olho da Abundância).`;
      } else {
        output = `ESTRATÉGIA DE CAMPANHA INTEGRADA\n\n- Fase 1 (Atração): Disparo do Radar AYIN mapeando diretores de tecnologia e CFOs.\n- Fase 2 (Nutrição): Envio de diagnósticos de eficiência de IA sob medida.\n- Fase 3 (Conversão): Agendamento de imersão no Observatório 3D.\n- Canal Principal: LinkedIn Enterprise + WhatsApp Direct + Proposta Interativa Pix.`;
      }

      setGeneratedOutput(output);
      setIsGenerating(false);
      livingAudio.playTone('complete');
    }, 800);
  };

  const handleCopy = () => {
    if (generatedOutput) {
      navigator.clipboard.writeText(generatedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      livingAudio.playTone('click');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1D1835] border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] shadow">
            <Palette className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
                CREATIVE STUDIO · CRIAÇÃO & IDENTIDADE VISUAL
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-[#A78BFA] border border-[#8B5CF6]/30">
                AGENTE CREATIVE & MARKETING
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              Geração de narrativas de alta conversão, roteiros para fechamento de contratos corporativos e ativos de posicionamento.
            </p>
          </div>
        </div>
      </div>

      {/* Creative Selector & Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-cinzel text-white">Selecione o Formato Criativo</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {creativeTemplates.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = creativeType === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setCreativeType(tpl.id as any);
                      livingAudio.playTone('click');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#1D1835] border-[#8B5CF6] text-white shadow-md'
                        : 'bg-[#121024]/60 border-[#8B5CF6]/15 text-slate-300 hover:border-[#8B5CF6]/40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#8B5CF6] text-white' : 'bg-[#1D1835] text-[#A78BFA]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{tpl.title}</span>
                      <span className="text-[10px] text-slate-400 block">{tpl.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleGenerate} className="space-y-3 pt-2 border-t border-[#8B5CF6]/15">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Produto / Foco da Mensagem:</label>
                <select
                  value={productFocus}
                  onChange={(e) => setProductFocus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                >
                  <option value="AYIN SALES">AYIN SALES (Prospecção Autônoma)</option>
                  <option value="AYIN CUSTOMER">AYIN CUSTOMER (Retenção e Suporte)</option>
                  <option value="AYIN FINANCE">AYIN FINANCE (Tesouraria & Pix)</option>
                  <option value="SHEFA AYIN DIGITAL">SHEFA AYIN DIGITAL (Software Sob Medida)</option>
                  <option value="INFINITY ENTERPRISE">Plano Infinity Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Público-Alvo ou Segmento:</label>
                <input
                  type="text"
                  placeholder="Ex: Diretores de Operações e CFOs de Logística"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D1835] border border-[#8B5CF6]/30 rounded-lg text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? 'Criando Ativo...' : 'Gerar Peça Criativa'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7">
          <div className="p-6 bg-[#17142B] rounded-2xl border border-[#8B5CF6]/25 shadow-xl space-y-4 min-h-[460px] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B5CF6]/20">
              <span className="text-xs font-mono uppercase text-[#A78BFA] font-bold">
                Ativo Criativo Gerado
              </span>
              {generatedOutput && (
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#1D1835] hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/30 text-xs text-[#A78BFA] hover:text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-[#121024] p-5 rounded-xl border border-[#8B5CF6]/15 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto">
              {generatedOutput ? (
                generatedOutput
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-12">
                  <Palette className="w-10 h-10 text-[#8B5CF6]/30" />
                  <span>Escolha o formato e clique em "Gerar Peça Criativa" para orquestrar o conteúdo.</span>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-[#8B5CF6]/10">
              <span>Agente Responsável: CREATIVE & MARKETING</span>
              <span>Conformidade com Diretrizes Soberanas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
