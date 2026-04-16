import { createClient } from "@supabase/supabase-js";

/**
 * Límites
 */
export const DAILY_LIMIT = 5;
export const MONTHLY_LIMIT = 30;

/**
 * Cliente Supabase con service role (ignora RLS)
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fecha actual en UTC: YYYY-MM-DD
 */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/**
 * Primer día del mes actual en UTC: YYYY-MM-01
 */
export function getFirstDayOfMonth(): string {
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7);
  return `${yearMonth}-01`;
}

/**
 * Estado de uso
 */
export interface UsageStatus {
  allowed: boolean;
  reason?: "daily" | "monthly";
  daily_used: number;
  daily_limit: number;
  daily_remaining: number;
  monthly_used: number;
  monthly_limit: number;
  monthly_remaining: number;
}

/**
 * Checkea límites e incrementa uso si está permitido
 */
export async function checkAndIncrementUsage(
  email: string
): Promise<UsageStatus> {
  const today = getTodayDate();
  const currentMonth = getFirstDayOfMonth();

  const { data: row, error } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("owner_email", email)
    .single();

  let dailyCount = row?.daily_count ?? 0;
  let monthlyCount = row?.monthly_count ?? 0;
  let dailyResetDate = row?.daily_reset_date ?? today;
  let monthlyResetMonth = row?.monthly_reset_month ?? currentMonth;

  // Reset diario
  if (dailyResetDate !== today) {
    dailyCount = 0;
    dailyResetDate = today;
  }

  // Reset mensual
  if (monthlyResetMonth !== currentMonth) {
    monthlyCount = 0;
    monthlyResetMonth = currentMonth;
  }

  // Límite diario
  if (dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: "daily",
      daily_used: dailyCount,
      daily_limit: DAILY_LIMIT,
      daily_remaining: 0,
      monthly_used: monthlyCount,
      monthly_limit: MONTHLY_LIMIT,
      monthly_remaining: Math.max(0, MONTHLY_LIMIT - monthlyCount),
    };
  }

  // Límite mensual
  if (monthlyCount >= MONTHLY_LIMIT) {
    return {
      allowed: false,
      reason: "monthly",
      daily_used: dailyCount,
      daily_limit: DAILY_LIMIT,
      daily_remaining: Math.max(0, DAILY_LIMIT - dailyCount),
      monthly_used: monthlyCount,
      monthly_limit: MONTHLY_LIMIT,
      monthly_remaining: 0,
    };
  }

  // Incrementar contadores
  const newDailyCount = dailyCount + 1;
  const newMonthlyCount = monthlyCount + 1;

  await supabase.from("usage_limits").upsert(
    {
      owner_email: email,
      daily_count: newDailyCount,
      daily_reset_date: dailyResetDate,
      monthly_count: newMonthlyCount,
      monthly_reset_month: monthlyResetMonth,
    },
    {
      onConflict: "owner_email",
    }
  );

  return {
    allowed: true,
    daily_used: newDailyCount,
    daily_limit: DAILY_LIMIT,
    daily_remaining: Math.max(0, DAILY_LIMIT - newDailyCount),
    monthly_used: newMonthlyCount,
    monthly_limit: MONTHLY_LIMIT,
    monthly_remaining: Math.max(0, MONTHLY_LIMIT - newMonthlyCount),
  };
}

/**
 * Obtiene el estado de uso (solo lectura, nunca escribe)
 */
export async function getUsageStatus(
  email: string
): Promise<UsageStatus> {
  const today = getTodayDate();
  const currentMonth = getFirstDayOfMonth();

  const { data: row } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("owner_email", email)
    .single();

  // Si no existe registro
  if (!row) {
    return {
      allowed: true,
      daily_used: 0,
      daily_limit: DAILY_LIMIT,
      daily_remaining: DAILY_LIMIT,
      monthly_used: 0,
      monthly_limit: MONTHLY_LIMIT,
      monthly_remaining: MONTHLY_LIMIT,
    };
  }

  let dailyCount = row.daily_count ?? 0;
  let monthlyCount = row.monthly_count ?? 0;

  // Reset lógico (sin escribir)
  if (row.daily_reset_date !== today) {
    dailyCount = 0;
  }

  if (row.monthly_reset_month !== currentMonth) {
    monthlyCount = 0;
  }

  const dailyRemaining = Math.max(0, DAILY_LIMIT - dailyCount);
  const monthlyRemaining = Math.max(0, MONTHLY_LIMIT - monthlyCount);

  return {
    allowed: dailyRemaining > 0 && monthlyRemaining > 0,
    daily_used: dailyCount,
    daily_limit: DAILY_LIMIT,
    daily_remaining: dailyRemaining,
    monthly_used: monthlyCount,
    monthly_limit: MONTHLY_LIMIT,
    monthly_remaining: monthlyRemaining,
  };
}