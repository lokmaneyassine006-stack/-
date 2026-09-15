import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PackageX,
  PackagePlus,
  PackageCheck,
  TrendingDown,
  TrendingUp,
  Zap,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Filter,
  Search,
  ShieldAlert,
  BellRing,
  Boxes,
  Percent,
  ChevronDown,
  ChevronUp,
  Eye,
  Info
} from 'lucide-react';
import { Book, SaleTransaction, StoreCustomization } from '../types';

interface SmartBookInventoryAlertsProps {
  books: Book[];
  transactions: SaleTransaction[];
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  updateBookPrice?: (bookId: string, newPriceDzd: number) => void;
  customization?: StoreCustomization;
}

export type AlertFilterCategory = 'all' | 'critical' | 'low_stock' | 'slow_sales' | 'healthy';

export const SmartBookInventoryAlerts: React.FC<SmartBookInventoryAlertsProps> = ({
  books,
  transactions,
  updateBook,
  updateBookPrice,
  customization
}) => {
  const [filterCategory, setFilterCategory] = useState<AlertFilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [editingThresholdBookId, setEditingThresholdBookId] = useState<string | null>(null);
  const [customThresholdVal, setCustomThresholdVal] = useState<number>(8);
  const [customAddStockBookId, setCustomAddStockBookId] = useState<string | null>(null);
  const [customAddStockVal, setCustomAddStockVal] = useState<number>(15);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Global default low stock threshold
  const DEFAULT_LOW_STOCK_THRESHOLD = 8;

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // Analyze book sales from transactions over the past 30 days / current month
  const salesAnalysis = useMemo(() => {
    const bookSalesMap = new Map<string, { count: number; revenueDzd: number }>();
    
    // Filter completed book sales
    const completedPurchases = transactions.filter(
      (t) => t.status === 'completed' && t.type !== 'withdrawal' && t.amountDzd > 0
    );

    completedPurchases.forEach((tx) => {
      const bId = tx.bookId || 'book-owner-1';
      const existing = bookSalesMap.get(bId) || { count: 0, revenueDzd: 0 };
      existing.count += 1;
      existing.revenueDzd += tx.amountDzd || 0;
      bookSalesMap.set(bId, existing);
    });

    return bookSalesMap;
  }, [transactions]);

  // Generate Smart Alerts for each book
  const analyzedBooks = useMemo(() => {
    return books.map((book) => {
      const stock = book.stockCount ?? 15;
      const threshold = book.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
      const salesInfo = salesAnalysis.get(book.id) || { count: 0, revenueDzd: 0 };
      const periodSales = salesInfo.count;

      // Calculate estimated days until stockout if velocity > 0
      const dailyVelocity = periodSales > 0 ? periodSales / 30 : 0;
      const daysUntilStockout = dailyVelocity > 0 ? Math.round(stock / dailyVelocity) : 999;

      // Determine alert flags
      const isOutOfStock = stock === 0;
      const isCriticalLow = stock > 0 && stock <= 3;
      const isLowStock = stock > 3 && stock <= threshold;
      const isFastDepleting = stock > 0 && daysUntilStockout <= 7 && dailyVelocity >= 0.3;
      const isSlowMoving = periodSales <= 1 && stock > 0;
      const isHealthy = stock > threshold && periodSales >= 2;

      // Determine primary severity category
      let severity: 'critical' | 'warning' | 'info' | 'healthy' = 'healthy';
      let alertTitle = 'رصيد ومبيعات مستقرة';
      let alertDescription = 'مستوى الرصيد آمن وحركة المبيعات جارية بصورة متوازنة.';
      let recommendedAction = 'المخزون متوفر بنجاح، لا يتطلب تدخلاً عاجلاً.';

      if (isOutOfStock) {
        severity = 'critical';
        alertTitle = 'نفاد المخزون بالكامل (0 نسخة)';
        alertDescription = 'الكتاب غير متاح للشراء الفوري حالياً. يتطلب تزويداً عاجلاً بالنسخ لتفادي خسارة المبيعات.';
        recommendedAction = 'إعادة تزويد الرصيد فوراً (+15 إلى +30 نسخة) لاستعادة التوفر فوراً.';
      } else if (isCriticalLow) {
        severity = 'critical';
        alertTitle = `رصيد حرج جداً (متبقي ${stock} نسخ فقط)`;
        alertDescription = 'الرصيد شارف على النفاد التام. أي طلب جديد قد يسبب انقطاع التوفر.';
        recommendedAction = 'تزويد فوري بما لا يقل عن 10 نسخ لضمان استمرارية البيع.';
      } else if (isFastDepleting) {
        severity = 'warning';
        alertTitle = `طلب متسارع (الرصيد سينفد خلال ~${daysUntilStockout} أيام)`;
        alertDescription = `معدل المبيعات الحالي (${periodSales} نسخة/شهر) يفوق سعة الرصيد المتبقي (${stock} نسخ).`;
        recommendedAction = 'رفع المخزون مبكراً لمواكبة وتيرة الطلب التصاعدية.';
      } else if (isLowStock) {
        severity = 'warning';
        alertTitle = `تنبيه انخفاض الرصيد (متبقي ${stock} من أصل حد ${threshold})`;
        alertDescription = `الرصيد يقترب من الحد الأدنى المعين (${threshold} نسخ).`;
        recommendedAction = 'جدولة طلب طباعة أو تزويد دفعة نسخ إضافية.';
      } else if (isSlowMoving) {
        severity = 'info';
        alertTitle = `ركود المبيعات (${periodSales === 0 ? 'لا توجد مبيعات' : 'مبيعة واحدة فقط'} مؤخراً)`;
        alertDescription = `الكتاب يمتلك رصيداً (${stock} نسخة) مع تدني معدل الشراء.`;
        recommendedAction = 'تخفيض السعر مؤقتاً أو تفعيل عرض ترويجي أو إبرازه في الصفحة الرئيسية.';
      }

      return {
        ...book,
        stock,
        threshold,
        periodSales,
        periodRevenueDzd: salesInfo.revenueDzd,
        dailyVelocity,
        daysUntilStockout,
        isOutOfStock,
        isCriticalLow,
        isLowStock,
        isFastDepleting,
        isSlowMoving,
        isHealthy,
        severity,
        alertTitle,
        alertDescription,
        recommendedAction,
        isDismissed: dismissedAlertIds.includes(book.id)
      };
    });
  }, [books, salesAnalysis, DEFAULT_LOW_STOCK_THRESHOLD, dismissedAlertIds]);

  // Overall Availability & Health Statistics
  const healthStats = useMemo(() => {
    const total = analyzedBooks.length;
    if (total === 0) return { healthScore: 100, outOfStockCount: 0, lowStockCount: 0, slowMovingCount: 0, healthyCount: 0 };

    const outOfStockCount = analyzedBooks.filter((b) => b.isOutOfStock).length;
    const lowStockCount = analyzedBooks.filter((b) => b.isCriticalLow || b.isLowStock).length;
    const slowMovingCount = analyzedBooks.filter((b) => b.isSlowMoving).length;
    const healthyCount = analyzedBooks.filter((b) => b.isHealthy).length;
    const criticalCount = outOfStockCount + analyzedBooks.filter((b) => b.isCriticalLow).length;

    // Health score: 100 minus penalty for out of stock (-25 each) and low stock (-10 each)
    const penalty = (outOfStockCount * 25) + (lowStockCount * 10) + (slowMovingCount * 3);
    const healthScore = Math.max(15, Math.min(100, 100 - Math.round((penalty / total) * 1.8)));

    return {
      total,
      outOfStockCount,
      lowStockCount,
      slowMovingCount,
      healthyCount,
      criticalCount,
      healthScore
    };
  }, [analyzedBooks]);

  // Filtered list based on active tab and search
  const filteredAlerts = useMemo(() => {
    return analyzedBooks.filter((item) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthor = item.author.toLowerCase().includes(q);
        const matchCategory = item.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchCategory) return false;
      }

      if (filterCategory === 'critical') {
        return item.isOutOfStock || item.isCriticalLow;
      }
      if (filterCategory === 'low_stock') {
        return item.isOutOfStock || item.isCriticalLow || item.isLowStock || item.isFastDepleting;
      }
      if (filterCategory === 'slow_sales') {
        return item.isSlowMoving;
      }
      if (filterCategory === 'healthy') {
        return item.isHealthy;
      }
      return true;
    });
  }, [analyzedBooks, filterCategory, searchQuery]);

  // Interactive Actions
  const handleQuickRestock = (bookId: string, addQty: number, bookTitle: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const currentStock = book.stockCount ?? 15;
    const newStock = currentStock + addQty;
    updateBook(bookId, { stockCount: newStock });
    showNotification(`تمت إضافة +${addQty} نسخة بنجاح لكتاب "${bookTitle}". الرصيد الجديد: ${newStock} نسخة.`);
    setCustomAddStockBookId(null);
  };

  const handleApplyDiscount = (bookId: string, currentPrice: number, bookTitle: string, discountPercent: number = 15) => {
    const discountedPrice = Math.round(currentPrice * (1 - discountPercent / 100));
    if (updateBookPrice) {
      updateBookPrice(bookId, discountedPrice);
    } else {
      updateBook(bookId, { priceDzd: discountedPrice });
    }
    showNotification(`تم تطبيق خصم ${discountPercent}% على كتاب "${bookTitle}" لتنشيط المبيعات! السعر الجديد: ${discountedPrice.toLocaleString()} د.ج.`);
  };

  const handleSaveThreshold = (bookId: string, bookTitle: string) => {
    updateBook(bookId, { lowStockThreshold: Math.max(1, customThresholdVal) });
    setEditingThresholdBookId(null);
    showNotification(`تم تحديث حد التنبيه الذكي لكتاب "${bookTitle}" إلى ${customThresholdVal} نسخ.`);
  };

  const toggleDismissAlert = (bookId: string) => {
    if (dismissedAlertIds.includes(bookId)) {
      setDismissedAlertIds((prev) => prev.filter((id) => id !== bookId));
      showNotification('تمت إعادة تفعيل التنبيه لهذا الكتاب.');
    } else {
      setDismissedAlertIds((prev) => [...prev, bookId]);
      showNotification('تم إخفاء هذا التنبيه مؤقتاً.');
    }
  };

  return (
    <div id="smart-book-inventory-alerts-section" className="space-y-4" dir="rtl">
      
      {/* Header Banner with Health Score & Quick Stats */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-amber-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-200/70 dark:border-slate-700">
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-bold shadow-sm flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-stone-900 dark:text-white">
                  نظام التنبيهات الذكية للمخزون ومبيعات الكتب
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                  مراقبة استمرارية التوفر 2026
                </span>
                {healthStats.criticalCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {healthStats.criticalCount} تنبيهات حرجة
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                تنبيهات استباقية عند اقتراب نفاد النسخ أو ركود المبيعات لضمان استمرارية توفر الكتب وتحقيق أعلى عائد تجاري.
              </p>
            </div>
          </div>

          {/* Availability Health Score Badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-stone-200 dark:border-slate-700 shadow-sm shrink-0 self-stretch md:self-auto justify-between md:justify-start">
            <div className="text-right">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">
                مؤشر استمرارية التوفر
              </span>
              <strong className={`text-base sm:text-lg font-black ${
                healthStats.healthScore >= 80 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : healthStats.healthScore >= 50 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {healthStats.healthScore}% {healthStats.healthScore >= 80 ? 'ممتاز' : healthStats.healthScore >= 50 ? 'متوسط' : 'حرج'}
              </strong>
            </div>

            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-inner" style={{
              background: healthStats.healthScore >= 80 
                ? 'linear-gradient(135deg, #10b981, #047857)' 
                : healthStats.healthScore >= 50 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                : 'linear-gradient(135deg, #ef4444, #b91c1c)'
            }}>
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
          
          {/* 1. Out of Stock */}
          <div 
            onClick={() => setFilterCategory('critical')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'critical'
                ? 'bg-rose-100/70 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 shadow-sm'
                : 'bg-white/80 dark:bg-slate-800/80 border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">نفاد الرصيد التام</span>
              <span className="p-1 rounded-lg bg-rose-500 text-white">
                <PackageX className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <strong className="text-xl font-black text-rose-900 dark:text-white">
                {healthStats.outOfStockCount}
              </strong>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">كتب متوقفة</span>
            </div>
          </div>

          {/* 2. Low Stock */}
          <div 
            onClick={() => setFilterCategory('low_stock')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'low_stock'
                ? 'bg-amber-100/70 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 shadow-sm'
                : 'bg-white/80 dark:bg-slate-800/80 border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">رصيد منخفض وشيك</span>
              <span className="p-1 rounded-lg bg-amber-500 text-stone-950">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <strong className="text-xl font-black text-amber-900 dark:text-white">
                {healthStats.lowStockCount}
              </strong>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">تحت حد الأمان</span>
            </div>
          </div>

          {/* 3. Slow Moving Sales */}
          <div 
            onClick={() => setFilterCategory('slow_sales')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'slow_sales'
                ? 'bg-indigo-100/70 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-sm'
                : 'bg-white/80 dark:bg-slate-800/80 border-indigo-200/80 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">ركود المبيعات</span>
              <span className="p-1 rounded-lg bg-indigo-500 text-white">
                <TrendingDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <strong className="text-xl font-black text-indigo-900 dark:text-white">
                {healthStats.slowMovingCount}
              </strong>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">تحتاج تنشيطاً</span>
            </div>
          </div>

          {/* 4. Healthy Books */}
          <div 
            onClick={() => setFilterCategory('healthy')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterCategory === 'healthy'
                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 shadow-sm'
                : 'bg-white/80 dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">توفر مستقر وصحي</span>
              <span className="p-1 rounded-lg bg-emerald-600 text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <strong className="text-xl font-black text-emerald-900 dark:text-white">
                {healthStats.healthyCount}
              </strong>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">مخزون وفير</span>
            </div>
          </div>

        </div>

      </div>

      {/* Success / Action feedback message */}
      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 text-[11px] font-mono cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-stone-100 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            كافة التنبيهات ({analyzedBooks.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'critical'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>حرجة ونافذة ({healthStats.outOfStockCount + analyzedBooks.filter(b => b.isCriticalLow).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('low_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'low_stock'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>انخفاض الرصيد ({healthStats.lowStockCount + healthStats.outOfStockCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('slow_sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'slow_sales'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>ركود المبيعات ({healthStats.slowMovingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('healthy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'healthy'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>توفر سليم ({healthStats.healthyCount})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[180px] sm:w-56">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن كتاب أو مؤلف..."
            className="w-full bg-white dark:bg-slate-900 pr-8 pl-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-teal-500"
          />
        </div>

      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-stone-300 dark:border-slate-700">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <strong className="block text-sm font-bold text-stone-800 dark:text-white">
              لا توجد تنبيهات مطابقة لهذا الفلتر
            </strong>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              كافة الكتب في هذه الفئة متوفرة بوضع تشغيلي مستقر.
            </p>
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isExpanded = expandedCardId === item.id;
            const isEditingThreshold = editingThresholdBookId === item.id;
            const isAddingCustomStock = customAddStockBookId === item.id;

            // Stock percentage relative to safety capacity (max of 30 or threshold * 2)
            const maxCap = Math.max(30, item.threshold * 2.5);
            const stockPct = Math.min(100, Math.round((item.stock / maxCap) * 100));

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                  item.isOutOfStock
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/80 shadow-sm'
                    : item.isCriticalLow
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 shadow-sm'
                    : item.isFastDepleting
                    ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800/80 shadow-sm'
                    : item.isSlowMoving
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                    : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                }`}
              >
                {/* Main Card Content */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  
                  {/* Book Info & Cover */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg object-cover shadow-sm shrink-0 border border-stone-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs sm:text-sm font-black text-stone-900 dark:text-white truncate block">
                          {item.title}
                        </strong>
                        {item.isOwnerBook && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            مؤلف المنصة
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-stone-300">
                          {item.category}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>المؤلف: <strong className="text-stone-700 dark:text-stone-200">{item.author}</strong></span>
                        <span>•</span>
                        <span>السعر: <strong className="font-mono text-teal-700 dark:text-teal-400">{item.priceDzd.toLocaleString()} د.ج</strong></span>
                      </div>

                      {/* Dynamic Alert Banner Tag */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                          item.isOutOfStock
                            ? 'bg-rose-600 text-white'
                            : item.isCriticalLow
                            ? 'bg-amber-500 text-stone-950'
                            : item.isFastDepleting
                            ? 'bg-orange-500 text-white'
                            : item.isLowStock
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300'
                            : item.isSlowMoving
                            ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300'
                        }`}>
                          {item.isOutOfStock && <PackageX className="w-3 h-3" />}
                          {item.isCriticalLow && <AlertCircle className="w-3 h-3" />}
                          {item.isFastDepleting && <Zap className="w-3 h-3" />}
                          {item.isLowStock && <AlertTriangle className="w-3 h-3" />}
                          {item.isSlowMoving && <TrendingDown className="w-3 h-3" />}
                          {item.isHealthy && <CheckCircle2 className="w-3 h-3" />}
                          <span>{item.alertTitle}</span>
                        </span>

                        <span className="text-[11px] text-stone-600 dark:text-stone-300">
                          {item.alertDescription}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Gauge & Quick Restock Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-2.5 md:pt-0 border-stone-200 dark:border-slate-700">
                    
                    {/* Stock Count Display */}
                    <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-stone-200 dark:border-slate-700 min-w-[120px] text-center">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1 font-medium">
                        <span>الرصيد المتوفر:</span>
                        <span>حد الأمان: {item.threshold}</span>
                      </div>
                      <div className="flex items-baseline justify-center gap-1">
                        <strong className={`text-xl font-black font-mono ${
                          item.stock === 0 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : item.stock <= item.threshold 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.stock}
                        </strong>
                        <span className="text-xs font-bold text-stone-500">نسخة</span>
                      </div>

                      {/* Mini visual progress bar */}
                      <div className="w-full h-1.5 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            item.stock === 0 
                              ? 'bg-rose-500 w-0' 
                              : item.stock <= 3 
                              ? 'bg-rose-500' 
                              : item.stock <= item.threshold 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stockPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Restock Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleQuickRestock(item.id, 10, item.title)}
                        title="إضافة 10 نسخ فوراً إلى المخزون"
                        className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>+10 نسخ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickRestock(item.id, 25, item.title)}
                        title="إضافة 25 نسخة فوراً إلى المخزون"
                        className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <span>+25</span>
                      </button>

                      {/* Expand / Details Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-700 dark:text-stone-200 transition-all cursor-pointer"
                        title={isExpanded ? 'إخفاء الخيارات' : 'خيارات إضافية'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Expanded Action Panel for Deep Inventory Control */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-stone-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    
                    {/* Recommended Smart Action Box */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs">
                        <strong className="text-stone-900 dark:text-white block font-bold">
                          التوصية الذكية لاستمرارية التوفر:
                        </strong>
                        <p className="text-stone-600 dark:text-stone-300 mt-0.5">
                          {item.recommendedAction}
                        </p>
                      </div>

                      {/* If Slow Moving, offer instant 15% discount button */}
                      {item.isSlowMoving && (
                        <button
                          type="button"
                          onClick={() => handleApplyDiscount(item.id, item.priceDzd, item.title, 15)}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
                        >
                          <Percent className="w-3 h-3" />
                          <span>خصم 15% لتنشيط المبيعات</span>
                        </button>
                      )}
                    </div>

                    {/* Custom Controls Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      
                      {/* Left side actions: Custom Add Stock & Custom Threshold */}
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* Custom Stock Quantity Input */}
                        {isAddingCustomStock ? (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-teal-500 shadow-sm">
                            <span className="text-[10px] text-stone-500 px-1 font-bold">إضافة نسخ:</span>
                            <input
                              type="number"
                              min="1"
                              max="500"
                              value={customAddStockVal}
                              onChange={(e) => setCustomAddStockVal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-16 px-1.5 py-0.5 text-center text-xs font-mono font-bold bg-stone-100 dark:bg-slate-800 rounded border border-stone-300 dark:border-slate-600 text-stone-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickRestock(item.id, customAddStockVal, item.title)}
                              className="px-2 py-0.5 rounded bg-teal-700 text-white font-bold text-[11px] cursor-pointer hover:bg-teal-800"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomAddStockBookId(null)}
                              className="px-1.5 py-0.5 text-stone-400 hover:text-stone-600 text-[11px] cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomAddStockBookId(item.id);
                              setCustomAddStockVal(20);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <PackagePlus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>تزويد برقم مخصص...</span>
                          </button>
                        )}

                        {/* Custom Low Stock Threshold Setting */}
                        {isEditingThreshold ? (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-amber-500 shadow-sm">
                            <span className="text-[10px] text-stone-500 px-1 font-bold">حد التنبيه:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={customThresholdVal}
                              onChange={(e) => setCustomThresholdVal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-14 px-1.5 py-0.5 text-center text-xs font-mono font-bold bg-stone-100 dark:bg-slate-800 rounded border border-stone-300 dark:border-slate-600 text-stone-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveThreshold(item.id, item.title)}
                              className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[11px] cursor-pointer hover:bg-amber-700"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingThresholdBookId(null)}
                              className="px-1.5 py-0.5 text-stone-400 hover:text-stone-600 text-[11px] cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingThresholdBookId(item.id);
                              setCustomThresholdVal(item.threshold);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-700 dark:text-stone-200 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>تعديل حد التنبيه ({item.threshold})</span>
                          </button>
                        )}

                      </div>

                      {/* Right side helper info */}
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-3">
                        <span>إجمالي مبيعات الشهر: <strong className="font-mono text-stone-800 dark:text-white">{item.periodSales} مبيعة</strong></span>
                        <span>•</span>
                        <span>الإيراد المسجل: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{item.periodRevenueDzd.toLocaleString()} د.ج</strong></span>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
