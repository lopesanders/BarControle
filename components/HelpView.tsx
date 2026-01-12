
import React from 'react';
import { X, Beer, CheckCircle2, History, Info, Camera, ShieldAlert, Settings, CameraOff } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white uppercase tracking-tight">Guia da Versão 1.5</h3>
      </div>

      <div className="space-y-6">
        <section className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <Camera size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Câmera Híbrida</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">O app tenta abrir o visor. Se o Android bloquear, ele oferece um botão para tirar foto via sistema.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
              <CameraOff size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Erro: Nenhuma Permissão Solicitada</h4>
              <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed font-bold">Isso significa que o app foi instalado sem suporte à câmera. Use o "Modo Compatível" que aparecerá no erro.</p>
            </div>
          </div>
        </section>

        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-900/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-black text-xs uppercase">
            <ShieldAlert size={16} /> Nota para o Desenvolvedor:
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-tight">
            Se você estiver usando o <b>WebIntoApp</b> ou similar:<br/>
            1. Verifique se marcou a caixa <b>"Camera"</b> e <b>"Microphone"</b> no formulário de build.<br/>
            2. Se o erro persistir, desinstale o app e instale novamente após gerar um novo APK com permissões habilitadas.
          </p>
        </div>

        <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-[2rem] space-y-2 border border-gray-200 dark:border-dark-border shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Versão Atual</span>
            <span className="font-black text-gray-800 dark:text-white">1.5.0</span>
          </div>
          <div className="flex justify-between items-start text-sm pt-2 border-t border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Motor de Câmera</span>
            <span className="font-black text-blue-600 dark:text-blue-400 uppercase text-[10px]">Dual Mode (Live/Intent)</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl shadow-blue-500/20"
        >
          Entendido!
        </button>
      </div>
    </div>
  );
};

export default HelpView;
