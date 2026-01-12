
import React from 'react';
import { X, Beer, CheckCircle2, History, Info, Camera, ShieldAlert, Settings, CameraOff, AlertCircle } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white uppercase tracking-tight">Guia Versão 1.5.1</h3>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 flex items-start gap-3">
          <AlertCircle className="text-green-600 shrink-0" size={20} />
          <p className="text-xs text-green-800 dark:text-green-300">
            <b>Build Corrigido:</b> O erro de JSON malformado foi resolvido simplificando o arquivo de metadados.
          </p>
        </div>

        <section className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <Camera size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Modo Dual de Foto</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                O app tenta abrir o visor interno. Se falhar, use o <b>Modo Compatível</b> que abre a câmera do seu sistema.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
              <Settings size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Permissões no Android</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Se as permissões continuarem "desabilitadas", o problema está no gerador do APK. Certifique-se de marcar <b>"Camera"</b> nas opções do seu conversor de app.
              </p>
            </div>
          </div>
        </section>

        <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-[2rem] space-y-2 border border-gray-200 dark:border-dark-border shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Versão Atual</span>
            <span className="font-black text-gray-800 dark:text-white">1.5.1</span>
          </div>
          <div className="flex justify-between items-start text-sm pt-2 border-t border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Build Status</span>
            <span className="font-black text-blue-600 dark:text-blue-400 uppercase text-[10px]">JSON Sanitizado</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl shadow-blue-500/20"
        >
          Pronto para o Round!
        </button>
      </div>
    </div>
  );
};

export default HelpView;
