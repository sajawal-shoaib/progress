import React from 'react';
import { DailyStatusLabel } from '../../types/winterArc';

interface StatusBadgeProps {
  status: DailyStatusLabel | string;
  size?: 'sm' | 'md' | 'lg';
  showScore?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showScore }) => {
  let badgeStyle = 'bg-gray-800/80 text-gray-400 border-gray-700/50';
  let dotColor = 'bg-gray-400';

  switch (status) {
    case 'Strong Day':
      badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50 shadow-emerald-950/30';
      dotColor = 'bg-emerald-400';
      break;
    case 'Good Day':
      badgeStyle = 'bg-sky-950/60 text-sky-400 border-sky-800/50 shadow-sky-950/30';
      dotColor = 'bg-sky-400';
      break;
    case 'Weak Day':
      badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/50 shadow-amber-950/30';
      dotColor = 'bg-amber-400';
      break;
    case 'Bad Day':
      badgeStyle = 'bg-rose-950/60 text-rose-400 border-rose-800/50 shadow-rose-950/30';
      dotColor = 'bg-rose-400';
      break;
    case 'Not Recorded':
    default:
      badgeStyle = 'bg-gray-900/80 text-gray-400 border-gray-800';
      dotColor = 'bg-gray-500';
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold gap-2',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm shadow-sm transition-all duration-200 ${badgeStyle} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      <span>{status}</span>
      {typeof showScore === 'number' && (
        <span className="opacity-75 font-mono ml-0.5">({showScore})</span>
      )}
    </span>
  );
};
