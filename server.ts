import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback intelligent recommendation engine
function generateAlgorithmicRecommendations(
  recentlyViewed: any[],
  availableBooks: any[]
) {
  const viewedIds = new Set((recentlyViewed || []).map((b) => b.id));
  const viewedCategories = (recentlyViewed || []).map((b) => b.category).filter(Boolean);

  // Filter out already viewed books if possible, or fallback to all
  let candidates = (availableBooks || []).filter((b) => !viewedIds.has(b.id));
  if (candidates.length < 3) {
    candidates = availableBooks || [];
  }

  // Score candidate books by category match & rating
  const scored = candidates.map((book) => {
    let score = 80;
    if (viewedCategories.includes(book.category)) {
      score += 12;
    }
    if (book.isOwnerBook) {
      score += 5;
    }
    if (book.rating && book.rating >= 4.8) {
      score += 2;
    }
    score = Math.min(99, score);

    let reason = `اخترنا لك "${book.title}" ليتكامل مع شغفك بالكتب المتميزة في تصنيف ${book.category || 'الفكر والتطوير'} وتوسيع آفاقك المعرفية.`;
    if (book.isOwnerBook) {
      reason = `نرشح لك هذا الإصدار المتميز للأستاذ لقمان ياسين أبختي نظراً لاهتمامك بمجالات النهضة والتطوير الفكري وبناء الإنسان.`;
    } else if (viewedCategories.includes(book.category)) {
      reason = `نظراً لتصفحك كتباً في تصنيف "${book.category}"، هذا الكتاب يقدم طرحاً معمقاً وعملياً يثري تجربتك القرائية.`;
    }

    return {
      bookId: book.id,
      reason,
      matchScore: score,
      highlightTag: book.category || 'ترشيح مخصص'
    };
  });

  // Sort by score and take top 4
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const selected = scored.slice(0, 4);

  return {
    readingProfile: viewedCategories.length > 0 
      ? `قارئ مهتم بـ ${viewedCategories[0]} والفكر التنموي المعاصر` 
      : 'قارئ شغوف بالمعرفة والتطوير الشخصي والفكري',
    greeting: 'بناءً على تصفحك الأخير لعناوين المنصة، قمنا بانتقاء هذه المجموعة الفريدة لتعزيز رحلتك القرائية:',
    recommendations: selected,
    source: 'algorithmic' as const
  };
}

