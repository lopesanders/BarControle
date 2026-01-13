import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const actualPercentage = total > 0 ? (current / total) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(actualPercentage, 0), 100);
  
  const isOverLimit = total > 0 && actualPercentage >= 100;
  const isAlert = total > 0 && actualPercentage >= 90;

  const getBarColor = () => {
    if (isOverLimit) return 'bg-white';
    if (total <= 0) return 'bg-blue-500';
    if (actualPercentage < 50) return 'bg-white/40'; // Contraste no fundo verde
    if (actualPercentage < 90) return 'bg-black/20'; // Contraste no fundo amarelo
    return 'bg-white';
  };

  const getStatusText = () => {
    if (total <= 0) return 'Sem limite';
    if (actualPercentage < 50) return 'No controle';
    if (actualPercentage < 90) return 'Atenção ao gasto';
    if (actualPercentage < 100) return 'Limite próximo';
    return 'Orçamento estourado';
  };

  const getStatusColor = () => {
    if (total <= 0) return 'text-blue-500';
    if (actualPercentage < 50) return 'text-white';
    if (actualPercentage < 90) return 'text-slate-900';
    return 'text-white';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[11px] font-extrabold uppercase tracking-widest ${getStatusColor()} ${isAlert ? 'animate-alert-blink' : ''}`}>
          {getStatusText()}
        </span>
        <span className={`text-[11px] font-bold ${getStatusColor()} opacity-80`}>
          {total > 0 ? `${Math.round(actualPercentage)}%` : '--'}
        </span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${actualPercentage < 90 && actualPercentage >= 50 ? 'bg-black/10' : 'bg-white/20'}`}>
        <div 
          className={`h-full transition-all duration-700 ease-in-out ${getBarColor()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;