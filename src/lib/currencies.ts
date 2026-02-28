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
    // ── Major / Most-used ──────────────────────────────────────────────────────
    NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG" },
    GHS: { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", locale: "en-GH" },
    KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", locale: "en-KE" },
    ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA" },
    EGP: { code: "EGP", symbol: "E£", name: "Egyptian Pound", locale: "ar-EG" },
    USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },

    // ── West Africa ────────────────────────────────────────────────────────────
    XOF: { code: "XOF", symbol: "CFA", name: "West African CFA Franc", locale: "fr-SN" },
    GMD: { code: "GMD", symbol: "D", name: "Gambian Dalasi", locale: "en-GM" },
    GNF: { code: "GNF", symbol: "FG", name: "Guinean Franc", locale: "fr-GN" },
    SLL: { code: "SLL", symbol: "Le", name: "Sierra Leonean Leone", locale: "en-SL" },
    LRD: { code: "LRD", symbol: "L$", name: "Liberian Dollar", locale: "en-LR" },
    CVE: { code: "CVE", symbol: "$", name: "Cape Verdean Escudo", locale: "pt-CV" },

    // ── Central Africa ─────────────────────────────────────────────────────────
    XAF: { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc", locale: "fr-CM" },
    CDF: { code: "CDF", symbol: "FC", name: "Congolese Franc", locale: "fr-CD" },
    STN: { code: "STN", symbol: "Db", name: "São Tomé & Príncipe Dobra", locale: "pt-ST" },

    // ── East Africa ────────────────────────────────────────────────────────────
    TZS: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", locale: "sw-TZ" },
    UGX: { code: "UGX", symbol: "USh", name: "Ugandan Shilling", locale: "en-UG" },
    RWF: { code: "RWF", symbol: "FRw", name: "Rwandan Franc", locale: "rw-RW" },
    ETB: { code: "ETB", symbol: "Br", name: "Ethiopian Birr", locale: "am-ET" },
    BIF: { code: "BIF", symbol: "FBu", name: "Burundian Franc", locale: "fr-BI" },
    SOS: { code: "SOS", symbol: "Sh", name: "Somali Shilling", locale: "so-SO" },
    DJF: { code: "DJF", symbol: "Fdj", name: "Djiboutian Franc", locale: "fr-DJ" },
    ERN: { code: "ERN", symbol: "Nfk", name: "Eritrean Nakfa", locale: "ti-ER" },
    SSP: { code: "SSP", symbol: "SSP", name: "South Sudanese Pound", locale: "en-SS" },
    KMF: { code: "KMF", symbol: "CF", name: "Comorian Franc", locale: "fr-KM" },

    // ── Southern Africa ────────────────────────────────────────────────────────
    ZMW: { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", locale: "en-ZM" },
    MWK: { code: "MWK", symbol: "MK", name: "Malawian Kwacha", locale: "en-MW" },
    ZWL: { code: "ZWL", symbol: "Z$", name: "Zimbabwean Dollar", locale: "en-ZW" },
    BWP: { code: "BWP", symbol: "P", name: "Botswana Pula", locale: "en-BW" },
    MZN: { code: "MZN", symbol: "MT", name: "Mozambican Metical", locale: "pt-MZ" },
    AOA: { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", locale: "pt-AO" },
    NAD: { code: "NAD", symbol: "N$", name: "Namibian Dollar", locale: "en-NA" },
    LSL: { code: "LSL", symbol: "L", name: "Lesotho Loti", locale: "en-LS" },
    SZL: { code: "SZL", symbol: "E", name: "Swazi Lilangeni", locale: "en-SZ" },
    MGA: { code: "MGA", symbol: "Ar", name: "Malagasy Ariary", locale: "mg-MG" },
    MUR: { code: "MUR", symbol: "₨", name: "Mauritian Rupee", locale: "en-MU" },
    SCR: { code: "SCR", symbol: "₨", name: "Seychellois Rupee", locale: "en-SC" },

    // ── North Africa ───────────────────────────────────────────────────────────
    MAD: { code: "MAD", symbol: "MAD", name: "Moroccan Dirham", locale: "ar-MA" },
    DZD: { code: "DZD", symbol: "د.ج", name: "Algerian Dinar", locale: "ar-DZ" },
    TND: { code: "TND", symbol: "DT", name: "Tunisian Dinar", locale: "ar-TN" },
    LYD: { code: "LYD", symbol: "LD", name: "Libyan Dinar", locale: "ar-LY" },
    SDG: { code: "SDG", symbol: "SDG", name: "Sudanese Pound", locale: "ar-SD" },
    MRU: { code: "MRU", symbol: "UM", name: "Mauritanian Ouguiya", locale: "ar-MR" },
};

export const DEFAULT_CURRENCY = "NGN";

/** Popular currencies shown first in the dropdown */
export const POPULAR_CURRENCIES = ["NGN", "GHS", "KES", "ZAR", "EGP", "USD", "XOF", "XAF", "TZS", "UGX", "ZWL"];

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
