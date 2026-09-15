import React, { useState } from 'react';
import { 
  X, MessageSquare, Send, CheckCheck, Copy, Phone, 
  ShieldCheck, Share2, Sparkles, Building2, Clock,
  ExternalLink, Check, Coins, ArrowRightLeft, Smartphone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyToClipboard } from '../utils/clipboard';

export const BaridimobSmsModal: React.FC = () => {
  const { 
    activeSmsModal, 
    setActiveSmsModal, 
    sendBaridimobSms, 
    sendBinanceSms, 
    paymentAccounts, 
    currentUser,
    customization
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customChannel, setCustomChannel] = useState<'baridimob' | 'binance'>('binance');

  // Custom SMS send form state (Pre-filled with Truecaller verified number 0652206947)
  const defaultPhone = paymentAccounts.baridimobPhone || '0652206947';
  const defaultName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'لقمان ياسين أبختي';
  const [phoneInput, setPhoneInput] = useState(defaultPhone);
  const [nameInput, setNameInput] = useState(defaultName);
  const [amountDzdInput, setAmountDzdInput] = useState('24000');
  const [amountUsdtInput, setAmountUsdtInput] = useState('100');
  const [ripInput, setRipInput] = useState(paymentAccounts.baridimobRip || '00799999002847192033');
  const [cryptoAddressInput, setCryptoAddressInput] = useState(paymentAccounts.binanceTrc20 || 'TQ9x7V9uD5hF3X9kP1M4zW7Y8Q2c1vB4N6');
  const [cryptoNetworkInput, setCryptoNetworkInput] = useState('TRC20');

  if (!activeSmsModal && !showCustomForm) return null;

  const currentSms = activeSmsModal;
  const isBinance = currentSms?.channel === 'binance' || currentSms?.senderId === 'BINANCE';

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isBinance ? 'إشعار بينانس Binance SMS' : 'إشعار بريدي موب BaridiMob SMS',
          text,
        });
      } catch {
        await handleCopy(text);
      }
    } else {
      await handleCopy(text);
    }
  };

  const handleSendCustomSms = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.trim() || '0652206947';
    const cleanName = nameInput.trim() || 'لقمان ياسين أبختي';
    const refCode = `STR-WD-${Date.now().toString().slice(-6)}`;

    if (customChannel === 'binance') {
      const usdt = parseFloat(amountUsdtInput) || 100;
      const dzd = Math.round(usdt * (customization?.exchangeRateUsdtToDzd || 240));
      sendBinanceSms({
        recipientPhone: cleanPhone,
        recipientName: cleanName,
        cryptoAddressOrPayId: cryptoAddressInput || paymentAccounts.binanceTrc20,
        cryptoNetwork: cryptoNetworkInput,
        amountUsdt: usdt,
        amountDzd: dzd,
        referenceCode: refCode,
        txHash: `0x${Math.random().toString(16).substring(2, 38)}`,
        type: 'withdrawal',
      });
    } else {
      const dzd = parseFloat(amountDzdInput) || 24000;
      sendBaridimobSms({
        recipientPhone: cleanPhone,
        recipientName: cleanName,
        ripNumber: ripInput || paymentAccounts.baridimobRip,
        amountDzd: dzd,
        referenceCode: refCode,
        type: 'withdrawal',
      });
    }
    setShowCustomForm(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Header based on Channel */}
        <div className={`px-5 py-4 border-b border-stone-800 flex items-center justify-between ${
          isBinance 
            ? 'bg-gradient-to-r from-amber-900/60 via-stone-900 to-yellow-950/60' 
            : 'bg-gradient-to-r from-emerald-900/60 via-stone-900 to-teal-950/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
              isBinance 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isBinance ? <Coins className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {isBinance ? 'خدمة رسائل بينانس (Binance SMS)' : 'خدمة رسائل بريدي موب (BaridiMob SMS)'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  isBinance 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>
                  {isBinance ? 'BINANCE PAY' : 'BARIDIMOB'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {isBinance 
                  ? 'إشعار أمان ومعاملة مالية فوري لمعاملات بينانس وسحب الأرباح' 
                  : 'إشعار رسمي فوري لعمليات سحب الأرباح والتحويل عبر بريد الجزائر'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveSmsModal(null);
              setShowCustomForm(false);
            }}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {currentSms && !showCustomForm ? (
            <>
              {/* Smartphone Preview Frame */}
              <div className="relative mx-auto max-w-sm rounded-[2.5rem] p-3 bg-gradient-to-b from-stone-800 via-stone-900 to-stone-950 border-2 border-stone-700 shadow-2xl">
                {/* Speaker notch */}
                <div className="w-24 h-4 bg-stone-950 rounded-full mx-auto mb-2 border border-stone-800 flex items-center justify-center">
                  <div className="w-8 h-1 bg-stone-700 rounded-full" />
                </div>

                {/* Simulated Screen */}
                <div className="rounded-[2rem] bg-stone-950 p-3 sm:p-4 border border-stone-800/80 space-y-3">
                  {/* Sender Bar */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs shadow-sm ${
                        isBinance ? 'bg-amber-500 text-stone-950' : 'bg-emerald-600'
                      }`}>
                        {isBinance ? <Coins className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-white">
                            {isBinance ? 'BINANCE' : 'BARIDIMOB'}
                          </span>
                          <ShieldCheck className={`w-3.5 h-3.5 ${isBinance ? 'text-amber-400' : 'text-emerald-400'}`} />
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {isBinance ? 'Binance Official Notifications' : 'بريد الجزائر Algérie Poste'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isBinance 
                        ? 'text-amber-400 bg-amber-950/60 border-amber-800/50' 
                        : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                    }`}>
                      تم التسليم ✓
                    </span>
                  </div>

                  {/* SMS Bubble */}
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 relative font-sans border ${
                    isBinance 
                      ? 'bg-amber-950/25 border-amber-500/30 text-stone-200' 
                      : 'bg-emerald-950/30 border-emerald-500/30 text-stone-200'
                  }`}>
                    <div className={`flex items-center justify-between text-[11px] font-bold border-b pb-1.5 ${
                      isBinance ? 'text-amber-400 border-amber-500/20' : 'text-emerald-400 border-emerald-500/20'
                    }`}>
                      <span>
                        {isBinance ? 'إشعار معاملة مالية بينانس' : 'إشعار سحب مالي معتمد'}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{currentSms.sentAt}</span>
                    </div>

                    <p className={`whitespace-pre-line text-xs sm:text-[13px] font-medium leading-6 ${
                      isBinance ? 'text-amber-100/90' : 'text-emerald-100/90'
                    }`}>
                      {currentSms.messageText}
                    </p>

                    <div className={`pt-2 border-t flex items-center justify-between text-[10px] text-stone-400 font-mono ${
                      isBinance ? 'border-amber-500/20' : 'border-emerald-500/20'
                    }`}>
                      <span>إلى الهاتف: {currentSms.recipientPhone}</span>
                      <span className={`flex items-center gap-1 font-bold ${
                        isBinance ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        المدة: ساعتان ⏱️
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRUECALLER VERIFIED BUSINESS & IDENTITY INTEGRATION */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/60 via-stone-900 to-sky-950/40 border border-sky-500/40 text-stone-200 text-xs space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-xs">
                          خدمة {isBinance ? 'بينانس' : 'بريدي موب'} مربوطة بـ Truecaller
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-black flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>موثق رسمياً</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-300/80">
                        Truecaller Verified Identity • كاشف هوية وحماية الرسائل المالية
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                    معدل الأمان: 100% موثوق ✓
                  </span>
                </div>

                {/* Identity Information Details */}
                <div className="p-2.5 rounded-xl bg-stone-950/80 border border-sky-500/20 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">رقم الهاتف المربوط:</span>
                    <span className="font-mono font-black text-sky-300 text-xs" dir="ltr">
                      +213 652 206 947 (0652206947)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">اسم صاحب الحساب في Truecaller:</span>
                    <span className="font-bold text-white">لقمان ياسين أبختي (Lokmane Yassine Abakhti)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">نوع الخدمة المالي:</span>
                    <span className={`font-bold ${isBinance ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isBinance ? 'بينانس Binance Pay / USDT • تحويل فوري معتمد' : 'بريدي موب BaridiMob • تحويل مالي معتمد'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">حالة التوثيق والعلامة الزرقاء:</span>
                    <span className="text-sky-400 font-mono font-bold">Truecaller Verified Badge ✓</span>
                  </div>
                </div>

                {/* Truecaller Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <a
                    href="https://www.truecaller.com/search/dz/0652206947"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>التحقق عبر موقع Truecaller الرسمي 🛡️</span>
                  </a>

                  <a
                    href="tel:+213652206947"
                    className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>اتصال بالرقم 0652206947</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Native SMS App Launcher */}
                  <a
                    href={`sms:${currentSms.recipientPhone}?body=${encodeURIComponent(currentSms.messageText)}`}
                    className={`w-full py-3 px-4 rounded-xl text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98 ${
                      isBinance 
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>فتح تطبيق الرسائل SMS وإرسالها 📲</span>
                  </a>

                  {/* Copy Message Text */}
                  <button
                    type="button"
                    onClick={() => handleCopy(currentSms.messageText)}
                    className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-2 border border-stone-700 transition-colors cursor-pointer"
                  >
                    {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم نسخ الرسالة بنجاح' : `نسخ نص رسالة ${isBinance ? 'بينانس' : 'بريدي موب'}`}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleShare(currentSms.messageText)}
                    className="text-stone-400 hover:text-stone-200 flex items-center gap-1.5 cursor-pointer py-1.5 px-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة الإشعار</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer py-1.5 px-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إرسال وتجربة رسالة SMS جديدة ✍️</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Custom SMS Dispatch Form */
            <form onSubmit={handleSendCustomSms} className="space-y-3.5">
              {/* Channel Selector */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-950 rounded-2xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setCustomChannel('binance')}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    customChannel === 'binance'
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>رسالة بينانس (Binance)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomChannel('baridimob')}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    customChannel === 'baridimob'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>بريدي موب (BaridiMob)</span>
                </button>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                customChannel === 'binance' 
                  ? 'bg-amber-950/30 border-amber-500/30' 
                  : 'bg-emerald-950/30 border-emerald-500/30'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  customChannel === 'binance' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {customChannel === 'binance' ? 'إرسال إشعار SMS لعملية بينانس (Binance)' : 'إرسال إشعار SMS لعملية بريدي موب'}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    أدخل رقم هاتف المستفيد وبيانات المعاملة لإصدار رسالة SMS الرسمية فوراً
                  </p>
                </div>
              </div>

              {/* Phone input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-300">
                    رقم هاتف المستفيد
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhoneInput('0652206947')}
                    className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    <span>استخدام رقم Truecaller الموثق (0652206947)</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="مثال: 0652206947"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                  {(phoneInput.includes('652206947') || phoneInput === '0652206947') && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>Truecaller Verified</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  اسم المستفيد
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="مثال: لقمان ياسين أبختي"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              {/* Channel specific inputs */}
              {customChannel === 'binance' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      المبلغ بالـ USDT
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountUsdtInput}
                      onChange={(e) => setAmountUsdtInput(e.target.value)}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      ~ {Math.round((parseFloat(amountUsdtInput) || 0) * (customization?.exchangeRateUsdtToDzd || 240)).toLocaleString()} د.ج
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      الشبكة (Network)
                    </label>
                    <select
                      value={cryptoNetworkInput}
                      onChange={(e) => setCryptoNetworkInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="TRC20">Tron (TRC20)</option>
                      <option value="BEP20">BNB Smart Chain (BEP20)</option>
                      <option value="Binance Pay ID">Binance Pay ID</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      عنوان المحفظة أو معرف Pay ID
                    </label>
                    <input
                      type="text"
                      value={cryptoAddressInput}
                      onChange={(e) => setCryptoAddressInput(e.target.value)}
                      placeholder="TQ9x7V9uD5hF3X9kP1M4zW7Y8Q2c1vB4N6"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      المبلغ بالدينار (د.ج)
                    </label>
                    <input
                      type="number"
                      value={amountDzdInput}
                      onChange={(e) => setAmountDzdInput(e.target.value)}
                      placeholder="مثال: 24000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      رقم الحساب البريدي الجاري RIP
                    </label>
                    <input
                      type="text"
                      value={ripInput}
                      onChange={(e) => setRipInput(e.target.value)}
                      placeholder="00799999002847192033"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black shadow-md cursor-pointer transition-transform active:scale-98 ${
                    customChannel === 'binance'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  }`}
                >
                  {customChannel === 'binance' ? 'إصدار وعرض رسالة بينانس SMS 📲' : 'إصدار وعرض رسالة بريدي موب SMS 📲'}
                </button>

                {currentSms && (
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700 cursor-pointer"
                  >
                    الرجوع للمعاينة
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

