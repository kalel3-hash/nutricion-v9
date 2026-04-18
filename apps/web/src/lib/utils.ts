/**
 * Elimina campos null, undefined, arrays vacíos y strings vacíos
 */
export function compactProfile(
    profile: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(profile).filter(([_, v]) => {
        if (v === null || v === undefined) return false;
        if (typeof v === "string" && v.trim() === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      })
    );
  }