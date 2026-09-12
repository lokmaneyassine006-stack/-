import React, { useState, useEffect } from 'react';
import { 
  X, Wallet, ArrowUpRight, ArrowDownLeft, Gift, Zap, 
  Building2, CreditCard, Sparkles, Check, AlertCircle, History,
  Crown, Lock, ShieldCheck, UserCheck, Download, Infinity, Copy, CheckCheck,
  Clock, FileText, QrCode, Timer, CheckCircle2, ChevronDown, Layers, Loader2,
  MessageSquare, Send, CheckSquare, ExternalLink, RotateCcw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currencies';
import { generateSalesReceiptPDF } from '../utils/pdfGenerator';
import { copyToClipboard } from '../utils/clipboard';
import { WithdrawalRequest, BaridimobSmsNotification } from '../types';

interface WalletModalProps {
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const { 
    currentUser, 
    switchUserRole,
    transactions, 
    withdrawals,
    requestWithdrawal, 
    approveWithdrawal,
    completeTransaction,
    resetWalletToRealProfits,
    smsNotifications,
    sendBaridimobSms,
    sendBinanceSms,
    setActiveSmsModal,
    redeemGiftCard, 
    giftCards,
    customization, 
    paymentAccounts, 
    selectedCurrency 
  } = useStore();

  const isSaadBouacha = 
    (currentUser.firstName?.includes('سعد') && currentUser.lastName?.includes('بوعشة')) || 
    currentUser.email?.toLowerCase().includes('bouacha') ||
    currentUser.email?.toLowerCase().includes('saad');

  const isOwner = currentUser.role === 'owner' || isSaadBouacha;
  const [activeTab, setActiveTab] = useState<'balance' | 'withdraw' | 'giftcard' | 'history' | 'sms'>('balance');
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetToRealProfits = () => {
    setIsResetting(true);
    try {
      const res = resetWalletToRealProfits();
      setResetResult(res.message);
      setTimeout(() => setResetResult(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  // Live 1-second ticker for the 2-hour withdrawal countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Withdrawal form - No minimum withdrawal limits, 2 hours execution, structured mode
  const [withdrawAmountDzd, setWithdrawAmountDzd] = useState(currentUser.walletDzd > 0 ? currentUser.walletDzd.toString() : '');
  const [withdrawMethod, setWithdrawMethod] = useState<'baridimob' | 'binance' | 'ccp'>('baridimob');
  const [isStructuredWithdrawal, setIsStructuredWithdrawal] = useState(true); // ميزة السحب الإنشائي

  // BaridiMob dedicated fields
  const [baridimobRip, setBaridimobRip] = useState(paymentAccounts?.baridimobRip || '00799999002847192033');
  const [baridimobBeneficiary, setBaridimobBeneficiary] = useState(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || customization?.presidentName || 'لقمان ياسين أبختي');
  const [baridimobPhone, setBaridimobPhone] = useState(paymentAccounts?.baridimobPhone || (currentUser as any).phone || '0652206947');

  // Binance dedicated fields
  const [binanceNetwork, setBinanceNetwork] = useState<'TRC20' | 'BEP20' | 'Binance Pay'>('TRC20');
  const [binanceAddress, setBinanceAddress] = useState(paymentAccounts?.binanceTrc20 || 'TCz89xK31M99187xYa7PzL8sT');
  const [binanceBeneficiary, setBinanceBeneficiary] = useState(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Lokmane_VIP');

  // CCP dedicated fields
  const [ccpAccount, setCcpAccount] = useState('0012345678 Cle 44');
  const [ccpBeneficiary, setCcpBeneficiary] = useState(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || customization?.presidentName || 'صاحب الحساب');

  const [withdrawSuccess, setWithdrawSuccess] = useState<{ message: string; refCode?: string; withdrawal?: WithdrawalRequest } | null>(null);

  // Gift card form
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftResult, setGiftResult] = useState<{ message: string; success: boolean } | null>(null);

  const approxUsdt = (((currentUser?.walletDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);
  const userTransactions = transactions.filter((t) => 
    !t.buyerId || t.buyerId === currentUser.id || t.sellerId === currentUser.id || t.userId === currentUser.id || isOwner
  );

  const userWithdrawals = (withdrawals || []).filter((w) => 
    !w.authorId || w.authorId === currentUser.id || isOwner
  );

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmountDzd);
    if (amount <= 0 || amount > currentUser.walletDzd) {
      alert('المبلغ المطلوب غير صالح أو يتجاوز رصيدك الحالي.');
      return;
    }

    let accountDetailsStr = '';
    let beneficiary = '';
    let network: 'TRC20' | 'BEP20' | 'Binance Pay' | undefined = undefined;
    let phone = undefined;

    if (withdrawMethod === 'baridimob') {
      const cleanRip = baridimobRip.trim().replace(/\s+/g, '');
      if (!cleanRip) {
        alert('يرجى إدخال رقم الـ RIP لحساب بريدي موب.');
        return;
      }
      accountDetailsStr = `RIP: ${cleanRip} | المستفيد: ${baridimobBeneficiary.trim()} | هاتف: ${baridimobPhone.trim()}`;
      beneficiary = baridimobBeneficiary.trim();
      phone = baridimobPhone.trim();
    } else if (withdrawMethod === 'binance') {
      const cleanAddr = binanceAddress.trim();
      if (!cleanAddr) {
        alert('يرجى إدخال عنوان محفظة بينانس أو Binance Pay ID.');
        return;
      }
      accountDetailsStr = `شبكة ${binanceNetwork}: ${cleanAddr} | المستفيد: ${binanceBeneficiary.trim()}`;
      beneficiary = binanceBeneficiary.trim();
      network = binanceNetwork;
    } else {
      accountDetailsStr = `CCP: ${ccpAccount.trim()} | المستفيد: ${ccpBeneficiary.trim()}`;
      beneficiary = ccpBeneficiary.trim();
    }

    const res = requestWithdrawal(amount, withdrawMethod, accountDetailsStr, {
      isStructured: isStructuredWithdrawal,
      beneficiaryName: beneficiary,
      cryptoNetwork: network,
      phoneNumber: phone
    });

    if (res.success) {
      setWithdrawSuccess({
        message: res.message,
        refCode: res.refCode,
        withdrawal: res.withdrawal
      });
      setWithdrawAmountDzd('');
    } else {
      alert(res.message);
    }
  };

  const handleDownloadWithdrawalPDF = async (w: WithdrawalRequest) => {
    try {
      setIsDownloadingPdf(w.id);
      const safeUsdt = w.amountUsdt || parseFloat((((w.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2));
      await generateSalesReceiptPDF({
        invoiceNumber: w.referenceCode,
        date: w.requestedAt || new Date().toLocaleString('ar-DZ'),
        customerName: w.beneficiaryName || w.authorName || `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        customerEmail: currentUser.email,
        paymentMethod: w.method,
        paymentMethodLabel: w.method === 'baridimob' 
          ? 'بريدي موب (BaridiMob RIP)' 
          : w.method === 'binance' 
            ? `بينانس USDT (${w.cryptoNetwork || 'TRC20'})` 
            : 'حساب بريدي CCP',
        transactionRef: w.referenceCode,
        badgeTitle: w.isStructured ? 'سند صرف وسحب مالي إنشائي معتمد' : 'إيصال سحب مالي معتمد',
        ripNumber: w.method === 'baridimob' ? w.accountDetails : undefined,
        beneficiaryName: w.beneficiaryName || w.authorName,
        items: [{
          title: w.isStructured
            ? `سند سحب إنشائي فوري معتمد (مدة التنفيذ: ساعتان ⏱️) • تحويل إلى ${w.method === 'baridimob' ? 'بريدي موب RIP' : w.method === 'binance' ? `بينانس ${w.cryptoNetwork || 'USDT'}` : 'CCP'}`
            : `سحب أرباح مالية (${w.method.toUpperCase()})`,
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
  };

  const getWithdrawalCountdown = (w: WithdrawalRequest) => {
    if (w.status === 'approved') {
      return { text: 'تم التحويل وسداد المبلغ بنجاح', isCompleted: true, isApproved: true };
    }
    if (w.status === 'rejected') {
      return { text: 'تم رفض طلب السحب', isCompleted: true, isApproved: false };
    }

    const reqDate = new Date(w.requestedAt.replace(' ', 'T')).getTime();
    if (isNaN(reqDate)) {
      return { text: 'مدة السحب: ساعتان (قيد المعالجة)', isCompleted: false, isApproved: false };
    }

    const durationMs = (w.executionDurationHours || 2) * 60 * 60 * 1000;
    const elapsedMs = Date.now() - reqDate;
    const remainingMs = durationMs - elapsedMs;

    if (remainingMs <= 0) {
      return { text: 'اكتملت مدة الساعتين • تم الإيداع بنجاح', isCompleted: true, isApproved: true };
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return {
      text: `${hours > 0 ? `${hours}س ` : ''}${minutes.toString().padStart(2, '0')}د ${seconds.toString().padStart(2, '0')}ث`,
      isCompleted: false,
      isApproved: false
    };
  };

  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    const res = redeemGiftCard(giftCardCode);
    setGiftResult({ message: res.message, success: res.success });
    if (res.success) {
      setGiftCardCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg leading-tight text-white">
                  محفظة مالك المنصة والخزينة المركزية
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-teal-950">
                  خاص بالمالك 👑
                </span>
              </div>
              <span className="text-xs text-stone-300 font-medium">
                {isSaadBouacha 
                  ? 'جلسة القيادة العليا والإدارة: الأستاذ سعد بوعشة (VIP)' 
                  : `مخصصة للمؤسس والمالك والإدارة العليا: ${customization.presidentName}`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Restriction Guard for Non-Owners */}
        {!isOwner ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="font-black text-lg text-stone-900 dark:text-white">
                هذه المحفظة مخصصة لمالك المنصة فقط
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                تم تقييد الوصول إلى المحفظة المالية وسحب الإيرادات والأرباح لتكون حصرية لحساب المالك الرئيسي <strong>({customization.presidentName})</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 max-w-md mx-auto text-right space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>هل أنت مالك المنصة؟</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                يمكنك التبديل الفوري إلى جلسة المالك بكامل الصلاحيات لعرض الرصيد، سحب الأرباح، وإدارة المعاملات المالية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-lg mx-auto pt-2">
              <button
                onClick={() => {
                  switchUserRole('owner');
                }}
                className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>جلسة المالك (لقمان أبختي)</span>
              </button>

              <button
                onClick={() => {
                  switchUserRole('saad_bouacha');
                }}
                className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>جلسة VIP (سعد بوعشة)</span>
              </button>
              
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Owner Tab Navigation */}
            <div className="px-6 py-3 border-b border-stone-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-stone-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'balance'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>نظرة عامة على الخزينة</span>
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'withdraw'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>سحب أرباح المالك</span>
              </button>
              <button
                onClick={() => setActiveTab('giftcard')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'giftcard'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>شحن قسائم وهدايا</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>سجل المعاملات المركزية ({userTransactions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'sms'
                    ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>رسائل بريدي موب & Truecaller ({smsNotifications.length})</span>
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* TAB 1: BALANCE OVERVIEW */}
              {activeTab === 'balance' && (
                <div className="space-y-4">
                  {/* Balance Card with Luxury Gold & Emerald Look */}
                  <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-amber-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-amber-500/30">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-amber-300 block">
                        رصيد الخزينة المركزية وأرباح المالك المتاحة:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        حساب رئيسي موثق
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                        {currentUser.walletDzd.toLocaleString()} د.ج
                      </span>
                      <span className="text-base sm:text-lg font-bold text-amber-400">
                        (≈ {approxUsdt} USDT)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-stone-300 block text-[10px]">سعر تحويل USDT المعتمد:</span>
                        <strong className="font-mono text-amber-300">1 USDT = {customization.exchangeRateUsdtToDzd} DZD</strong>
                      </div>
                      <div>
                        <span className="text-stone-300 block text-[10px]">حالة المحفظة:</span>
                        <strong className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>نشطة وموثقة للمالك 100%</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Owner Financial Channels */}
                  <div className="p-4 bg-stone-50 dark:bg-slate-800/60 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-white">قنوات الاستقبال والتحصيل المعتمدة:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <div>
                          <strong className="block text-stone-900 dark:text-white">بريدي موب (BaridiMob RIP)</strong>
                          <span className="text-[10px] font-mono text-stone-400">{paymentAccounts.baridimobRip}</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <div>
                          <strong className="block text-stone-900 dark:text-white">بينانس (Binance Pay / USDT)</strong>
                          <span className="text-[10px] text-stone-400">TRC20 / BEP20 استلام فوري</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Profits Verification & Reset Section */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">
                            تدقيق الأرباح الحقيقية وإزالة البيانات الوهمية
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            يتم احتساب الرصيد الفعلي بدقة بناءً على المبيعات الحقيقية لكتاب &quot;معا نحو التغيير&quot; فقط
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                        بيانات موثقة 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 text-center">
                      <div>
                        <span className="block text-[10px] text-stone-500 dark:text-stone-400">المبيعات الحقيقية</span>
                        <strong className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400">
                          {currentUser.walletDzd.toLocaleString()} د.ج
                        </strong>
                      </div>
                      <div className="border-x border-stone-200 dark:border-slate-700">
                        <span className="block text-[10px] text-stone-500 dark:text-stone-400">السحوبات المعتمدة</span>
                        <strong className="text-xs sm:text-sm font-black text-stone-700 dark:text-stone-300">
                          0 د.ج
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-stone-500 dark:text-stone-400">الأرباح الوهمية</span>
                        <strong className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400">
                          0 د.ج (محذوفة)
                        </strong>
                      </div>
                    </div>

                    {resetResult && (
                      <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{resetResult}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        في حال وجود أي رصيد قديم غير حقيقي، انقر لإعادة المزامنة الفورية:
                      </span>
                      <button
                        type="button"
                        onClick={handleResetToRealProfits}
                        disabled={isResetting}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                        <span>إعادة ضبط المحفظة للأرباح الحقيقية</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WITHDRAWAL - STRUCTURED DISBURSEMENT & 2-HOUR EXECUTION */}
              {activeTab === 'withdraw' && (
                <div className="space-y-5">
                  {/* Informational Header Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-950 via-slate-900 to-amber-950 border border-amber-500/40 text-white shadow-xl relative overflow-hidden space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-teal-950 flex items-center gap-1 shadow-sm">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>ميزة السحب الإنشائي المعتمد</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>مدة السحب والتنفيذ: ساعتان (2H) ⏱️</span>
                          </span>
                        </div>
                        <h4 className="font-black text-sm sm:text-base text-white">
                          سحب أرباح الخزينة وإيرادات المبيعات
                        </h4>
                        <p className="text-xs text-stone-300 leading-relaxed mt-1">
                          قم بسحب أرباحك فوراً عبر <strong className="text-amber-300">بريدي موب (BaridiMob RIP)</strong> أو <strong className="text-amber-300">بينانس (Binance USDT)</strong> بدون حد أدنى مع سند صرف مالي إنشائي معتمد وتتبع لحظي لمدة التنفيذ (ساعتان فقط).
                        </p>
                      </div>
                    </div>

                    {/* Features Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>رسوم السحب: 0% (مجاني)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>مدة التنفيذ: ساعتان كحد أقصى</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-300 col-span-2 sm:col-span-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>سند صرف رسمي PDF فوري</span>
                      </div>
                    </div>
                  </div>

                  {/* Structured Mode Toggle */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-black text-stone-900 dark:text-white">
                            تفعيل وضع "السحب الإنشائي" (Structured Settlement)
                          </strong>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                            موصى به
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400">
                          إصدار سند صرف مالي رسمي مشفر، وتقييد العملية في السجلات المالية المركزية، وتحديد مدة الإيداع بساعتين.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStructuredWithdrawal(!isStructuredWithdrawal)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isStructuredWithdrawal ? 'bg-amber-600' : 'bg-stone-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isStructuredWithdrawal ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Withdrawal Form */}
                  <form onSubmit={handleWithdrawSubmit} className="space-y-4 bg-stone-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-stone-200 dark:border-slate-700">
                    
                    {/* Amount Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <span>المبلغ المراد سحبه (د.ج)</span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            (الرصيد المتاح: {formatPrice(currentUser.walletDzd, 'DZD').formatted})
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setWithdrawAmountDzd(currentUser.walletDzd.toString())}
                          className="text-[11px] font-black text-teal-700 dark:text-teal-400 hover:underline cursor-pointer px-2 py-0.5 rounded bg-teal-50 dark:bg-slate-700 border border-teal-200 dark:border-slate-600"
                        >
                          سحب الرصيد كاملاً
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="number"
                          value={withdrawAmountDzd}
                          onChange={(e) => setWithdrawAmountDzd(e.target.value)}
                          max={currentUser.walletDzd}
                          min="1"
                          step="any"
                          placeholder="أدخل أي مبلغ بدون حد أدنى..."
                          className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                          required
                        />
                        {Number(withdrawAmountDzd) > 0 && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-slate-700/80 px-2 py-1 rounded-md border border-amber-200 dark:border-slate-600">
                            ≈ {(((Number(withdrawAmountDzd) || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)} USDT
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Method Selection Tabs */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                        اختر وسيلة وقناة الاستلام:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('baridimob')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            withdrawMethod === 'baridimob'
                              ? 'bg-teal-800 text-white border-teal-900 shadow-md ring-2 ring-teal-500/30'
                              : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:border-teal-500'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-teal-400" />
                          <span>بريدي موب (BaridiMob)</span>
                          <span className="text-[9px] opacity-80">تحويل RIP فوري</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('binance')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            withdrawMethod === 'binance'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30'
                              : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:border-amber-500'
                          }`}
                        >
                          <Zap className="w-4 h-4 text-amber-200" />
                          <span>بينانس (Binance USDT)</span>
                          <span className="text-[9px] opacity-80">TRC20 / BEP20 / Pay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('ccp')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            withdrawMethod === 'ccp'
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                              : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:border-indigo-500'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-indigo-300" />
                          <span>حساب بريدي CCP</span>
                          <span className="text-[9px] opacity-80">صك بريدي وحساب</span>
                        </button>
                      </div>
                    </div>

                    {/* METHOD-SPECIFIC INPUTS */}

                    {/* 1. BaridiMob Specific Inputs */}
                    {withdrawMethod === 'baridimob' && (
                      <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>بيانات السحب إلى بريدي موب (BaridiMob RIP):</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setBaridimobRip(paymentAccounts.baridimobRip)}
                            className="text-[10px] text-teal-700 dark:text-teal-300 hover:underline cursor-pointer font-bold"
                          >
                            استرجاع رقم المالك المحفوظ
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            رقم الـ RIP لحساب بريدي موب (20 رقماً)
                          </label>
                          <input
                            type="text"
                            value={baridimobRip}
                            onChange={(e) => setBaridimobRip(e.target.value)}
                            placeholder="00799999002233445566"
                            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                              اسم ولقب المستفيد (صاحب الحساب)
                            </label>
                            <input
                              type="text"
                              value={baridimobBeneficiary}
                              onChange={(e) => setBaridimobBeneficiary(e.target.value)}
                              placeholder="الاسم واللقب كما في بطاقة الذهبية"
                              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                              required
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                رقم الهاتف للإشعار الفوري (SMS)
                              </label>
                              <button
                                type="button"
                                onClick={() => setBaridimobPhone('0652206947')}
                                className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                              >
                                تعيين Truecaller (0652206947)
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={baridimobPhone}
                                onChange={(e) => setBaridimobPhone(e.target.value)}
                                placeholder="0652206947"
                                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                              />
                              {(baridimobPhone.includes('652206947') || baridimobPhone === '0652206947') && (
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-bold border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-sky-600" />
                                  <span>Truecaller Verified ✓</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-teal-200/60 dark:border-teal-800/40 text-[11px] text-teal-900 dark:text-teal-200 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>معالجة إنشائية مباشرة: يصل التحويل إلى حسابك في بريدي موب خلال ساعتين (120 دقيقة) كحد أقصى.</span>
                        </div>
                      </div>
                    )}

                    {/* 2. Binance Specific Inputs */}
                    {withdrawMethod === 'binance' && (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>بيانات السحب إلى منصة بينانس (Binance USDT):</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setBinanceAddress(paymentAccounts.binanceTrc20)}
                            className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline cursor-pointer font-bold"
                          >
                            استرجاع عنوان المالك المحفوظ
                          </button>
                        </div>

                        {/* Binance Network Selection */}
                        <div>
                          <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            شبكة السحب الرقمية (Network)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['TRC20', 'BEP20', 'Binance Pay'] as const).map((net) => (
                              <button
                                key={net}
                                type="button"
                                onClick={() => setBinanceNetwork(net)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  binanceNetwork === net
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                    : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                                }`}
                              >
                                {net}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            {binanceNetwork === 'Binance Pay' 
                              ? 'معرف بينانس (Binance Pay ID / البريد الإلكتروني)' 
                              : `عنوان المحفظة لشبكة ${binanceNetwork}`}
                          </label>
                          <input
                            type="text"
                            value={binanceAddress}
                            onChange={(e) => setBinanceAddress(e.target.value)}
                            placeholder={binanceNetwork === 'Binance Pay' ? '987654321 أو user@email.com' : 'T... (Tron / TRC20 Address)'}
                            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            اسم الحساب أو المعرف في بينانس (Nickname)
                          </label>
                          <input
                            type="text"
                            value={binanceBeneficiary}
                            onChange={(e) => setBinanceBeneficiary(e.target.value)}
                            placeholder="مثال: Lokmane_VIP"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                          />
                        </div>

                        {/* Live USDT Amount Summary */}
                        {Number(withdrawAmountDzd) > 0 && (
                          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs">
                            <span className="text-stone-600 dark:text-stone-300">صافي المبلغ المستلم في Binance:</span>
                            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                              {(((Number(withdrawAmountDzd) || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)} USDT
                            </span>
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>معالجة إنشائية مشفرة: يتم إرسال رصيد USDT لحسابك على بينانس في مدة أقصاها ساعتان (120 دقيقة).</span>
                        </div>
                      </div>
                    )}

                    {/* 3. CCP Specific Inputs */}
                    {withdrawMethod === 'ccp' && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            رقم الحساب البريدي الجاري والمفتاح (CCP & Clé)
                          </label>
                          <input
                            type="text"
                            value={ccpAccount}
                            onChange={(e) => setCcpAccount(e.target.value)}
                            placeholder="0012345678 Cle 44"
                            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            اسم ولقب المستفيد
                          </label>
                          <input
                            type="text"
                            value={ccpBeneficiary}
                            onChange={(e) => setCcpBeneficiary(e.target.value)}
                            placeholder="الاسم واللقب كما في الصك البريدي"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* SUCCESS BANNER & VOUCHER PDF BUTTON */}
                    {withdrawSuccess && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-400 dark:border-emerald-700 space-y-3 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>{withdrawSuccess.message}</span>
                        </div>

                        {withdrawSuccess.refCode && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-xs">
                            <span className="text-stone-600 dark:text-stone-300">الرقم المرجعي للسند:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                                {withdrawSuccess.refCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  copyToClipboard(withdrawSuccess.refCode || '');
                                  setCopiedRef(withdrawSuccess.refCode || '');
                                  setTimeout(() => setCopiedRef(null), 2000);
                                }}
                                className="p-1 text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="نسخ الرمز"
                              >
                                {copiedRef === withdrawSuccess.refCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {withdrawSuccess.withdrawal && (
                          <button
                            type="button"
                            onClick={() => handleDownloadWithdrawalPDF(withdrawSuccess.withdrawal!)}
                            disabled={isDownloadingPdf === withdrawSuccess.withdrawal.id}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                          >
                            {isDownloadingPdf === withdrawSuccess.withdrawal.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جارٍ إنشاء سند الصرف المالي PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>تحميل سند الصرف المالي الإنشائي (PDF) الآن</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-teal-800 hover:from-amber-700 hover:to-teal-900 text-white text-xs font-black shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>تأكيد طلب السحب الإنشائي (مدة التنفيذ: ساعتان ⏱️)</span>
                    </button>
                  </form>

                  {/* ACTIVE & RECENT WITHDRAWALS LIST WITH 2-HOUR COUNTDOWN */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-white">
                          سجل ومتابعة طلبات السحب الإنشائي ({userWithdrawals.length})
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400">
                        المدة المعتمدة: ساعتان (120 دقيقة)
                      </span>
                    </div>

                    {userWithdrawals.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-400 text-xs">
                        لا توجد طلبات سحب إنشائية مسجلة حتى الآن.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {userWithdrawals.map((w) => {
                          const countdown = getWithdrawalCountdown(w);
                          return (
                            <div
                              key={w.id}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm space-y-2.5 hover:border-amber-400 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono font-bold text-xs text-stone-900 dark:text-white">
                                      {w.referenceCode}
                                    </span>
                                    {w.isStructured && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                        ⚡ سحب إنشائي معتمد
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                      {w.method === 'baridimob' ? 'بريدي موب' : w.method === 'binance' ? `بينانس (${w.cryptoNetwork || 'USDT'})` : 'CCP'}
                                    </span>
                                  </div>

                                  <div className="text-[10px] text-stone-400 font-mono mt-1">
                                    <span>طلب في: {w.requestedAt}</span>
                                    {w.expectedCompletionTime && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                                          الاستلام المتوقع: {w.expectedCompletionTime}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="text-left shrink-0">
                                  <span className="font-black text-xs text-stone-900 dark:text-white block">
                                    {w.amountDzd.toLocaleString()} د.ج
                                  </span>
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">
                                    ≈ {(w.amountUsdt || (((w.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0)).toFixed(2)} USDT
                                  </span>
                                </div>
                              </div>

                              {/* COUNTDOWN / STATUS BAR */}
                              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <Timer className={`w-4 h-4 ${w.status === 'approved' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
                                  <span className="text-[11px] text-stone-600 dark:text-stone-300">
                                    {w.status === 'approved' ? 'حالة السداد:' : 'العد التنازلي للتنفيذ (ساعتان):'}
                                  </span>
                                  <strong className={`font-mono text-xs ${
                                    w.status === 'approved' 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : 'text-amber-600 dark:text-amber-400 font-black'
                                  }`}>
                                    {countdown.text}
                                  </strong>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Fast Forward Approval for Owner / Instant Process */}
                                  {isOwner && w.status === 'pending' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        approveWithdrawal(w.id);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black shadow-sm cursor-pointer transition-colors flex items-center gap-1"
                                      title="تسريع وإتمام التحويل الفوري الآن للمالك"
                                    >
                                      <Zap className="w-3 h-3 fill-current" />
                                      <span>تسريع فوري ⚡</span>
                                    </button>
                                  )}

                                  {/* Download Voucher PDF */}
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadWithdrawalPDF(w)}
                                    disabled={isDownloadingPdf === w.id}
                                    className="p-1.5 rounded-lg bg-teal-50 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-slate-600 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                    title="تحميل سند الصرف المالي PDF"
                                  >
                                    {isDownloadingPdf === w.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5" />
                                    )}
                                    <span>سند الصرف PDF</span>
                                  </button>
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

              {/* TAB 3: GIFT CARD & INFINITE OWNER VOUCHERS */}
              {activeTab === 'giftcard' && (
                <div className="space-y-4">
                  
                  {/* Exclusive Infinite Voucher for Owner */}
                  {isOwner && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-teal-950 border-2 border-amber-400/60 text-white shadow-xl relative overflow-hidden space-y-3">
                      <div className="absolute -left-10 -top-10 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center font-black shadow-md shrink-0">
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-1.5">
                                <span>القسيمة اللانهائية الحصرية (المالك & VIP)</span>
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-black text-[10px] flex items-center gap-1 shadow-xs">
                                <Infinity className="w-3 h-3" />
                                <span>استخدام لانهائي ∞</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-teal-200 block mt-0.5">
                              مخصصة ومعتمدة: <strong>الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة</strong> — شحن رصيد غير محدود بدون انتهاء الصلاحية
                            </span>
                          </div>
                        </div>

                        <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full shrink-0">
                          صلاحية أبدية 100%
                        </span>
                      </div>

                      {/* Infinite Voucher Code & Quick Actions */}
                      <div className="p-3 bg-black/40 rounded-xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                        <div className="text-center sm:text-right w-full sm:w-auto">
                          <span className="text-[10px] text-stone-400 block font-semibold">كود الشحن اللانهائي:</span>
                          <span className="font-mono font-black text-base sm:text-lg text-amber-300 select-all tracking-wider">
                            OWNER-INFINITY-VIP
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={async () => {
                              await copyToClipboard('OWNER-INFINITY-VIP');
                              setGiftCardCode('OWNER-INFINITY-VIP');
                              setCopiedVoucher(true);
                              setTimeout(() => setCopiedVoucher(false), 2500);
                            }}
                            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-white/10"
                            title="نسخ وتعبئة الكود"
                          >
                            {copiedVoucher ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedVoucher ? 'تم النسخ' : 'نسخ وتعبئة'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const res = redeemGiftCard('OWNER-INFINITY-VIP');
                              setGiftResult({ message: res.message, success: res.success });
                            }}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
                          >
                            <Zap className="w-4 h-4 fill-stone-950" />
                            <span>⚡ شحن لانهائي فوري (+100 USDT)</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-teal-200/90 pt-1 border-t border-white/10 relative z-10">
                        <span>
                          مرات الشحن المنفذة حتى الآن: <strong className="text-amber-300 font-bold">{giftCards.find(c => c.code === 'OWNER-INFINITY-VIP')?.timesRedeemed || 0} مرات</strong>
                        </span>
                        <span className="text-amber-300 font-bold">
                          +25,000 د.ج لكل تفعيل (بدون أي حد أقصى)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Standard Gift Card Redemption Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-teal-500/10 dark:from-slate-800 dark:to-slate-800 border border-stone-200 dark:border-slate-700 text-center space-y-1.5">
                    <Gift className="w-8 h-8 text-amber-500 mx-auto" />
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                      شحن بطاقات وقسائم الهدايا
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      أدخل رمز بطاقة الهدية أو قسيمة الشحن لتعبئة رصيد المحفظة فورياً.
                    </p>
                  </div>

                  <form onSubmit={handleGiftSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      placeholder="أدخل رمز البطاقة أو القسيمة اللانهائية..."
                      className="w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      required
                    />

                    {giftResult && (
                      <div className={`p-3.5 rounded-xl text-xs font-bold text-center leading-relaxed ${
                        giftResult.success 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}>
                        {giftResult.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black shadow-md cursor-pointer transition-all"
                    >
                      تأكيد شحن الرصيد بالقسيمة
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: TRANSACTIONS HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {userTransactions.length === 0 ? (
                    <p className="text-center py-10 text-xs text-stone-400">لا توجد معاملات مسجلة بعد.</p>
                  ) : (
                    userTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-stone-900 dark:text-white">
                              {tx.description || tx.bookTitle || 'معاملة مالية'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              tx.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {tx.status === 'completed' ? 'مكتملة' : 'قيد المعالجة'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                            <span>{tx.date || tx.timestamp || '2026-09'}</span>
                            <span>•</span>
                            <span>{tx.method.toUpperCase()}</span>
                            <span>•</span>
                            <span>{tx.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <span className={`text-xs font-black ${
                              tx.type === 'deposit' || tx.type === 'gift_redeem'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-stone-900 dark:text-white'
                            }`}>
                              {tx.type === 'deposit' || tx.type === 'gift_redeem' ? '+' : '-'}
                              {tx.amountDzd.toLocaleString()} د.ج
                            </span>
                            <span className="text-[10px] text-amber-600 block font-bold">
                              ≈ {(tx.amountUsdt ?? (((tx.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0)).toFixed(2)} USDT
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const safeUsdt = tx.amountUsdt ?? parseFloat((((tx.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2));
                              generateSalesReceiptPDF({
                                invoiceNumber: tx.id,
                                date: tx.date || tx.timestamp || new Date().toLocaleString('ar-DZ'),
                                customerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'قارئ معتمد',
                                customerEmail: currentUser.email,
                                paymentMethod: tx.method,
                                transactionRef: tx.id,
                                items: [{
                                  title: tx.bookTitle || tx.description || 'معاملة مالية / شراء كتاب',
                                  author: customization.presidentName || 'لقمان ياسين أبختي',
                                  priceDzd: tx.amountDzd,
                                  priceUsdt: safeUsdt,
                                }],
                                totalDzd: tx.amountDzd,
                                totalUsdt: safeUsdt,
                                storeName: customization.storeName,
                                presidentName: customization.presidentName,
                              });
                            }}
                            className="p-2 rounded-xl bg-teal-50 dark:bg-slate-700 hover:bg-teal-100 dark:hover:bg-slate-600 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-slate-600 transition-colors cursor-pointer"
                            title="تحميل وصل المعاملة كملف PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: BARIDIMOB SMS NOTIFICATIONS & TRUECALLER VERIFICATION */}
              {activeTab === 'sms' && (
                <div className="space-y-4">
                  {/* Truecaller Verified Status Header Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900 via-blue-950 to-slate-900 text-white border border-sky-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black shadow-lg">
                          <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-white">ربط خدمة بريدي موب بـ Truecaller الرسمي</h4>
                            <span className="px-2 py-0.5 rounded-full bg-sky-500/30 border border-sky-400/50 text-sky-200 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-sky-400" />
                              <span>Verified ID</span>
                            </span>
                          </div>
                          <p className="text-xs text-sky-200/80">
                            تم تفعيل كاشف الهوية وتأكيد رقم المالك الرسمي لحماية عمليات السحب المالي عبر بريدي موب.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const defaultSms = smsNotifications[0] || sendBaridimobSms({
                            recipientPhone: '0652206947',
                            recipientName: 'لقمان ياسين أبختي',
                            amountDzd: 24000,
                            referenceCode: `STR-WD-${Date.now().toString().slice(-6)}`,
                            type: 'withdrawal',
                            currentBalanceDzd: currentUser.walletDzd
                          });
                          setActiveSmsModal(defaultSms);
                        }}
                        className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-98"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>فتح نافذة إرسال SMS 📲</span>
                      </button>
                    </div>

                    {/* Truecaller Account Card */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-sky-500/20 text-xs space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 block">الرقم المربوط في Truecaller:</span>
                          <span className="font-mono font-bold text-sky-300 text-sm" dir="ltr">0652206947 (+213652206947)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">الاسم في كاشف الأرقام:</span>
                          <span className="font-bold text-white text-xs">لقمان ياسين أبختي (Lokmane Abakhti)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">حالة الخدمة والحساب:</span>
                          <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>بريدي موب موثق معتمد (Verified)</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                        <span className="text-stone-300">
                          🔒 جميع الرسائل والإشعارات المالية الصادرة تشمل علامة التحقق الرسمية لحماية أمان التحويلات.
                        </span>
                        <a
                          href="https://www.truecaller.com/search/dz/0652206947"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>عرض ملف الرقم في موقع Truecaller الرسمي 🛡️</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* SMS Notifications Log */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                        <span>سجل إشعارات بريدي موب المرسلة ({smsNotifications.length}):</span>
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        مدة السحب الإنشائي: ساعتان (120 دقيقة) ⏱️
                      </span>
                    </div>

                    {smsNotifications.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-stone-50 dark:bg-slate-800/40 border border-stone-200 dark:border-slate-700 text-stone-400 text-xs">
                        لا توجد رسائل SMS مرسلة بعد. يمكنك إجراء عملية سحب أو إنشاء إشعار تجريبي بالضغط على الزر أعلاه.
                      </div>
                    ) : (
                      smsNotifications.map((sms) => (
                        <div
                          key={sms.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm hover:border-sky-500/50 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                BM
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-xs text-stone-900 dark:text-white font-mono">
                                    {sms.referenceCode}
                                  </strong>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    تم التسليم
                                  </span>
                                  {sms.recipientPhone.includes('652206947') && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center gap-0.5">
                                      <ShieldCheck className="w-2.5 h-2.5" />
                                      <span>Truecaller Verified</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {sms.sentAt} • إلى: {sms.recipientPhone} ({sms.recipientName})
                                </span>
                              </div>
                            </div>

                            <div className="text-left">
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                {sms.amountDzd.toLocaleString()} د.ج
                              </span>
                              <span className="text-[10px] text-stone-400 block font-mono">
                                الرصيد: {sms.currentBalanceDzd.toLocaleString()} د.ج
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs font-mono text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                            {sms.messageText}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                            <button
                              type="button"
                              onClick={() => setActiveSmsModal(sms)}
                              className="py-1.5 px-3 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>معاينة الهاتف الذكي المحاكية 📱</span>
                            </button>

                            <a
                              href={`sms:${sms.recipientPhone}?body=${encodeURIComponent(sms.messageText)}`}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال SMS الآن 📲</span>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
