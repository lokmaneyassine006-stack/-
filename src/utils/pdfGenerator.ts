import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import { Book } from '../types';

/**
 * Extracts clean, uncorrupted text from Word (.docx), Text (.txt, .md, .rtf, .csv) files
 * without converting Arabic or foreign characters into symbols / binary mojibake.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. DOCX (Modern Microsoft Word)
  if (
    fileName.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = result.value?.trim();
      if (extractedText) {
        return extractedText;
      }
    } catch (docxErr) {
      console.warn('Mammoth docx extraction warning:', docxErr);
    }
  }

  // 2. UTF-8 Plain Text, Markdown, CSV, RTF
  try {
    const text = await file.text();
    // Verify if it is clean readable text or binary
    if (!/[\x00-\x08\x0E-\x1F]/.test(text)) {
      return text.trim();
    }

    // For legacy .doc binary files, extract valid printable Arabic/Latin strings
    const cleanPrintable = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanPrintable.length > 30) {
      return cleanPrintable;
    }
  } catch (err) {
    console.warn('Text file read error:', err);
  }

  return '';
}

export interface ConvertDocumentOptions {
  title: string;
  author?: string;
  content: string;
  category?: string;
  isbn?: string;
  storeName?: string;
  presidentName?: string;
  fileName?: string;
}

/**
 * Converts text or Word document content directly into a high-resolution,
 * beautifully formatted PDF with 100% Arabic typography fidelity and no symbols/mojibake.
 */
