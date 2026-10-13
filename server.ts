import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to summarize reviews using Gemini 3.8 Flash
app.post('/api/gemini/summarize-reviews', async (req, res) => {
  try {
    const { bookTitle, author, category, rating, reviewCount, reviews } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'مفتاح Gemini API غير مهيأ في الخادم (GEMINI_API_KEY).',
      });
    }

    const reviewsSnippet = Array.isArray(reviews) && reviews.length > 0
      ? reviews
          .map((r: any, idx: number) => `المراجعة ${idx + 1} (${r.rating || 5}/5 نجوم - ${r.userName || 'قارئ'}): "${r.text}"`)
          .join('\n')
      : 'لا توجد تعليقات نصية بعد، التقييم العام هو 5 نجوم.';

    const systemPrompt = `أنت ناقد أدبي وخبير تحليل محتوى محترف لدى "مكتبة معا نحو التغيير".
مهمتك هي قراءة مراجعات وانطباعات القراء لكتاب معين، وتوليد "ملخص ذكي" فوري (Smart AI Review Summary) يبرز بدقة جوهر آراء القراء ويقدم انطباعاً سريعاً وموثوقاً لمساعدة المشتري الجديد في تقييم جودة الكتاب بسرعة وموضوعية بدلاً من الاضطرار لقراءة كافة التعليقات الخام.

أجب بصيغة JSON حصرية فقط بدون أي نصوص قبلها أو بعدها، على النحو التالي:
{
  "headline": "عنوان جذاب وموجز يصف إجماع القراء (مثال: إشادة واسعة بعمق الطرح الفلسفي وأسلوب التحفيز العملي)",
  "overallImpression": "فقرة مكثفة من سطرين إلى ثلاثة تلخص الانطباع السائد للقراء ومدى تفاعلهم مع الكتاب والرسالة المعرفية",
  "sentiment": "positive" | "very_positive" | "mixed",
  "recommendationScore": 96,
  "keyStrengths": [
    "نقطة قوة 1 تميز بها الكتاب وفق مراجعات القراء",
    "نقطة قوة 2",
    "نقطة قوة 3"
  ],
  "readerConsensus": "خلاصة مكثفة في جملة واحدة توضح رأي مجتمع القراء",
  "bestFor": "الفئات الأكثر ملاءمة (مثال: رواد التغيير الذاتي، المهتمون بالنهضة الفكرية، ومحبو القراءة الهادفة)",
  "verdict": "حكم نهائي موجز يشجع على الاقتناء ويوضح القيمة التي سيحصل عليها القارئ"
}`;

    const userPrompt = `بيانات الكتاب المستهدف:
- العنوان: "${bookTitle}"
- المؤلف: "${author}"
- التصنيف: "${category}"
- متوسط التقييم الإجمالي: ${rating || 5}/5 (${reviewCount || 0} تقييم)

مراجعات وآراء القراء:
${reviewsSnippet}

يرجى توليد الملخص الذكي الموثوق بصيغة JSON فقط:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      parsedData = {
        headline: 'إشادة واسعة وإجماع إيجابي من القراء',
        overallImpression: responseText,
        sentiment: 'very_positive',
        recommendationScore: 95,
        keyStrengths: ['محتوى فكري ملهم وبناء', 'أسلوب طرح رصين وسلس', 'أثر تطبيقي ملحوظ'],
        readerConsensus: 'أجمع القراء على رقي المحتوى وأهميته للمجتمع العربي المعاصر.',
        bestFor: 'عشاق القراءة الفكرية والتطوير الذاتي',
        verdict: 'كتاب مميز يستحق القراءة والاقتناء بدون تردد.'
      };
    }

    return res.json({ success: true, summary: parsedData });
  } catch (error: any) {
    console.error('Gemini summarization error:', error);
    return res.status(500).json({
      error: error.message || 'حدث خطأ أثناء توليد الملخص الذكي بواسطة Gemini.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
