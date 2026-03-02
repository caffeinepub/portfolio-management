/**
 * Formats a number as Indian Rupee (₹) with Indian numbering system
 * e.g., 1,00,000 for one lakh, 1,00,00,000 for one crore
 */
export function formatINR(value: number): string {
    if (isNaN(value) || value === null || value === undefined) return '₹0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    // Use Intl.NumberFormat with Indian locale
    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(absValue);

    return sign + formatted;
}

/**
 * Formats a number as a compact Indian Rupee value
 * e.g., ₹1.5L for 1,50,000 or ₹2.3Cr for 2,30,00,000
 */
export function formatINRCompact(value: number): string {
    if (isNaN(value) || value === null || value === undefined) return '₹0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 10000000) {
        return `${sign}₹${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) {
        return `${sign}₹${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) {
        return `${sign}₹${(absValue / 1000).toFixed(1)}K`;
    }

    return formatINR(value);
}
