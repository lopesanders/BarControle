import React from 'https://esm.sh/react@19.0.0';
import { 
  Beer, 
  Camera, 
  Users, 
  Settings, 
  Plus,
  Info,
  CheckCircle2
} from 'https://esm.sh/lucide-react@0.460.0';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-7 space-y-10 animate-slide-up pb-24">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Guia Rápido</h3>
        <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/10">
          <CheckCircle2 size={10} /> Versão 1.8.0
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/10">
              <Plus size={26} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Adicione Itens</h4>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Toque em <b>PEDIR</b> para registrar um item. Use fotos para não esquecer nada no dia seguinte.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10">
              <Settings size={26} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Crie uma Meta</h4>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Defina um limite de gastos e o local. O app avisa quando você estiver chegando perto do fim do orçamento.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/10">
              <Users size={26} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Rache a Conta</h4>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Ao finalizar, inclua a taxa de 10% se desejar e divida o valor entre os amigos instantaneamente.
              </p>
            </div>
          </div>
        </section>

        <div className="p-8 bg-slate-100 dark:bg-dark-card rounded-[2.5rem] border border-slate-200 dark:border-dark-border text-center space-y-5 shadow-inner">
          <div className="flex flex-col items-center">
             <div className="p-4 bg-white dark:bg-dark-bg rounded-3xl shadow-sm mb-4">
                <Beer className="text-blue-600 opacity-60" size={36} />
             </div>
             <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed px-4">
               "Controle seus gastos com inteligência e aproveite o consumo sem surpresas."
             </p>
          </div>
          
          <div className="pt-6 border-t border-slate-200 dark:border-dark-border flex flex-col items-center gap-2">
            <div className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Design & Dev por <a href="https://www.instagram.com/andersonlopesdsgn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-500 underline decoration-2 underline-offset-4">Anderson M Lopes</a>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-18 bg-blue-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm active:scale-95 shadow-xl shadow-blue-500/20 transition-all py-5"
        >
          Vamos Começar!
        </button>
      </div>
    </div>
  );
};

export default HelpView;