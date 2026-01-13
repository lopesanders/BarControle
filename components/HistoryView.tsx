import React, { useState } from 'https://esm.sh/react@19.0.0';
import { Trash2, ChevronRight, X, Calendar, Users, Percent, MapPin, Receipt } from 'https://esm.sh/lucide-react@0.460.0';
import { ConsumptionSession } from '../types.ts';

interface HistoryViewProps {
  history: ConsumptionSession[];
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClear }) => {
  const [selectedSession, setSelectedSession] = useState<ConsumptionSession | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-6 space-y-8 animate-slide-up">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white uppercase">Histórico</h3>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full active:scale-95 transition-all"
          >
            <Trash2 size={14} />
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
          <div className="w-24 h-24 bg-slate-100 dark:bg-dark-card rounded-[2.5rem] flex items-center justify-center mb-6">
            <Calendar className="opacity-20" size={40} />
          </div>
          <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Nenhum registro</p>
          <p className="text-xs opacity-40 mt-1">Suas contas finalizadas aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(session => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full text-left bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-border flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                    {new Date(session.date).toLocaleDateString('pt-BR')} • {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {session.location && (
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-tighter"><MapPin size={8} /> {session.location}</span>
                  )}
                </div>
                <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {formatCurrency(session.total + session.tipAmount)}
                </h4>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  <span className="flex items-center gap-1.5"><Users size={12} /> {session.splitCount} {session.splitCount === 1 ? 'pessoa' : 'pessoas'}</span>
                  {session.hasTip && <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500"><Percent size={12} /> Gorjeta</span>}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-dark-border/50 rounded-2xl text-slate-300 dark:text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal: Detalhes da Sessão */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[85vh]">
            <div className="p-7 bg-blue-600 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Resumo da Noite</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] font-bold opacity-70 tracking-wider uppercase">{new Date(selectedSession.date).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-7 space-y-7">
              {selectedSession.location && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-blue-700 dark:text-blue-400">
                  <MapPin size={18} />
                  <span className="text-sm font-black uppercase tracking-wider">{selectedSession.location}</span>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-dark-border pb-2">Comanda Detalhada</h4>
                <div className="space-y-3">
                  {selectedSession.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{new Date(item.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-dark-bg rounded-[1.8rem] space-y-3 border border-slate-100 dark:border-dark-border">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span className="uppercase tracking-widest">Consumo:</span>
                  <span>{formatCurrency(selectedSession.total)}</span>
                </div>
                {selectedSession.hasTip && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span className="uppercase tracking-widest">Taxa Serviço:</span>
                    <span>{formatCurrency(selectedSession.tipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-dark-border">
                  <span className="uppercase tracking-tighter">Total Pago:</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(selectedSession.total + selectedSession.tipAmount)}</span>
                </div>
              </div>

              {selectedSession.splitCount > 1 && (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[1.8rem] border border-emerald-100 dark:border-emerald-900/20">
                  <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Rachado por {selectedSession.splitCount}</span>
                      <span className="text-2xl font-black mt-1 leading-none">
                        {formatCurrency(selectedSession.totalPerPerson)}
                      </span>
                    </div>
                    <Receipt size={24} className="opacity-30" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-7 bg-white dark:bg-dark-card border-t border-slate-50 dark:border-dark-border">
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full py-5 bg-slate-100 dark:bg-dark-border/50 text-slate-700 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;