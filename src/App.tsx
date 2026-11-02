import { useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Swal from "sweetalert2";
import { Timestamp } from "firebase/firestore";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Eye,
  EyeOff,
  Gauge,
  Goal,
  HeartHandshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { FinanceProvider, useFinance } from "./contexts/FinanceContext";
import {
  accountProductLabel,
  centsFromInput,
  money,
  type Account,
  type Movement,
  type Project,
} from "./types";
import { dateInputValue } from "./lib/format";
import { firebaseConfigured } from "./lib/firebase";

const nav = [
  { to: "/", label: "Resumen", icon: LayoutDashboard },
  { to: "/movimientos", label: "Movimientos", icon: Receipt },
  { to: "/transferencias", label: "Transferencias", icon: ArrowLeftRight },
  { to: "/cuentas", label: "Mis cuentas", icon: WalletCards },
  { to: "/terceros", label: "Dinero de terceros", icon: HeartHandshake },
  { to: "/objetivos", label: "Objetivos", icon: Target },
  { to: "/proyectos", label: "Proyectos", icon: BriefcaseBusiness },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Protected />} />
    </Routes>
  );
}
function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <FinanceProvider>
      <Shell />
    </FinanceProvider>
  );
}
function FullLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink text-mint">
      <Sparkles className="animate-pulse" />
    </div>
  );
}

function Login() {
  const { user, login, reset, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } finally {
      setBusy(false);
    }
  };
  const recover = async () => {
    if (!email)
      return Swal.fire({
        icon: "info",
        title: "Escribe tu correo",
        text: "Usaremos ese correo para enviarte el enlace de recuperación.",
        background: "#101c2c",
        color: "#fff",
      });
    try {
      await reset(email);
      await Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Revisa tu bandeja de entrada.",
        background: "#101c2c",
        color: "#fff",
      });
    } catch {
      /* Context shows the error. */
    }
  };
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-mint text-ink">
            <CircleDollarSign />
          </div>
          <div>
            <p className="font-bold tracking-tight text-white">
              Nexo financiero
            </p>
            <p className="text-xs text-slate-500">Tu dinero, con perspectiva</p>
          </div>
        </div>
        <div className="panel p-7 sm:p-9">
          <p className="mb-2 text-sm font-semibold text-mint">Acceso privado</p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            Bienvenido de vuelta.
          </h1>
          <p className="mb-8 text-sm leading-6 text-slate-400">
            Un espacio claro para entender tus decisiones financieras.
          </p>
          {!firebaseConfigured && (
            <div className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
              Configura las variables de Firebase en <code>.env.local</code>{" "}
              antes de iniciar sesión.
            </div>
          )}
          {error && (
            <div className="mb-5 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={submit}>
            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[.06] hover:text-mint"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Validando..." : "Entrar a mi espacio"}
              <ChevronRight size={17} />
            </button>
          </form>
          <button
            onClick={recover}
            className="mt-6 w-full text-center text-sm text-slate-400 transition hover:text-mint"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} /> Acceso protegido por Firebase
        </p>
      </div>
    </main>
  );
}

