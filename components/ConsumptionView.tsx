import React, { useState, useEffect, useRef } from 'https://esm.sh/react@19.0.0';
import { Camera as CameraIcon, Plus, Trash2, CheckCircle2, Settings, X, Copy, RotateCcw, MapPin, ReceiptText } from 'https://esm.sh/lucide-react@0.460.0';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
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

  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [currentSwipeOffset, setCurrentSwipeOffset] = useState<number>(0);

  const total = items.reduce((acc, item) => acc + item.price, 0);
  const percent = budgetLimit > 0 ? (total / budgetLimit) : 0;

  useEffect(() => {
    if (editingItem) {
      setNewItemName(editingItem.name);
      setNewItemPrice(editingItem.price.toString());
      setNewItemPhoto(editingItem.photo);
      setIsAdding(true);
    }
  }, [editingItem]);

  const triggerHaptic = async (type: 'impact' | 'notification' | 'selection' | 'alert' = 'selection') => {
    try {
      if (type === 'impact') await Haptics.impact({ style: ImpactStyle.Medium });
      else if (type === 'notification') await Haptics.notification({ type: NotificationType.Success });
      else if (type === 'alert') await Haptics.vibrate({ duration: 2000 });
      else await Haptics.selectionChanged();
    } catch (e) { /* Haptics not available */ }
  };

  const optimizeBase64 = async (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height = (height * MAX_WIDTH) / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = base64;
    });
  };

  const handleTakeNativePhoto = async () => {
    try {
      await triggerHaptic();
      const image = await Camera.getPhoto({
        quality: 60,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      if (image.base64String) {
        const optimized = await optimizeBase64(`data:image/jpeg;base64,${image.base64String}`);
        setNewItemPhoto(optimized);
      }
    } catch (error) { console.log('Camera error:', error); }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const price = parseFloat(newItemPrice.replace(',', '.'));
    if (isNaN(price)) return;

    const newTotal = total + price;
    const isNowAlert = budgetLimit > 0 && newTotal >= budgetLimit * 0.9;
    const wasAlertBefore = budgetLimit > 0 && total < budgetLimit * 0.9;

    if (isNowAlert && wasAlertBefore) {
      await triggerHaptic('alert');
    } else {
      await triggerHaptic('notification');
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

  const handleDelete = async (id: string) => {
    if(confirm('Deseja excluir este item?')) {
      await triggerHaptic('impact');
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
      setCurrentSwipeOffset(Math.max(-100, diff));
      setSwipedItemId(id);
    }
  };

  const onTouchEnd = () => {
    if (currentSwipeOffset < -60) {
      setCurrentSwipeOffset(-80);
      triggerHaptic();
    } else {
      setCurrentSwipeOffset(0);
      setSwipedItemId(null);
    }
    setTouchStartX(null);
  };

  const getDashboardStyle = () => {
    if (budgetLimit === 0) return 'bg-white dark:bg-dark-card border-slate-100 dark:border-dark-border text-slate-800 dark:text-white';
    if (percent < 0.5) return 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/10';
    if (percent < 0.9) return 'bg-amber-400 text-slate-900 border-amber-300 shadow-amber-500/10';
    return 'bg-rose-600 text-white border-rose-500 shadow-rose-500/10';
  };

  const getMetaTextColor = () => {
    if (budgetLimit === 0) return 'text-slate-400';
    if (percent < 0.5) return 'text-white/70';
    if (percent < 0.9) return 'text-slate-700/80';
    return 'text-white/70';
  };

  const getTagStyle = () => {
    if (budgetLimit === 0) return 'bg-blue-50 dark:bg-blue-900/30 text-blue-500';
    if (percent < 0.5) return 'bg-white/20 text-white';
    if (percent < 0.9) return 'bg-black/10 text-slate-900';
    return 'bg-white/20 text-white';
  };

  const handlePedirClick = () => {
    triggerHaptic();
    if (budgetLimit === 0) {
      setIsConfiguringBudget(true);
    } else {
      setIsAdding(true);
    }
  };

  return (
    <div className="p-5 space-y-8 animate-slide-up">
      {/* Dashboard Widget */}
      <div className={`p-7 rounded-[2.5rem] shadow-2xl transition-all duration-700 border ${getDashboardStyle()}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>Gasto Atual</span>
              {currentLocation && <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${getTagStyle()} px-2 py-0.5 rounded-full`}><MapPin size={10} /> {currentLocation}</span>}
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none">
              {formatCurrency(total)}
            </h2>
            <p className={`text-xs font-bold mt-1 ${getMetaTextColor()}`}>
              de {budgetLimit > 0 ? formatCurrency(budgetLimit) : 'Sem limite'}
            </p>
          </div>
          <button 
            onClick={() => { triggerHaptic(); setIsConfiguringBudget(true); }} 
            className={`p-3 rounded-2xl transition-all active:scale-90 ${budgetLimit === 0 ? 'bg-slate-50 dark:bg-dark-border/50 text-slate-500 dark:text-slate-300' : 'bg-black/10'}`}
          >
            <Settings size={20} />
          </button>
        </div>
        <ProgressBar current={total} total={budgetLimit} />
      </div>

      <div className="space-y-4 pb-32">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Pedidos da Rodada</h3>
          <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 italic">Deslize para apagar</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-300 dark:text-slate-700">
             <div className="w-20 h-20 bg-slate-100 dark:bg-dark-card rounded-[2.5rem] flex items-center justify-center mb-5">
                <ReceiptText className="opacity-20" size={32} />
             </div>
            <p className="text-sm font-bold opacity-40">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="relative overflow-hidden rounded-[1.8rem]">
                <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="text-white flex flex-col items-center gap-1 active:scale-90 transition-transform"
                  >
                    <Trash2 size={24} />
                    <span className="text-[10px] font-black uppercase">Excluir</span>
                  </button>
                </div>

                <div 
                  className="bg-white dark:bg-dark-card p-4 rounded-[1.8rem] border border-slate-100 dark:border-dark-border flex items-center gap-4 relative z-10 transition-transform duration-300 ease-out shadow-sm"
                  style={{ transform: swipedItemId === item.id ? `translateX(${currentSwipeOffset}px)` : 'translateX(0px)' }}
                  onTouchStart={(e) => onTouchStart(e, item.id)}
                  onTouchMove={(e) => onTouchMove(e, item.id)}
                  onTouchEnd={onTouchEnd}
                  onClick={() => {
                    if (swipedItemId === item.id && currentSwipeOffset !== 0) {
                      setSwipedItemId(null);
                      setCurrentSwipeOffset(0);
                    } else {
                      triggerHaptic();
                      setEditingItem(item);
                    }
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-bg shrink-0 flex items-center justify-center border border-slate-50 dark:border-dark-border" onClick={(e) => { e.stopPropagation(); if(item.photo) setFullscreenPhoto(item.photo); }}>
                    {item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <CameraIcon size={24} className="text-slate-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-lg leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">{new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-blue-600 dark:text-blue-400 text-lg leading-none">{formatCurrency(item.price)}</span>
                    <div className="flex -mr-2 mt-1">
                      <button onClick={(e) => { e.stopPropagation(); triggerHaptic(); setItems(prev => [{...item, id: Date.now().toString(), timestamp: Date.now()}, ...prev]); }} className="p-3 text-slate-300 dark:text-slate-600 hover:text-blue-500"><Copy size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Adicionar Pedido */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[3rem] p-8 pb-12 space-y-8 animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[96vh] no-select">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingItem ? 'Editar Detalhes' : 'Novo Pedido'}</h3>
              <button onClick={closeModal} className="p-4 -mr-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={32} /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-8">
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[280px] rounded-[3.5rem] overflow-hidden bg-slate-50 dark:bg-dark-bg border-2 border-dashed border-slate-200 dark:border-dark-border group transition-all active:scale-[0.98]">
                  {newItemPhoto ? (
                    <div className="relative w-full h-full">
                      <img src={newItemPhoto} className="w-full h-full object-cover" />
                      <button type="button" onClick={handleTakeNativePhoto} className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCcw size={32} />
                        <span className="text-xs font-black uppercase mt-2">Trocar Foto</span>
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={handleTakeNativePhoto} className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                      <div className="p-6 bg-white dark:bg-dark-border/50 rounded-full shadow-lg">
                        <CameraIcon size={48} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Capturar Foto</span>
                        <p className="text-[10px] opacity-40 uppercase mt-1 tracking-tighter">Opcional, mas recomendado</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descrição</label>
                  <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Ex: Cerveja, Porção, Carvão..." className="w-full px-6 py-5 bg-slate-100 dark:bg-dark-bg rounded-2xl text-lg font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 border border-transparent transition-all" required />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Preço Unitário</label>
                   <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                    <input type="number" step="0.01" inputMode="decimal" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0,00" className="w-full pl-16 pr-6 py-5 bg-slate-100 dark:bg-dark-bg rounded-2xl text-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 border border-transparent transition-all" required />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                {editingItem ? 'Atualizar Pedido' : 'Adicionar ao Consumo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Viewer */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setFullscreenPhoto(null)}>
          <button className="absolute top-10 right-6 text-white bg-white/10 p-4 rounded-full backdrop-blur-md"><X size={32} /></button>
          <img src={fullscreenPhoto} className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-scale-in" />
        </div>
      )}

      {/* Bottom Floating Actions */}
      <div className="fixed bottom-28 left-0 right-0 max-w-md mx-auto px-6 flex gap-4 z-30 pointer-events-none">
        <button 
          onClick={handlePedirClick} 
          className="flex-[1.5] h-20 bg-blue-600 text-white rounded-[1.8rem] shadow-2xl shadow-blue-600/30 font-black active:scale-95 pointer-events-auto flex items-center justify-center gap-3 transition-all uppercase tracking-[0.15em] text-sm"
        >
          <Plus size={24}/> Pedir
        </button>
        {items.length > 0 && (
          <button 
            onClick={() => { triggerHaptic(); setIsFinishing(true); }} 
            className="flex-1 h-20 bg-emerald-600 text-white rounded-[1.8rem] shadow-2xl shadow-emerald-600/30 font-black active:scale-95 pointer-events-auto flex items-center justify-center gap-3 transition-all uppercase tracking-[0.15em] text-sm"
          >
            <CheckCircle2 size={24}/> Pagar
          </button>
        )}
      </div>

      {/* Modal: Configurações de Orçamento */}
      {isConfiguringBudget && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[3rem] p-8 pb-12 space-y-7 animate-in slide-in-from-bottom-full duration-500 no-select">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Planejamento</h3>
              <button onClick={() => setIsConfiguringBudget(false)} className="text-slate-400 p-2"><X /></button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Onde você está?</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400"><MapPin size={20} /></span>
                  <input type="text" value={currentLocation} placeholder="Ex: Praia, Balada, Churras" onChange={e => setCurrentLocation(e.target.value)} className="w-full pl-16 pr-6 py-6 bg-slate-100 dark:bg-dark-bg rounded-2xl text-xl font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Meta de Gasto (Limite)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                  <input type="number" value={budgetLimit === 0 ? '' : budgetLimit} placeholder="Ex: 300" onChange={e => setBudgetLimit(Number(e.target.value))} className="w-full pl-16 pr-6 py-6 bg-slate-100 dark:bg-dark-bg rounded-2xl text-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
            </div>

            <button onClick={() => { triggerHaptic(); setIsConfiguringBudget(false); }} className="w-full h-20 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Salvar Meta</button>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Conta */}
      {isFinishing && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[3rem] p-8 pb-12 space-y-7 animate-in slide-in-from-bottom-full duration-500">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Fechar Conta</h3>
                <button onClick={() => setIsFinishing(false)} className="text-slate-400 p-2"><X /></button>
             </div>
             
             <div className="p-7 bg-blue-600 text-white rounded-[2rem] space-y-5 shadow-2xl shadow-blue-600/20">
                <div className="flex justify-between font-bold opacity-70 text-sm tracking-widest uppercase"><span>Subtotal:</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between items-center border-t border-white/10 pt-5">
                  <label className="flex items-center gap-4 cursor-pointer select-none">
                    <div className="relative w-8 h-8">
                      <input 
                        type="checkbox" 
                        checked={includeTip} 
                        onChange={e => { triggerHaptic(); setIncludeTip(e.target.checked); }} 
                        className="peer appearance-none w-8 h-8 rounded-xl border-2 border-white/20 bg-white/10 checked:bg-white checked:border-white transition-all"
                      />
                      <CheckCircle2 size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">Taxa de Serviço (10%)</span>
                  </label>
                  <span className="font-bold opacity-80">{formatCurrency(total * 0.1)}</span>
                </div>
                <div className="flex justify-between text-4xl font-black border-t border-white/20 pt-5 leading-none"><span>TOTAL:</span><span>{formatCurrency(includeTip ? total * 1.1 : total)}</span></div>
             </div>

             <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Dividir Conta</span>
                  <div className="flex items-center gap-6">
                    <button onClick={() => { triggerHaptic(); setSplitCount(Math.max(1, splitCount - 1)); }} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-bg font-black text-2xl text-slate-600 dark:text-white active:scale-90 transition-all shadow-sm">-</button>
                    <span className="text-3xl font-black dark:text-white min-w-[2rem] text-center">{splitCount}</span>
                    <button onClick={() => { triggerHaptic(); setSplitCount(splitCount + 1); }} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-bg font-black text-2xl text-slate-600 dark:text-white active:scale-90 transition-all shadow-sm">+</button>
                  </div>
               </div>

               {splitCount > 1 && (
                 <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[1.8rem] flex justify-between items-center text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 animate-scale-in">
                   <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Por pessoa</span>
                    <span className="text-2xl font-black mt-1 leading-none">{formatCurrency((includeTip ? total * 1.1 : total) / splitCount)}</span>
                   </div>
                   <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                    <Plus size={24} className="opacity-40" />
                   </div>
                 </div>
               )}
             </div>

             <button 
               onClick={async () => { 
                await triggerHaptic('notification');
                onFinish({ id: Date.now().toString(), items, date: Date.now(), total, splitCount, hasTip: includeTip, tipAmount: includeTip ? total * 0.1 : 0, totalPerPerson: (includeTip ? total * 1.1 : total) / splitCount, location: currentLocation }); 
                setIsFinishing(false); 
               }} 
               className="w-full h-20 bg-emerald-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 active:scale-[0.98] transition-all"
             >
               Finalizar e Salvar
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionView;