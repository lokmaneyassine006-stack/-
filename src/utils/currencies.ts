export interface CurrencyInfo {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  rateToDzd: number; // How many DZD per 1 unit of this currency
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  DZD: { code: 'DZD', symbol: 'د.ج', nameAr: 'دينار جزائري', nameEn: 'Algerian Dinar', rateToDzd: 1, flag: '🇩🇿' },
  USDT: { code: 'USDT', symbol: 'USDT', nameAr: 'تيثر رقمي', nameEn: 'Tether USDT', rateToDzd: 240, flag: '🪙' },
  USD: { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', rateToDzd: 235, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', nameAr: 'يورو أوروبي', nameEn: 'Euro', rateToDzd: 255, flag: '🇪🇺' },
  SAR: { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', rateToDzd: 62.5, flag: '🇸🇦' },
  AED: { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', rateToDzd: 64.0, flag: '🇦🇪' },
  GBP: { code: 'GBP', symbol: '£', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', rateToDzd: 295, flag: '🇬🇧' },
  TRY: { code: 'TRY', symbol: '₺', nameAr: 'ليرة تركية', nameEn: 'Turkish Lira', rateToDzd: 6.8, flag: '🇹🇷' },
  CNY: { code: 'CNY', symbol: '¥', nameAr: 'يوان صيني', nameEn: 'Chinese Yuan', rateToDzd: 32.5, flag: '🇨🇳' },
  CAD: { code: 'CAD', symbol: 'C$', nameAr: 'دولار كندي', nameEn: 'Canadian Dollar', rateToDzd: 168, flag: '🇨🇦' },
  QAR: { code: 'QAR', symbol: 'ر.ق', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', rateToDzd: 64.5, flag: '🇶🇦' },
  KWD: { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', rateToDzd: 765, flag: '🇰🇼' },
  INR: { code: 'INR', symbol: '₹', nameAr: 'روبية هندية', nameEn: 'Indian Rupee', rateToDzd: 2.75, flag: '🇮🇳' },
  RUB: { code: 'RUB', symbol: '₽', nameAr: 'روبل روسي', nameEn: 'Russian Ruble', rateToDzd: 2.6, flag: '🇷🇺' },
  JPY: { code: 'JPY', symbol: '¥', nameAr: 'ين ياباني', nameEn: 'Japanese Yen', rateToDzd: 1.55, flag: '🇯🇵' },
};

/**
 * Formats a DZD price into the selected currency
 */
export function formatPrice(dzdAmount: number, targetCurrencyCode = 'DZD', customUsdtRate = 240): {
  formatted: string;
  value: number;
  currency: CurrencyInfo;
  approxUsdt: number;
} {
  const curr = SUPPORTED_CURRENCIES[targetCurrencyCode] || SUPPORTED_CURRENCIES.DZD;
  const safeDzd = Number(dzdAmount) || 0;
  const safeUsdtRate = Number(customUsdtRate) > 0 ? Number(customUsdtRate) : 240;
  let rate = curr.rateToDzd;
  
  if (targetCurrencyCode === 'USDT') {
    rate = safeUsdtRate;
  }
  const safeRate = Number(rate) > 0 ? Number(rate) : 1;

  const convertedValue = safeDzd / safeRate;
  const approxUsdt = +((safeDzd / safeUsdtRate) || 0).toFixed(2);

  let formatted = '';
  if (targetCurrencyCode === 'DZD') {
    formatted = `${safeDzd.toLocaleString('ar-DZ')} د.ج`;
  } else if (targetCurrencyCode === 'USDT') {
    formatted = `${(convertedValue || 0).toFixed(2)} USDT`;
  } else {
    formatted = `${curr.symbol} ${(convertedValue || 0).toFixed(2)}`;
  }

  return {
    formatted,
    value: convertedValue || 0,
    currency: curr,
    approxUsdt: approxUsdt || 0,
  };
}
