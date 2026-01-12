import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const actualPercentage = (current / total) * 100;
  const clampedPercentage = Math.min(Math.max(actualPercentage, 0), 100);
  
  const getBarColor = () => {
    if (actualPercentage < 50) return 'bg-green-500 dark:bg-green-400';
    if (actualPercentage < 90) return 'bg-yellow-500 dark:bg-yellow-400';
    if (actualPercentage < 100) return 'bg-orange-500 dark:bg-orange-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const getStatusText = () => {
    if (actualPercentage < 50) return 'Dentro do orçamento';
    if (actualPercentage < 90) return 'Atenção aos gastos';
    if (actualPercentage < 100) return 'Quase no limite do orçamento';
    return 'Limite atingido';
  };

  const getStatusColor = () => {
    if (actualPercentage < 50) return 'text-green-600 dark:text-green-400';
    if (actualPercentage < 90) return 'text-yellow-600 dark:text-yellow-400';
    if (actualPercentage < 100) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className={`text-xs font-bold uppercase tracking-wider ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{Math.round(actualPercentage)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)] ${getBarColor()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;