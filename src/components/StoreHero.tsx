import React from 'react';
import { 
  Search, Sparkles, PlusCircle, Headphones, CreditCard, 
  MessageSquare, ShieldCheck, Check, ArrowRight, Zap, Filter,
  Crown, BookOpen, Layers, Users
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

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
    currentUser,
    books 
  } = useStore();

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

