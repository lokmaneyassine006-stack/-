import React, { useState, useEffect, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { StoreHero } from './components/StoreHero';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { BinanceQuickPayModal } from './components/BinanceQuickPayModal';
import { BaridiMobQuickPayModal } from './components/BaridiMobQuickPayModal';
import { PublishBookModal } from './components/PublishBookModal';
import { VirtualCardModal } from './components/VirtualCardModal';
import { HRTeamModal } from './components/HRTeamModal';
import { ForumModal } from './components/ForumModal';
import { WalletModal } from './components/WalletModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { PurchasePromotionTool } from './components/PurchasePromotionTool';
import { LivePromotionBroadcast } from './components/LivePromotionBroadcast';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { BaridimobSmsModal } from './components/BaridimobSmsModal';
import { Footer } from './components/Footer';
import { Book } from './types';
import { BookOpen, Sparkles, FilterX } from 'lucide-react';

const MainStoreContent: React.FC = () => {
  const { 
    books, 
    activeModal, 
    setActiveModal, 
    isCartOpen, 
    setIsCartOpen,
    currentUser
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('جميع التصنيفات');
  const [onlyMyBooks, setOnlyMyBooks] = useState(false);

  // Selected book for details modal
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);

  // Selected book for direct Binance Pay modal
  const [selectedBookForBinance, setSelectedBookForBinance] = useState<Book | null>(null);

  // Selected book for direct BaridiMob Pay modal
  const [selectedBookForBaridiMob, setSelectedBookForBaridiMob] = useState<Book | null>(null);

  // Loading state to ensure localStorage and DOM hydration are smooth without white flashes
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Smooth transition from preloader to active UI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  // Filtered books list
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Category filter
      if (selectedCategory !== 'جميع التصنيفات' && book.category !== selectedCategory) {
        return false;
      }

      // "كتابي" (My Books) filter
      if (onlyMyBooks) {
        const isMine = book.isOwnerBook || book.isCustom || book.authorId === currentUser.id;
        if (!isMine) return false;
      }

      // Search Query filter across title, author, publisher, ISBN, description, category
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = book.title.toLowerCase().includes(query);
        const matchAuthor = book.author.toLowerCase().includes(query);
        const matchPublisher = book.publisher.toLowerCase().includes(query);
        const matchIsbn = book.isbn.toLowerCase().includes(query);
        const matchDesc = book.description.toLowerCase().includes(query);
        const matchCategory = book.category.toLowerCase().includes(query);

        if (!matchTitle && !matchAuthor && !matchPublisher && !matchIsbn && !matchDesc && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [books, selectedCategory, onlyMyBooks, searchQuery, currentUser.id]);

  const handleOpenQuickBinance = (book: Book) => {
    setSelectedBookForBinance(book);
  };

  const handleOpenQuickBaridiMob = (book: Book) => {
    setSelectedBookForBaridiMob(book);
  };

  const handleCartBinanceCheckout = () => {
    setIsCartOpen(false);
    setSelectedBookForBinance(null);
    setActiveModal('binance_pay');
  };

  const handleCartBaridimobCheckout = () => {
    setIsCartOpen(false);
    setSelectedBookForBaridiMob(null);
    setActiveModal('baridimob_pay');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fbfbf8] dark:bg-[#0b0f19] text-[#134e4a] dark:text-teal-400 font-sans select-none" dir="rtl">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-900/20 text-white animate-pulse">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="text-lg font-black text-stone-800 dark:text-stone-100">
            مكتبة معاً نحو التغيير
          </div>
          <div className="w-36 h-1 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-teal-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-stone-50/70 dark:bg-[#0b0f19] text-stone-900 dark:text-stone-100 transition-colors duration-200 selection:bg-teal-700 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Showcase, Search & Category Filter Bar */}
      <StoreHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onlyMyBooks={onlyMyBooks}
        setOnlyMyBooks={setOnlyMyBooks}
      />

      {/* Main Books Grid Container - Seamless Continuous Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Header with Refined Balance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-800 to-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-teal-800/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                {selectedCategory === 'جميع التصنيفات' ? 'أحدث إصدارات وكتب المتجر' : selectedCategory}
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                عرض {filteredBooks.length} من أصل {books.length} كتاب رقمي وصوتي متوفر
              </span>
            </div>
          </div>

          {onlyMyBooks && (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm flex items-center gap-1.5 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 fill-amber-200" />
              <span>شارة كتب المالك مفعلة 👑</span>
            </span>
          )}
        </div>

        {/* Books Cards Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-slate-800 p-8 space-y-4 shadow-sm">
            <FilterX className="w-14 h-14 text-stone-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-black text-lg text-stone-800 dark:text-stone-200">لم يتم العثور على أي كتب تطابق البحث</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              جرّب تعديل كلمات البحث أو اختيار تصنيف مختلف من القائمة العلوية لاستكشاف مكتبة الكتب الشاملة.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('جميع التصنيفات'); setOnlyMyBooks(false); }}
              className="px-5 py-2.5 rounded-2xl bg-teal-700 text-white text-xs font-black shadow-md hover:bg-teal-800 transition-all cursor-pointer"
            >
              إعادة ضبط الفلاتر والبحث
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpenDetails={(b) => setSelectedBookForDetails(b)}
                onQuickBinance={handleOpenQuickBinance}
                onQuickBaridiMob={handleOpenQuickBaridiMob}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Sticky Bottom Audio Player Bar */}
      <AudioPlayerBar />

      {/* MODALS */}

      {/* 1. Book Details Modal */}
      {selectedBookForDetails && (
        <BookDetailModal
          book={selectedBookForDetails}
          onClose={() => setSelectedBookForDetails(null)}
          onQuickBinance={(b) => { setSelectedBookForDetails(null); handleOpenQuickBinance(b); }}
          onQuickBaridiMob={(b) => { setSelectedBookForDetails(null); handleOpenQuickBaridiMob(b); }}
        />
      )}

      {/* 2. Direct Binance Quick Pay Modal */}
      {(selectedBookForBinance || activeModal === 'binance_pay') && (
        <BinanceQuickPayModal
          book={selectedBookForBinance}
          onClose={() => { setSelectedBookForBinance(null); if (activeModal === 'binance_pay') setActiveModal(null); }}
        />
      )}

      {/* 2.5 Direct BaridiMob Quick Pay Modal */}
      {(selectedBookForBaridiMob || activeModal === 'baridimob_pay') && (
        <BaridiMobQuickPayModal
          book={selectedBookForBaridiMob}
          onClose={() => { setSelectedBookForBaridiMob(null); if (activeModal === 'baridimob_pay') setActiveModal(null); }}
        />
      )}

      {/* 3. Publish Book Modal */}
      {activeModal === 'publish' && (
        <PublishBookModal onClose={() => setActiveModal(null)} />
      )}

      {/* 4. Virtual Card Designer Modal */}
      {activeModal === 'virtual_card' && (
        <VirtualCardModal onClose={() => setActiveModal(null)} />
      )}

      {/* 5. HR Team & Careers Modal */}
      {(activeModal === 'hr_team' || activeModal === 'team_hr') && (
        <HRTeamModal onClose={() => setActiveModal(null)} />
      )}

      {/* 6. Community Forum Modal */}
      {activeModal === 'forum' && (
        <ForumModal onClose={() => setActiveModal(null)} />
      )}

      {/* 7. Wallet & Earnings Modal (Owner Only) */}
      {activeModal === 'wallet' && currentUser.role === 'owner' && (
        <WalletModal onClose={() => setActiveModal(null)} />
      )}

      {/* 8. Owner Admin Dashboard / President Office Modal */}
      {(activeModal === 'admin' || activeModal === 'admin_dashboard' || activeModal === 'president_office') && (
        <AdminDashboardModal onClose={() => setActiveModal(null)} />
      )}

      {/* 9. Authentication & User Profile Modal */}
      {activeModal === 'auth' && (
        <AuthModal onClose={() => setActiveModal(null)} />
      )}

      {/* 9.5 Post-Purchase & Platform Promotion Modal */}
      {(activeModal === 'promo' || activeModal === 'promote' || activeModal === 'referral') && (
        <PurchasePromotionTool onClose={() => setActiveModal(null)} />
      )}

      {/* 10. Shopping Cart Side Drawer */}
      {isCartOpen && (
        <CartDrawer
          onClose={() => setIsCartOpen(false)}
          onOpenBinancePay={handleCartBinanceCheckout}
          onOpenBaridimobPay={handleCartBaridimobCheckout}
        />
      )}

      {/* 11. Live Automated Site Promotion Broadcast / Social Proof */}
      <LivePromotionBroadcast />

      {/* 12. BaridiMob Official SMS Notification Service Modal */}
      <BaridimobSmsModal />

    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainStoreContent />
    </StoreProvider>
  );
}

export default App;
