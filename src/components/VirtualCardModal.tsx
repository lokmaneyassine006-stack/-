import React, { useState, useRef } from 'react';
import { 
  X, CreditCard, Sparkles, Download, Palette, QrCode, 
  ShieldCheck, RefreshCw, Copy, Check, Eye
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { VirtualCardConfig } from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface VirtualCardModalProps {
  onClose: () => void;
}

const GRADIENTS = [
  { id: 'teal-dark', name: 'زمرد ملكي', class: 'from-teal-900 via-stone-900 to-slate-900' },
  { id: 'gold-lux', name: 'ذهب إمبراطوري', class: 'from-amber-700 via-yellow-600 to-stone-900' },
  { id: 'cyber-blue', name: 'أزرق تقني', class: 'from-blue-900 via-indigo-900 to-slate-950' },
  { id: 'crimson-ruby', name: 'ياقوت داكن', class: 'from-rose-900 via-stone-900 to-slate-950' },
  { id: 'carbon-black', name: 'كربون أسود مات', class: 'from-zinc-900 via-stone-900 to-black' },
];

export const VirtualCardModal: React.FC<VirtualCardModalProps> = ({ onClose }) => {
  const { virtualCardConfig, updateVirtualCardConfig, currentUser, customization } = useStore();

  const [cardHolder, setCardHolder] = useState(virtualCardConfig?.cardHolderName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'عضو معتمد');
  const [selectedGradient, setSelectedGradient] = useState(virtualCardConfig?.backgroundGradient || 'emerald-gold');
  const [showChip, setShowChip] = useState(virtualCardConfig?.showChip ?? true);
  const [showQr, setShowQr] = useState(virtualCardConfig?.showQr ?? true);
  const [tier, setTier] = useState(virtualCardConfig?.tier || 'VIP Founder');
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    updateVirtualCardConfig({
      cardHolderName: cardHolder,
      backgroundGradient: selectedGradient,
      showChip,
      showQr,
      tier,
    });
    alert('تم حفظ إعدادات البطاقة الافتراضية بنجاح!');
  };

  const handleCopyCardNumber = async () => {
    await copyToClipboard(virtualCardConfig.cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = () => {
    alert('جاري توليد وتحميل بطاقة العضوية الدولية المعتمدة بصيغة رقمية...');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                مصمم البطاقة الافتراضية العالمية
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                بطاقة دفع وعضوية حصرية معتمدة لمنصة "معا نحو التغيير"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* THE VIRTUAL CARD PREVIEW (Realistic Skeuomorphic / Modern Glass Design) */}
          <div className="perspective-1000 flex justify-center">
            <div 
              ref={cardRef}
              className={`relative w-full max-w-[420px] aspect-[1.586/1] rounded-2xl p-5 sm:p-6 text-white shadow-2xl bg-gradient-to-tr ${selectedGradient} border border-white/20 overflow-hidden flex flex-col justify-between transition-all duration-300 select-none`}
            >
              {/* Background ambient texture patterns */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Row: Brand & Tier Badge */}
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-300 block uppercase">
                    TOGETHER TOWARDS CHANGE
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white/90">
                    {customization.storeName}
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-wider text-amber-200 uppercase">
                  {tier} PASS
                </div>
              </div>

              {/* Card Middle Row: EMV Chip & Contactless */}
              <div className="relative z-10 flex items-center justify-between my-auto">
                {showChip ? (
                  <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-yellow-300 via-amber-200 to-yellow-400 border border-amber-500/50 shadow-inner flex items-center justify-center">
                    <div className="w-7 h-5 border border-amber-600/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                      <div className="border-r border-amber-600/40" />
                      <div />
                    </div>
                  </div>
                ) : <div />}

                {showQr && (
                  <div className="p-1 bg-white rounded-lg shadow-sm">
                    <QrCode className="w-8 h-8 text-stone-900" />
                  </div>
                )}
              </div>

              {/* Card Bottom Row: Number, Holder & Expiry */}
              <div className="relative z-10 space-y-2">
                <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-white/95 drop-shadow-sm flex items-center justify-between">
                  <span>{virtualCardConfig.cardNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyCardNumber}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="نسخ رقم البطاقة"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-end justify-between text-xs pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[9px] text-white/60 uppercase block">حامل البطاقة</span>
                    <span className="font-bold text-white/90 tracking-wide">{cardHolder}</span>
                  </div>

                  <div className="text-left">
                    <span className="text-[9px] text-white/60 uppercase block">صالحة حتى</span>
                    <span className="font-mono font-bold text-white/90">{virtualCardConfig.expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Form */}
          <div className="space-y-4 bg-stone-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-slate-700">
            
            {/* Color Themes */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                اختر مظهر وتدرج البطاقة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGradient(g.class)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedGradient === g.class
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${g.class}`} />
                    <span>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Card Holder & Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  الاسم المطبوع على البطاقة
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  مستوى العضوية (Tier)
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white font-bold"
                >
                  <option value="VIP Founder">VIP Founder (مؤسس ومؤلف)</option>
                  <option value="Platinum Global">Platinum Global (بلاتينيوم عالمي)</option>
                  <option value="Gold Reader">Gold Reader (قارئ ذهبي)</option>
                  <option value="Executive">Executive (تنفيذي)</option>
                </select>
              </div>
            </div>

            {/* Toggles: Chip & QR */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showChip}
                  onChange={(e) => setShowChip(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>إظهار الشريحة الإلكترونية (EMV Chip)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>إظهار رمز الاستجابة السريعة (QR Code)</span>
              </label>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل البطاقة بصيغة PNG عالية الدقة</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              حفظ التعديلات
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
