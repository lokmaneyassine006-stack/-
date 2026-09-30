import React, { useState } from 'react';
import { 
  Star, Headphones, Globe, ShieldCheck, Zap, ShoppingBag, 
  Trash2, Edit3, BookOpen, Check, Eye, Building2, Sparkles,
  Volume2
} from 'lucide-react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currencies';

interface BookCardProps {
  book: Book;
  onOpenDetails: (book: Book) => void;
  onQuickBinance: (book: Book) => void;
  onQuickBaridiMob: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpenDetails,
  onQuickBinance,
  onQuickBaridiMob,
}) => {
  const { 
    selectedCurrency, 
    customization, 
    addToCart, 
    playBookTTS, 
    playBookAudioTrack, 
    currentUser, 
    deleteBook, 
    updateBookPrice 
  } = useStore();

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(book.priceDzd.toString());
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const priceObj = formatPrice(book.priceDzd, selectedCurrency, customization.exchangeRateUsdtToDzd);
  const isOwnerOrCreator = currentUser.role === 'owner' || currentUser.id === book.authorId;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book.id, 'digital');
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 1500);
  };

  const handleAudioPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.audioTrack?.hasAudio) {
      playBookAudioTrack(book, 0);
    } else {
      playBookTTS(book);
    }
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const val = Number(newPrice);
    if (!isNaN(val) && val >= 0) {
      updateBookPrice(book.id, val);
      setIsEditingPrice(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`هل أنت متأكد من حذف كتاب "${book.title}"؟`)) {
      deleteBook(book.id);
    }
  };

  return (
    <div 
      onClick={() => onOpenDetails(book)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-stone-200/90 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer book-shadow book-shadow-hover transform hover:-translate-y-1"
    >
      {/* Cover Image Container with Realistic Spine and Hover Flare */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 dark:bg-slate-950">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Book Left Spine Shadow */}
        <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-black/40 via-black/10 to-transparent pointer-events-none" />

        {/* Gradient Overlay for Bottom Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-1.5 pointer-events-none z-10">
          {/* "كتابي" / Owner Badge */}
          {book.isOwnerBook || book.isCustom ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex items-center gap-1 border border-amber-300/40">
              <Sparkles className="w-3 h-3 fill-amber-200" />
              <span>كتابي 👑</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-stone-200 border border-white/10">
              {book.category}
            </span>
          )}

          {/* Audio & License & PDF Badges */}
          <div className="flex items-center gap-1">
            <span className="p-1.5 rounded-full bg-red-600 text-white shadow-md border border-red-400/40 text-[9px] font-black" title="ملف PDF رقمي جاهز للتحميل والقراءة">
              PDF
            </span>
            {book.audioTrack?.hasAudio && (
              <span className="p-1.5 rounded-full bg-teal-600 text-white shadow-md border border-teal-400/40" title="كتاب صوتي متاح">
                <Headphones className="w-3.5 h-3.5" />
              </span>
            )}
            {book.translations.length > 0 && (
              <span className="p-1.5 rounded-full bg-indigo-600 text-white shadow-md border border-indigo-400/40" title="مترجم للغات أخرى">
                <Globe className="w-3.5 h-3.5" />
              </span>
            )}
            {book.license.isVerifiedBadge && (
              <span className="p-1.5 rounded-full bg-emerald-600 text-white shadow-md border border-emerald-400/40" title="مرخص ومحمي دولياً">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Bottom Cover Info */}
        <div className="absolute bottom-3 right-3 left-3 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-300 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{(book.rating || 0).toFixed(1)}</span>
              <span className="text-white/70 text-[10px] font-normal">({book.reviewCount})</span>
            </div>
            <span className="text-[10px] text-stone-300 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[120px]">
              {book.publisher}
            </span>
          </div>
        </div>
      </div>

      {/* Book Metadata Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & ISBN */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
            <span className="font-bold text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60">
              {book.category}
            </span>
            <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500">ISBN {book.isbn.slice(-7)}</span>
          </div>

          {/* Book Title */}
          <h3 className="font-black text-sm sm:text-base text-stone-900 dark:text-white line-clamp-2 leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors mb-1.5">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
            تأليف: <span className="font-bold text-stone-800 dark:text-stone-200">{book.author}</span>
          </p>

          {/* Description */}
          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-stone-100 dark:border-slate-800 space-y-3">
          
          {/* Price View & Quick Edit */}
          <div className="flex items-center justify-between">
            {isEditingPrice ? (
              <form onSubmit={handleSavePrice} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 w-full">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-24 px-2 py-1 text-xs rounded-lg border border-teal-500 bg-white dark:bg-slate-900 text-stone-900 dark:text-white font-bold"
                  min="0"
                />
                <button type="submit" className="px-2 py-1 text-xs bg-teal-600 text-white rounded-lg font-bold">
                  حفظ
                </button>
                <button type="button" onClick={() => setIsEditingPrice(false)} className="px-2 py-1 text-xs text-stone-400">
                  إلغاء
                </button>
              </form>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  {priceObj.formatted}
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  (≈ {priceObj.approxUsdt} USDT)
                </span>
              </div>
            )}

            {/* Owner Edit Tools */}
            {isOwnerOrCreator && !isEditingPrice && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsEditingPrice(true)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-teal-600 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  title="تعديل السعر"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {book.isCustom && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                    title="حذف الكتاب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: Instant BaridiMob & Binance Quick Pay & Cart */}
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-2">
              {/* Quick BaridiMob Pay (زر مباشر لكل كتاب) */}
              <button
                onClick={() => onQuickBaridiMob(book)}
                className="px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="دفع فوري سريع عبر بريدي موب BaridiMob RIP"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>بريدي موب RIP</span>
              </button>

              {/* Quick Binance Pay (زر مباشر لكل كتاب) */}
              <button
                onClick={() => onQuickBinance(book)}
                className="px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="دفع فوري سريع عبر بينانس USDT"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-200" />
                <span>Binance USDT</span>
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                isAddedToCart
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-stone-100/80 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تمت الإضافة للسلة</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>إضافة لسلة الشراء</span>
                </>
              )}
            </button>
          </div>

          {/* Audio & Details Bar */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 dark:text-stone-400" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAudioPreview}
              className="flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 font-bold transition-colors cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>استماع صوتي</span>
            </button>

            <button
              onClick={() => onOpenDetails(book)}
              className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>تفاصيل وقراءة</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

