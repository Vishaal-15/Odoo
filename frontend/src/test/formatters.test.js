import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatTime,
  calculateDaysBetween,
  getStatusColor,
} from '../utils/formatters';

describe('Formatters Utilities', () => {
  it('formats currency accurately', () => {
    expect(formatCurrency(5000)).toBe('$5,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(null)).toBe('$0.00');
  });

  it('calculates days between dates inclusively', () => {
    expect(calculateDaysBetween('2026-08-01', '2026-08-05')).toBe(5);
    expect(calculateDaysBetween('2026-08-10', '2026-08-10')).toBe(1);
    expect(calculateDaysBetween('', '')).toBe(0);
  });

  it('maps statuses to theme color variants', () => {
    expect(getStatusColor('APPROVED')).toBe('success');
    expect(getStatusColor('PRESENT')).toBe('success');
    expect(getStatusColor('PENDING')).toBe('warning');
    expect(getStatusColor('REJECTED')).toBe('danger');
    expect(getStatusColor('LEAVE')).toBe('info');
    expect(getStatusColor('UNKNOWN')).toBe('secondary');
  });
});
