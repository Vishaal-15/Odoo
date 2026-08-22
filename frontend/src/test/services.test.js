import { describe, it, expect } from 'vitest';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import { payrollService } from '../services/payrollService';

describe('Frontend Services Layer', () => {
  it('attendanceService retrieves records and supports checkIn fallback', async () => {
    const records = await attendanceService.getAttendance();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);

    const checkInRecord = await attendanceService.checkIn();
    expect(checkInRecord.status).toBe('PRESENT');
  });

  it('leaveService supports balance retrieval and application', async () => {
    const balances = await leaveService.getLeaveBalances();
    expect(Array.isArray(balances)).toBe(true);
    expect(balances.some((b) => b.type === 'Paid Leave')).toBe(true);

    const newLeave = await leaveService.applyLeave({
      leave_type: 'Sick Leave',
      start_date: '2026-09-10',
      end_date: '2026-09-11',
      reason: 'Medical recovery',
      days_count: 2,
    });
    expect(newLeave.status).toBe('PENDING');
    expect(newLeave.leave_type).toBe('Sick Leave');
  });

  it('payrollService retrieves payslips and breakdowns', async () => {
    const payslips = await payrollService.getMyPayslips();
    expect(Array.isArray(payslips)).toBe(true);
    expect(payslips[0].net_salary).toBeGreaterThan(0);
  });
});
