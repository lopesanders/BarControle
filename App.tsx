import React, { useState, useEffect } from 'https://esm.sh/react@19.0.0';
import { 
  Beer, 
  History, 
  HelpCircle, 
  Sun, 
  Moon
} from 'https://esm.sh/lucide-react@0.460.0';
import { ConsumptionItem, ConsumptionSession, View } from './types.ts';
import ConsumptionView from './components/ConsumptionView.tsx';
import HistoryView from './components/HistoryView.tsx';
import HelpView from './components/HelpView.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('active');
  const [activeItems, setActiveItems] = useState<ConsumptionItem[]>([]);
  const [history, setHistory] = useState<ConsumptionSession[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(300);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bar_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('bar_active_items');
      const savedHistory = localStorage.getItem('bar_history');
      const savedBudget = localStorage.getItem('bar_budget_limit');

      if (savedItems) setActiveItems(JSON.parse(savedItems));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedBudget) setBudgetLimit(Number(savedBudget));
    } catch (e) {
      console.warn("Erro ao carregar dados do localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bar_active_items', JSON.stringify(activeItems));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn("Espaço insuficiente para itens ativos");
      }
    }
  }, [activeItems]);

  useEffect(() => {
    try {
      localStorage.setItem('bar_history', JSON.stringify(history));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        const optimizedHistory = history.map((session, idx) => 
          idx > 5 ? { ...session, items: session.items.map(i => ({ ...i, photo: undefined })) } : session
        );
        localStorage.setItem('bar_history', JSON.stringify(optimizedHistory));
      }
    }
  }, [history]);

  useEffect(() => {
    localStorage.setItem('bar_budget_limit', budgetLimit.toString());
  }, [budgetLimit]);

  useEffect(() => {
    localStorage.setItem('bar_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFinishSession = (session: ConsumptionSession) => {
    try {
      setHistory(prev => [session, ...prev]);
      setActiveItems([]);
      setCurrentView('history');
    } catch (err) {
      console.error("Erro ao finalizar sessão:", err);
      setActiveItems([]);
      setCurrentView('history');
    }
  };

  const clearHistory = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico?')) {
      setHistory([]);
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] max-w-md mx-auto overflow-hidden relative theme-transition ${isDarkMode ? 'bg-dark-bg text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <header 
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
        className="bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-6 pb-4 flex justify-between items-center shrink-0 z-10"
      >
        <h1 className="text-xl font-black flex items-center gap-2">
          <Beer className="text-blue-600 dark:text-blue-400" />
          <span className="dark:text-white tracking-tight">Quanto Deu?</span>
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors active:scale-90"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setCurrentView('help')}
            className={`p-3 rounded-full transition-colors active:scale-90 ${currentView === 'help' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
          >
            <HelpCircle size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
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
        {/* Espaçador para não cobrir o conteúdo pelo nav fixo */}
        <div style={{ height: 'calc(env(safe-area-inset-bottom) + 80px)' }} />
      </main>

      <nav 
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-t border-gray-100 dark:border-dark-border flex justify-around items-center pt-3 z-40"
      >
        <button 
          onClick={() => setCurrentView('active')}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[80px] ${currentView === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
        >
          <Beer size={24} />
          <span className="text-[10px] font-bold uppercase">Consumo</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('history')}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[80px] ${currentView === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase">Histórico</span>
        </button>
      </nav>
    </div>
  );
};

export default App;