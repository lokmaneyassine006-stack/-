import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Bot, Sparkles, Send, Compass, BookOpen, CreditCard, 
  ShieldCheck, HelpCircle, ArrowLeft, RefreshCw, Zap,
  ExternalLink, Palette, Wallet, Share2, Building2, Headphones,
  CheckCircle2, MessageSquare
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { TfcAction, TfcMessage } from '../types';

interface TfcAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_GREETING: TfcMessage = {
  id: 'tfc-welcome',
  sender: 'tfc',
  timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
  text: `مرحباً بك! أنا **TFC**، مرشدك الذكي الرسمي لمنصة ومكتبة **معاً نحو التغيير** 🌟

مهمتي هي مرافقتك وشرح **كافة مزايا المنصة** وكيفية استخدامها خطوة بخطوة:

1. 💳 **الشراء والدفع المرن**: الدفع بالدينار الجزائري عبر **بريدي موب**، أو بالعملات الرقمية عبر **بينانس باي**.
2. ✍️ **نشر الكتب والتراخيص الدولية**: نشر مؤلفاتك واستخراج شهادات حماية ملكية فكرية معتمدة قابلة للتنزيل.
3. 📖 **مفتاح السمات ووضع السيبييا**: راحة عينيك أثناء القراءة الطويلة بوضع الورق العتيق الدافئ.
4. 🎁 **أداة الترويج وكسب الأرباح**: كود خصم 20% للمشترين وكاش باك 10% فوري في محفظتك.
5. 🏢 **فضاء الناشرين**: تواصل رسمي ومباشر مع دور النشر للمخطوطات والحقوق.
6. 🤖 **ترشيحات Gemini الذكية**: قسم مخصص أسفل الصفحة يقترح كتباً تناسب ذوقك وتصفحك.

اختر أي ميزة ترغب في استكشافها أو اكتب سؤالك أدناه!`,
  suggestedActions: [
    { label: 'شراء عبر بريدي موب', actionType: 'modal', target: 'baridimob_pay', description: 'نافذة الدفع بالدينار الجزائري' },
    { label: 'نشر كتابك الآن', actionType: 'modal', target: 'publish', description: 'رفع مؤلف وتحديد ترخيصه' },
    { label: 'تجربة وضع السيبييا 📖', actionType: 'action', target: 'theme_sepia', description: 'تفعيل السمة المريحة للعين' },
    { label: 'عرض الكتب المقترحة لك', actionType: 'scroll', target: 'recommended-books-section', description: 'الانتقال لترشيحات Gemini' }
  ],
  quickTopics: [
    'كيف أشتري كتاباً عبر بريدي موب؟',
    'كيف أسحب أرباحي من المحفظة؟',
    'كيف أنشر كتابي وأحصل على شهادة ترخيص؟',
    'ما هي أداة الترويج وكيف أكسب 10% كاش باك؟'
  ]
};

const FEATURE_SHORTCUTS = [
  { label: 'الدفع والشراء', query: 'كيف أشتري الكتب وأدفع عبر بريدي موب وبينانس؟', icon: CreditCard },
  { label: 'نشر كتاب وحماية الحقوق', query: 'كيف أنشر كتابي في المنصة وأحصل على شهادة ترخيص دولية؟', icon: BookOpen },
  { label: 'وضع السيبييا والسمات', query: 'ما هو وضع السيبييا ومفاتيح السمات وكيف يحمي العين؟', icon: Palette },
  { label: 'المحفظة وسحب الأرباح', query: 'كيف تعمل المحفظة الرقمية وكيف أسحب أرباحي عبر بريدي موب؟', icon: Wallet },
  { label: 'الترويج والكاش باك', query: 'كيف أروج للمنصة وأكسب عمولة كاش باك 10% وكود خصم 20%؟', icon: Share2 },
  { label: 'فضاء الناشرين', query: 'كيف أتواصل مع ناشر الكتاب ومسؤولي دور النشر؟', icon: Building2 },
  { label: 'الكتب المقترحة (Gemini)', query: 'كيف يعمل قسم كتب مقترحة لك في أسفل الصفحة الرئيسية؟', icon: Sparkles },
  { label: 'الصوتيات والترجمة', query: 'كيف استمع للكتب الصوتية واستخدم القارئ الذكي وترجمة اللغات؟', icon: Headphones },
];

