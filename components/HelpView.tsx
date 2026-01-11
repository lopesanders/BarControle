
import React from 'react';
import { X, Beer, CheckCircle2, History, Info, ChevronRight } from 'lucide-react';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-gray-800">Como Usar</h3>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Beer size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Adicionar Itens</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Toque em "Novo Item" para registrar o que consumiu. Você pode incluir o nome, valor e até uma foto para não esquecer!</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
              <Info size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Controle o Limite</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Defina um orçamento no ícone de configurações. A barra de progresso mudará de cor (verde para amarelo para vermelho) conforme você gasta.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Finalizar Conta</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Ao terminar, toque em "Finalizar". Lá você pode adicionar 10% de gorjeta e dividir o valor entre seus amigos automaticamente.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <History size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Ver Histórico</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Suas noites passadas ficam salvas na aba de histórico. Toque em qualquer registro para ver os detalhes dos itens.</p>
            </div>
          </div>
        </section>

        <div className="p-6 bg-gray-100 rounded-3xl space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Versão</span>
            <span className="font-bold text-gray-800">1.0.0</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Desenvolvedor</span>
            <span className="font-bold text-gray-800">BarControl Team</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center pt-4">
            Feito com ❤️ para quem gosta de curtir sem sustos na conta.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold active:scale-95 transition-transform"
        >
          Entendido!
        </button>
      </div>
    </div>
  );
};

export default HelpView;
