import React, { useState, useRef } from 'react';
import { 
  X, Upload, Image as ImageIcon, FileText, Globe, Headphones, 
  ShieldCheck, Check, Sparkles, AlertCircle, Plus, Trash2, ArrowRight, Download, Loader2
} from 'lucide-react';
import { Book, BookTranslation, InternationalLicense } from '../types';
import { useStore } from '../context/StoreContext';
import { compressImage, generateIsbn } from '../utils/security';
import { LANGUAGES } from '../utils/translations';
import { CATEGORIES } from './StoreHero';
import { extractTextFromFile, convertTextOrWordToPDF } from '../utils/pdfGenerator';

interface PublishBookModalProps {
  onClose: () => void;
}

export const PublishBookModal: React.FC<PublishBookModalProps> = ({ onClose }) => {
  const { addBook, currentUser, customization } = useStore();

  // Basic Details
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'كاتب ومؤلف');
  const [publisher, setPublisher] = useState(currentUser?.role === 'owner' ? 'دار النشر - معا نحو التغيير' : 'منشورات حرة');
  const [isbn, setIsbn] = useState(generateIsbn());
  const [category, setCategory] = useState('تنمية وتغيير');
  const [priceDzd, setPriceDzd] = useState('1500');
  const [pageCount, setPageCount] = useState('220');
  const [description, setDescription] = useState('');

  // Cover image with client-side auto-compression
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState<string | null>(null);

  // Word / PDF / Text document rich editor
  const [docContent, setDocContent] = useState(`الفصل الأول: البدايات الجديدة وصناعة الأثر\n\nإن كل فكرة عظيمة تبدأ بقرار صادق بالعمل والمثابرة.\n\nإن هذا الكتاب هو ثمرة أبحاث وتجارب معمقة لتمكين الإنسان وبناء مستقبله الرقمي والفكري.`);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isWordUploaded, setIsWordUploaded] = useState(false);
  const [pdfPageCountEstimate, setPdfPageCountEstimate] = useState<number>(220);

  // International License
  const [licenseType, setLicenseType] = useState<InternationalLicense['type']>('All-Rights-Reserved');

  // Multi-language Translations
  const [translations, setTranslations] = useState<BookTranslation[]>([
    {
      langCode: 'en',
      langName: 'English',
      title: '',
      description: '',
      sampleContent: ''
    }
  ]);

  // Audio track configuration
  const [hasAudio, setHasAudio] = useState(true);
  const [audioDuration, setAudioDuration] = useState('2:30:00');
  const [audioFileFormat, setAudioFileFormat] = useState('MP3');
  const [audioChapterTitle, setAudioChapterTitle] = useState('الفصل الأول (صوتي)');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);

  // Handle Cover upload and auto-compress using Canvas
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const originalSize = file.size;
      const compressedDataUrl = await compressImage(file, 640, 800, 0.75);
      
      const approxCompressedSize = Math.round((compressedDataUrl.length * 3) / 4);
      const ratio = Math.round(((originalSize - approxCompressedSize) / originalSize) * 100);
      
      setCoverUrl(compressedDataUrl);
      setCompressionRatio(`تم ضغط الغلاف بنجاح وتوفير ${Math.max(0, ratio)}% من المساحة.`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة وضغط الصورة');
    } finally {
      setIsCompressing(false);
    }
  };

  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [convertPdfSuccess, setConvertPdfSuccess] = useState(false);

  // Handle Word/PDF/Text File upload with clean Arabic text extraction without symbols
  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      if (text && text.trim().length > 0) {
        setDocContent(text);
        // Estimate pages accurately based on word count
        const words = text.trim().split(/\s+/).length;
        const estPages = Math.max(1, Math.ceil(words / 250));
        setPageCount(estPages.toString());
        setPdfPageCountEstimate(estPages);
      } else {
        setDocContent(`[مستند PDF / Word تم استيراده]: ${file.name}\n\nجاهز للتحويل الفوري إلى صيغة PDF معتمدة ومحمية.`);
      }
      setIsWordUploaded(true);
    } catch (err) {
      console.error('Error extracting text from document:', err);
      alert('حدث خطأ أثناء قراءة الملف، يرجى التأكد من سلامة المستند.');
    }
  };

  // Direct Text / Word to PDF Instant Conversion
  const handleDirectConvertPDF = async () => {
    if (!docContent.trim()) {
      alert('يرجى كتابة أو إرفاق محتوى نصي لتحويله إلى PDF');
      return;
    }

    try {
      setIsConvertingPdf(true);
      await convertTextOrWordToPDF({
        title: title.trim() || uploadedFileName?.replace(/\.[^/.]+$/, '') || 'مستند كتاب رقمي',
        author: author.trim() || customization.presidentName,
        content: docContent,
        category: category,
        isbn: isbn,
        storeName: customization.storeName,
        presidentName: customization.presidentName,
      });
      setConvertPdfSuccess(true);
      setTimeout(() => setConvertPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Error converting to PDF:', err);
      alert('حدث خطأ أثناء تحويل المستند إلى PDF');
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const handleAddTranslationField = () => {
    setTranslations((prev) => [
      ...prev,
      { langCode: 'fr', langName: 'Français', title: '', description: '', sampleContent: '' }
    ]);
  };

  const handleRemoveTranslationField = (index: number) => {
    setTranslations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTranslation = (index: number, field: keyof BookTranslation, val: string) => {
    setTranslations((prev) => {
      const next = [...prev];
      if (field === 'langCode') {
        const langObj = LANGUAGES.find((l) => l.code === val);
        next[index] = { ...next[index], langCode: val, langName: langObj?.name || val };
      } else {
        next[index] = { ...next[index], [field]: val };
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const cleanTranslations = translations.filter((t) => t.title.trim() && t.description.trim());

    const result = addBook({
      title,
      author,
      publisher,
      isbn,
      category,
      priceDzd: Number(priceDzd) || 1200,
      pageCount: Number(pageCount) || 200,
      description,
      coverUrl,
      wordDocContent: docContent,
      translations: cleanTranslations,
      audioTrack: {
        hasAudio,
        duration: audioDuration,
        format: audioFileFormat,
        chapters: [
          {
            id: 'ch-pub-1',
            title: audioChapterTitle || 'الفصل الأول',
            durationSeconds: 1200,
            sampleText: docContent.substring(0, 300) || description
          }
        ]
      },
      license: {
        type: licenseType,
        registrationId: `DZ-REG-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        protectionYear: 2026,
        jurisdiction: 'OMPI / WIPO Intellectual Property Global Bureau',
        isVerifiedBadge: true
      }
    });

    if (result.success) {
      onClose();
    }
  };

  const priceNum = Number(priceDzd) || 0;
  const approxUsdt = (((priceNum) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                بيع ونشر كتاب جديد
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                رفع الغلاف، معالجة ملف Word، الترجمة العالمية، وتوليد ترخيص الملكية الفكرية
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Section 1: Basic Info & Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cover Upload Box */}
            <div className="flex flex-col items-center justify-center">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 block w-full text-right">
                غلاف الكتاب (ضغط تلقائي للذاكرة)
              </label>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[3/4] w-full max-w-[220px] rounded-2xl overflow-hidden border-2 border-dashed border-stone-300 dark:border-slate-700 hover:border-teal-600 bg-stone-50 dark:bg-slate-800 flex flex-col items-center justify-center cursor-pointer group shadow-sm"
              >
                {coverUrl ? (
                  <>
                    <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity">
                      <Upload className="w-6 h-6 mb-1" />
                      <span>تغيير الغلاف</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-stone-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-xs font-bold block">انقر لرفع الغلاف</span>
                    <span className="text-[10px] block text-stone-400 mt-1">PNG, JPG, WebP</span>
                  </div>
                )}
                
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                    جاري الضغط الفوري...
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {compressionRatio && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 text-center block">
                  {compressionRatio}
                </span>
              )}
            </div>

            {/* Book Details Inputs */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  عنوان الكتاب *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: رحلة نحو النجاح والقيادة الملهمة..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    اسم المؤلف
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    دار النشر / الجهة
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    التصنيف
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'جميع التصنيفات').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    السعر بالدينار (د.ج)
                  </label>
                  <input
                    type="number"
                    value={priceDzd}
                    onChange={(e) => setPriceDzd(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white font-bold"
                    required
                  />
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
                    (يعادل ≈ {approxUsdt} USDT)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    رقم الإيداع / ISBN
                  </label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  نبذة وصفية عن الكتاب *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب ملخصاً جذاباً للكتاب وأهم الأفكار التي يعالجها..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

            </div>

          </div>

          {/* Section 2: Word / PDF File to PDF & Editor */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">PDF / Word</span>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                  معالجة ملف الكتاب والتحويل الفوري إلى صيغة PDF معتمدة ومحمية
                </h4>
              </div>
              <button
                type="button"
                onClick={() => wordInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع ملف (PDF / DOCX / TXT)</span>
              </button>
              <input
                ref={wordInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx,.md"
                onChange={handleWordUpload}
                className="hidden"
              />
            </div>

            {uploadedFileName && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>تم إدراج ومعالجة الملف: <strong>{uploadedFileName}</strong></span>
                </span>
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
                  جاهز للتصدير كـ PDF
                </span>
              </div>
            )}

            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="اكتب أو عدل محتوى وفصول الكتاب هنا ليتم تضمينها في النسخة الإلكترونية وتوليد ملف PDF عالي الجودة..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-xs font-serif rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white leading-relaxed"
            />

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-stone-200 dark:border-slate-700 text-xs">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                <span>عدد الكلمات: <strong>{docContent.trim() ? docContent.trim().split(/\s+/).length : 0}</strong></span>
                <span className="mx-2">•</span>
                <span>الحروف: <strong>{docContent.length}</strong></span>
                <span className="mx-2">•</span>
                <span>الصفحات التقديرية: <strong>{Math.max(1, Math.ceil(docContent.trim().split(/\s+/).length / 250))} صفحة</strong></span>
              </div>

              <button
                type="button"
                onClick={handleDirectConvertPDF}
                disabled={isConvertingPdf || !docContent.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
                  convertPdfSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isConvertingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ تحويل ومعالجة الـ PDF...</span>
                  </>
                ) : convertPdfSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم التحميل والحفظ كـ PDF بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>تحويل المستند وتنزيله كـ PDF 📄</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Multi-Language Translations */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                  ترجمة الكتاب ونشر نسخ بلغات متعددة (15+ لغة عالمية)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddTranslationField}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة لغة</span>
              </button>
            </div>

            {translations.map((trans, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <div>
                  <select
                    value={trans.langCode}
                    onChange={(e) => handleUpdateTranslation(idx, 'langCode', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={trans.title}
                    onChange={(e) => handleUpdateTranslation(idx, 'title', e.target.value)}
                    placeholder="Translated Title..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={trans.description}
                    onChange={(e) => handleUpdateTranslation(idx, 'description', e.target.value)}
                    placeholder="Short Description..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveTranslationField(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Audiobook & License */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Audio configuration */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-xs text-stone-900 dark:text-white">إعدادات الكتاب الصوتي والـ TTS</h4>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasAudioCheck"
                  checked={hasAudio}
                  onChange={(e) => setHasAudio(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="hasAudioCheck" className="text-xs text-stone-700 dark:text-stone-300 font-bold">
                  تفعيل المسار الصوتي وتحويل النص لكلام
                </label>
              </div>

              {hasAudio && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-stone-400 block">الصيغة الصوتية المدعومة</label>
                    <select
                      value={audioFileFormat}
                      onChange={(e) => setAudioFileFormat(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    >
                      <option value="MP3">MP3</option>
                      <option value="M4A">M4A</option>
                      <option value="OGG">OGG</option>
                      <option value="WAV">WAV</option>
                      <option value="AAC">AAC</option>
                      <option value="WebM">WebM</option>
                      <option value="Opus">Opus</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block">مدة التسجيل التقديرية</label>
                    <input
                      type="text"
                      value={audioDuration}
                      onChange={(e) => setAudioDuration(e.target.value)}
                      placeholder="مثال: 3:15:00"
                      className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* License configuration */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs text-stone-900 dark:text-white">إدارة حقوق النشر والترخيص الدولي</h4>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 block mb-1">نوع الترخيص المعتمد</label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as InternationalLicense['type'])}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white font-mono"
                >
                  <option value="All-Rights-Reserved">All-Rights-Reserved (جميع الحقوق محفوظة)</option>
                  <option value="CC-BY-NC-ND">Creative Commons (CC-BY-NC-ND)</option>
                  <option value="CC-BY-SA">Creative Commons (CC-BY-SA)</option>
                  <option value="Open-Access">Open Access (وصول حر غير تجاري)</option>
                  <option value="GNU-FDL">GNU Free Documentation License</option>
                </select>
              </div>

              <span className="text-[10px] text-stone-400 block leading-tight">
                سيتم توليد شارة توثيق دولية ورقم تسلسلي تلقائي بمجرد النشر.
              </span>
            </div>

          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>نشر وتثبيت الكتاب في المتجر</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