export const TfcAssistantModal: React.FC<TfcAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    setActiveModal, 
    setThemeMode, 
    setIsCartOpen 
  } = useStore();

  const [messages, setMessages] = useState<TfcMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMessage: TfcMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/tfc-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();

      const tfcResponse: TfcMessage = {
        id: `tfc-${Date.now()}`,
        sender: 'tfc',
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        text: data.answer,
        suggestedActions: data.suggestedActions || [],
        quickTopics: data.quickTopics || [],
      };

      setMessages((prev) => [...prev, tfcResponse]);
    } catch (err) {
      console.warn('TFC API fallback:', err);
      // Fallback local response
      const tfcResponse: TfcMessage = {
        id: `tfc-${Date.now()}`,
        sender: 'tfc',
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        text: `تم استلام استفسارك حول "${query}".
يمكنك الاستفادة من كافة مزايا المنصة:
- **الشراء الفوري**: عبر بريدي موب بالدينار أو بينانس باي بالـ USDT.
- **نشر المؤلفات**: عبر زر "نشر كتاب" مع تراخيص دولية وشهادات PDF.
- **تخصيص السمة**: اختيار وضع الإضاءة أو الوضع المظلم أو وضع السيبييا الدافئ من الشريط العلوي.
- **المحفظة الرقمية**: سحب العمولات والأرباح مباشرة لحسابك.`,
        suggestedActions: [
          { label: 'شراء عبر بريدي موب', actionType: 'modal', target: 'baridimob_pay' },
          { label: 'نشر كتاب جديد', actionType: 'modal', target: 'publish' }
        ],
        quickTopics: ['كيف أدفع عبر بريدي موب؟', 'كيف أنشر كتابي؟']
      };
      setMessages((prev) => [...prev, tfcResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExecuteAction = (action: TfcAction) => {
    if (action.actionType === 'modal') {
      if (action.target === 'cart') {
        onClose();
        setIsCartOpen(true);
      } else {
        onClose();
        setActiveModal(action.target);
      }
    } else if (action.actionType === 'scroll') {
      onClose();
      const elem = document.getElementById(action.target);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else if (action.actionType === 'action') {
      if (action.target === 'theme_sepia') {
        setThemeMode('sepia');
      } else if (action.target === 'theme_dark') {
        setThemeMode('dark');
      } else if (action.target === 'theme_light') {
        setThemeMode('light');
      }
    }
  };

  return (
    <div 
      id="tfc-assistant-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        id="tfc-assistant-modal-container"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-teal-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] transition-colors"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-teal-900 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-teal-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  <span>TFC</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-teal-950 font-black">
                    مرشد المنصة الذكي
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-teal-100/90 font-medium">
                Together For Change AI • دليلك الشامل لشرح كافة مزايا وخصائص الموقع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMessages([INITIAL_GREETING])}
              className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إعادة بدء المحادثة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="إغلاق المرشد"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Shortcuts Horizontal Bar */}
        <div className="px-4 py-2.5 bg-stone-50 dark:bg-slate-800/80 border-b border-stone-200 dark:border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-400 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>شروحات سريعة:</span>
          </span>
          {FEATURE_SHORTCUTS.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(sc.query)}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-slate-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Icon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
              >
                {/* Avatar */}
                {!isUser ? (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-800 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                    أنت
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-tr-none'
                      : 'bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-stone-100 border border-stone-200/80 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  {/* Formatted Content */}
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="font-black text-base text-teal-800 dark:text-teal-300 mt-2">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('7. ') || line.startsWith('8. ')) {
                        return (
                          <div key={idx} className="flex items-start gap-1.5 font-medium py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-2" />
                            <span>{line}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex items-start gap-1.5 font-medium py-0.5 pr-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0 mt-2" />
                            <span>{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>

                  {/* Suggested Action Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-stone-200 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>إجراءات فورية لتطبيق الشرح:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleExecuteAction(act)}
                            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700/60 text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                            title={act.description || act.label}
                          >
                            <span>{act.label}</span>
                            <ArrowLeft className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Quick Topics */}
                  {msg.quickTopics && msg.quickTopics.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-stone-400 font-bold">اسأل أيضاً:</span>
                      {msg.quickTopics.map((top, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => handleSendMessage(top)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-stone-600 dark:text-stone-300 text-[10px] font-semibold transition-colors cursor-pointer border border-stone-200/60 dark:border-slate-600"
                        >
                          {top}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-[10px] opacity-60 text-left mt-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-bold mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl p-3.5 bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700 rounded-tl-none flex items-center gap-2 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>TFC يحلل طلبك ويجهز الشرح بالخطوات...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك عن أي ميزة في الموقع (مثال: كيف أشتري؟ كيف أنشر كتابي؟ ما هو وضع السيبييا؟)..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 rounded-2xl bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/50 transition-all placeholder:text-stone-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-teal-900/20 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <span>إرسال</span>
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
            <span>مدعوم بنموذج Google Gemini 3.8 Flash • منصة معاً نحو التغيير</span>
            <span className="font-mono">TFC Assistant v2.6</span>
          </div>
        </div>
      </div>
    </div>
  );
};
