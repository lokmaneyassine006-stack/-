import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, Copy, Check, Sparkles, Gift, Download, ExternalLink, 
  Award, ArrowRight, MessageCircle, Send, Globe, QrCode, CheckCircle2,
  TrendingUp, Users, HeartHandshake, ShieldCheck, Zap, Coins, Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { Book } from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface PurchasePromotionToolProps {
  booksPurchased?: Book[];
  txRef?: string;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const PurchasePromotionTool: React.FC<PurchasePromotionToolProps> = ({
  booksPurchased = [],
  txRef,
  onClose,
  isEmbedded = false,
}) => {
  const { currentUser, customization, updateWalletBalance, rewardPromotionBonus, lastPurchasedPromotion, setActiveModal } = useStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [isGeneratingStoryCard, setIsGeneratingStoryCard] = useState(false);
  const [downloadedCard, setDownloadedCard] = useState(false);
  const [autoCopied, setAutoCopied] = useState(false);
  const [bonusAlert, setBonusAlert] = useState<{ message: string; amount: number; balance: number } | null>(null);
  const [promotionsCount, setPromotionsCount] = useState(1);
  const [totalPromotionsEarned, setTotalPromotionsEarned] = useState(200);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const effectiveBooks = booksPurchased.length > 0 ? booksPurchased : (lastPurchasedPromotion?.books || []);
  const effectiveTxRef = txRef || lastPurchasedPromotion?.txRef;

  const storeName = customization?.storeName || 'معا نحو التغيير';
  const presidentName = customization?.presidentName || 'لقمان ياسين أبختي';
  const referralCode = currentUser ? `REF-${currentUser.id.slice(0, 5).toUpperCase()}` : 'CHANGE2026';
  const promoDiscountCode = 'READ20';

  // Base URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://together-change.dz';
  const referralUrl = `${baseUrl}/?ref=${referralCode}&promo=${promoDiscountCode}`;

  const bookTitle = effectiveBooks.length > 0 ? effectiveBooks[0].title : 'مجموعة من أروع الكتب القيمة';

  // Promotional Share Messages
  const promotionalPitch = `📚 أنصحكم بقراءة: "${bookTitle}"\n\nلقد قمت باقتنائه وتجربته عبر منصة "${storeName}" الرسمية لنشر وتوزيع الكتب برئاسة ${presidentName}.\n\n🎁 استخدم الرابط التالي للحصول على خصم 20% ورصيد هدية ترحيبي:\n${referralUrl}\n\nكود الخصم المعتمد: ${promoDiscountCode}`;

  // Trigger celebratory confetti once mounted and auto-copy promotional link
  useEffect(() => {
    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0f766e', '#d97706', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    // Attempt safe background copy only if document has focus
    if (typeof document !== 'undefined' && typeof document.hasFocus === 'function' && document.hasFocus()) {
      copyToClipboard(promotionalPitch).then((success) => {
        if (success) {
          setAutoCopied(true);
          setTimeout(() => setAutoCopied(false), 5000);
        }
      }).catch(() => {});
    }
  }, [promotionalPitch]);

  // Give Instant Promotion Reward (200 DZD credited directly to wallet)
  const rewardSharingBonus = (actionLabel = 'مشاركة الرابط والترويج للمنصة') => {
    if (!currentUser) return;
    const bonusAmount = 200;
    const res = rewardPromotionBonus(bonusAmount, `مكافأة ترويج: ${actionLabel}`, bookTitle);
    setPromotionsCount((prev) => prev + 1);
    setTotalPromotionsEarned((prev) => prev + bonusAmount);
    setBonusAlert({
      message: `🎉 تهانينا! تم إيداع مبلغ الترويج (+${bonusAmount.toLocaleString()} د.ج) في محفظتك الإلكترونية بنجاح!`,
      amount: bonusAmount,
      balance: res.newBalance
    });
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      setBonusAlert(null);
    }, 6000);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(referralUrl);
    setCopiedLink(true);
    rewardSharingBonus('نسخ ومشاركة رابط الإحالة الترويجي');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = async () => {
    await copyToClipboard(promoDiscountCode);
    setCopiedCode(true);
    rewardSharingBonus('نسخ ومشاركة كود الخصم الترويجي');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyPitch = async () => {
    await copyToClipboard(promotionalPitch);
    setCopiedPitch(true);
    rewardSharingBonus('نسخ ونشر منشور التوصية والترويج');
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  // Social Sharing Functions
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(promotionalPitch);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    rewardSharingBonus('مشاركة ترويجية عبر واتساب');
  };

  const handleShareTelegram = () => {
    const encodedText = encodeURIComponent(promotionalPitch);
    const encodedUrl = encodeURIComponent(referralUrl);
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
    rewardSharingBonus('مشاركة ترويجية عبر تيليجرام');
  };

  const handleShareFacebook = () => {
    const encodedUrl = encodeURIComponent(referralUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    rewardSharingBonus('مشاركة ترويجية عبر فيسبوك');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`أنصحكم باقتناء "${bookTitle}" من منصة ${storeName} 📚✨ استخدم كود ${promoDiscountCode} للخصم:`);
    const encodedUrl = encodeURIComponent(referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, '_blank');
    rewardSharingBonus('مشاركة ترويجية عبر تويتر / X');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeName} - ${bookTitle}`,
          text: promotionalPitch,
          url: referralUrl,
        });
        rewardSharingBonus('مشاركة ترويجية مباشرة');
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyPitch();
    }
  };

  // Generate & Download Visual Story Promotional Card
  const handleGenerateStoryCard = async () => {
    setIsGeneratingStoryCard(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920; // 9:16 Story format
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#042f2e'); // Deep teal
      grad.addColorStop(0.5, '#0f766e');
      grad.addColorStop(1, '#064e3b'); // Deep emerald
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Gold Glow overlay circles
      ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
      ctx.beginPath();
      ctx.arc(540, 450, 420, 0, Math.PI * 2);
      ctx.fill();

      // Golden Outer Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, 1000, 1840);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 960, 1800);

      // Store Title Top
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 56px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(storeName, 540, 190);

      ctx.fillStyle = '#99f6e4';
      ctx.font = '32px "Cairo", sans-serif';
      ctx.fillText(`المنصة الرسمية لنشر المعرفة والكتب المعتمدة 2026`, 540, 255);

      // Badge Container
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(140, 310, 800, 75, 38);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 30px "Cairo", sans-serif';
      ctx.fillText(`★ موصى به رسمياً ومحمى بحقوق الملكية الفكرية ★`, 540, 358);

      // Main Feature Card (White/Gold)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(100, 430, 880, 820, 36);
      ctx.fill();

      // Card Header
      ctx.fillStyle = '#0f766e';
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.fillText('📖 كتاب مميز يستحق القراءة', 540, 520);

      // Book Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 48px "Cairo", serif';
      const maxTitleChars = 32;
      const displayTitle = bookTitle.length > maxTitleChars ? bookTitle.substring(0, maxTitleChars) + '...' : bookTitle;
      ctx.fillText(displayTitle, 540, 610);

      // Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(180, 665);
      ctx.lineTo(900, 665);
      ctx.stroke();

      // Recommendation Text
      ctx.fillStyle = '#334155';
      ctx.font = '32px "Cairo", sans-serif';
      ctx.fillText('قمت باقتناء هذا الإصدار القيّم وأنصح جميع المهتمين', 540, 740);
      ctx.fillText('بالتطوير والمعرفة بقراءته والاستماع إليه حصرياً.', 540, 795);

      // Discount Box Inside Card
      ctx.fillStyle = '#fef2f2';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.roundRect(160, 860, 760, 170, 24);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.fillText(`كوبون خصم خاص لمتابعيني وأصدقائي:`, 540, 925);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 50px "Cairo", monospace';
      ctx.fillText(`${promoDiscountCode} (خصم 20% فوري)`, 540, 990);

      // Platform Guarantee Bottom
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 30px "Cairo", sans-serif';
      ctx.fillText(`إشراف وإدارة المؤسس: ${presidentName}`, 540, 1180);

      // Referral / QR Box at Bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(100, 1300, 880, 440, 36);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 42px "Cairo", sans-serif';
      ctx.fillText('📲 امسح أو ادخل الرابط للشراء المباشر:', 540, 1380);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Cairo", monospace';
      ctx.fillText(referralUrl.replace('https://', ''), 540, 1460);

      // Simulated clean QR box
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(440, 1510, 200, 200, 20);
      ctx.fill();

      // QR decorative pattern
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(460, 1530, 50, 50);
      ctx.fillRect(570, 1530, 50, 50);
      ctx.fillRect(460, 1640, 50, 50);
      ctx.fillRect(530, 1600, 40, 40);
      ctx.fillRect(580, 1640, 30, 30);
      ctx.fillRect(460, 1595, 30, 30);

      // Bottom Footer
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '26px "Cairo", sans-serif';
      ctx.fillText('معاً نحو التغيير © 2026 - نشر المعرفة وتطوير الفكر العربي', 540, 1870);

      // Download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ترويج_${bookTitle.replace(/\s+/g, '_')}_ستوري.jpg`;
      link.click();
      setDownloadedCard(true);
      rewardSharingBonus('إنشاء وتحميل بطاقة الستوري الترويجية');
      setTimeout(() => setDownloadedCard(false), 4000);
    } catch (err) {
      console.error('Error generating promo card:', err);
    } finally {
      setIsGeneratingStoryCard(false);
    }
  };

  const containerClasses = isEmbedded
    ? 'w-full rounded-2xl bg-gradient-to-br from-teal-900/90 via-slate-900 to-emerald-950 p-4 sm:p-5 text-white border border-teal-500/40 shadow-xl space-y-4'
    : 'relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden text-stone-900 dark:text-white';

  const innerContent = (
    <div className="space-y-4 text-right">
      
      {/* Automatic Promotion Live Confirmation Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 text-white p-4 rounded-2xl shadow-xl border border-teal-400/40 relative overflow-hidden animate-in slide-in-from-top-2">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center shrink-0 shadow-md font-black">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-amber-300">
                  ⚡ تم الترويج التلقائي للموقع بنجاح فور الشراء!
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px]">
                  مُفعّل تلقائياً 100%
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-1 leading-relaxed">
                تم تفعيل كود الخصم (<strong>{promoDiscountCode}</strong>) ورابط الإحالة الخاص بك، مع بث إشعار ترويجي فوري في المنصة، وإيداع <strong>+200 د.ج</strong> رصيد مكافأة في محفظتك الإلكترونية.
              </p>
              {autoCopied && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/40 text-[11px] font-bold text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تم نسخ الرسالة الترويجية ورابط الخصم تلقائياً إلى الحافظة!</span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-amber-200 text-[11px] font-black border border-white/15">
              كود الخصم: {promoDiscountCode}
            </span>
            <span className="text-[10px] text-teal-200">خصم 20% + عمولة 10%</span>
          </div>
        </div>
      </div>

      {/* Prominent Promotion Wallet Credit Card */}
      <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/20 to-teal-500/15 border-2 border-amber-400/60 dark:border-amber-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md font-black">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className="font-black text-sm text-stone-900 dark:text-white">
                مكافأة الترويج الفورية للمحفظة 💰
              </h5>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                +200 د.ج لكل ترويج
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              رصيد محفظتك الحالي: <strong className="text-teal-700 dark:text-teal-400 font-bold">{currentUser?.walletDzd?.toLocaleString() || 0} د.ج</strong>
              <span className="mr-2 text-stone-400">• أرباح الترويج: +{totalPromotionsEarned.toLocaleString()} د.ج</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => rewardSharingBonus('إيداع مباشر لمكافأة الترويج')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="إضافة مبلغ الترويج إلى المحفظة الآن"
          >
            <Zap className="w-4 h-4 fill-stone-950" />
            <span>إضافة مبلغ الترويج لمحفظتي (+200 د.ج)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              setActiveModal('wallet');
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-400 transition-colors cursor-pointer"
            title="معاينة رصيد المحفظة والمعاملات"
          >
            <Wallet className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Bonus Notification Banner */}
      {bonusAlert && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-md animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            <div>
              <span className="block font-black">{bonusAlert.message}</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-normal">
                تم تسجيل المعاملة رسمياً في سجل محفظتك. الرصيد الجديد: <strong>{bonusAlert.balance.toLocaleString()} د.ج</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              setActiveModal('wallet');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black cursor-pointer shrink-0 transition-colors"
          >
            فتح المحفظة
          </button>
        </div>
      )}

      {/* Promotion Title & Value Proposition */}
      <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 p-3.5 rounded-2xl border border-amber-400/30 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-black">
          <Gift className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-xs sm:text-sm text-amber-600 dark:text-amber-400">
              أداة الترويج وبرنامج الأرباح التشاركية 🎁
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
              عمولة 10% فورية + مكافأة نقدية
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
            عند مشاركة أي رابط أو منشور ترويجي، <strong>يُضاف مبلغ الترويج مباشرة لمحفظتك</strong>، ويحصل صديقك على خصم 20%، بالإضافة لعمولة 10% تضاف لمحفظتك مع كل عملية شراء جديدة!
          </p>
        </div>
      </div>

      {/* 1-Click Social Sharing Buttons */}
      <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>المشاركة والنشر الفوري بنقرة واحدة:</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب (WhatsApp)</span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={handleShareTelegram}
            className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>تيليجرام (Telegram)</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={handleShareFacebook}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>فيسبوك (Facebook)</span>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={handleShareTwitter}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] cursor-pointer border border-stone-700"
          >
            <Share2 className="w-4 h-4" />
            <span>تويتر (X)</span>
          </button>
        </div>
      </div>

      {/* Referral Link & Promo Code Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        
        {/* Referral Link Box */}
        <div className="sm:col-span-2 p-3 bg-stone-100 dark:bg-slate-800/80 rounded-xl border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <div className="truncate flex-1">
            <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-medium">رابط الإحالة الترويجي الخاص بك:</span>
            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 truncate block dir-ltr text-left">
              {referralUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              copiedLink ? 'bg-emerald-600 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
          </button>
        </div>

        {/* Promo Code Box */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-medium">كوبون خصم أصدقائك:</span>
            <span className="text-xs font-mono font-black text-amber-900 dark:text-amber-200">
              {promoDiscountCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
            title="نسخ كود الخصم"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Copy Pre-formatted Recommendation Post */}
      <div className="p-3 bg-stone-50 dark:bg-slate-800/50 rounded-xl border border-stone-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>نص التوصية الترويجية الجاهز للنشر:</span>
          </span>
          <button
            type="button"
            onClick={handleCopyPitch}
            className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {copiedPitch ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPitch ? 'تم نسخ الرسالة بالكامل!' : 'نسخ النص كامل'}</span>
          </button>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans line-clamp-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-stone-200 dark:border-slate-800">
          {promotionalPitch}
        </p>
      </div>

      {/* Action Footer: Story Visual Graphic Generator & Native Share */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        
        {/* Story Visual Card Generator */}
        <button
          type="button"
          onClick={handleGenerateStoryCard}
          disabled={isGeneratingStoryCard}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {isGeneratingStoryCard ? (
            <span>جارٍ إنشاء بطاقة الستوري الترويجية...</span>
          ) : downloadedCard ? (
            <>
              <Check className="w-4 h-4" />
              <span>تم تحميل بطاقة الستوري بنجاح! 📸</span>
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4" />
              <span>تحميل بطاقة دعوة مصورة للستوري والمنشورات 🎨</span>
            </>
          )}
        </button>

        {/* Native Share button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة سريعة</span>
          </button>
        )}
      </div>

    </div>
  );

  if (isEmbedded) {
    return <div className={containerClasses}>{innerContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={containerClasses}>
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight">
                روّج للمنصة واربح مكافآت وعمولات فورية 🚀
              </h3>
              <span className="text-xs text-teal-100 font-medium">
                شكراً لاقتنائك الكتاب! انشر المعرفة وشارك الرابط مع أصدقائك
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {innerContent}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-900 dark:text-white text-xs font-black transition-colors cursor-pointer"
            >
              إتمام والعودة إلى المتجر
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