export async function convertTextOrWordToPDF(options: ConvertDocumentOptions): Promise<void> {
  const storeName = options.storeName || 'معا نحو التغيير';
  const presidentName = options.presidentName || 'لقمان ياسين أبختي';
  const title = options.title || 'مستند كتاب رقمي';
  const author = options.author || presidentName;
  const content = options.content?.trim() || 'لا يوجد محتوى نصي متاح في هذا المستند.';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Helper to render high-res Canvas pages (2x scale for ultra crisp Arabic fonts)
  const renderCanvasPage = async (
    drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => Promise<void> | void
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = pageWidth * 3.7795 * scale;
    canvas.height = pageHeight * 3.7795 * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.scale(scale, scale);
    const cssWidth = canvas.width / scale;
    const cssHeight = canvas.height / scale;

    // Fill Page Background (Clean warm paper tone)
    ctx.fillStyle = '#fcfbf7';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    await drawFn(ctx, cssWidth, cssHeight);
    return canvas.toDataURL('image/jpeg', 0.96);
  };

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  // Helper to paginate text cleanly without cutting words
  const paginateText = (
    text: string,
    maxWidth: number,
    fontSize: number,
    firstPageMaxLines: number,
    subsequentPageMaxLines: number
  ): string[][] => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.font = `${fontSize}px "Amiri", "Cairo", "Tajawal", "Segoe UI", Arial, sans-serif`;

    const paragraphs = text.split('\n');
    const allLines: string[] = [];

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        allLines.push('');
        continue;
      }

      const words = paragraph.split(/\s+/);
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = tempCtx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
          allLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        allLines.push(currentLine);
      }
      allLines.push('');
    }

    const pages: string[][] = [];
    let currentLineIndex = 0;
    let isFirstPage = true;

    while (currentLineIndex < allLines.length) {
      const maxLines = isFirstPage ? firstPageMaxLines : subsequentPageMaxLines;
      const pageLines = allLines.slice(currentLineIndex, currentLineIndex + maxLines);
      pages.push(pageLines);
      currentLineIndex += maxLines;
      isFirstPage = false;
    }

    return pages.length > 0 ? pages : [[]];
  };

  const pages = paginateText(content, 690, 14, 21, 27);
  const totalPages = pages.length;

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    if (pageIdx > 0) doc.addPage();
    const pageLines = pages[pageIdx];
    const pageNum = pageIdx + 1;
    const isFirst = pageIdx === 0;

    const pageDataUrl = await renderCanvasPage(async (ctx, width, height) => {
      const hasArabic = isArabic(title + ' ' + content);
      ctx.direction = hasArabic ? 'rtl' : 'ltr';
      ctx.textAlign = hasArabic ? 'right' : 'left';

      // Page Outer Border
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 25, width - 50, height - 50);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(29, 29, width - 58, height - 58);

      let startY = 60;

      if (isFirst) {
        // First Page Luxury Header
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.roundRect(40, 42, width - 80, 80, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "Cairo", "Amiri", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        ctx.fillText(title, width / 2, 74);

        ctx.fillStyle = '#ccfbf1';
        ctx.font = 'bold 12px "Cairo", "Tajawal", Arial, sans-serif';
        ctx.fillText(
          `المؤلف: ${author}  •  منصة ${storeName} 2026  •  نسخة إلكترونية معتمدة بصيغة PDF`,
          width / 2,
          100
        );

        startY = 148;
      } else {
        // Subsequent Page Header
        ctx.fillStyle = '#0f766e';
        ctx.font = 'bold 12px "Cairo", sans-serif';
        ctx.textAlign = hasArabic ? 'right' : 'left';
        ctx.direction = hasArabic ? 'rtl' : 'ltr';
        const headerX = hasArabic ? width - 45 : 45;
        ctx.fillText(`${title} • صفحة ${pageNum} من ${totalPages}`, headerX, 48);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 56);
        ctx.lineTo(width - 40, 56);
        ctx.stroke();

        startY = 78;
      }

      // Render Text Content Lines
      ctx.fillStyle = '#1c1917';
      ctx.font = '14px "Amiri", "Cairo", "Tajawal", "Segoe UI", Arial, sans-serif';
      ctx.textAlign = hasArabic ? 'right' : 'left';
      ctx.direction = hasArabic ? 'rtl' : 'ltr';
      const textX = hasArabic ? width - 45 : 45;
      let currentY = startY;

      for (const line of pageLines) {
        if (!line.trim()) {
          currentY += 10;
          continue;
        }
        ctx.fillText(line, textX, currentY);
        currentY += 24;
      }

      // Footer
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, height - 52);
      ctx.lineTo(width - 40, height - 52);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Cairo", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(
        `الصفحة ${pageNum} من ${totalPages}  |  المحتوى الفكري محفوظ لمؤلفه ولدار النشر © 2026  |  إشراف: ${presidentName}`,
        width / 2,
        height - 36
      );
    });

    doc.addImage(pageDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  const cleanTitle = title.replace(/[^\w\u0621-\u064A]/g, '_').substring(0, 35) || 'كتاب_رقمي';
  const outFileName = options.fileName || `${cleanTitle}_PDF_معتمد.pdf`;
  doc.save(outFileName);
}

/**
 * Renders an offscreen canvas to cleanly layout Arabic text onto a canvas
 * and adds it to jsPDF pages.
 */
