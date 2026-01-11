
import React, { useState } from 'react';
import { Trash2, ChevronRight, X, Calendar, Users, Percent } from 'lucide-react';
import { ConsumptionSession } from '../types';

interface HistoryViewProps {
  history: ConsumptionSession[];
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClear }) => {
  const [selectedSession, setSelectedSession] = useState<ConsumptionSession | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">Histórico</h3>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-4">
            <Calendar className="opacity-20" size={32} />
          </div>
          <p className="text-sm font-medium">Nenhum registro encontrado.</p>
          <p className="text-xs opacity-60">Seus gastos finalizados aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(session => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full text-left bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                  {new Date(session.date).toLocaleDateString('pt-BR')} • {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <h4 className="text-xl font-extrabold text-gray-800 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(session.total + session.tipAmount)}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Users size={12} /> {session.splitCount} {session.splitCount === 1 ? 'pessoa' : 'pessoas'}</span>
                  {session.hasTip && <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold"><Percent size={12} /> Gorjeta</span>}
                </div>
              </div>
              <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="p-6 bg-blue-600 dark:bg-blue-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Detalhes do Consumo</h3>
                <p className="text-xs opacity-80">{new Date(selectedSession.date).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Itens</h4>
                <div className="space-y-2">
                  {selectedSession.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl space-y-2 border border-gray-100 dark:border-dark-border">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSession.total)}</span>
                </div>
                {selectedSession.hasTip && (
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Gorjeta (10%):</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSession.tipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-dark-border">
                  <span>Total Final:</span>
                  <span className="text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSession.total + selectedSession.tipAmount)}</span>
                </div>
              </div>

              {selectedSession.splitCount > 1 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                  <div className="flex justify-between items-center text-green-700 dark:text-green-400">
                    <span className="text-sm font-medium">Por pessoa ({selectedSession.splitCount}):</span>
                    <span className="text-xl font-extrabold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSession.totalPerPerson)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border">
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full py-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-white rounded-2xl font-bold shadow-sm active:scale-95 transition-transform"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
