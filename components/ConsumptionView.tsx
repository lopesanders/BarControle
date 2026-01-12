
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Camera, CheckCircle2, Settings, X, Copy, Maximize2, Loader2, RotateCcw } from 'lucide-react';
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
  const [editingItem, setEditingItem] = useState<ConsumptionItem | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isConfiguringBudget, setIsConfiguringBudget] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemPhoto, setNewItemPhoto] = useState<string | undefined>(undefined);

  const [splitCount, setSplitCount] = useState(1);
  const [includeTip, setIncludeTip] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = items.reduce((acc, item) => acc + item.price, 0);

  useEffect(() => {
    if (editingItem) {
      setNewItemName(editingItem.name);
      setNewItemPrice(editingItem.price.toString());
      setNewItemPhoto(editingItem.photo);
      setIsAdding(true);
    }
  }, [editingItem]);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || isProcessingPhoto) return;

    if (editingItem) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, name: newItemName, price: parseFloat(newItemPrice), photo: newItemPhoto }
          : item
      ));
    } else {
      const item: ConsumptionItem = {
        id: Date.now().toString(),
        name: newItemName,
        price: parseFloat(newItemPrice),
        timestamp: Date.now(),
        photo: newItemPhoto
      };
      setItems(prev => [item, ...prev]);
    }

    closeModal();
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    resetForm();
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemPrice('');
    setNewItemPhoto(undefined);
    setIsProcessingPhoto(false);
    setStatusMessage('');
  };

  // Função robusta de processamento de imagem para Android
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    setStatusMessage('Otimizando...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        setStatusMessage('Erro ao ler arquivo.');
        setIsProcessingPhoto(false);
        return;
      }

      // Redimensionar para economizar espaço no localStorage do Android
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const finalBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setNewItemPhoto(finalBase64);
          setStatusMessage('');
        }
        setIsProcessingPhoto(false);
      };
      img.onerror = () => {
        setStatusMessage('Erro na imagem.');
        setIsProcessingPhoto(false);
      };
      img.src = base64Data;
    };
    reader.onerror = () => {
      setStatusMessage('Falha no leitor.');
      setIsProcessingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Remover este item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const duplicateItem = (e: React.MouseEvent, item: ConsumptionItem) => {
    e.stopPropagation();
    const newItem: ConsumptionItem = {
      ...item,
      id: (Date.now() + Math.random()).toString(),
      timestamp: Date.now(),
    };
    setItems(prev => [newItem, ...prev]);
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
    setSplitCount(1);
    setIncludeTip(false);
  };

  const openFullscreen = (e: React.MouseEvent, photo: string) => {
    e.stopPropagation();
    setFullscreenPhoto(photo);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Budget Summary Card */}
      <div className={`p-5 rounded-[2rem] shadow-lg border-2 theme-transition ${
        (total / budgetLimit) >= 0.9 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
        (total / budgetLimit) >= 0.5 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Gasto Atual</p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </h2>
            <div className="mt-2 pt-1.5 border-t border-gray-200 dark:border-white/10 w-fit pr-4">
              <p className="text-[11px] font-black uppercase tracking-tight text-gray-500 dark:text-gray-400">
                Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgetLimit)}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsConfiguringBudget(true)}
            className="p-3 bg-white/80 dark:bg-dark-border/50 backdrop-blur rounded-2xl shadow-sm text-gray-500 active:scale-90 transition-transform"
          >
            <Settings size={20} />
          </button>
        </div>
        <ProgressBar current={total} total={budgetLimit} />
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1">Seu Consumo</h3>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
            <BeerIcon className="opacity-10 mb-4" size={64} />
            <p className="text-sm font-medium">Bora começar o round?</p>
          </div>
        ) : (
          <div className="space-y-3 pb-32">
            {items.map(item => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center gap-4 active:bg-gray-50 dark:active:bg-dark-bg transition-colors relative"
                onClick={() => setEditingItem(item)}
              >
                <div 
                  className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-bg shrink-0 relative group shadow-inner border border-gray-100 dark:border-dark-border"
                  onClick={(e) => item.photo && openFullscreen(e, item.photo)}
                >
                  {item.photo ? (
                    <>
                      <img src={item.photo} className="w-full h-full object-cover" alt={item.name} />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <Camera size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">
                    {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </span>
                  <div className="flex -mr-2">
                    <button 
                      onClick={(e) => duplicateItem(e, item)}
                      className="p-3 text-gray-300 dark:text-gray-600 active:text-blue-500 transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={(e) => removeItem(e, item.id)}
                      className="p-3 text-gray-300 dark:text-gray-600 active:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Viewer */}
      {fullscreenPhoto && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setFullscreenPhoto(null)}
        >
          <button 
            className="absolute top-10 right-6 p-4 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setFullscreenPhoto(null)}
          >
            <X size={32} />
          </button>
          <div className="w-full h-full flex items-center justify-center">
             <img 
                src={fullscreenPhoto} 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                alt="Foto em tela cheia"
              />
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-6 flex gap-3 z-30 pointer-events-none">
        <button 
          onClick={() => setIsAdding(true)}
          className="flex-1 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 font-black active:scale-95 pointer-events-auto transition-transform"
        >
          <Plus size={24} />
          PEDIR
        </button>
        {items.length > 0 && (
          <button 
            onClick={() => setIsFinishing(true)}
            className="flex-1 h-14 bg-green-600 text-white rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 font-black active:scale-95 pointer-events-auto transition-transform"
          >
            <CheckCircle2 size={24} />
            CONTA
          </button>
        )}
      </div>

      {/* Redesigned Add/Edit Modal (Novo Pedido) */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-8 animate-in slide-in-from-bottom-full duration-300 overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {editingItem ? 'Editar Pedido' : 'O que vai pedir?'}
              </h3>
              <button onClick={closeModal} className="p-4 -mr-4 text-gray-400 active:scale-90 transition-transform"><X size={28} /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-8">
              {/* Photo Area - Redesigned for Camera Focus */}
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={triggerCamera}
                  className={`group relative w-48 h-48 rounded-[3rem] border-4 border-dashed flex items-center justify-center overflow-hidden transition-all active:scale-95 ${
                    newItemPhoto ? 'border-blue-500' : 'border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg'
                  }`}
                >
                  {isProcessingPhoto ? (
                    <div className="flex flex-col items-center gap-3">
                       <Loader2 className="text-blue-500 animate-spin" size={40} />
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{statusMessage}</span>
                    </div>
                  ) : newItemPhoto ? (
                    <>
                      <img src={newItemPhoto} className="w-full h-full object-cover" alt="Foto do produto" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCcw className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600">
                      <div className="p-5 bg-white dark:bg-dark-card rounded-full shadow-lg mb-2">
                        <Camera size={40} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">Tirar Foto do Produto</span>
                    </div>
                  )}
                  
                  {/* Hidden Input Forced for Camera */}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/jpeg,image/png" 
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                    disabled={isProcessingPhoto}
                  />
                </div>
                {newItemPhoto && (
                  <button 
                    type="button" 
                    onClick={() => setNewItemPhoto(undefined)}
                    className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-full"
                  >
                    Remover Foto
                  </button>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">Nome do Item</label>
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="Ex: Heineken 600ml" 
                    className="w-full px-6 py-5 bg-gray-100 dark:bg-dark-bg border-none rounded-[2rem] text-lg font-bold dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">Preço Unitário</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 dark:text-gray-600 text-lg">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      inputMode="decimal"
                      value={newItemPrice}
                      onChange={e => setNewItemPrice(e.target.value)}
                      placeholder="0,00" 
                      className="w-full pl-16 pr-6 py-5 bg-gray-100 dark:bg-dark-bg border-none rounded-[2rem] text-2xl font-black dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessingPhoto}
                className={`w-full h-20 text-white rounded-[2rem] shadow-2xl shadow-blue-500/20 font-black uppercase tracking-widest text-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 ${editingItem ? 'bg-amber-600' : 'bg-blue-600'}`}
              >
                {isProcessingPhoto ? 'Processando...' : editingItem ? 'Atualizar Pedido' : 'Adicionar ao Round'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Finish Modal */}
      {isFinishing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end animate-in fade-in duration-200">
           <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-full duration-300">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Fechar Conta</h3>
                <button onClick={() => setIsFinishing(false)} className="p-4 -mr-4 text-gray-400"><X /></button>
             </div>
             
             <div className="p-6 bg-blue-600 text-white rounded-3xl space-y-2">
                <div className="flex justify-between items-center opacity-80 text-sm">
                  <span>Consumo:</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Serviço (10%):</span>
                    <input 
                      type="checkbox" 
                      checked={includeTip}
                      onChange={e => setIncludeTip(e.target.checked)}
                      className="w-6 h-6 rounded-lg bg-white/20 border-none"
                    />
                  </div>
                  <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * 0.1)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black pt-2 border-t border-white/20">
                  <span>TOTAL:</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(includeTip ? total * 1.1 : total)}</span>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-gray-400 uppercase">Dividir por:</span>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                      className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-black active:scale-90"
                    >-</button>
                    <span className="text-2xl font-black dark:text-white">{splitCount}</span>
                    <button 
                      onClick={() => setSplitCount(splitCount + 1)}
                      className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-black active:scale-90"
                    >+</button>
                  </div>
                </div>
                {splitCount > 1 && (
                  <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl flex justify-between items-center border border-green-200 dark:border-green-800 animate-in zoom-in-95">
                    <span className="text-green-700 dark:text-green-400 font-bold uppercase text-xs">Cada um:</span>
                    <span className="text-2xl font-black text-green-700 dark:text-green-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((includeTip ? total * 1.1 : total) / splitCount)}
                    </span>
                  </div>
                )}
             </div>

             <button 
                onClick={finishSession}
                className="w-full h-16 bg-green-600 text-white rounded-2xl shadow-xl shadow-green-500/20 font-black uppercase tracking-widest active:scale-95 transition-transform"
             >
                Confirmar Pagamento
             </button>
           </div>
        </div>
      )}

      {/* Budget Limit Modal */}
      {isConfiguringBudget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Limite da Noite</h3>
              <button onClick={() => setIsConfiguringBudget(false)} className="p-4 -mr-4 text-gray-400"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300">R$</span>
                <input 
                  type="number" 
                  value={budgetLimit}
                  onChange={e => setBudgetLimit(Number(e.target.value))}
                  className="w-full pl-16 pr-6 py-5 bg-gray-100 dark:bg-dark-bg border-none rounded-2xl text-2xl font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={() => setIsConfiguringBudget(false)}
                className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95"
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
    strokeWidth="2.5" 
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
