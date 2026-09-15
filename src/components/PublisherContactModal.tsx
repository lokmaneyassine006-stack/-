import React, { useState } from 'react';
import { 
  X, Building2, Send, MessageSquare, Check, Phone, Mail, 
  Clock, ShieldCheck, MapPin, Sparkles, AlertCircle, FileText, 
  ExternalLink, Copy, CheckCircle2, User, HelpCircle, BookOpen, 
  Layers, ChevronRight, MessageCircle, MessageSquarePlus
} from 'lucide-react';
import { Book, PublisherMessage } from '../types';
import { useStore } from '../context/StoreContext';
import { copyToClipboard } from '../utils/clipboard';

interface PublisherContactModalProps {
  book: Book;
  onClose: () => void;
  initialCategory?: PublisherMessage['category'];
}

export const PublisherContactModal: React.FC<PublisherContactModalProps> = ({
  book,
  onClose,
  initialCategory = 'general' as any,
}) => {
  const { 
    currentUser, 
    getPublisherProfile, 
    publisherMessages, 
    sendPublisherMessage,
    replyToPublisherMessage
  } = useStore();

  const publisher = getPublisherProfile(book.publisher);
  
  const [activeTab, setActiveTab] = useState<'new_message' | 'conversations' | 'profile'>('new_message');
  
  // Message form state
  const [category, setCategory] = useState<PublisherMessage['category']>(
    initialCategory === 'general' ? 'reader_question' : initialCategory
  );
  const [senderName, setSenderName] = useState(
    `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'قارئ معتمد'
  );
  const [senderEmail, setSenderEmail] = useState(currentUser.email || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [subject, setSubject] = useState(`استفسار بخصوص كتاب "${book.title}"`);
  const [message, setMessage] = useState('');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Quick reply for existing message (Admin/User)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Messages for this specific book and publisher
  const bookMessages = publisherMessages.filter(
    (m) => m.bookId === book.id || m.publisherName === book.publisher
  );

  const handleCopy = async (text: string, fieldName: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleApplyTemplate = (tmplCategory: PublisherMessage['category'], tmplSubject: string, tmplBody: string) => {
    setCategory(tmplCategory);
    setSubject(tmplSubject);
    setMessage(tmplBody);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!senderName.trim()) {
      setFormError('يرجى كتابة الاسم الكامل');
      return;
    }
    if (!senderEmail.trim()) {
      setFormError('يرجى إدخال البريد الإلكتروني للمتابعة');
      return;
    }
    if (!subject.trim()) {
      setFormError('يرجى تحديد عنوان الاستفسار');
      return;
    }
    if (!message.trim()) {
      setFormError('يرجى كتابة نص الرسالة أو الاستفسار');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = sendPublisherMessage({
        bookId: book.id,
        bookTitle: book.title,
        publisherName: book.publisher,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim() || undefined,
        category,
        subject: subject.trim(),
        message: message.trim()
      });

      if (!res.success) {
        setFormError(res.error || 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً');
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setMessage('');
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('conversations');
        }, 1200);
      }
    } catch (err) {
      setIsSubmitting(false);
      setFormError('حدث خطأ غير متوقع أثناء إرسال الرسالة');
    }
  };

  const handleSendReply = (msgId: string) => {
    if (!replyText.trim()) return;
    const res = replyToPublisherMessage(msgId, replyText);
    if (res.success) {
      setReplyText('');
      setReplyingToId(null);
    } else {
      alert(res.error || 'فشل إرسال الرد');
    }
  };

  const categoryLabels: Record<PublisherMessage['category'], { label: string; icon: string; bg: string }> = {
    rights_inquiry: { label: 'حقوق النشر والترخيص والترجمة', icon: '📜', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    bulk_order: { label: 'طلب اقتناء بالجملة / نسخ ورقية للمؤسسات', icon: '📦', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    manuscript_submission: { label: 'تقديم مخطوطة أو طلب نشر كتاب جديد', icon: '✍️', bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    reader_question: { label: 'استفسار قارئ حول المحتوى ومناقشة فكرية', icon: '❓', bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
    press_interview: { label: 'تواصل صحفي ومقابلة إعلامية', icon: '🎙️', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    distribution: { label: 'توزيع لوجستي وشراكات مكتبات', icon: '🤝', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' }
  };

  // WhatsApp quick chat link with pre-filled message
  const whatsappUrl = `https://wa.me/${publisher.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `السلام عليكم، أتواصل معكم بخصوص كتاب "${book.title}" الصادر عن داركم (دار ${book.publisher}).`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-stone-900 to-teal-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-800/80 border border-teal-600/50 flex items-center justify-center shrink-0 shadow-lg text-amber-300">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-stone-950 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ناشر معتمد رسمياً</span>
                </span>
                <span className="text-xs text-teal-200/80 font-mono">
                  رخصة رقم: {publisher.licenseNumber}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white mt-1 leading-tight flex items-center gap-2 flex-wrap">
                <span>فضاء التواصل مع:</span>
                <span className="text-amber-300 underline decoration-teal-400 decoration-2 underline-offset-4">
                  {book.publisher}
                </span>
              </h2>

              <p className="text-xs text-stone-300 mt-1 line-clamp-1">
                الكتاب المستهدف: <strong className="text-white font-bold">{book.title}</strong> — للمؤلف: <strong className="text-white">{book.author}</strong>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>الرد خلال: <strong className="text-white">{publisher.avgResponseHours} ساعات</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>المقر: <strong className="text-white">{publisher.city}، {publisher.country}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <User className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>الممثل: <strong className="text-white">{publisher.contactPerson}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <MessageSquare className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>الرسائل المفتوحة: <strong className="text-white">{bookMessages.length} رسالة</strong></span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-stone-200 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('new_message')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'new_message'
                ? 'bg-teal-700 text-white shadow-md font-black'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>إرسال استفسار جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'conversations'
                ? 'bg-teal-700 text-white shadow-md font-black'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>سجل المحادثات والردود</span>
            {bookMessages.length > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-teal-900 text-teal-200 font-mono">
                {bookMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-teal-700 text-white shadow-md font-black'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>بطاقة دار النشر وقنوات الاتصال المباشر</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: NEW MESSAGE FORM */}
          {activeTab === 'new_message' && (
            <div className="space-y-6">
              
              {/* Context Summary Box */}
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-12 h-16 rounded-lg object-cover shadow-sm border border-teal-300/40"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">
                      موضوع التواصل حول الإصدار:
                    </span>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white leading-snug">
                      {book.title}
                    </h4>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      تأليف: {book.author} • ISBN: {book.isbn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>محادثة واتساب سريعة</span>
                  </a>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>نماذج وقوالب رسائل جاهزة بنقرة واحدة:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(
                      'bulk_order',
                      `طلب اقتناء نسخ ورقية مطبوعة من كتاب "${book.title}"`,
                      `السلام عليكم ورحمة الله، نود الاستفسار عن إمكانية اقتناء كمية (25-50 نسخة) ورقية مطبوعة من كتاب "${book.title}" لمؤسستنا/مكتبتنا، نرجو تزويدنا بالأسعار التشجيعية للجملة وتفاصيل الشحن والتوصيل داخل الجزائر.`
                    )}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-slate-700 transition-colors"
                  >
                    📦 طلب اقتناء بالجملة
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(
                      'rights_inquiry',
                      `استفسار بخصوص تراخيص وحقوق الترجمة لكتاب "${book.title}"`,
                      `تحية طيبة للقائمين على دار النشر، نود الاستفسار حول إمكانية الحصول على ترخيص رسمي لترجمة أو اقتباس فصول من كتاب "${book.title}"، نرجو موافاتنا بالإجراءات والشروط المعتمدة من جهتكم.`
                    )}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-slate-700 transition-colors"
                  >
                    📜 حقوق النشر والترجمة
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(
                      'manuscript_submission',
                      `مقترح نشر كتاب جديد في ذات التخصص لدى دار ${book.publisher}`,
                      `السلام عليكم ورحمة الله، بعد اطلاعي على إصداركم المتميز "${book.title}" وجودة النشر لديكم، يسعدني تقديم مقترح عمل/مخطوطة كتاب جديدة في نفس المجال لنيل شرف النشر والتوزيع عبر داركم الموقرة.`
                    )}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-slate-700 transition-colors"
                  >
                    ✍️ اقتراح نشر مخطوطة جديدة
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(
                      'reader_question',
                      `رسالة للقارئ واستفسار فكري حول مضامين كتاب "${book.title}"`,
                      `تحية تقدير للمؤلف ودار النشر، بعد قراءتي المتعمقة لكتاب "${book.title}"، أود توجيه هذا الاستفسار ومشاركة بعض الملاحظات البناءة حول النقاط المطروحة في العمل.`
                    )}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-slate-700 transition-colors"
                  >
                    ❓ استفسار قارئ ومناقشة
                  </button>
                </div>
              </div>

              {/* Communication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>تم إرسال رسالتكم بنجاح إلى دار النشر! جاري تحويلكم إلى سجل المحادثات...</span>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    تصنيف الاستفسار / الغرض من التواصل:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(categoryLabels) as Array<PublisherMessage['category']>).map((catKey) => {
                      const item = categoryLabels[catKey];
                      const isSelected = category === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setCategory(catKey)}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-right transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                              : 'bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="flex-1 truncate">{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sender Info Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      الاسم الكامل: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="مثال: كريم الجزائري"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      البريد الإلكتروني للرد: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium text-left"
                      dir="ltr"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      رقم الهاتف / الواتساب: <span className="text-stone-400 text-[10px]">(اختياري)</span>
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="0652206947"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    عنوان الاستفسار: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="موضوع الرسالة..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                    required
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    نص الرسالة أو تفاصيل الطلب: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="اكتب رسالتك لدار النشر بالتفصيل..."
                    className="w-full p-3.5 rounded-xl text-xs border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium leading-relaxed resize-y"
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                    <span>سيتم توجيه هذه الرسالة مباشرة إلى ممثل الدار: {publisher.contactPerson} ({publisher.contactPersonRole})</span>
                    <span>{message.length} حرف</span>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>جاري إرسال الرسالة...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال الرسالة لدار النشر 🚀</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* TAB 2: CONVERSATIONS AND REPLIES */}
          {activeTab === 'conversations' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    سجل المراسلات والمحادثات المتبادلة
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    متابعة الاستفسارات الموجهة لدار ({book.publisher}) وردود مسؤولي النشر
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('new_message')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-teal-800 transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>إرسال استفسار جديد</span>
                </button>
              </div>

              {bookMessages.length === 0 ? (
                <div className="text-center py-12 bg-stone-50/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-slate-700 p-6 space-y-3">
                  <MessageSquare className="w-12 h-12 text-stone-300 dark:text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    لا توجد رسائل سابقة مسجلة حتى الآن
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                    يمكنك بدء التواصل فوراً عبر التبويب الأول لطرح استفسار أو طلب كميات أو مناقشة حقوق النشر مع دار النشر.
                  </p>
                  <button
                    onClick={() => setActiveTab('new_message')}
                    className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-black shadow-md hover:bg-teal-800"
                  >
                    ابدأ أول محادثة الآن
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookMessages.map((msg) => {
                    const catInfo = categoryLabels[msg.category] || categoryLabels.reader_question;
                    const isReplying = replyingToId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className="p-5 rounded-2xl bg-stone-50/80 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-4 shadow-xs"
                      >
                        {/* Message Header */}
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${catInfo.bg}`}>
                                {catInfo.icon} {catInfo.label}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                {new Date(msg.createdAt).toLocaleString('ar-DZ')}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-stone-900 dark:text-white mt-1">
                              {msg.subject}
                            </h4>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {msg.status === 'replied' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300/40">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تم الرد رسمياً من الدار</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 border border-amber-300/40">
                                <Clock className="w-3 h-3" />
                                <span>قيد المراجعة والتدقيق</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sender Inquiry Body */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-stone-200/80 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                            <span className="font-bold text-stone-800 dark:text-stone-200">
                              المرسل: {msg.senderName} ({msg.senderEmail})
                            </span>
                            {msg.senderPhone && (
                              <span dir="ltr" className="font-mono text-[11px]">
                                هاتف: {msg.senderPhone}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                            {msg.message}
                          </p>
                        </div>

                        {/* Official Publisher Reply Box (if replied) */}
                        {msg.publisherReply && (
                          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 relative mr-2 sm:mr-6">
                            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-black text-[10px]">
                                  🏛️
                                </div>
                                <span className="font-black text-teal-900 dark:text-teal-200">
                                  رد دار النشر: {msg.publisherReply.responderName}
                                </span>
                                <span className="text-[10px] text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md font-bold">
                                  {msg.publisherReply.responderRole}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {new Date(msg.publisherReply.repliedAt).toLocaleString('ar-DZ')}
                              </span>
                            </div>

                            <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed pr-8 whitespace-pre-line">
                              {msg.publisherReply.text}
                            </p>
                          </div>
                        )}

                        {/* Action buttons (Reply / follow up) */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[11px] text-stone-400">
                            معرف المحادثة: <strong className="font-mono">{msg.id}</strong>
                          </span>

                          <div className="flex items-center gap-2">
                            {/* If Owner / Admin or User wants to reply */}
                            {!isReplying && (
                              <button
                                onClick={() => {
                                  setReplyingToId(msg.id);
                                  setReplyText('');
                                }}
                                className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>{currentUser.role === 'owner' ? 'الرد كممثل الدار' : 'إضافة تعقيب على المحادثة'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Reply Form */}
                        {isReplying && (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-500/50 space-y-2 animate-fadeIn">
                            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                              {currentUser.role === 'owner' ? 'كتابة رد رسمي من إدارة النشر:' : 'كتابة تعقيب إضافي للمحادثة:'}
                            </label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={3}
                              placeholder="اكتب ردك هنا..."
                              className="w-full p-2.5 rounded-lg text-xs border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => handleSendReply(msg.id)}
                                className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
                              >
                                إرسال الرد
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PUBLISHER PROFILE & DIRECT CONTACT CHANNELS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* About Publisher Block */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>عن دار النشر والتوزيع:</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    رخصة معتمدة رقم {publisher.licenseNumber}
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {publisher.aboutPublisher}
                </p>
                
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">مجالات النشر المعتمدة:</span>
                  {publisher.publishingGenres.map((genre, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 text-stone-700 dark:text-stone-300">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Channels Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Official Phone */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <Phone className="w-4 h-4 text-teal-600" />
                      <span>الهاتف الرسمي المباشر</span>
                    </div>
                    <button
                      onClick={() => handleCopy(publisher.officialPhone, 'phone')}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'phone' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'phone' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <div className="text-base font-black text-stone-900 dark:text-white font-mono text-left" dir="ltr">
                    {publisher.officialPhone}
                  </div>
                  <a
                    href={`tel:${publisher.officialPhone.replace(/[^0-9+]/g, '')}`}
                    className="block w-full py-2 text-center rounded-xl bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
                  >
                    اتصال هاتفي مباشر
                  </a>
                </div>

                {/* Official WhatsApp */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>الواتساب المعتمد لدار النشر</span>
                    </div>
                    <button
                      onClick={() => handleCopy(publisher.whatsappNumber, 'whatsapp')}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'whatsapp' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'whatsapp' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <div className="text-base font-black text-stone-900 dark:text-white font-mono text-left" dir="ltr">
                    {publisher.whatsappNumber}
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    فتح محادثة واتساب فورية
                  </a>
                </div>

                {/* Official Email */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span>البريد الإلكتروني للناشر</span>
                    </div>
                    <button
                      onClick={() => handleCopy(publisher.officialEmail, 'email')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'email' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <div className="text-sm font-black text-stone-900 dark:text-white font-mono text-left truncate" dir="ltr">
                    {publisher.officialEmail}
                  </div>
                  <a
                    href={`mailto:${publisher.officialEmail}?subject=${encodeURIComponent(`استفسار بخصوص كتاب ${book.title}`)}`}
                    className="block w-full py-2 text-center rounded-xl bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    إرسال بريد إلكتروني
                  </a>
                </div>

                {/* Official Address & Working Hours */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>العنوان وساعات العمل الرسمية</span>
                  </div>
                  <div className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-snug">
                    {publisher.address}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>الأحد - الخميس (08:30 ص - 17:00 م)</span>
                  </div>
                </div>

              </div>

              {/* Representative Information */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-slate-800/80 border border-teal-200/80 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900 dark:text-white">
                    مسؤول التواصل المباشر مع القراء والمؤلفين: {publisher.contactPerson}
                  </h4>
                  <span className="text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                    {publisher.contactPersonRole} • جاهز للرد على الاستفسارات وطلبات التوزيع
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-stone-50 dark:bg-slate-800/80 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>جميع المراسلات تخضع لميثاق حماية البيانات وحقوق الملكية الفكرية</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-300 dark:hover:bg-slate-600 transition-colors"
          >
            إغلاق الفضاء
          </button>
        </div>

      </div>
    </div>
  );
};
