import React, { useState, useEffect } from 'react';
import { 
  X, LayoutDashboard, Settings, ShieldCheck, DollarSign, 
  BookOpen, Users, Save, RefreshCw, AlertTriangle, Check, 
  CreditCard, Sparkles, Building2, Zap, BarChart3,
  Crown, Infinity, Gift, Copy, CheckCheck, Clock, Download,
  ArrowUpRight, Timer, Layers, Loader2, CheckCircle2, XCircle,
  MessageSquare, Send, ExternalLink, RotateCcw,
  Calendar, CalendarDays, TrendingUp, ShieldAlert, Boxes, MapPin
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyToClipboard } from '../utils/clipboard';
import { generateSalesReceiptPDF } from '../utils/pdfGenerator';
import { WithdrawalRequest } from '../types';
import { SalesAnalyticsCharts } from './SalesAnalyticsCharts';
import { MonthlyBookSalesChart, AnalyticsTimeframe } from './MonthlyBookSalesChart';
import { SmartBookInventoryAlerts } from './SmartBookInventoryAlerts';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ onClose }) => {
  const { 
    books, 
    updateBook,
    updateBookPrice,
    customization, 
    updateCustomization, 
    paymentAccounts, 
    updatePaymentAccounts, 
    transactions, 
    completeTransaction,
    smsNotifications,
    sendBaridimobSms,
    setActiveSmsModal,
    forumPosts, 
    reviews, 
    currentUser,
    switchUserRole,
    giftCards,
    redeemGiftCard,
    generateGiftCardVoucher,
    withdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    resetWalletToRealProfits,
    resetEntireSiteExceptRealProfits,
    publisherMessages,
    publisherProfiles,
    replyToPublisherMessage
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'payment_accounts' | 'withdrawals' | 'vouchers' | 'security' | 'sms' | 'inventory_alerts' | 'publisher_messages'>('stats');
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
  const [adminResetMsg, setAdminResetMsg] = useState<string | null>(null);
  const [isAdminResetting, setIsAdminResetting] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<AnalyticsTimeframe>('monthly');

  // Publisher Messages Filters & Reply State
  const [publisherFilter, setPublisherFilter] = useState<string>('all');
  const [publisherStatusFilter, setPublisherStatusFilter] = useState<string>('all');
  const [adminReplyTargetId, setAdminReplyTargetId] = useState<string | null>(null);
  const [adminReplyContent, setAdminReplyContent] = useState<string>('');

  const lowStockAlertCount = books.filter(
    (b) => (b.stockCount ?? 15) <= (b.lowStockThreshold ?? 8)
  ).length;

  const handleAdminResetRealProfits = () => {
    setIsAdminResetting(true);
    try {
      const res = resetWalletToRealProfits();
      setAdminResetMsg(res.message);
      setTimeout(() => setAdminResetMsg(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdminResetting(false);
    }
  };

  const handleAdminResetEntireSite = () => {
    if (!window.confirm('هل أنت متأكد من إعادة تعيين كامل بيانات وأقسام الموقع إلى الحالة الافتراضية مع الحفاظ على الأرباح الحقيقية (3,600 د.ج)؟')) {
      return;
    }
    setIsAdminResetting(true);
    try {
      const res = resetEntireSiteExceptRealProfits();
      setAdminResetMsg(res.message);
      setTimeout(() => setAdminResetMsg(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdminResetting(false);
    }
  };

  // 1-second ticker for live countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // New Voucher Creation State
  const [newVoucherUsdt, setNewVoucherUsdt] = useState('100');
  const [newVoucherIsInfinite, setNewVoucherIsInfinite] = useState(true);
  const [newVoucherOwnerOnly, setNewVoucherOwnerOnly] = useState(true);
  const [newVoucherDesc, setNewVoucherDesc] = useState('قسيمة شحن لانهائية خاصة برئيس ومالك المنصة');

  // Customization Form
  const [storeName, setStoreName] = useState(customization?.storeName || '');
  const [storeTagline, setStoreTagline] = useState(customization?.storeTagline || '');
  const [presidentName, setPresidentName] = useState(customization?.presidentName || '');
  const [exchangeRate, setExchangeRate] = useState((customization?.exchangeRateUsdtToDzd || 240).toString());
  const [commissionRate, setCommissionRate] = useState((customization?.platformCommissionPercent || 10).toString());
  const [mandatoryOwnerPurchase, setMandatoryOwnerPurchase] = useState(customization?.mandatoryOwnerBookPurchaseForPromotion ?? true);

  // Payment Accounts Form
  const [baridiRip, setBaridiRip] = useState(paymentAccounts?.baridimobRip || '00799999002847192033');
  const [baridiHolder, setBaridiHolder] = useState(paymentAccounts?.baridimobHolder || 'LOKMANE YASSINE ABAKHTI (لقمان ياسين أبختي)');
  const [baridimobPhone, setBaridimobPhone] = useState(paymentAccounts?.baridimobPhone || '0652206947');
  const [truecallerNumber, setTruecallerNumber] = useState(paymentAccounts?.truecallerNumber || '652206947');
  const [truecallerCallerIdName, setTruecallerCallerIdName] = useState(paymentAccounts?.truecallerCallerIdName || 'لقمان ياسين أبختي | Lokmane Yassine Abakhti (BaridiMob Verified)');
  const [truecallerVerified, setTruecallerVerified] = useState(paymentAccounts?.truecallerVerified ?? true);
  const [binanceTrc, setBinanceTrc] = useState(paymentAccounts?.binanceTrc20 || '');
  const [binanceBep, setBinanceBep] = useState(paymentAccounts?.binanceBep20 || '');
  const [binancePayId, setBinancePayId] = useState(paymentAccounts?.binancePayId || '');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Computed Analytics
  const totalSalesDzd = transactions
    .filter((t) => t.type === 'book_purchase' || (t.status === 'completed' && (t.amountDzd || 0) > 0 && t.type !== 'withdrawal'))
    .reduce((sum, t) => sum + (t.amountDzd || 0), 0);
  const totalSalesUsdt = totalSalesDzd / (customization?.exchangeRateUsdtToDzd || 240);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomization({
      storeName,
      storeTagline,
      presidentName,
      exchangeRateUsdtToDzd: Number(exchangeRate) || 240,
      platformCommissionPercent: Number(commissionRate) || 10,
      mandatoryOwnerBookPurchaseForPromotion: mandatoryOwnerPurchase,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentAccounts({
      baridimobRip: baridiRip,
      baridimobHolder: baridiHolder,
      baridimobPhone: baridimobPhone,
      truecallerNumber: truecallerNumber,
      truecallerCallerIdName: truecallerCallerIdName,
      truecallerVerified: truecallerVerified,
      binanceTrc20: binanceTrc,
      binanceBep20: binanceBep,
      binancePayId: binancePayId,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Luxury Platinum styling */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-stone-900 dark:text-white">
                  لوحة تحكم وإدارة المنصة العليا
                </h3>
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  صلاحيات المالك: لقمان ياسين أبختي
                </span>
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                إحصائيات المبيعات، ضبط الأسعار والعملات، إدارة الحسابات البنكية ومفاتيح بينانس
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>الإحصائيات والرسوم البيانية (مبيعات يومية وشهرية)</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory_alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'inventory_alerts'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm font-black'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>تنبيهات المخزون والمبيعات</span>
            {lowStockAlertCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono font-black animate-pulse">
                {lowStockAlertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>تخصيص هوية المتجر والعمولات</span>
          </button>
          <button
            onClick={() => setActiveTab('payment_accounts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'payment_accounts'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>حسابات بريدي موب وبينانس</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>طلبات السحب ({withdrawals.filter(w => w.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'sms'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>رسائل بريدي موب SMS ({smsNotifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('publisher_messages')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'publisher_messages'
                ? 'bg-teal-700 text-white shadow-sm font-black'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>فضاء وتواصل دور النشر ({publisherMessages.length})</span>
            {publisherMessages.filter((m) => m.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono font-black animate-pulse">
                {publisherMessages.filter((m) => m.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'vouchers'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-sm font-black'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>قسائم المالك اللانهائية (∞ VIP)</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مركز الأمان السيبراني والتوثيق</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>تم حفظ وتحديث الإعدادات بنجاح في النظام!</span>
            </div>
          )}

          {/* TAB 1: LIVE ANALYTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800/80 border border-teal-200 dark:border-slate-700">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">إجمالي الكتب المنشورة</span>
                  <strong className="text-2xl font-black text-teal-800 dark:text-teal-300">{books.length}</strong>
                  <span className="text-[10px] text-teal-600 block mt-1">تحديث لحظي</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">إجمالي المبيعات (DZD)</span>
                  <strong className="text-xl font-black text-amber-800 dark:text-amber-300">{totalSalesDzd.toLocaleString()} د.ج</strong>
                  <span className="text-[10px] text-amber-600 block mt-1">≈ {(totalSalesUsdt || 0).toFixed(1)} USDT</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">التقييمات والمراجعات</span>
                  <strong className="text-2xl font-black text-indigo-800 dark:text-indigo-300">{reviews.length}</strong>
                  <span className="text-[10px] text-indigo-600 block mt-1">مفلترة أخلاقياً</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">مواضيع المنتدى</span>
                  <strong className="text-2xl font-black text-emerald-800 dark:text-emerald-300">{forumPosts.length}</strong>
                  <span className="text-[10px] text-emerald-600 block mt-1">نقاشات حوارية</span>
                </div>
              </div>

              {/* Real Profits Verification & Reset Control */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 dark:border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span>إدارة تدقيق الأرباح الحقيقية وإزالة الأرباح الوهمية</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        معتمد 100%
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      رصيد الخزينة الحالي ({currentUser.walletDzd.toLocaleString()} د.ج) يعكس حصرياً مبيعات كتاب &quot;معا نحو التغيير&quot; الحقيقية دون أي تضخيم.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handleAdminResetRealProfits}
                    disabled={isAdminResetting}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAdminResetting ? 'animate-spin' : ''}`} />
                    <span>ضبط المحفظة للأرباح الحقيقية</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAdminResetEntireSite}
                    disabled={isAdminResetting}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="إعادة تعيين كافة أقسام وبيانات الموقع مع الإبقاء على الأرباح الحقيقية"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isAdminResetting ? 'animate-spin' : ''}`} />
                    <span>إعادة تعيين كل شيء في الموقع (ما عدا الأرباح)</span>
                  </button>
                </div>
              </div>

              {adminResetMsg && (
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{adminResetMsg}</span>
                </div>
              )}

              {/* SMART BOOK INVENTORY & SALES ALERTS SECTION */}
              <SmartBookInventoryAlerts
                books={books}
                transactions={transactions}
                updateBook={updateBook}
                updateBookPrice={updateBookPrice}
                customization={customization}
              />

              {/* Chart Timeframe Selector Interface (أسبوعي، شهري، سنوي) */}
              <div 
                id="admin-analytics-timeframe-bar" 
                className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-stone-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-teal-200/70 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-700 text-white shadow-sm flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">
                          تحديد الفترة الزمنية لتحليل المبيعات:
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300/60 dark:border-teal-800">
                          {chartTimeframe === 'weekly' && 'الفترة المعروضة: أسبوعي (آخر 7 أيام)'}
                          {chartTimeframe === 'monthly' && 'الفترة المعروضة: شهري (الشهر الحالي)'}
                          {chartTimeframe === 'yearly' && 'الفترة المعروضة: سنوي (عام 2026)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {chartTimeframe === 'weekly' && 'تتبع دقيق لحركة مبيعات الكتب يوماً بيوم في الأسبوع الأخير لقياس التفاعل اللحظي'}
                        {chartTimeframe === 'monthly' && 'تحليل شامل ومفصل لمسار مبيعات الكتب وحصتها السوقية على مدار أيام الشهر'}
                        {chartTimeframe === 'yearly' && 'نظرة شمولية استراتيجية لأداء الكتب وتطور الإيرادات عبر كافة أشهر عام 2026'}
                      </p>
                    </div>
                  </div>

                  {/* Period Switcher Segmented Control */}
                  <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-stone-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center">
                    <button
                      type="button"
                      id="btn-timeframe-weekly"
                      onClick={() => setChartTimeframe('weekly')}
                      className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        chartTimeframe === 'weekly'
                          ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>أسبوعي</span>
                    </button>

                    <button
                      type="button"
                      id="btn-timeframe-monthly"
                      onClick={() => setChartTimeframe('monthly')}
                      className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        chartTimeframe === 'monthly'
                          ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>شهري</span>
                    </button>

                    <button
                      type="button"
                      id="btn-timeframe-yearly"
                      onClick={() => setChartTimeframe('yearly')}
                      className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        chartTimeframe === 'yearly'
                          ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-sm'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>سنوي</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recharts Monthly Book Sales Chart with timeframe support */}
              <MonthlyBookSalesChart
                books={books}
                transactions={transactions}
                customization={customization}
                timeframe={chartTimeframe}
                onTimeframeChange={setChartTimeframe}
              />

              {/* Recharts Sales Analytics: Daily, Monthly, and Payment Distribution */}
              <SalesAnalyticsCharts 
                transactions={transactions} 
                customization={customization} 
              />

              {/* Recent Transactions in store */}
              <div className="bg-stone-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-stone-900 dark:text-white">أحدث عمليات الشراء والتحويل المالي بالمتجر</h4>
                <div className="space-y-2">
                  {transactions.slice(0, 4).map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-stone-900 dark:text-white">{t.description || t.bookTitle || 'معاملة شراء كتاب'}</strong>
                        <span className="text-[10px] font-mono text-stone-400">{t.date || t.timestamp || '2026-09'} • {t.method.toUpperCase()}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {t.amountDzd.toLocaleString()} د.ج
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SMART BOOK INVENTORY & SALES ALERTS (DEDICATED FULL VIEW) */}
          {activeTab === 'inventory_alerts' && (
            <div className="space-y-6">
              <SmartBookInventoryAlerts
                books={books}
                transactions={transactions}
                updateBook={updateBook}
                updateBookPrice={updateBookPrice}
                customization={customization}
              />
            </div>
          )}

          {/* TAB 2: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">اسم المكتبة والمنصة</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">اسم رئيس ومؤسس المنصة</label>
                  <input
                    type="text"
                    value={presidentName}
                    onChange={(e) => setPresidentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">الشعار والرسالة الفكرية</label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">سعر صرف USDT مقابل الدينار (1 USDT = ? DZD)</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">نسبة عمولة المنصة من مبيعات الناشرين (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Mandatory Owner Book Purchase for Promotion Tool Control */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-teal-50 dark:from-amber-950/20 dark:to-teal-950/20 border border-amber-300 dark:border-amber-700/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">
                      أداة الشراء الإجباري لكتب المالك لتفعيل الترويج
                    </h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      إلزام المستخدمين والمروجين باقتناء أحد مؤلفات المالك (أ. لقمان ياسين أبختي) قبل فتح أدوات وروابط الترويج والأرباح التشاركية
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={mandatoryOwnerPurchase}
                    onChange={(e) => setMandatoryOwnerPurchase(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md cursor-pointer transition-all"
              >
                حفظ تعديلات المنصة
              </button>

              {/* Danger Zone: Full site reset preserving real profits */}
              <div className="mt-6 p-4 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <h4 className="font-bold text-xs">إعادة ضبط شاملة لبيانات الموقع</h4>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  تتيح لك إعادة ضبط كافة أقسام وبيانات الموقع (الكتب، المراجعات، منشورات المنتدى، والسلات) إلى الحالة الأصلية الافتراضية مع <strong>الحفاظ الكامل على الأرباح الحقيقية فقط (3,600 د.ج)</strong> وإزالة أي بيانات وهمية.
                </p>
                <button
                  type="button"
                  onClick={handleAdminResetEntireSite}
                  disabled={isAdminResetting}
                  className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isAdminResetting ? 'animate-spin' : ''}`} />
                  <span>تنفيذ إعادة تعيين كل شيء في الموقع ما عدا الأرباح الحقيقية</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PAYMENT ACCOUNTS CONFIG */}
          {activeTab === 'payment_accounts' && (
            <form onSubmit={handleSavePayments} className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-stone-200 dark:border-slate-700">
              <h4 className="font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>إعدادات حسابات بريدي موب الرسمية</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">رقم الـ RIP لبريدي موب</label>
                  <input
                    type="text"
                    value={baridiRip}
                    onChange={(e) => setBaridiRip(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">اسم المستفيد المعتمد</label>
                  <input
                    type="text"
                    value={baridiHolder}
                    onChange={(e) => setBaridiHolder(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* TRUECALLER VERIFICATION & CALLER ID INTEGRATION */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-sky-950/40 border border-sky-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-white flex items-center gap-1.5">
                        <span>ربط خدمة بريدي موب بـ Truecaller (كاشف الهوية)</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold">موثق رسمياً ✓</span>
                      </h5>
                      <p className="text-[10px] text-sky-200/70">
                        التحقق من رقم الهاتف وإظهار اسم المالك الرسمي (لقمان ياسين أبختي) عند الاتصال وإرسال رسائل SMS
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://www.truecaller.com/search/dz/0652206947"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>فحص الرقم</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">
                      رقم هاتف Truecaller المربوط (الجزائر)
                    </label>
                    <input
                      type="text"
                      value={baridimobPhone}
                      onChange={(e) => {
                        setBaridimobPhone(e.target.value);
                        setTruecallerNumber(e.target.value.replace(/^0/, ''));
                      }}
                      placeholder="0652206947"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-sky-500/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">
                      الاسم الظاهر في كاشف الأرقام (Caller ID Name)
                    </label>
                    <input
                      type="text"
                      value={truecallerCallerIdName}
                      onChange={(e) => setTruecallerCallerIdName(e.target.value)}
                      placeholder="لقمان ياسين أبختي | Lokmane Yassine Abakhti"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-sky-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-sky-200">
                    <input
                      type="checkbox"
                      checked={truecallerVerified}
                      onChange={(e) => setTruecallerVerified(e.target.checked)}
                      className="rounded accent-sky-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold">تفعيل شارة التوثيق الزرقاء (Truecaller Verified Badge)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                    حالة الربط: نشط بنجاح (Active)
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1.5 pt-3 border-t border-stone-100 dark:border-slate-700">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>عناوين محافظ بينانس (USDT Wallets)</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">عنوان محفظة TRC20 (الشبكة المفضلة)</label>
                  <input
                    type="text"
                    value={binanceTrc}
                    onChange={(e) => setBinanceTrc(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">عنوان محفظة BEP20 (BNB Smart Chain)</label>
                  <input
                    type="text"
                    value={binanceBep}
                    onChange={(e) => setBinanceBep(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Binance Pay ID</label>
                  <input
                    type="text"
                    value={binancePayId}
                    onChange={(e) => setBinancePayId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md cursor-pointer transition-all"
              >
                تحديث حسابات الدفع البنكية والرقمية
              </button>
            </form>
          )}

          {/* TAB: STRUCTURED WITHDRAWALS MANAGEMENT (BARIDIMOB & BINANCE) */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-5">
              {/* Header Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 border border-amber-500/40 text-white shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-950 flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" />
                        <span>نظام سحب الأرباح المباشر</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>مدة التنفيذ المعتمدة: ساعتان (120 دقيقة) ⏱️</span>
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-base text-white">
                      إدارة طلبات سحب الخزينة والأرباح (BaridiMob & Binance)
                    </h4>
                    <p className="text-xs text-stone-300 mt-1">
                      متابعة وإقرار طلبات التحويل لحسابات بريدي موب ومحافظ بينانس الرقمية، مع توثيق سندات الصرف الرسمية والالتزام بمهلة الساعتين.
                    </p>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-stone-300 block">إجمالي الطلبات</span>
                    <strong className="text-sm font-black text-white">{withdrawals.length}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[10px] text-amber-300 block">قيد المعالجة (خلال ساعتين)</span>
                    <strong className="text-sm font-black text-amber-400">
                      {withdrawals.filter(w => w.status === 'pending').length}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-300 block">مكتملة ومحولة</span>
                    <strong className="text-sm font-black text-emerald-400">
                      {withdrawals.filter(w => w.status === 'approved').length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Withdrawals List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>قائمة طلبات السحب:</span>
                  </h5>
                </div>

                {withdrawals.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-400 text-xs">
                    لا توجد طلبات سحب مسجلة حالياً في النظام.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((w) => {
                      const reqDate = new Date(w.requestedAt.replace(' ', 'T')).getTime();
                      const durationMs = (w.executionDurationHours || 2) * 60 * 60 * 1000;
                      const elapsedMs = isNaN(reqDate) ? 0 : Date.now() - reqDate;
                      const remainingMs = durationMs - elapsedMs;
                      
                      const hours = Math.floor(Math.max(0, remainingMs) / (1000 * 60 * 60));
                      const minutes = Math.floor((Math.max(0, remainingMs) % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((Math.max(0, remainingMs) % (1000 * 60)) / 1000);
                      const countdownStr = remainingMs <= 0 
                        ? 'انتهت مدة الساعتين' 
                        : `${hours > 0 ? `${hours}س ` : ''}${minutes.toString().padStart(2, '0')}د ${seconds.toString().padStart(2, '0')}ث`;

                      return (
                        <div
                          key={w.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-xs text-stone-900 dark:text-white">
                                  {w.referenceCode}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                  {w.method === 'baridimob' ? 'بريدي موب (BaridiMob RIP)' : w.method === 'binance' ? `بينانس (${w.cryptoNetwork || 'USDT'})` : 'حساب بريدي CCP'}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  w.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : w.status === 'rejected'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {w.status === 'approved' ? 'محوّل بنجاح ✅' : w.status === 'rejected' ? 'مرفوض ❌' : 'قيد التنفيذ (خلال ساعتين) ⏱️'}
                                </span>
                              </div>

                              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 space-y-0.5">
                                <div>
                                  <strong>المستفيد:</strong> {w.beneficiaryName || w.authorName}
                                  {w.phoneNumber && <span className="mr-2">| هاتف: {w.phoneNumber}</span>}
                                </div>
                                <div className="font-mono text-[10px] text-stone-600 dark:text-stone-300">
                                  {w.accountDetails}
                                </div>
                              </div>
                            </div>

                            <div className="text-left shrink-0">
                              <span className="text-sm font-black text-stone-900 dark:text-white block">
                                {w.amountDzd.toLocaleString()} د.ج
                              </span>
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold font-mono">
                                ≈ {(w.amountUsdt || (((w.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0)).toFixed(2)} USDT
                              </span>
                            </div>
                          </div>

                          {/* Countdown & Actions Bar */}
                          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center gap-2">
                              <Timer className={`w-4 h-4 ${w.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                              <span className="text-[11px] text-stone-600 dark:text-stone-300">
                                {w.status === 'approved' ? 'اكتمال المعالجة:' : 'مهلة التنفيذ (ساعتان):'}
                              </span>
                              <strong className={`font-mono text-xs ${
                                w.status === 'approved' ? 'text-emerald-600' : 'text-amber-600 dark:text-amber-400 font-black'
                              }`}>
                                {w.status === 'approved' ? 'تم الإيداع والتسوية' : w.status === 'rejected' ? 'تم الرفض' : countdownStr}
                              </strong>
                              {w.expectedCompletionTime && w.status === 'pending' && (
                                <span className="text-[10px] text-stone-400">
                                  (الموعد: {w.expectedCompletionTime})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Approve Button */}
                              {w.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => approveWithdrawal(w.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>تأكيد التحويل الآن</span>
                                </button>
                              )}

                              {/* Reject Button */}
                              {w.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('هل تريد رفض طلب السحب وإرجاع المبلغ لمحفظة العميل؟')) {
                                      rejectWithdrawal(w.id);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 hover:bg-rose-200"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>رفض وإرجاع</span>
                                </button>
                              )}

                              {/* Download PDF Voucher */}
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    setIsDownloadingPdf(w.id);
                                    const safeUsdt = w.amountUsdt || parseFloat((((w.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2));
                                    await generateSalesReceiptPDF({
                                      invoiceNumber: w.referenceCode,
                                      date: w.requestedAt || new Date().toLocaleString('ar-DZ'),
                                      customerName: w.beneficiaryName || w.authorName || 'المستفيد المالي',
                                      customerEmail: 'finance@platform.dz',
                                      paymentMethod: w.method,
                                      paymentMethodLabel: w.method === 'baridimob' ? 'بريدي موب (BaridiMob RIP)' : w.method === 'binance' ? `بينانس (${w.cryptoNetwork || 'USDT'})` : 'حساب CCP',
                                      transactionRef: w.referenceCode,
                                      badgeTitle: 'إيصال سحب مالي معتمد',
                                      ripNumber: w.method === 'baridimob' ? w.accountDetails : undefined,
                                      beneficiaryName: w.beneficiaryName || w.authorName,
                                      items: [{
                                        title: `سند سحب مالي معتمد (مدة التنفيذ: ساعتان ⏱️) • تحويل ${w.method === 'baridimob' ? 'بريدي موب' : w.method === 'binance' ? 'بينانس' : 'CCP'}`,
                                        author: customization.presidentName || 'لقمان ياسين أبختي',
                                        priceDzd: w.amountDzd,
                                        priceUsdt: safeUsdt,
                                        category: 'سند صرف مالي رسمي معتمد',
                                      }],
                                      totalDzd: w.amountDzd,
                                      totalUsdt: safeUsdt,
                                      storeName: customization.storeName,
                                      presidentName: customization.presidentName,
                                    });
                                  } finally {
                                    setIsDownloadingPdf(null);
                                  }
                                }}
                                disabled={isDownloadingPdf === w.id}
                                className="p-1.5 px-2 rounded-lg bg-teal-50 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-slate-600 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                              >
                                {isDownloadingPdf === w.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>سند PDF</span>
                              </button>

                              {/* Direct BaridiMob SMS Trigger */}
                              {w.method === 'baridimob' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sendBaridimobSms({
                                      recipientPhone: w.phoneNumber || '0555001122',
                                      recipientName: w.beneficiaryName || w.authorName,
                                      ripNumber: w.accountDetails,
                                      amountDzd: w.amountDzd,
                                      referenceCode: w.referenceCode,
                                      type: 'withdrawal',
                                    });
                                  }}
                                  className="p-1.5 px-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-sm"
                                  title="إرسال إشعار SMS بريدي موب"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>رسالة SMS 📲</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: BARIDIMOB SMS NOTIFICATIONS CENTER */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              {/* SMS Header Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-teal-950 border border-emerald-500/30 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-white">
                        خدمة رسائل بريدي موب (BaridiMob SMS) الرسمية
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        بريد الجزائر
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">
                      ربط وتأكيد عمليات السحب والتحويلات مع مهلة التنفيذ ساعتان (2 Hours) وإشعار المستفيد فورياً
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-400" />
                        <span>Truecaller Verified: 0652206947 (لقمان ياسين أبختي) ✓</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sendBaridimobSms({
                      recipientPhone: paymentAccounts.baridimobPhone || '0652206947',
                      recipientName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'لقمان ياسين أبختي',
                      ripNumber: paymentAccounts.baridimobRip || '00799999002847192033',
                      amountDzd: 24000,
                      referenceCode: `STR-WD-${Date.now().toString().slice(-6)}`,
                      type: 'withdrawal',
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>إصدار رسالة SMS تجريبية 📲</span>
                </button>
              </div>

              {/* SMS Table & Card Stream */}
              {smsNotifications.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 text-stone-400 text-xs">
                  لا توجد رسائل SMS مسجلة حالياً في النظام.
                </div>
              ) : (
                <div className="space-y-3">
                  {smsNotifications.map((sms) => (
                    <div
                      key={sms.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {sms.senderId}
                          </span>
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            المستفيد: {sms.recipientName}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            ({sms.recipientPhone})
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            RIP: {sms.ripNumber}
                          </span>
                        </div>

                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-black bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          تم التسليم بنجاح ✓
                        </span>
                      </div>

                      {/* SMS text */}
                      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700/80 text-stone-800 dark:text-stone-200 text-xs whitespace-pre-line leading-relaxed font-sans">
                        {sms.messageText}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs text-stone-400">
                        <span className="font-mono text-[11px]">{sms.sentAt}</span>

                        <div className="flex items-center gap-2">
                          {/* Native SMS Trigger */}
                          <a
                            href={`sms:${sms.recipientPhone}?body=${encodeURIComponent(sms.messageText)}`}
                            className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>إرسال عبر تطبيق الرسائل SMS 📲</span>
                          </a>

                          {/* Preview in Phone Modal */}
                          <button
                            type="button"
                            onClick={() => setActiveSmsModal(sms)}
                            className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold border border-stone-200 dark:border-slate-600 flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>معاينة في هاتف الزبون 📱</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OWNER INFINITE VOUCHERS & SYSTEM PROMO CODES */}
          {activeTab === 'vouchers' && (
            <div className="space-y-6">
              
              {/* Golden Owner Infinite Voucher Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-teal-950 border-2 border-amber-400/60 text-white shadow-2xl relative overflow-hidden space-y-4">
                <div className="absolute -left-12 -top-12 w-36 h-36 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-stone-950 flex items-center justify-center font-black shadow-lg shrink-0">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base sm:text-lg text-amber-300 flex items-center gap-2">
                        <span>نظام القسائم اللانهائية المخصص لمالك المنصة</span>
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-black text-xs flex items-center gap-1 shadow-xs">
                          <Infinity className="w-3.5 h-3.5" />
                          <span>لانهائي ∞</span>
                        </span>
                      </h4>
                      <p className="text-xs text-teal-200">
                        مخصصة حصرياً للمالك: <strong>الأستاذ لقمان ياسين أبختي</strong>. تم ضبطها لتعمل دون نفاذ الصلاحية (استخدام غير محدود ومستمر).
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                    حماية أمنية وتخصيص نشط
                  </span>
                </div>

                {voucherMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                    voucherMsg.success
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  }`}>
                    {voucherMsg.text}
                  </div>
                )}

                {/* Primary Infinite Voucher Showcase */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
                  {giftCards.filter(c => c.isInfinite).map((voucher) => (
                    <div 
                      key={voucher.code}
                      className="p-4 rounded-2xl bg-black/50 border border-amber-400/30 space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                          <Infinity className="w-3.5 h-3.5 text-amber-400" />
                          <span>{voucher.description || 'قسيمة لانهائية للمالك'}</span>
                        </span>
                        <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                          {voucher.amountUsdt} USDT / شحنة
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-xl border border-white/10">
                        <span className="font-mono font-black text-sm text-amber-200 select-all tracking-wider">
                          {voucher.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              copyToClipboard(voucher.code);
                              setCopiedVoucherCode(voucher.code);
                              setTimeout(() => setCopiedVoucherCode(null), 2000);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="نسخ الكود"
                          >
                            {copiedVoucherCode === voucher.code ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const res = redeemGiftCard(voucher.code);
                              setVoucherMsg({ text: res.message, success: res.success });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                          >
                            <Zap className="w-3 h-3 fill-stone-950" />
                            <span>شحن رصيد</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-300">
                        <span>مرات الاستخدام: <strong className="text-amber-300">{voucher.timesRedeemed || 0} مرة (∞)</strong></span>
                        <span className="text-emerald-400 font-bold">صالح للأبد</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generator Form for Custom Infinite/Standard Vouchers */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-800/90 border border-stone-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>توليد قسيمة شحن جديدة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                      القيمة بالدولار الرقمي (USDT):
                    </label>
                    <input
                      type="number"
                      value={newVoucherUsdt}
                      onChange={(e) => setNewVoucherUsdt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                      وصف القسيمة:
                    </label>
                    <input
                      type="text"
                      value={newVoucherDesc}
                      onChange={(e) => setNewVoucherDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isInfiniteCheck"
                      checked={newVoucherIsInfinite}
                      onChange={(e) => setNewVoucherIsInfinite(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="isInfiniteCheck" className="text-stone-800 dark:text-stone-200 font-bold cursor-pointer">
                      تخصيص القسيمة كقسيمة لانهائية ∞ (غير قابلة للنفاذ)
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="ownerOnlyCheck"
                      checked={newVoucherOwnerOnly}
                      onChange={(e) => setNewVoucherOwnerOnly(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="ownerOnlyCheck" className="text-stone-800 dark:text-stone-200 font-bold cursor-pointer">
                      قصر القسيمة حصرياً على مالك المنصة فقط
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const usdt = Number(newVoucherUsdt) || 100;
                    const code = generateGiftCardVoucher(usdt, newVoucherIsInfinite, newVoucherOwnerOnly, newVoucherDesc);
                    setVoucherMsg({
                      text: `✓ تم توليد القسيمة بنجاح! الكود: ${code} (${newVoucherIsInfinite ? 'لانهائية ∞' : 'استخدام فردي'})`,
                      success: true
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>توليد وإدراج القسيمة فوراً</span>
                </button>
              </div>

              {/* All Registered Vouchers Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  سجل القسائم والبطاقات النشطة بالمنصة ({giftCards.length}):
                </h5>

                <div className="divide-y divide-stone-200 dark:divide-slate-700 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 text-xs">
                  {giftCards.map((c) => (
                    <div key={c.code} className="p-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 dark:text-white select-all">
                            {c.code}
                          </span>
                          {c.isInfinite && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-800 flex items-center gap-0.5">
                              <Infinity className="w-3 h-3" />
                              <span>لانهائية</span>
                            </span>
                          )}
                          {c.ownerOnly && (
                            <span className="px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold border border-teal-300 dark:border-teal-800">
                              خاصة بالمالك
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                          {c.description || 'قسيمة رصيد'} • القيمة: {c.amountUsdt} USDT ({ (c.amountUsdt * customization.exchangeRateUsdtToDzd).toLocaleString() } د.ج)
                        </span>
                      </div>

                      <div className="text-left">
                        {c.isInfinite ? (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                            مستخدمة {c.timesRedeemed || 0} مرات (∞ لانهائي)
                          </span>
                        ) : c.isUsed ? (
                          <span className="text-xs font-bold text-stone-400 block">
                            مستخدمة بواسطة: {c.usedBy || 'مجهول'}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            جاهزة للاستخدام
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: CYBERSECURITY & INTEGRITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-teal-900/10 dark:bg-slate-800 border border-teal-500/20 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-teal-600" />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">نظام التشفير وحماية البيانات 2026</h4>
                    <span className="text-xs text-teal-700 dark:text-teal-400">تشفير التخزين المحلي، فلترة XSS، وحظر التعليقات غير اللائقة</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700">
                    <span className="text-stone-400 block mb-1">فلتر المحتوى الأخلاقي:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">مفعل ونشط تلقائياً</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700">
                    <span className="text-stone-400 block mb-1">ضغط الصور (Canvas WebP):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">مفعل لتوفير مساحة التخزين</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PUBLISHER MESSAGES & COMMUNICATION HUB */}
          {activeTab === 'publisher_messages' && (
            <div className="space-y-6">
              
              {/* Hub Header & Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800 border border-teal-200/60 dark:border-slate-700">
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">إجمالي الاستفسارات</span>
                  <div className="text-xl font-black text-teal-900 dark:text-teal-200 mt-1">
                    {publisherMessages.length} رسالة
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700">
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">بانتظار الرد الرسمي</span>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1.5">
                    <span>{publisherMessages.filter((m) => m.status === 'pending').length}</span>
                    {publisherMessages.filter((m) => m.status === 'pending').length > 0 && (
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">جديد</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-slate-800 border border-emerald-200/60 dark:border-slate-700">
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">تمت الإجابة والرد</span>
                  <div className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
                    {publisherMessages.filter((m) => m.status === 'replied').length} رد رسمي
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">دور النشر الشريكة</span>
                  <div className="text-xl font-black text-stone-800 dark:text-white mt-1">
                    {Object.keys(publisherProfiles).length} دور نشر
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    تصفية دار النشر:
                  </span>
                  <select
                    value={publisherFilter}
                    onChange={(e) => setPublisherFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-900 dark:text-white font-medium"
                  >
                    <option value="all">جميع دور النشر</option>
                    {Object.keys(publisherProfiles).map((pName) => (
                      <option key={pName} value={pName}>{pName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    الحالة:
                  </span>
                  <div className="flex bg-stone-200/70 dark:bg-slate-900 p-0.5 rounded-xl text-xs">
                    <button
                      onClick={() => setPublisherStatusFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        publisherStatusFilter === 'all' ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      الكل ({publisherMessages.length})
                    </button>
                    <button
                      onClick={() => setPublisherStatusFilter('pending')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        publisherStatusFilter === 'pending' ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      قيد المراجعة ({publisherMessages.filter(m => m.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setPublisherStatusFilter('replied')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        publisherStatusFilter === 'replied' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      تم الرد ({publisherMessages.filter(m => m.status === 'replied').length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Inquiries List */}
              <div className="space-y-4">
                {publisherMessages
                  .filter((m) => publisherFilter === 'all' || m.publisherName === publisherFilter)
                  .filter((m) => publisherStatusFilter === 'all' || m.status === publisherStatusFilter)
                  .map((msg) => {
                    const isReplying = adminReplyTargetId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className="p-5 rounded-2xl bg-stone-50/70 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-3"
                      >
                        {/* Top Info */}
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200/50">
                                🏛️ دار النشر: {msg.publisherName}
                              </span>
                              <span className="text-xs text-stone-500 dark:text-stone-400">
                                كتاب: <strong className="text-stone-900 dark:text-white">{msg.bookTitle}</strong>
                              </span>
                              <span className="text-[11px] text-stone-400 font-mono">
                                {new Date(msg.createdAt).toLocaleString('ar-DZ')}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-stone-900 dark:text-white mt-1.5">
                              {msg.subject}
                            </h4>
                          </div>

                          <div>
                            {msg.status === 'replied' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تم الرد</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>بانتظار الرد</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sender inquiry */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700/80 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                            <span>المرسل: <strong className="text-stone-900 dark:text-white">{msg.senderName}</strong> ({msg.senderEmail})</span>
                            {msg.senderPhone && <span dir="ltr" className="font-mono">{msg.senderPhone}</span>}
                          </div>
                          <p className="text-stone-700 dark:text-stone-300 pt-1 leading-relaxed whitespace-pre-line">
                            {msg.message}
                          </p>
                        </div>

                        {/* Official Publisher Reply (if exists) */}
                        {msg.publisherReply && (
                          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1 text-xs mr-3">
                            <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-200">
                              <span>الرد الرسمي الصادر ({msg.publisherReply.responderName} - {msg.publisherReply.responderRole}):</span>
                              <span className="text-[10px] font-mono text-stone-400">{new Date(msg.publisherReply.repliedAt).toLocaleString('ar-DZ')}</span>
                            </div>
                            <p className="text-stone-800 dark:text-stone-200 pt-1 leading-relaxed whitespace-pre-line">
                              {msg.publisherReply.text}
                            </p>
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-stone-400 font-mono">
                            ID: {msg.id}
                          </span>

                          <button
                            onClick={() => {
                              setAdminReplyTargetId(isReplying ? null : msg.id);
                              setAdminReplyContent('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>{msg.status === 'replied' ? 'تعديل أو إرسال رد إضافي' : 'كتابة رد رسمي فوري'}</span>
                          </button>
                        </div>

                        {/* Reply Form */}
                        {isReplying && (
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-teal-600/50 space-y-2 mt-2">
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                              صياغة الرد الرسمي المعتمد باسم دار النشر ({msg.publisherName}):
                            </label>
                            <textarea
                              value={adminReplyContent}
                              onChange={(e) => setAdminReplyContent(e.target.value)}
                              rows={3}
                              placeholder="اكتب الرد الرسمي الموجه للقارئ/المؤسسة..."
                              className="w-full p-2.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setAdminReplyTargetId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => {
                                  if (!adminReplyContent.trim()) return;
                                  const res = replyToPublisherMessage(msg.id, adminReplyContent.trim());
                                  if (res.success) {
                                    setAdminReplyTargetId(null);
                                    setAdminReplyContent('');
                                  } else {
                                    alert(res.error || 'فشل إرسال الرد');
                                  }
                                }}
                                className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs"
                              >
                                اعتماد وإرسال الرد الرسمي ✉️
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
              </div>

              {/* Registered Publishers Directory Cards */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>دليل دور النشر الجزائرية المعتمدة في المنصة</span>
                  </h4>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {Object.keys(publisherProfiles).length} دور نشر مسجلة
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.values(publisherProfiles).map((pub) => (
                    <div
                      key={pub.name}
                      className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-stone-900 dark:text-white font-bold">{pub.name}</strong>
                        <span className="text-[10px] text-teal-700 dark:text-teal-300 font-mono bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded">
                          {pub.licenseNumber}
                        </span>
                      </div>
                      <div className="text-stone-600 dark:text-stone-400 text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{pub.city}، {pub.country} — {pub.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60 dark:border-slate-700">
                        <span>المسؤول: {pub.contactPerson}</span>
                        <span dir="ltr" className="font-mono">{pub.officialPhone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
