import React from 'react';
import { X, Camera, Settings, AlertCircle, Terminal } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Status Versão 1.5.2</h3>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
          <Terminal className="text-blue-600 shrink-0" size={20} />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <b>Correção de Build:</b> O arquivo <code>metadata.json</code> foi minificado para evitar erros de leitura no compilador do Android.
          </p>
        </div>

        <section className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Próximo Passo no Build</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Tente realizar o build novamente. Se o erro persistir, limpe o cache do seu gerador de APK (Build > Clean Project).
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
              <Camera size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Câmera Híbrida</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Uma vez instalado, o app usará o modo compatível caso as permissões do sistema ainda estejam bloqueadas.
              </p>
            </div>
          </div>
        </section>

        <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-dark-border">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Integridade de Dados</span>
            <span className="font-black text-green-600 uppercase text-[10px]">JSON Sanitizado</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center uppercase font-bold">Build ID: 2026-01-12-FIX</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-blue-500/20"
        >
          Tentar Novo Build
        </button>
      </div>
    </div>
  );
};

export default HelpView;