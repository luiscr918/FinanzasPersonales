import type { Timestamp } from "firebase/firestore";

export type MovementType =
  | "income"
  | "expense"
  | "transfer"
  | "third_party_in"
  | "third_party_reclassify"
  | "third_party_out"
  | "interest";
export type AccountType = "checking" | "savings" | "cash";
export type WithdrawalMode = "free" | "restricted";
export type AccountProduct =
  | "standard_savings"
  | "interest_savings"
  | "term_deposit"
  | "checking"
  | "cash";

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: AccountType;
  product: AccountProduct;
  openingBalanceCents: number;
  interestAnnualBps: number;
  active: boolean;
  description?: string;
  withdrawalMode?: WithdrawalMode;
  withdrawalUntil?: Timestamp;
}

export interface Movement {
  id: string;
  type: MovementType;
  amountCents: number;
  accountId: string;
  destinationAccountId?: string;
  category?: string;
  description: string;
  date: Timestamp;
  personalEffectCents: number;
  thirdPartyEffectCents: number;
  accountEffectCents: number;
  feeCents?: number;
  personId?: string;
  transferGroupId?: string;
  projectId?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetCents: number;
  savedCents: number;
  deadline?: Timestamp;
  accountId?: string;
  description?: string;
}

export type ProjectStatus = "planned" | "active" | "paused" | "completed";
export interface Project {
  id: string;
  name: string;
  budgetCents: number;
  status: ProjectStatus;
  participantIds?: string[];
  startDate?: Timestamp;
  endDate?: Timestamp;
  description?: string;
}

export interface ProjectContribution {
  id: string;
  projectId: string;
  amountCents: number;
  date: Timestamp;
  personId?: string;
  accountId?: string;
  movementId?: string;
  note?: string;
}

export interface Person {
  id: string;
  name: string;
  note?: string;
}
export interface Category {
  id: string;
  name: string;
  color: string;
  kind: "income" | "expense" | "both";
}
export interface RecurringIncome {
  id: string;
  concept: string;
  amountCents: number;
  frequency: "monthly";
  dayOfMonth?: number;
  accountId?: string;
  active: boolean;
  description?: string;
}
export interface RecurringExpense {
  id: string;
  concept: string;
  amountCents: number;
  category: string;
  frequency: "monthly" | "annual";
  dayOfMonth?: number;
  monthOfYear?: number;
  accountId?: string;
  active: boolean;
  description?: string;
}

export interface FinanceSummary {
  bankBalanceCents: number;
  personalBalanceCents: number;
  thirdPartyBalanceCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthSavingsCents: number;
  interestCents: number;
  expectedIncomeCents: number;
  fixedExpenseCents: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "transport", name: "Transporte", color: "#65e6b0", kind: "expense" },
  { id: "internet", name: "Internet", color: "#9b8cff", kind: "expense" },
  { id: "food", name: "Alimentación", color: "#f4b860", kind: "expense" },
  {
    id: "personal",
    name: "Gastos personales",
    color: "#ff7d9c",
    kind: "expense",
  },
  {
    id: "entertainment",
    name: "Entretenimiento",
    color: "#67b7ff",
    kind: "expense",
  },
  { id: "technology", name: "Tecnología", color: "#c18cff", kind: "expense" },
  { id: "health", name: "Salud", color: "#72ddc3", kind: "expense" },
  {
    id: "subscriptions",
    name: "Suscripciones",
    color: "#ffa66b",
    kind: "expense",
  },
  { id: "education", name: "Educación", color: "#e7d76d", kind: "expense" },
  { id: "other", name: "Otros", color: "#91a4bb", kind: "both" },
];

export const money = (cents: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export const centsFromInput = (value: string) =>
  Math.round(Number(value.replace(",", ".")) * 100);
export const accountProductLabel = (product: AccountProduct) =>
  ({
    standard_savings: "Cuenta de ahorros",
    interest_savings: "Ahorro con interés · retiro libre",
    term_deposit: "Depósito a plazo fijo",
    checking: "Cuenta corriente",
    cash: "Efectivo",
  })[product];
