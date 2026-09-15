import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ShoppingBag,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  CalendarDays
} from 'lucide-react';
import { Book, SaleTransaction, StoreCustomization } from '../types';

export type AnalyticsTimeframe = 'weekly' | 'monthly' | 'yearly';

interface MonthlyBookSalesChartProps {
  books: Book[];
  transactions: SaleTransaction[];
  customization?: StoreCustomization;
  timeframe?: AnalyticsTimeframe;
  onTimeframeChange?: (timeframe: AnalyticsTimeframe) => void;
}

// Harmonious palette matching the bookstore brand aesthetic
const PALETTE = [
  '#0d9488', // Teal 600
  '#f59e0b', // Amber 500
  '#6366f1', // Indigo 500
  '#10b981', // Emerald 500
  '#ec4899', // Pink 500
  '#8b5cf6', // Violet 500
  '#06b6d4', // Cyan 500
  '#f97316', // Orange 500
];

const MONTHS_LIST = [
  { id: '2026-09', label: 'شهر سبتمبر 2026 (الحالي)', short: 'سبتمبر 2026', daysInMonth: 30 },
  { id: '2026-08', label: 'شهر أوت 2026', short: 'أوت 2026', daysInMonth: 31 },
  { id: '2026-07', label: 'شهر جويلية 2026', short: 'جويلية 2026', daysInMonth: 31 },
  { id: '2026-06', label: 'شهر جوان 2026', short: 'جوان 2026', daysInMonth: 30 },
  { id: 'all', label: 'كامل مبيعات عام 2026', short: 'عام 2026', daysInMonth: 30 },
];

const YEAR_MONTHS = [
  { key: '2026-01', name: 'جانفي', short: 'جانفي' },
  { key: '2026-02', name: 'فيفري', short: 'فيفري' },
  { key: '2026-03', name: 'مارس', short: 'مارس' },
  { key: '2026-04', name: 'أفريل', short: 'أفريل' },
  { key: '2026-05', name: 'ماي', short: 'ماي' },
  { key: '2026-06', name: 'جوان', short: 'جوان' },
  { key: '2026-07', name: 'جويلية', short: 'جويلية' },
  { key: '2026-08', name: 'أوت', short: 'أوت' },
  { key: '2026-09', name: 'سبتمبر', short: 'سبتمبر' },
  { key: '2026-10', name: 'أكتوبر', short: 'أكتوبر' },
  { key: '2026-11', name: 'نوفمبر', short: 'نوفمبر' },
  { key: '2026-12', name: 'ديسمبر', short: 'ديسمبر' },
];

const LAST_7_DAYS = [
  { key: '2026-09-09', dayName: 'الأربعاء 09', short: '09/09' },
  { key: '2026-09-10', dayName: 'الخميس 10', short: '09/10' },
  { key: '2026-09-11', dayName: 'الجمعة 11', short: '09/11' },
  { key: '2026-09-12', dayName: 'السبت 12', short: '09/12' },
  { key: '2026-09-13', dayName: 'الأحد 13', short: '09/13' },
  { key: '2026-09-14', dayName: 'الإثنين 14', short: '09/14' },
  { key: '2026-09-15', dayName: 'الثلاثاء 15', short: '09/15' },
];

