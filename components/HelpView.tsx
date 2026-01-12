
import React from 'react';
import { X, Beer, CheckCircle2, History, Info, Camera, ShieldAlert } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white uppercase tracking-tight">Como Usar</h3>
      </div>

      <div className="space-y-6">
        <section className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              <Camera size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Câmera em Tempo Real</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Toque na câmera para registrar seu pedido. <b>Importante:</b> Se abrir a galeria, você precisa dar permissão nas configurações do Android.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0 shadow-sm">
              <Info size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Limite da Noite</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Defina seu teto de gastos. A barra muda de cor quando você está perto de estourar o limite.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Conta Dividida</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Adicione a gorjeta e divida com os amigos de forma instantânea.</p>
            </div>
          </div>
        </section>

        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-200 dark:border-amber-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-black text-xs uppercase">
            <ShieldAlert size={16} /> Problemas com a Câmera?
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-tight">
            1. Saia do app.<br/>
            2. Pressione o ícone do app e vá em <b>Informações do App</b>.<br/>
            3. Vá em <b>Permissões</b> &gt; <b>Câmera</b>.<br/>
            4. Selecione <b>"Permitir durante o uso"</b>.
          </p>
        </div>

        <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-[2rem] space-y-4 border border-gray-200 dark:border-dark-border shadow-inner">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Versão do App</span>
            <span className="font-black text-gray-800 dark:text-white">1.3.2</span>
          </div>
          <div className="flex justify-between items-start text-sm pt-2 border-t border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Desenvolvedor</span>
            <div className="text-right">
              <p className="font-black text-blue-600 dark:text-blue-400">Anderson M Lopes</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl shadow-blue-500/20"
        >
          Tudo certo!
        </button>
      </div>
    </div>
  );
};

export default HelpView;
