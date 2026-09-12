import React, { useState } from 'react';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, CreditCard, 
  Zap, Gift, Wallet, Check, AlertCircle, Sparkles, Building2,
  Crown, Infinity, Tag, CheckCheck, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currencies';
import { PurchasePromotionTool } from './PurchasePromotionTool';

interface CartDrawerProps {
  onClose: () => void;
  onOpenBinancePay: () => void;
  onOpenBaridimobPay: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onClose,
  onOpenBinancePay,
  onOpenBaridimobPay,
}) => {
  const { 
    cart, 
    books, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    cartTotalDzd, 
    selectedCurrency, 
    customization, 
    paymentAccounts, 
    currentUser, 
    processPurchase,
    giftCards
  } = useStore();

  const isSaadBouacha = 
    (currentUser.firstName?.includes('سعد') && currentUser.lastName?.includes('بوعشة')) || 
    currentUser.email?.toLowerCase().includes('bouacha') ||
    currentUser.email?.toLowerCase().includes('saad');

  const isOwner = currentUser.role === 'owner' || 
    currentUser.email === 'lokmane.abekhti@change.dz' ||
    currentUser.email === 'lokmaneyassine006@gmail.com' ||
    isSaadBouacha;

  const [paymentMethod, setPaymentMethod] = useState<'binance' | 'baridimob' | 'cib_ccp' | 'wallet'>('binance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{ message: string; txRef: string } | null>(null);

  // Coupon & Infinite Owner Voucher State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    isInfiniteOwner?: boolean;
    description?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Calculate discounted total
  const discountRate = appliedCoupon ? appliedCoupon.discountPercent / 100 : 0;
  const discountDzd = Math.round(cartTotalDzd * discountRate);
  const finalCartTotalDzd = Math.max(0, cartTotalDzd - discountDzd);

  const priceObj = formatPrice(finalCartTotalDzd, selectedCurrency, customization.exchangeRateUsdtToDzd);
  const originalPriceObj = formatPrice(cartTotalDzd, selectedCurrency, customization.exchangeRateUsdtToDzd);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'OWNER-INFINITY-VIP' || clean === 'LOKMANE-VIP-INFINITE' || clean.startsWith('OWNER-INF')) {
      if (!isOwner) {
        setCouponError('🚫 تنبيه أمني: هذه القسيمة اللانهائية مخصصة ومحصورة حصرياً لمالك المنصة وإدارتها العليا (الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة).');
        return;
      }
      setAppliedCoupon({
        code: clean,
        discountPercent: 100,
        isInfiniteOwner: true,
        description: isSaadBouacha 
          ? 'القسيمة اللانهائية الحصرية للأستاذ سعد بوعشة (خصم 100% مجاني ∞)' 
          : 'القسيمة اللانهائية الحصرية لمالك المنصة (خصم 100% مجاني ∞)'
      });
      const welcomeName = isSaadBouacha ? 'سعد بوعشة' : (currentUser.firstName || 'لقمان');
      setCouponSuccess(`👑 مرحباً بالأستاذ ${welcomeName}! تم تطبيق القسيمة اللانهائية بنجاح (خصم 100% مجاني بدون استهلاك للرصيد وبشكل دائم).`);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {}
      return;
    }

    if (clean === 'READ20') {
      setAppliedCoupon({
        code: 'READ20',
        discountPercent: 20,
        isInfiniteOwner: false,
        description: 'خصم القراءة والترحيب 20%'
      });
      setCouponSuccess('✓ تم تطبيق كود الخصم READ20 بنجاح (خصم 20%)!');
      return;
    }

    const foundCard = giftCards.find((c) => c.code.toUpperCase() === clean);
    if (foundCard) {
      if (foundCard.ownerOnly && !isOwner) {
        setCouponError('🚫 تنبيه أمني: هذه القسيمة مخصصة حصرياً لمالك المنصة وإدارتها العليا.');
        return;
      }
      const disc = foundCard.discountPercentage || 25;
      setAppliedCoupon({
        code: foundCard.code,
        discountPercent: disc,
        isInfiniteOwner: foundCard.isInfinite,
        description: foundCard.description || `قسيمة خصم ${disc}%`
      });
      setCouponSuccess(`✓ تم تطبيق القسيمة ${foundCard.code} بنجاح!`);
      return;
    }

    setCouponError('كود القسيمة غير صالح أو غير موجود.');
  };

  const handleApplyOwnerInfiniteOneClick = () => {
    if (!isOwner) {
      setCouponError('🚫 تنبيه أمني: هذه القسيمة اللانهائية مخصصة ومحصورة حصرياً لمالك المنصة وإدارتها العليا (الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة).');
      return;
    }
    setCouponCode('OWNER-INFINITY-VIP');
    setAppliedCoupon({
      code: 'OWNER-INFINITY-VIP',
      discountPercent: 100,
      isInfiniteOwner: true,
      description: isSaadBouacha 
        ? 'القسيمة اللانهائية الحصرية للأستاذ سعد بوعشة (خصم 100% مجاني ∞)' 
        : 'القسيمة اللانهائية الحصرية لمالك المنصة (خصم 100% مجاني ∞)'
    });
    const welcomeName = isSaadBouacha ? 'سعد بوعشة' : (currentUser.firstName || 'لقمان');
    setCouponSuccess(`👑 مرحباً بالأستاذ ${welcomeName}! تم تطبيق القسيمة اللانهائية بنجاح (خصم 100% مجاني دائم ولانهائي).`);
    setCouponError(null);
    try {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Check if 100% discount applied via owner infinite voucher or 0 total
    if (finalCartTotalDzd === 0 || appliedCoupon?.discountPercent === 100) {
      setIsProcessing(true);
      setTimeout(() => {
        const bookIds = cart.map((c) => c.bookId);
        const res = processPurchase(bookIds, 'gift_card');
        setIsProcessing(false);
        if (res.success) {
          setSuccessResult({ 
            message: `👑 تم تأكيد الاقتناء بنجاح عبر القسيمة اللانهائية للمالك (${appliedCoupon?.code || 'OWNER-INFINITY-VIP'})! الكتب متاحة الآن للتحميل، والقسيمة تظل صالحة ومفعلة للاستخدام اللانهائي.`, 
            txRef: res.txRef 
          });
        }
      }, 900);
      return;
    }

    if (paymentMethod === 'binance') {
      onOpenBinancePay();
      return;
    }

    if (paymentMethod === 'baridimob') {
      onOpenBaridimobPay();
      return;
    }

    if (paymentMethod === 'wallet') {
      if (currentUser.walletDzd < finalCartTotalDzd) {
        alert('رصيد المحفظة غير كافٍ. يرجى شحن الرصيد أو اختيار وسيلة دفع أخرى.');
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      const bookIds = cart.map((c) => c.bookId);
      const res = processPurchase(bookIds, paymentMethod);
      setIsProcessing(false);
      if (res.success) {
        setSuccessResult({ message: res.message, txRef: res.txRef });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-r border-stone-200 dark:border-slate-800">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between bg-stone-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white">
                سلة المشتريات
              </h3>
              <span className="text-[11px] text-stone-400">
                {cart.length} كتب مضافة
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {successResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-stone-900 dark:text-white">
                تم تأكيد الشراء بنجاح!
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {successResult.message}
              </p>
              <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-xl font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                رقم المعاملة: {successResult.txRef}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                إغلاق والبدء بالقراءة
              </button>

              {/* Promotional Sharing & Rewards Tool */}
              <div className="pt-2 border-t border-stone-200 dark:border-slate-800 text-right">
                <PurchasePromotionTool
                  txRef={successResult.txRef}
                  isEmbedded={true}
                />
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-stone-600 dark:text-stone-300">السلة فارغة حالياً</p>
              <p className="text-xs text-stone-400">تصفح المتجر وأضف كتبك المفضلة لبدء القراءة والاستماع الصوتي.</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const book = books.find((b) => b.id === item.bookId);
                  if (!book) return null;
                  
                  let itemPriceDzd = book.priceDzd;
                  if (item.format === 'bundle') itemPriceDzd = Math.round(book.priceDzd * 1.35);
                  if (item.format === 'audio') itemPriceDzd = Math.round(book.priceDzd * 1.1);

                  const itemPrice = formatPrice(itemPriceDzd, selectedCurrency, customization.exchangeRateUsdtToDzd);

                  return (
                    <div
                      key={`${item.bookId}-${item.format}`}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex gap-3"
                    >
                      <img
                        src={book.coverUrl}
                        alt=""
                        className="w-14 h-20 object-cover rounded-xl shadow-xs"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1">
                            {book.title}
                          </h4>
                          <span className="text-[10px] text-stone-400 block">{book.author}</span>
                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                            {item.format === 'digital' ? 'نسخة رقمية (PDF/Text)' : item.format === 'audio' ? 'نسخة صوتية كاملة' : 'الباقة الكاملة (رقمي + صوتي)'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-stone-900 dark:text-white">
                            {itemPrice.formatted}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center border border-stone-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900">
                              <button
                                onClick={() => updateCartQuantity(item.bookId, item.quantity - 1)}
                                className="p-1 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-500 rounded-r-lg cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.bookId, item.quantity + 1)}
                                className="p-1 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-500 rounded-l-lg cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.bookId)}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="إزالة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon / Voucher Redemption Section */}
              <div className="pt-3 border-t border-stone-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>قسيمة التخفيض أو كود الهدية:</span>
                  </span>
                  {appliedCoupon && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      مفعلة: خصم {appliedCoupon.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Exclusive 1-Click for Platform Owner */}
                {isOwner && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-2 border-amber-400/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                          {isSaadBouacha ? 'القسيمة اللانهائية المخصصة (للأستاذ سعد بوعشة)' : 'القسيمة اللانهائية الحصرية لمالك المنصة وإدارتها'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 text-[10px] font-black flex items-center gap-0.5 shadow-xs">
                        <Infinity className="w-3 h-3" />
                        <span>لانهائي ∞</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                      كودك المخصص: <strong className="font-mono text-amber-600 dark:text-amber-400">OWNER-INFINITY-VIP</strong> (خصم 100% مجاني ومستمر دون نفاذ الصلاحية).
                    </p>

                    <button
                      type="button"
                      onClick={handleApplyOwnerInfiniteOneClick}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Infinity className="w-3.5 h-3.5" />
                      <span>{appliedCoupon?.isInfiniteOwner ? '✓ تم تفعيل القسيمة اللانهائية (خصم 100% مجاني)' : '⚡ تطبيق القسيمة اللانهائية الآن (مجاني 100%)'}</span>
                    </button>
                  </div>
                )}

                {/* Voucher Input Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="أدخل كود القسيمة (مثال: OWNER-INFINITY-VIP)..."
                    className="flex-1 px-3 py-2 text-xs font-mono uppercase rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black cursor-pointer transition-colors shrink-0"
                  >
                    تطبيق
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                    {couponError}
                  </p>
                )}

                {couponSuccess && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    {couponSuccess}
                  </p>
                )}
              </div>

              {/* Payment Methods Selection (Only if total > 0) */}
              {finalCartTotalDzd > 0 ? (
                <div className="pt-3 border-t border-stone-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    اختر طريقة الدفع:
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('binance')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'binance'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-900" />
                      <span>Binance Pay (USDT)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('baridimob')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'baridimob'
                          ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>بريدي موب (RIP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cib_ccp')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === 'cib_ccp'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>CIB / CCP</span>
                    </button>

                    {currentUser.role === 'owner' && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'wallet'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        <span>محفظة المالك ({currentUser.walletDzd.toLocaleString()} د.ج)</span>
                      </button>
                    )}
                  </div>

                  {paymentMethod === 'baridimob' && (
                    <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-900 dark:text-teal-200 block">حساب بريدي موب الرسمي (RIP):</span>
                        <span className="text-[10px] font-bold bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full">بريد الجزائر</span>
                      </div>
                      <span className="font-mono text-teal-800 dark:text-teal-300 block select-all font-black text-sm">
                        {paymentAccounts.baridimobRip}
                      </span>
                      <span className="text-[10px] text-teal-700 dark:text-teal-400 block">
                        المستفيد: {paymentAccounts.baridimobHolder}
                      </span>
                      <button
                        type="button"
                        onClick={onOpenBaridimobPay}
                        className="w-full py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>فتح واجهة الدفع السريع وتأكيد الوصل</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-center">
                  <span className="font-black text-emerald-800 dark:text-emerald-300 block text-sm">
                    🎉 التكلفة الإجمالية: 0 د.ج (مجاناً 100%)
                  </span>
                  <span className="text-stone-600 dark:text-stone-400 text-[11px] block">
                    مغطى بالكامل عبر القسيمة اللانهائية للمالك. لا حاجة لأي وسيلة دفع خارجية.
                  </span>
                </div>
              )}
            </>
          )}

        </div>

        {/* Drawer Footer Total & Checkout Button */}
        {cart.length > 0 && !successResult && (
          <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/80 space-y-3">
            <div className="space-y-1.5">
              {discountDzd > 0 && (
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>السعر الأصلي:</span>
                  <span className="line-through">{originalPriceObj.formatted}</span>
                </div>
              )}
              {discountDzd > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>قيمة الخصم ({appliedCoupon?.discountPercent}%):</span>
                  <span>- {discountDzd.toLocaleString()} د.ج</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500">المجموع المطلوب:</span>
                <div className="text-left">
                  <span className="text-lg font-black text-stone-900 dark:text-white block">
                    {priceObj.formatted}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    (≈ {priceObj.approxUsdt} USDT)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-2xl text-xs font-black shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
                finalCartTotalDzd === 0 || appliedCoupon?.isInfiniteOwner
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 shadow-amber-500/20'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {isProcessing ? (
                <span>جاري معالجة الطلب...</span>
              ) : finalCartTotalDzd === 0 || appliedCoupon?.isInfiniteOwner ? (
                <>
                  <Crown className="w-4 h-4 text-stone-950" />
                  <span>اقتناء فوري مجاني 100% عبر قسيمة المالك اللانهائية</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>إتمام الشراء واستلام الكتب فوراً</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
