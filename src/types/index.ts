export type Role = "ADMIN" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type ExpenseType = "SUPERMARKET" | "RECEIPT" | "INVOICE" | "OTHER";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCenter {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  date: Date;
  merchant: string;
  expenseType: ExpenseType;
  notes: string | null;
  costCenterId: string;
  costCenter: CostCenter;
  userId: string;
  user: User;
  imageUrl: string | null;
  rawAiData: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiExtractedData {
  merchant: string;
  amount: number;
  date: string; // ISO format
  expenseType: ExpenseType;
}

export interface DashboardStats {
  totalAmount: number;
  totalExpenses: number;
  avgAmount: number;
  byCostCenter: { name: string; total: number }[];
  byMonth: { month: string; total: number }[];
  byType: { type: string; total: number }[];
}
