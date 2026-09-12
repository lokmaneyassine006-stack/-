import React, { useState } from 'react';
import { 
  X, Star, Headphones, Globe, ShieldCheck, Download, 
  MessageSquare, ThumbsUp, Plus, Check, Play, Pause, 
  BookOpen, FileText, Share2, Award, Sparkles, Send, AlertTriangle, Building2, Zap, FileCode2, Eye
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
    addToCart, 
    playBookTTS, 
    audioState, 
    pauseAudio, 
    resumeAudio, 
    reviews, 
    addReview, 
    likeReview, 
    currentUser, 
    addTranslationToBook,
    setActiveModal
  } = useStore();

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
  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  const isPlayingThisBook = audioState.bookId === book.id && audioState.isPlaying;

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
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2.5 py-1 rounded-full">
              {book.category}
            </span>
            {book.isOwnerBook && (
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span>★</span>
                <span>من إصدارات صاحب المنصة</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Hero Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Book Cover Container */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800">
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
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white leading-tight mb-2">
                  {book.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-3">
                  <span>المؤلف: <strong className="text-stone-900 dark:text-white">{book.author}</strong></span>
                  <span>الناشر: <strong className="text-stone-900 dark:text-white">{book.publisher}</strong></span>
                  <span>اللغة: <strong className="text-stone-900 dark:text-white">{book.language}</strong></span>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(book.rating || 0) ? 'fill-amber-400' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black text-stone-800 dark:text-stone-200">
                    {(book.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-stone-400">
                    ({book.reviewCount} تقييم وقراءة)
                  </span>
                </div>

                {/* Price Display & Quick Payment Action */}
                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/70 border border-teal-200/60 dark:border-slate-700 space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">سعر النسخة الرقمية والصوتية</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-teal-800 dark:text-teal-300">
                          {priceObj.formatted}
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          (≈ {priceObj.approxUsdt} USDT)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                      تسليم فوري ومباشر
                    </span>
                  </div>

                  {/* Direct Quick Payment Buttons (BaridiMob & Binance) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-teal-200/50 dark:border-slate-700">
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
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              نظرة عامة وقراءة الكتاب
            </button>
            <button
              onClick={() => setActiveTab('translations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'translations'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>الترجمات العالمية ({book.translations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('copyright')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'copyright'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حقوق النشر الدولية</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>التقييمات والمراجعات ({bookReviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('promote')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'promote'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md'
                  : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>روّج للكتاب واربح عمولة 🎁</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & IN-BROWSER READER */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-stone-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-stone-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-2">
                  عن الكتاب والرسالة المعرفية:
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {/* Interactive PDF Reader / Word Document Viewer */}
              <div className="bg-stone-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-stone-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">PDF</span>
                    <h4 className="font-black text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
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
                      className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer mr-2"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>قراءة صوتية (TTS)</span>
                    </button>
                  </div>
                </div>

                {/* PDF Styled Page Presentation */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-300 dark:border-slate-700 p-6 sm:p-8 shadow-inner font-serif text-sm leading-loose text-stone-800 dark:text-stone-200 max-h-80 overflow-y-auto space-y-4">
                  <div className="border-b border-stone-200 dark:border-slate-800 pb-3 flex items-center justify-between text-xs text-stone-400 font-sans">
                    <span className="font-bold text-teal-700 dark:text-teal-400">{book.title}</span>
                    <span>صفحة المعاينة المعتمدة (PDF)</span>
                  </div>
                  <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed font-serif">
                    {book.wordDocContent || `مقدمة وتمهيد:\nإن هذا العمل الفكري يهدف إلى إحداث نقلة نوعية في منهجية التفكير وبناء القدرات الذاتية.\nيسر منصة "معا نحو التغيير" أن تقدم هذه النسخة الرقمية لقرائها في كافة أنحاء العالم.`}
                  </div>
                  <div className="border-t border-stone-200 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] text-stone-400 font-sans">
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
              
              {/* Add Review Box */}
              <form onSubmit={handleReviewSubmit} className="bg-stone-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white">أضف تقييمك ورأيك في الكتاب:</h4>
                  
                  {/* Star rating selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
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
                    تم نشر مراجعتك بنجاح!
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-400">
                    💡 المراجعة الأكثر إعجاباً تؤهل صاحبها تلقائياً لعضوية "فريق المنصة"!
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>نشر المراجعة</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {bookReviews.length === 0 ? (
                  <p className="text-center py-6 text-xs text-stone-400">كن أول من يكتب مراجعة لهذا الكتاب!</p>
                ) : (
                  bookReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        rev.isTopReviewerReward
                          ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700/60 shadow-md'
                          : 'bg-white dark:bg-slate-800/80 border-stone-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-teal-500"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-stone-900 dark:text-white">
                                {rev.userName}
                              </span>
                              {rev.isTopReviewerReward && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-sm">
                                  <Award className="w-3 h-3" />
                                  <span>صاحب أفضل رأي (فريق المنصة)</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400">
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
                              ? 'bg-teal-600 text-white'
                              : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{rev.likes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        {rev.text}
                      </p>
                    </div>
                  ))
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
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
