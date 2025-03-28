
export interface PaymentReminder {
  id: string;
  accountNumber: string;
  promisedDate: Date;
  status: 'pending' | 'collected' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type PaymentStatus = 'pending' | 'collected' | 'overdue';
export type PaymentFilter = 'all' | 'upcoming' | 'overdue' | 'collected';
