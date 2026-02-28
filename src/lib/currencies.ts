// ─── All African Currencies + USD ────────────────────────────────────────────
// Each entry: { code, symbol, name, locale }
// locale is used by Intl.NumberFormat for proper grouping/decimals

export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
    // ── Supported Currencies ───────────────────────────────────────────────────
    NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG" },
    USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
};

export const DEFAULT_CURRENCY = "NGN";

/** Popular currencies shown first in the dropdown */
export const POPULAR_CURRENCIES = ["NGN", "USD"];

/**
 * Format a number as currency.
 * Uses Intl.NumberFormat with the currency's locale for proper grouping.
 * Falls back to a simple symbol + comma format if the locale isn't supported.
 */
export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
    const info = SUPPORTED_CURRENCIES[currencyCode];
    if (!info) {
        // Fallback: use the code as-is
        return `${currencyCode} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    try {
        return new Intl.NumberFormat(info.locale, {
            style: "currency",
            currency: info.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        // Some exotic locales may not be supported in all browsers
        return `${info.symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

/** Get just the symbol for a currency code */
export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
    return SUPPORTED_CURRENCIES[currencyCode]?.symbol ?? currencyCode;
}

/** Get sorted list of all currency codes for dropdowns */
export function getSortedCurrencies(): CurrencyInfo[] {
    const popular = POPULAR_CURRENCIES
        .map((code) => SUPPORTED_CURRENCIES[code])
        .filter(Boolean);

    const rest = Object.values(SUPPORTED_CURRENCIES)
        .filter((c) => !POPULAR_CURRENCIES.includes(c.code))
        .sort((a, b) => a.name.localeCompare(b.name));

    return [...popular, ...rest];
}