// Fallback comprehensive knowledge base for TFC Assistant
function getTfcFallbackResponse(rawMessage: string) {
  const q = (rawMessage || '').toLowerCase();

  if (q.includes('بريدي') || q.includes('baridi') || q.includes('rip') || q.includes('دينار') || q.includes('دفع') || q.includes('شراء')) {
    return {
      answer: `لشراء الكتب عبر **بريدي موب (BaridiMob)** بالدينار الجزائري:
1. انقر على زر **"شراء"** أو **"بريدي موب"** المباشر الموجود على أي بطاقة كتاب في المتجر.
2. ستظهر لك نافذة التحويل التي تحتوي على رقم الحساب البريدي الجاري (RIP) الرسمي واسم المستفيد.
3. قم بإجراء التحويل عبر تطبيق BaridiMob، ثم ارفع صورة وصل الدفع أو أدخل رقم المعاملة للتحقق الفوري.
4. بمجرد التأكيد، سيُفتح الكتاب فوراً للقراءة والتحميل بصيغة PDF وتضاف نسخته إلى مكتبتك!`,
      suggestedActions: [
        { label: 'شراء سريع عبر بريدي موب', actionType: 'modal', target: 'baridimob_pay', description: 'فتح نافذة الدفع بالدينار الجزائري' },
        { label: 'فتح سلة المشتريات', actionType: 'modal', target: 'cart', description: 'معاينة الكتب المضافة للسلة' }
      ],
      quickTopics: [
        'كيف أدفع عبر بينانس باي بالعملات الرقمية؟',
        'كيف استمع إلى الكتب الصوتية؟',
        'كيف أتواصل مع ناشر الكتاب؟'
      ],
      source: 'algorithmic'
    };
  }

  if (q.includes('بينانس') || q.includes('binance') || q.includes('usdt') || q.includes('كريبتو') || q.includes('عملات رقمية')) {
    return {
      answer: `لشراء الكتب عبر **بينانس باي (Binance Pay)** بالعملات المشفرة:
1. انقر على زر **"Binance Pay"** أسفل أي كتاب أو من داخل سلة المشتريات.
2. سيظهر لك معرّف المنصة الرسمي (Binance Pay ID: **512218080**).
3. يمكنك الدفع بالعملات المدعومة: **USDT, USDC, BNB, BTC**.
4. يتم التحقق اللحظي عبر البلوكشين وتأكيد الطلب تلقائياً، لتتمكن من تنزيل نسختك الرقمية فوراً!`,
      suggestedActions: [
        { label: 'دفع بينانس باي المباشر', actionType: 'modal', target: 'binance_pay', description: 'استعراض بوابة الدفع الرقمي' },
        { label: 'فتح المحفظة', actionType: 'modal', target: 'wallet', description: 'رصيدك بالـ USDT' }
      ],
      quickTopics: [
        'كيف أدفع بالدينار الجزائري عبر بريدي موب؟',
        'كيف أنشر كتابي في المنصة؟',
        'ما هي ميزة ترشيح الكتب بالذكاء الاصطناعي؟'
      ],
      source: 'algorithmic'
    };
  }

  if (q.includes('نشر') || q.includes('كتابي') || q.includes('مؤلف') || q.includes('حقوق') || q.includes('ترخيص') || q.includes('ناشر')) {
    return {
      answer: `لنشر كتابك الجديد وحماية حقوق الملكية الفكرية دولياً:
1. اضغط على زر **"نشر كتاب"** في الشريط العلوي للموقع.
2. أدخل بيانات كتابك (العنوان، المؤلف، التصنيف، الوصف، والسعر بالدينار الجزائري أو USDT).
3. اختر نوع الترخيص الدولي المناسب لك (All-Rights-Reserved لحماية كاملة، أو Creative Commons، أو Open Access).
4. بعد النشر، يمنحك النظام **شهادة ترخيص رقمية دولية معتمدة** برقم تسجيل رسمي قابلة للطباعة والتنزيل بصيغة PDF.`,
      suggestedActions: [
        { label: 'نشر كتاب جديد الآن', actionType: 'modal', target: 'publish', description: 'إضافة مؤلف جديد للمنصة' },
        { label: 'فضاء التواصل مع الناشرين', actionType: 'modal', target: 'publisher_contact', description: 'إدارة دور النشر والمراسلات' }
      ],
      quickTopics: [
        'كيف أحصل على شهادة حماية الملكية الفكرية؟',
        'كيف أربح من ترويج كتبي في المنصة؟',
        'ما هي خيارات الترجمة المتعددة للكتب؟'
      ],
      source: 'algorithmic'
    };
  }

  if (q.includes('سيبييا') || q.includes('sepia') || q.includes('سمة') || q.includes('ليلي') || q.includes('مظلم') || q.includes('theme') || q.includes('عين')) {
    return {
      answer: `يوفر الموقع **مفتاح تبديل السمة (Theme Toggle)** المتقدم في أعلى الصفحة لراحة عينيك أثناء القراءة:
- ☀️ **وضع الإضاءة**: مظهر ناصع ومشرق مثالي لأوقات النهار والبيئات المضيئة.
- 🌙 **الوضع المظلم**: مظهر ليلي هادئ مريح للنظر في الغرف المظلمة وموفر للبطارية.
- 📖 **وضع السيبييا (Sepia)**: درجات ورقية دافئة مستوحاة من ورق الكتب الأصلية العتيقة، مصمم خصيصاً لتقليل إجهاد العين والضوء الأزرق أثناء جلسات القراءة الطويلة.
يتم حفظ خيارك تلقائياً في المتصفح ليبقى مفعلاً في كل زياراتك!`,
      suggestedActions: [
        { label: 'تجربة وضع السيبييا الآن', actionType: 'action', target: 'theme_sepia', description: 'تفعيل المظهر الورقي المريح للعين' },
        { label: 'تجربة الوضع الليلي', actionType: 'action', target: 'theme_dark', description: 'تفعيل السمة المظلمة' }
      ],
      quickTopics: [
        'كيف استمع إلى الكتب الصوتية؟',
        'أين أجد الكتب المقترحة لي بالذكاء الاصطناعي؟',
        'كيف أسحب أرباحي من المحفظة؟'
      ],
      source: 'algorithmic'
    };
  }

  if (q.includes('محفظة') || q.includes('سحب') || q.includes('أرباح') || q.includes('رصيد') || q.includes('wallet')) {
    return {
      answer: `توفر المنصة **محفظة مالية رقمية متكاملة**:
1. اضغط على مؤشر الرصيد في القائمة العلوية لفتح المحفظة.
2. يمكنك متابعة رصيدك المزدوج بالدينار الجزائري (DZD) والتيثر الرقمي (USDT).
3. شحن الرصيد يتم عبر بريدي موب أو بينانس.
4. سحب الأرباح والعمولات يتم مباشرة وبسرعة إلى حساب بريدي موب الشخصي (عبر الـ RIP) أو إلى محفظة بينانس الرقمية.`,
      suggestedActions: [
        { label: 'فتح المحفظة المالية', actionType: 'modal', target: 'wallet', description: 'إدارة الرصيد والسحب والشحن' },
        { label: 'أداة الترويج وكسب العمولات', actionType: 'modal', target: 'promotion_tool', description: 'اربح 10% كاش باك' }
      ],
      quickTopics: [
        'كيف أحصل على عمولة كاش باك من الترويج؟',
        'كيف أشتري كتاباً عبر بريدي موب؟',
        'كيف أحصل على بطاقة العضوية الافتراضية؟'
      ],
      source: 'algorithmic'
    };
  }

  if (q.includes('ترويج') || q.includes('كود') || q.includes('خصم') || q.includes('كاش باك') || q.includes('إحالة') || q.includes('أفيلييت')) {
    return {
      answer: `نظام **الترويج والإحالة الذكي** في المنصة:
1. انقر على أداة **"ترويج المنصة"** من الشريط الجانبي أو زر الترويج داخل تفاصيل أي كتاب.
2. ستحصل على كود خصم حصري ورابط ترويجي مخصص لك.
3. عندما يشتري أي شخص باستخدام كودك، يحصل هو على **خصم 20%** فوري.
4. وتحصل أنت فوراً على **عمولة كاش باك 10%** تودع مباشرة في محفظتك الرقمية لتسحبها في أي وقت!`,
      suggestedActions: [
        { label: 'فتح أداة ترويج المنصة', actionType: 'modal', target: 'promotion_tool', description: 'توليد كود الخصم ومتابعة الأرباح' },
        { label: 'فتح المحفظة', actionType: 'modal', target: 'wallet', description: 'استعراض الأرباح المكتسبة' }
      ],
      quickTopics: [
        'كيف أسحب أرباحي عبر بريدي موب؟',
        'كيف أنشر كتابي في المنصة؟',
        'ما هي المزايا الإدارية في المنصة؟'
      ],
      source: 'algorithmic'
    };
  }

  if (q.includes('مقترح') || q.includes('gemini') || q.includes('ذكاء') || q.includes('توصيات') || q.includes('تصفح')) {
    return {
      answer: `قسم **"كتب مقترحة لك"** المدعوم بـ Gemini 3.8 Flash:
1. يقع في **أسفل الصفحة الرئيسية** للموقع (فوق التذييل مباشرة).
2. يعمل تلقائياً بتحليل الكتب والعناوين التي تصفحتها مؤخراً في المنصة.
3. يقوم الذكاء الاصطناعي باستخراج نمطك القرائي واهتماماتك، ثم يقترح عليك أفضل الكتب المتوافقة مع ذوقك مع توضيح سبب الترشيح ونسبة التوافق.
4. يمكنك في أي وقت الضغط على زر **"تحديث الترشيحات"** لإعادة تحليل اهتماماتك بناءً على تصفحك الجديد!`,
      suggestedActions: [
        { label: 'الانتقال إلى قسم الكتب المقترحة', actionType: 'scroll', target: 'recommended-books-section', description: 'مشاهدة ترشيحات Gemini لك' },
        { label: 'استعراض جميع الكتب', actionType: 'scroll', target: 'books-catalog', description: 'تصفح كتالوج الكتب المتوفرة' }
      ],
      quickTopics: [
        'كيف أستمع للكتب الصوتية؟',
        'كيف أشتري كتاباً فورياً؟',
        'كيف أغير سمة العرض إلى سيبييا؟'
      ],
      source: 'algorithmic'
    };
  }

  // General default overview
  return {
    answer: `مرحباً بك! أنا **TFC**، مرشدك الذكي الرسمي لمنصة ومكتبة **معاً نحو التغيير** 🌟

إليك أبرز المزايا وكيفية الاستفادة منها:
1. 📚 **شراء وقراءة الكتب**: دعم فوري للدفع بالدينار الجزائري عبر **بريدي موب** والعملات الرقمية عبر **بينانس باي**.
2. 🎧 **كتب صوتية وقارئ ذكي (TTS)**: استمع للكتب في مشغل مدمج وترجم محتواها لأكثر من 15 لغة عالمية.
3. ✍️ **نشر الكتب وحماية الحقوق**: انشر مؤلفاتك واستخرج تراخيص وشهادات حماية دولية معتمدة بصيغة PDF.
4. 🏢 **فضاء التواصل مع الناشرين**: تواصل مباشرة مع دور النشر من صفحة كل كتاب.
5. 🎁 **أداة الترويج والكاش باك**: انشر كود خصم 20% واكسب عمولة 10% مباشرة في محفظتك.
6. 💳 **المحفظة وبطاقة العضوية**: سحب فوري للأرباح وبطاقة VIP رقمية مخصصة.
7. 📖 **سمة السيبييا والوضع المظلم**: تجربة قراءة مريحة للعين وقابلة للحفظ تلقائياً.
8. 🤖 **قسم كتب مقترحة لك**: ترشيحات ذكية مخصصة أسفل الصفحة بناءً على ما تصفحته.

ما الميزة التي تود أن أشرح لك كيفية استخدامها بالتفصيل؟`,
    suggestedActions: [
      { label: 'شراء عبر بريدي موب', actionType: 'modal', target: 'baridimob_pay', description: 'دفع بالدينار الجزائري' },
      { label: 'نشر كتاب جديد', actionType: 'modal', target: 'publish', description: 'إضافة مؤلف وحماية حقوقه' },
      { label: 'عرض الكتب المقترحة لك', actionType: 'scroll', target: 'recommended-books-section', description: 'ترشيحات Gemini المخصصة' }
    ],
    quickTopics: [
      'كيف أشتري كتاباً عبر بريدي موب؟',
      'كيف أسحب أرباحي من المحفظة؟',
      'ما هو وضع السيبييا وكيف أفعله؟'
    ],
    source: 'algorithmic'
  };
}

