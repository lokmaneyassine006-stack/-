import React, { useState } from 'react';
import { 
  X, Heart, BookOpen, Trash2, ShoppingBag, Headphones, Eye, 
  Sparkles, Check, Building2, Zap, User as UserIcon, ShieldCheck, 
  Calendar, Mail, Wallet, ArrowLeft, Search, FilterX, BookMarked,
  Save, AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book } from '../types';
import { formatPrice } from '../utils/currencies';

interface UserProfileModalProps {
  initialTab?: 'favorites' | 'profile' | 'purchases';
  onClose: () => void;
  onOpenDetails: (book: Book) => void;
  onQuickBinance: (book: Book) => void;
  onQuickBaridiMob: (book: Book) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  initialTab = 'favorites',
  onClose,
  onOpenDetails,
  onQuickBinance,
  onQuickBaridiMob,
}) => {
  const { 
    currentUser, 
    setCurrentUser,
    favoriteBooks, 
    favorites,
    removeFromFavorites, 
    clearFavorites,
    selectedCurrency, 
    customization, 
    addToCart,
    playBookTTS,
    playBookAudioTrack,
    transactions,
    books
  } = useStore();

  const [activeTab, setActiveTab] = useState<'favorites' | 'profile' | 'purchases'>(initialTab);
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [addedCartBookId, setAddedCartBookId] = useState<string | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [bio, setBio] = useState(currentUser.bio || 'قارئ شغوف وباحث عن المعرفة في منصة معا نحو التغيير.');
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '2000-01-01');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const isOwner = currentUser.role === 'owner' || currentUser.id === 'user-lokmane-owner';

  // Filtered favorite books
  const filteredFavorites = favoriteBooks.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(favoriteSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(favoriteSearch.toLowerCase()) ||
      book.category.toLowerCase().includes(favoriteSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === 'الكل' || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from favorite books
  const favoriteCategories = ['الكل', ...Array.from(new Set(favoriteBooks.map((b) => b.category)))];

  // Purchased books by the current user
  const userPurchasedBookIds = transactions
    .filter((tx) => (tx.buyerId === currentUser.id || (isOwner && tx.bookId)) && tx.status === 'completed')
    .map((tx) => tx.bookId)
    .filter(Boolean);

  const purchasedBooks = books.filter((b) => 
    userPurchasedBookIds.includes(b.id) || (isOwner && b.isOwnerBook)
  );

  const handleAddToCart = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    addToCart(bookId, 'digital');
    setAddedCartBookId(bookId);
    setTimeout(() => setAddedCartBookId(null), 1500);
  };

  const handleAudioPreview = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    if (book.audioTrack?.hasAudio) {
      playBookAudioTrack(book, 0);
    } else {
      playBookTTS(book);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      firstName,
      lastName,
      bio,
      birthDate,
    });
    setProfileSuccessMsg('تم حفظ وتحديث بيانات الملف الشخصي بنجاح!');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-gradient-to-r from-stone-50 via-teal-50/20 to-stone-50 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.firstName} 
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-rose-500 text-white shadow-xs" title="قائمتي المفضلة">
                <Heart className="w-3 h-3 fill-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                {currentUser.isVerified && (
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" title="حساب موثق رسمياً" />
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {currentUser.email} • <span className="text-teal-700 dark:text-teal-400 font-bold">{isOwner ? '👑 صاحب المنصة' : currentUser.teamTitle || 'قارئ مسجل'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-rose-500' : ''}`} />
            <span>قائمتي المفضلة</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'favorites' 
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-black' 
                : 'bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-stone-400'
            }`}>
              {favoriteBooks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'purchases'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>كتبي المقتناة</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-stone-400 font-mono">
              {purchasedBooks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>بيانات الملف الشخصي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: FAVORITES LIST */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              
              {/* Top Controls & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={favoriteSearch}
                    onChange={(e) => setFavoriteSearch(e.target.value)}
                    placeholder="ابحث داخل قائمتك المفضلة (عنوان، مؤلف، تصنيف)..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {favoriteSearch && (
                    <button
                      onClick={() => setFavoriteSearch('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                    >
                      مسح
                    </button>
                  )}
                </div>

                {favoriteBooks.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من تفريغ كافة الكتب من قائمتك المفضلة؟')) {
                        clearFavorites();
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                    title="تفريغ كافة الكتب المحفوظة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تفريغ المفضلة</span>
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              {favoriteCategories.length > 2 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-400 ml-1">تصفية حسب:</span>
                  {favoriteCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* EMPTY STATE */}
              {favoriteBooks.length === 0 ? (
                <div className="text-center py-16 px-4 bg-stone-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-stone-200 dark:border-slate-700 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center shadow-inner animate-pulse">
                    <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 dark:text-white mb-1">
                      قائمتك المفضلة فارغة حالياً
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                      يمكنك حفظ أي كتاب يعجبك للرجوع إليه لاحقاً بمجرد النقر على <strong className="text-rose-600 font-bold">أيقونة القلب ❤️</strong> الموجودة على بطاقة الكتاب أو داخل تفاصيله.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    تصفح الكتب وإضافتها للمفضلة الآن 📚
                  </button>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 dark:bg-slate-800/40 rounded-3xl border border-stone-200 dark:border-slate-700 p-6 space-y-3">
                  <FilterX className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    لا توجد كتب تطابق معايير البحث في قائمتك المفضلة
                  </p>
                  <button
                    onClick={() => { setFavoriteSearch(''); setSelectedCategory('الكل'); }}
                    className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                  >
                    إعادة ضبط البحث
                  </button>
                </div>
              ) : (
                /* FAVORITES GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredFavorites.map((book) => {
                    const priceObj = formatPrice(book.priceDzd, selectedCurrency, customization.exchangeRateUsdtToDzd);
                    const isAdded = addedCartBookId === book.id;

                    return (
                      <div
                        key={book.id}
                        className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-900 transition-all duration-200"
                      >
                        {/* Remove from favorites quick button */}
                        <button
                          onClick={() => removeFromFavorites(book.id)}
                          className="absolute top-2.5 left-2.5 z-10 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                          title="إزالة من المفضلة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex gap-3 mb-3 cursor-pointer" onClick={() => onOpenDetails(book)}>
                          {/* Book Cover */}
                          <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-900 shadow-sm border border-stone-200 dark:border-slate-700">
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {book.isOwnerBook && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500 text-white">
                                كتابي 👑
                              </span>
                            )}
                          </div>

                          {/* Book Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <span className="inline-block text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md mb-1">
                                {book.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors">
                                {book.title}
                              </h4>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                                {book.author}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="pt-1">
                              <span className="text-sm font-black text-stone-900 dark:text-white">
                                {priceObj.formatted}
                              </span>
                              <span className="text-[10px] text-amber-600 font-bold block">
                                (≈ {priceObj.approxUsdt} USDT)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="mt-auto pt-2 border-t border-stone-100 dark:border-slate-700 space-y-1.5">
                          
                          {/* Quick Pay Buttons (BaridiMob & Binance) */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => { onClose(); onQuickBaridiMob(book); }}
                              className="px-2 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="دفع فوري سريع بريدي موب"
                            >
                              <Building2 className="w-3 h-3 text-amber-300" />
                              <span>بريدي موب</span>
                            </button>

                            <button
                              onClick={() => { onClose(); onQuickBinance(book); }}
                              className="px-2 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="دفع فوري سريع بينانس"
                            >
                              <Zap className="w-3 h-3 fill-amber-200" />
                              <span>Binance</span>
                            </button>
                          </div>

                          {/* Add to Cart & Audio Details */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleAddToCart(e, book.id)}
                              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                                isAdded
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 border-stone-200 dark:border-slate-600'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>تمت الإضافة</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3 text-teal-600" />
                                  <span>أضف للسلة</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={(e) => handleAudioPreview(e, book)}
                              className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950 text-stone-600 dark:text-stone-300 hover:text-teal-600 transition-colors cursor-pointer border border-stone-200 dark:border-slate-600"
                              title="استماع صوتي"
                            >
                              <Headphones className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenDetails(book)}
                              className="p-1.5 rounded-xl bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer border border-stone-200 dark:border-slate-600"
                              title="تفاصيل وقراءة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: USER PROFILE DATA */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Account Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold block">رصيد الحساب</span>
                    <span className="text-base font-black text-teal-800 dark:text-teal-300">
                      {currentUser.walletDzd.toLocaleString('ar-DZ')} د.ج
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold block">الكتب المفضلة</span>
                    <span className="text-base font-black text-rose-700 dark:text-rose-300">
                      {favoriteBooks.length} كتب
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold block">تاريخ الانضمام</span>
                    <span className="text-xs font-black text-indigo-800 dark:text-indigo-300">
                      {currentUser.joinedDate}
                    </span>
                  </div>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Edit Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 bg-stone-50 dark:bg-slate-800/60 p-5 rounded-3xl border border-stone-200 dark:border-slate-700">
                <h3 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-teal-600" />
                  <span>تعديل المعلومات الشخصية</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">
                      الاسم الشخصي
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">
                      اللقب العائلي
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">
                    البريد الإلكتروني (غير قابل للتعديل)
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-mono text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">
                    نبذة تعريفية (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    placeholder="اكتب نبذة عن اهتماماتك القرائية والأدبية..."
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 3: PURCHASES & MY LIBRARY */}
          {activeTab === 'purchases' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-900 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white">
                    مكتبتي الرقمية والكتب المقتناة
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    كافة الكتب التي قمت بشرائها مع تراخيص القراءة والتحميل المباشر.
                  </p>
                </div>
                <span className="text-xs font-black text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-3 py-1 rounded-full">
                  {purchasedBooks.length} كتب
                </span>
              </div>

              {purchasedBooks.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 dark:bg-slate-800/40 rounded-3xl border border-stone-200 dark:border-slate-700 p-6 space-y-3">
                  <BookOpen className="w-12 h-12 text-stone-400 mx-auto" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    لم تقم باقتناء أي كتب بعد
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                    يمكنك اقتناء الكتب عبر بريدي موب أو بينانس أو إضافتها إلى قائمتك المفضلة أولاً للرجوع إليها لاحقاً.
                  </p>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-rose-100"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>الذهاب إلى قائمتي المفضلة</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {purchasedBooks.map((book) => (
                    <div 
                      key={book.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={book.coverUrl} 
                          alt="" 
                          className="w-12 h-16 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-slate-700" 
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-stone-900 dark:text-white truncate">
                            {book.title}
                          </h4>
                          <span className="text-[11px] text-stone-500 truncate block">
                            {book.author}
                          </span>
                          <span className="inline-block mt-1 text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                            مرخص ومؤكد ✓
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenDetails(book)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold shrink-0 cursor-pointer transition-colors"
                      >
                        قراءة وتحميل
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
