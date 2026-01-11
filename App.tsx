
import React, { useState, useEffect } from 'react';
import { 
  Beer, 
  History, 
  HelpCircle, 
  Plus, 
  X, 
  Camera, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react';
import { ConsumptionItem, ConsumptionSession, View } from './types';
import ConsumptionView from './components/ConsumptionView';
import HistoryView from './components/HistoryView';
import HelpView from './components/HelpView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('active');
  const [activeItems, setActiveItems] = useState<ConsumptionItem[]>([]);
  const [history, setHistory] = useState<ConsumptionSession[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(300);

  // Persistence
  useEffect(() => {
    const savedItems = localStorage.getItem('bar_active_items');
    const savedHistory = localStorage.getItem('bar_history');
    const savedBudget = localStorage.getItem('bar_budget_limit');

    if (savedItems) setActiveItems(JSON.parse(savedItems));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedBudget) setBudgetLimit(Number(savedBudget));
  }, []);

  useEffect(() => {
    localStorage.setItem('bar_active_items', JSON.stringify(activeItems));
  }, [activeItems]);

  useEffect(() => {
    localStorage.setItem('bar_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('bar_budget_limit', budgetLimit.toString());
  }, [budgetLimit]);

  const handleFinishSession = (session: ConsumptionSession) => {
    setHistory(prev => [session, ...prev]);
    setActiveItems([]);
    setCurrentView('history');
  };

  const clearHistory = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico?')) {
      setHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden shadow-2xl relative">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Beer className="text-blue-600" />
          BarControl
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentView('help')}
            className={`p-2 rounded-full transition-colors ${currentView === 'help' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <HelpCircle size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {currentView === 'active' && (
          <ConsumptionView 
            items={activeItems} 
            setItems={setActiveItems} 
            budgetLimit={budgetLimit}
            setBudgetLimit={setBudgetLimit}
            onFinish={handleFinishSession}
          />
        )}
        {currentView === 'history' && (
          <HistoryView 
            history={history} 
            onClear={clearHistory} 
          />
        )}
        {currentView === 'help' && (
          <HelpView onClose={() => setCurrentView('active')} />
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 safe-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setCurrentView('active')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'active' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Beer size={24} />
          <span className="text-xs font-medium">Consumo</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'history' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <History size={24} />
          <span className="text-xs font-medium">Histórico</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
