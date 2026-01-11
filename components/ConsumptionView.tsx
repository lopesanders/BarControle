
import React, { useState } from 'react';
import { Plus, Trash2, Camera, CheckCircle2, Settings, X } from 'lucide-react';
import { ConsumptionItem, ConsumptionSession } from '../types';
import ProgressBar from './ProgressBar';

interface ConsumptionViewProps {
  items: ConsumptionItem[];
  setItems: React.Dispatch<React.SetStateAction<ConsumptionItem[]>>;
  budgetLimit: number;
  setBudgetLimit: (val: number) => void;
  onFinish: (session: ConsumptionSession) => void;
}

const ConsumptionView: React.FC<ConsumptionViewProps> = ({ 
  items, 
  setItems, 
  budgetLimit, 
  setBudgetLimit,
  onFinish 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isConfiguringBudget, setIsConfiguringBudget] = useState(false);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemPhoto, setNewItemPhoto] = useState<string | undefined>(undefined);

  const [splitCount, setSplitCount] = useState(1);
  const [includeTip, setIncludeTip] = useState(false);

  const total = items.reduce((acc, item) => acc + item.price, 0);

  const getHeaderBg = () => {
    const percentage = (total / budgetLimit) * 100;
    if (percentage < 50) return 'bg-green-50';
    if (percentage < 90) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const item: ConsumptionItem = {
      id: Date.now().toString(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      timestamp: Date.now(),
      photo: newItemPhoto
    };

    setItems(prev => [item, ...prev]);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemPrice('');
    setNewItemPhoto(undefined);
  };

  const removeItem = (id: string) => {
    if (window.confirm('Remover este item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const finishSession = () => {
    const tipAmount = includeTip ? total * 0.1 : 0;
    const finalTotal = total + tipAmount;
    
    const session: ConsumptionSession = {
      id: Date.now().toString(),
      items: [...items],
      date: Date.now(),
      total: total,
      splitCount: splitCount,
      hasTip: includeTip,
      tipAmount: tipAmount,
      totalPerPerson: finalTotal / splitCount
    };

    onFinish(session);
    setIsFinishing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Budget Summary Card */}
      <div className={`p-6 rounded-3xl shadow-sm border transition-colors duration-500 ${getHeaderBg()}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Gasto Total</p>
            <h2 className="text-4xl font-extrabold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </h2>
          </div>
          <button 
            onClick={() => setIsConfiguringBudget(true)}
            className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
        <ProgressBar current={total} total={budgetLimit} />
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Itens Consumidos</h3>
          <span className="text-sm text-gray-400 font-medium">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <BeerIcon className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Nenhum item adicionado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                {item.photo ? (
                  <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 shrink-0">
                    <BeerIcon size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </span>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex gap-3 pointer-events-none">
        <button 
          onClick={() => setIsAdding(true)}
          className="flex-1 h-14 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform pointer-events-auto"
        >
          <Plus size={24} />
          Novo Item
        </button>
        {items.length > 0 && (
          <button 
            onClick={() => setIsFinishing(true)}
            className="flex-1 h-14 bg-green-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform pointer-events-auto"
          >
            <CheckCircle2 size={24} />
            Finalizar
          </button>
        )}
      </div>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Adicionar Consumo</h3>
              <button onClick={() => { setIsAdding(false); resetForm(); }} className="p-2 text-gray-400"><X /></button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="relative flex-1 block">
                    <span className="text-xs font-bold text-gray-400 uppercase ml-1">O que você pediu?</span>
                    <input 
                      type="text" 
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="Ex: Cerveja, Drink..." 
                      className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </label>
                  <label className="relative w-32 block">
                    <span className="text-xs font-bold text-gray-400 uppercase ml-1">Preço (R$)</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newItemPrice}
                      onChange={e => setNewItemPrice(e.target.value)}
                      placeholder="0,00" 
                      className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 group">
                    {newItemPhoto ? (
                      <>
                        <img src={newItemPhoto} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewItemPhoto(undefined)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="text-white" size={20} />
                        </button>
                      </>
                    ) : (
                      <Camera className="text-gray-300" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Toque no ícone para adicionar uma foto do produto (opcional).</p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
              >
                Salvar Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Finish Session Modal */}
      {isFinishing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Fechar Conta</h3>
              <button onClick={() => setIsFinishing(false)} className="p-2 text-gray-400"><X /></button>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-blue-50 rounded-2xl space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Gorjeta (10%):</span>
                    <input 
                      type="checkbox" 
                      checked={includeTip}
                      onChange={e => setIncludeTip(e.target.checked)}
                      className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <span className={`font-bold transition-opacity ${includeTip ? 'opacity-100' : 'opacity-30'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * 0.1)}
                  </span>
                </div>

                <div className="flex justify-between text-lg text-gray-900 pt-2 border-t border-blue-200">
                  <span className="font-extrabold">Total Final:</span>
                  <span className="font-extrabold text-blue-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(includeTip ? total * 1.1 : total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Dividir entre quantas pessoas?</span>
                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1 border border-gray-100">
                    <button 
                      onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                      className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 active:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="text-lg font-extrabold w-8 text-center">{splitCount}</span>
                    <button 
                      onClick={() => setSplitCount(splitCount + 1)}
                      className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 active:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {splitCount > 1 && (
                  <div className="p-4 bg-green-50 rounded-2xl flex justify-between items-center border border-green-100 animate-in fade-in zoom-in-95">
                    <span className="text-green-700 font-medium">Cada um paga:</span>
                    <span className="text-xl font-extrabold text-green-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((includeTip ? total * 1.1 : total) / splitCount)}
                    </span>
                  </div>
                )}
              </div>

              <button 
                onClick={finishSession}
                className="w-full h-14 bg-green-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
              >
                Confirmar Finalização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Limit Modal */}
      {isConfiguringBudget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Definir Orçamento</h3>
              <button onClick={() => setIsConfiguringBudget(false)} className="p-2 text-gray-400"><X /></button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Qual o valor máximo que você planeja gastar hoje? A barra de progresso te avisará ao chegar perto.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
                <input 
                  type="number" 
                  value={budgetLimit}
                  onChange={e => setBudgetLimit(Number(e.target.value))}
                  className="w-full px-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xl font-extrabold"
                />
              </div>
              <button 
                onClick={() => setIsConfiguringBudget(false)}
                className="w-full h-14 bg-blue-600 text-white rounded-2xl shadow-lg font-bold"
              >
                Definir Limite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BeerIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
    <path d="M9 12v6"/>
    <path d="M13 12v6"/>
    <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.5.5 2.5.5s1.44-.5 3-.5 2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"/>
    <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/>
  </svg>
);

export default ConsumptionView;
