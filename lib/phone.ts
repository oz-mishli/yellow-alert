/**
 * Normalizes an Israeli phone number to 12-digit international format: 972XXXXXXXXX
 * Accepts: 0521234567, 052-123-4567, +972521234567, 972521234567
 * Returns null if the input is not a valid Israeli mobile number.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "972" + digits.slice(1);
  return null;
}

/** Format a normalized phone for display: 05X-XXX-XXXX */
export function formatPhone(normalized: string): string {
  const local = "0" + normalized.slice(3); // 0521234567
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}
