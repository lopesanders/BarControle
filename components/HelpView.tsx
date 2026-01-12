
import React from 'react';
import { X, Beer, CheckCircle2, History, Info, Camera, ShieldAlert, Settings } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white uppercase tracking-tight">Manual do App</h3>
      </div>

      <div className="space-y-6">
        <section className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <Camera size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Visor de Câmera Direta</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Agora você tira a foto dentro do app. Sem abrir a galeria!</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Resolução de Problemas</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Se o visor ficar preto, você precisa permitir a <b>Câmera</b> e o <b>Microfone</b> nas configurações do seu celular.</p>
            </div>
          </div>
        </section>

        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-200 dark:border-blue-800 space-y-3">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-black text-xs uppercase">
            <Settings size={16} /> Como Ativar a Câmera:
          </div>
          <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-tight">
            1. Vá em <b>Configurações</b> do Android.<br/>
            2. Toque em <b>Apps</b> &gt; <b>Quanto Deu?</b>.<br/>
            3. Toque em <b>Permissões</b>.<br/>
            4. Ative <b>Câmera</b> e <b>Microfone</b> (selecione "Permitir durante o uso").<br/>
            5. Reinicie o aplicativo.
          </p>
        </div>

        <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-[2rem] space-y-2 border border-gray-200 dark:border-dark-border shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Versão do App</span>
            <span className="font-black text-gray-800 dark:text-white">1.4.0</span>
          </div>
          <div className="flex justify-between items-start text-sm pt-2 border-t border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Status</span>
            <span className="font-black text-green-600 dark:text-green-400 uppercase text-[10px]">Câmera Nativa Ativada</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl shadow-blue-500/20"
        >
          Entendi, Vamos Beber!
        </button>
      </div>
    </div>
  );
};

export default HelpView;
