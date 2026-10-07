import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export const Badge = ({ status, text, className = '' }) => {
  const display = text || status?.replace(/_/g, ' ');
  const style = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ring-1 ring-inset uppercase tracking-wider ${style} ${className}`}
    >
      {display}
    </span>
  );
};

export default Badge;
