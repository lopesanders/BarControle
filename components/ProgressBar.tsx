
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
  
  const getBarColor = () => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (percentage < 50) return 'Dentro do orçamento';
    if (percentage < 90) return 'Atenção aos gastos';
    return 'Limite atingido!';
  };

  const getStatusColor = () => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        <span className="text-xs font-bold text-gray-500">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