function Shell() {
  const { user, logout } = useAuth();
  const { error } = useFinance();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title =
    nav.find((item) => item.to === location.pathname)?.label ?? "Resumen";
  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-white/[.07] bg-[#091525] p-5 transition-transform lg:static lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-mint text-ink">
              <CircleDollarSign size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Nexo financiero</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Personal hub
              </p>
            </div>
          </div>
          <button
            className="text-slate-400 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="my-8 h-px bg-white/[.07]" />
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
          Tu espacio
        </p>
        <nav className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive ? "bg-mint/10 font-semibold text-mint" : "text-slate-400 hover:bg-white/[.05] hover:text-white"}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden rounded-2xl border border-violet/20 bg-violet/10 p-4 lg:block">
          <Sparkles className="mb-3 text-violet" size={18} />
          <p className="text-sm font-semibold text-white">
            Mi asesor financiero
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Recomendaciones basadas en tus movimientos reales.
          </p>
          <NavLink
            to="/"
            className="mt-3 inline-block text-xs font-bold text-violet"
          >
            Ver recomendaciones →
          </NavLink>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[.07] bg-ink/80 px-5 backdrop-blur-xl lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="text-slate-300 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <div>
              <p className="text-xs text-slate-500">Mi espacio financiero /</p>
              <h2 className="font-semibold text-white">{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white sm:block">
              <Bell size={17} />
            </button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-3">
              <div className="grid size-9 place-items-center rounded-full bg-violet/20 text-sm font-bold text-violet">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="max-w-[170px] truncate text-sm font-semibold text-white">
                  {user?.email}
                </p>
                <button
                  onClick={() => void logout()}
                  className="text-xs text-slate-500 hover:text-red-300"
                >
                  Cerrar sesión
                </button>
              </div>
              <button
                title="Cerrar sesión"
                onClick={() => void logout()}
                className="text-slate-500 hover:text-red-300 sm:hidden"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">
              <ShieldCheck className="mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-semibold">No se pudo leer Firestore</p>
                <p className="mt-1 leading-6">{error}</p>
                <p className="mt-2 text-xs text-red-100/70">
                  Si acabas de cambiar las reglas, vuelve a publicarlas y cierra
                  sesión antes de probar otra vez.
                </p>
              </div>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/movimientos" element={<Movements />} />
            <Route path="/transferencias" element={<TransferPage />} />
            <Route path="/ingresos-fijos" element={<RecurringIncomePage />} />
            <Route path="/gastos-fijos" element={<RecurringExpensesPage />} />
            <Route path="/cuentas" element={<Accounts />} />
            <Route path="/terceros" element={<ThirdParties />} />
            <Route path="/objetivos" element={<Goals />} />
            <Route path="/proyectos" element={<Projects />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/configuracion" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  const { summary } = useFinance();
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-mint">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {text}
          </p>
        </div>
        {action}
      </div>
      {title === "Tu panorama financiero" && (
        <div className="mb-5 grid gap-4 rounded-3xl border border-violet/20 bg-violet/[.06] p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Ingreso esperado
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {money(summary.expectedIncomeCents)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              No afecta el saldo hasta recibirlo
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Compromisos fijos
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {money(summary.fixedExpenseCents)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Reserva mensual, incluyendo pagos anuales prorrateados
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Margen planificado
            </p>
            <p
              className={`mt-1 text-xl font-bold ${summary.expectedIncomeCents - summary.fixedExpenseCents >= 0 ? "text-mint" : "text-amber-200"}`}
            >
              {money(summary.expectedIncomeCents - summary.fixedExpenseCents)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Antes de gastos variables
            </p>
          </div>
        </div>
      )}
    </>
  );
}
function Stat({
  label,
  value,
  detail,
  icon: Icon,
  tone = "mint",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
  tone?: "mint" | "violet" | "amber";
}) {
  return (
    <div className="panel p-5">
      <div className="mb-5 flex items-start justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div
          className={`rounded-xl p-2.5 ${tone === "mint" ? "bg-mint/10 text-mint" : tone === "violet" ? "bg-violet/10 text-violet" : "bg-amber-300/10 text-amber-200"}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Dashboard() {
  const { summary, movements, accounts, goals, loading } = useFinance();
  const chart = [
    {
      month: "Ago",
      value: Math.max(0, summary.personalBalanceCents - 21000) / 100,
    },
    {
      month: "Sep",
      value: Math.max(0, summary.personalBalanceCents - 14000) / 100,
    },
    {
      month: "Oct",
      value: Math.max(0, summary.personalBalanceCents - 7000) / 100,
    },
    { month: "Nov", value: summary.personalBalanceCents / 100 },
  ];
  const distribution = accounts
    .map((account, i) => ({
      name: account.name,
      value:
        Math.max(
          0,
          account.openingBalanceCents +
            movements
              .filter((m) => m.accountId === account.id)
              .reduce((s, m) => s + m.accountEffectCents, 0),
        ) / 100,
      color: ["#65e6b0", "#9b8cff", "#f4b860", "#67b7ff"][i % 4],
    }))
    .filter((x) => x.value > 0);
  const recent = movements.slice(0, 4);
  return (
    <>
      {loading ? (
        <FullLoader />
      ) : (
        <>
          <PageIntro
            eyebrow="Domingo, 01 de noviembre"
            title="Tu panorama financiero"
            text="Una vista honesta de lo que tienes, lo que debes y lo que puedes decidir."
            action={
              <NavLink to="/movimientos" className="btn-primary">
                <Plus size={17} />
                Registrar movimiento
              </NavLink>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Patrimonio personal"
              value={money(summary.personalBalanceCents)}
              detail="Saldo propio neto de terceros"
              icon={CircleDollarSign}
            />
            <Stat
              label="Disponible en bancos"
              value={money(summary.bankBalanceCents)}
              detail="Incluye dinero en tránsito"
              icon={WalletCards}
              tone="violet"
            />
            <Stat
              label="Ingresos del mes"
              value={money(summary.monthIncomeCents)}
              detail="Movimientos propios recibidos"
              icon={ArrowDownLeft}
            />
            <Stat
              label="Gastos del mes"
              value={money(summary.monthExpenseCents)}
              detail={`${summary.monthSavingsCents >= 0 ? "Ahorro" : "Déficit"}: ${money(Math.abs(summary.monthSavingsCents))}`}
              icon={ArrowUpRight}
              tone="amber"
            />
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <div className="panel p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    Evolución patrimonial
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Estimación según tu libro de movimientos
                  </p>
                </div>
                <span className="rounded-lg bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">
                  USD
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart}>
                    <defs>
                      <linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#65e6b0"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#65e6b0"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748b"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#101c2c",
                        border: "1px solid #ffffff18",
                        borderRadius: 12,
                      }}
                      formatter={(v: number) => [
                        `$${v.toFixed(2)}`,
                        "Patrimonio",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#65e6b0"
                      strokeWidth={3}
                      fill="url(#mintFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="panel p-5 sm:p-6">
              <div className="mb-3">
                <h2 className="font-semibold text-white">
                  Dónde está tu dinero
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Distribución de saldos actuales
                </p>
              </div>
              {distribution.length ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={52}
                          outerRadius={75}
                          paddingAngle={4}
                        >
                          {distribution.map((x) => (
                            <Cell key={x.name} fill={x.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#101c2c",
                            border: "1px solid #ffffff18",
                            borderRadius: 12,
                          }}
                          formatter={(v: number) => [
                            `$${v.toFixed(2)}`,
                            "Saldo",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {distribution.map((x) => (
                      <div
                        className="flex items-center justify-between text-sm"
                        key={x.name}
                      >
                        <span className="flex items-center gap-2 text-slate-400">
                          <i
                            className="size-2 rounded-full"
                            style={{ background: x.color }}
                          />
                          {x.name}
                        </span>
                        <span className="font-semibold text-white">
                          ${x.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Empty
                  icon={WalletCards}
                  title="Aún no hay cuentas"
                  text="Agrega tus cuentas para ver tu distribución real."
                />
              )}
            </div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    Actividad reciente
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Tus últimos movimientos registrados
                  </p>
                </div>
                <NavLink
                  className="text-xs font-bold text-mint"
                  to="/movimientos"
                >
                  Ver historial
                </NavLink>
              </div>
              {recent.length ? (
                <div className="divide-y divide-white/[.06]">
                  {recent.map((m) => (
                    <MovementRow key={m.id} movement={m} />
                  ))}
                </div>
              ) : (
                <Empty
                  icon={Receipt}
                  title="Tu libro está limpio"
                  text="El primer movimiento que registres aparecerá aquí."
                />
              )}
            </div>
            <Advisor />
          </div>
          <div className="mt-5 panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  Objetivos en marcha
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Asignaciones virtuales, sin duplicar tu patrimonio
                </p>
              </div>
              <NavLink className="text-xs font-bold text-mint" to="/objetivos">
                Gestionar objetivos
              </NavLink>
            </div>
            {goals.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {goals.slice(0, 4).map((g) => (
                  <GoalBar key={g.id} goal={g} />
                ))}
              </div>
            ) : (
              <Empty
                icon={Target}
                title="Define una dirección"
                text="Crea un objetivo para convertir tu ahorro en un plan concreto."
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

function Advisor() {
  const { summary } = useFinance();
  const plannedIncome = summary.monthIncomeCents || summary.expectedIncomeCents;
  const plannedExpenses = summary.monthExpenseCents + summary.fixedExpenseCents;
  const ratio = plannedIncome
    ? Math.round((plannedExpenses / plannedIncome) * 100)
    : 0;
  const text = !plannedIncome
    ? "Registra un ingreso fijo o un ingreso recibido para generar recomendaciones ajustadas a tu realidad."
    : ratio > 80
      ? "Tus gastos y compromisos están utilizando gran parte de tus ingresos. Revisa tus obligaciones antes de asumir nuevas inversiones."
      : "Tu margen planificado permite separar una parte para objetivos sin confundirlo con dinero de terceros.";
  return (
    <div className="rounded-3xl border border-violet/20 bg-gradient-to-br from-violet/10 to-transparent p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-violet/15 p-2.5 text-violet">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-white">Mi asesor financiero</h2>
          <p className="text-xs text-slate-500">Reglas basadas en tus datos</p>
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-300">{text}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/[.08] pt-4 text-xs">
        <span className="text-slate-500">Plan / ingreso</span>
        <span className={ratio > 80 ? "text-amber-200" : "text-mint"}>
          {plannedIncome ? `${ratio}%` : "Sin datos"}
        </span>
      </div>
    </div>
  );
}

function MovementRow({
  movement,
  onDelete,
}: {
  movement: Movement;
  onDelete?: () => void;
}) {
  const isClassification = movement.type === "third_party_reclassify";
  const positive = movement.accountEffectCents > 0;
  const typeLabel = isClassification
    ? "Saldo clasificado como dinero de terceros"
    : (movement.category ??
      (movement.type === "transfer" ? "Transferencia interna" : movement.type));
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${isClassification ? "bg-amber-300/10 text-amber-200" : positive ? "bg-mint/10 text-mint" : "bg-red-300/10 text-red-200"}`}
      >
        {isClassification ? (
          <HeartHandshake size={17} />
        ) : positive ? (
          <ArrowDownLeft size={17} />
        ) : (
          <ArrowUpRight size={17} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">
          {movement.description}
        </p>
        <p className="text-xs text-slate-500">{typeLabel}</p>
      </div>
      <p
        className={`text-sm font-semibold ${isClassification ? "text-amber-200" : positive ? "text-mint" : "text-slate-200"}`}
      >
        {isClassification
          ? "Clasificado"
          : `${positive ? "+" : "-"}${money(Math.abs(movement.accountEffectCents))}`}
      </p>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-slate-600 hover:text-red-300"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
function Empty({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Receipt;
  title: string;
  text: string;
}) {
  return (
    <div className="grid min-h-36 place-items-center py-5 text-center">
      <Icon className="mb-3 text-slate-600" size={25} />
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{text}</p>
    </div>
  );
}
function GoalBar({
  goal,
}: {
  goal: { name: string; savedCents: number; targetCents: number };
}) {
  const percent = Math.min(
    100,
    Math.round((goal.savedCents / goal.targetCents) * 100),
  );
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">{goal.name}</span>
        <span className="font-semibold text-mint">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[.08]">
        <div
          className="h-full rounded-full bg-mint"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {money(goal.savedCents)} de {money(goal.targetCents)}
      </p>
    </div>
  );
}

function Accounts() {
  const { accounts, addAccount, updateAccount, movements } = useFinance();
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [bank, setBank] = useState("Banco Pichincha");
  const [product, setProduct] =
    useState<Account["product"]>("standard_savings");
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [withdrawalMode, setWithdrawalMode] = useState<"free" | "restricted">("free");
  const [withdrawalUntil, setWithdrawalUntil] = useState("");
  const resetForm = () => {
    setName("");
    setBank("Banco Pichincha");
    setProduct("standard_savings");
    setBalance("");
    setRate("");
    setDescription("");
    setWithdrawalMode("free");
    setWithdrawalUntil("");
    setEditing(null);
    setForm(false);
  };
  const startEdit = (account: Account) => {
    setEditing(account);
    setName(account.name);
    setBank(account.bank);
    setProduct(account.product);
    const movementEffectCents = movements
      .filter((movement) => movement.accountId === account.id)
      .reduce((sum, movement) => sum + movement.accountEffectCents, 0);
    const currentBalanceCents = account.openingBalanceCents + movementEffectCents;
    setBalance((currentBalanceCents / 100).toFixed(2));
    setRate(
      account.interestAnnualBps
        ? (account.interestAnnualBps / 100).toFixed(2)
        : "",
    );
    setDescription(account.description ?? "");
    setWithdrawalMode(account.withdrawalMode ?? "free");
    setWithdrawalUntil(
      account.withdrawalUntil?.toDate().toISOString().slice(0, 10) ?? "",
    );
    setForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bank) return;
    const movementEffectCents = editing
      ? movements
          .filter((movement) => movement.accountId === editing.id)
          .reduce((sum, movement) => sum + movement.accountEffectCents, 0)
      : 0;
    const desiredBalanceCents = centsFromInput(balance || "0");
    const value: Omit<Account, "id"> = {
      name,
      bank,
      type:
        product === "cash"
          ? "cash"
          : product === "checking"
            ? "checking"
            : "savings",
      product,
      // On edit, preserve movement history and change only the opening base.
      openingBalanceCents: editing
        ? desiredBalanceCents - movementEffectCents
        : desiredBalanceCents,
      interestAnnualBps:
        product === "interest_savings"
          ? Math.round(Number(rate || "0") * 100)
          : 0,
      active: editing?.active ?? true,
      description: description || undefined,
      withdrawalMode,
      withdrawalUntil:
        withdrawalMode === "restricted" && withdrawalUntil
          ? Timestamp.fromDate(new Date(`${withdrawalUntil}T12:00:00`))
          : undefined,
    };
    if (editing) await updateAccount(editing.id, value);
    else await addAccount(value);
    const wasEditing = Boolean(editing);
    resetForm();
    await Swal.fire({
      icon: "success",
      title: wasEditing ? "Cuenta actualizada" : "Cuenta agregada",
      timer: 1300,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  return (
    <>
      <PageIntro
        eyebrow="Patrimonio"
        title="Mis cuentas"
        text="El saldo bancario real, separado de tus asignaciones y obligaciones."
        action={
          <button className="btn-primary" onClick={() => setForm(!form)}>
            <Plus size={17} />
            Nueva cuenta
          </button>
        }
      />
      {form && (
        <FormCard
          title={editing ? "Editar cuenta" : "Agregar cuenta"}
          onSubmit={submit}
          onCancel={resetForm}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre identificador">
              <input
                className="input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahorro con interés Pichincha"
              />
            </Field>
            <Field label="Banco">
              <select
                className="input"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                <option>Banco Pichincha</option>
                <option>Produbanco</option>
                <option>Otro banco</option>
              </select>
            </Field>
            <Field label="Producto bancario">
              <select
                className="input"
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value as Account["product"])
                }
              >
                <option value="standard_savings">Cuenta de ahorros</option>
                <option value="interest_savings">
                  Cuenta de ahorro con interés · retiro libre
                </option>
                <option value="checking">Cuenta corriente</option>
                <option value="cash">Efectivo</option>
              </select>
            </Field>
            {product === "interest_savings" && (
              <Field label="Tasa anual referencial (%)">
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-slate-500">
                  El saldo puede retirarse en cualquier momento. La tasa es
                  referencial y no representa una ganancia garantizada.
                </p>
              </Field>
            )}
            <Field label="Disponibilidad del dinero">
              <select className="input" value={withdrawalMode} onChange={(e) => setWithdrawalMode(e.target.value as typeof withdrawalMode)}>
                <option value="free">Retiro libre</option>
                <option value="restricted">Retiro restringido</option>
              </select>
            </Field>
            {withdrawalMode === "restricted" && (
              <Field label="Disponible para retirar desde">
                <input className="input" type="date" required value={withdrawalUntil} onChange={(e) => setWithdrawalUntil(e.target.value)} />
              </Field>
            )}
            <Field label={`${editing ? "Saldo actual" : "Saldo inicial"} (USD)`}>
              <input
                className="input"
                type="number"
                 min={editing ? undefined : "0"}
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
              />
              {editing && (
                <p className="mt-1 text-xs text-slate-500">
                  Se conservarán los movimientos existentes y este valor será el
                  nuevo saldo calculado de la cuenta.
                </p>
              )}
            </Field>
            <Field label="Descripción o notas (opcional)">
              <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ahorro blindado, condiciones, etc." />
            </Field>
          </div>
        </FormCard>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((a) => {
          const balanceCents =
            a.openingBalanceCents +
            movements
              .filter((m) => m.accountId === a.id)
              .reduce((s, m) => s + m.accountEffectCents, 0);
          return (
            <div className="panel p-6" key={a.id}>
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet/10 p-3 text-violet">
                    <CreditCard />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{a.name}</h3>
                    <p className="text-xs text-slate-500">
                      {a.bank} · {accountProductLabel(a.product)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mint">
                  Activa
                </span>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Saldo actual
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {money(balanceCents)}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/[.07] pt-4 text-xs text-slate-500">
                <span>
                  {movements.filter((m) => m.accountId === a.id).length}{" "}
                  movimientos
                </span>
                 <span>
                   {a.product === "interest_savings"
                     ? `${(a.interestAnnualBps / 100).toFixed(2)}% anual referencial · ${a.withdrawalMode === "restricted" ? `restringido${a.withdrawalUntil ? ` hasta ${a.withdrawalUntil.toDate().toLocaleDateString("es-EC")}` : ""}` : "retiro libre"}`
                     : a.withdrawalMode === "restricted"
                       ? `Retiro restringido${a.withdrawalUntil ? ` hasta ${a.withdrawalUntil.toDate().toLocaleDateString("es-EC")}` : ""}`
                       : "Sin intereses configurados"}
                 </span>
               </div>
               {a.description && <p className="mt-3 text-xs text-slate-400">{a.description}</p>}
               <button className="btn-ghost mt-4" onClick={() => startEdit(a)}>
                 <Pencil size={15} /> Editar cuenta
               </button>
            </div>
          );
        })}
      </div>
      {!accounts.length && (
        <div className="panel">
          <Empty
            icon={Banknote}
            title="Aún no conectas tus cuentas"
            text="Agrega Pichincha, Produbanco o cualquier cuenta que quieras controlar."
          />
        </div>
      )}
    </>
  );
}

function FormCard({
  title,
  onSubmit,
  onCancel,
  children,
}: {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="panel mb-6 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-white">{title}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
      {children}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
        <button className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Movements() {
  const {
    movements,
    accounts,
    categories,
    addMovement,
    addTransfer,
    deleteMovement,
  } = useFinance();
  const [form, setForm] = useState(false);
  const [kind, setKind] = useState<
    | "income"
    | "expense"
    | "interest"
    | "transfer"
    | "third_party_in"
    | "third_party_out"
  >("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");
  const [category, setCategory] = useState("personal");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dateInputValue());
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(amount);
    if (!amountCents || !accountId || !description) return;
    if (kind === "transfer") {
      if (!destinationAccountId || destinationAccountId === accountId) return;
      await addTransfer(
        accountId,
        destinationAccountId,
        amountCents,
        new Date(`${date}T12:00:00`),
        description,
      );
    } else {
      const sign = kind === "expense" || kind === "third_party_out" ? -1 : 1;
      await addMovement({
        type: kind,
        amountCents,
        accountId,
        category,
        description,
        date: new Date(`${date}T12:00:00`),
        accountEffectCents: amountCents * sign,
        personalEffectCents: kind.startsWith("third_party")
          ? 0
          : amountCents * sign,
        thirdPartyEffectCents:
          kind === "third_party_in"
            ? amountCents
            : kind === "third_party_out"
              ? -amountCents
              : 0,
      });
    }
    setAmount("");
    setDescription("");
    setForm(false);
    await Swal.fire({
      icon: "success",
      title:
        kind === "transfer"
          ? "Transferencia completada"
          : "Movimiento registrado",
      timer: 1300,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  const askDelete = async (id: string) => {
    const r = await Swal.fire({
      title: "¿Eliminar movimiento?",
      text: "El saldo y los indicadores se recalcularán.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      background: "#101c2c",
      color: "#fff",
      confirmButtonColor: "#ef6b78",
    });
    if (r.isConfirmed) await deleteMovement(id);
  };
  return (
    <>
      <PageIntro
        eyebrow="Libro financiero"
        title="Movimientos"
        text="Cada entrada y salida queda registrada con su efecto real sobre tu dinero."
        action={
          <button className="btn-primary" onClick={() => setForm(!form)}>
            <Plus size={17} />
            Nuevo movimiento
          </button>
        }
      />
      {form && (
        <FormCard
          title="Registrar movimiento"
          onSubmit={submit}
          onCancel={() => setForm(false)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <select
                className="input"
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="expense">Gasto personal</option>
                <option value="income">Ingreso personal</option>
                <option value="interest">Interés acreditado</option>
                <option value="transfer">
                  Transferencia entre mis cuentas
                </option>
                <option value="third_party_in">
                  Dinero recibido de terceros
                </option>
                <option value="third_party_out">
                  Dinero entregado a terceros
                </option>
              </select>
            </Field>
            <Field label="Monto (USD)">
              <input
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </Field>
            <Field label={kind === "transfer" ? "Cuenta de origen" : "Cuenta"}>
              <select
                className="input"
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Selecciona una cuenta</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.bank}
                  </option>
                ))}
              </select>
            </Field>
            {kind === "transfer" && (
              <Field label="Cuenta de destino">
                <select
                  className="input"
                  required
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} · {a.bank}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <Field label="Fecha">
              <input
                className="input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            {!kind.startsWith("third_party") && kind !== "transfer" && (
              <Field label="Categoría">
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Descripción">
              <input
                className="input"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Ahorro de noviembre"
              />
            </Field>
          </div>
        </FormCard>
      )}
      <div className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Historial unificado</h2>
            <p className="mt-1 text-xs text-slate-500">
              {movements.length} operaciones guardadas
            </p>
          </div>
          <button className="btn-ghost">
            <CalendarDays size={16} />
            Filtrar
          </button>
        </div>
        {movements.length ? (
          <div className="divide-y divide-white/[.06]">
            {movements.map((m) => (
              <MovementRow
                key={m.id}
                movement={m}
                onDelete={() => void askDelete(m.id)}
              />
            ))}
          </div>
        ) : (
          <Empty
            icon={Receipt}
            title="Sin movimientos todavía"
            text="Registra tu primer ingreso o gasto para comenzar a conocer tus patrones."
          />
        )}
      </div>
    </>
  );
}

function ThirdParties() {
  const { summary, people, accounts, movements, addPerson, addMovement } =
    useFinance();
  const [personForm, setPersonForm] = useState(false);
  const [operationForm, setOperationForm] = useState(false);
  const [name, setName] = useState("");
  const [personId, setPersonId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [operation, setOperation] = useState<
    "third_party_in" | "third_party_reclassify" | "third_party_out"
  >("third_party_in");
  const [date, setDate] = useState(dateInputValue());
  const pendingFor = (id: string) =>
    movements
      .filter((m) => m.personId === id)
      .reduce((sum, m) => sum + m.thirdPartyEffectCents, 0);
  const editPending = async (person: (typeof people)[number]) => {
    const currentCents = pendingFor(person.id);
    const result = await Swal.fire({
      title: `Pendiente de ${person.name}`,
      input: "number",
      inputLabel: "Nuevo monto pendiente (USD)",
      inputValue: (currentCents / 100).toFixed(2),
      inputAttributes: { min: "0", step: "0.01" },
      showCancelButton: true,
      confirmButtonText: "Guardar monto",
      cancelButtonText: "Cancelar",
      background: "#101c2c",
      color: "#fff",
      preConfirm: (value) => {
        const rawValue = String(value ?? "").trim();
        const nextCents = centsFromInput(rawValue);
        if (!rawValue || !Number.isFinite(nextCents) || nextCents < 0) {
          Swal.showValidationMessage("Escribe un monto válido igual o mayor a 0.");
          return undefined;
        }
        return nextCents;
      },
    });
    if (!result.isConfirmed || typeof result.value !== "number") return;
    const deltaCents = result.value - currentCents;
    if (!deltaCents) return;
    const latestMovement = movements.find((movement) => movement.personId === person.id);
    const adjustmentAccountId = latestMovement?.accountId ?? accounts[0]?.id;
    if (!adjustmentAccountId) {
      await Swal.fire({
        icon: "warning",
        title: "No hay una cuenta disponible",
        text: "Registra una cuenta antes de ajustar el saldo de esta persona.",
        background: "#101c2c",
        color: "#fff",
      });
      return;
    }
    await addMovement({
      type: "third_party_reclassify",
      amountCents: Math.abs(deltaCents),
      accountId: adjustmentAccountId,
      personId: person.id,
      description: `Ajuste manual de saldo de ${person.name}`,
      date: new Date(),
      accountEffectCents: 0,
      personalEffectCents: 0,
      thirdPartyEffectCents: deltaCents,
    });
    await Swal.fire({
      icon: "success",
      title: "Saldo actualizado",
      timer: 1400,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  const savePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await addPerson({ name });
    setName("");
    setPersonForm(false);
  };
  const saveOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = centsFromInput(amount);
    const pending = personId ? pendingFor(personId) : 0;
    if (
      !personId ||
      !accountId ||
      !cents ||
      !description ||
      (operation === "third_party_out" && cents > pending)
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Revisa la operación",
        text:
          operation === "third_party_out" && cents > pending
            ? "La devolución no puede superar el saldo pendiente de esa persona."
            : "Completa persona, cuenta, monto y descripción.",
        background: "#101c2c",
        color: "#fff",
      });
      return;
    }
    const isIncoming =
      operation === "third_party_in" || operation === "third_party_reclassify";
    const sign = isIncoming ? 1 : -1;
    const accountEffectCents =
      operation === "third_party_reclassify" ? 0 : cents * sign;
    await addMovement({
      type: operation,
      amountCents: cents,
      accountId,
      personId,
      description,
      date: new Date(`${date}T12:00:00`),
      accountEffectCents,
      personalEffectCents: 0,
      thirdPartyEffectCents: cents * sign,
    });
    setAmount("");
    setDescription("");
    setOperationForm(false);
    await Swal.fire({
      icon: "success",
      title:
        operation === "third_party_out"
          ? "Devolución registrada"
          : operation === "third_party_reclassify"
            ? "Saldo clasificado"
            : "Entrada registrada",
      timer: 1400,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  return (
    <>
      <PageIntro
        eyebrow="Separación inteligente"
        title="Dinero de terceros"
        text="El dinero de otras personas pasa por tus cuentas, pero nunca debe inflar tu patrimonio."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-ghost"
              onClick={() => setPersonForm(!personForm)}
            >
              <Plus size={17} />
              Agregar persona
            </button>
            <button
              className="btn-primary"
              onClick={() => setOperationForm(!operationForm)}
            >
              <Plus size={17} />
              Registrar operación
            </button>
          </div>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <Stat
          label="Pendiente de entregar"
          value={money(summary.thirdPartyBalanceCents)}
          detail="Pasivo separado de tu patrimonio"
          icon={HeartHandshake}
          tone="amber"
        />
        <div className="panel flex items-center gap-4 p-5">
          <div className="rounded-xl bg-mint/10 p-3 text-mint">
            <ShieldCheck />
          </div>
          <div>
            <p className="font-semibold text-white">Regla de oro</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Recibido y entregado aquí siempre tiene efecto personal de $0.
            </p>
          </div>
        </div>
      </div>
      {personForm && (
        <form onSubmit={savePerson} className="panel mb-5 flex gap-3 p-5">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la persona"
            required
          />
          <button className="btn-primary">Guardar persona</button>
        </form>
      )}
      {operationForm && (
        <FormCard
          title="Registrar dinero de terceros"
          onSubmit={saveOperation}
          onCancel={() => setOperationForm(false)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Operación">
              <select
                className="input"
                value={operation}
                onChange={(e) =>
                  setOperation(e.target.value as typeof operation)
                }
              >
                <option value="third_party_in">
                  Dinero nuevo recibido de la persona
                </option>
                <option value="third_party_reclassify">
                  Clasificar saldo existente como suyo
                </option>
                <option value="third_party_out">
                  Dinero entregado a la persona
                </option>
              </select>
              {operation === "third_party_reclassify" && (
                <p className="mt-1 text-xs text-slate-500">
                  No aumenta el saldo bancario; solo separa una parte que ya
                  estaba registrada.
                </p>
              )}
            </Field>
            <Field label="Persona">
              <select
                className="input"
                required
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
              >
                <option value="">Selecciona una persona</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · pendiente {money(pendingFor(p.id))}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cuenta afectada">
              <select
                className="input"
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Selecciona una cuenta</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.bank}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Monto (USD)">
              <input
                className="input"
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="80.00"
              />
            </Field>
            <Field label="Fecha">
              <input
                className="input"
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Descripción">
              <input
                className="input"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Saldo de mamá en Pichincha"
              />
            </Field>
          </div>
        </FormCard>
      )}
      <div className="panel p-5">
        <h2 className="mb-4 font-semibold text-white">Personas relacionadas</h2>
        {people.length ? (
          people.map((p) => (
            <div
              className="flex flex-col gap-3 border-b border-white/[.06] py-4 sm:flex-row sm:items-center"
              key={p.id}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-violet/15 text-violet">
                <UserRound size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-200">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {movements.filter((m) => m.personId === p.id).length}{" "}
                  operaciones de dinero ajeno
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">Pendiente</p>
                <p
                  className={`font-semibold ${pendingFor(p.id) > 0 ? "text-amber-200" : "text-mint"}`}
                >
                  {money(pendingFor(p.id))}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost self-start sm:self-auto"
                onClick={() => void editPending(p)}
                aria-label={`Editar monto pendiente de ${p.name}`}
              >
                <Pencil size={16} />
                Editar monto
              </button>
            </div>
          ))
        ) : (
          <Empty
            icon={UsersRound}
            title="No hay personas registradas"
            text="Agrega a las personas cuyo dinero administras temporalmente."
          />
        )}
      </div>
    </>
  );
}

function Goals() {
  const { goals, accounts, addGoal, updateGoal, deleteGoal, addTransfer } = useFinance();
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<(typeof goals)[number] | null>(null);
  const [contributing, setContributing] = useState<(typeof goals)[number] | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [contribution, setContribution] = useState("");
  const [contributionMode, setContributionMode] = useState<"virtual" | "transfer">("virtual");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const resetForm = () => {
    setName("");
    setTarget("");
    setAccountId("");
    setDescription("");
    setEditing(null);
    setForm(false);
  };
  const startEdit = (goal: (typeof goals)[number]) => {
    setEditing(goal);
    setName(goal.name);
    setTarget((goal.targetCents / 100).toFixed(2));
    setAccountId(goal.accountId ?? "");
    setDescription(goal.description ?? "");
    setForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCents = centsFromInput(target);
    if (!name || targetCents <= 0) return;
    const value = {
      name,
      targetCents,
      savedCents: editing?.savedCents ?? 0,
      accountId: accountId || undefined,
      description: description || undefined,
    };
    if (editing) await updateGoal(editing.id, value);
    else await addGoal(value);
    resetForm();
  };
  const contribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributing) return;
    const amountCents = centsFromInput(contribution);
    if (amountCents <= 0) return;
    if (contributionMode === "transfer") {
      if (!contributing.accountId || !sourceAccountId || sourceAccountId === contributing.accountId) return;
      await addTransfer(sourceAccountId, contributing.accountId, amountCents, new Date(), `Aporte al objetivo: ${contributing.name}`);
    }
    await updateGoal(contributing.id, {
      name: contributing.name,
      targetCents: contributing.targetCents,
      savedCents: contributing.savedCents + amountCents,
      accountId: contributing.accountId,
      description: contributing.description,
    });
    setContributing(null);
    setContribution("");
  };
  const remove = async (goal: (typeof goals)[number]) => {
    const result = await Swal.fire({
      title: "¿Eliminar objetivo?",
      text: "Solo se elimina la meta virtual; no se borran movimientos ni transferencias.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef6b78",
      background: "#101c2c",
      color: "#fff",
    });
    if (result.isConfirmed) await deleteGoal(goal.id);
  };
  return (
    <>
      <PageIntro
        eyebrow="Dirección"
        title="Objetivos financieros"
        text="Metas personales de ahorro. Crear una meta no mueve dinero; los aportes pueden ser virtuales o una transferencia confirmada."
        action={<button className="btn-primary" onClick={() => (form ? resetForm() : setForm(true))}><Plus size={17} /> Nuevo objetivo</button>}
      />
      {form && (
        <FormCard title={editing ? "Editar objetivo" : "Crear objetivo"} onSubmit={submit} onCancel={resetForm}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre"><input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Fondo de emergencia" /></Field>
            <Field label="Monto objetivo (USD)"><input className="input" required type="number" min="1" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="500.00" /></Field>
            <Field label="Cuenta asociada (opcional)"><select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}><option value="">Solo seguimiento virtual</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
            <Field label="Descripción (opcional)"><input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Meta para imprevistos" /></Field>
          </div>
        </FormCard>
      )}
      {contributing && (
        <FormCard title={`Aportar a ${contributing.name}`} onSubmit={contribute} onCancel={() => setContributing(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monto del aporte (USD)"><input className="input" required type="number" min="0.01" step="0.01" value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="50.00" /></Field>
            <Field label="Tipo de aporte"><select className="input" value={contributionMode} onChange={(e) => setContributionMode(e.target.value as typeof contributionMode)}><option value="virtual">Asignación virtual, sin mover saldo</option><option value="transfer" disabled={!contributing.accountId}>Transferencia real a la cuenta asociada</option></select></Field>
            {contributionMode === "transfer" && <Field label="Cuenta de origen"><select className="input" required value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)}><option value="">Selecciona una cuenta</option>{accounts.filter((a) => a.id !== contributing.accountId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>}
          </div>
        </FormCard>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => (
          <div className="panel p-6" key={g.id}>
            <div className="mb-7 flex items-start justify-between"><div className="rounded-2xl bg-mint/10 p-3 text-mint"><Goal /></div><span className="text-xs text-slate-500">{g.accountId ? "Cuenta asociada" : "Asignación virtual"}</span></div>
            <h3 className="text-lg font-semibold text-white">{g.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{money(Math.max(0, g.targetCents - g.savedCents))} restantes para llegar a tu meta</p>
            <div className="mt-6"><GoalBar goal={g} /></div>
            {g.description && <p className="mt-3 text-xs text-slate-400">{g.description}</p>}
            <div className="mt-5 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => { setContributing(g); setContributionMode("virtual"); setSourceAccountId(""); }}><Plus size={15} /> Registrar aporte</button><button className="btn-ghost" onClick={() => startEdit(g)}><Pencil size={15} /> Editar</button><button className="btn-ghost text-rose-300" onClick={() => void remove(g)}><Trash2 size={15} /> Eliminar</button></div>
          </div>
        ))}
      </div>
      {!goals.length && <div className="panel"><Empty icon={Target} title="Todavía no tienes objetivos" text="Empieza por algo concreto: fondo de emergencia, tecnología o capital para un proyecto." /></div>}
    </>
  );
}

function RecurringIncomePage() {
  const {
    recurringIncome,
    addRecurringIncome,
    updateRecurringIncome,
    deleteRecurringIncome,
    addMovement,
    accounts,
  } = useFinance();
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<(typeof recurringIncome)[number] | null>(null);
  const [receiving, setReceiving] = useState<(typeof recurringIncome)[number] | null>(null);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [receivedDate, setReceivedDate] = useState(dateInputValue());
  const [receivedAccountId, setReceivedAccountId] = useState("");
  const resetForm = () => {
    setConcept("");
    setAmount("");
    setDay("1");
    setAccountId("");
    setDescription("");
    setEditing(null);
    setForm(false);
  };
  const startEdit = (item: (typeof recurringIncome)[number]) => {
    setEditing(item);
    setConcept(item.concept);
    setAmount((item.amountCents / 100).toFixed(2));
    setDay(String(item.dayOfMonth ?? 1));
    setAccountId(item.accountId ?? "");
    setDescription(item.description ?? "");
    setForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(amount);
    const value = {
      concept,
      amountCents,
      frequency: "monthly",
      dayOfMonth: Number(day),
      accountId: accountId || undefined,
      active: editing?.active ?? true,
      description: description || undefined,
    } as const;
    if (!concept || !amount || amountCents <= 0 || Number(day) < 1 || Number(day) > 31) return;
    if (editing) await updateRecurringIncome(editing.id, value);
    else await addRecurringIncome(value);
    resetForm();
    await Swal.fire({
      icon: "success",
      title: editing ? "Ingreso fijo actualizado" : "Ingreso fijo guardado",
      text: "Quedará como esperado y no alterará tu saldo hasta registrarlo como recibido.",
      timer: 1800,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  const remove = async (item: (typeof recurringIncome)[number]) => {
    const result = await Swal.fire({
      title: "¿Eliminar ingreso fijo?",
      text: "Solo se eliminará este recordatorio. Los movimientos reales permanecerán intactos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef6b78",
      background: "#101c2c",
      color: "#fff",
    });
    if (result.isConfirmed) await deleteRecurringIncome(item.id);
  };
  const receive = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(receivedAmount);
    if (!receiving || amountCents <= 0 || !receivedAccountId) return;
    await addMovement({
      type: "income",
      amountCents,
      accountId: receivedAccountId,
      category: "Otros",
      description: `Ingreso recibido: ${receiving.concept}`,
      date: new Date(`${receivedDate}T12:00:00`),
      accountEffectCents: amountCents,
      personalEffectCents: amountCents,
      thirdPartyEffectCents: 0,
    });
    setReceiving(null);
    await Swal.fire({ icon: "success", title: "Ingreso recibido registrado", timer: 1400, showConfirmButton: false, background: "#101c2c", color: "#fff" });
  };
  return (
    <>
      <PageIntro
        eyebrow="Plan mensual"
        title="Ingresos fijos"
        text="Registra ingresos esperados, como tus pasantías, sin convertirlos automáticamente en dinero disponible."
        action={
          <button className="btn-primary" onClick={() => { if (form) resetForm(); else setForm(true); }}>
            <Plus size={17} />
            Nuevo ingreso fijo
          </button>
        }
      />
      {form && (
        <FormCard
          title={editing ? "Editar ingreso fijo" : "Nuevo ingreso fijo"}
          onSubmit={submit}
          onCancel={resetForm}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Concepto">
              <input
                className="input"
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Pasantías remuneradas ITSQMET"
              />
            </Field>
            <Field label="Monto mensual (USD)">
              <input
                className="input"
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="300.00"
              />
            </Field>
            <Field label="Día esperado de recepción">
              <input
                className="input"
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </Field>
            <Field label="Cuenta de destino (opcional)">
              <select
                className="input"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Elegir al recibir</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Descripción (opcional)">
              <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sueldo, beca, etc." />
            </Field>
          </div>
        </FormCard>
      )}
      {receiving && (
        <FormCard title={`Registrar ingreso recibido: ${receiving.concept}`} onSubmit={receive} onCancel={() => setReceiving(null)}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Monto recibido (USD)"><input className="input" type="number" min="0.01" step="0.01" required value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} /></Field>
            <Field label="Cuenta"><select className="input" required value={receivedAccountId} onChange={(e) => setReceivedAccountId(e.target.value)}><option value="">Selecciona una cuenta</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
            <Field label="Fecha"><input className="input" type="date" required value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} /></Field>
          </div>
        </FormCard>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {recurringIncome.map((item) => (
          <div className="panel p-6" key={item.id}>
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-mint/10 p-3 text-mint">
                <ArrowDownLeft />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.active ? "bg-mint/10 text-mint" : "bg-white/10 text-slate-400"}`}>
                {item.active ? "Esperado" : "Pausado"}
              </span>
            </div>
            <h2 className="mt-6 font-semibold text-white">{item.concept}</h2>
            <p className="mt-1 text-2xl font-bold text-mint">
              {money(item.amountCents)}
              <span className="ml-1 text-sm font-normal text-slate-500">
                / mes
              </span>
            </p>
            {item.description && <p className="mt-2 text-xs text-slate-400">{item.description}</p>}
            <p className="mt-4 text-xs text-slate-500">
              Día esperado: {item.dayOfMonth} ·{" "}
              {item.accountId ? "Cuenta asignada" : "Cuenta por elegir"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => { setReceiving(item); setReceivedAmount((item.amountCents / 100).toFixed(2)); setReceivedDate(dateInputValue()); setReceivedAccountId(item.accountId ?? accounts[0]?.id ?? ""); }}><ArrowDownLeft size={15} /> Registrar recibido</button>
              <button className="btn-ghost" onClick={() => startEdit(item)}><Pencil size={15} /> Editar</button>
              <button className="btn-ghost text-rose-300" onClick={() => void remove(item)}><Trash2 size={15} /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      {!recurringIncome.length && (
        <div className="panel">
          <Empty
            icon={ArrowDownLeft}
            title="Aún no registras ingresos fijos"
            text="Agrega tus pasantías u otros ingresos esperados para calcular tu capacidad mensual."
          />
        </div>
      )}
    </>
  );
}

function RecurringExpensesPage() {
  const {
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    accounts,
    categories,
  } = useFinance();
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<(typeof recurringExpenses)[number] | null>(null);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Internet");
  const [frequency, setFrequency] = useState<"monthly" | "annual">("monthly");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const resetForm = () => {
    setConcept("");
    setAmount("");
    setCategory("Internet");
    setFrequency("monthly");
    setDay("1");
    setMonth("1");
    setAccountId("");
    setDescription("");
    setEditing(null);
    setForm(false);
  };
  const startEdit = (item: (typeof recurringExpenses)[number]) => {
    setEditing(item);
    setConcept(item.concept);
    setAmount((item.amountCents / 100).toFixed(2));
    setCategory(item.category);
    setFrequency(item.frequency ?? "monthly");
    setDay(String(item.dayOfMonth ?? 1));
    setMonth(String(item.monthOfYear ?? 1));
    setAccountId(item.accountId ?? "");
    setDescription(item.description ?? "");
    setForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(amount);
    const value = {
      concept,
      amountCents,
      category,
      frequency,
      dayOfMonth: Number(day),
      ...(frequency === "annual" ? { monthOfYear: Number(month) } : {}),
      accountId: accountId || undefined,
      active: editing?.active ?? true,
      description: description || undefined,
    } as const;
    if (
      !concept ||
      !amount ||
      amountCents <= 0 ||
      Number(day) < 1 ||
      Number(day) > 31 ||
      (frequency === "annual" && (Number(month) < 1 || Number(month) > 12))
    ) return;
    if (editing) await updateRecurringExpense(editing.id, value);
    else await addRecurringExpense(value);
    resetForm();
    await Swal.fire({
      icon: "success",
      title: editing ? "Gasto fijo actualizado" : "Gasto fijo guardado",
      timer: 1400,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  const remove = async (item: (typeof recurringExpenses)[number]) => {
    const result = await Swal.fire({
      title: "¿Eliminar gasto fijo?",
      text: "Solo se eliminará este recordatorio.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef6b78",
      background: "#101c2c",
      color: "#fff",
    });
    if (result.isConfirmed) await deleteRecurringExpense(item.id);
  };
  return (
    <>
      <PageIntro
        eyebrow="Compromisos"
        title="Gastos fijos"
        text="Registra obligaciones mensuales o anuales para reservarlas en tus decisiones, sin crear un pago que todavía no ocurrió."
        action={
          <button className="btn-primary" onClick={() => { if (form) resetForm(); else setForm(true); }}>
            <Plus size={17} />
            Nuevo gasto fijo
          </button>
        }
      />
      {form && (
        <FormCard
          title={editing ? "Editar gasto fijo" : "Nuevo gasto fijo"}
          onSubmit={submit}
          onCancel={resetForm}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Concepto">
              <input
                className="input"
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Internet"
              />
            </Field>
            <Field label={`Monto ${frequency === "annual" ? "anual" : "mensual"} (USD)`}>
              <input
                className="input"
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="26.50"
              />
            </Field>
            <Field label="Periodicidad">
              <select className="input" value={frequency} onChange={(e) => setFrequency(e.target.value as "monthly" | "annual")}>
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
              </select>
            </Field>
            <Field label="Categoría">
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories
                  .filter((c) => c.kind !== "income")
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Día habitual de pago">
              <input
                className="input"
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </Field>
            {frequency === "annual" && (
              <Field label="Mes habitual de pago">
                <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
                  {[
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
                  ].map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
                </select>
              </Field>
            )}
            <Field label="Cuenta de origen (opcional)">
              <select
                className="input"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Elegir al pagar</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Descripción (opcional)">
              <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalle del compromiso" />
            </Field>
          </div>
        </FormCard>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {recurringExpenses.map((item) => (
          <div className="panel p-6" key={item.id}>
            <div className="flex items-start justify-between">
              <div className="rounded-2xl bg-amber-300/10 p-3 text-amber-200">
                <ArrowUpRight />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.active ? "bg-amber-300/10 text-amber-200" : "bg-white/10 text-slate-400"}`}>
                {item.active ? "Compromiso" : "Pausado"}
              </span>
            </div>
            <h2 className="mt-6 font-semibold text-white">{item.concept}</h2>
            <p className="mt-1 text-2xl font-bold text-white">
              {money(item.amountCents)}
              <span className="ml-1 text-sm font-normal text-slate-500">
                / {item.frequency === "annual" ? "año" : "mes"}
              </span>
            </p>
            {item.description && <p className="mt-2 text-xs text-slate-400">{item.description}</p>}
            <p className="mt-4 text-xs text-slate-500">
              {item.category} · {item.frequency === "annual" ? `Pago anual: ${item.dayOfMonth}/${item.monthOfYear}` : `Día habitual: ${item.dayOfMonth}`}
            </p>
            <div className="mt-5 flex gap-2">
              <button className="btn-ghost" onClick={() => startEdit(item)}><Pencil size={15} /> Editar</button>
              <button className="btn-ghost text-rose-300" onClick={() => void remove(item)}><Trash2 size={15} /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      {!recurringExpenses.length && (
        <div className="panel">
          <Empty
            icon={ArrowUpRight}
            title="Aún no registras gastos fijos"
            text="Agrega internet, transporte, firmas electrónicas u otros compromisos mensuales o anuales."
          />
        </div>
      )}
    </>
  );
}

function Projects() {
  const { projects, accounts, people, movements, projectContributions, addProject, updateProject, deleteProject, addMovement, addProjectContribution } = useFinance();
  const [form, setForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [entryProject, setEntryProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<Project["status"]>("planned");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [entryType, setEntryType] = useState<"expense" | "income">("expense");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryAccountId, setEntryAccountId] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [contributionProject, setContributionProject] = useState<Project | null>(null);
  const [contributionPersonId, setContributionPersonId] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionReceived, setContributionReceived] = useState(false);
  const [contributionAccountId, setContributionAccountId] = useState("");
  const resetForm = () => { setName(""); setBudget(""); setStatus("planned"); setStartDate(""); setEndDate(""); setDescription(""); setParticipantIds([]); setEditing(null); setForm(false); };
  const startEdit = (project: Project) => {
    setEditing(project);
    setName(project.name);
    setBudget((project.budgetCents / 100).toFixed(2));
    setStatus(project.status);
    setStartDate(project.startDate?.toDate().toISOString().slice(0, 10) ?? "");
    setEndDate(project.endDate?.toDate().toISOString().slice(0, 10) ?? "");
    setDescription(project.description ?? "");
    setParticipantIds(project.participantIds ?? []);
    setForm(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetCents = centsFromInput(budget || "0");
    if (!name || budgetCents < 0) return;
    const value = {
      name,
      budgetCents,
      status,
      participantIds,
      startDate: startDate ? Timestamp.fromDate(new Date(`${startDate}T12:00:00`)) : undefined,
      endDate: endDate ? Timestamp.fromDate(new Date(`${endDate}T12:00:00`)) : undefined,
      description: description || undefined,
    };
    if (editing) await updateProject(editing.id, value);
    else await addProject(value);
    resetForm();
  };
  const saveContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(contributionAmount);
    if (!contributionProject || amountCents <= 0) return;
    if (contributionReceived && (!contributionPersonId || !contributionAccountId)) return;
    let movementId: string | undefined;
    if (contributionReceived) {
      await addMovement({
        type: "third_party_in",
        amountCents,
        accountId: contributionAccountId,
        projectId: contributionProject.id,
        personId: contributionPersonId,
        category: "Otros",
        description: `Aporte al proyecto: ${contributionProject.name}`,
        date: new Date(),
        accountEffectCents: amountCents,
        personalEffectCents: 0,
        thirdPartyEffectCents: amountCents,
      });
    }
    await addProjectContribution({
      projectId: contributionProject.id,
      amountCents,
      personId: contributionPersonId || undefined,
      accountId: contributionReceived ? contributionAccountId : undefined,
      movementId,
      date: new Date(),
      note: contributionReceived ? "Recibido en una cuenta propia" : "Aporte registrado sin movimiento bancario",
    });
    setContributionProject(null);
    setContributionAmount("");
    setContributionPersonId("");
    setContributionReceived(false);
  };
  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(entryAmount);
    if (!entryProject || amountCents <= 0 || !entryAccountId || !entryDescription) return;
    const sign = entryType === "expense" ? -1 : 1;
    await addMovement({
      type: entryType,
      amountCents,
      accountId: entryAccountId,
      projectId: entryProject.id,
      category: entryType === "expense" ? "Otros" : "Otros",
      description: entryDescription,
      date: new Date(),
      accountEffectCents: amountCents * sign,
      personalEffectCents: amountCents * sign,
      thirdPartyEffectCents: 0,
    });
    setEntryProject(null);
    setEntryAmount("");
    setEntryDescription("");
  };
  const remove = async (project: Project) => {
    const result = await Swal.fire({ title: "¿Eliminar proyecto?", text: "Los movimientos vinculados se conservarán, pero dejarán de mostrar el proyecto.", icon: "warning", showCancelButton: true, confirmButtonText: "Eliminar", cancelButtonText: "Cancelar", confirmButtonColor: "#ef6b78", background: "#101c2c", color: "#fff" });
    if (result.isConfirmed) await deleteProject(project.id);
  };
  const statusLabel = { planned: "Planeado", active: "Activo", paused: "Pausado", completed: "Terminado" };
  return (
    <>
      <PageIntro eyebrow="Capital con intención" title="Proyectos" text="Controla iniciativas con presupuesto, gastos e ingresos propios sin mezclarlas con el análisis general." action={<button className="btn-primary" onClick={() => (form ? resetForm() : setForm(true))}><Plus size={17} /> Nuevo proyecto</button>} />
      {form && <FormCard title={editing ? "Editar proyecto" : "Nuevo proyecto"} onSubmit={submit} onCancel={resetForm}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre"><input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaña Meta Ads" /></Field>
          <Field label="Presupuesto (USD)"><input className="input" required type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="300.00" /></Field>
          <Field label="Estado"><select className="input" value={status} onChange={(e) => setStatus(e.target.value as Project["status"])}><option value="planned">Planeado</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="completed">Terminado</option></select></Field>
          <Field label="Descripción (opcional)"><input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objetivo y contexto del proyecto" /></Field>
          <Field label="Fecha de inicio (opcional)"><input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
          <Field label="Fecha de finalización (opcional)"><input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
          <Field label="Participantes"><div className="space-y-2 rounded-xl border border-white/[.08] p-3">{people.length ? people.map((person) => <label className="flex items-center gap-2 text-sm text-slate-300" key={person.id}><input type="checkbox" checked={participantIds.includes(person.id)} onChange={(e) => setParticipantIds((current) => e.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id))} />{person.name}</label>) : <p className="text-xs text-slate-500">Registra personas en la sección Dinero de terceros para agregarlas aquí.</p>}</div></Field>
        </div>
      </FormCard>}
      {entryProject && <FormCard title={`Registrar movimiento: ${entryProject.name}`} onSubmit={saveEntry} onCancel={() => setEntryProject(null)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo"><select className="input" value={entryType} onChange={(e) => setEntryType(e.target.value as typeof entryType)}><option value="expense">Gasto del proyecto</option><option value="income">Ingreso del proyecto</option></select></Field>
          <Field label="Monto (USD)"><input className="input" required type="number" min="0.01" step="0.01" value={entryAmount} onChange={(e) => setEntryAmount(e.target.value)} /></Field>
          <Field label="Cuenta afectada"><select className="input" required value={entryAccountId} onChange={(e) => setEntryAccountId(e.target.value)}><option value="">Selecciona una cuenta</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
          <Field label="Descripción"><input className="input" required value={entryDescription} onChange={(e) => setEntryDescription(e.target.value)} placeholder="Pago de publicidad" /></Field>
        </div>
      </FormCard>}
      {contributionProject && <FormCard title={`Registrar aporte: ${contributionProject.name}`} onSubmit={saveContribution} onCancel={() => setContributionProject(null)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quién aporta"><select className="input" value={contributionPersonId} onChange={(e) => setContributionPersonId(e.target.value)}><option value="">Yo</option>{people.filter((person) => (contributionProject.participantIds ?? []).includes(person.id)).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></Field>
          <Field label="Monto (USD)"><input className="input" required type="number" min="0.01" step="0.01" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} placeholder="10.00" /></Field>
          <Field label="¿Entró a una cuenta tuya?"><select className="input" value={contributionReceived ? "yes" : "no"} onChange={(e) => setContributionReceived(e.target.value === "yes")}><option value="no">No, solo registrar aporte</option><option value="yes" disabled={!contributionPersonId}>Sí, registrar también como dinero de terceros</option></select></Field>
          {contributionReceived && <Field label="Cuenta que recibió el dinero"><select className="input" required value={contributionAccountId} onChange={(e) => setContributionAccountId(e.target.value)}><option value="">Selecciona una cuenta</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>}
        </div>
      </FormCard>}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const linked = movements.filter((movement) => movement.projectId === project.id);
          const expenses = Math.abs(linked.filter((movement) => movement.personalEffectCents < 0).reduce((sum, movement) => sum + movement.personalEffectCents, 0));
          const income = linked.filter((movement) => movement.personalEffectCents > 0).reduce((sum, movement) => sum + movement.personalEffectCents, 0);
          const result = income - expenses;
          const contributions = projectContributions.filter((contribution) => contribution.projectId === project.id);
          const ownContribution = contributions.filter((contribution) => !contribution.personId).reduce((sum, contribution) => sum + contribution.amountCents, 0);
          const participantNames = (project.participantIds ?? []).map((id) => people.find((person) => person.id === id)?.name).filter(Boolean).join(", ");
          return <div className="panel p-6" key={project.id}>
            <div className="flex items-start justify-between"><div className="rounded-2xl bg-violet/10 p-3 text-violet"><BriefcaseBusiness /></div><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">{statusLabel[project.status]}</span></div>
            <h2 className="mt-6 text-lg font-semibold text-white">{project.name}</h2>
            {project.description && <p className="mt-1 text-xs text-slate-400">{project.description}</p>}
            <p className="mt-2 text-xs text-slate-500">Participantes: {participantNames || "Solo tú"}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs"><div><p className="text-slate-500">Presupuesto</p><p className="mt-1 font-semibold text-white">{money(project.budgetCents)}</p></div><div><p className="text-slate-500">Gastado</p><p className="mt-1 font-semibold text-amber-200">{money(expenses)}</p></div><div><p className="text-slate-500">Resultado</p><p className={`mt-1 font-semibold ${result >= 0 ? "text-mint" : "text-rose-300"}`}>{money(result)}</p></div></div>
            <p className="mt-3 text-xs text-slate-400">Aportes registrados: {money(contributions.reduce((sum, contribution) => sum + contribution.amountCents, 0))} · Tu aporte: {money(ownContribution)}</p>
            <div className="mt-5 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => { setEntryProject(project); setEntryAccountId(accounts[0]?.id ?? ""); }}><Plus size={15} /> Registrar movimiento</button><button className="btn-ghost" onClick={() => { setContributionProject(project); setContributionAccountId(accounts[0]?.id ?? ""); }}><Plus size={15} /> Registrar aporte</button><button className="btn-ghost" onClick={() => startEdit(project)}><Pencil size={15} /> Editar</button><button className="btn-ghost text-rose-300" onClick={() => void remove(project)}><Trash2 size={15} /> Eliminar</button></div>
          </div>;
        })}
      </div>
      {!projects.length && <div className="panel"><Empty icon={BriefcaseBusiness} title="Todavía no tienes proyectos" text="Crea una iniciativa para controlar su presupuesto, gastos e ingresos por separado." /></div>}
    </>
  );
}
const csvValue = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;
const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvValue).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
const downloadText = (filename: string, text: string) => {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

function TransferPage() {
  const { accounts, addTransferWithFee } = useFinance();
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dateInputValue());
  const source = accounts.find((a) => a.id === sourceId);
  const destination = accounts.find((a) => a.id === destinationId);
  const crossBank = Boolean(
    source && destination && source.bank !== destination.bank,
  );
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = centsFromInput(amount);
    const feeCents = crossBank ? centsFromInput(fee || "0") : 0;
    if (
      !sourceId ||
      !destinationId ||
      sourceId === destinationId ||
      !amountCents ||
      !description
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Completa la transferencia",
        text: "Selecciona cuentas distintas, monto y descripción.",
        background: "#101c2c",
        color: "#fff",
      });
      return;
    }
    await addTransferWithFee(
      sourceId,
      destinationId,
      amountCents,
      feeCents,
      new Date(`${date}T12:00:00`),
      description,
    );
    setAmount("");
    setFee("");
    setDescription("");
    await Swal.fire({
      icon: "success",
      title: "Transferencia registrada",
      text:
        crossBank && feeCents
          ? `Se descontaron ${money(feeCents)} de comisión de la cuenta de origen.`
          : "El movimiento no se contabilizó como ingreso ni como gasto.",
      timer: 1800,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  return (
    <>
      <PageIntro
        eyebrow="Movimiento interno"
        title="Transferencias"
        text="Mueve tu propio dinero entre cuentas sin inflar ingresos ni gastos. Las transferencias entre bancos pueden incluir una comisión."
      />
      <FormCard
        title="Nueva transferencia"
        onSubmit={submit}
        onCancel={() => {
          setSourceId("");
          setDestinationId("");
          setAmount("");
          setFee("");
          setDescription("");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cuenta de origen">
            <select
              className="input"
              required
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.bank}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cuenta de destino">
            <select
              className="input"
              required
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {accounts
                .filter((a) => a.id !== sourceId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.bank}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Monto que llegará (USD)">
            <input
              className="input"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="20.00"
            />
          </Field>
          {crossBank ? (
            <Field label="Comisión bancaria (USD)">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-amber-200">
                Se descontará de la cuenta de origen y se contará como gasto
                bancario.
              </p>
            </Field>
          ) : (
            <div className="rounded-xl border border-mint/15 bg-mint/5 p-3 text-xs leading-5 text-mint">
              Mismo banco: no se aplicará comisión y no afectará tus ingresos ni
              gastos.
            </div>
          )}
          <Field label="Fecha">
            <input
              className="input"
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Descripción">
            <input
              className="input"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pasar dinero al ahorro"
            />
          </Field>
        </div>
      </FormCard>
      <div className="mt-5 panel p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet/10 p-3 text-violet">
            <ArrowLeftRight />
          </div>
          <div>
            <h2 className="font-semibold text-white">Cómo se registra</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Entre cuentas del mismo banco se crean dos movimientos vinculados:
              salida y entrada. Entre bancos se registra además la comisión como
              gasto personal, sin convertir el monto transferido en ingreso.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Reports() {
  const {
    summary,
    accounts,
    movements,
    people,
    recurringIncome,
    recurringExpenses,
    goals,
    projects,
    projectContributions,
  } = useFinance();
  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? "Cuenta no encontrada";
  const dateOf = (date: Movement["date"]) =>
    date?.toDate?.().toLocaleDateString("es-EC") ?? "";
  const exportMovements = () => {
    downloadCsv(
      `movimientos-financieros-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Fecha",
        "Tipo",
        "Descripción",
        "Categoría",
        "Cuenta",
        "Monto USD",
        "Efecto cuenta USD",
        "Efecto personal USD",
        "Efecto terceros USD",
      ],
      movements.map((m) => [
        dateOf(m.date),
        m.type,
        m.description,
        m.category ?? "",
        accountName(m.accountId),
        (m.amountCents / 100).toFixed(2),
        (m.accountEffectCents / 100).toFixed(2),
        (m.personalEffectCents / 100).toFixed(2),
        (m.thirdPartyEffectCents / 100).toFixed(2),
      ]),
    );
    void Swal.fire({
      icon: "success",
      title: "CSV exportado",
      text: "El historial de movimientos fue descargado.",
      timer: 1500,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  const exportFullReport = () => {
    const rows: string[][] = [];
    const add = (section: string, field: string, value: unknown, detail = "") =>
      rows.push([section, field, String(value ?? ""), detail]);
    add(
      "RESUMEN",
      "Patrimonio personal USD",
      (summary.personalBalanceCents / 100).toFixed(2),
      "Saldo bancario menos dinero pendiente de terceros",
    );
    add(
      "RESUMEN",
      "Saldo bancario USD",
      (summary.bankBalanceCents / 100).toFixed(2),
      "Todas las cuentas",
    );
    add(
      "RESUMEN",
      "Dinero de terceros pendiente USD",
      (summary.thirdPartyBalanceCents / 100).toFixed(2),
      "No pertenece al patrimonio personal",
    );
    add(
      "RESUMEN",
      "Ingresos recibidos del mes USD",
      (summary.monthIncomeCents / 100).toFixed(2),
      "Movimientos reales",
    );
    add(
      "RESUMEN",
      "Gastos pagados del mes USD",
      (summary.monthExpenseCents / 100).toFixed(2),
      "Movimientos reales",
    );
    add(
      "RESUMEN",
      "Ingresos fijos esperados USD",
      (summary.expectedIncomeCents / 100).toFixed(2),
      "Plan mensual, aún no recibido",
    );
    add(
      "RESUMEN",
      "Gastos fijos comprometidos USD",
      (summary.fixedExpenseCents / 100).toFixed(2),
      "Reserva mensual equivalente; incluye gastos anuales prorrateados",
    );
    add(
      "RESUMEN",
      "Intereses registrados USD",
      (summary.interestCents / 100).toFixed(2),
      "Rendimientos reales registrados",
    );
    accounts.forEach((a) => {
      const balance =
        a.openingBalanceCents +
        movements
          .filter((m) => m.accountId === a.id)
          .reduce((sum, m) => sum + m.accountEffectCents, 0);
      add(
        "CUENTAS",
        a.name,
        (balance / 100).toFixed(2),
        `${a.bank} · ${a.product} · Tasa anual referencial ${(a.interestAnnualBps / 100).toFixed(2)}%`,
      );
    });
    people.forEach((p) =>
      add(
        "TERCEROS",
        p.name,
        (
          movements
            .filter((m) => m.personId === p.id)
            .reduce((sum, m) => sum + m.thirdPartyEffectCents, 0) / 100
        ).toFixed(2),
        "Pendiente de entregar",
      ),
    );
    recurringIncome.forEach((item) =>
      add(
        "INGRESOS FIJOS",
        item.concept,
        (item.amountCents / 100).toFixed(2),
        `Mensual · día ${item.dayOfMonth ?? ""} · ${item.active ? "Activo" : "Inactivo"}`,
      ),
    );
    recurringExpenses.forEach((item) =>
      add(
        "GASTOS FIJOS",
        item.concept,
        (item.amountCents / 100).toFixed(2),
        `${item.category} · ${item.frequency === "annual" ? `anual · día ${item.dayOfMonth ?? ""}/${item.monthOfYear ?? ""}` : `mensual · día ${item.dayOfMonth ?? ""}`} · ${item.active ? "Activo" : "Inactivo"}`,
      ),
    );
    goals.forEach((goal) =>
      add(
        "OBJETIVOS",
        goal.name,
        `${(goal.savedCents / 100).toFixed(2)} de ${(goal.targetCents / 100).toFixed(2)}`,
        goal.description ?? "Asignación virtual",
      ),
    );
    projects.forEach((project) => {
      const linked = movements.filter((movement) => movement.projectId === project.id);
      const contributions = projectContributions.filter((contribution) => contribution.projectId === project.id);
      const expenses = Math.abs(linked.filter((movement) => movement.personalEffectCents < 0).reduce((sum, movement) => sum + movement.personalEffectCents, 0));
      const income = linked.filter((movement) => movement.personalEffectCents > 0).reduce((sum, movement) => sum + movement.personalEffectCents, 0);
      add("PROYECTOS", project.name, `Presupuesto ${(project.budgetCents / 100).toFixed(2)} · Aportes ${(contributions.reduce((sum, contribution) => sum + contribution.amountCents, 0) / 100).toFixed(2)} · Gastos ${(expenses / 100).toFixed(2)} · Resultado ${((income - expenses) / 100).toFixed(2)}`, `${project.status} · ${project.description ?? "Sin descripción"}`);
    });
    movements.forEach((m) =>
      add(
        "MOVIMIENTOS",
        m.description,
        (m.amountCents / 100).toFixed(2),
        `${dateOf(m.date)} · ${m.type} · ${accountName(m.accountId)}`,
      ),
    );
    downloadCsv(
      `informe-financiero-integral-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Sección", "Concepto", "Valor", "Detalle"],
      rows,
    );
    void Swal.fire({
      icon: "success",
      title: "Informe integral exportado",
      text: "Este archivo contiene contexto financiero para analizarlo o compartirlo con una IA.",
      timer: 1800,
      showConfirmButton: false,
      background: "#101c2c",
      color: "#fff",
    });
  };
  const buildAiPrompt = () => {
    const generatedAt = new Date().toLocaleDateString("es-EC");
    const accountLines = accounts.map((a) => {
      const balance =
        a.openingBalanceCents +
        movements
          .filter((m) => m.accountId === a.id)
          .reduce((sum, m) => sum + m.accountEffectCents, 0);
      const restriction =
        a.withdrawalMode === "restricted"
          ? `Retiro restringido${a.withdrawalUntil ? ` hasta ${a.withdrawalUntil.toDate().toLocaleDateString("es-EC")}` : ""}`
          : "Retiro libre";
      return `- ${a.name}: ${money(balance)} | Banco: ${a.bank} | Producto: ${accountProductLabel(a.product)} | Tasa referencial: ${(a.interestAnnualBps / 100).toFixed(2)}% anual | ${restriction}${a.description ? ` | Notas: ${a.description}` : ""}`;
    });
    const movementLines = movements.map(
      (m) =>
        `- ${dateOf(m.date)} | ${m.type} | ${m.description} | ${money(m.amountCents)} | Cuenta: ${accountName(m.accountId)} | Efecto cuenta: ${money(m.accountEffectCents)} | Efecto personal: ${money(m.personalEffectCents)}${m.category ? ` | Categoría: ${m.category}` : ""}`,
    );
    const incomeLines = recurringIncome.map(
      (item) =>
        `- ${item.concept}: ${money(item.amountCents)}/mes | día ${item.dayOfMonth ?? "no definido"} | ${item.active ? "activo" : "inactivo"}${item.description ? ` | ${item.description}` : ""}`,
    );
    const expenseLines = recurringExpenses.map(
      (item) =>
        `- ${item.concept}: ${money(item.amountCents)}/${item.frequency === "annual" ? "año" : "mes"} | ${item.category} | ${item.frequency === "annual" ? `pago ${item.dayOfMonth ?? "no definido"}/${item.monthOfYear ?? "no definido"}` : `día ${item.dayOfMonth ?? "no definido"}`} | ${item.active ? "activo" : "inactivo"}${item.description ? ` | ${item.description}` : ""}`,
    );
    const goalLines = goals.map(
      (goal) =>
        `- ${goal.name}: ${money(goal.savedCents)} ahorrados de ${money(goal.targetCents)}${goal.deadline ? ` | límite: ${goal.deadline.toDate().toLocaleDateString("es-EC")}` : ""}`,
    );
    const projectLines = projects.map((project) => {
      const linked = movements.filter((movement) => movement.projectId === project.id);
      const contributions = projectContributions.filter((contribution) => contribution.projectId === project.id);
      const expenses = Math.abs(linked.filter((movement) => movement.personalEffectCents < 0).reduce((sum, movement) => sum + movement.personalEffectCents, 0));
      const income = linked.filter((movement) => movement.personalEffectCents > 0).reduce((sum, movement) => sum + movement.personalEffectCents, 0);
      const contributionLines = contributions.map((contribution) => {
        const person = contribution.personId ? people.find((item) => item.id === contribution.personId)?.name ?? "Persona" : "Yo";
        return `${person}: ${money(contribution.amountCents)}`;
      });
      return `- ${project.name}: presupuesto ${money(project.budgetCents)} | aportes ${money(contributions.reduce((sum, contribution) => sum + contribution.amountCents, 0))} (${contributionLines.join(", ") || "ninguno"}) | gastos ${money(expenses)} | ingresos ${money(income)} | resultado ${money(income - expenses)} | estado ${project.status}${project.description ? ` | ${project.description}` : ""}`;
    });
    const thirdPartyLines = people.map((person) => {
      const pending = movements
        .filter((m) => m.personId === person.id)
        .reduce((sum, m) => sum + m.thirdPartyEffectCents, 0);
      return `- ${person.name}: ${money(pending)} pendiente`;
    });
    return `Actúa como un analista financiero personal prudente y claro. No vendas productos financieros ni inventes información.

Analiza mis finanzas personales con los datos siguientes y entrega recomendaciones prácticas.

REGLAS DE INTERPRETACIÓN
- No cuentes transferencias entre mis cuentas como ingresos ni gastos.
- No cuentes dinero de terceros como patrimonio personal.
- Diferencia ingresos reales de ingresos fijos esperados.
- Diferencia intereses acreditados de tasas referenciales: una tasa no significa que ese rendimiento ya haya sido recibido.
- Considera las restricciones de retiro de cada cuenta antes de evaluar mi liquidez.
- Si faltan datos, dilo claramente y no los inventes.
- No necesito asesoría legal, tributaria ni una garantía de rendimiento; señala cuándo debería consultar a un profesional.

FECHA DEL INFORME
${generatedAt}
Moneda: USD

RESUMEN ACTUAL
- Patrimonio personal: ${money(summary.personalBalanceCents)}
- Saldo bancario total: ${money(summary.bankBalanceCents)}
- Dinero de terceros pendiente: ${money(summary.thirdPartyBalanceCents)}
- Ingresos reales del mes: ${money(summary.monthIncomeCents)}
- Gastos reales del mes: ${money(summary.monthExpenseCents)}
- Ahorro real del mes: ${money(summary.monthSavingsCents)}
- Intereses acreditados registrados: ${money(summary.interestCents)}
- Ingresos fijos esperados al mes: ${money(summary.expectedIncomeCents)}
- Gastos fijos comprometidos al mes (incluye anuales prorrateados): ${money(summary.fixedExpenseCents)}

CUENTAS Y LIQUIDEZ
${accountLines.join("\n") || "No hay cuentas registradas."}

MOVIMIENTOS REALES
${movementLines.join("\n") || "No hay movimientos registrados."}

INGRESOS FIJOS ESPERADOS
${incomeLines.join("\n") || "No hay ingresos fijos registrados."}

GASTOS FIJOS COMPROMETIDOS
${expenseLines.join("\n") || "No hay gastos fijos registrados."}

OBJETIVOS
${goalLines.join("\n") || "No hay objetivos registrados."}

PROYECTOS
${projectLines.join("\n") || "No hay proyectos registrados."}

DINERO DE TERCEROS
${thirdPartyLines.join("\n") || "No hay saldos de terceros registrados."}

RESPONDE CON ESTAS SECCIONES
1. Resumen ejecutivo de mi situación.
2. Qué estoy haciendo bien.
3. Qué estoy haciendo mal o qué debería mejorar.
4. Análisis de liquidez, considerando el dinero restringido.
5. Gastos y hábitos que debería revisar.
6. Capacidad realista de ahorro mensual.
7. Riesgos de concentración, dependencia o falta de liquidez.
8. Recomendaciones priorizadas para los próximos 7 días, 30 días y 3 meses.
9. Escenario conservador, escenario actual y escenario optimista.
10. Datos faltantes y preguntas que debería responder.

Sé específico con los montos disponibles, pero explica también los supuestos y las limitaciones del análisis.`;
  };
  const copyAiPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildAiPrompt());
      await Swal.fire({ icon: "success", title: "Prompt copiado", text: "Ya puedes pegarlo en ChatGPT, Claude u otra IA.", timer: 1600, showConfirmButton: false, background: "#101c2c", color: "#fff" });
    } catch {
      await Swal.fire({ icon: "warning", title: "No se pudo copiar automáticamente", text: "Descarga el archivo de texto para usar el prompt.", background: "#101c2c", color: "#fff" });
    }
  };
  const downloadAiPrompt = () => {
    downloadText(
      `prompt-financiero-${new Date().toISOString().slice(0, 10)}.txt`,
      buildAiPrompt(),
    );
    void Swal.fire({ icon: "success", title: "Prompt descargado", timer: 1400, showConfirmButton: false, background: "#101c2c", color: "#fff" });
  };
  return (
    <>
      <PageIntro
        eyebrow="Perspectiva"
        title="Reportes"
        text="Observa tendencias y exporta tu información para tomar decisiones con contexto."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={exportMovements}>
              <Receipt size={16} />
              Movimientos CSV
            </button>
            <button className="btn-primary" onClick={exportFullReport}>
              <Sparkles size={16} />
              Informe integral
            </button>
            <button className="btn-primary" onClick={() => void copyAiPrompt()}>
              Copiar prompt IA
            </button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Ingresos acumulados del mes"
          value={money(summary.monthIncomeCents)}
          detail={`Esperado: ${money(summary.expectedIncomeCents)}`}
          icon={ArrowDownLeft}
        />
        <Stat
          label="Gastos acumulados"
          value={money(summary.monthExpenseCents)}
          detail={`Fijos: ${money(summary.fixedExpenseCents)}`}
          icon={ArrowUpRight}
          tone="amber"
        />
        <Stat
          label="Rendimientos"
          value={money(summary.interestCents)}
          detail="Intereses registrados"
          icon={Sparkles}
          tone="violet"
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-violet/10 p-3 text-violet">
              <Sparkles />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                Prompt financiero para análisis
              </h2>
              <p className="text-xs text-slate-500">
                Contexto listo para pegar en cualquier IA externa.
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Genera un análisis con saldos, movimientos, cuentas, intereses,
            restricciones de retiro, objetivos y compromisos mensuales. No incluye
            credenciales ni configuración técnica.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => void copyAiPrompt()}>Copiar prompt</button>
            <button className="btn-ghost" onClick={downloadAiPrompt}>Descargar .txt</button>
          </div>
        </div>
        <div className="panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-mint/10 p-3 text-mint">
              <Receipt />
            </div>
            <div>
              <h2 className="font-semibold text-white">Libro de movimientos</h2>
              <p className="text-xs text-slate-500">
                {movements.length} operaciones reales.
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Exporta únicamente las operaciones registradas para revisarlas o
            archivarlas.
          </p>
          <button className="btn-ghost mt-5" onClick={exportMovements}>
            Descargar movimientos
          </button>
        </div>
      </div>
    </>
  );
}
function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<"general" | "income" | "expense">(
    "general",
  );
  return (
    <>
      <PageIntro
        eyebrow="Control"
        title="Configuración"
        text="Administra tus preferencias, ingresos fijos y gastos recurrentes desde un único lugar."
      />
      <div className="mb-6 flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-white/[.08] bg-white/[.03] p-1">
        <button
          onClick={() => setSection("general")}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${section === "general" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Settings className="mr-2 inline" size={16} />
          General
        </button>
        <button
          onClick={() => setSection("income")}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${section === "income" ? "bg-mint/10 text-mint" : "text-slate-400 hover:text-white"}`}
        >
          <ArrowDownLeft className="mr-2 inline" size={16} />
          Ingresos fijos
        </button>
        <button
          onClick={() => setSection("expense")}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${section === "expense" ? "bg-amber-300/10 text-amber-200" : "text-slate-400 hover:text-white"}`}
        >
          <ArrowUpRight className="mr-2 inline" size={16} />
          Gastos fijos
        </button>
      </div>
      {section === "income" ? (
        <RecurringIncomePage />
      ) : section === "expense" ? (
        <RecurringExpensesPage />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-violet/10 p-3 text-violet">
                <UserRound />
              </div>
              <div>
                <h2 className="font-semibold text-white">Perfil privado</h2>
                <p className="text-xs text-slate-500">
                  Único usuario autorizado
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{user?.email}</p>
            <p className="mt-2 break-all text-xs text-slate-500">
              UID: {user?.uid}
            </p>
          </div>
          <div className="panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-mint/10 p-3 text-mint">
                <Settings />
              </div>
              <div>
                <h2 className="font-semibold text-white">Preferencias</h2>
                <p className="text-xs text-slate-500">Configuración inicial</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/[.07] pb-3">
                <span className="text-slate-400">Moneda predeterminada</span>
                <span className="font-semibold text-white">
                  USD · Dólar estadounidense
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tema</span>
                <span className="font-semibold text-mint">Oscuro</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
