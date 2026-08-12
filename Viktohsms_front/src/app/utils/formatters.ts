/**
 * Format Naira currency with symbol
 */
export function formatNaira(amount: number | string | null | undefined, decimals: number = 2): string {
  if (amount === null || amount === undefined) {
    return '₦0.00';
  }

  const numericPrice = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericPrice)) {
    return '₦0.00';
  }

  // Format with thousand separators
  return `₦${numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}