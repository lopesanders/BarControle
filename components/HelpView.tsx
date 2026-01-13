import React from 'https://esm.sh/react@19.0.0';
import { 
  Beer, 
  Camera, 
  Users, 
  Settings, 
  Plus,
  Info,
  CheckCircle
} from 'https://esm.sh/lucide-react@0.460.0';

interface HelpViewProps {
  onClose: () => void;
}

const HelpView: React.FC<HelpViewProps> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Como usar</h3>
        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
          <CheckCircle size={10} /> Stable
        </div>
      </div>

      <div className="space-y-6">
        <section className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Plus size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Adicione Pedidos</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Toque em <b>PEDIR</b> para registrar uma nova bebida ou petisco. Insira o nome e o preço para começar a somar.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
              <Camera size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Registre com Fotos</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                A câmera nativa abre instantaneamente. As fotos agora são otimizadas para economizar espaço e evitar travamentos.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Controle seu Orçamento</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Defina <b>Quanto vai gastar</b> e <b>Onde</b>. Veja o quanto resta diretamente abaixo do valor total acumulado.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Rache a Conta</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Ao fechar a conta, você pode adicionar os 10% de serviço e dividir o valor total igualmente entre os amigos.
              </p>
            </div>
          </div>
        </section>

        <div className="p-6 bg-gray-100 dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-dark-border text-center space-y-4">
          <div className="flex flex-col items-center">
             <Beer className="mb-2 text-blue-600 opacity-50" size={32} />
             <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
               "Evite surpresas na hora de pagar a conta. Beba com moderação!"
             </p>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-dark-border flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              <Info size={14} />
              Versão 1.7.1
            </div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-tighter">
              Desenvolvido por <a href="https://www.instagram.com/andersonlopesdsgn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-500 hover:underline">Anderson M Lopes</a>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-blue-500/20 transition-all"
        >
          Entendi!
        </button>
      </div>
    </div>
  );
};

export default HelpView;