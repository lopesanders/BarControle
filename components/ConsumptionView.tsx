
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Camera, CheckCircle2, Settings, X, Copy, Maximize2, Loader2, RotateCcw, AlertTriangle, CameraOff, Sparkles } from 'lucide-react';
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
  
  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemPhoto, setNewItemPhoto] = useState<string | undefined>(undefined);

  const [splitCount, setSplitCount] = useState(1);
  const [includeTip, setIncludeTip] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const total = items.reduce((acc, item) => acc + item.price, 0);

  useEffect(() => {
    if (editingItem) {
      setNewItemName(editingItem.name);
      setNewItemPrice(editingItem.price.toString());
      setNewItemPhoto(editingItem.photo);
      setIsAdding(true);
    }
  }, [editingItem]);

  // Limpeza de câmera ao fechar modal
  useEffect(() => {
    if (!isAdding) {
      stopCamera();
    }
  }, [isAdding]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Erro ao acessar câmera:", err);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões do Android.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Ajustar canvas para o tamanho real do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Desenhar frame do vídeo no canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Converter para base64 otimizado
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        setNewItemPhoto(imageData);
        stopCamera();
      }
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

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
    stopCamera();
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemPrice('');
    setNewItemPhoto(undefined);
    setIsProcessingPhoto(false);
    setCameraError(null);
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
                  onClick={(e) => {
                    e.stopPropagation();
                    if(item.photo) setFullscreenPhoto(item.photo);
                  }}
                >
                  {item.photo ? (
                    <img src={item.photo} className="w-full h-full object-cover" alt={item.name} />
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
                    <button onClick={(e) => duplicateItem(e, item)} className="p-3 text-gray-300 active:text-blue-500 transition-colors"><Copy size={18} /></button>
                    <button onClick={(e) => removeItem(e, item.id)} className="p-3 text-gray-300 active:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NOVO PEDIDO MODAL - REFEITO PARA CÂMERA INTERNA */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-8 animate-in slide-in-from-bottom-full duration-300 overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {editingItem ? 'Editar Pedido' : 'Novo Pedido'}
              </h3>
              <button onClick={closeModal} className="p-4 -mr-4 text-gray-400 active:scale-90 transition-transform"><X size={28} /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-8">
              {/* ÁREA DA CÂMERA REFEITA */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full aspect-square max-w-[300px] rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-dark-bg border-4 border-dashed border-gray-200 dark:border-dark-border group">
                  {isCameraActive ? (
                    <div className="relative w-full h-full">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-1"
                      />
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        <button 
                          type="button" 
                          onClick={takeSnapshot}
                          className="w-16 h-16 bg-white rounded-full border-4 border-blue-500 shadow-xl active:scale-90 transition-transform"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={stopCamera}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : newItemPhoto ? (
                    <div className="relative w-full h-full">
                      <img src={newItemPhoto} className="w-full h-full object-cover" alt="Foto capturada" />
                      <button 
                        type="button" 
                        onClick={startCamera}
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RotateCcw size={32} className="mb-2" />
                        <span className="text-[10px] font-black uppercase">Tirar outra</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startCamera}
                      className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-600"
                    >
                      <div className="p-6 bg-white dark:bg-dark-card rounded-full shadow-lg">
                        <Camera size={48} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Tocar para Abrir Câmera</span>
                      {cameraError && (
                        <div className="mt-2 px-4 text-center">
                          <p className="text-[10px] text-red-500 font-bold leading-tight">{cameraError}</p>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase">Acesse as configurações do Android e permita o acesso à câmera.</p>
                        </div>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Canvas oculto para processamento */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Campos de Texto */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">Nome do Item</label>
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="Ex: Chopp Brahma" 
                    className="w-full px-6 py-5 bg-gray-100 dark:bg-dark-bg border-none rounded-[2rem] text-lg font-bold dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">Preço</label>
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
                className="w-full h-20 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-500/20 font-black uppercase tracking-widest text-lg active:scale-95 transition-all"
              >
                {editingItem ? 'Atualizar Pedido' : 'Adicionar ao Round'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Viewer */}
      {fullscreenPhoto && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setFullscreenPhoto(null)}
        >
          <button className="absolute top-10 right-6 p-4 text-white"><X size={32} /></button>
          <img src={fullscreenPhoto} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95" alt="Foto" />
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-6 flex gap-3 z-30 pointer-events-none">
        <button 
          onClick={() => setIsAdding(true)}
          className="flex-1 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 font-black active:scale-95 pointer-events-auto"
        >
          <Plus size={24} /> PEDIR
        </button>
        {items.length > 0 && (
          <button 
            onClick={() => setIsFinishing(true)}
            className="flex-1 h-14 bg-green-600 text-white rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 font-black active:scale-95 pointer-events-auto"
          >
            <CheckCircle2 size={24} /> CONTA
          </button>
        )}
      </div>

      {/* Configurações de Orçamento */}
      {isConfiguringBudget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">Limite da Noite</h3>
              <button onClick={() => setIsConfiguringBudget(false)} className="p-4 text-gray-400"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300">R$</span>
                <input 
                  type="number" 
                  value={budgetLimit}
                  onChange={e => setBudgetLimit(Number(e.target.value))}
                  className="w-full pl-16 pr-6 py-5 bg-gray-100 dark:bg-dark-bg border-none rounded-2xl text-2xl font-black dark:text-white"
                />
              </div>
              <button onClick={() => setIsConfiguringBudget(false)} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95">Definir Limite</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fechar Conta */}
      {isFinishing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end">
          <div className="bg-white dark:bg-dark-card w-full rounded-t-[2.5rem] p-8 pb-12 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">Finalizar</h3>
                <button onClick={() => setIsFinishing(false)} className="p-4 text-gray-400"><X /></button>
             </div>
             
             <div className="p-6 bg-blue-600 text-white rounded-3xl space-y-2">
                <div className="flex justify-between text-sm opacity-80"><span>Subtotal:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span></div>
                <div className="flex justify-between items-center py-2 border-t border-white/10">
                   <div className="flex items-center gap-2 font-bold"><span>Serviço (10%)</span><input type="checkbox" checked={includeTip} onChange={e => setIncludeTip(e.target.checked)} className="w-6 h-6 rounded-lg bg-white/20 border-none" /></div>
                   <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * 0.1)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-2 border-t border-white/20"><span>TOTAL:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(includeTip ? total * 1.1 : total)}</span></div>
             </div>

             <div className="flex justify-between items-center px-2">
                <span className="text-xs font-black text-gray-400 uppercase">Pessoas:</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-black">-</button>
                  <span className="text-2xl font-black dark:text-white">{splitCount}</span>
                  <button onClick={() => setSplitCount(splitCount + 1)} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-black">+</button>
                </div>
             </div>

             <button onClick={finishSession} className="w-full h-16 bg-green-600 text-white rounded-2xl shadow-xl font-black uppercase tracking-widest active:scale-95 transition-transform">Confirmar e Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
};

const BeerIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.5.5 2.5.5s1.44-.5 3-.5 2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"/><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/>
  </svg>
);

export default ConsumptionView;
