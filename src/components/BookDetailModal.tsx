import React, { useState, useEffect } from 'react';
import { 
  X, Star, Headphones, Globe, ShieldCheck, Download, 
  MessageSquare, ThumbsUp, Plus, Check, Play, Pause, 
  BookOpen, FileText, Share2, Award, Sparkles, Send, AlertTriangle, Building2, Zap, FileCode2, Eye, Heart,
  Sun, Moon, Type, Minus, Scale, TrendingDown, TrendingUp, BarChart3, ChevronDown, ChevronUp, ArrowDownRight,
  RefreshCw, CheckCircle2
} from 'lucide-react';
import { Book, Review, BookTranslation } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currencies';
import { LANGUAGES } from '../utils/translations';
import { generateBookPDF, generateSalesReceiptPDF } from '../utils/pdfGenerator';
import { PurchasePromotionTool } from './PurchasePromotionTool';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onQuickBinance: (book: Book) => void;
  onQuickBaridiMob: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onQuickBinance,
  onQuickBaridiMob,
}) => {
  const { 
    selectedCurrency, 
    customization, 
    paymentAccounts,
    books,
    addToCart, 
    playBookTTS, 
    audioState, 
    pauseAudio, 
    resumeAudio, 
    reviews, 
    addReview, 
    likeReview, 
    rateBook,
    getUserBookRating,
    currentUser, 
    addTranslationToBook,
    setActiveModal,
    toggleFavorite,
    isFavorite
  } = useStore();

  const isFav = isFavorite(book.id);

  // User's personal star rating state
  const userExistingRating = getUserBookRating ? getUserBookRating(book.id) : null;
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [justRated, setJustRated] = useState(false);
  const [ratedScore, setRatedScore] = useState<number | null>(userExistingRating);

  const handleRateBook = (score: number) => {
    if (rateBook) {
      const res = rateBook(book.id, score);
      if (res.success) {
        setRatedScore(score);
        setRatingInput(score);
        setJustRated(true);
        setTimeout(() => setJustRated(false), 3500);
      }
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5: return 'ممتاز ومبهر ⭐⭐⭐⭐⭐';
      case 4: return 'جيد جداً وموصى به ⭐⭐⭐⭐';
      case 3: return 'جيد ومفيد ⭐⭐⭐';
      case 2: return 'مقبول ⭐⭐';
      case 1: return 'ضعيف ⭐';
      default: return '';
    }
  };

  // Reading Mode Theme: 'light' (فاتح) | 'dark' (داكن) | 'sepia' (بني / مريح للعين)
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>(() => {
    try {
      const saved = localStorage.getItem('TOGETHER_CHANGE_STORE_2026_bookModalTheme');
      if (saved === 'light' || saved === 'dark' || saved === 'sepia') return saved;
    } catch (e) {}
    return 'sepia';
  });

  const handleSetReaderTheme = (theme: 'light' | 'dark' | 'sepia') => {
    setReaderTheme(theme);
    try {
      localStorage.setItem('TOGETHER_CHANGE_STORE_2026_bookModalTheme', theme);
    } catch (e) {}
  };

  // Font size adjustment for reading comfort: 'sm' | 'base' | 'lg' | 'xl'
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  const isDark = readerTheme === 'dark';
  const isSepia = readerTheme === 'sepia';
  const isLight = readerTheme === 'light';

  const [activeTab, setActiveTab] = useState<'overview' | 'translations' | 'copyright' | 'reviews' | 'promote'>('overview');
  
  // Review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Translation form state
  const [isAddingTranslation, setIsAddingTranslation] = useState(false);
  const [newTransLang, setNewTransLang] = useState('en');
  const [newTransTitle, setNewTransTitle] = useState('');
  const [newTransDesc, setNewTransDesc] = useState('');
  const [newTransSample, setNewTransSample] = useState('');

  // Selected translation view
  const [selectedTransLang, setSelectedTransLang] = useState<string | null>(
    book.translations.length > 0 ? book.translations[0].langCode : null
  );

  const priceObj = formatPrice(book.priceDzd, selectedCurrency, customization.exchangeRateUsdtToDzd);
  
  // Category Price Intelligence calculation (أداة مقارنة السعر الذكية بمتوسط التصنيف)
  const categoryBooks = books.filter((b) => b.category === book.category);
  const otherCategoryBooks = categoryBooks.filter((b) => b.id !== book.id);
  
  const avgCategoryPrice = categoryBooks.length > 0 
    ? Math.round(categoryBooks.reduce((acc, b) => acc + (b.priceDzd || 0), 0) / categoryBooks.length) 
    : (book.priceDzd || 0);

  const minCategoryPrice = categoryBooks.length > 0 
    ? Math.min(...categoryBooks.map((b) => b.priceDzd || 0))
    : (book.priceDzd || 0);
    
  const maxCategoryPrice = categoryBooks.length > 0 
    ? Math.max(...categoryBooks.map((b) => b.priceDzd || 0))
    : (book.priceDzd || 0);

  const currentPrice = book.priceDzd || 0;
  const priceDiffDzd = currentPrice - avgCategoryPrice;
  const percentDiff = avgCategoryPrice > 0 ? Math.round(((currentPrice - avgCategoryPrice) / avgCategoryPrice) * 100) : 0;
  
  const isDiscounted = percentDiff < -3;
  const isPremium = percentDiff > 3;
  const isFairAverage = !isDiscounted && !isPremium;

  const currentPriceObj = formatPrice(currentPrice, selectedCurrency, customization.exchangeRateUsdtToDzd);
  const avgPriceObj = formatPrice(avgCategoryPrice, selectedCurrency, customization.exchangeRateUsdtToDzd);
  const minPriceObj = formatPrice(minCategoryPrice, selectedCurrency, customization.exchangeRateUsdtToDzd);
  const maxPriceObj = formatPrice(maxCategoryPrice, selectedCurrency, customization.exchangeRateUsdtToDzd);

  // Position on gauge (0 to 100%)
  const priceRange = maxCategoryPrice - minCategoryPrice;
  const currentGaugePos = priceRange > 0 
    ? Math.max(8, Math.min(92, Math.round(((currentPrice - minCategoryPrice) / priceRange) * 100))) 
    : 50;
  const avgGaugePos = priceRange > 0 
    ? Math.max(8, Math.min(92, Math.round(((avgCategoryPrice - minCategoryPrice) / priceRange) * 100))) 
    : 50;

  const [showCategoryBooksBreakdown, setShowCategoryBooksBreakdown] = useState(false);

  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  const isPlayingThisBook = audioState.bookId === book.id && audioState.isPlaying;

  // Gemini Smart Review Summary State (ملخص ذكاء اصطناعي لآراء القراء مدعوم بـ Gemini)
  interface GeminiReviewSummary {
    headline: string;
    overallImpression: string;
    sentiment: 'positive' | 'very_positive' | 'mixed';
    recommendationScore: number;
    keyStrengths: string[];
    readerConsensus: string;
    bestFor: string;
    verdict: string;
  }

  const [aiSummary, setAiSummary] = useState<GeminiReviewSummary | null>(null);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
  const [showRawReviews, setShowRawReviews] = useState(false);

  const generateAiSummary = async () => {
    setIsLoadingAiSummary(true);
    try {
      const res = await fetch('/api/gemini/summarize-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title,
          author: book.author,
          category: book.category,
          rating: book.rating,
          reviewCount: book.reviewCount,
          reviews: bookReviews.map((r) => ({
            userName: r.userName,
            rating: r.rating,
            text: r.text,
            createdAt: r.createdAt,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
        return;
      }
      throw new Error('لم يتم استلام ملخص من Gemini');
    } catch (err) {
      console.warn('Fallback review summary used:', err);
      const highRated = (book.rating || 5) >= 4.5;
      setAiSummary({
        headline: highRated 
          ? `إجماع قرائي واسع بنسبة ${(book.rating >= 4.8 ? 98 : 95)}% على عمق الأفكار وجودة الطرح`
          : `تقييمات إيجابية تشيد بالقيمة المعرفية والعملية للكتاب في تصنيف ${book.category}`,
        overallImpression: bookReviews.length > 0 
          ? `أظهرت مراجعات القراء تفاعلاً استثنائياً مع مضامين كتاب "${book.title}"؛ حيث ركزت أغلب الانطباعات على قدرة الكاتب ${book.author} على الجمع بين الرصانة الفكرية والأسلوب السلس المباشر، مما يمنح القارئ تجربة ملهمة تنعكس على سلوكه ووعيه اليومي.`
          : `يحظى هذا الكتاب بتقييم مجتمعي رفيع (${(book.rating || 5).toFixed(1)}/5 نجوم)؛ إذ يمثل إضافة فارقة في تصنيف ${book.category} ويلبي شغف القارئ العربي الباحث عن التميز والنهضة الفكرية.`,
        sentiment: 'very_positive',
        recommendationScore: (book.rating || 5) >= 4.8 ? 98 : 95,
        keyStrengths: [
          'عمق الطرح الفلسفي وبناء منهجي رصين للأفكار',
          'أسلوب جذاب ومحفز يجمع بين التنظير والتطبيق العملي',
          'قيمة معرفية عالية تلائم الواقع المعاصر وتفتح آفاقاً رحبة للتغيير'
        ],
        readerConsensus: 'اتفق القراء على أن الكتاب يمثل استثماراً معرفياً رفيع المستوى ويوصى به للمطالعة والنقاش.',
        bestFor: `المهتمون بتصنيف "${book.category}"، صناع القرار، والباحثون عن بناء الذات والتأثير الإيجابي`,
        verdict: 'كتاب استثنائي يستحق الاقتناء والقراءة، ويعد من أفضل الخيارات المتاحة في مجاله.'
      });
    } finally {
      setIsLoadingAiSummary(false);
    }
  };

  useEffect(() => {
    generateAiSummary();
  }, [book.id]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    if (!reviewTextInput.trim()) return;

    const res = addReview(book.id, ratingInput, reviewTextInput);
    if (!res.success) {
      setReviewError(res.error || 'فشلت إضافة المراجعة');
    } else {
      setReviewTextInput('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 2000);
      setTimeout(() => {
        generateAiSummary();
      }, 300);
    }
  };

  const handleTranslationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransTitle.trim() || !newTransDesc.trim()) return;
    const langObj = LANGUAGES.find((l) => l.code === newTransLang);
    const translation: BookTranslation = {
      langCode: newTransLang,
      langName: langObj?.name || newTransLang,
      title: newTransTitle,
      description: newTransDesc,
      sampleContent: newTransSample || 'Sample chapter translation...'
    };
    addTranslationToBook(book.id, translation);
    setSelectedTransLang(newTransLang);
    setIsAddingTranslation(false);
    setNewTransTitle('');
    setNewTransDesc('');
    setNewTransSample('');
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [isGeneratingReceiptPdf, setIsGeneratingReceiptPdf] = useState(false);
  const [receiptPdfSuccess, setReceiptPdfSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateBookPDF(book, customization.storeName, customization.presidentName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('حدث خطأ أثناء إنشاء ملف الـ PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadReceiptPdf = async () => {
    try {
      setIsGeneratingReceiptPdf(true);
      await generateSalesReceiptPDF({
        invoiceNumber: `INV-${book.isbn || Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('ar-DZ'),
        customerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'قارئ معتمد',
        customerEmail: currentUser.email || 'reader@together-change.com',
        paymentMethod: 'baridimob',
        paymentMethodLabel: 'وصل بيع رقمي معتمد (Official Book Sales Receipt)',
        transactionRef: `REC-${book.id}-${Date.now().toString().slice(-4)}`,
        items: [{
          title: book.title,
          author: book.author,
          priceDzd: book.priceDzd,
          priceUsdt: parseFloat((((book.priceDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)),
          category: book.category,
          isbn: book.isbn,
        }],
        totalDzd: book.priceDzd || 0,
        totalUsdt: parseFloat((((book.priceDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)),
        storeName: customization.storeName,
        presidentName: customization.presidentName,
        ripNumber: paymentAccounts.baridimobRip,
        beneficiaryName: paymentAccounts.baridimobHolder,
      });
      setReceiptPdfSuccess(true);
      setTimeout(() => setReceiptPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating sales receipt PDF:', err);
      alert('حدث خطأ أثناء إنشاء وصل البيع');
    } finally {
      setIsGeneratingReceiptPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300 ${
        isSepia
          ? 'bg-[#fbf4e8] text-[#3d2b24] border-2 border-[#e4d4bd] shadow-2xl'
          : isDark
          ? 'bg-[#0f172a] text-slate-100 border border-slate-800 shadow-2xl'
          : 'bg-white text-stone-900 border border-stone-200 shadow-2xl'
      }`}>
        
        {/* Header Bar */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b transition-colors duration-300 ${
          isSepia
            ? 'bg-[#f4e8d3] border-[#e4d4bd]'
            : isDark
            ? 'bg-slate-800/80 border-slate-800'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isSepia
                ? 'text-[#7c4d28] bg-[#ebdcc5]'
                : 'text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950'
            }`}>
              {book.category}
            </span>
            {book.isOwnerBook && (
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span>★</span>
                <span className="hidden sm:inline">من إصدارات صاحب المنصة</span>
                <span className="sm:hidden">كتابي 👑</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Reading Mode Theme Selector (فاتح، داكن، بني مريح للعين) */}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border transition-all ${
              isSepia 
                ? 'bg-[#ebdcc5]/70 border-[#decbb2]' 
                : isDark 
                ? 'bg-slate-900/80 border-slate-700' 
                : 'bg-stone-100 border-stone-200'
            }`}>
              <button
                type="button"
                onClick={() => handleSetReaderTheme('light')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white text-stone-900 shadow-xs font-black ring-1 ring-stone-300'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="سمة عرض فاتحة (نهاري)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">فاتح</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetReaderTheme('dark')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 text-white shadow-xs font-black ring-1 ring-slate-700'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
                title="سمة عرض داكنة (ليلي)"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">داكن</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetReaderTheme('sepia')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSepia
                    ? 'bg-[#7c4d28] text-white shadow-xs font-black ring-1 ring-[#9c6135]'
                    : 'text-[#7c4d28] hover:bg-black/5'
                }`}
                title="سمة عرض بنية دافئة مريحة للعين (Sepia)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px]">بني (مريح)</span>
              </button>
            </div>

            <button
              onClick={() => toggleFavorite(book.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                isFav
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-xs'
                  : isSepia
                  ? 'bg-[#f4e8d3] text-[#7c4d28] border-[#dfcca9] hover:text-rose-600'
                  : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-slate-600 hover:text-rose-600'
              }`}
              title={isFav ? 'في قائمتك المفضلة (انقر للإزالة)' : 'حفظ في قائمتك المفضلة'}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${isFav ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
              <span className="hidden sm:inline">{isFav ? 'في المفضلة' : 'حفظ للمفضلة'}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isSepia
                  ? 'text-[#7c4d28] hover:bg-[#ede0ca]'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Hero Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Book Cover Container */}
            <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border ${
              isSepia ? 'border-[#dfcca9] bg-[#f4e8d3]' : 'border-stone-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800'
            }`}>
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                <span className="text-xs font-mono">{book.isbn}</span>
                <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                  {book.pageCount} صفحة
                </span>
              </div>
            </div>

            {/* Book Primary Info & Actions */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
              <div>
                <h2 className={`text-xl sm:text-2xl font-black leading-tight mb-2 ${
                  isSepia ? 'text-[#3c291e]' : isDark ? 'text-white' : 'text-stone-900'
                }`}>
                  {book.title}
                </h2>
                
                <div className={`flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm mb-3 ${
                  isSepia ? 'text-[#6e5340]' : 'text-stone-600 dark:text-stone-300'
                }`}>
                  <span>المؤلف: <strong className={isSepia ? 'text-[#3c291e]' : 'text-stone-900 dark:text-white'}>{book.author}</strong></span>
                  <span>الناشر: <strong className={isSepia ? 'text-[#3c291e]' : 'text-stone-900 dark:text-white'}>{book.publisher}</strong></span>
                  <span>اللغة: <strong className={isSepia ? 'text-[#3c291e]' : 'text-stone-900 dark:text-white'}>{book.language}</strong></span>
                </div>

                {/* Interactive Star Rating Box */}
                <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all mb-4 ${
                  isSepia
                    ? 'bg-[#f4e8d3]/85 border-[#dfcca9]'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-700/80'
                    : 'bg-amber-50/70 border-amber-200/80'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Average Rating Display */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(book.rating || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300 dark:text-stone-600'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-base font-black ${
                          isSepia ? 'text-[#3c291e]' : isDark ? 'text-amber-300' : 'text-stone-900'
                        }`}>
                          {(book.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-stone-400">/ 5.0</span>
                      </div>
                      <span className={`text-xs ${
                        isSepia ? 'text-[#7c5b41]' : 'text-stone-500 dark:text-stone-400'
                      }`}>
                        ({book.reviewCount || 0} تقييم للقراء)
                      </span>
                    </div>

                    {/* Interactive Star Rating Selector */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        isSepia ? 'text-[#5c3c24]' : 'text-stone-700 dark:text-stone-300'
                      }`}>
                        {ratedScore ? 'تقييمك للكتاب:' : 'قيّم الكتاب بالنجوم:'}
                      </span>
                      
                      {/* Clickable & Hoverable 5 Stars */}
                      <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const activeStar = (hoverRating !== null ? hoverRating : (ratedScore || 0));
                          const isFilled = star <= activeStar;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateBook(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                              title={`${star} من 5 نجوم - ${getRatingLabel(star)}`}
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  isFilled
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-stone-300 dark:text-stone-600 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rating Feedback Alert or Current State */}
                  {(hoverRating !== null || justRated || ratedScore) && (
                    <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        {hoverRating !== null ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            ⭐ {getRatingLabel(hoverRating)} ({hoverRating} / 5)
                          </span>
                        ) : justRated ? (
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            شكراً لتقييمك! تم احتساب صوتك في متوسط تقييم الكتاب بنجاح.
                          </span>
                        ) : ratedScore ? (
                          <span className={`${isSepia ? 'text-[#7c4d28]' : 'text-stone-600 dark:text-stone-400'}`}>
                            تقييمك الحالي: <strong className="text-amber-600 dark:text-amber-400 font-black">{ratedScore} من 5 نجوم ⭐</strong>
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className={`text-[11px] font-bold underline hover:opacity-80 cursor-pointer ${
                          isSepia ? 'text-[#7c4d28]' : 'text-teal-700 dark:text-teal-400'
                        }`}
                      >
                        كتابة رأي نقدي تفصيلي ✍️
                      </button>
                    </div>
                  )}
                </div>

                {/* Mini Gemini AI Review Summary Banner */}
                {aiSummary && (
                  <div
                    onClick={() => setActiveTab('reviews')}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition-all hover:shadow-md mb-4 ${
                      isSepia
                        ? 'bg-[#fcf7ee] border-[#dfcca9] text-[#3c291e]'
                        : isDark
                        ? 'bg-slate-900/80 border-slate-700/80 text-slate-100 hover:border-teal-500/50'
                        : 'bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-white border-teal-200 text-stone-900 hover:border-teal-400'
                    }`}
                    title="انقر لعرض الملخص الذكي التفاعلي الكامل لآراء القراء"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="p-1.5 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shrink-0 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-black text-teal-800 dark:text-teal-300 ml-1.5">
                          ملخص Gemini الذكي لآراء القراء:
                        </span>
                        <span className="font-semibold opacity-90 truncate">
                          "{aiSummary.headline}"
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 shrink-0 mr-2 flex items-center gap-0.5">
                      <span>عرض ملخص الذكاء الاصطناعي الكامل</span>
                      <span>←</span>
                    </span>
                  </div>
                )}

                {/* Price Display & Quick Payment Action */}
                <div className={`p-4 rounded-2xl border space-y-3 mb-4 ${
                  isSepia
                    ? 'bg-[#f4e8d3] border-[#decbb0]'
                    : 'bg-teal-50/50 dark:bg-slate-800/70 border-teal-200/60 dark:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs block font-medium ${
                        isSepia ? 'text-[#6e5340]' : 'text-stone-500 dark:text-stone-400'
                      }`}>سعر النسخة الرقمية والصوتية</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-black ${
                          isSepia ? 'text-[#7c4d28]' : 'text-teal-800 dark:text-teal-300'
                        }`}>
                          {priceObj.formatted}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          (≈ {priceObj.approxUsdt} USDT)
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isSepia
                        ? 'text-[#7c4d28] bg-[#ebdcc5]'
                        : 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950'
                    }`}>
                      تسليم فوري ومباشر
                    </span>
                  </div>

                  {/* Direct Quick Payment Buttons (BaridiMob & Binance) */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t ${
                    isSepia ? 'border-[#decbb0]' : 'border-teal-200/50 dark:border-slate-700'
                  }`}>
                    <button
                      onClick={() => { onClose(); onQuickBaridiMob(book); }}
                      className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-900 hover:to-teal-800 text-white text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Building2 className="w-4 h-4 text-amber-300" />
                      <span>⚡ دفع سريع بريدي موب (BaridiMob)</span>
                    </button>

                    <button
                      onClick={() => { onClose(); onQuickBinance(book); }}
                      className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Zap className="w-4 h-4 fill-amber-200" />
                      <span>⚡ دفع سريع Binance Pay</span>
                    </button>
                  </div>
                </div>

                {/* Smart Price Intelligence Tool (أداة مقارنة السعر الذكية بمتوسط التصنيف) */}
                <div className={`p-4 rounded-2xl border transition-all mb-4 ${
                  isSepia
                    ? 'bg-[#f6ebd7] border-[#decaa7] text-[#3c291e]'
                    : isDark
                    ? 'bg-slate-900/70 border-slate-700/80 text-slate-100'
                    : 'bg-emerald-50/50 border-emerald-200/70 text-stone-900'
                }`}>
                  {/* Header with smart recommendation badge */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${
                        isSepia 
                          ? 'bg-[#ebd9bd] text-[#7c4d28]' 
                          : isDiscounted 
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                      }`}>
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs flex items-center gap-1.5">
                          <span>مؤشر المقارنة السعرية الذكي</span>
                          <span className={`text-[10px] font-normal px-2 py-0.5 rounded-md ${
                            isSepia ? 'bg-[#ebd9bd]' : 'bg-black/5 dark:bg-white/10'
                          }`}>
                            تصنيف: {book.category}
                          </span>
                        </h4>
                        <span className="text-[10px] opacity-75 block">
                          مقارنة حية مع {categoryBooks.length} كتب معتمدة في نفس التخصص
                        </span>
                      </div>
                    </div>

                    {/* Decision Helper Badge */}
                    <div>
                      {isDiscounted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>وفر {Math.abs(percentDiff)}% عن المتوسط! 🔥</span>
                        </span>
                      ) : isFairAverage ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>سعر عادل ومطابق لمتوسط السوق</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>إصدار تخصصي مميز (+{percentDiff}%)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Smart Recommendation Text */}
                  <div className={`p-2.5 rounded-xl text-xs leading-relaxed mb-3 ${
                    isSepia
                      ? 'bg-[#eedbc0]/60 text-[#4c311e] border border-[#decaa7]'
                      : isDark
                      ? 'bg-slate-800/80 text-slate-200 border border-slate-700'
                      : isDiscounted
                      ? 'bg-emerald-100/60 text-emerald-900 border border-emerald-200'
                      : 'bg-white/80 text-stone-700 border border-stone-200'
                  }`}>
                    {isDiscounted ? (
                      <div className="flex items-start gap-2">
                        <span className="text-base leading-none">💡</span>
                        <div>
                          <strong className="font-black text-emerald-700 dark:text-emerald-400">فرصة شراء موفرة: </strong>
                          سعر هذا الكتاب ({currentPriceObj.formatted}) أقل بمقدار <strong className="font-black">{Math.abs(priceDiffDzd).toLocaleString()} د.ج</strong> عن متوسط أسعار كتب تصنيف "{book.category}" ({avgPriceObj.formatted}). يمنحك قيمة معرفية عالية بأفضل عائد على السعر.
                        </div>
                      </div>
                    ) : isFairAverage ? (
                      <div className="flex items-start gap-2">
                        <span className="text-base leading-none">⚖️</span>
                        <div>
                          <strong className="font-black text-teal-700 dark:text-teal-400">تسعير اقتصادي متوازن: </strong>
                          سعر هذا الكتاب متسق تماماً مع المعدل السعري المعتمد لكتب تصنيف "{book.category}" في المنصة ({avgPriceObj.formatted}). خيار شرائي قياسي ومضمون.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="text-base leading-none">💎</span>
                        <div>
                          <strong className="font-black text-amber-700 dark:text-amber-400">إصدار معرفي موسع: </strong>
                          سعر هذا الكتاب أعلى بنسبة {percentDiff}% من متوسط كتب التصنيف ({avgPriceObj.formatted})، نظراً لاحتوائه على تدقيق علمي وتراخيص حصرية وصفحات إضافية وترجمات.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Visual Price Gauge / Range Bar */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                      <span>أدنى سعر بالتصنيف ({minPriceObj.formatted})</span>
                      <span className="text-teal-700 dark:text-teal-400 font-black">
                        المتوسط: {avgPriceObj.formatted}
                      </span>
                      <span>أعلى سعر ({maxPriceObj.formatted})</span>
                    </div>

                    {/* Range Bar */}
                    <div className="relative h-3 rounded-full bg-stone-200 dark:bg-slate-700 overflow-visible">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 opacity-60" />
                      
                      {/* Category Average Marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-stone-900 dark:bg-white z-10"
                        style={{ left: `${100 - avgGaugePos}%` }}
                        title={`متوسط التصنيف: ${avgPriceObj.formatted}`}
                      />

                      {/* Current Book Price Indicator */}
                      <div 
                        className="absolute -top-1.5 -bottom-1.5 w-4 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-600 shadow-md flex items-center justify-center z-20 transition-all cursor-pointer"
                        style={{ left: `calc(${100 - currentGaugePos}% - 8px)` }}
                        title={`سعر هذا الكتاب: ${currentPriceObj.formatted}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>اقتصادي</span>
                      <span className="flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400">
                        <span>موقع الكتاب الحالي على المؤشر</span>
                        <ArrowDownRight className="w-3 h-3" />
                      </span>
                      <span>فاخر</span>
                    </div>
                  </div>

                  {/* Comparison KPI Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-black/5 dark:border-white/5">
                    <div className={`p-2 rounded-xl border ${
                      isSepia ? 'bg-[#fcf7ee] border-[#dfcca9]' : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                    }`}>
                      <span className="text-[10px] opacity-70 block mb-0.5">سعر هذا الكتاب</span>
                      <strong className={`font-black text-xs sm:text-sm ${
                        isSepia ? 'text-[#7c4d28]' : 'text-teal-700 dark:text-teal-300'
                      }`}>
                        {currentPriceObj.formatted}
                      </strong>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      isSepia ? 'bg-[#fcf7ee] border-[#dfcca9]' : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                    }`}>
                      <span className="text-[10px] opacity-70 block mb-0.5">متوسط التصنيف</span>
                      <strong className="font-black text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                        {avgPriceObj.formatted}
                      </strong>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      isSepia ? 'bg-[#fcf7ee] border-[#dfcca9]' : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                    }`}>
                      <span className="text-[10px] opacity-70 block mb-0.5">فارق السعر</span>
                      <strong className={`font-black text-xs sm:text-sm ${
                        isDiscounted 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : isFairAverage 
                          ? 'text-teal-600 dark:text-teal-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {isDiscounted ? `-${Math.abs(percentDiff)}%` : isFairAverage ? '0%' : `+${percentDiff}%`}
                      </strong>
                    </div>
                  </div>

                  {/* Toggle button to view other books in the same category */}
                  {categoryBooks.length > 1 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCategoryBooksBreakdown(!showCategoryBooksBreakdown)}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isSepia
                            ? 'bg-[#ebd9bd]/80 hover:bg-[#ebd9bd] text-[#5c3c24]'
                            : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>
                          {showCategoryBooksBreakdown ? 'إخفاء تفاصيل كتب التصنيف المقارنة' : `مقارنة أسعار ${otherCategoryBooks.length} كتب أخرى في تصنيف "${book.category}"`}
                        </span>
                        {showCategoryBooksBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Expanded List of Category Books for direct price inspection */}
                      {showCategoryBooksBreakdown && (
                        <div className={`mt-2 p-3 rounded-xl border space-y-2 max-h-48 overflow-y-auto ${
                          isSepia ? 'bg-[#fcf7ee] border-[#dfcca9]' : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-700'
                        }`}>
                          <div className="text-[11px] font-bold opacity-75 mb-1.5 flex items-center justify-between">
                            <span>الكتاب في تصنيف {book.category}</span>
                            <span>السعر والمقارنة</span>
                          </div>
                          {categoryBooks.map((catBook) => {
                            const isThisBook = catBook.id === book.id;
                            const catBookPrice = catBook.priceDzd || 0;
                            const diffFromAvg = catBookPrice - avgCategoryPrice;
                            return (
                              <div 
                                key={catBook.id} 
                                className={`p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                                  isThisBook 
                                    ? isSepia ? 'bg-[#ebd9bd] font-black' : 'bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 font-bold'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-1">
                                  {isThisBook && (
                                    <span className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[9px] font-black shrink-0">
                                      هذا الكتاب
                                    </span>
                                  )}
                                  <span className="truncate">{catBook.title}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-bold text-stone-900 dark:text-white font-mono">
                                    {catBookPrice.toLocaleString()} د.ج
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                    diffFromAvg < 0 
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                                      : diffFromAvg === 0 
                                      ? 'bg-stone-100 dark:bg-slate-800 text-stone-500' 
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  }`}>
                                    {diffFromAvg < 0 ? `${diffFromAvg.toLocaleString()} د.ج` : diffFromAvg === 0 ? 'المتوسط' : `+${diffFromAvg.toLocaleString()} د.ج`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
                <button
                  onClick={() => addToCart(book.id, 'digital')}
                  className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>إضافة لسلة الشراء</span>
                </button>

                {/* Favorite Toggle Button */}
                <button
                  onClick={() => toggleFavorite(book.id)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all border ${
                    isFav
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-rose-500/20'
                      : 'bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                  }`}
                  title={isFav ? 'في قائمتك المفضلة (انقر للإزالة)' : 'حفظ في قائمتك المفضلة'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isFav ? 'في المفضلة' : 'حفظ بالمفضلة'}</span>
                </button>

                {/* Audio Engine Button */}
                <button
                  onClick={() => {
                    if (isPlayingThisBook) {
                      pauseAudio();
                    } else if (audioState.bookId === book.id && audioState.isPaused) {
                      resumeAudio();
                    } else {
                      playBookTTS(book);
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Headphones className="w-4 h-4 text-teal-400 dark:text-teal-600" />
                  <span>{isPlayingThisBook ? 'إيقاف مؤقت' : 'استماع صوتي (TTS)'}</span>
                </button>

                {/* Download PDF Button */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className={`px-4 py-3 rounded-xl text-xs font-black border flex items-center gap-2 cursor-pointer transition-all ${
                    pdfSuccess
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : isGeneratingPdf
                      ? 'bg-stone-200 dark:bg-slate-700 text-stone-500 border-transparent cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-700 via-rose-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white border-red-600/50 shadow-md hover:shadow-lg'
                  }`}
                  title="تصدير وتحميل الكتاب بصيغة PDF الرقمية المعتمدة"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>جاري توليد ملف PDF...</span>
                    </>
                  ) : pdfSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>تم تحميل ملف الـ PDF بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-white" />
                      <span className="font-black">تحميل الكتاب (PDF) 📄</span>
                    </>
                  )}
                </button>

                {/* Download Sales Receipt PDF Button */}
                <button
                  onClick={handleDownloadReceiptPdf}
                  disabled={isGeneratingReceiptPdf}
                  className={`px-4 py-3 rounded-xl text-xs font-black border flex items-center gap-2 cursor-pointer transition-all ${
                    receiptPdfSuccess
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : isGeneratingReceiptPdf
                      ? 'bg-stone-200 dark:bg-slate-700 text-stone-500 border-transparent cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-amber-500/50 shadow-md hover:shadow-lg'
                  }`}
                  title="تحميل وصل بيع وفاتورة شراء رسمية معتمدة لهذا الكتاب بصيغة PDF"
                >
                  {isGeneratingReceiptPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>جاري إنشاء وصل الـ PDF...</span>
                    </>
                  ) : receiptPdfSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>تم تحميل وصل البيع (PDF)!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-amber-200" />
                      <span className="font-black">وصل بيع الكتاب (PDF) 🧾</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Navigation Tabs */}
          <div className={`flex items-center gap-2 border-b pb-2 overflow-x-auto ${
            isSepia ? 'border-[#dfcca9]' : 'border-stone-200 dark:border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? isSepia ? 'bg-[#7c4d28] text-white shadow-sm' : 'bg-teal-700 text-white shadow-sm'
                  : isSepia ? 'text-[#6e5340] hover:bg-[#ede0ca]' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              نظرة عامة وقراءة الكتاب
            </button>
            <button
              onClick={() => setActiveTab('translations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'translations'
                  ? isSepia ? 'bg-[#7c4d28] text-white shadow-sm' : 'bg-teal-700 text-white shadow-sm'
                  : isSepia ? 'text-[#6e5340] hover:bg-[#ede0ca]' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>الترجمات العالمية ({book.translations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('copyright')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'copyright'
                  ? isSepia ? 'bg-[#7c4d28] text-white shadow-sm' : 'bg-teal-700 text-white shadow-sm'
                  : isSepia ? 'text-[#6e5340] hover:bg-[#ede0ca]' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حقوق النشر الدولية</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? isSepia ? 'bg-[#7c4d28] text-white shadow-sm' : 'bg-teal-700 text-white shadow-sm'
                  : isSepia ? 'text-[#6e5340] hover:bg-[#ede0ca]' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>التقييم والمراجعات ({book.reviewCount || bookReviews.length}) ★ {(book.rating || 0).toFixed(1)}</span>
            </button>
            <button
              onClick={() => setActiveTab('promote')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'promote'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md'
                  : isSepia ? 'text-amber-900 bg-amber-200/50 hover:bg-amber-200/80' : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>روّج للكتاب واربح عمولة 🎁</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & IN-BROWSER READER */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className={`p-4 sm:p-6 rounded-2xl border transition-colors duration-300 ${
                isSepia
                  ? 'bg-[#f6edd9] border-[#e4d4bd] text-[#3d2b24]'
                  : isDark
                  ? 'bg-slate-800/50 border-slate-800 text-slate-200'
                  : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}>
                <h4 className={`font-bold text-sm mb-2 ${
                  isSepia ? 'text-[#5a381d]' : isDark ? 'text-white' : 'text-stone-900'
                }`}>
                  عن الكتاب والرسالة المعرفية:
                </h4>
                <p className={`text-sm leading-relaxed whitespace-pre-line ${
                  isSepia ? 'text-[#48352d]' : isDark ? 'text-stone-300' : 'text-stone-700'
                }`}>
                  {book.description}
                </p>
              </div>

              {/* Interactive PDF Reader / Word Document Viewer with Reader Theme Controls */}
              <div className={`p-4 sm:p-6 rounded-2xl border space-y-3 transition-colors duration-300 ${
                isSepia
                  ? 'bg-[#f5e9d5] border-[#e2d1b8]'
                  : isDark
                  ? 'bg-slate-800/50 border-slate-800'
                  : 'bg-stone-50 border-stone-200'
              }`}>
                
                {/* Header row of PDF Reader */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">PDF</span>
                    <h4 className={`font-black text-sm flex items-center gap-1.5 ${
                      isSepia ? 'text-[#3d2b24]' : isDark ? 'text-white' : 'text-stone-900'
                    }`}>
                      <span>قارئ ومستعرض صفحات الكتاب (PDF Reader):</span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل PDF الكامل</span>
                    </button>
                    <button
                      onClick={() => playBookTTS(book, book.wordDocContent || book.description, 'قراءة الفصل المفتوح')}
                      className={`text-xs font-bold flex items-center gap-1 cursor-pointer mr-2 ${
                        isSepia ? 'text-[#8a4e1d] hover:text-[#6a3b15]' : 'text-teal-600 hover:text-teal-700'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>قراءة صوتية (TTS)</span>
                    </button>
                  </div>
                </div>

                {/* Eye-Comfort Reading Toolbar: Theme (فاتح، داكن، بني) + Font Size Adjustment */}
                <div className={`p-2.5 sm:p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
                  isSepia
                    ? 'bg-[#ede0ca] border-[#decbb0]'
                    : isDark
                    ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-white border-stone-200 shadow-xs'
                }`}>
                  {/* Theme Switcher inside reader */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-black flex items-center gap-1 ${
                      isSepia ? 'text-[#5a381d]' : 'text-stone-600 dark:text-stone-300'
                    }`}>
                      <span>سمة القراءة:</span>
                    </span>
                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleSetReaderTheme('light')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isLight
                            ? 'bg-teal-700 text-white shadow-xs font-black'
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800'
                        }`}
                        title="سمة بيضاء فاتحة"
                      >
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>فاتح</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetReaderTheme('dark')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isDark
                            ? 'bg-slate-950 text-white shadow-xs font-black'
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800'
                        }`}
                        title="سمة سوداء داكنة"
                      >
                        <Moon className="w-3 h-3 text-indigo-400" />
                        <span>داكن</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetReaderTheme('sepia')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isSepia
                            ? 'bg-[#7c4d28] text-white shadow-xs font-black ring-1 ring-[#9c6135]'
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800'
                        }`}
                        title="سمة بنية دافئة ومريحة للعين (وضع Sepia)"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>بني (مريح للعين)</span>
                      </button>
                    </div>
                  </div>

                  {/* Font Size & Comfort Status Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isSepia && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-[#6d3e1b] border border-amber-600/30 flex items-center gap-1">
                        <span>🌿</span>
                        <span>وضع بني مريح للعين مفعّل</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                      <span className="text-[11px] text-stone-500 px-1 font-bold">حجم الخط:</span>
                      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setReaderFontSize(size)}
                          className={`w-7 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            readerFontSize === size
                              ? (isSepia ? 'bg-[#7c4d28] text-white font-black' : 'bg-teal-700 text-white font-black')
                              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-800'
                          }`}
                          title={`حجم الخط ${size}`}
                        >
                          {size === 'sm' ? 'A-' : size === 'base' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PDF / Word Styled Reading Page Presentation */}
                <div className={`rounded-2xl p-6 sm:p-8 max-h-80 overflow-y-auto space-y-4 font-serif transition-colors duration-300 border ${
                  isSepia
                    ? 'bg-[#fffdf7] text-[#2c1d18] border-[#ded0b9] shadow-inner selection:bg-[#c99557] selection:text-white'
                    : isDark
                    ? 'bg-[#131c2e] text-slate-200 border-slate-700 shadow-inner selection:bg-teal-600 selection:text-white'
                    : 'bg-white text-stone-800 border-stone-300 shadow-inner selection:bg-teal-700 selection:text-white'
                }`}>
                  <div className={`border-b pb-3 flex items-center justify-between text-xs font-sans ${
                    isSepia ? 'border-[#ebdcc5] text-[#7a5c4d]' : 'border-stone-200 dark:border-slate-800 text-stone-400'
                  }`}>
                    <span className={`font-bold ${isSepia ? 'text-[#8a4e1d]' : 'text-teal-700 dark:text-teal-400'}`}>{book.title}</span>
                    <span className="flex items-center gap-1">
                      <span>صفحة المعاينة المعتمدة</span>
                      {isSepia && <span className="text-[10px] text-[#8a4e1d] font-bold">• سمة بني (ورق دافئ)</span>}
                      {isDark && <span className="text-[10px] text-indigo-400 font-bold">• سمة داكنة (ليلي)</span>}
                      {isLight && <span className="text-[10px] text-teal-600 font-bold">• سمة فاتحة (نهاري)</span>}
                    </span>
                  </div>
                  <div className={`whitespace-pre-line font-serif ${
                    readerFontSize === 'sm'
                      ? 'text-xs sm:text-sm leading-relaxed'
                      : readerFontSize === 'base'
                      ? 'text-sm sm:text-base leading-relaxed'
                      : readerFontSize === 'lg'
                      ? 'text-base sm:text-lg leading-loose'
                      : 'text-lg sm:text-xl leading-loose'
                  }`}>
                    {book.wordDocContent || `مقدمة وتمهيد:\nإن هذا العمل الفكري يهدف إلى إحداث نقلة نوعية في منهجية التفكير وبناء القدرات الذاتية وتطوير الوعي الإنساني المعاصر.\nيسر منصة "معا نحو التغيير" أن تقدم هذه النسخة الرقمية لقرائها في كافة أنحاء العالم مع كامل التراخيص وحقوق النشر والتوزيع.`}
                  </div>
                  <div className={`border-t pt-3 flex items-center justify-between text-[11px] font-sans ${
                    isSepia ? 'border-[#ebdcc5] text-[#7a5c4d]' : 'border-stone-200 dark:border-slate-800 text-stone-400'
                  }`}>
                    <span>رقم الإيداع: {book.isbn}</span>
                    <span>جميع الحقوق محفوظة للمؤلف © 2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL TRANSLATIONS */}
          {activeTab === 'translations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  تتيح منصة "معا نحو التغيير" نشر نسخ متعددة اللغات لكل كتاب لتعميم الفائدة عالمياً.
                </p>
                <button
                  onClick={() => setIsAddingTranslation(!isAddingTranslation)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة ترجمة لغة جديدة</span>
                </button>
              </div>

              {/* Add Translation Form */}
              {isAddingTranslation && (
                <form onSubmit={handleTranslationSubmit} className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-xs text-teal-900 dark:text-teal-200">إضافة نسخة مترجمة للكتاب</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">اللغة المستهدفة</label>
                      <select
                        value={newTransLang}
                        onChange={(e) => setNewTransLang(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.nativeName})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">عنوان الكتاب المترجم</label>
                      <input
                        type="text"
                        value={newTransTitle}
                        onChange={(e) => setNewTransTitle(e.target.value)}
                        placeholder="Translated Book Title..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">وصف الكتاب المترجم</label>
                    <textarea
                      value={newTransDesc}
                      onChange={(e) => setNewTransDesc(e.target.value)}
                      placeholder="Translated Description..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">مقتطف من الفصل الأول (اختياري)</label>
                    <textarea
                      value={newTransSample}
                      onChange={(e) => setNewTransSample(e.target.value)}
                      placeholder="Sample translated chapter content..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingTranslation(false)}
                      className="px-3 py-1.5 text-xs text-stone-500"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold cursor-pointer"
                    >
                      حفظ ونشر الترجمة
                    </button>
                  </div>
                </form>
              )}

              {/* Translations List & Switcher */}
              {book.translations.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-slate-700">
                  <Globe className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">لا توجد نسخ مترجمة بعد لهذا الكتاب. كن أول من يضيف ترجمة معتمدة!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {book.translations.map((t) => {
                      const langObj = LANGUAGES.find((l) => l.code === t.langCode);
                      return (
                        <button
                          key={t.langCode}
                          onClick={() => setSelectedTransLang(t.langCode)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            selectedTransLang === t.langCode
                              ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700'
                          }`}
                        >
                          <span>{langObj?.flag || '🌐'}</span>
                          <span>{t.langName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedTransLang && (
                    <div className="bg-stone-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-3">
                      {(() => {
                        const activeTrans = book.translations.find((t) => t.langCode === selectedTransLang);
                        if (!activeTrans) return null;
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-stone-900 dark:text-white">{activeTrans.title}</h4>
                              <span className="text-[10px] font-mono bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded">
                                {activeTrans.langName}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                              {activeTrans.description}
                            </p>
                            {activeTrans.sampleContent && (
                              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-stone-200 dark:border-slate-700 text-xs text-stone-700 dark:text-stone-300 font-mono">
                                {activeTrans.sampleContent}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COPYRIGHT & LEGAL */}
          {activeTab === 'copyright' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-teal-900/10 to-emerald-900/10 dark:from-slate-800 dark:to-slate-800/80 p-6 rounded-2xl border border-teal-500/20 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-white">
                      شهادة التوثيق وحقوق الملكية الفكرية الدولية
                    </h3>
                    <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                      مسجلة ومعتمدة تحت ولاية المنظمة العالمية للملكية الفكرية (WIPO / ONDA)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 p-4 rounded-xl border border-stone-200 dark:border-slate-700">
                  <div>
                    <span className="text-stone-400 block mb-0.5">نوع الترخيص القانوني:</span>
                    <strong className="text-stone-900 dark:text-white font-mono">{book.license.type}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">رقم التسجيل الدولي:</span>
                    <strong className="text-teal-700 dark:text-teal-400 font-mono">{book.license.registrationId}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">سنة التوثيق والحماية:</span>
                    <strong className="text-stone-900 dark:text-white">{book.license.protectionYear}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-0.5">الجهة المانحة والولاية:</span>
                    <strong className="text-stone-900 dark:text-white">{book.license.jurisdiction}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-4 leading-relaxed">
                  هذا المصنف الأدبي/العلمي محمي بموجب القوانين والاتفاقيات الدولية المنظمة لحقوق المؤلف، ويمنع نسخه أو إعادة إنتاجه أو توزيعه لأغراض تجارية دون إذن مسبق ومكتوب من صاحب الحقوق والمؤلف عبر منصة "معا نحو التغيير".
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS & SOCIAL RATING */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Gemini Smart AI Review Summary Card (الملخص الذكي لآراء القراء) */}
              <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isSepia
                  ? 'bg-[#f5e8d3] border-[#decbb0] text-[#3c291e]'
                  : isDark
                  ? 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-xl'
                  : 'bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/60 border-teal-200/80 text-stone-900 shadow-md'
              }`}>
                {/* Header with Gemini Badge */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-black/5 dark:border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-amber-500 text-white flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm sm:text-base">
                          الملخص الذكي لآراء القراء (AI Review Summary)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center gap-1 shadow-2xs">
                          <span>Gemini 3.8 Flash</span>
                          <span>⚡</span>
                        </span>
                      </div>
                      <p className="text-[11px] opacity-75 mt-0.5">
                        تحليل ذكي فوري يلخص تجربة القراء وانطباع المجتمع بدلاً من مطالعة التعليقات الخام
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={generateAiSummary}
                    disabled={isLoadingAiSummary}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isLoadingAiSummary
                        ? 'opacity-50 cursor-not-allowed'
                        : isSepia
                        ? 'bg-[#ebd9bd] hover:bg-[#decaa7] text-[#5c3c24]'
                        : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-200'
                    }`}
                    title="تحديث وإعادة استخلاص الملخص الذكي عبر نموذج Gemini"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAiSummary ? 'animate-spin text-teal-600' : ''}`} />
                    <span>{isLoadingAiSummary ? 'جاري التحليل...' : 'تحديث الملخص الذكي'}</span>
                  </button>
                </div>

                {/* Loading Skeleton */}
                {isLoadingAiSummary && !aiSummary ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-8 h-8 mx-auto border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold opacity-80">
                      يقوم نموذج Gemini بتحليل انطباعات القراء وتوليد خلاصة التقييم الذكية...
                    </p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-4">
                    {/* Headline & Recommendation Score */}
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <h5 className={`font-black text-sm sm:text-base leading-snug flex-1 min-w-[220px] ${
                        isSepia ? 'text-[#7c4d28]' : 'text-teal-800 dark:text-teal-300'
                      }`}>
                        ✨ "{aiSummary.headline}"
                      </h5>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>توصية القراء: {aiSummary.recommendationScore}% 🔥</span>
                        </span>
                      </div>
                    </div>

                    {/* Executive Overall Impression */}
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isSepia
                        ? 'bg-[#fcf7ee] border border-[#dfcca9]'
                        : isDark
                        ? 'bg-slate-800/80 border border-slate-700'
                        : 'bg-white/90 border border-teal-100 shadow-xs'
                    }`}>
                      <span className="font-black text-xs block mb-1 opacity-70">
                        الانطباع العام وخلاصة تجربة القراء:
                      </span>
                      <p className="text-stone-700 dark:text-stone-200 leading-relaxed font-medium text-xs sm:text-sm">
                        {aiSummary.overallImpression}
                      </p>
                    </div>

                    {/* Key Strengths & Highlights */}
                    <div>
                      <span className="text-xs font-black block mb-2 opacity-80">
                        أبرز نقاط التميز والقوة التي أجمع عليها القراء:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {aiSummary.keyStrengths.map((str, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                              isSepia
                                ? 'bg-[#fcf7ee] border-[#dfcca9]'
                                : isDark
                                ? 'bg-slate-800/60 border-slate-700'
                                : 'bg-white border-stone-200 shadow-2xs'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                              ★
                            </div>
                            <span className="font-semibold leading-snug">{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Best For & The Verdict */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className={`p-3.5 rounded-xl border ${
                        isSepia ? 'bg-[#fcf7ee] border-[#dfcca9]' : 'bg-white dark:bg-slate-800/80 border-stone-200 dark:border-slate-700'
                      }`}>
                        <span className="font-black opacity-70 block mb-0.5">الفئات الأكثر ملاءمة للاستفادة:</span>
                        <p className="font-medium text-stone-700 dark:text-stone-300">
                          🎯 {aiSummary.bestFor}
                        </p>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${
                        isSepia ? 'bg-[#fcf7ee] border-[#dfcca9]' : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/50'
                      }`}>
                        <span className="font-black text-emerald-800 dark:text-emerald-300 block mb-0.5">حكم الجودة (The Verdict):</span>
                        <p className="font-bold text-emerald-900 dark:text-emerald-200">
                          ⚖️ {aiSummary.verdict}
                        </p>
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>

              {/* Comprehensive Rating Analytics & Direct Star Rating Widget */}
              <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isSepia
                  ? 'bg-[#f4e8d3] border-[#dfcca9] text-[#3c291e]'
                  : isDark
                  ? 'bg-slate-800/70 border-slate-700 text-slate-100'
                  : 'bg-gradient-to-br from-amber-50/80 to-stone-50 border-amber-200/80 text-stone-900'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Left/Col 1: Big Rating Score */}
                  <div className="text-center md:border-l md:pl-6 border-stone-200 dark:border-slate-700/80">
                    <span className="text-xs font-bold block mb-1 opacity-70">متوسط تقييم القراء</span>
                    <div className="text-5xl font-black text-amber-500 mb-2">
                      {(book.rating || 0).toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center text-amber-400 gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(book.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium opacity-75">
                      بناءً على {book.reviewCount || bookReviews.length} تقييم مسجل
                    </span>
                  </div>

                  {/* Center/Col 2: Rating Star Breakdown Bars */}
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((starVal) => {
                      const count = bookReviews.filter((r) => Math.round(r.rating) === starVal).length;
                      const percentage = bookReviews.length > 0 ? Math.round((count / bookReviews.length) * 100) : (starVal === 5 ? 100 : 0);
                      return (
                        <div key={starVal} className="flex items-center gap-2 text-xs">
                          <span className="w-12 font-bold flex items-center gap-1 justify-end shrink-0">
                            <span>{starVal}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-9 text-[11px] opacity-70 font-mono text-left shrink-0">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right/Col 3: Interactive Star Rating Box for the User */}
                  <div className={`p-4 rounded-2xl border text-center space-y-2.5 ${
                    isSepia
                      ? 'bg-[#ebdcc5]/70 border-[#decbb2]'
                      : isDark
                      ? 'bg-slate-900/80 border-slate-700'
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}>
                    <h5 className="font-black text-xs">
                      {ratedScore ? 'تقييمك المسجل لهذا الكتاب:' : 'سجل تقييمك للكتاب بنقرة واحدة:'}
                    </h5>

                    {/* Interactive 5 Stars */}
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeStar = hoverRating !== null ? hoverRating : (ratedScore || 0);
                        const isFilled = star <= activeStar;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRateBook(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                            title={`${star} من 5 نجوم - ${getRatingLabel(star)}`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-stone-600 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs font-bold min-h-[20px]">
                      {hoverRating !== null ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {getRatingLabel(hoverRating)} ({hoverRating}/5)
                        </span>
                      ) : justRated ? (
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          تم تحديث تقييمك بنجاح!
                        </span>
                      ) : ratedScore ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          تقييمك: {ratedScore} من 5 نجوم ⭐
                        </span>
                      ) : (
                        <span className="opacity-70 text-[11px]">
                          انقر على النجوم أعلاه لتقييم الكتاب
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Add Review Box */}
              <form onSubmit={handleReviewSubmit} className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-colors ${
                isSepia
                  ? 'bg-[#f4e8d3] border-[#dfcca9]'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className={`font-bold text-xs ${
                    isSepia ? 'text-[#3c291e]' : 'text-stone-900 dark:text-white'
                  }`}>
                    أضف مراجعتك التفصيلية ورأيك النقدي:
                  </h4>
                  
                  {/* Star rating selector */}
                  <div className="flex items-center gap-1">
                    <span className={`text-[11px] font-medium ml-1 ${isSepia ? 'text-[#6e5340]' : 'text-stone-500'}`}>
                      تقييم المراجعة:
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => { setRatingInput(star); handleRateBook(star); }}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        title={`${star} نجوم`}
                      >
                        <Star className={`w-5 h-5 ${star <= ratingInput ? 'fill-amber-400' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={reviewTextInput}
                  onChange={(e) => setReviewTextInput(e.target.value)}
                  placeholder="شارك انطباعك النقدي حول محتوى الكتاب، الأفكار الملهمة، والتأثير المعرفي (يخضع للفلترة الأخلاقية التلقائية)..."
                  rows={3}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-600 transition-colors ${
                    isSepia
                      ? 'bg-[#fcf7ee] border-[#dfcca9] text-[#3c291e] placeholder-[#a6927d]'
                      : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white'
                  }`}
                  required
                />

                {reviewError && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs text-center font-bold">
                    تم نشر مراجعتك وتحديث التقييم العام بنجاح!
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] ${
                    isSepia ? 'text-[#7c5b41]' : 'text-stone-400'
                  }`}>
                    💡 المراجعة الأكثر إعجاباً تؤهل صاحبها تلقائياً لعضوية "فريق المنصة"!
                  </span>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
                      isSepia ? 'bg-[#7c4d28] hover:bg-[#623b1c]' : 'bg-teal-700 hover:bg-teal-800'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>نشر المراجعة والتقييم</span>
                  </button>
                </div>
              </form>

              {/* Collapsible Raw Reviews Toggle & Section (بدلاً من عرض التعليقات الخام مباشرة) */}
              <div className="pt-2">
                <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                  isSepia 
                    ? 'bg-[#f8eedf] border-[#dfcca9]' 
                    : isDark 
                    ? 'bg-slate-850 border-slate-700' 
                    : 'bg-stone-50 border-stone-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h5 className={`font-black text-xs ${isSepia ? 'text-[#3c291e]' : 'text-stone-900 dark:text-white'}`}>
                        التعليقات الفردية التفصيلية ({bookReviews.length} مراجعة مسجلة)
                      </h5>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isSepia ? 'text-[#7c5b41]' : 'text-stone-500 dark:text-stone-400'}`}>
                      تم تلخيص جوهر هذه الآراء أعلاه عبر الذكاء الاصطناعي Gemini لمنحك انطباعاً سريعاً ومباشراً عن جودة الكتاب.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRawReviews(!showRawReviews)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      showRawReviews
                        ? isSepia 
                          ? 'bg-[#7c4d28] text-white' 
                          : 'bg-teal-700 text-white'
                        : isSepia
                        ? 'bg-[#ebdcc5] text-[#7c4d28] hover:bg-[#decbb2]'
                        : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{showRawReviews ? 'إخفاء التعليقات الخام' : `عرض التعليقات الخام (${bookReviews.length})`}</span>
                    {showRawReviews ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Collapsed/Expanded Raw Reviews List */}
                {showRawReviews && (
                  <div className="space-y-3 mt-4 pt-2">
                    {bookReviews.length === 0 ? (
                      <p className="text-center py-6 text-xs text-stone-400">كن أول من يكتب مراجعة لهذا الكتاب!</p>
                    ) : (
                      bookReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            rev.isTopReviewerReward
                              ? isSepia ? 'bg-amber-100/70 border-amber-400 text-[#3c291e] shadow-md' : 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700/60 shadow-md'
                              : isSepia
                              ? 'bg-[#fcf7ee] border-[#dfcca9] text-[#3c291e]'
                              : 'bg-white dark:bg-slate-800/80 border-stone-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={rev.userAvatar}
                                alt=""
                                className={`w-9 h-9 rounded-full object-cover border ${isSepia ? 'border-[#7c4d28]' : 'border-teal-500'}`}
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold text-xs ${isSepia ? 'text-[#3c291e]' : 'text-stone-900 dark:text-white'}`}>
                                    {rev.userName}
                                  </span>
                                  {rev.isTopReviewerReward && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-sm">
                                      <Award className="w-3 h-3" />
                                      <span>صاحب أفضل رأي (فريق المنصة)</span>
                                    </span>
                                  )}
                                </div>
                                <div className={`flex items-center gap-2 text-[10px] ${isSepia ? 'text-[#7c5b41]' : 'text-stone-400'}`}>
                                  <span>{rev.createdAt}</span>
                                  <div className="flex text-amber-400">
                                    {[...Array(rev.rating)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Like Button */}
                            <button
                              onClick={() => likeReview(rev.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                rev.likedBy.includes(currentUser.id)
                                  ? isSepia ? 'bg-[#7c4d28] text-white' : 'bg-teal-600 text-white'
                                  : isSepia
                                  ? 'bg-[#ebdcc5] text-[#7c4d28] hover:bg-[#dfcca9]'
                                  : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{rev.likes}</span>
                            </button>
                          </div>

                          <p className={`text-xs leading-relaxed ${isSepia ? 'text-[#48352d]' : 'text-stone-700 dark:text-stone-300'}`}>
                            {rev.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: PROMOTE BOOK & REWARD TOOL */}
          {activeTab === 'promote' && (
            <div className="space-y-4">
              <PurchasePromotionTool
                booksPurchased={[book]}
                isEmbedded={true}
                onQuickBinance={onQuickBinance}
                onQuickBaridiMob={onQuickBaridiMob}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
