/**
 * Formatting utilities for Dayflow HRMS
 */

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
};

export const formatTime = (timeString) => {
  if (!timeString) return '—';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return timeString;

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isNaN(diffDays) ? 1 : diffDays;
};

export const getStatusColor = (status) => {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'APPROVED':
    case 'PRESENT':
    case 'PAID':
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
    case 'HALF_DAY':
    case 'UNPAID':
      return 'warning';
    case 'REJECTED':
    case 'ABSENT':
    case 'INACTIVE':
      return 'danger';
    case 'LEAVE':
    case 'ON_LEAVE':
      return 'info';
    default:
      return 'secondary';
  }
};
