import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { authorizedUid, db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import type {
  Account,
  Category,
  FinanceSummary,
  Goal,
  Movement,
  Person,
  RecurringExpense,
  RecurringIncome,
} from "../types";
import { DEFAULT_CATEGORIES } from "../types";

interface FinanceValue {
  accounts: Account[];
  movements: Movement[];
  goals: Goal[];
  people: Person[];
  categories: Category[];
  recurringIncome: RecurringIncome[];
  recurringExpenses: RecurringExpense[];
  summary: FinanceSummary;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addAccount: (value: Omit<Account, "id">) => Promise<void>;
  addMovement: (
    value: Omit<Movement, "id" | "date"> & { date: Date },
  ) => Promise<void>;
  addTransfer: (
    sourceAccountId: string,
    destinationAccountId: string,
    amountCents: number,
    date: Date,
    description: string,
  ) => Promise<void>;
  addTransferWithFee: (
    sourceAccountId: string,
    destinationAccountId: string,
    amountCents: number,
    feeCents: number,
    date: Date,
    description: string,
  ) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  addGoal: (value: Omit<Goal, "id">) => Promise<void>;
  addPerson: (value: Omit<Person, "id">) => Promise<void>;
  addRecurringIncome: (value: Omit<RecurringIncome, "id">) => Promise<void>;
  addRecurringExpense: (value: Omit<RecurringExpense, "id">) => Promise<void>;
}
const FinanceContext = createContext<FinanceValue | undefined>(undefined);
const path = (uid: string, name: string) => collection(db, "users", uid, name);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [recurringIncome, setRecurringIncome] = useState<RecurringIncome[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<
    RecurringExpense[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      if (authorizedUid && authorizedUid !== user.uid)
        throw new Error("uid-mismatch");
      const [a, m, g, p, c, ri, re] = await Promise.all([
        getDocs(path(user.uid, "accounts")),
        getDocs(query(path(user.uid, "movements"), orderBy("date", "desc"))),
        getDocs(path(user.uid, "goals")),
        getDocs(path(user.uid, "people")),
        getDocs(path(user.uid, "categories")),
        getDocs(path(user.uid, "recurringIncome")),
        getDocs(path(user.uid, "recurringExpenses")),
      ]);
      setAccounts(a.docs.map((x) => ({ id: x.id, ...x.data() }) as Account));
      setMovements(m.docs.map((x) => ({ id: x.id, ...x.data() }) as Movement));
      setGoals(g.docs.map((x) => ({ id: x.id, ...x.data() }) as Goal));
      setPeople(p.docs.map((x) => ({ id: x.id, ...x.data() }) as Person));
      setCategories(
        c.empty
          ? DEFAULT_CATEGORIES
          : c.docs.map((x) => ({ id: x.id, ...x.data() }) as Category),
      );
      setRecurringIncome(
        ri.docs.map((x) => ({ id: x.id, ...x.data() }) as RecurringIncome),
      );
      setRecurringExpenses(
        re.docs.map((x) => ({ id: x.id, ...x.data() }) as RecurringExpense),
      );
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      setError(
        code === "uid-mismatch"
          ? "El UID de la sesión no coincide con VITE_AUTHORIZED_UID."
          : "Firestore rechazó el acceso. Publica firestore.rules y verifica que su UID coincida con el usuario de Authentication. Esto no se debe a que la base esté vacía.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, [user?.uid]);
  const addAccount = async (value: Omit<Account, "id">) => {
    if (!user) return;
    await addDoc(path(user.uid, "accounts"), value);
    await refresh();
  };
  const addMovement = async (
    value: Omit<Movement, "id" | "date"> & { date: Date },
  ) => {
    if (!user) return;
    await addDoc(path(user.uid, "movements"), {
      ...value,
      date: Timestamp.fromDate(value.date),
      createdAt: serverTimestamp(),
    });
    await refresh();
  };
  const addTransferWithFee = async (
    sourceAccountId: string,
    destinationAccountId: string,
    amountCents: number,
    feeCents: number,
    date: Date,
    description: string,
  ) => {
    if (!user) return;
    const movementsRef = path(user.uid, "movements");
    const sourceRef = doc(movementsRef);
    const destinationRef = doc(movementsRef);
    const transferGroupId = sourceRef.id;
    await runTransaction(db, async (transaction) => {
      const shared = {
        type: "transfer",
        amountCents,
        feeCents,
        description,
        date: Timestamp.fromDate(date),
        thirdPartyEffectCents: 0,
        transferGroupId,
        createdAt: serverTimestamp(),
      };
      transaction.set(sourceRef, {
        ...shared,
        accountId: sourceAccountId,
        accountEffectCents: -(amountCents + feeCents),
        personalEffectCents: -feeCents,
      });
      transaction.set(destinationRef, {
        ...shared,
        accountId: destinationAccountId,
        accountEffectCents: amountCents,
        personalEffectCents: 0,
      });
    });
    await refresh();
  };
  const addTransfer = async (
    sourceAccountId: string,
    destinationAccountId: string,
    amountCents: number,
    date: Date,
    description: string,
  ) =>
    addTransferWithFee(
      sourceAccountId,
      destinationAccountId,
      amountCents,
      0,
      date,
      description,
    );
  const deleteMovement = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "movements", id));
    await refresh();
  };
  const addGoal = async (value: Omit<Goal, "id">) => {
    if (!user) return;
    await addDoc(path(user.uid, "goals"), value);
    await refresh();
  };
  const addPerson = async (value: Omit<Person, "id">) => {
    if (!user) return;
    await addDoc(path(user.uid, "people"), value);
    await refresh();
  };
  const addRecurringIncome = async (value: Omit<RecurringIncome, "id">) => {
    if (!user) return;
    await addDoc(path(user.uid, "recurringIncome"), value);
    await refresh();
  };
  const addRecurringExpense = async (value: Omit<RecurringExpense, "id">) => {
    if (!user) return;
    await addDoc(path(user.uid, "recurringExpenses"), value);
    await refresh();
  };
  const summary = useMemo<FinanceSummary>(() => {
    const bankBalanceCents =
      accounts.reduce((sum, a) => sum + a.openingBalanceCents, 0) +
      movements.reduce((sum, m) => sum + m.accountEffectCents, 0);
    const thirdPartyBalanceCents = movements.reduce(
      (sum, m) => sum + m.thirdPartyEffectCents,
      0,
    );
    const now = new Date();
    const month = movements.filter((m) => {
      const d = m.date?.toDate?.() ?? new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    const monthIncomeCents = month
      .filter((m) => m.personalEffectCents > 0)
      .reduce((s, m) => s + m.personalEffectCents, 0);
    const monthExpenseCents = Math.abs(
      month
        .filter((m) => m.personalEffectCents < 0)
        .reduce((s, m) => s + m.personalEffectCents, 0),
    );
    const interestCents = month
      .filter((m) => m.type === "interest")
      .reduce((s, m) => s + m.amountCents, 0);
    const expectedIncomeCents = recurringIncome
      .filter((item) => item.active)
      .reduce((sum, item) => sum + item.amountCents, 0);
    const fixedExpenseCents = recurringExpenses
      .filter((item) => item.active)
      .reduce((sum, item) => sum + item.amountCents, 0);
    return {
      bankBalanceCents,
      thirdPartyBalanceCents,
      personalBalanceCents: bankBalanceCents - thirdPartyBalanceCents,
      monthIncomeCents,
      monthExpenseCents,
      monthSavingsCents: monthIncomeCents - monthExpenseCents,
      interestCents,
      expectedIncomeCents,
      fixedExpenseCents,
    };
  }, [accounts, movements, recurringIncome, recurringExpenses]);
  return (
    <FinanceContext.Provider
      value={{
        accounts,
        movements,
        goals,
        people,
        categories,
        recurringIncome,
        recurringExpenses,
        summary,
        loading,
        error,
        refresh,
        addAccount,
        addMovement,
        addTransfer,
        addTransferWithFee,
        deleteMovement,
        addGoal,
        addPerson,
        addRecurringIncome,
        addRecurringExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}
export const useFinance = () => {
  const value = useContext(FinanceContext);
  if (!value)
    throw new Error("useFinance debe usarse dentro de FinanceProvider");
  return value;
};
