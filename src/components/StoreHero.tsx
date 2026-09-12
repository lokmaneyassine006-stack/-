import React, { useState } from 'react';
import { 
  Search, Sparkles, PlusCircle, Headphones, Gift, CreditCard, 
  MessageSquare, ShieldCheck, Check, ArrowRight, Zap, Filter,
  Crown, Copy, CheckCheck, BookOpen, Layers, Users, Infinity
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyToClipboard } from '../utils/clipboard';

interface StoreHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onlyMyBooks: boolean;
  setOnlyMyBooks: (val: boolean) => void;
}

export const CATEGORIES = [
  'جميع التصنيفات',
  'تنمية وتغيير',
  'ذكاء اصطناعي وتقنية',
  'فكر وفلسفة',
  'علم النفس',
  'ريادة أعمال',
  'أدب ورواية'
];

export const StoreHero: React.FC<StoreHeroProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onlyMyBooks,
  setOnlyMyBooks,
}) => {
  const { 
    customization, 
    setActiveModal, 
    redeemGiftCard, 
    currentUser,
    books 
  } = useStore();

  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftMessage, setGiftMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const defaultPromoCode = 'CHANGE-2026-USDT10';

  const handleCopyCode = async () => {
    await copyToClipboard(defaultPromoCode);
    setGiftCardCode(defaultPromoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    const res = redeemGiftCard(giftCardCode);
    setGiftMessage({ text: res.message, isSuccess: res.success });
    if (res.success) {
      setGiftCardCode('');
    }
  };

  // Calculate book count per category
  const getCategoryCount = (cat: string) => {
    if (cat === 'جميع التصنيفات') return books.length;
    return books.filter(b => b.category === cat).length;
  };

  const ownerBooksCount = books.filter(b => b.isOwnerBook || b.isCustom || b.authorId === currentUser.id).length;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-teal-900/10 via-stone-100/60 to-stone-50 dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-900 pt-8 pb-12 sm:pt-14 sm:pb-16 transition-colors">
      
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-[28rem] h-[28rem] bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header Tag & Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          
          {/* Presidential Founder Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-amber-400/40 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold mb-5 shadow-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-3 h-3" />
            </div>
            <span>المنصة الرسمية للمؤلف والمؤسس: <strong className="text-amber-700 dark:text-amber-400 font-black">{customization.presidentName}</strong></span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white tracking-tight leading-[1.15] mb-4">
            {customization.storeName}
          </h1>

          {/* Subtitle Description */}
          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            مكتبة متكاملة للكتب الرقمية والصوتية، نشر فوري معتمد، ترجمة فورية متعددة اللغات، ودفع سريع بالدينار الجزائري (BaridiMob RIP) والعملات الرقمية (USDT).
          </p>

          {/* Feature Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-7">
            <button
              onClick={() => setActiveModal('publish')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 hover:shadow-lg transition-all cursor-pointer group"
            >
              <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>نشر وبيع كتاب جديد</span>
            </button>

            <button
              onClick={() => setActiveModal('forum')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold border border-stone-200 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>منتدى المناقشات</span>
            </button>

            <button
              onClick={() => setActiveModal('virtual_card')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold border border-stone-200 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>البطاقة الافتراضية</span>
            </button>

            <button
              onClick={() => setActiveModal('team_hr')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold border border-stone-200 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>فريق المنصة والتوظيف</span>
            </button>
          </div>
        </div>

        {/* 10 USDT Welcome Gift Card Banner Widget */}
        <div className="max-w-2xl mx-auto mb-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-amber-400/40 dark:border-amber-400/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5 text-right w-full sm:w-auto">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                  <span>قسيمة ترحيبية مجانية بقيمة 10 USDT</span>
                  <span className="text-[10px] bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full font-black">هدية 🎁</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-xs text-stone-500 dark:text-stone-400">الكود:</span>
                  <button 
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-300 font-mono text-xs font-black transition-colors cursor-pointer border border-amber-300 dark:border-amber-700"
                    title="انقر لنسخ الكود"
                  >
                    <span>{defaultPromoCode}</span>
                    {copiedCode ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700 dark:text-amber-400" />}
                  </button>

                  {currentUser.role === 'owner' && (
                    <button
                      type="button"
                      onClick={async () => {
                        setGiftCardCode('OWNER-INFINITY-VIP');
                        await copyToClipboard('OWNER-INFINITY-VIP');
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-mono text-xs font-black transition-transform active:scale-95 cursor-pointer shadow-xs border border-amber-400"
                      title="قسيمتك اللانهائية كمالك"
                    >
                      <Crown className="w-3 h-3 text-stone-950" />
                      <span>OWNER-INFINITY-VIP</span>
                      <Infinity className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Redeem Form */}
            <form onSubmit={handleRedeem} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                placeholder="أدخل كود الهدية..."
                className="w-full sm:w-48 px-3.5 py-2.5 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shrink-0 cursor-pointer shadow-sm transition-all"
              >
                تفعيل الرصيد
              </button>
            </form>
          </div>

          {giftMessage && (
            <div className={`mt-3 p-2.5 rounded-xl text-xs font-bold text-center ${
              giftMessage.isSuccess 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
            }`}>
              {giftMessage.text}
            </div>
          )}
        </div>

        {/* Search & Category Filter Suite */}
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عنوان كتاب، اسم المؤلف، دار النشر، التصنيف، أو رقم المعيار الدولي ISBN..."
              className="w-full pl-12 pr-12 py-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm font-semibold shadow-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer px-2 py-1 rounded-md bg-stone-100 dark:bg-slate-700"
              >
                مسح
              </button>
            )}
          </div>

          {/* Interactive Category Chips & "كتابي" Custom Filter */}
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
            
            {/* "كتابي" / Owner Filter Chip */}
            <button
              onClick={() => setOnlyMyBooks(!onlyMyBooks)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyMyBooks
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 shadow-xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
              <span>شارة "كتابي" (كتب المالك)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                {ownerBooksCount}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-700 text-white border-teal-800 shadow-md shadow-teal-700/20 font-black scale-105'
                      : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-700 shadow-xs'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};

