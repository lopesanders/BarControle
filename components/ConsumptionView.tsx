import React, { useState, useEffect, useRef } from 'https://esm.sh/react@19.0.0';
import { Camera as CameraIcon, Plus, Trash2, CheckCircle2, Settings, X, Copy, RotateCcw, MapPin } from 'https://esm.sh/lucide-react@0.460.0';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics } from '@capacitor/haptics';
import { ConsumptionItem, ConsumptionSession } from '../types.ts';
import ProgressBar from './ProgressBar.tsx';

interface ConsumptionViewProps {
  items: ConsumptionItem[];
  setItems: React.Dispatch<React.SetStateAction<ConsumptionItem[]>>;
  budgetLimit: number;
  setBudgetLimit: (val: number) => void;
  currentLocation: string;
  setCurrentLocation: (val: string) => void;
  onFinish: (session: ConsumptionSession) => void;
}

const ConsumptionView: React.FC<ConsumptionViewProps> = ({ 
  items, 
  setItems, 
  budgetLimit, 
  setBudgetLimit,
  currentLocation,
  setCurrentLocation,
  onFinish 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ConsumptionItem | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isConfiguringBudget, setIsConfiguringBudget] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemPhoto, setNewItemPhoto] = useState<string | undefined>(undefined);

  const [splitCount, setSplitCount] = useState(1);
  const [includeTip, setIncludeTip] = useState(false);

  // Swipe logic states
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [currentSwipeOffset, setCurrentSwipeOffset] = useState<number>(0);

  // Auto-open budget modal logic
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0) {
      if (!hasAutoOpenedRef.current) {
        setIsConfiguringBudget(true);
        hasAutoOpenedRef.current = true;
      }
    } else {
      hasAutoOpenedRef.current = false;
    }
  }, [items.length]);
  
  const total = items.reduce((acc, item) => acc + item.price, 0);

  useEffect(() => {
    if (editingItem) {
      setNewItemName(editingItem.name);
      setNewItemPrice(editingItem.price.toString());
      setNewItemPhoto(editingItem.photo);
      setIsAdding(true);
    }
  }, [editingItem]);

  const optimizeBase64 = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.src = base64;
    });
  };

  const handleTakeNativePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 50,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: false
      });

      if (image.base64String) {
        const optimized = await optimizeBase64(`data:image/jpeg;base64,${image.base64String}`);
        setNewItemPhoto(optimized);
      }
    } catch (error) {
      console.log('Câmera cancelada ou erro:', error);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const price = parseFloat(newItemPrice.replace(',', '.'));
    if (isNaN(price)) return;

    const diff = editingItem ? (price - editingItem.price) : price;
    const futureTotal = total + diff;
    if (futureTotal >= budgetLimit * 0.9) {
      try {
        await Haptics.vibrate({ duration: 2000 });
      } catch (err) {
        console.warn('Haptics não disponível:', err);
      }
    }

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, name: newItemName, price, photo: newItemPhoto } : item));
    } else {
      setItems(prev => [{ id: Date.now().toString(), name: newItemName, price, timestamp: Date.now(), photo: newItemPhoto }, ...prev]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemPhoto(undefined);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDelete = (id: string) => {
    if(confirm('Excluir item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      setSwipedItemId(null);
      setCurrentSwipeOffset(0);
    }
  };

  const onTouchStart = (e: React.TouchEvent, id: string) => {
    setTouchStartX(e.touches[0].clientX);
    if (swipedItemId !== id) {
      setSwipedItemId(null);
      setCurrentSwipeOffset(0);
    }
  };

  const onTouchMove = (e: React.TouchEvent, id: string) => {
    if (touchStartX === null) return;
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    if (diff < 0) {
      setCurrentSwipeOffset(diff);
      setSwipedItemId(id);
    } else if (swipedItemId === id && diff > 0) {
      setCurrentSwipeOffset(Math.min(0, -80 + diff));
    }
  };

  const onTouchEnd = () => {
    if (currentSwipeOffset < -60) {
      setCurrentSwipeOffset(-80);
    } else {
      setCurrentSwipeOffset(0);
      setSwipedItemId(null);
    }
    setTouchStartX(null);
  };

  return (
    <div className="p-4 space-y-6">
      <div className={`p-6 rounded-[2.5rem] shadow-xl border-2 transition-all duration-500 ${
        (total / budgetLimit) >= 1.0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
        (total / budgetLimit) >= 0.9 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
        (total / budgetLimit) >= 0.5 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 opacity-60">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Gasto Consolidado</p>
              {currentLocation && <span className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-0.5">• <MapPin size={10} /> {currentLocation}</span>}
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
              {formatCurrency(total)}
            </h2>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1">
              de {formatCurrency(budgetLimit)}
            </p>
          </div>
          <button onClick={() => setIsConfiguringBudget(true)} className="p-3 bg-white/80 dark:bg-dark-border/50 rounded-2xl shadow-sm active:scale-90 transition-transform"><Settings size={20} className="text-gray-600 dark:text-gray-300" /></button>
        </div>
        <ProgressBar current={total} total={budgetLimit} />
      </div>

      <div className="space-y-4 pb-32">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2">Pedidos da Rodada</h3>
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
             <div className="w-20 h-20 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-4">
                <Plus className="opacity-20" size={32} />
             </div>
            <p className="text-sm font-bold">Toque em PEDIR para começar</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="relative overflow-hidden rounded-3xl group">
              <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="text-white flex flex-col items-center gap-1 active:scale-90 transition-transform"
                >
                  <Trash2 size={24} />
                  <span className="text-[10px] font-black uppercase">Excluir</span>
                </button>
              </div>

              <div 
                className="bg-white dark:bg-dark-card p-4 rounded-3xl border border-gray-100 dark:border-dark-border flex items-center gap-4 relative z-10 transition-transform duration-200"
                style={{ 
                  transform: swipedItemId === item.id ? `translateX(${currentSwipeOffset}px)` : 'translateX(0px)' 
                }}
                onTouchStart={(e) => onTouchStart(e, item.id)}
                onTouchMove={(e) => onTouchMove(e, item.id)}
                onTouchEnd={onTouchEnd}
                onClick={() => {
                  if (swipedItemId === item.id && currentSwipeOffset !== 0) {
                    setSwipedItemId(null);
                    setCurrentSwipeOffset(0);
                  } else {
                    setEditingItem(item);
                  }
                }}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-bg shrink-0 flex items-center justify-center border border-gray-50 dark:border-dark-border" onClick={(e) => { e.stopPropagation(); if(item.photo) setFullscreenPhoto(item.photo); }}>
                  {item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <CameraIcon size={24} className="text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate text-lg leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">{new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-black text-blue-600 dark:text-blue-400 text-lg">{formatCurrency(item.price)}</span>
                  <div className="flex -mr-2">
                    <button onClick={(e) => { e.stopPropagation(); setItems(prev => [{...item, id: Date.now().toString(), timestamp: Date.now()}, ...prev]); }} className="p-3 text-gray-300 hover:text-blue-500"><Copy size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-3 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[3rem] p-8 pb-12 space-y-8 animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{editingItem ? 'Editar Detalhes' : 'Novo Pedido'}</h3>
              <button onClick={closeModal} className="p-4 -mr-4 text-gray-400"><X size={32} /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[280px] rounded-[3.5rem] overflow-hidden bg-gray-50 dark:bg-dark-bg border-4 border-dashed border-gray-200 dark:border-dark-border group">
                  {newItemPhoto ? (
                    <div className="relative w-full h-full">
                      <img src={newItemPhoto} className="w-full h-full object-cover" />
                      <button type="button" onClick={handleTakeNativePhoto} className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCcw size={32} />
                        <span className="text-[10px] font-black uppercase mt-2">Trocar Foto</span>
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={handleTakeNativePhoto} className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors active:scale-95 transition-all">
                      <CameraIcon size={64} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tirar Foto</span>
                      <p className="text-[9px] opacity-40 uppercase">Câmera abre instantaneamente</p>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">O que você pediu?</label>
                  <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Ex: Cerveja, Drink, Porção..." className="w-full px-6 py-5 bg-gray-100 dark:bg-dark-bg rounded-2xl text-lg font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 border border-transparent" required />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Qual o valor?</label>
                   <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                    <input type="number" step="0.01" inputMode="decimal" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0,00" className="w-full pl-16 pr-6 py-5 bg-gray-100 dark:bg-dark-bg rounded-2xl text-2xl font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500 border border-transparent" required />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl active:scale-95 transition-all">
                {editingItem ? 'Salvar Alteração' : 'Adicionar ao Consumo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {fullscreenPhoto && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFullscreenPhoto(null)}>
          <button className="absolute top-10 right-6 text-white bg-white/10 p-4 rounded-full backdrop-blur-md"><X size={32} /></button>
          <img src={fullscreenPhoto} className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95" />
        </div>
      )}

      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-6 flex gap-3 z-30 pointer-events-none">
        <button onClick={() => setIsAdding(true)} className="flex-1 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl font-black active:scale-95 pointer-events-auto flex items-center justify-center gap-2 transition-all uppercase tracking-widest"><Plus size={24}/> Pedir</button>
        {items.length > 0 && <button onClick={() => setIsFinishing(true)} className="flex-1 h-16 bg-green-600 text-white rounded-[1.5rem] shadow-2xl font-black active:scale-95 pointer-events-auto flex items-center justify-center gap-2 transition-all uppercase tracking-widest"><CheckCircle2 size={24}/> Fechar</button>}
      </div>

      {isConfiguringBudget && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[3rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Onde e quanto pretende gastar?</h3>
              <button onClick={() => setIsConfiguringBudget(false)} className="text-gray-400 p-2"><X /></button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Local</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400"><MapPin size={20} /></span>
                  <input 
                    type="text" 
                    value={currentLocation} 
                    placeholder="Ex: Praia, Balada, Churras"
                    onChange={e => setCurrentLocation(e.target.value)} 
                    className="w-full pl-16 pr-6 py-6 bg-gray-100 dark:bg-dark-bg rounded-2xl text-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Limite Orçamentário</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                  <input 
                    type="number" 
                    value={budgetLimit === 0 ? '' : budgetLimit} 
                    placeholder="Digite o limite"
                    onChange={e => setBudgetLimit(Number(e.target.value))} 
                    className="w-full pl-16 pr-6 py-6 bg-gray-100 dark:bg-dark-bg rounded-2xl text-2xl font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
            </div>

            <button onClick={() => setIsConfiguringBudget(false)} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Definir Configurações</button>
          </div>
        </div>
      )}

      {isFinishing && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[3rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-full duration-500">
             <div className="flex justify-between items-center"><h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Finalizar Conta</h3><button onClick={() => setIsFinishing(false)} className="text-gray-400 p-2"><X /></button></div>
             <div className="p-6 bg-blue-600 text-white rounded-3xl space-y-4 shadow-xl">
                <div className="flex justify-between font-bold opacity-80 text-sm"><span>Subtotal:</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3 font-bold group">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative w-7 h-7">
                        <input 
                          type="checkbox" 
                          checked={includeTip} 
                          onChange={e => setIncludeTip(e.target.checked)} 
                          className="peer appearance-none w-7 h-7 rounded-lg border-2 border-white/30 bg-white/10 checked:bg-white checked:border-white transition-all cursor-pointer"
                        />
                        <CheckCircle2 size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span>Taxa Serviço (10%)</span>
                    </label>
                  </div>
                  <span>{formatCurrency(total * 0.1)}</span>
                </div>
                <div className="flex justify-between text-3xl font-black border-t border-white/20 pt-4"><span>TOTAL:</span><span>{formatCurrency(includeTip ? total * 1.1 : total)}</span></div>
             </div>
             <div className="flex justify-between items-center px-2 py-4 border-b border-gray-100 dark:border-dark-border">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Rachar em:</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-bg font-black text-gray-600 dark:text-white active:bg-gray-200 transition-colors">-</button>
                  <span className="text-2xl font-black dark:text-white min-w-[1.5rem] text-center">{splitCount}</span>
                  <button onClick={() => setSplitCount(splitCount + 1)} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-bg font-black text-gray-600 dark:text-white active:bg-gray-200 transition-colors">+</button>
                </div>
             </div>
             {splitCount > 1 && (
               <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-[1.5rem] flex justify-between items-center text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/20">
                 <span className="text-xs font-black uppercase tracking-tighter">Cada pessoa paga:</span>
                 <span className="text-2xl font-black">{formatCurrency((includeTip ? total * 1.1 : total) / splitCount)}</span>
               </div>
             )}
             <button onClick={() => { onFinish({ id: Date.now().toString(), items, date: Date.now(), total, splitCount, hasTip: includeTip, tipAmount: total*0.1, totalPerPerson: (includeTip?total*1.1:total)/splitCount, location: currentLocation }); setIsFinishing(false); }} className="w-full h-18 bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-green-500/20 py-5">Confirmar Pagamento</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionView;