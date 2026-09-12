import React, { useState } from 'react';
import { 
  X, Building2, Copy, Check, QrCode, ShieldCheck, ArrowRight, 
  Sparkles, Upload, FileText, Download, AlertCircle, Smartphone, CheckCircle2
} from 'lucide-react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';
import { generateSalesReceiptPDF } from '../utils/pdfGenerator';
import { copyToClipboard } from '../utils/clipboard';
import { PurchasePromotionTool } from './PurchasePromotionTool';

interface BaridiMobQuickPayModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BaridiMobQuickPayModal: React.FC<BaridiMobQuickPayModalProps> = ({
  book,
  onClose,
}) => {
  const { 
    customization, 
    paymentAccounts, 
    processPurchase, 
    books,
    cart, 
    cartTotalDzd,
    currentUser
  } = useStore();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txRefInput, setTxRefInput] = useState('');
  const [senderNameInput, setSenderNameInput] = useState(`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim());
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmedTxRef, setConfirmedTxRef] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!book && cart.length === 0) return null;

  const totalDzd = book ? book.priceDzd : cartTotalDzd;
  const purchasedBooks: Book[] = book ? [book] : cart.map((c) => books.find((b) => b.id === c.bookId)).filter((b): b is Book => Boolean(b));
  const ripNumber = paymentAccounts.baridimobRip || '00799999000123456789';
  const ripFormatted = ripNumber.replace(/(\d{3})(\d{5})(\d{10})(\d{2})/, '$1 $2 $3 $4');
  const beneficiaryName = paymentAccounts.baridimobHolder || 'لقمان ياسين أبختي / منصة معا نحو التغيير';

  const handleCopy = (text: string, fieldName: string) => {
    copyToClipboard(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const bookIds = book ? [book.id] : cart.map((c) => c.bookId);
      const res = processPurchase(bookIds, 'baridimob', txRefInput || `BM-${Date.now().toString().slice(-6)}`);
      setIsProcessing(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setConfirmedTxRef(res.txRef);
      }
    }, 1200);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      setIsGeneratingPdf(true);
      const itemsList = book ? [{
        title: book.title,
        author: book.author,
        priceDzd: book.priceDzd,
        category: book.category,
        isbn: book.isbn,
      }] : cart.map((c) => {
        const found = books.find((b) => b.id === c.bookId);
        return {
          title: found?.title || 'كتاب رقمي',
          author: found?.author || 'معا نحو التغيير',
          priceDzd: found?.priceDzd || 0,
          category: found?.category,
          isbn: found?.isbn,
        };
      });

      await generateSalesReceiptPDF({
        invoiceNumber: confirmedTxRef || `BM-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('ar-DZ'),
        customerName: senderNameInput || `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'قارئ معتمد',
        customerEmail: currentUser.email || 'user@together-change.com',
        paymentMethod: 'baridimob',
        paymentMethodLabel: 'بريدي موب (BaridiMob RIP Transfer)',
        transactionRef: confirmedTxRef || txRefInput || ripNumber,
        items: itemsList,
        totalDzd: totalDzd || 0,
        totalUsdt: parseFloat((((totalDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)),
        storeName: customization.storeName,
        presidentName: customization.presidentName,
        ripNumber: ripNumber,
        beneficiaryName: beneficiaryName,
      });
    } catch (err) {
      console.error('Failed to generate sales receipt PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header with BaridiMob Teal & Gold Identity */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg leading-tight">
                    الدفع السريع عبر بريدي موب (BaridiMob)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-teal-950">
                    RIP فوري
                  </span>
                </div>
                <span className="text-xs text-teal-100 font-medium">
                  تحويل مباشر عبر تطبيق بريد الجزائر مع تأكيد واستلام فوري
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {successMessage ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="font-black text-lg text-stone-900 dark:text-white">
                  تم استلام دفعة بريدي موب وتأكيد الطلب بنجاح!
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  {successMessage}
                </p>
              </div>

              {confirmedTxRef && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                  الرقم المرجعي للعملية: {confirmedTxRef}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isGeneratingPdf}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-teal-900 dark:text-teal-200 text-xs font-black flex items-center justify-center gap-1.5 border border-teal-300 dark:border-teal-700/60 cursor-pointer shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>{isGeneratingPdf ? 'جاري توليد الـ PDF...' : 'تحميل وصل البيع الرسمي (PDF)'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  العودة للمتجر والقراءة
                </button>
              </div>

              {/* Promotional & Referral Tool after Purchase */}
              <div className="pt-2 border-t border-stone-200 dark:border-slate-800 text-right">
                <PurchasePromotionTool
                  booksPurchased={purchasedBooks}
                  txRef={confirmedTxRef}
                  isEmbedded={true}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">
                    {book ? `كتاب: ${book.title}` : `إجمالي سلة المشتريات (${cart.length} كتب)`}
                  </span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                    المؤلف: {book ? book.author : 'منصة معا نحو التغيير'}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-stone-400 block">المبلغ المطلوب للدفع:</span>
                  <span className="text-xl sm:text-2xl font-black text-teal-800 dark:text-teal-300">
                    {totalDzd.toLocaleString()} <span className="text-sm font-bold">د.ج</span>
                  </span>
                </div>
              </div>

              {/* Official BaridiMob Account Card */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/90 border border-stone-200 dark:border-slate-700 space-y-3">
                
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                      بيانات الحساب البريدي الجاري المعتمد (RIP):
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                    بريد الجزائر 🇩🇿
                  </span>
                </div>

                {/* RIP Number Display & Copy */}
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    رقم الحساب البريدي (RIP):
                  </label>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-teal-500/40 shadow-xs">
                    <input
                      type="text"
                      readOnly
                      value={ripFormatted}
                      className="w-full text-sm sm:text-base font-mono font-black text-teal-800 dark:text-teal-300 bg-transparent focus:outline-none tracking-wider text-left"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(ripNumber, 'rip')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                        copiedField === 'rip'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-teal-700 hover:bg-teal-800 text-white'
                      }`}
                      title="نسخ رقم الـ RIP"
                    >
                      {copiedField === 'rip' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الـ RIP</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Beneficiary Name & Quick Copy */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-stone-600 dark:text-stone-400">
                    <span>اسم صاحب الحساب: </span>
                    <strong className="text-stone-900 dark:text-white font-bold">{beneficiaryName}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(beneficiaryName, 'holder')}
                    className="text-teal-600 hover:text-teal-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'holder' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>نسخ الاسم</span>
                  </button>
                </div>

                {/* Quick Steps Instructions */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold block">خطوات الدفع عبر تطبيق BaridiMob:</span>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] sm:text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                    <li>افتح تطبيق <strong>BaridiMob</strong> بهاتفك واختر <strong>تحويل (Virement)</strong>.</li>
                    <li>اختر التحويل عبر <strong>RIP</strong> والصق الرقم المنسوخ أعلاه.</li>
                    <li>أدخل المبلغ المطلوب <strong>({totalDzd.toLocaleString()} د.ج)</strong> وأكّد العملية.</li>
                    <li>أدخل رقم المعاملة أو ارفع وصل التحويل أدناه لتأكيد الاستلام فوراً.</li>
                  </ol>
                </div>

              </div>

              {/* Transaction Proof & Confirmation Form */}
              <form onSubmit={handleConfirmPayment} className="space-y-3.5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      اسم المُرسل أو رقم الهاتف:
                    </label>
                    <input
                      type="text"
                      value={senderNameInput}
                      onChange={(e) => setSenderNameInput(e.target.value)}
                      placeholder="اسمك في تطبيق بريدي موب"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      رقم العملية / Ref التحويل:
                    </label>
                    <input
                      type="text"
                      value={txRefInput}
                      onChange={(e) => setTxRefInput(e.target.value)}
                      placeholder="مثال: 00984214 أو رقم الوصل"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Receipt Upload / Drag & Drop Area */}
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    صورة أو لقطة شاشة لوصل التحويل (اختياري للتحقق السريع):
                  </label>
                  
                  {receiptImage ? (
                    <div className="relative p-2.5 rounded-xl border border-teal-500 bg-teal-50/50 dark:bg-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={receiptImage} alt="وصل التحويل" className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                        <div>
                          <span className="text-xs font-bold text-stone-900 dark:text-white block">تم إرفاق وصل التحويل بنجاح</span>
                          <span className="text-[10px] text-teal-600 dark:text-teal-400">جاهز للتأكيد الفوري</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReceiptImage(null)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                      >
                        إزالة
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer ${
                        isDragOver 
                          ? 'border-teal-500 bg-teal-50 dark:bg-slate-800' 
                          : 'border-stone-300 dark:border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      <label className="cursor-pointer flex flex-col items-center justify-center">
                        <Upload className="w-5 h-5 text-teal-600 mb-1" />
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          اسحب لقطة الشاشة هنا أو اضغط للرفع
                        </span>
                        <span className="text-[10px] text-stone-400 mt-0.5">
                          PNG, JPG, WebP أو PDF
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Payment Confirmation Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white text-xs sm:text-sm font-black shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>جاري معالجة وتأكيد دفعة بريدي موب...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تأكيد الدفع واستلام الكتاب فوراً</span>
                    </>
                  )}
                </button>

              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