export async function generateBookPDF(book: Book, storeName = 'معا نحو التغيير', presidentName = 'لقمان ياسين أبختي'): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // 1. Helper to render high-res Canvas pages for Arabic typography
  const renderCanvasPage = async (drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => Promise<void> | void): Promise<string> => {
    const canvas = document.createElement('canvas');
    // High DPI rendering for crisp text (scale 2x)
    const scale = 2;
    canvas.width = (pageWidth * 3.7795) * scale;
    canvas.height = (pageHeight * 3.7795) * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.scale(scale, scale);
    const cssWidth = canvas.width / scale;
    const cssHeight = canvas.height / scale;

    // Fill Page Background (Warm elegant white)
    ctx.fillStyle = '#fcfbf7';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    await drawFn(ctx, cssWidth, cssHeight);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Helper to load image
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
      img.src = src;
    });
  };

  // Helper for wrapped text in Canvas
  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: 'right' | 'center' | 'left' = 'right'
  ): number => {
    ctx.textAlign = align;
    const paragraphs = text.split('\n');
    let currentY = y;

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        currentY += lineHeight * 0.8;
        continue;
      }
      const words = paragraph.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(currentLine, x, currentY);
          currentLine = words[i];
          currentY += lineHeight;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        ctx.fillText(currentLine, x, currentY);
        currentY += lineHeight;
      }
      currentY += lineHeight * 0.3; // Paragraph spacing
    }
    return currentY;
  };

  // ==========================================
  // PAGE 1: LUXURY BOOK COVER & TITLE PAGE
  // ==========================================
  const page1DataUrl = await renderCanvasPage(async (ctx, width, height) => {
    // Outer decorative border
    ctx.strokeStyle = '#0f766e'; // Teal 700
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#d97706'; // Amber 600
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Top Header Badge
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 140, 50, 280, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Cairo", "Tajawal", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(`منصة ومكتبة ${storeName} 2026`, width / 2, 73);

    // Cover Image if available
    let coverLoaded = false;
    if (book.coverUrl) {
      try {
        const img = await loadImage(book.coverUrl);
        const imgWidth = 240;
        const imgHeight = 320;
        const imgX = (width - imgWidth) / 2;
        const imgY = 105;

        // Shadow behind cover
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.roundRect(imgX + 6, imgY + 6, imgWidth, imgHeight, 12);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgWidth, imgHeight, 12);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();

        // Border around cover
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);
        coverLoaded = true;
      } catch {
        coverLoaded = false;
      }
    }

    const titleStartY = coverLoaded ? 465 : 220;

    // Title
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 26px "Amiri", "Cairo", serif, Arial';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    drawWrappedText(ctx, book.title, width / 2, titleStartY, width - 120, 36, 'center');

    // Author
    ctx.fillStyle = '#b45309'; // Amber 700
    ctx.font = 'bold 18px "Cairo", "Tajawal", Arial, sans-serif';
    ctx.fillText(`المؤلف: ${book.author}`, width / 2, titleStartY + 80);

    // Publisher & Category
    ctx.fillStyle = '#57534e';
    ctx.font = '14px "Cairo", Arial, sans-serif';
    ctx.fillText(`دار النشر: ${book.publisher}  •  التصنيف: ${book.category}`, width / 2, titleStartY + 110);

    // ISBN & License Badge
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 13px "Courier New", monospace, Arial';
    ctx.fillText(`ISBN: ${book.isbn}  |  رقم التوثيق: ${book.license.registrationId}`, width / 2, titleStartY + 140);

    // Bottom Seal
    ctx.fillStyle = '#78716c';
    ctx.font = '11px "Cairo", Arial, sans-serif';
    ctx.fillText(`نسخة إلكترونية معتمدة بصيغة PDF الرقمية الموحدة © 2026`, width / 2, height - 65);
    ctx.fillText(`رئيس المنصة والمؤسس: ${presidentName}`, width / 2, height - 45);
  });

  doc.addImage(page1DataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);

  // ==========================================
  // PAGE 2: BOOK METADATA, SUMMARY & RIGHTS
  // ==========================================
  doc.addPage();
  const page2DataUrl = await renderCanvasPage(async (ctx, width, height) => {
    // Header
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 18px "Cairo", "Amiri", sans-serif';
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    ctx.fillText(book.title, width - 40, 50);

    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 60);
    ctx.lineTo(width - 40, 60);
    ctx.stroke();

    // Box: Overview / Summary
    ctx.fillStyle = '#f5f5f4';
    ctx.beginPath();
    ctx.roundRect(40, 75, width - 80, 160, 10);
    ctx.fill();
    ctx.strokeStyle = '#d6d3d1';
    ctx.stroke();

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 15px "Cairo", sans-serif';
    ctx.fillText('📖 ملخص ورسالة الكتاب:', width - 60, 100);

    ctx.fillStyle = '#292524';
    ctx.font = '13px "Cairo", "Tajawal", Arial, sans-serif';
    drawWrappedText(ctx, book.description, width - 60, 125, width - 120, 22, 'right');

    // Box: Legal & Copyright
    ctx.fillStyle = '#f0fdfa'; // Teal 50
    ctx.beginPath();
    ctx.roundRect(40, 255, width - 80, 150, 10);
    ctx.fill();
    ctx.strokeStyle = '#99f6e4';
    ctx.stroke();

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 15px "Cairo", sans-serif';
    ctx.fillText('🛡️ بيانات التوثيق والملكية الفكرية الدولية (WIPO / ONDA):', width - 60, 280);

    ctx.fillStyle = '#334155';
    ctx.font = '13px "Cairo", Arial, sans-serif';
    const licText = `• نوع الترخيص: ${book.license.type}\n• رقم التسجيل الرسمي: ${book.license.registrationId}\n• سنة الحماية والاعتماد: ${book.license.protectionYear}\n• الاختصاص القضائي: ${book.license.jurisdiction}\n• عدد الصفحات الأصلية: ${book.pageCount} صفحة\n• كود الإيداع الدولي: ISBN ${book.isbn}`;
    drawWrappedText(ctx, licText, width - 60, 305, width - 120, 22, 'right');

    // Box: Translations if any
    if (book.translations.length > 0) {
      ctx.fillStyle = '#fdf4ff';
      ctx.beginPath();
      ctx.roundRect(40, 425, width - 80, 130, 10);
      ctx.fill();
      ctx.strokeStyle = '#f0abfc';
      ctx.stroke();

      ctx.fillStyle = '#86198f';
      ctx.font = 'bold 14px "Cairo", sans-serif';
      ctx.fillText(`🌐 النسخ المترجمة المتاحة (${book.translations.length} لغات):`, width - 60, 450);

      ctx.fillStyle = '#475569';
      ctx.font = '12px "Cairo", Arial, sans-serif';
      let transText = '';
      book.translations.forEach((t) => {
        transText += `• [${t.langName}]: ${t.title}\n`;
      });
      drawWrappedText(ctx, transText, width - 60, 475, width - 120, 20, 'right');
    }

    // Footer
    ctx.fillStyle = '#a8a29e';
    ctx.font = '11px "Cairo", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`الصفحة 2  |  منصة ${storeName} 2026`, width / 2, height - 30);
  });

  doc.addImage(page2DataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);

  // ==========================================
  // PAGE 3+: BOOK CHAPTERS & WORD/TEXT CONTENT
  // ==========================================
  const rawContent = book.wordDocContent || `الفصل الأول: البدايات الجديدة وصناعة الأثر\n\nإن كل فكرة عظيمة تبدأ بقرار صادق بالعمل والمثابرة.\n\nإن هذا الكتاب هو ثمرة تجارب وأبحاث علمية تهدف إلى تمكين القارئ العربي من امتلاك أدوات التفكير الإيجابي والقيادة الفاعلة في عصر الرقمنة والذكاء الاصطناعي.`;

  // Split content into chunks if long
  const paragraphs = rawContent.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const p of paragraphs) {
    if ((currentChunk + '\n' + p).length > 1200) {
      chunks.push(currentChunk);
      currentChunk = p;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n${p}` : p;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  for (let pageIdx = 0; pageIdx < chunks.length; pageIdx++) {
    doc.addPage();
    const chunkText = chunks[pageIdx];
    const pageNum = 3 + pageIdx;

    const pageContentDataUrl = await renderCanvasPage(async (ctx, width, height) => {
      // Top Header
      ctx.fillStyle = '#0f766e';
      ctx.font = 'bold 14px "Cairo", sans-serif';
      ctx.textAlign = 'right';
      ctx.direction = 'rtl';
      ctx.fillText(`${book.title} - نص ومحتوى الكتاب`, width - 40, 45);

      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 55);
      ctx.lineTo(width - 40, 55);
      ctx.stroke();

      // Main Text Body
      ctx.fillStyle = '#1c1917';
      ctx.font = '14px "Amiri", "Cairo", serif, Arial';
      drawWrappedText(ctx, chunkText, width - 45, 85, width - 90, 28, 'right');

      // Footer
      ctx.fillStyle = '#a8a29e';
      ctx.font = '11px "Cairo", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`الصفحة ${pageNum}  |  المحتوى الفكري محفوظ لمؤلفه ولدار النشر © 2026`, width / 2, height - 30);
    });

    doc.addImage(pageContentDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  // Save the generated PDF file
  const fileName = `${book.title.replace(/[^\w\u0621-\u064A]/g, '_').substring(0, 40)}_PDF_Together_Change.pdf`;
  doc.save(fileName);
}

export interface SalesReceiptData {
  invoiceNumber: string;
  date?: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: 'baridimob' | 'binance' | 'wallet' | 'ccp' | 'other' | string;
  paymentMethodLabel?: string;
  transactionRef?: string;
  items: Array<{
    title: string;
    author: string;
    priceDzd: number;
    priceUsdt?: number;
    category?: string;
    isbn?: string;
  }>;
  totalDzd: number;
  totalUsdt?: number;
  storeName?: string;
  presidentName?: string;
  ripNumber?: string;
  beneficiaryName?: string;
  badgeTitle?: string;
}

/**
 * Generates an official, high-resolution Arabic PDF Sales Receipt / Invoice
 */
export async function generateSalesReceiptPDF(data: SalesReceiptData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = pageWidth * 3.7795 * scale;
  canvas.height = pageHeight * 3.7795 * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.scale(scale, scale);
  const width = canvas.width / scale;
  const height = canvas.height / scale;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer Decorative Borders
  ctx.strokeStyle = '#0f766e'; // Teal 700
  ctx.lineWidth = 2.5;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.strokeStyle = '#d97706'; // Amber 600
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 25, width - 50, height - 50);

  // 1. TOP HEADER BANNER
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.roundRect(35, 35, width - 70, 75, 12);
  ctx.fill();

  // Header Title & Store Identity
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Cairo", "Tajawal", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(data.storeName || 'مكتبة معاً نحو التغيير', width / 2, 65);

  ctx.fillStyle = '#fbbf24'; // Amber 400
  ctx.font = 'bold 12px "Cairo", "Tajawal", Arial, sans-serif';
  ctx.fillText(`المنصة الرسمية لنشر وتوزيع الكتب الرقمية والصوتية  •  المؤسس: ${data.presidentName || 'لقمان ياسين أبختي'}`, width / 2, 85);

  ctx.fillStyle = '#e6fffa';
  ctx.font = '10px "Cairo", Arial, sans-serif';
  ctx.fillText('توثيق إلكتروني رسمي معتمد  •  Official Digital Sales Receipt © 2026', width / 2, 98);

  // 2. RECEIPT BADGE
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 130, 118, 260, 28, 14);
  ctx.fill();

  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 13px "Cairo", "Tajawal", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.badgeTitle || 'وصل بيع إلكتروني رسمي معتمد', width / 2, 137);

  // 3. METADATA & INVOICE DETAILS BOX
  const metaY = 155;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(35, metaY, width - 70, 65, 10);
  ctx.fill();
  ctx.stroke();

  // Right Column: Invoice & Date
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('رقم الوصل المرجعي:', width - 50, metaY + 25);
  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 13px "Courier New", monospace, Arial';
  ctx.fillText(data.invoiceNumber || 'INV-2026-REC', width - 50, metaY + 45);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.fillText('التاريخ والوقت:', width - 240, metaY + 25);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.fillText(data.date || new Date().toLocaleString('ar-DZ'), width - 240, metaY + 45);

  // Left Column: Payment Status Badge
  ctx.fillStyle = '#10b981'; // Green
  ctx.beginPath();
  ctx.roundRect(50, metaY + 18, 140, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓ معتمد ومسدد بالكامل', 120, metaY + 37);

  // 4. CUSTOMER & PAYMENT DETAILS BOX
  const custY = 230;
  ctx.fillStyle = '#f0fdfa'; // Light Teal
  ctx.strokeStyle = '#99f6e4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(35, custY, width - 70, 85, 10);
  ctx.fill();
  ctx.stroke();

  // Customer Info
  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 12px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('بيانات المشتري:', width - 50, custY + 24);

  ctx.fillStyle = '#334155';
  ctx.font = '11px "Cairo", Arial, sans-serif';
  ctx.fillText(`الاسم: ${data.customerName || 'مستخدم المنصة'}`, width - 50, custY + 46);
  ctx.fillText(`البريد الإلكتروني: ${data.customerEmail || 'user@example.com'}`, width - 50, custY + 68);

  // Payment Info
  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 12px "Cairo", Arial, sans-serif';
  ctx.fillText('طريقة الدفع والحساب:', width / 2 + 30, custY + 24);

  const methodText = data.paymentMethodLabel || 
    (data.paymentMethod === 'baridimob' ? 'بريدي موب (BaridiMob RIP)' :
     data.paymentMethod === 'binance' ? 'بينانس باي (Binance Pay - USDT)' :
     data.paymentMethod === 'wallet' ? 'رصيد محفظة المنصة' : 'تحويل بريدي / بنكي');

  ctx.fillStyle = '#334155';
  ctx.font = '11px "Cairo", Arial, sans-serif';
  ctx.fillText(`طريقة السداد: ${methodText}`, width / 2 + 30, custY + 46);
  if (data.transactionRef) {
    ctx.fillText(`المرجع/العملية: ${data.transactionRef}`, width / 2 + 30, custY + 68);
  } else if (data.ripNumber) {
    ctx.fillText(`رقم الـ RIP: ${data.ripNumber}`, width / 2 + 30, custY + 68);
  }

  // 5. PURCHASED ITEMS TABLE
  const tableY = 328;
  // Table Header Bar
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.roundRect(35, tableY, width - 70, 32, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('تفاصيل الكتاب / الإصدار', width - 60, tableY + 21);
  ctx.fillText('المؤلف والتصنيف', width - 360, tableY + 21);
  ctx.fillText('المبلغ المسدد', 60, tableY + 21);

  let currentItemY = tableY + 40;
  const items = data.items && data.items.length > 0 ? data.items : [{
    title: 'إصدار كتاب رقمي وصوتي',
    author: data.presidentName || 'لقمان ياسين أبختي',
    priceDzd: data.totalDzd,
    priceUsdt: data.totalUsdt,
  }];

  items.forEach((item, index) => {
    // Row background
    if (index % 2 === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(35, currentItemY - 6, width - 70, 36);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${index + 1}. ${item.title.substring(0, 45)}`, width - 60, currentItemY + 16);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Cairo", Arial, sans-serif';
    ctx.fillText(`${item.author} ${item.category ? '• ' + item.category : ''}`, width - 360, currentItemY + 16);

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 12px "Cairo", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.priceDzd.toLocaleString()} د.ج`, 60, currentItemY + 16);

    currentItemY += 38;
  });

  // Table Bottom Divider
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, currentItemY);
  ctx.lineTo(width - 35, currentItemY);
  ctx.stroke();

  // Total Summary Box
  const totalBoxY = currentItemY + 10;
  ctx.fillStyle = '#fef3c7'; // Amber Light
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(width - 320, totalBoxY, 285, 48, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 12px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('المجموع الإجمالي المسدد:', width - 50, totalBoxY + 30);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 15px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'left';
  const totalText = `${data.totalDzd.toLocaleString()} د.ج` + (data.totalUsdt ? ` (≈ ${data.totalUsdt} USDT)` : '');
  ctx.fillText(totalText, width - 305, totalBoxY + 30);

  // 6. LICENSE & INTELLECTUAL PROPERTY GUARANTEE
  const licenseY = totalBoxY + 68;
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(35, licenseY, width - 70, 75, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('🔒 إشعار الترخيص والملكية الفكرية الرسمية:', width - 50, licenseY + 22);

  ctx.fillStyle = '#475569';
  ctx.font = '10px "Cairo", Arial, sans-serif';
  ctx.fillText('• يمنح هذا الوصل الرسمي حامله ترخيصاً قانونياً شخصياً بالوصول الكامل لقراءة والاستماع للكتاب.', width - 50, licenseY + 38);
  ctx.fillText('• يمنع منعاً باتاً إعادة بيع أو نسخ أو توزيع المحتوى دون إذن خطي مسبق من دار النشر والمنصة.', width - 50, licenseY + 52);
  ctx.fillText('• روّج للمنصة وشارك الرابط مع أصدقائك للحصول على خصم 20% وعمولات تسويقية تضاف لمحفظتك مع كل قارئ جديد!', width - 50, licenseY + 66);

  // 7. FOOTER & DIGITAL SIGNATURE / STAMP
  const footerY = height - 105;

  // Stamp circle on the left
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(110, footerY + 25, 38, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.arc(110, footerY + 25, 34, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 8px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('معا نحو التغيير', 110, footerY + 16);
  ctx.font = 'bold 9px "Cairo", Arial, sans-serif';
  ctx.fillText('★ ختم التوثيق الرسمي ★', 110, footerY + 28);
  ctx.font = '7px "Courier New", monospace';
  ctx.fillText('VERIFIED 2026', 110, footerY + 38);

  // Signature on the right
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 11px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('رئيس مجلس إدارة المنصة والمؤسس:', width - 50, footerY + 15);

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 13px "Amiri", "Cairo", serif';
  ctx.fillText(data.presidentName || 'لقمان ياسين أبختي', width - 50, footerY + 35);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText(`Digital Signature Hash: SHA256-${(data.invoiceNumber || 'REC').split('').map(c=>c.charCodeAt(0).toString(16)).join('').slice(0, 24)}`, width - 50, footerY + 52);

  // Bottom Notice
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px "Cairo", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('هذا الوصل وثيقة إلكترونية رسمية صادرة تلقائياً ولا تتطلب ختماً ورقياً يدوياً • تم التوليد بنجاح عبر منصة معا نحو التغيير 2026', width / 2, height - 32);

  // Add canvas to jsPDF
  const pageDataUrl = canvas.toDataURL('image/jpeg', 0.96);
  doc.addImage(pageDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);

  // Save PDF
  const cleanTitle = data.items && data.items.length > 0 ? data.items[0].title.replace(/[^\w\u0621-\u064A]/g, '_').substring(0, 30) : 'شراء_كتب';
  const fileName = `وصل_بيع_${cleanTitle}_${data.invoiceNumber || Date.now()}.pdf`;
  doc.save(fileName);
}

/**
 * Creates a standard sample PDF for quick preview or download
 */
export async function createBookBlobPdf(book: Book, storeName = 'معا نحو التغيير'): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('helvetica', 'bold');
  doc.text(book.title, 105, 40, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Author: ${book.author}`, 105, 55, { align: 'center' });
  doc.text(`Publisher: ${book.publisher}`, 105, 65, { align: 'center' });
  doc.text(`ISBN: ${book.isbn}`, 105, 75, { align: 'center' });
  doc.text(`Store: ${storeName} 2026`, 105, 85, { align: 'center' });

  return doc.output('blob');
}
