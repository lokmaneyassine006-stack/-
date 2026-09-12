import React, { useState } from 'react';
import { 
  BookOpen, ShoppingBag, PlusCircle, MessageSquare, CreditCard, 
  Users, Crown, Shield, Globe, Sun, Moon, Sparkles, LogIn, LogOut, 
  ChevronDown, Settings, DollarSign, Award, CheckCircle2, ShieldCheck,
  Gift
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import { LANGUAGES } from '../utils/translations';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    switchUserRole, 
    cart, 
    customization, 
    selectedLanguage, 
    setLanguage, 
    selectedCurrency, 
    setSelectedCurrency, 
    themeMode, 
    setThemeMode, 
    setActiveModal,
    security
  } = useStore();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCurrDropdownOpen, setIsCurrDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isOwner = currentUser.role === 'owner';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 dark:text-white backdrop-blur-md border-b border-stone-200/90 dark:border-slate-800 transition-colors shadow-xs">
      {/* Top Banner Notice if enabled */}
      {customization.showBanner && customization.bannerNotice && (
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span className="truncate">{customization.bannerNotice}</span>
          <button 
            onClick={() => setActiveModal('gift_card')}
            className="underline hover:text-amber-200 font-black ml-2 shrink-0 cursor-pointer bg-white/15 px-2.5 py-0.5 rounded-full"
          >
            تفعيل الهدية 🎁
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setActiveModal(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3 group cursor-pointer text-right"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-800 via-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-stone-900 dark:text-white">
                    {customization.storeName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-700/50">
                    2026
                  </span>
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium hidden sm:block">
                  {customization.storeSubtitle}
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-bold text-stone-700 dark:text-stone-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              متجر الكتب
            </button>
            <button 
              onClick={() => setActiveModal('publish')}
              className="px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>نشر كتاب</span>
            </button>
            <button 
              onClick={() => setActiveModal('forum')}
              className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>المنتدى</span>
            </button>
            <button 
              onClick={() => setActiveModal('virtual_card')}
              className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>البطاقة</span>
            </button>
            <button 
              onClick={() => setActiveModal('team_hr')}
              className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>الفريق</span>
            </button>
            <button 
              onClick={() => setActiveModal('promo')}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/20 shadow-2xs"
              title="أداة ترويج المنصة والمكافآت التشاركية"
            >
              <Gift className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>ترويج المنصة 🎁</span>
            </button>
            {isOwner && (
              <button 
                onClick={() => setActiveModal('wallet')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25 font-black flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/40 shadow-xs"
                title="محفظة وخزينة المالك"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>محفظة المالك</span>
              </button>
            )}
            {isOwner && (
              <button 
                onClick={() => setActiveModal('president_office')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25 font-black flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/40 shadow-xs"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>مكتب الرئيس</span>
              </button>
            )}
            {isOwner && (
              <button 
                onClick={() => setActiveModal('admin_dashboard')}
                className="px-3 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Settings className="w-4 h-4" />
                <span>لوحة التحكم</span>
              </button>
            )}
          </nav>

          {/* Right Action Tools: Language, Currency, Theme, Cart, Auth User Chip */}
          <div className="flex items-center gap-2">
            
            {/* Currency Selector */}
            <div className="relative">
              <button 
                onClick={() => { setIsCurrDropdownOpen(!isCurrDropdownOpen); setIsLangDropdownOpen(false); setIsThemeDropdownOpen(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="تغيير العملة"
              >
                <span>{SUPPORTED_CURRENCIES[selectedCurrency]?.flag || '🪙'}</span>
                <span>{selectedCurrency}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isCurrDropdownOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-stone-200 dark:border-slate-700 py-1.5 z-50 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 border-b border-stone-100 dark:border-slate-700">
                    اختر عملة العرض
                  </div>
                  {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => { setSelectedCurrency(curr.code); setIsCurrDropdownOpen(false); }}
                      className={`w-full text-right px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer ${
                        selectedCurrency === curr.code ? 'font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40' : 'text-stone-700 dark:text-stone-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{curr.flag}</span>
                        <span>{curr.code} ({curr.symbol})</span>
                      </span>
                      <span className="text-[10px] text-stone-400">{curr.nameAr}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector (15+ Languages) */}
            <div className="relative">
              <button 
                onClick={() => { setIsLangDropdownOpen(!isLangDropdownOpen); setIsCurrDropdownOpen(false); setIsThemeDropdownOpen(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="تغيير اللغة"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{selectedLanguage.flag}</span>
                <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-stone-200 dark:border-slate-700 py-1.5 z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 border-b border-stone-100 dark:border-slate-700">
                    اللغات المدعومة (15+ لغة)
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangDropdownOpen(false); }}
                      className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer ${
                        selectedLanguage.code === lang.code ? 'font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40' : 'text-stone-700 dark:text-stone-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase">{lang.code} ({lang.dir})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selector (4 modes: Light, Dark, Sepia Night, Auto) */}
            <div className="relative">
              <button 
                onClick={() => { setIsThemeDropdownOpen(!isThemeDropdownOpen); setIsLangDropdownOpen(false); setIsCurrDropdownOpen(false); }}
                className="p-2 rounded-lg border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="تخصيص المظهر ووضع القراءة"
              >
                {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                {themeMode === 'sepia' && <Sparkles className="w-4 h-4 text-amber-700" />}
                {themeMode === 'auto' && <Settings className="w-4 h-4 text-teal-600" />}
              </button>

              {isThemeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-stone-200 dark:border-slate-700 py-1.5 z-50">
                  <button 
                    onClick={() => { setThemeMode('light'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer ${themeMode === 'light' ? 'font-bold text-teal-600' : ''}`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>وضع عادي (فاتح)</span>
                  </button>
                  <button 
                    onClick={() => { setThemeMode('dark'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer ${themeMode === 'dark' ? 'font-bold text-teal-600' : ''}`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>وضع داكن (ليلي)</span>
                  </button>
                  <button 
                    onClick={() => { setThemeMode('sepia'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer ${themeMode === 'sepia' ? 'font-bold text-teal-600' : ''}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>قراءة ليلية (ألوان دافئة)</span>
                  </button>
                  <button 
                    onClick={() => { setThemeMode('auto'); setIsThemeDropdownOpen(false); }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer ${themeMode === 'auto' ? 'font-bold text-teal-600' : ''}`}
                  >
                    <Settings className="w-3.5 h-3.5 text-teal-600" />
                    <span>تلقائي (حسب النظام)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button 
              id="cart-trigger-button"
              onClick={() => setActiveModal('cart')}
              className="relative p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors cursor-pointer border border-teal-200 dark:border-teal-800"
              title="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth User Chip (auth-user-chip as requested) */}
            <div className="relative">
              <button 
                id="auth-user-chip"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isOwner 
                    ? 'border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'border-stone-200 dark:border-slate-700 bg-stone-100/80 dark:bg-slate-800 hover:bg-stone-200/80 text-stone-800 dark:text-stone-200'
                }`}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.firstName} 
                  className="w-7 h-7 rounded-full object-cover border border-white dark:border-slate-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col text-right pr-0.5 hidden sm:flex">
                  <div className="flex items-center gap-1 leading-tight">
                    <span className="text-xs font-bold truncate max-w-[120px]">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    {currentUser.isVerified && <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 truncate max-w-[120px]">
                    {isOwner ? '👑 صاحب المنصة' : currentUser.role === 'team_member' ? '⭐ عضو فريق' : '👤 قارئ ومؤلف'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* User Chip Menu */}
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-slate-700">
                    <img 
                      src={currentUser.avatar} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-teal-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-bold text-sm text-stone-900 dark:text-white">
                        <span>{currentUser.firstName} {currentUser.lastName}</span>
                        {currentUser.isVerified && <ShieldCheck className="w-4 h-4 text-teal-600" />}
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[160px]">
                        {currentUser.email}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 w-fit">
                        {currentUser.teamTitle || (isOwner ? 'صاحب المنصة والمؤسس' : 'مستخدم عام')}
                      </span>
                    </div>
                  </div>

                  {/* Wallet Peek - Only Visible to Owner */}
                  {isOwner && (
                    <div className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[11px] text-amber-900 dark:text-amber-300 font-bold block">
                            محفظة وخزينة المالك
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {currentUser.walletDzd.toLocaleString('ar-DZ')} د.ج
                        </span>
                      </div>
                      <button 
                        onClick={() => { setActiveModal('wallet'); setIsUserMenuOpen(false); }}
                        className="px-3 py-1.5 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg cursor-pointer shadow-xs"
                      >
                        إدارة المحفظة
                      </button>
                    </div>
                  )}

                  {/* Quick Promotion Tool Trigger */}
                  <div className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                          أداة ترويج المنصة والمكافآت
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          عمولة 10% + خصم 20% لأصدقائك
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveModal('promo'); setIsUserMenuOpen(false); }}
                      className="px-2.5 py-1 text-[11px] font-black bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg cursor-pointer shadow-xs"
                    >
                      فتح الأداة 🎁
                    </button>
                  </div>

                  {/* Switch Session Quick Actions (Owner vs Member vs User) */}
                  <div className="space-y-1 py-1 border-t border-stone-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-stone-400 block px-2 py-1">
                      تبديل الجلسة التجريبية (صلاحيات المنصة):
                    </span>
                    <button 
                      onClick={() => { switchUserRole('owner'); setIsUserMenuOpen(false); }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        currentUser.id === 'user-lokmane-owner' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold' : 'hover:bg-stone-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>جلسة المالك: لقمان ياسين أبختي</span>
                      </span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 rounded">كامل الصلاحيات</span>
                    </button>
                    <button 
                      onClick={() => { switchUserRole('saad_bouacha'); setIsUserMenuOpen(false); }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        currentUser.id === 'user-saad-bouacha' || (currentUser.firstName?.includes('سعد') && currentUser.lastName?.includes('بوعشة')) ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold' : 'hover:bg-stone-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>جلسة سعد بوعشة (VIP & مالك)</span>
                      </span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 rounded font-mono font-bold">OWNER-INF</span>
                    </button>
                    <button 
                      onClick={() => { switchUserRole('team_member'); setIsUserMenuOpen(false); }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        currentUser.role === 'team_member' ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 font-bold' : 'hover:bg-stone-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span>جلسة عضو فريق المنصة</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => { switchUserRole('regular_user'); setIsUserMenuOpen(false); }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        currentUser.role === 'regular_user' ? 'bg-stone-200 dark:bg-slate-700 text-stone-800 font-bold' : 'hover:bg-stone-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>👤</span>
                        <span>جلسة عامة للمستخدمين / القراء</span>
                      </span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 dark:border-slate-700 flex items-center justify-between">
                    <button 
                      onClick={() => { setActiveModal('auth'); setIsUserMenuOpen(false); }}
                      className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>تسجيل دخول بحساب آخر</span>
                    </button>
                    <button 
                      onClick={() => { setActiveModal('cybersecurity'); setIsUserMenuOpen(false); }}
                      className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 cursor-pointer"
                      title="مركز الأمان السيبراني"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>الأمان</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
