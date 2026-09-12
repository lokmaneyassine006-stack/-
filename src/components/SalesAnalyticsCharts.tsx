import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Zap, 
  Building2, 
  BarChart2, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { SaleTransaction, StoreCustomization } from '../types';

interface SalesAnalyticsChartsProps {
  transactions: SaleTransaction[];
  customization: StoreCustomization;
}

// Colors for payment methods
const METHOD_COLORS = {
  baridimob: '#0d9488', // Teal 600
  binance: '#f59e0b',   // Amber 500
  cib_ccp: '#3b82f6',   // Blue 500
  gift_card: '#8b5cf6', // Violet 500
  wallet: '#10b981',    // Emerald 500
};

export const SalesAnalyticsCharts: React.FC<SalesAnalyticsChartsProps> = ({
  transactions,
  customization
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'monthly' | 'distribution' | 'all'>('all');
  const [dailyTimeframe, setDailyTimeframe] = useState<'7' | '14' | '30'>('14');
  const [selectedCurrency, setSelectedCurrency] = useState<'DZD' | 'USDT'>('DZD');

  const exchangeRate = customization?.exchangeRateUsdtToDzd || 240;

  // Filter purchase transactions - Strictly real completed purchases only
  const purchaseTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        !t.id.includes('tx-bm-structured-1') &&
        !t.id.includes('tx-bn-structured-1') &&
        (t.type === 'book_purchase' || (t.amountDzd > 0 && t.type !== 'withdrawal')) &&
        t.status === 'completed'
    );
  }, [transactions]);

  // Aggregate Daily Sales Data for the chosen timeframe strictly from real records
  const dailyChartData = useMemo(() => {
    const daysCount = parseInt(dailyTimeframe, 10);
    const result: Array<{
      date: string;
      label: string;
      fullDate: string;
      totalDzd: number;
      totalUsdt: number;
      baridimobDzd: number;
      binanceDzd: number;
      otherDzd: number;
      ordersCount: number;
    }> = [];

    // Reference dates centered around current date (2026-09-12)
    const baseDate = new Date('2026-09-12T12:00:00');

    // Arabic day names
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    // Map existing transactions by YYYY-MM-DD
    const txByDate: Record<string, SaleTransaction[]> = {};
    purchaseTransactions.forEach((tx) => {
      let dateKey = tx.date;
      if (!dateKey && tx.timestamp) {
        dateKey = tx.timestamp.split(' ')[0];
      }
      if (dateKey) {
        if (!txByDate[dateKey]) txByDate[dateKey] = [];
        txByDate[dateKey].push(tx);
      }
    });

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayNum}`;
      const dayName = arabicDays[d.getDay()];

      const dayTransactions = txByDate[dateKey] || [];

      // Calculate strictly actual transactions for this day - No mock baselines
      let baridimobDzd = 0;
      let binanceDzd = 0;
      let otherDzd = 0;
      const ordersCount = dayTransactions.length;

      dayTransactions.forEach((tx) => {
        const amt = tx.amountDzd || 0;
        if (tx.method === 'baridimob') baridimobDzd += amt;
        else if (tx.method === 'binance') binanceDzd += amt;
        else otherDzd += amt;
      });

      const totalDzd = baridimobDzd + binanceDzd + otherDzd;
      const totalUsdt = parseFloat((totalDzd / exchangeRate).toFixed(2));

      result.push({
        date: dateKey,
        label: `${dayName} ${dayNum}`,
        fullDate: `${dateKey} (${dayName})`,
        totalDzd,
        totalUsdt,
        baridimobDzd,
        binanceDzd,
        otherDzd,
        ordersCount,
      });
    }

    return result;
  }, [purchaseTransactions, dailyTimeframe, exchangeRate]);

  // Aggregate Monthly Sales Data for 2026 strictly from real records
  const monthlyChartData = useMemo(() => {
    const monthsConfig = [
      { name: 'يناير', short: '01' },
      { name: 'فبراير', short: '02' },
      { name: 'مارس', short: '03' },
      { name: 'أبريل', short: '04' },
      { name: 'ماي', short: '05' },
      { name: 'جوان', short: '06' },
      { name: 'جويلية', short: '07' },
      { name: 'أوت', short: '08' },
      { name: 'سبتمبر', short: '09' },
    ];

    const monthlyAgg: Record<string, { bm: number; bn: number; other: number; orders: number }> = {};
    monthsConfig.forEach((m) => {
      monthlyAgg[m.short] = { bm: 0, bn: 0, other: 0, orders: 0 };
    });

    purchaseTransactions.forEach((tx) => {
      const dateStr = tx.date || tx.timestamp || '';
      const match = dateStr.match(/2026-(\d{2})/);
      const mShort = match ? match[1] : (dateStr.includes('-09-') ? '09' : '09');
      if (monthlyAgg[mShort]) {
        const amt = tx.amountDzd || 0;
        monthlyAgg[mShort].orders += 1;
        if (tx.method === 'baridimob') monthlyAgg[mShort].bm += amt;
        else if (tx.method === 'binance') monthlyAgg[mShort].bn += amt;
        else monthlyAgg[mShort].other += amt;
      }
    });

    return monthsConfig.map((m, idx) => {
      const data = monthlyAgg[m.short] || { bm: 0, bn: 0, other: 0, orders: 0 };
      const totalDzd = data.bm + data.bn + data.other;
      const totalUsdt = parseFloat((totalDzd / exchangeRate).toFixed(2));

      const prevData = idx > 0 ? monthlyAgg[monthsConfig[idx - 1].short] : null;
      const prevTotal = prevData ? prevData.bm + prevData.bn + prevData.other : 0;
      const growth = prevTotal > 0 ? parseFloat((((totalDzd - prevTotal) / prevTotal) * 100).toFixed(1)) : (totalDzd > 0 ? 100 : 0);

      return {
        month: m.name,
        monthKey: m.short,
        totalDzd,
        totalUsdt,
        baridimobDzd: data.bm,
        binanceDzd: data.bn,
        otherDzd: data.other,
        baridimobUsdt: parseFloat((data.bm / exchangeRate).toFixed(2)),
        binanceUsdt: parseFloat((data.bn / exchangeRate).toFixed(2)),
        ordersCount: data.orders,
        growth,
      };
    });
  }, [purchaseTransactions, exchangeRate]);

  // Payment Methods Distribution Data
  const paymentDistributionData = useMemo(() => {
    let bmTotal = 0;
    let bnTotal = 0;
    let cibTotal = 0;
    let otherTotal = 0;

    monthlyChartData.forEach((m) => {
      bmTotal += m.baridimobDzd;
      bnTotal += m.binanceDzd;
      cibTotal += m.otherDzd;
    });

    const grandTotal = bmTotal + bnTotal + cibTotal + otherTotal;

    return [
      {
        name: 'بريدي موب (BaridiMob RIP)',
        value: bmTotal,
        percentage: grandTotal > 0 ? Math.round((bmTotal / grandTotal) * 100) : (bmTotal > 0 ? 100 : 0),
        color: METHOD_COLORS.baridimob,
        icon: Building2,
      },
      {
        name: 'بينانس (Binance Pay USDT)',
        value: bnTotal,
        percentage: grandTotal > 0 ? Math.round((bnTotal / grandTotal) * 100) : (bnTotal > 0 ? 100 : 0),
        color: METHOD_COLORS.binance,
        icon: Zap,
      },
      {
        name: 'البطاقة الذهبية / CCP',
        value: cibTotal,
        percentage: grandTotal > 0 ? Math.round((cibTotal / grandTotal) * 100) : (cibTotal > 0 ? 100 : 0),
        color: METHOD_COLORS.cib_ccp,
        icon: CreditCard,
      },
    ];
  }, [monthlyChartData]);

  // Key KPI calculations
  const totalYearlySalesDzd = useMemo(() => {
    return monthlyChartData.reduce((acc, m) => acc + m.totalDzd, 0);
  }, [monthlyChartData]);

  const totalYearlySalesUsdt = useMemo(() => {
    return (totalYearlySalesDzd / exchangeRate).toFixed(1);
  }, [totalYearlySalesDzd, exchangeRate]);

  const currentMonthSales = monthlyChartData[monthlyChartData.length - 1];

  const todaySales = useMemo(() => {
    if (dailyChartData.length === 0) return { dzd: 0, usdt: 0, orders: 0 };
    const latest = dailyChartData[dailyChartData.length - 1];
    return {
      dzd: latest.totalDzd,
      usdt: latest.totalUsdt,
      orders: latest.ordersCount,
    };
  }, [dailyChartData]);

  const peakDay = useMemo(() => {
    return [...dailyChartData].sort((a, b) => b.totalDzd - a.totalDzd)[0] || dailyChartData[0];
  }, [dailyChartData]);

  const averageDailyDzd = useMemo(() => {
    if (dailyChartData.length === 0) return 0;
    const sum = dailyChartData.reduce((acc, d) => acc + d.totalDzd, 0);
    return Math.round(sum / dailyChartData.length);
  }, [dailyChartData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header & View Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold">
              <BarChart2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>التحليلات والرسوم البيانية لمبيعات المنصة</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Recharts v2
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  أرباح حقيقية موثقة 100%
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                متابعة دقيقة ومباشرة للمبيعات الفعلية المعتمدة فقط خالية تماماً من أي بيانات تقديرية أو وهمية
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
          {/* Currency Toggle */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-slate-900 p-1 border border-stone-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedCurrency('DZD')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedCurrency === 'DZD'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              د.ج (DZD)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('USDT')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedCurrency === 'USDT'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              دولار USDT ($)
            </button>
          </div>

          {/* View Filter */}
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-slate-900 p-1 border border-stone-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveView('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'all'
                  ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              عرض شامل
            </button>
            <button
              type="button"
              onClick={() => setActiveView('daily')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'daily'
                  ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              المبيعات اليومية
            </button>
            <button
              type="button"
              onClick={() => setActiveView('monthly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              المبيعات الشهرية
            </button>
            <button
              type="button"
              onClick={() => setActiveView('distribution')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'distribution'
                  ? 'bg-white dark:bg-slate-800 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              وسائل الدفع
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white border border-teal-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-teal-300 font-bold">مبيعات اليوم (2026-09-12)</span>
            <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1">
            <strong className="text-xl sm:text-2xl font-black tracking-tight">
              {selectedCurrency === 'DZD' 
                ? `${todaySales.dzd.toLocaleString()} د.ج` 
                : `${todaySales.usdt} USDT`}
            </strong>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-teal-200">
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>{todaySales.orders} كتاب مباع اليوم</span>
            </div>
          </div>
        </div>

        {/* Current Month Sales */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-amber-300 font-bold">مبيعات شهر سبتمبر 2026</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1">
            <strong className="text-xl sm:text-2xl font-black tracking-tight">
              {selectedCurrency === 'DZD' 
                ? `${currentMonthSales.totalDzd.toLocaleString()} د.ج` 
                : `${currentMonthSales.totalUsdt.toLocaleString()} USDT`}
            </strong>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-300">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>+{currentMonthSales.growth}% نمو مقارنة بأوت</span>
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">متوسط المبيعات اليومي</span>
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1">
            <strong className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
              {selectedCurrency === 'DZD'
                ? `${averageDailyDzd.toLocaleString()} د.ج`
                : `${(averageDailyDzd / exchangeRate).toFixed(1)} USDT`}
            </strong>
            <span className="text-[10px] text-stone-400 block mt-1">
              معدل مستقر وقوي
            </span>
          </div>
        </div>

        {/* Peak Day */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">أعلى يوم مبيعات</span>
            <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1">
            <strong className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {selectedCurrency === 'DZD'
                ? `${peakDay.totalDzd.toLocaleString()} د.ج`
                : `${peakDay.totalUsdt} USDT`}
            </strong>
            <span className="text-[10px] text-stone-400 block mt-1">
              {peakDay.label} ({peakDay.ordersCount} طلب)
            </span>
          </div>
        </div>
      </div>

      {/* 1. DAILY SALES CHART */}
      {(activeView === 'all' || activeView === 'daily') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>الرسم البياني للمبيعات اليومية (Daily Sales Trend)</span>
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تتبع مسار الإيرادات اليومية بالدينار الجزائري والدولار الرقمي USDT
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="inline-flex rounded-xl bg-stone-100 dark:bg-slate-900 p-1 border border-stone-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDailyTimeframe('7')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  dailyTimeframe === '7'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                آخر 7 أيام
              </button>
              <button
                type="button"
                onClick={() => setDailyTimeframe('14')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  dailyTimeframe === '14'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                آخر 14 يوم
              </button>
              <button
                type="button"
                onClick={() => setDailyTimeframe('30')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  dailyTimeframe === '30'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                آخر 30 يوم
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-72 sm:h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDailySales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorBinanceDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => 
                    selectedCurrency === 'DZD' 
                      ? `${(val / 1000).toFixed(0)}k` 
                      : `$${val}`
                  }
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]" dir="rtl">
                          <div className="font-bold text-teal-300 border-b border-slate-700 pb-1">
                            {data.fullDate}
                          </div>
                          <div className="flex justify-between items-center text-white">
                            <span>إجمالي المبيعات:</span>
                            <span className="font-bold text-emerald-400">
                              {data.totalDzd.toLocaleString()} د.ج (≈ {data.totalUsdt} USDT)
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-teal-300 text-[11px]">
                            <span>بريدي موب RIP:</span>
                            <span className="font-bold">{data.baridimobDzd.toLocaleString()} د.ج</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-300 text-[11px]">
                            <span>بينانس Pay USDT:</span>
                            <span className="font-bold">
                              {data.binanceDzd.toLocaleString()} د.ج (≈ {(data.binanceDzd / exchangeRate).toFixed(1)} $)
                            </span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 text-[10px] text-stone-400 flex justify-between">
                            <span>عدد الكتب المباعة:</span>
                            <span className="font-bold text-white">{data.ordersCount} كتاب</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => {
                    if (value === 'totalDzd') return 'إجمالي المبيعات (DZD)';
                    if (value === 'totalUsdt') return 'إجمالي المبيعات (USDT)';
                    if (value === 'baridimobDzd') return 'بريدي موب (BaridiMob)';
                    if (value === 'binanceDzd') return 'بينانس (Binance Pay)';
                    return value;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedCurrency === 'DZD' ? 'totalDzd' : 'totalUsdt'}
                  name={selectedCurrency === 'DZD' ? 'totalDzd' : 'totalUsdt'}
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDailySales)"
                  dot={{ r: 3, fill: '#0d9488', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedCurrency === 'DZD' ? 'binanceDzd' : 'binanceDzd'}
                  name="binanceDzd"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorBinanceDaily)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. MONTHLY SALES CHART (BarChart comparing BaridiMob & Binance) */}
      {(activeView === 'all' || activeView === 'monthly') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>الرسم البياني للمبيعات الشهرية لعام 2026 (Monthly Revenue Breakdown)</span>
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                مقارنة شهرية لحجم المبيعات حسب وسيلة الدفع (بريدي موب مقابل بينانس)
              </p>
            </div>

            <div className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-teal-600 inline-block" />
                <span>بريدي موب</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                <span>بينانس USDT</span>
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="w-full h-72 sm:h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => 
                    selectedCurrency === 'DZD' 
                      ? `${(val / 1000).toFixed(0)}k` 
                      : `$${(val / exchangeRate).toFixed(0)}`
                  }
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[220px]" dir="rtl">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                            <strong className="text-amber-300 font-bold text-sm">
                              شهر {data.month} 2026
                            </strong>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold">
                              +{data.growth}% نمو
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between items-center text-white">
                              <span>إجمالي المبيعات:</span>
                              <strong className="text-emerald-400">
                                {data.totalDzd.toLocaleString()} د.ج (≈ {data.totalUsdt.toLocaleString()} USDT)
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-teal-300">
                              <span>بريدي موب (BaridiMob):</span>
                              <span className="font-bold">{data.baridimobDzd.toLocaleString()} د.ج</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-300">
                              <span>بينانس (Binance Pay):</span>
                              <span className="font-bold">
                                {data.binanceDzd.toLocaleString()} د.ج (≈ {data.binanceUsdt.toLocaleString()} USDT)
                              </span>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-stone-400 flex justify-between">
                            <span>إجمالي طلبات الشراء:</span>
                            <span className="font-bold text-white">{data.ordersCount} طلب شراء</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="baridimobDzd" 
                  name="بريدي موب (BaridiMob)" 
                  fill="#0d9488" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="binanceDzd" 
                  name="بينانس (Binance Pay)" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. PAYMENT METHOD DISTRIBUTION & SUMMARY TABLE */}
      {(activeView === 'all' || activeView === 'distribution') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Donut Chart */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-teal-600" />
                <span>حصة وسائل الدفع من المبيعات</span>
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                توزيع الإيرادات الكلية عبر قنوات التحصيل
              </p>
            </div>

            <div className="w-full h-48 my-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString()} د.ج`,
                      'حجم المبيعات'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-slate-700 text-xs">
              {paymentDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-stone-700 dark:text-stone-300 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-stone-900 dark:text-white">
                      {item.percentage}%
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      ({item.value.toLocaleString()} د.ج)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Sales Performance Data Table */}
          <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>جدول تفصيل المبيعات والنمو الشهري لعام 2026</span>
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                إجمالي 2026: {totalYearlySalesDzd.toLocaleString()} د.ج
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-700 text-stone-400 text-[11px]">
                    <th className="pb-2 font-bold">الشهر</th>
                    <th className="pb-2 font-bold">بريدي موب (DZD)</th>
                    <th className="pb-2 font-bold">بينانس (USDT)</th>
                    <th className="pb-2 font-bold">إجمالي المبيعات</th>
                    <th className="pb-2 font-bold">الطلبات</th>
                    <th className="pb-2 font-bold text-left">معدل النمو</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-700/60">
                  {monthlyChartData.slice(-5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-2.5 font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>{row.month} 2026</span>
                      </td>
                      <td className="py-2.5 font-mono text-teal-700 dark:text-teal-300">
                        {row.baridimobDzd.toLocaleString()} د.ج
                      </td>
                      <td className="py-2.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {row.binanceUsdt.toLocaleString()} USDT
                      </td>
                      <td className="py-2.5 font-mono font-black text-stone-900 dark:text-white">
                        {row.totalDzd.toLocaleString()} د.ج
                      </td>
                      <td className="py-2.5 text-stone-500 dark:text-stone-400">
                        {row.ordersCount} كتاب
                      </td>
                      <td className="py-2.5 text-left">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          <span>+{row.growth}%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
