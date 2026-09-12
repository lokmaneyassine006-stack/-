import React from 'react';
import { 
  BookOpen, ShieldCheck, Zap, Building2, CreditCard, 
  Heart, Sparkles, Globe, Headphones, Mail, Phone, Crown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { customization, setActiveModal, books, currentUser } = useStore();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800/80 pt-14 pb-28 md:pb-14 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center font-black shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base">{customization.storeName}</span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              منصة رائدة لنشر وتوزيع الكتب الرقمية والصوتية، دعم المؤلفين العرب، والدفع الفوري الآمن بالدينار الجزائري والعملات الرقمية USDT.
            </p>
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <Crown className="w-3.5 h-3.5" />
                <span>رئيس ومؤسس المنصة:</span>
              </div>
              <span className="text-white font-black text-sm">{customization.presidentName}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-xs mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>أقسام المنصة السريعة</span>
            </h4>
            <ul className="space-y-2.5 text-stone-400 text-xs">
              <li>
                <button onClick={() => setActiveModal('publish')} className="hover:text-teal-400 transition-colors cursor-pointer text-right">
                  نشر وبيع كتاب جديد
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('forum')} className="hover:text-teal-400 transition-colors cursor-pointer text-right">
                  منتدى المناقشات الفكرية
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('virtual_card')} className="hover:text-teal-400 transition-colors cursor-pointer text-right">
                  مصمم البطاقة الافتراضية
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('team_hr')} className="hover:text-teal-400 transition-colors cursor-pointer text-right">
                  فريق المنصة والتوظيف
                </button>
              </li>
              {currentUser.role === 'owner' && (
                <li>
                  <button onClick={() => setActiveModal('wallet')} className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-right">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>محفظة وخزينة المالك</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Payment Badges */}
          <div className="space-y-3.5">
            <h4 className="font-black text-white text-xs mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>طرق الدفع والتسوية الفورية</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold text-amber-400 flex items-center gap-1.5 shadow-xs">
                <Zap className="w-3.5 h-3.5" /> Binance Pay (USDT)
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold text-teal-400 flex items-center gap-1.5 shadow-xs">
                <Building2 className="w-3.5 h-3.5" /> BaridiMob RIP
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold text-indigo-400 flex items-center gap-1.5 shadow-xs">
                <CreditCard className="w-3.5 h-3.5" /> CIB / CCP
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> تحويل بنكي معتمد
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              معاملات مالية فورية وموثقة بنسبة 100% مع توليد فواتير رسمية للتحميل.
            </p>
          </div>

          {/* Intellectual Property & Protection */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-xs mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>الملكية الفكرية والتوثيق</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              جميع الكتب والمصنفات المعروضة في المنصة محمية بموجب قوانين حماية الملكية الفكرية وحقوق المؤلف الدولية (WIPO / ONDA).
            </p>
            <div className="pt-2 text-[11px] text-stone-400 font-mono">
              سنة التأسيس والاعتماد: 2026
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <span>
            جميع الحقوق محفوظة © 2026 لمكتبة ومنصة <strong className="text-stone-200 font-bold">{customization.storeName}</strong>.
          </span>
          {currentUser.role === 'owner' && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveModal('president_office')} 
                className="text-amber-400 hover:underline cursor-pointer font-bold flex items-center gap-1"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>مكتب الرئيس</span>
              </button>
              <span>•</span>
              <button 
                onClick={() => setActiveModal('admin_dashboard')} 
                className="text-teal-400 hover:underline cursor-pointer font-bold"
              >
                لوحة الإدارة
              </button>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
};
