import { createClient } from "@supabase/supabase-js";

export const DAILY_LIMIT = 5;
export const MONTHLY_LIMIT = 30;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export function getFirstDayOfMonth(): string {
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7);
  return `${yearMonth}-01`;
}

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
 * Solo lectura — nunca escribe
 */
export async function getUsageStatus(email: string): Promise<UsageStatus> {
  const today = getTodayDate();
  const currentMonth = getFirstDayOfMonth();

  const { data: row } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("owner_email", email)
    .single();

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

  if (row.daily_reset_date !== today) dailyCount = 0;
  if (row.monthly_reset_month !== currentMonth) monthlyCount = 0;

  const dailyRemaining = Math.max(0, DAILY_LIMIT - dailyCount);
  const monthlyRemaining = Math.max(0, MONTHLY_LIMIT - monthlyCount);

  return {
    allowed: dailyRemaining > 0 && monthlyRemaining > 0,
    reason: dailyRemaining === 0 ? "daily" : monthlyRemaining === 0 ? "monthly" : undefined,
    daily_used: dailyCount,
    daily_limit: DAILY_LIMIT,
    daily_remaining: dailyRemaining,
    monthly_used: monthlyCount,
    monthly_limit: MONTHLY_LIMIT,
    monthly_remaining: monthlyRemaining,
  };
}

/**
 * Solo incrementa — usar después de confirmar que hubo respuesta
 */
export async function incrementUsage(email: string): Promise<void> {
  const today = getTodayDate();
  const currentMonth = getFirstDayOfMonth();

  const { data: row } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("owner_email", email)
    .single();

  let dailyCount = row?.daily_count ?? 0;
  let monthlyCount = row?.monthly_count ?? 0;
  let dailyResetDate = row?.daily_reset_date ?? today;
  let monthlyResetMonth = row?.monthly_reset_month ?? currentMonth;

  if (dailyResetDate !== today) {
    dailyCount = 0;
    dailyResetDate = today;
  }

  if (monthlyResetMonth !== currentMonth) {
    monthlyCount = 0;
    monthlyResetMonth = currentMonth;
  }

  await supabase.from("usage_limits").upsert(
    {
      owner_email: email,
      daily_count: dailyCount + 1,
      daily_reset_date: dailyResetDate,
      monthly_count: monthlyCount + 1,
      monthly_reset_month: monthlyResetMonth,
    },
    { onConflict: "owner_email" }
  );
}

/**
 * Checkea e incrementa en una sola operación — mantener para compatibilidad
 */
export async function checkAndIncrementUsage(
  email: string
): Promise<UsageStatus> {
  const status = await getUsageStatus(email);
  if (!status.allowed) return status;
  await incrementUsage(email);
  return {
    ...status,
    allowed: true,
    daily_used: status.daily_used + 1,
    daily_remaining: Math.max(0, status.daily_remaining - 1),
    monthly_used: status.monthly_used + 1,
    monthly_remaining: Math.max(0, status.monthly_remaining - 1),
  };
}