export const MonthlyBookSalesChart: React.FC<MonthlyBookSalesChartProps> = ({
  books,
  transactions,
  customization,
  timeframe: propTimeframe,
  onTimeframeChange
}) => {
  // Internal or controlled timeframe state
  const [internalTimeframe, setInternalTimeframe] = useState<AnalyticsTimeframe>('monthly');
  const activeTimeframe = propTimeframe || internalTimeframe;

  const handleTimeframeChange = (newTf: AnalyticsTimeframe) => {
    setInternalTimeframe(newTf);
    if (onTimeframeChange) {
      onTimeframeChange(newTf);
    }
  };

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [chartType, setChartType] = useState<'bar' | 'timeline' | 'distribution'>('bar');
  const [currency, setCurrency] = useState<'DZD' | 'USDT'>('DZD');
  const [metricMode, setMetricMode] = useState<'revenue' | 'copies'>('revenue');

  const exchangeRate = customization?.exchangeRateUsdtToDzd || 240;

  // Filter completed purchase transactions according to active timeframe
  const filteredPurchases = useMemo(() => {
    return transactions.filter((t) => {
      if (t.status !== 'completed' || t.amountDzd <= 0 || t.type === 'withdrawal') return false;
      // Exclude test dummy hashes if any
      if (t.id.includes('tx-bm-structured-1') || t.id.includes('tx-bn-structured-1')) return false;

      const dateStr = t.date || t.timestamp || '';

      if (activeTimeframe === 'weekly') {
        // Match any of the last 7 days
        return LAST_7_DAYS.some((d) => dateStr.startsWith(d.key));
      }

      if (activeTimeframe === 'yearly') {
        // Match year 2026 or all if year unspecified
        return dateStr.startsWith('2026');
      }

      // Default: monthly
      if (selectedMonth === 'all') return true;
      return dateStr.startsWith(selectedMonth);
    });
  }, [transactions, activeTimeframe, selectedMonth]);

  // Aggregate sales per book for the active timeframe
  const bookSalesData = useMemo(() => {
    // Map existing books
    const bookMap = new Map<string, {
      id: string;
      title: string;
      author: string;
      priceDzd: number;
      coverUrl?: string;
      copiesSold: number;
      revenueDzd: number;
      revenueUsdt: number;
      color: string;
    }>();

    // Initialize with all store books so even books with 0 sales show up cleanly
    books.forEach((b, index) => {
      bookMap.set(b.id, {
        id: b.id,
        title: b.title,
        author: b.author,
        priceDzd: b.priceDzd || 1800,
        coverUrl: b.coverUrl,
        copiesSold: 0,
        revenueDzd: 0,
        revenueUsdt: 0,
        color: PALETTE[index % PALETTE.length],
      });
    });

    // Populate from filtered purchase transactions
    filteredPurchases.forEach((t) => {
      const bId = t.bookId || 'book-owner-1';
      let entry = bookMap.get(bId);

      // Fallback matching by title
      if (!entry && t.bookTitle) {
        for (const [, bookItem] of bookMap.entries()) {
          if (bookItem.title === t.bookTitle) {
            entry = bookItem;
            break;
          }
        }
      }

      // If not in books list, create a virtual entry
      if (!entry) {
        const fallbackId = t.bookId || `book-${Date.now()}`;
        const newEntry = {
          id: fallbackId,
          title: t.bookTitle || 'كتاب مجهول',
          author: t.sellerName || 'مؤلف معتمد',
          priceDzd: t.amountDzd || 1800,
          copiesSold: 0,
          revenueDzd: 0,
          revenueUsdt: 0,
          color: PALETTE[bookMap.size % PALETTE.length],
        };
        bookMap.set(fallbackId, newEntry);
        entry = newEntry;
      }

      entry.copiesSold += 1;
      const amtDzd = t.amountDzd || 0;
      entry.revenueDzd += amtDzd;
      entry.revenueUsdt += parseFloat(((t.amountUsdt || (amtDzd / exchangeRate)) || 0).toFixed(2));
    });

    // Convert map to array sorted by revenue / copies
    const dataList = Array.from(bookMap.values()).map((b) => {
      const shortTitle = b.title.length > 20 ? `${b.title.substring(0, 18)}...` : b.title;
      return {
        ...b,
        shortTitle,
        revenueValue: currency === 'DZD' ? b.revenueDzd : b.revenueUsdt,
      };
    });

    return dataList.sort((a, b) => b.revenueDzd - a.revenueDzd);
  }, [books, filteredPurchases, currency, exchangeRate]);

  // Timeline progression based on timeframe (weekly: 7 days, monthly: 30 days, yearly: 12 months)
  const timelineData = useMemo(() => {
    if (activeTimeframe === 'weekly') {
      // 7 days timeline
      return LAST_7_DAYS.map((d) => {
        const dayPurchases = filteredPurchases.filter((t) => {
          const dateStr = t.date || t.timestamp || '';
          return dateStr.startsWith(d.key);
        });

        const revDzd = dayPurchases.reduce((acc, t) => acc + (t.amountDzd || 0), 0);
        const revUsdt = parseFloat((dayPurchases.reduce((acc, t) => acc + (t.amountUsdt || (t.amountDzd / exchangeRate)), 0)).toFixed(2));
        const copies = dayPurchases.length;

        return {
          label: d.dayName,
          subLabel: d.short,
          revenueDzd: revDzd,
          revenueUsdt: revUsdt,
          copies,
          displayVal: metricMode === 'copies' ? copies : (currency === 'DZD' ? revDzd : revUsdt),
        };
      });
    }

    if (activeTimeframe === 'yearly') {
      // 12 months timeline
      return YEAR_MONTHS.map((m) => {
        const monthPurchases = filteredPurchases.filter((t) => {
          const dateStr = t.date || t.timestamp || '';
          return dateStr.startsWith(m.key);
        });

        const revDzd = monthPurchases.reduce((acc, t) => acc + (t.amountDzd || 0), 0);
        const revUsdt = parseFloat((monthPurchases.reduce((acc, t) => acc + (t.amountUsdt || (t.amountDzd / exchangeRate)), 0)).toFixed(2));
        const copies = monthPurchases.length;

        return {
          label: m.name,
          subLabel: m.short,
          revenueDzd: revDzd,
          revenueUsdt: revUsdt,
          copies,
          displayVal: metricMode === 'copies' ? copies : (currency === 'DZD' ? revDzd : revUsdt),
        };
      });
    }

    // Default: Monthly (days 1 to 30/31)
    const selectedConfig = MONTHS_LIST.find((m) => m.id === selectedMonth) || MONTHS_LIST[0];
    const totalDays = selectedConfig.daysInMonth;
    const daysArr: Array<{
      label: string;
      subLabel: string;
      revenueDzd: number;
      revenueUsdt: number;
      copies: number;
      displayVal: number;
    }> = [];

    const dayMap = new Map<number, { dzd: number; usdt: number; copies: number }>();
    for (let d = 1; d <= totalDays; d++) {
      dayMap.set(d, { dzd: 0, usdt: 0, copies: 0 });
    }

    filteredPurchases.forEach((t) => {
      const dateStr = t.date || t.timestamp || '';
      const match = dateStr.match(/\d{4}-\d{2}-(\d{2})/);
      if (match) {
        const dayInt = parseInt(match[1], 10);
        if (dayInt >= 1 && dayInt <= totalDays) {
          const current = dayMap.get(dayInt) || { dzd: 0, usdt: 0, copies: 0 };
          current.dzd += t.amountDzd || 0;
          current.usdt += t.amountUsdt || (t.amountDzd / exchangeRate);
          current.copies += 1;
        }
      }
    });

    for (let d = 1; d <= totalDays; d++) {
      const val = dayMap.get(d) || { dzd: 0, usdt: 0, copies: 0 };
      daysArr.push({
        label: `${d}`,
        subLabel: `يوم ${d}`,
        revenueDzd: val.dzd,
        revenueUsdt: parseFloat(val.usdt.toFixed(2)),
        copies: val.copies,
        displayVal: metricMode === 'copies'
          ? val.copies
          : (currency === 'DZD' ? val.dzd : parseFloat(val.usdt.toFixed(2))),
      });
    }

    return daysArr;
  }, [activeTimeframe, filteredPurchases, selectedMonth, exchangeRate, currency, metricMode]);

  // Overall KPIs for the Active Timeframe
  const totalRevenueDzd = useMemo(() => {
    return bookSalesData.reduce((sum, b) => sum + b.revenueDzd, 0);
  }, [bookSalesData]);

  const totalRevenueUsdt = useMemo(() => {
    return parseFloat((totalRevenueDzd / exchangeRate).toFixed(2));
  }, [totalRevenueDzd, exchangeRate]);

  const totalCopies = useMemo(() => {
    return bookSalesData.reduce((sum, b) => sum + b.copiesSold, 0);
  }, [bookSalesData]);

  const topSellingBook = useMemo(() => {
    return bookSalesData.find((b) => b.copiesSold > 0) || bookSalesData[0] || null;
  }, [bookSalesData]);

  // Dynamic titles and labels
  const timeframeLabel = useMemo(() => {
    if (activeTimeframe === 'weekly') return 'أسبوعي (آخر 7 أيام)';
    if (activeTimeframe === 'yearly') return 'سنوي (عام 2026)';
    const m = MONTHS_LIST.find((item) => item.id === selectedMonth);
    return `شهري (${m?.short || 'سبتمبر 2026'})`;
  }, [activeTimeframe, selectedMonth]);

  const timelineAxisLabel = useMemo(() => {
    if (activeTimeframe === 'weekly') return 'أيام الأسبوع (آخر 7 أيام)';
    if (activeTimeframe === 'yearly') return 'أشهر السنة (عام 2026)';
    return 'أيام الشهر (1 - 30)';
  }, [activeTimeframe]);

  // Pie chart data for distribution
  const pieDistributionData = useMemo(() => {
    const total = metricMode === 'copies' ? totalCopies : totalRevenueDzd;
    return bookSalesData
      .filter((b) => (metricMode === 'copies' ? b.copiesSold : b.revenueDzd) > 0)
      .map((b) => {
        const val = metricMode === 'copies' ? b.copiesSold : (currency === 'DZD' ? b.revenueDzd : b.revenueUsdt);
        const rawVal = metricMode === 'copies' ? b.copiesSold : b.revenueDzd;
        const pct = total > 0 ? Math.round((rawVal / total) * 100) : 0;
        return {
          name: b.title,
          shortTitle: b.shortTitle,
          value: val,
          copies: b.copiesSold,
          percentage: pct,
          color: b.color,
        };
      });
  }, [bookSalesData, metricMode, totalCopies, totalRevenueDzd, currency]);

  return (
    <div id="monthly-book-sales-chart-card" className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm space-y-6" dir="rtl">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-sm flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white">
                مخطط بياني لمبيعات الكتب ({timeframeLabel})
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                إحصاءات الكتب
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                تحديث لحظي
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {activeTimeframe === 'weekly' && 'تحليل حجم مبيعات كل كتاب ومسار الطلب اليومي خلال آخر 7 أيام.'}
              {activeTimeframe === 'monthly' && 'تحليل شامل لحجم مبيعات كل كتاب، وتتبع مسار المبيعات اليومية وتوزيع الإيرادات خلال الشهر.'}
              {activeTimeframe === 'yearly' && 'تحليل سنوي تراكمي لمبيعات الكتب وتطور الإيرادات عبر كافة أشهر عام 2026.'}
            </p>
          </div>
        </div>

        {/* Timeframe & Currency Controls */}
        <div className="flex items-center gap-2 flex-wrap self-stretch lg:self-auto justify-between lg:justify-end">
          {/* Timeframe Toggle Buttons (Weekly / Monthly / Yearly) */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-slate-900 p-1 border border-stone-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleTimeframeChange('weekly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTimeframe === 'weekly'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>أسبوعي</span>
            </button>

            <button
              type="button"
              onClick={() => handleTimeframeChange('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTimeframe === 'monthly'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>شهري</span>
            </button>

            <button
              type="button"
              onClick={() => handleTimeframeChange('yearly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTimeframe === 'yearly'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>سنوي</span>
            </button>
          </div>

          {/* Month Selector Dropdown (visible when Monthly mode is active) */}
          {activeTimeframe === 'monthly' && (
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800 text-stone-900 dark:text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Currency Toggle */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-slate-900 p-1 border border-stone-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCurrency('DZD')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currency === 'DZD'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              د.ج
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USDT')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currency === 'USDT'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              USDT
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards dynamically adapting to Selected Timeframe */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Total Revenue for Period */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/40 dark:to-slate-900 border border-teal-200/80 dark:border-teal-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
              {activeTimeframe === 'weekly' && 'إيراد مبيعات الأسبوع'}
              {activeTimeframe === 'monthly' && 'إيراد مبيعات الشهر'}
              {activeTimeframe === 'yearly' && 'إيراد مبيعات عام 2026'}
            </span>
            <span className="p-1 rounded-lg bg-teal-600 text-white">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <strong className="text-lg sm:text-xl font-black text-teal-950 dark:text-white">
              {currency === 'DZD' 
                ? `${totalRevenueDzd.toLocaleString()} د.ج` 
                : `${totalRevenueUsdt.toLocaleString()} USDT`}
            </strong>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 block mt-0.5 font-medium">
              {currency === 'DZD' ? `≈ ${totalRevenueUsdt} USDT` : `≈ ${totalRevenueDzd.toLocaleString()} د.ج`}
            </span>
          </div>
        </div>

        {/* 2. Copies Sold for Period */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
              {activeTimeframe === 'weekly' && 'النسخ المباعة أسبوعياً'}
              {activeTimeframe === 'monthly' && 'النسخ المباعة بالشهر'}
              {activeTimeframe === 'yearly' && 'إجمالي النسخ السنوية'}
            </span>
            <span className="p-1 rounded-lg bg-amber-500 text-stone-950">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <strong className="text-lg sm:text-xl font-black text-amber-950 dark:text-white">
              {totalCopies} <span className="text-xs font-bold text-stone-500">نسخة</span>
            </strong>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5 font-medium">
              {activeTimeframe === 'weekly' ? 'خلال الـ 7 أيام الماضية' : activeTimeframe === 'yearly' ? 'على مدار كافة الأشهر' : 'مشتريات رقمية وصوتية'}
            </span>
          </div>
        </div>

        {/* 3. Best Seller Book for Period */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
              {activeTimeframe === 'weekly' && 'الأكثر طلباً هذا الأسبوع'}
              {activeTimeframe === 'monthly' && 'الأكثر طلباً في الشهر'}
              {activeTimeframe === 'yearly' && 'الكتاب الأكثر مبيعاً 2026'}
            </span>
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <strong className="text-xs sm:text-sm font-black text-indigo-950 dark:text-white block truncate" title={topSellingBook?.title}>
              {topSellingBook && topSellingBook.copiesSold > 0 ? topSellingBook.shortTitle : (topSellingBook ? topSellingBook.shortTitle : 'لا توجد مبيعات')}
            </strong>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5 font-medium">
              {topSellingBook ? `${topSellingBook.copiesSold} مبيعة (${topSellingBook.revenueDzd.toLocaleString()} د.ج)` : '—'}
            </span>
          </div>
        </div>

        {/* 4. Average Rate for Period */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              {activeTimeframe === 'weekly' && 'معدل المبيعات اليومي'}
              {activeTimeframe === 'monthly' && 'متوسط سعر الكتاب'}
              {activeTimeframe === 'yearly' && 'متوسط الإيراد الشهري'}
            </span>
            <span className="p-1 rounded-lg bg-emerald-600 text-white">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <strong className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white">
              {activeTimeframe === 'weekly' && (
                <>
                  {currency === 'DZD' 
                    ? `${Math.round(totalRevenueDzd / 7).toLocaleString()} د.ج` 
                    : `${(totalRevenueUsdt / 7).toFixed(1)} $`}
                  <span className="text-xs font-bold text-stone-500"> /يوم</span>
                </>
              )}
              {activeTimeframe === 'monthly' && (
                <>
                  {totalCopies > 0 
                    ? Math.round(totalRevenueDzd / totalCopies).toLocaleString() 
                    : 1800}{' '}
                  <span className="text-xs font-bold text-stone-500">د.ج</span>
                </>
              )}
              {activeTimeframe === 'yearly' && (
                <>
                  {currency === 'DZD'
                    ? `${Math.round(totalRevenueDzd / 12).toLocaleString()} د.ج`
                    : `${(totalRevenueUsdt / 12).toFixed(1)} $`}
                  <span className="text-xs font-bold text-stone-500"> /شهر</span>
                </>
              )}
            </strong>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
              {activeTimeframe === 'weekly' ? 'متوسط حركة المبيعات باليوم' : activeTimeframe === 'yearly' ? 'متوسط أداء الأشهر الـ 12' : 'تسعير عادل للمؤلف والقارئ'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart View Mode & Metric Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-700">
        {/* Chart View Switcher */}
        <div className="inline-flex rounded-lg bg-white dark:bg-slate-800 p-1 border border-stone-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>مبيعات كل كتاب (أعمدة)</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'timeline'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>
              {activeTimeframe === 'weekly' && 'مسار المبيعات اليومي بالأسبوع'}
              {activeTimeframe === 'monthly' && 'مسار المبيعات اليومي بالشهر'}
              {activeTimeframe === 'yearly' && 'مسار المبيعات عبر أشهر السنة'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('distribution')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'distribution'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>نسبة مساهمة الكتب</span>
          </button>
        </div>

        {/* Metric Mode: Revenue vs Copies */}
        <div className="inline-flex rounded-lg bg-white dark:bg-slate-800 p-1 border border-stone-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMetricMode('revenue')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'revenue'
                ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            المبالغ المالية ({currency})
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('copies')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'copies'
                ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            عدد النسخ المباعة
          </button>
        </div>
      </div>

      {/* CHART CANVAS (RECHARTS) */}
      <div className="w-full bg-stone-50/50 dark:bg-slate-900/30 rounded-2xl p-3 sm:p-4 border border-stone-200/70 dark:border-slate-700">
        
        {/* 1. BAR CHART: Per-Book Performance */}
        {chartType === 'bar' && (
          <div className="w-full h-80 sm:h-96" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookSalesData}
                margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} vertical={false} />
                <XAxis
                  dataKey="shortTitle"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (metricMode === 'copies') return `${val}`;
                    return currency === 'DZD' ? `${(val / 1000).toFixed(1)}k` : `$${val}`;
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-stone-900/95 text-white border border-stone-700 shadow-xl text-xs space-y-1.5" dir="rtl">
                          <strong className="block text-teal-300 font-bold border-b border-stone-700 pb-1">
                            {data.title}
                          </strong>
                          <div className="text-[11px] text-stone-300">
                            المؤلف: <span className="text-white font-bold">{data.author}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-stone-400">النسخ المباعة:</span>
                            <span className="font-mono font-bold text-amber-400">{data.copiesSold} نسخة</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-stone-400">الإيراد المالي:</span>
                            <span className="font-mono font-black text-emerald-400">
                              {currency === 'DZD' ? `${data.revenueDzd.toLocaleString()} د.ج` : `${data.revenueUsdt} USDT`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={() => (metricMode === 'copies' ? 'عدد النسخ المباعة' : `الإيراد الإجمالي (${currency})`)}
                />
                <Bar
                  dataKey={metricMode === 'copies' ? 'copiesSold' : 'revenueValue'}
                  radius={[8, 8, 0, 0]}
                  name={metricMode === 'copies' ? 'نسخ مباعة' : `إيراد ${currency}`}
                >
                  {bookSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 2. TIMELINE CHART: Progression (Days in Week, Days in Month, or Months in Year) */}
        {chartType === 'timeline' && (
          <div className="w-full h-80 sm:h-96" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="bookTimeframeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  label={{ value: timelineAxisLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (metricMode === 'copies') return `${val}`;
                    return currency === 'DZD' ? `${val}` : `$${val}`;
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-stone-900/95 text-white border border-stone-700 shadow-xl text-xs space-y-1.5" dir="rtl">
                          <strong className="block text-teal-300 font-bold border-b border-stone-700 pb-1">
                            {data.label} ({timeframeLabel})
                          </strong>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-stone-400">النسخ المباعة:</span>
                            <span className="font-mono font-bold text-amber-400">{data.copies} نسخة</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-stone-400">الإيراد:</span>
                            <span className="font-mono font-black text-emerald-400">
                              {currency === 'DZD' ? `${data.revenueDzd.toLocaleString()} د.ج` : `${data.revenueUsdt} USDT`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="displayVal"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#bookTimeframeAreaGradient)"
                  name={metricMode === 'copies' ? 'النسخ المباعة' : `الإيراد (${currency})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 3. DISTRIBUTION PIE CHART: Book market share */}
        {chartType === 'distribution' && (
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 py-4">
            <div className="w-full md:w-1/2 h-72 sm:h-80" dir="ltr">
              {pieDistributionData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-stone-400">
                  لا توجد مبيعات مسجلة لهذه الفترة لعرض التوزيع الدائري.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieDistributionData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 rounded-xl bg-stone-900/95 text-white border border-stone-700 shadow-xl text-xs space-y-1" dir="rtl">
                              <strong className="block text-teal-300 font-bold border-b border-stone-700 pb-1">
                                {data.name}
                              </strong>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-stone-400">النسبة المئوية:</span>
                                <span className="font-bold text-amber-400">{data.percentage}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-stone-400">القيمة:</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {metricMode === 'copies' ? `${data.copies} نسخة` : `${data.value.toLocaleString()} ${currency}`}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Book Share Legend / Breakdown List */}
            <div className="w-full md:w-1/2 space-y-2.5">
              <h5 className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5 pb-1 border-b border-stone-200 dark:border-slate-700">
                <PieIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>حصة مبيعات الكتب في هذه الفترة:</span>
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bookSalesData.map((b) => {
                  const sharePct = totalRevenueDzd > 0 
                    ? Math.round((b.revenueDzd / totalRevenueDzd) * 100) 
                    : 0;
                  return (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: b.color }}
                        />
                        <div className="min-w-0">
                          <strong className="block text-stone-900 dark:text-white truncate font-bold text-[11px]" title={b.title}>
                            {b.title}
                          </strong>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {b.author} • {b.copiesSold} مبيعة
                          </span>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <strong className="block font-mono text-stone-900 dark:text-white text-[11px]">
                          {currency === 'DZD' ? `${b.revenueDzd.toLocaleString()} د.ج` : `${b.revenueUsdt} $`}
                        </strong>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                          {sharePct}% من الإجمالي
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Book Sales Detail Table / Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>تفاصيل أداء الكتب خلال الفترة ({timeframeLabel}):</span>
          </h4>
          <span className="text-[10px] text-stone-400 font-mono">
            {bookSalesData.length} مؤلفات مسجلة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {bookSalesData.slice(0, 6).map((book, idx) => (
            <div
              key={book.id}
              className="p-3 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-700 flex items-start gap-2.5"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5"
                style={{ backgroundColor: book.color }}
              >
                #{idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-stone-900 dark:text-white truncate font-bold" title={book.title}>
                  {book.title}
                </strong>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                  {book.author}
                </span>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200 dark:border-slate-800 text-[11px]">
                  <span className="text-stone-500 dark:text-stone-400">
                    النسخ: <strong className="text-stone-900 dark:text-white">{book.copiesSold}</strong>
                  </span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                    {currency === 'DZD' ? `${book.revenueDzd.toLocaleString()} د.ج` : `${book.revenueUsdt} USDT`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
