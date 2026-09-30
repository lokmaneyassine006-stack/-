import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, MessageSquare, Copy, 
  CheckCheck, CheckCircle2, BookOpen, CreditCard, Sparkles, 
  Printer, ArrowDownToLine, Phone, Mail, ShieldCheck, 
  ExternalLink, Hash, Calendar, Wallet
} from 'lucide-react';
import { SaleTransaction, Book } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';
import { generateSalesReceiptPDF } from '../../utils/pdfGenerator';
import { useStore } from '../../context/StoreContext';

interface BuyersTabProps {
  transactions: SaleTransaction[];
  books: Book[];
}

export const BuyersTab: React.FC<BuyersTabProps> = ({ transactions, books }) => {
  const { 
    customization, 
    paymentAccounts, 
    sendBaridimobSms, 
    sendBinanceSms, 
    setActiveSmsModal,
    allUsers 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloadingPdfId, setIsDownloadingPdfId] = useState<string | null>(null);
  const [filterScope, setFilterScope] = useState<'owner_only' | 'all'>('owner_only');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Find books written by the site owner (Lokmane Yassine Abakhti)
  const ownerBooks = useMemo(() => {
    return books.filter(b => 
      b.isOwnerBook || 
      b.authorId === 'user-lokmane-owner' || 
      b.author.includes('لقمان ياسين') ||
      b.title.includes('معا نحو التغيير')
    );
  }, [books]);

  const ownerBookIds = useMemo(() => ownerBooks.map(b => b.id), [ownerBooks]);

  // Extract buyers transactions
  const buyerTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Must be a completed or pending purchase
      const isPurchase = t.type === 'book_purchase' || (
        t.amountDzd > 0 && 
        !t.type?.includes('reward') && 
        !t.type?.includes('deposit') &&
        !t.txRef.startsWith('WD') &&
        !t.txRef.startsWith('STR-WD') &&
        !t.txRef.startsWith('DEP') &&
        !t.txRef.startsWith('PRM')
      );

      if (!isPurchase) return false;

      if (filterScope === 'owner_only') {
        const isOwnerBook = (t.bookId && ownerBookIds.includes(t.bookId)) || 
                            t.sellerId === 'user-lokmane-owner' || 
                            (t.sellerName && t.sellerName.includes('لقمان ياسين')) ||
                            (t.bookTitle && t.bookTitle.includes('معا نحو التغيير'));
        return isOwnerBook;
      }

      return true;
    });
  }, [transactions, ownerBookIds, filterScope]);

  // Filtered list based on search and method
  const filteredBuyers = useMemo(() => {
    return buyerTransactions.filter(t => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q ||
        (t.buyerName && t.buyerName.toLowerCase().includes(q)) ||
        (t.bookTitle && t.bookTitle.toLowerCase().includes(q)) ||
        (t.txRef && t.txRef.toLowerCase().includes(q)) ||
        (t.buyerEmail && t.buyerEmail.toLowerCase().includes(q)) ||
        (t.phoneNumber && t.phoneNumber.includes(q)) ||
        (t.sellerName && t.sellerName.toLowerCase().includes(q));

      const matchesMethod = 
        selectedMethod === 'all' || 
        t.method === selectedMethod;

      return matchesSearch && matchesMethod;
    });
  }, [buyerTransactions, searchQuery, selectedMethod]);

  // Key Metrics
  const totalBuyersCount = buyerTransactions.length;
  const totalSalesDzd = buyerTransactions.reduce((acc, t) => acc + (t.amountDzd || 0), 0);
  const totalSalesUsdt = +(((totalSalesDzd) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);
  const baridimobSales = buyerTransactions.filter(t => t.method === 'baridimob').reduce((acc, t) => acc + (t.amountDzd || 0), 0);
  const binanceSalesUsdt = buyerTransactions.filter(t => t.method === 'binance').reduce((acc, t) => acc + (t.amountUsdt || 0), 0);

  // Copy Buyer Details to Clipboard
  const handleCopyBuyerDetails = (tx: SaleTransaction) => {
    const text = `👤 بيانات مشتري الكتاب لصاحب الموقع:
• اسم المشتري: ${tx.buyerName || 'قارئ معتمد'}
• الكتاب المقتنى: ${tx.bookTitle || 'معا نحو التغيير'}
• المبلغ: ${tx.amountDzd.toLocaleString()} د.ج (~${tx.amountUsdt || 7.5} USDT)
• وسيلة الدفع: ${tx.method === 'baridimob' ? 'بريدي موب (BaridiMob RIP)' : tx.method === 'binance' ? 'بينانس (Binance Pay)' : tx.method}
• رقم المرجع المالي: ${tx.txRef}
• الهاتف: ${tx.phoneNumber || '0661223344'}
• البريد الإلكتروني: ${tx.buyerEmail || 'reader@together-change.dz'}
• التاريخ: ${tx.date || tx.timestamp || '2026-09-10'}
• البائع / صاحب الموقع: ${tx.sellerName || 'لقمان ياسين أبختي'}`;

    copyToClipboard(text);
    setCopiedId(tx.id);
    showToast(`تم نسخ كامل بيانات المشتري (${tx.buyerName}) إلى الحافظة!`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Download PDF Invoice
  const handleDownloadInvoice = async (tx: SaleTransaction) => {
    setIsDownloadingPdfId(tx.id);
    try {
      await generateSalesReceiptPDF({
        invoiceNumber: `INV-${tx.txRef}`,
        date: tx.date || tx.timestamp || new Date().toISOString().split('T')[0],
        customerName: tx.buyerName || 'القارئ المعتمد',
        customerEmail: tx.buyerEmail || 'customer@together-change.dz',
        paymentMethod: tx.method,
        paymentMethodLabel: tx.method === 'baridimob' 
          ? 'بريدي موب BaridiMob (RIP: 00799999002847192033)' 
          : tx.method === 'binance' 
          ? 'بينانس Binance Pay USDT (TRC20)' 
          : 'بطاقة الدفع الإلكتروني CIB',
        transactionRef: tx.txRef,
        items: [
          {
            title: tx.bookTitle || 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
            author: tx.sellerName || 'لقمان ياسين أبختي',
            priceDzd: tx.amountDzd,
            priceUsdt: tx.amountUsdt || 7.5,
            category: 'فكر وتنمية نهضوية',
            isbn: '978-9931-8842-1-0'
          }
        ],
        totalDzd: tx.amountDzd,
        totalUsdt: tx.amountUsdt || 7.5,
        storeName: customization?.storeName || 'مكتبة معاً نحو التغيير',
        presidentName: customization?.presidentName || 'لقمان ياسين أبختي',
        ripNumber: paymentAccounts.baridimobRip || '00799999002847192033',
        beneficiaryName: 'لقمان ياسين أبختي (صاحب الموقع والمؤلف)',
        badgeTitle: 'سند وفاتورة شراء كتاب لصاحب الموقع معتمد'
      });
      showToast(`تم تحميل سند وفاتورة الشراء الرسمية للمشتري (${tx.buyerName}) بنجاح!`);
    } catch (err) {
      console.error('Invoice PDF error:', err);
      showToast('حدث خطأ أثناء إنشاء الفاتورة، يرجى المحاولة ثانية.');
    } finally {
      setIsDownloadingPdfId(null);
    }
  };

  // Send SMS Notification for Buyer
  const handleTriggerSms = (tx: SaleTransaction) => {
    const targetPhone = tx.phoneNumber || paymentAccounts.baridimobPhone || '0652206947';
    const targetName = tx.buyerName || 'القارئ المعتمد';

    if (tx.method === 'binance') {
      const sms = sendBinanceSms({
        recipientPhone: targetPhone,
        recipientName: targetName,
        cryptoAddressOrPayId: paymentAccounts.binancePayId || paymentAccounts.binanceTrc20,
        cryptoNetwork: tx.cryptoNetwork || 'Binance Pay / TRC20',
        amountUsdt: tx.amountUsdt || 7.5,
        amountDzd: tx.amountDzd,
        referenceCode: tx.txRef,
        txHash: tx.txHash,
        type: 'purchase'
      });
      setActiveSmsModal(sms);
    } else {
      const sms = sendBaridimobSms({
        recipientPhone: targetPhone,
        recipientName: targetName,
        ripNumber: tx.accountDetails || paymentAccounts.baridimobRip,
        amountDzd: tx.amountDzd,
        referenceCode: tx.txRef,
        type: 'purchase'
      });
      setActiveSmsModal(sms);
    }
  };

  // Print Full Buyers Roster
  const handlePrintBuyersReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast notification banner */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white/80 hover:text-white text-xs font-mono">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-stone-900 to-slate-900 text-white border border-teal-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg text-white">
                قائمة وسجل مشتري الكتب لصاحب الموقع
              </h3>
              <span className="text-[11px] font-black bg-teal-500 text-stone-950 px-2.5 py-0.5 rounded-full">
                أ. لقمان ياسين أبختي
              </span>
            </div>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              كشف تفصيلي شامل لكل من اقتنى واشترى كتب ومؤلفات صاحب المنصة ومؤسسها، متضمناً أرقام المعاملات، وسائل الدفع (بريدي موب وبينانس)، وقنوات التواصل وسندات البيع المعتمدة.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintBuyersReport}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
              title="طباعة كشف المشترين"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الكشف</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-stone-400 block mb-0.5">إجمالي مشتري الكتب</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-teal-300">{totalBuyersCount}</span>
              <span className="text-xs text-stone-400">زبون / قارئ</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-stone-400 block mb-0.5">مبيعات كتب المالك (د.ج)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-400">{totalSalesDzd.toLocaleString()}</span>
              <span className="text-xs text-stone-400">د.ج</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-stone-400 block mb-0.5">مبيعات بالدولار الرقمي</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-300">{totalSalesUsdt}</span>
              <span className="text-xs text-stone-400">USDT</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-stone-400 block mb-0.5">حالة التوثيق والتحصيل</span>
            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% موثقة ومؤكدة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector & Search Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Scope Toggle */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-slate-900 p-1 rounded-xl border border-stone-200 dark:border-slate-700 w-fit">
            <button
              onClick={() => setFilterScope('owner_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                filterScope === 'owner_only'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              📚 كتب المالك (أ. لقمان ياسين أبختي)
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              🌐 جميع مشتري المنصة
            </button>
          </div>

          {/* Payment Method Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedMethod('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                selectedMethod === 'all'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              الكل ({buyerTransactions.length})
            </button>
            <button
              onClick={() => setSelectedMethod('baridimob')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                selectedMethod === 'baridimob'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
              }`}
            >
              بريدي موب BaridiMob
            </button>
            <button
              onClick={() => setSelectedMethod('binance')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                selectedMethod === 'binance'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
              }`}
            >
              بينانس Binance Pay
            </button>
            <button
              onClick={() => setSelectedMethod('cib_ccp')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                selectedMethod === 'cib_ccp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
              }`}
            >
              بطاقة CIB / CCP
            </button>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث فوري باسم المشتري، عنوان الكتاب، البريد الإلكتروني، رقم الهاتف، أو كود المرجع (TX Ref)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Buyers Records Table / Cards */}
      {filteredBuyers.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-stone-200 dark:border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-slate-700 text-stone-500 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-white">لم يتم العثور على أي مشتري مطابق</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            جرب تعديل كلمة البحث أو تغيير وسيلة الدفع لعرض قائمة المشترين.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedMethod('all'); }}
            className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors"
          >
            إعادة تعيين البحث
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* Header Count */}
          <div className="flex items-center justify-between px-1 text-xs text-stone-500 dark:text-stone-400">
            <span>
              عرض <strong className="text-stone-900 dark:text-white">{filteredBuyers.length}</strong> مشتري مؤكد لكتب صاحب الموقع
            </span>
            <span className="text-[11px]">
              مجموع مبيعات القائمة: <strong className="text-teal-700 dark:text-teal-400 font-bold">{filteredBuyers.reduce((s, b) => s + b.amountDzd, 0).toLocaleString()} د.ج</strong>
            </span>
          </div>

          {/* List of Buyer Cards */}
          <div className="space-y-3">
            {filteredBuyers.map((tx, idx) => {
              // Get user avatar or book cover if exists
              const matchedUser = allUsers.find(u => u.id === tx.buyerId || u.email === tx.buyerEmail);
              const matchedBook = books.find(b => b.id === tx.bookId || b.title === tx.bookTitle);
              const isOwnerAuthored = (tx.bookTitle && tx.bookTitle.includes('معا نحو التغيير')) || tx.sellerId === 'user-lokmane-owner';

              return (
                <div 
                  key={tx.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Buyer Identity */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-sm overflow-hidden">
                          {matchedUser?.avatar ? (
                            <img src={matchedUser.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{tx.buyerName?.charAt(0) || 'ق'}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-slate-800" title="مشتري موثق">
                          ✓
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm text-stone-900 dark:text-white">
                            {tx.buyerName || 'قارئ معتمد'}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300">
                            #{idx + 1}
                          </span>
                          {isOwnerAuthored && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300">
                              كتاب المالك الرئيسي ✍️
                            </span>
                          )}
                        </div>

                        {/* Contact info */}
                        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1 flex-wrap font-sans">
                          {tx.phoneNumber && (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span dir="ltr">{tx.phoneNumber}</span>
                            </span>
                          )}
                          {tx.buyerEmail && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Mail className="w-3 h-3 text-stone-400" />
                              <span>{tx.buyerEmail}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{tx.date || tx.timestamp || '2026-09-10'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Payment Method */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-slate-700 gap-1 shrink-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-base font-black text-teal-700 dark:text-teal-400">
                          {tx.amountDzd.toLocaleString()} د.ج
                        </span>
                        <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                          ({tx.amountUsdt || 7.5} USDT)
                        </span>
                      </div>

                      {/* Payment Method Badge */}
                      <div className="flex items-center gap-1.5">
                        {tx.method === 'baridimob' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CreditCard className="w-3 h-3" />
                            <span>بريدي موب BaridiMob RIP</span>
                          </span>
                        ) : tx.method === 'binance' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Sparkles className="w-3 h-3" />
                            <span>بينانس Binance Pay</span>
                          </span>
                        ) : tx.method === 'cib_ccp' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            <CreditCard className="w-3 h-3" />
                            <span>بطاقة CIB / CCP</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-800 dark:bg-slate-700 dark:text-stone-300">
                            <Wallet className="w-3 h-3" />
                            <span>رصيد المحفظة</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مكتمل</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchased Book details box */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-10 rounded bg-stone-200 dark:bg-slate-700 shrink-0 overflow-hidden shadow-xs">
                        {matchedBook?.coverUrl ? (
                          <img src={matchedBook.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-sans">الكتاب المشترى:</span>
                        <strong className="text-stone-900 dark:text-white text-xs block line-clamp-1">
                          {tx.bookTitle || 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر'}
                        </strong>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                          المؤلف: {tx.sellerName || 'لقمان ياسين أبختي (صاحب الموقع)'}
                        </span>
                      </div>
                    </div>

                    {/* Reference and Tx Hash */}
                    <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                      <span className="text-stone-400">المرجع:</span>
                      <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-stone-200 dark:border-slate-700 font-bold text-stone-800 dark:text-stone-200">
                        {tx.txRef}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: PDF Invoice, SMS Alert, Copy Data */}
                  <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                    
                    {/* Copy Buyer Data */}
                    <button
                      onClick={() => handleCopyBuyerDetails(tx)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="نسخ بيانات المشتري"
                    >
                      {copiedId === tx.id ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-black">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ البيانات</span>
                        </>
                      )}
                    </button>

                    {/* SMS Notification Trigger */}
                    <button
                      onClick={() => handleTriggerSms(tx)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="إرسال إشعار SMS عبر بريدي موب"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>معاينة إشعار SMS 📱</span>
                    </button>

                    {/* Certified PDF Sales Receipt */}
                    <button
                      onClick={() => handleDownloadInvoice(tx)}
                      disabled={isDownloadingPdfId === tx.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      title="تحميل سند وفاتورة البيع الرسمية PDF"
                    >
                      {isDownloadingPdfId === tx.id ? (
                        <>
                          <span className="animate-spin text-xs">⏳</span>
                          <span>جارٍ توليد الفاتورة...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل الفاتورة الرسمية (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Box & Platform Owner Guarantee */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="block font-black mb-1">
            توثيق حقوق الملكية والأرباح المباشرة لصاحب المنصة (أ. لقمان ياسين أبختي):
          </strong>
          كافة مبيعات كتاب <strong>"معاً نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر"</strong> تُحول أرباحها بنسبة 100% دون اقتطاع أي عمولة إلى خزينة المالك عبر حساب بريدي موب RIP: <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">00799999002847192033</code> أو محفظة بينانس الرسمية، مع تفعيل إرسال إشعار SMS تلقائي إلى الهاتف: <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">0652206947</code>.
        </div>
      </div>

    </div>
  );
};