async function startServer() {

  const app = express();

  app.use(express.json({ limit: '5mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') 
    });
  });

  // Gemini Book Recommendations API
  app.post('/api/recommendations', async (req, res) => {
    try {
      const { recentlyViewed = [], availableBooks = [] } = req.body;

      if (!Array.isArray(availableBooks) || availableBooks.length === 0) {
        return res.status(400).json({ error: 'Available books list is required' });
      }

      const ai = getGenAI();

      if (!ai) {
        // Fallback to algorithmic recommendations if no API key is provided
        const fallback = generateAlgorithmicRecommendations(recentlyViewed, availableBooks);
        return res.json(fallback);
      }

      // Compact summary for token efficiency and high quality prompt
      const recentlyViewedSummary = (recentlyViewed || []).slice(0, 5).map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        description: (b.description || '').substring(0, 150)
      }));

      const availableBooksSummary = availableBooks.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        rating: b.rating,
        description: (b.description || '').substring(0, 150)
      }));

      const prompt = `أنت خبير أدبي ومرشد قرائي ذكي لمنصة "مكتبة معاً نحو التغيير" (Together Towards Change).
المطلوب منك تحليل الذوق القرائي للمستخدم بناءً على قائمة الكتب التي تصفحها مؤخراً، واختيار أفضل 3 إلى 4 كتب من قائمة الكتب المتوفرة في المتجر، لترشيحها له بدقة وذكاء.

الكتب التي تصفحها المستخدم مؤخراً:
${JSON.stringify(recentlyViewedSummary, null, 2)}

قائمة الكتب المتاحة في المتجر للاختيار منها:
${JSON.stringify(availableBooksSummary, null, 2)}

إرشادات هامة:
1. تجنب ترشيح الكتب التي تصفحها المستخدم بالفعل إلا إذا كانت شديدة الأهمية لربط الفكرة.
2. اكتب باللغة العربية الفصحى الراقية والملهمة.
3. قدّم سبباً مقنعاً وشخصياً لكل كتاب (1-2 جملة) يوضح للقارئ لماذا سيعجبه هذا الكتاب بالتحديد مقارنة بما تصفحه.
4. حدد نسبة توافق منطقية (matchScore) بين 82 و 98.
5. حدد وسماً بارزاً وموجزاً (highlightTag) يعبر عن ميزة الكتاب (مثل: 'فكر ونهضة', 'تطوير القيادة', 'ذكاء عاطفي', 'أدب هادف').`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              readingProfile: {
                type: Type.STRING,
                description: 'توصيف ذكي وموجز للنمط القرائي والاهتمامات الفكرية للقارئ',
              },
              greeting: {
                type: Type.STRING,
                description: 'رسالة ترحيب مخصصة باللغة العربية تشرح سبب اختيار هذه الباقة له',
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    bookId: {
                      type: Type.STRING,
                      description: 'معرف الكتاب المطابق تماماً لأحد المعرفات في قائمة الكتب المتاحة',
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'شرح مقنع وجذاب لسبب ترشيح هذا الكتاب بناءً على الكتب المتصفحة',
                    },
                    matchScore: {
                      type: Type.INTEGER,
                      description: 'نسبة التوافق التقديرية بين 80 و 99',
                    },
                    highlightTag: {
                      type: Type.STRING,
                      description: 'وسم بارز ومركّز من كلمتين يلخص الفائدة الرئيسية',
                    },
                  },
                  required: ['bookId', 'reason', 'matchScore', 'highlightTag'],
                },
              },
            },
            required: ['readingProfile', 'greeting', 'recommendations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');

      // Validate that recommended bookIds exist in available books
      const validRecommendations = (parsed.recommendations || []).filter((r: any) =>
        availableBooks.some((b: any) => b.id === r.bookId)
      );

      if (validRecommendations.length === 0) {
        const fallback = generateAlgorithmicRecommendations(recentlyViewed, availableBooks);
        return res.json(fallback);
      }

      return res.json({
        readingProfile: parsed.readingProfile || 'قارئ شغوف بالفكر والنهضة',
        greeting: parsed.greeting || 'بناءً على اهتماماتك وتصفحك الأخير، تم إعداد هذه الترشيحات بالذكاء الاصطناعي لك:',
        recommendations: validRecommendations,
        source: 'gemini'
      });
    } catch (error: any) {
      console.error('Error generating Gemini recommendations:', error);
      // Seamlessly fallback to algorithmic recommendations on error so client never breaks
      const { recentlyViewed = [], availableBooks = [] } = req.body || {};
      const fallback = generateAlgorithmicRecommendations(recentlyViewed, availableBooks);
      return res.json(fallback);
    }
  });

  // TFC AI Assistant - Platform Guide & Feature Explainer
  app.post('/api/tfc-assistant', async (req, res) => {
    try {
      const { message = '', history = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const ai = getGenAI();

      if (!ai) {
        // Fallback to rich built-in knowledge base if Gemini API key not present
        const fallback = getTfcFallbackResponse(message);
        return res.json(fallback);
      }

      const systemPrompt = `أنت "TFC" (اختصار Together For Change / معاً نحو التغيير) - مرشد الذكاء الاصطناعي والمساعد التوجيهي الرسمي لمنصة ومكتبة "معاً نحو التغيير" التي أسسها الأستاذ والمفكر لقمان ياسين أبختي.
مهمتك المحورية: شرح كافة مزايا وخدمات المنصة للمستخدمين، وتوجيههم خطوة بخطوة باللغة العربية الفصحى الراقية والواضحة لكيفية الاستفادة من كل خاصية.

المزايا والخدمات الكاملة في المنصة:
1. شراء ودفع الكتب:
   - الدفع عبر "بريدي موب (BaridiMob)": بالدينار الجزائري مباشرة عبر رقم الحساب RIP مع رفع وصل التحويل أو الإشعار التلقائي بالـ SMS.
   - الدفع عبر "بينانس باي (Binance Pay)": بالعملات الرقمية (USDT, USDC, BNB, BTC) فورياً عبر Binance Pay ID: 512218080.
   - صيغ الكتب: كتب إلكترونية رقمية (PDF فوري) أو كتب صوتية (Audiobooks).
2. تشغيل واستماع وترجمة صوتية:
   - مشغل صوتي متقدم مثبت أسفل الشاشة، يدعم التحكم بالسرعة وعينات الفصول.
   - القارئ الذكي (TTS) لتحويل النصوص إلى صوت طبيعي.
   - ترجمة فورية إلى أكثر من 15 لغة عالمية عبر الذكاء الاصطناعي.
3. نشر الكتب وحماية الحقوق الدولية:
   - إمكانية نشر المؤلفات عبر زر "نشر كتاب"، وتحديد السعر بالدينار وUSDT.
   - استخراج وتوثيق تراخيص دولية لحماية الملكية الفكرية (All-Rights-Reserved, Creative Commons, Open Access) مع شهادات حماية رسمية قابلة للتنزيل كـ PDF.
4. فضاء التواصل مع ناشر الكتاب (Publisher Hub):
   - مراسلة دار نشر أي كتاب مباشرة عبر تبويب "تواصل مع الناشر" في تفاصيل الكتاب (استفسار عن حقوق، شراء بالجملة، نشر مخطوطات، أسئلة قراء) ومتابعة الردود.
5. أداة الترويج ونظام الأفيلييت (Affiliate & Cash Back):
   - توليد كود خصم حصري: يمنح المشترين خصماً بنسبة 20%، ويمنح المروّج عمولة كاش باك 10% تضاف فوراً لمحفظته.
   - بث حي لعمليات الترويج والشراء.
6. المحفظة الرقمية وسحب الأرباح:
   - إدارة رصيد بالدينار الجزائري و USDT، مع إمكانية شحن الرصيد وسحب الأرباح فورياً إلى حساب بريدي موب RIP أو محفظة بينانس.
7. بطاقة العضوية الافتراضية:
   - تخصيص وتوليد بطاقة عضوية رقمية فاخرة تحمل اسم المستخدم ورقم هويته وQR code قابلة للتصدير.
8. مفتاح تبديل السمة (Theme Toggle):
   - التبديل في الشريط العلوي بين وضع الإضاءة ☀️، الوضع المظلم 🌙، ووضع السيبييا 📖 (Sepia) المريح للعين أثناء القراءة الطويلة، مع حفظ التفضيل تلقائياً في الذاكرة المحلية localStorage.
9. قسم "كتب مقترحة لك":
   - يظهر في أسفل الصفحة الرئيسية ويحلل الكتب التي تصفحها المستخدم مؤخراً ليقترح له عناوين تناسب ذوقه تماماً مدعوماً بنموذج Gemini 3.8 Flash.
10. مجتمع المنصة وإدارتها:
    - المنتدى الفكري، فريق العمل والتقديم على وظائف، ولوحة تحكم الإدارة للمالك لقمان ياسين أبختي.

المطلوب:
أجب على استفسار المستخدم بأسلوب ترحيبي ذكي، مختصر وواضح (مرتب في نقاط عملية خطوة بخطوة).
واقترح أزرار إجراءات تفاعلية فورية (suggestedActions) ومواضيع تالية مقترحة (quickTopics).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nسؤال المستخدم: "${message}"` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: 'إجابة مفصلة وشاملة وودودة باللغة العربية تشرح الميزة وكيفية استخدامها خطوة بخطوة',
              },
              suggestedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: 'نص الزر التفاعلي مثل: فتح المحفظة، نشر كتاب، تفعيل وضع السيبييا' },
                    actionType: { type: Type.STRING, description: 'نوع الإجراء: modal أو scroll أو action' },
                    target: { type: Type.STRING, description: 'معرف الإجراء: publish_book, wallet, virtual_card, team_hr, forum, promotion_tool, publisher_contact, baridimob_pay, binance_pay, cart, theme_sepia, recommended_section' },
                    description: { type: Type.STRING, description: 'وصف إضافي قصير للزر' }
                  },
                  required: ['label', 'actionType', 'target']
                }
              },
              quickTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 أسئلة مقترحة سريعة يمكن للمستخدم الضغط عليها للاستفسار أكثر'
              }
            },
            required: ['answer', 'suggestedActions', 'quickTopics']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');

      return res.json({
        answer: parsed.answer || 'مرحباً بك! أنا مساعد TFC الذكي لمنصة معاً نحو التغيير. كيف يمكنني مساعدتك في استخدام المنصة؟',
        suggestedActions: parsed.suggestedActions || [],
        quickTopics: parsed.quickTopics || [
          'كيف أشتري كتاباً عبر بريدي موب؟',
          'كيف أنشر كتابي وأحمي حقوقه؟',
          'ما هو وضع السيبييا وكيف أفعله؟'
        ],
        source: 'gemini'
      });
    } catch (err) {
      console.error('Error in TFC Assistant endpoint:', err);
      const { message = '' } = req.body || {};
      const fallback = getTfcFallbackResponse(message);
      return res.json(fallback);
    }
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
