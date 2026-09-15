import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, BookOpen, Star, RefreshCw, Eye, ShoppingBag, 
  Zap, Brain, Check, Compass, ChevronLeft
} from 'lucide-react';
import { Book, BookRecommendationItem, RecommendationResponse } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currencies';

interface RecommendedBooksSectionProps {
  onOpenDetails: (book: Book) => void;
  onQuickBinance: (book: Book) => void;
  onQuickBaridiMob: (book: Book) => void;
}

export const RecommendedBooksSection: React.FC<RecommendedBooksSectionProps> = ({
  onOpenDetails,
  onQuickBinance,
  onQuickBaridiMob,
}) => {
  const { 
    books, 
    recentlyViewed, 
    selectedCurrency, 
    customization, 
    addToCart,
    recordBookView
  } = useStore();

  const [recommendations, setRecommendations] = useState<BookRecommendationItem[]>([]);
  const [readingProfile, setReadingProfile] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [source, setSource] = useState<'gemini' | 'algorithmic'>('gemini');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addedCartId, setAddedCartId] = useState<string | null>(null);

  // Fetch recommendations from server / Gemini API
  const fetchRecommendations = useCallback(async () => {
    if (!books || books.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recentlyViewed: recentlyViewed || [],
          availableBooks: books,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();
      
      // Map recommendations with full book objects
      const itemsWithBooks: BookRecommendationItem[] = (data.recommendations || [])
        .map((rec) => {
          const matchedBook = books.find((b) => b.id === rec.bookId);
          return {
            ...rec,
            book: matchedBook,
          };
        })
        .filter((item): item is BookRecommendationItem & { book: Book } => Boolean(item.book));

      setRecommendations(itemsWithBooks);
      setReadingProfile(data.readingProfile || 'شغوف بالنهضة الفكرية والريادة المعاصرة');
      setGreeting(data.greeting || 'بناءً على اهتماماتك وتصفحك الأخير، تم إعداد هذه الترشيحات بالذكاء الاصطناعي لك:');
      setSource(data.source || 'gemini');
    } catch (err) {
      console.warn('Failed to fetch recommendations from server, using local fallback:', err);
      // Local fallback
      const viewedIds = new Set(recentlyViewed.map((b) => b.id));
      const candidates = books.filter((b) => !viewedIds.has(b.id));
      const fallbackList = (candidates.length >= 3 ? candidates : books).slice(0, 4);
      
      setRecommendations(
        fallbackList.map((book, idx) => ({
          bookId: book.id,
          book,
          matchScore: 95 - idx * 3,
          reason: `اخترنا لك "${book.title}" ليتوافق مع شغفك بعناوين ${book.category} وتعميق تجربتك القرائية.`,
          highlightTag: book.category || 'ترشيح مخصص',
        }))
      );
      setReadingProfile('قارئ شغوف بالفكر والنهضة وبناء الإنسان');
      setGreeting('ترشيحات مخصصة تم انتقاؤها بعناية لتعزيز حصيلتك المعرفية:');
      setSource('algorithmic');
    } finally {
      setIsLoading(false);
    }
  }, [books, recentlyViewed]);

  // Initial load & whenever recently viewed changes significantly
  useEffect(() => {
    fetchRecommendations();
  }, [recentlyViewed.length]);

  const handleAddToCart = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book.id, 'digital');
    setAddedCartId(book.id);
    setTimeout(() => setAddedCartId(null), 1500);
  };

  const handleSelectBook = (book: Book) => {
    recordBookView(book);
    onOpenDetails(book);
  };

  return (
    <section 
      id="recommended-books-section"
      className="w-full mt-12 mb-8 py-10 sm:py-14 bg-gradient-to-b from-stone-100/70 via-teal-900/[0.03] to-stone-100/70 dark:from-slate-900/80 dark:via-teal-950/20 dark:to-slate-900/80 border-y border-stone-200/80 dark:border-slate-800 transition-colors"
      aria-label="قسم كتب مقترحة لك بواسطة الذكاء الاصطناعي"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div className="space-y-2 text-right">
            
            {/* Gemini AI Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-amber-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
              <span>ترشيحات مدعومة بذكاء Gemini الاصطناعي</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-600 text-white font-mono font-bold">
                {source === 'gemini' ? 'Gemini 3.8 Flash' : 'خوارزمية ذكية'}
              </span>
            </div>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-900/20">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                  كتب مقترحة لك
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                  {greeting || 'مختارة خصيصاً لذوقك القرائي بناءً على الكتب التي تصفحتها مؤخراً في المنصة'}
                </p>
              </div>
            </div>

            {/* Reading Persona Profile Pill */}
            {readingProfile && (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-slate-700 mt-1">
                <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>النمط القرائي المحلل:</span>
                <span className="text-teal-700 dark:text-teal-300 font-black">{readingProfile}</span>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              id="refresh-recommendations-btn"
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-slate-700 text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="تحديث الترشيحات وإعادة التحليل بالذكاء الاصطناعي"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث الترشيحات</span>
            </button>
          </div>
        </div>

        {/* Recently Browsed Books Chips (Visual Evidence of Personalization) */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="mb-6 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xs border border-stone-200/70 dark:border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-bold flex items-center gap-1 shrink-0">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>بناءً على تصفحك لـ:</span>
            </span>
            {recentlyViewed.slice(0, 4).map((b) => (
              <span 
                key={b.id}
                onClick={() => onOpenDetails(b)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-slate-600 cursor-pointer font-medium transition-colors truncate max-w-[220px]"
                title={`انقر لعرض ${b.title}`}
              >
                <BookOpen className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="truncate">{b.title}</span>
              </span>
            ))}
          </div>
        )}

        {/* Recommendations Content Grid */}
        {isLoading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="rounded-3xl bg-white/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 p-4 space-y-3 animate-pulse shadow-xs"
              >
                <div className="w-full h-56 bg-stone-200 dark:bg-slate-700 rounded-2xl" />
                <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded-md w-3/4" />
                <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded-md w-1/2" />
                <div className="h-16 bg-teal-500/10 rounded-xl" />
                <div className="h-9 bg-stone-200 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-stone-200 dark:border-slate-700 p-6 space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-stone-700 dark:text-stone-300">
              تصفح بعض الكتب لتفعيل ترشيحات الذكاء الاصطناعي
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              بمجرد النقر وتصفح أي كتاب في المتجر، ستقوم واجهة Gemini بتحليل اهتماماتك واقتراح عناوين تناسب ذوقك تماماً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {recommendations.map((rec) => {
              const book = rec.book;
              if (!book) return null;

              const priceObj = formatPrice(
                book.priceDzd, 
                selectedCurrency, 
                customization.exchangeRateUsdtToDzd
              );

              return (
                <div 
                  key={rec.bookId}
                  id={`recommended-card-${book.id}`}
                  onClick={() => handleSelectBook(book)}
                  className="group relative flex flex-col rounded-3xl bg-white dark:bg-slate-800 border border-stone-200/90 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Top Badges Bar: Match score & Highlight */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-teal-600/95 text-white shadow-md backdrop-blur-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>توافق {rec.matchScore}%</span>
                    </span>

                    {rec.highlightTag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-900/80 dark:bg-white/90 text-white dark:text-stone-900 shadow-xs backdrop-blur-xs">
                        {rec.highlightTag}
                      </span>
                    )}
                  </div>

                  {/* Book Cover Container */}
                  <div className="relative w-full h-56 overflow-hidden bg-stone-100 dark:bg-slate-900 flex items-center justify-center">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Quick View Floating Button */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="w-full py-1.5 px-3 rounded-xl bg-white/95 dark:bg-slate-900/95 text-stone-900 dark:text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>معاينة تفاصيل الكتاب</span>
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                    
                    <div>
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                        <span className="font-bold text-teal-700 dark:text-teal-400 truncate max-w-[130px]">
                          {book.category}
                        </span>
                        <div className="flex items-center gap-1 font-black text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{book.rating?.toFixed(1) || '4.9'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white line-clamp-2 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                        {book.title}
                      </h3>

                      {/* Author */}
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1 truncate">
                        بقلم: {book.author}
                      </p>

                      {/* Gemini Recommendation Reason Box */}
                      <div className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-stone-800 dark:text-stone-200 text-xs relative">
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-[11px] text-amber-900 dark:text-amber-300 block mb-0.5">
                              لماذا نرشح لك هذا الكتاب؟
                            </span>
                            <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                              {rec.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-3 border-t border-stone-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-black text-teal-800 dark:text-teal-300 leading-tight">
                          {priceObj.formatted}
                        </div>
                        {selectedCurrency !== 'USDT' && (
                          <div className="text-[10px] text-stone-400 font-mono font-bold">
                            ≈ {priceObj.approxUsdt} USDT
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Cart Button */}
                        <button
                          onClick={(e) => handleAddToCart(book, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            addedCartId === book.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-stone-100 dark:bg-slate-700/80 hover:bg-teal-50 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-slate-600'
                          }`}
                          title="إضافة إلى سلة المشتريات"
                        >
                          {addedCartId === book.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <ShoppingBag className="w-4 h-4" />
                          )}
                        </button>

                        {/* Quick Direct Pay Button */}
                        <button
                          onClick={() => onQuickBaridiMob(book)}
                          className="px-2.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          title="شراء فوري عبر بريدي موب"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>شراء</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
