
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Camera, CheckCircle2, Settings, X, Pencil, Copy, Maximize2, Loader2, Play } from 'lucide-react';
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
  };

  // Função de simulação para Android 16 (Gera uma imagem de teste)
  const simulateCameraCapture = () => {
    setIsProcessingPhoto(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Simula um fundo colorido de balada
        const grad = ctx.createLinearGradient(0, 0, 400, 400);
        grad.addColorStop(0, '#1e3a8a');
        grad.addColorStop(1, '#6366f1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 400, 400);
        
        // Simula um ícone de bebida
        ctx.fillStyle = "white";
        ctx.font = "100px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🍺", 200, 220);
        ctx.font = "20px Inter";
        ctx.fillText("SIMULAÇÃO ANDROID 16", 200, 350);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewItemPhoto(dataUrl);
        console.log("Simulação Android 16: Foto gerada com sucesso.");
      }
      setIsProcessingPhoto(false);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`Diagnostic: Arquivo recebido. Tamanho: ${(file.size / 1024).toFixed(2)}KB, Tipo: ${file.type}`);
    setIsProcessingPhoto(true);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.crossOrigin = "anonymous";

    img.onload = () => {
      console.log(`Diagnostic: Imagem carregada. Dimensões originais: ${img.width}x${img.height}`);
      try {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
          
          if (dataUrl && dataUrl.startsWith('data:image')) {
            setNewItemPhoto(dataUrl);
            console.log(`Diagnostic: Foto processada e otimizada. Tamanho Base64: ${(dataUrl.length / 1024).toFixed(2)}KB`);
          } else {
            console.error("Diagnostic: Falha ao gerar DataURL.");
            alert("Erro ao processar a imagem. Tente novamente.");
          }
        }
      } catch (err) {
        console.error("Diagnostic: Erro no canvas.", err);
        alert("O sistema não conseguiu processar a foto.");
      } finally {
        setIsProcessingPhoto(false);
        URL.revokeObjectURL(objectUrl);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
      }
    };

    img.onerror = (e) => {
      console.error("Diagnostic: Falha ao carregar Blob de imagem.", e);
      alert("Não foi possível ler a foto da câmera.");
      setIsProcessingPhoto(false);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
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
                      <BeerIcon size={24} />
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

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-full duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {editingItem ? 'Editar Pedido' : 'Novo Pedido'}
              </h3>
              <button onClick={closeModal} className="p-4 -mr-4 text-gray-400"><X /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Produto</span>
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="Ex: Chopp" 
                    className="w-full px-5 py-4 bg-gray-100 dark:bg-dark-bg border-none rounded-2xl font-bold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Preço</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    placeholder="0,00" 
                    className="w-full px-4 py-4 bg-gray-100 dark:bg-dark-bg border-none rounded-2xl font-bold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-5 p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl relative overflow-hidden">
                <div className={`relative w-24 h-24 bg-white dark:bg-dark-card rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${isProcessingPhoto ? 'border-blue-500' : 'border-gray-200 dark:border-dark-border'}`}>
                  {isProcessingPhoto ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="text-blue-500 animate-spin" size={24} />
                       <span className="text-[8px] font-black text-blue-500 uppercase">Processando</span>
                    </div>
                  ) : newItemPhoto ? (
                    <img src={newItemPhoto} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Camera className="text-gray-300 dark:text-gray-600" />
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    capture="environment"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:pointer-events-none"
                    disabled={isProcessingPhoto}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {isProcessingPhoto ? 'Processando...' : newItemPhoto ? 'Foto capturada!' : 'Toque no quadrado para capturar foto.'}
                  </p>
                  
                  <div className="flex gap-3">
                    {newItemPhoto && !isProcessingPhoto ? (
                      <button 
                        type="button" 
                        onClick={() => setNewItemPhoto(undefined)}
                        className="text-[10px] font-bold text-red-500 uppercase active:opacity-50"
                      >
                        Remover Foto
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={simulateCameraCapture}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase active:opacity-50"
                      >
                        <Play size={10} /> Simular Foto (And. 16)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessingPhoto}
                className={`w-full h-16 text-white rounded-2xl shadow-lg font-black uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 ${editingItem ? 'bg-amber-600' : 'bg-blue-600'}`}
              >
                {isProcessingPhoto ? 'Processando...' : editingItem ? 'Confirmar Edição' : 'Salvar Pedido'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rest of the modals (Finish/Split, Budget Limit) remain unchanged */}
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
