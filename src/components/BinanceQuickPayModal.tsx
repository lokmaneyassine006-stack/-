import React, { useState } from 'react';
import { 
  X, Zap, Copy, Check, QrCode, ShieldCheck, ArrowRight, 
  Sparkles, ExternalLink, AlertCircle, Download
} from 'lucide-react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';
import { generateSalesReceiptPDF } from '../utils/pdfGenerator';
import { copyToClipboard } from '../utils/clipboard';
import { PurchasePromotionTool } from './PurchasePromotionTool';

interface BinanceQuickPayModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BinanceQuickPayModal: React.FC<BinanceQuickPayModalProps> = ({
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

  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'BEP20' | 'ERC20'>('TRC20');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmedTxRef, setConfirmedTxRef] = useState<string | null>(null);

  if (!book && cart.length === 0) return null;

  const totalDzd = book ? book.priceDzd : cartTotalDzd;
  const purchasedBooks: Book[] = book ? [book] : cart.map((c) => books.find((b) => b.id === c.bookId)).filter((b): b is Book => Boolean(b));
  const usdtAmount = (((totalDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);

  const getAddress = () => {
    if (selectedNetwork === 'TRC20') return paymentAccounts.binanceTrc20;
    if (selectedNetwork === 'BEP20') return paymentAccounts.binanceBep20;
    return paymentAccounts.binanceErc20;
  };

  const currentAddress = getAddress();

  const handleCopy = (text: string, fieldName: string) => {
    copyToClipboard(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsGeneratingPdf(true);
      const itemsList = book ? [{
        title: book.title,
        author: book.author,
        priceDzd: book.priceDzd,
        priceUsdt: parseFloat((((book.priceDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)),
        category: book.category,
        isbn: book.isbn,
      }] : cart.map((c) => {
        const found = books.find((b) => b.id === c.bookId);
        const itemDzd = found?.priceDzd || 0;
        return {
          title: found?.title || 'كتاب رقمي',
          author: found?.author || 'معا نحو التغيير',
          priceDzd: itemDzd,
          priceUsdt: parseFloat((((itemDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2)),
          category: found?.category,
          isbn: found?.isbn,
        };
      });

      await generateSalesReceiptPDF({
        invoiceNumber: confirmedTxRef || `BIN-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('ar-DZ'),
        customerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'قارئ معتمد',
        customerEmail: currentUser.email || 'user@together-change.com',
        paymentMethod: 'binance',
        paymentMethodLabel: `بينانس باي (Binance Pay - USDT ${selectedNetwork})`,
        transactionRef: confirmedTxRef || txHashInput || currentAddress,
        items: itemsList,
        totalDzd: totalDzd,
        totalUsdt: parseFloat(usdtAmount),
        storeName: customization.storeName,
        presidentName: customization.presidentName,
      });
    } catch (err) {
      console.error('Failed to generate binance sales receipt PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const bookIds = book ? [book.id] : cart.map((c) => c.bookId);
      const res = processPurchase(bookIds, 'binance', txHashInput || undefined);
      setIsProcessing(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setConfirmedTxRef(res.txRef);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header with Binance Yellow Brand Accents */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 p-5 text-stone-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-md">
                <Zap className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-base leading-tight text-white">
                  الدفع السريع الفوري عبر Binance Pay (USDT)
                </h3>
                <span className="text-xs text-amber-100 font-medium">
                  معالجة تلقائية وتسليم فوري ومباشر للكتاب
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
        <div className="p-6 space-y-5">
          
          {successMessage ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-stone-900 dark:text-white">
                تم استلام الدفعة وتأكيد الطلب بنجاح!
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {successMessage}
              </p>
              {confirmedTxRef && (
                <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-xl font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  الرقم المرجعي للعملية: {confirmedTxRef}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  disabled={isGeneratingPdf}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-900 dark:text-amber-200 text-xs font-black flex items-center justify-center gap-1.5 border border-amber-300 dark:border-amber-600/50 cursor-pointer shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{isGeneratingPdf ? 'جاري توليد الـ PDF...' : 'تحميل وصل البيع الرسمي (PDF)'}</span>
                </button>

                <button
                  type="button"
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
              {/* Order Summary */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">
                    {book ? `كتاب: ${book.title}` : `إجمالي سلة المشتريات (${cart.length} كتب)`}
                  </span>
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-bold">
                    {totalDzd.toLocaleString()} د.ج
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-stone-400 block">المبلغ المطلوب بـ USDT:</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {usdtAmount} USDT
                  </span>
                </div>
              </div>

              {/* Network Selector (TRC20 / BEP20 / ERC20) */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                  اختر شبكة التحويل (Network):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TRC20', 'BEP20', 'ERC20'] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setSelectedNetwork(net)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedNetwork === net
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:bg-stone-50'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code & Wallet Address Display */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 w-fit mx-auto shadow-sm">
                  {/* Visual QR Code Generator */}
                  <div className="w-32 h-32 flex flex-col items-center justify-center bg-stone-100 dark:bg-slate-800 rounded-lg p-2 text-center text-stone-600 dark:text-stone-300">
                    <QrCode className="w-20 h-20 text-stone-900 dark:text-white" />
                    <span className="text-[9px] font-mono mt-1 font-bold">USDT ({selectedNetwork})</span>
                  </div>
                </div>

                {/* Address string & copy */}
                <div>
                  <label className="text-[10px] text-stone-400 block mb-1">
                    عنوان المحفظة ({selectedNetwork} Address):
                  </label>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-stone-200 dark:border-slate-700">
                    <input
                      type="text"
                      readOnly
                      value={currentAddress}
                      className="w-full text-xs font-mono text-stone-800 dark:text-stone-200 bg-transparent focus:outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(currentAddress, 'addr')}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'addr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Binance Pay ID */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-slate-700">
                  <span className="text-stone-500">Binance Pay ID المباشر:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentAccounts.binancePayId, 'payid')}
                    className="font-mono font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{paymentAccounts.binancePayId}</span>
                    {copiedField === 'payid' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* TX Hash Input Form */}
              <form onSubmit={handleConfirmPayment} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    رقم العملية أو TxHash (اختياري للتحقق الفوري):
                  </label>
                  <input
                    type="text"
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder="مثال: 0x8a92... أو رقم التحويل الداخلي"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>جاري التحقق من المعاملة عبر البلوكشين...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
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
