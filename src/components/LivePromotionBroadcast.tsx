import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Gift, Copy, Check, Share2, ExternalLink, X, BookOpen, 
  TrendingUp, Award, MessageCircle, Send
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PromotionBroadcast } from '../types';
import { copyToClipboard } from '../utils/clipboard';

export const LivePromotionBroadcast: React.FC = () => {
  const { livePromotions, customization, setActiveBookForModal, books, setActiveModal, rewardPromotionBonus } = useStore();
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  // Automatically cycle through recent promotional broadcasts every 9 seconds
  useEffect(() => {
    if (livePromotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % livePromotions.length);
      setIsCopied(false);
    }, 9000);
    return () => clearInterval(interval);
  }, [livePromotions.length]);

  if (!livePromotions || livePromotions.length === 0 || !isVisible) {
    return null;
  }

  const activePromo: PromotionBroadcast = livePromotions[currentPromoIndex] || livePromotions[0];
  if (!activePromo || activePromo.id === dismissedId) {
    return null;
  }

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(activePromo.discountCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleViewBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    const book = books.find((b) => b.id === activePromo.bookId);
    if (book) {
      setActiveBookForModal(book);
    }
  };

  const handleSharePromo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const storeName = customization?.storeName || 'معا نحو التغيير';
    const text = `📚 أنصحكم بقراءة "${activePromo.bookTitle}" عبر منصة ${storeName}! احصل على خصم 20% بكود ${activePromo.discountCode}: ${activePromo.referralLink}`;
    
    rewardPromotionBonus(200, 'مشاركة البث الترويجي المباشر', activePromo.bookTitle);
    setRewardClaimed(true);
    setTimeout(() => setRewardClaimed(false), 4000);

    if (navigator.share) {
      navigator.share({
        title: storeName,
        text,
        url: activePromo.referralLink,
      }).catch(() => {});
    } else {
      await copyToClipboard(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <aside
      aria-label="إشعار الترويج التلقائي المباشر للمنصة"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 shadow-2xl border border-amber-500/30 dark:border-amber-400/20 text-stone-900 dark:text-white overflow-hidden">
        
        {/* Top glowing progress / accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 animate-pulse" />

        {/* Close / Dismiss Button */}
        <button
          onClick={() => {
            setDismissedId(activePromo.id);
            setIsVisible(false);
          }}
          className="absolute top-2 left-2 p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
          title="إخفاء الإشعار"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 text-right">
          
          {/* Animated Promotion Badge Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            
            {/* Header: Live purchase notification */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                ترويج مباشر للموقع • عملية شراء جديدة
              </span>
              <span className="text-[10px] text-stone-400">{activePromo.timestamp}</span>
            </div>

            {/* Buyer & Book Info */}
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1 leading-snug line-clamp-1">
              قام <span className="text-teal-600 dark:text-teal-400">{activePromo.buyerName}</span> باقتناء:
            </p>
            <p className="text-xs font-black text-amber-600 dark:text-amber-400 line-clamp-1 font-serif">
              «{activePromo.bookTitle}»
            </p>

            {/* Promotional Offer Callout */}
            <div className="mt-2 p-2 rounded-xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-700 dark:text-stone-300">
                <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>خصم 20% فوري:</span>
                <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-black text-[11px]">
                  {activePromo.discountCode}
                </code>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-2 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>

            {/* Action Buttons: View Book & Share Promotion */}
            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-stone-200/60 dark:border-slate-800">
              <button
                onClick={handleViewBook}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>معاينة الكتاب</span>
              </button>

              <button
                onClick={handleSharePromo}
                className="py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-black flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                title="مشاركة الترويج وإضافة المكافأة للمحفظة"
              >
                <Share2 className="w-3 h-3" />
                <span>مشاركة (+200 د.ج)</span>
              </button>

              <button
                onClick={() => setActiveModal('promo')}
                className="py-1.5 px-2 rounded-lg text-teal-700 dark:text-teal-400 hover:underline text-[10px] font-bold transition-colors cursor-pointer"
              >
                أداة الترويج
              </button>
            </div>

            {rewardClaimed && (
              <div className="mt-2 py-1 px-2 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold text-center border border-emerald-500/40 animate-in fade-in">
                ✓ تم بنجاح! أودعت مكافأة الترويج (+200 د.ج) في محفظتك الإلكترونية 💰
              </div>
            )}

          </div>

        </div>

      </div>
    </aside>
  );
};
