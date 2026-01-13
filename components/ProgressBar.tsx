import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const actualPercentage = total > 0 ? (current / total) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(actualPercentage, 0), 100);
  
  const isOverLimit = total > 0 && actualPercentage >= 100;

  const getBarColor = () => {
    if (isOverLimit) return 'bg-white'; // Branco sólido no fundo vermelho
    if (total <= 0) return 'bg-blue-500';
    if (actualPercentage < 50) return 'bg-emerald-500';
    if (actualPercentage < 85) return 'bg-amber-400';
    if (actualPercentage < 100) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const getStatusText = () => {
    if (total <= 0) return 'Sem limite';
    if (actualPercentage < 50) return 'No controle';
    if (actualPercentage < 85) return 'Gasto moderado';
    if (actualPercentage < 100) return 'Próximo ao limite';
    return 'Orçamento estourado';
  };

  const getStatusColor = () => {
    if (isOverLimit) return 'text-white';
    if (total <= 0) return 'text-blue-500';
    if (actualPercentage < 50) return 'text-emerald-600 dark:text-emerald-400';
    if (actualPercentage < 85) return 'text-amber-600 dark:text-amber-400';
    if (actualPercentage < 100) return 'text-orange-600 dark:text-orange-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[11px] font-extrabold uppercase tracking-widest ${getStatusColor()} ${isOverLimit ? 'animate-alert-blink' : ''}`}>
          {getStatusText()}
        </span>
        <span className={`text-[11px] font-bold ${isOverLimit ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
          {total > 0 ? `${Math.round(actualPercentage)}%` : '--'}
        </span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${isOverLimit ? 'bg-white/20' : 'bg-slate-200 dark:bg-dark-border'}`}>
        <div 
          className={`h-full transition-all duration-700 ease-in-out ${getBarColor()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;