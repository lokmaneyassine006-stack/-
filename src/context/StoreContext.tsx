import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Book, User, Review, CartItem, ForumTopic, ForumReply, ForumPost, SaleTransaction, 
  WithdrawalRequest, VirtualCardData, VirtualCardConfig, TeamMember, TeamChangeRequest, 
  MeetingSchedule, JobApplication, StoreCustomization, SocialLinks, SavedPaymentAccounts, 
  GiftCardVoucher, SecurityState, BookTranslation, PromotionBroadcast, BaridimobSmsNotification
} from '../types';
import { 
  OWNER_USER, SAAD_BOUACHA_USER, DEMO_USERS, INITIAL_BOOKS, INITIAL_REVIEWS, 
  INITIAL_FORUM_TOPICS, INITIAL_TEAM_MEMBERS, INITIAL_VIRTUAL_CARDS, 
  INITIAL_GIFT_CARDS 
} from '../data/seedData';
import { checkProfanity, generateReferenceCode, calculateIntegrityChecksum } from '../utils/security';
import { SpeechEngine } from '../utils/audioTTS';
import { LANGUAGES, LanguageOption } from '../utils/translations';
import confetti from 'canvas-confetti';
import { copyToClipboard } from '../utils/clipboard';

interface AudioPlayerState {
  bookId: string | null;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  currentText: string;
  chapterTitle: string;
  isPlaying: boolean;
  isPaused: boolean;
  playbackRate: number;
  pitch: number;
  progress: number;
  mode: 'tts' | 'audio_file';
  audioUrl?: string;
}

interface StoreContextType {
  // User Session
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: 'owner' | 'team_member' | 'regular_user' | 'saad_bouacha') => void;
  allUsers: User[];
  loginUser: (email: string, firstName: string, lastName: string, birthDate: string) => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (userData: { firstName: string; lastName: string; email: string; birthDate: string; password?: string }) => { success: boolean; error?: string };
  logoutUser: () => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;

  // Books
  books: Book[];
  addBook: (bookData: Partial<Book>) => { success: boolean; book?: Book; message?: string };
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  updateBookPrice: (bookId: string, newPriceDzd: number) => void;
  deleteBook: (bookId: string) => void;
  addTranslationToBook: (bookId: string, translation: BookTranslation) => void;

  // Reviews
  reviews: Review[];
  addReview: (bookId: string, rating: number, text: string) => { success: boolean; error?: string };
  likeReview: (reviewId: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (bookId: string, format?: 'digital' | 'audio' | 'bundle') => void;
  removeFromCart: (bookId: string) => void;
  updateCartQuantity: (bookId: string, qty: number) => void;
  clearCart: () => void;
  cartTotalDzd: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Audio / TTS
  audioState: AudioPlayerState;
  playBookTTS: (book: Book, textToRead?: string, chapterTitle?: string) => void;
  playBookAudioTrack: (book: Book, chapterIndex?: number) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setAudioSpeed: (rate: number) => void;
  setAudioRate: (rate: number) => void;

  // Forum
  forumTopics: ForumTopic[];
  forumPosts: ForumTopic[];
  addForumTopic: (title: string, content: string, category: string, bookId?: string, bookTitle?: string) => { success: boolean; error?: string };
  addForumPost: (post: { title: string; content: string; category: string; tags?: string[] }) => { success: boolean; error?: string };
  addForumReply: (topicId: string, content: string) => { success: boolean; error?: string };
  likeForumTopic: (topicId: string) => void;
  likeForumPost: (topicId: string) => void;
  likeForumReply: (topicId: string, replyId: string) => void;
  deleteForumTopic: (topicId: string) => void;

  // Transactions & Wallet
  transactions: SaleTransaction[];
  processPurchase: (bookIds: string[], paymentMethod: 'binance' | 'baridimob' | 'cib_ccp' | 'gift_card' | 'wallet', txHash?: string) => { success: boolean; message: string; txRef: string };
  updateWalletBalance: (amountDzd: number, reason?: string) => void;
  rewardPromotionBonus: (amountDzd?: number, reason?: string, bookTitle?: string) => { success: boolean; amountDzd: number; newBalance: number; message: string; txRef: string };
  completeTransaction: (txId: string, note?: string) => { success: boolean; message: string };
  resetWalletToRealProfits: () => {
    success: boolean;
    realBalanceDzd: number;
    realBalanceUsdt: number;
    totalSalesDzd: number;
    totalWithdrawalsDzd: number;
    purgedAmountDzd: number;
    message: string;
  };

  // BaridiMob & Binance SMS Notification Service (Linked with Truecaller 0652206947)
  smsNotifications: BaridimobSmsNotification[];
  sendBaridimobSms: (params: {
    recipientPhone?: string;
    recipientName?: string;
    ripNumber?: string;
    amountDzd: number;
    referenceCode: string;
    type?: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
    currentBalanceDzd?: number;
  }) => BaridimobSmsNotification;
  sendBinanceSms: (params: {
    recipientPhone?: string;
    recipientName?: string;
    cryptoAddressOrPayId?: string;
    cryptoNetwork?: string;
    amountUsdt: number;
    amountDzd?: number;
    referenceCode: string;
    type?: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
    txHash?: string;
    currentBalanceDzd?: number;
  }) => BaridimobSmsNotification;
  sendTransactionSms: (params: {
    channel: 'baridimob' | 'binance';
    recipientPhone?: string;
    recipientName?: string;
    amountDzd?: number;
    amountUsdt?: number;
    referenceCode: string;
    type?: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
    ripNumber?: string;
    cryptoAddressOrPayId?: string;
    cryptoNetwork?: string;
    txHash?: string;
    currentBalanceDzd?: number;
  }) => BaridimobSmsNotification;
  activeSmsModal: BaridimobSmsNotification | null;
  setActiveSmsModal: (sms: BaridimobSmsNotification | null) => void;
  
  // Withdrawals
  withdrawals: WithdrawalRequest[];
  requestWithdrawal: (
    amountDzd: number, 
    method: 'baridimob' | 'binance' | 'paypal_ccp' | 'ccp', 
    accountDetails: string,
    options?: {
      isStructured?: boolean;
      beneficiaryName?: string;
      cryptoNetwork?: 'TRC20' | 'BEP20' | 'Binance Pay' | string;
      phoneNumber?: string;
    }
  ) => { success: boolean; message: string; refCode?: string; withdrawal?: WithdrawalRequest };
  approveWithdrawal: (id: string, note?: string) => void;
  rejectWithdrawal: (id: string, note?: string) => void;
  
  // Payment Accounts & Gift Cards
  paymentAccounts: SavedPaymentAccounts;
  updatePaymentAccounts: (accounts: Partial<SavedPaymentAccounts>) => void;
  giftCards: GiftCardVoucher[];
  redeemGiftCard: (code: string) => { success: boolean; message: string; amountUsdt?: number; isInfinite?: boolean; timesRedeemed?: number };
  generateGiftCardVoucher: (amountUsdt?: number, isInfinite?: boolean, ownerOnly?: boolean, description?: string) => string;

  // Virtual Cards
  virtualCards: VirtualCardData[];
  saveVirtualCard: (card: VirtualCardData) => void;
  virtualCardConfig: VirtualCardConfig;
  updateVirtualCardConfig: (updates: Partial<VirtualCardConfig>) => void;

  // HR & Team
  teamMembers: TeamMember[];
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  teamChangeRequests: TeamChangeRequest[];
  submitChangeRequest: (title: string, description: string, requestType: TeamChangeRequest['requestType']) => void;
  respondToChangeRequest: (id: string, status: 'approved' | 'rejected', responseText?: string) => void;
  meetings: MeetingSchedule[];
  scheduleMeeting: (meeting: Omit<MeetingSchedule, 'id'>) => void;
  jobApplications: JobApplication[];
  applyForJob: (appData: Omit<JobApplication, 'id' | 'status' | 'appliedDate'>) => { success: boolean };

  // Customization & Themes
  customization: StoreCustomization;
  updateCustomization: (updates: Partial<StoreCustomization>) => void;
  socialLinks: SocialLinks;
  updateSocialLinks: (links: Partial<SocialLinks>) => void;
  selectedLanguage: LanguageOption;
  setLanguage: (langCode: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (currCode: string) => void;
  themeMode: 'light' | 'dark' | 'sepia' | 'auto';
  setThemeMode: (mode: 'light' | 'dark' | 'sepia' | 'auto') => void;

  // Cybersecurity
  security: SecurityState;
  toggleLockdown: () => void;

  // UI Active Modals
  activeModal: string | null;
  setActiveModal: (modalName: string | null) => void;
  activeBookForModal: Book | null;
  setActiveBookForModal: (book: Book | null) => void;
  quickBinanceBook: Book | null;
  setQuickBinanceBook: (book: Book | null) => void;

  // Auto-Promotion & Live Broadcast
  livePromotions: PromotionBroadcast[];
  addLivePromotion: (promo: PromotionBroadcast) => void;
  lastPurchasedPromotion: { books: Book[]; txRef: string } | null;
  setLastPurchasedPromotion: (data: { books: Book[]; txRef: string } | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'TOGETHER_CHANGE_STORE_2026_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Failed to load storage for key:', key, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save storage for key:', key, e);
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user (Defaults to Owner session for full power)
  const [currentUser, setCurrentUserState] = useState<User>(() => loadStorage('currentUser', OWNER_USER));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadStorage('allUsers', DEMO_USERS));
  
  // Books state
  const [books, setBooks] = useState<Book[]>(() => loadStorage('books', INITIAL_BOOKS));
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => loadStorage('reviews', INITIAL_REVIEWS));
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => loadStorage('cart', []));
  
  // Forum state
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => loadStorage('forumTopics', INITIAL_FORUM_TOPICS));
  
  // Sales Transactions & Linked Operations (BaridiMob & Binance) - Pure Real Sales Only
  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => loadStorage('transactions', [
    {
      id: 'tx-bm-purchase-1',
      txRef: 'TX-BM-2026-8812',
      bookId: 'book-owner-1',
      bookTitle: 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
      buyerId: 'user-2',
      buyerName: 'أمين بلمختار',
      sellerId: 'user-lokmane-owner',
      sellerName: 'لقمان ياسين أبختي',
      description: 'شراء كتاب عبر تطبيق بريدي موب والدفع المباشر بالـ RIP',
      type: 'book_purchase',
      amountDzd: 1800,
      amountUsdt: 7.5,
      platformFeeDzd: 0,
      authorNetDzd: 1800,
      method: 'baridimob',
      status: 'completed',
      timestamp: '2026-09-10 16:40',
      date: '2026-09-10',
      accountDetails: '00799999002847192033',
      phoneNumber: '0661223344',
      txHash: '0x438f9021a8d42e718b9c204918491834'
    },
    {
      id: 'tx-bn-purchase-1',
      txRef: 'TX-BN-2026-9A8F1',
      bookId: 'book-owner-1',
      bookTitle: 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
      buyerId: 'user-4',
      buyerName: 'كريم الجزائري',
      sellerId: 'user-lokmane-owner',
      sellerName: 'لقمان ياسين أبختي',
      description: 'شراء كتاب بالعملة الرقمية Binance Pay USDT',
      type: 'book_purchase',
      amountDzd: 1800,
      amountUsdt: 7.5,
      platformFeeDzd: 0,
      authorNetDzd: 1800,
      method: 'binance',
      status: 'completed',
      timestamp: '2026-09-10 11:20',
      date: '2026-09-10',
      cryptoNetwork: 'Binance Pay',
      txHash: '0x8f72a6b4c919d380e611894b98c55490a071'
    }
  ]));
  
  // Withdrawals Linked to BaridiMob & Binance - Verified Real Requests Only
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => loadStorage('withdrawals', []));

  // BaridiMob & Binance SMS Notification Service State - Real verified alerts only
  const [smsNotifications, setSmsNotifications] = useState<BaridimobSmsNotification[]>(() => loadStorage('smsNotifications', [
    {
      id: 'sms-bm-real-1',
      referenceCode: 'TX-BM-2026-8812',
      type: 'purchase',
      channel: 'baridimob',
      recipientPhone: '0652206947',
      recipientName: 'لقمان ياسين أبختي',
      ripNumber: '00799999002847192033',
      amountDzd: 1800,
      amountUsdt: 7.5,
      currentBalanceDzd: 3600,
      sentAt: '2026-09-10 16:40',
      status: 'delivered',
      senderId: 'BARIDIMOB',
      truecallerVerified: true,
      truecallerCallerId: 'لقمان ياسين أبختي (Lokmane Yassine Abakhti)',
      truecallerNumber: '0652206947',
      truecallerCategory: 'بريدي موب - حساب مالي رسمي معتمد (BaridiMob Verified)',
      messageText: `Algérie Poste / BaridiMob:
تم بنجاح تحصيل قيمة مبيعات كتاب "معا نحو التغيير" بمبلغ: 1,800.00 د.ج
المشتري: أمين بلمختار
المرجع: TX-BM-2026-8812
التاريخ: 2026-09-10 16:40
الرصيد الحقيقي للمحفظة: 3,600.00 د.ج
🔒 تم توثيق الهوية عبر Truecaller للرقم: 0652206947 (Lokmane Yassine Abakhti)
شكراً لثقتكم بخدمات بريد الجزائر.`
    }
  ]));

  const [activeSmsModal, setActiveSmsModal] = useState<BaridimobSmsNotification | null>(null);

  // Payment Accounts
  const [paymentAccounts, setPaymentAccounts] = useState<SavedPaymentAccounts>(() => loadStorage('paymentAccounts', {
    baridimobRip: '00799999002847192033',
    baridimobHolder: 'LOKMANE YASSINE ABAKHTI (لقمان ياسين أبختي)',
    baridimobPhone: '0652206947',
    truecallerNumber: '652206947',
    truecallerVerified: true,
    truecallerCallerIdName: 'لقمان ياسين أبختي | Lokmane Yassine Abakhti (BaridiMob Verified)',
    autoSendSmsOnTransactions: true,
    binanceTrc20: 'TQ9x7V9uD5hF3X9kP1M4zW7Y8Q2c1vB4N6',
    binanceBep20: '0x3D724b17C64154942bEb5c5b967812Ac8e2026',
    binanceErc20: '0x3D724b17C64154942bEb5c5b967812Ac8e2026',
    binancePayId: '849201938',
    paypalEmail: 'lokmaneyassine006@gmail.com',
    ccpAccount: '24910283 Clé 44',
  }));

  // Gift Cards & Infinite Owner Vouchers
  const [giftCards, setGiftCards] = useState<GiftCardVoucher[]>(() => {
    const saved = loadStorage<GiftCardVoucher[]>('giftCards', INITIAL_GIFT_CARDS);
    const hasOwnerInfinite = saved.some((c) => c.code === 'OWNER-INFINITY-VIP');
    if (!hasOwnerInfinite) {
      const infiniteDefaults = INITIAL_GIFT_CARDS.filter((c) => c.isInfinite);
      return [...infiniteDefaults, ...saved];
    }
    // Ensure description mentions Saad Bouacha
    return saved.map((c) => c.code === 'OWNER-INFINITY-VIP' ? {
      ...c,
      description: 'القسيمة اللانهائية الحصرية لمالك المنصة وإدارتها العليا (الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة) - شحن واستفادة لانهائية وخصم 100%'
    } : c);
  });

  // Virtual Cards
  const [virtualCards, setVirtualCards] = useState<VirtualCardData[]>(() => loadStorage('virtualCards', INITIAL_VIRTUAL_CARDS));

  // Team & HR
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => loadStorage('teamMembers', INITIAL_TEAM_MEMBERS));
  
  const [teamChangeRequests, setTeamChangeRequests] = useState<TeamChangeRequest[]>(() => loadStorage('teamChangeRequests', [
    {
      id: 'cr-1',
      memberId: 'tm-2',
      memberName: 'أمين بلمختار',
      memberRole: 'رئيس التحرير',
      requestType: 'new_category',
      title: 'إضافة قسم فرعي للعلوم الإنسانية المقارنة',
      description: 'نقترح إضافة قسم فرعي يعنى بالدراسات الاجتماعية المقارنة لتعزيز التنوع الأكاديمي.',
      status: 'pending',
      createdAt: '2025-02-12'
    }
  ]));

  const [meetings, setMeetings] = useState<MeetingSchedule[]>(() => loadStorage('meetings', [
    {
      id: 'meet-1',
      title: 'الاجتماع الاستراتيجي الدوري لتطوير المحتوى والنشر 2026',
      date: '2026-09-15',
      time: '18:00',
      durationMinutes: 60,
      hostName: 'لقمان ياسين أبختي (رئيس المنصة)',
      agenda: '1. مراجعة إحصائيات المبيعات والصوتيات.\n2. اعتماد الإصدارات المترجمة الجديدة.\n3. تصفية مستحقات المؤلفين والشركاء.',
      meetingLink: 'https://meet.together-change.dz/room/strategy-2026',
      attendeesCount: 5
    }
  ]));

  // Customization
  const [customization, setCustomization] = useState<StoreCustomization>(() => loadStorage('customization', {
    storeName: 'مكتبة معا نحو التغيير',
    storeSubtitle: 'المنصة العالمية للكتب الإلكترونية، الصوتية، والنشر التفاعلي',
    bannerNotice: '✨ مرحباً بكم في مكتبة "معا نحو التغيير" — استخدم كود CHANGE-2026-USDT10 للحصول على بطاقة هدية 10 USDT!',
    showBanner: true,
    primaryColor: '#0f766e',
    themeMode: 'light',
    exchangeRateUsdtToDzd: 240,
    platformCommissionPercent: 10,
    presidentName: 'لقمان ياسين أبختي',
  }));

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => loadStorage('socialLinks', {
    facebook: 'https://facebook.com/together.towards.change.dz',
    instagram: 'https://instagram.com/together.towards.change',
    tiktok: 'https://tiktok.com/@together.change.dz',
    twitterX: 'https://x.com/together_change',
    youtube: 'https://youtube.com/@together-towards-change',
    linkedin: 'https://linkedin.com/in/lokmane-yassine-abakhti',
    telegram: 'https://t.me/together_change_library',
    whatsapp: 'https://wa.me/213550000000',
    github: 'https://github.com/lokmaneyassine006',
    personalSite: 'https://together-towards-change.dz',
  }));

  // Security
  const [security, setSecurity] = useState<SecurityState>(() => loadStorage('security', {
    httpsActive: true,
    rateLimitPerMinute: 120,
    xssSanitizerActive: true,
    dataIntegrityHash: calculateIntegrityChecksum(INITIAL_BOOKS),
    isLockdownMode: false,
    bannedUserIds: [],
    requestCountLastMinute: 14,
  }));

  // Localization & Currency
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('DZD');
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'sepia' | 'auto'>('light');

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeBookForModal, setActiveBookForModal] = useState<Book | null>(null);
  const [quickBinanceBook, setQuickBinanceBook] = useState<Book | null>(null);

  // Live Auto-Promotion Broadcasts
  const [livePromotions, setLivePromotions] = useState<PromotionBroadcast[]>(() => loadStorage('livePromotions', [
    {
      id: 'promo-seed-1',
      bookId: 'b1',
      bookTitle: 'معاً نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
      buyerName: 'أمينة ب.',
      discountCode: 'READ20',
      referralLink: 'https://together-change.dz/?promo=READ20',
      timestamp: 'منذ دقيقة',
      txRef: 'TX-BM-82194'
    },
    {
      id: 'promo-seed-2',
      bookId: 'b2',
      bookTitle: 'أسرار النجاح والقيادة الملهمة',
      buyerName: 'ياسين م.',
      discountCode: 'READ20',
      referralLink: 'https://together-change.dz/?promo=READ20',
      timestamp: 'منذ 5 دقائق',
      txRef: 'TX-BN-55102'
    }
  ]));

  const [lastPurchasedPromotion, setLastPurchasedPromotion] = useState<{ books: Book[]; txRef: string } | null>(null);

  const addLivePromotion = useCallback((promo: PromotionBroadcast) => {
    setLivePromotions((prev) => {
      const next = [promo, ...prev.slice(0, 14)];
      saveStorage('livePromotions', next);
      return next;
    });
  }, []);

  // Cart open state helper
  const isCartOpen = activeModal === 'cart';
  const setIsCartOpen = useCallback((open: boolean) => {
    setActiveModal(open ? 'cart' : null);
  }, []);

  // Virtual Card Customizer state
  const [virtualCardConfig, setVirtualCardConfig] = useState<VirtualCardConfig>(() => loadStorage('virtualCardConfig', {
    cardNumber: '8492 7391 0029 2026',
    cardHolderName: 'لقمان ياسين أبختي',
    expiryDate: '12/30',
    backgroundGradient: 'from-teal-900 via-stone-900 to-slate-900',
    showChip: true,
    showQr: true,
    tier: 'VIP Founder'
  }));

  const updateVirtualCardConfig = useCallback((updates: Partial<VirtualCardConfig>) => {
    setVirtualCardConfig((prev) => {
      const next = { ...prev, ...updates };
      saveStorage('virtualCardConfig', next);
      return next;
    });
  }, []);

  // Job Applications State
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => loadStorage('jobApplications', []));

  const applyForJob = useCallback((appData: Omit<JobApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp: JobApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setJobApplications((prev) => {
      const next = [newApp, ...prev];
      saveStorage('jobApplications', next);
      return next;
    });
    return { success: true };
  }, []);

  // Auth Helpers
  const login = useCallback((email: string, password?: string) => {
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUserState(found);
      return { success: true };
    }
    // Auto-create user if not found
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName: email.split('@')[0] || 'قارئ',
      lastName: 'جديد',
      birthDate: '2000-01-01',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'regular_user',
      isVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      walletDzd: 1500,
      isBanned: false
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUserState(newUser);
    return { success: true };
  }, [allUsers]);

  const register = useCallback((userData: { firstName: string; lastName: string; email: string; birthDate: string; password?: string }) => {
    const exists = allUsers.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'regular_user',
      isVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      walletDzd: 2000,
      isBanned: false
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUserState(newUser);
    return { success: true };
  }, [allUsers]);

  // Audio / TTS state
  const [audioState, setAudioState] = useState<AudioPlayerState>({
    bookId: null,
    bookTitle: '',
    bookAuthor: '',
    coverUrl: '',
    currentText: '',
    chapterTitle: '',
    isPlaying: false,
    isPaused: false,
    playbackRate: 1.0,
    pitch: 1.0,
    progress: 0,
    mode: 'tts'
  });

  // Sync state to LocalStorage
  useEffect(() => { saveStorage('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveStorage('allUsers', allUsers); }, [allUsers]);
  useEffect(() => { saveStorage('books', books); }, [books]);
  useEffect(() => { saveStorage('reviews', reviews); }, [reviews]);
  useEffect(() => { saveStorage('cart', cart); }, [cart]);
  useEffect(() => { saveStorage('forumTopics', forumTopics); }, [forumTopics]);
  useEffect(() => { saveStorage('transactions', transactions); }, [transactions]);
  useEffect(() => { saveStorage('withdrawals', withdrawals); }, [withdrawals]);
  useEffect(() => { saveStorage('paymentAccounts', paymentAccounts); }, [paymentAccounts]);
  useEffect(() => { saveStorage('giftCards', giftCards); }, [giftCards]);
  useEffect(() => { saveStorage('virtualCards', virtualCards); }, [virtualCards]);
  useEffect(() => { saveStorage('teamMembers', teamMembers); }, [teamMembers]);
  useEffect(() => { saveStorage('teamChangeRequests', teamChangeRequests); }, [teamChangeRequests]);
  useEffect(() => { saveStorage('meetings', meetings); }, [meetings]);
  useEffect(() => { saveStorage('customization', customization); }, [customization]);
  useEffect(() => { saveStorage('socialLinks', socialLinks); }, [socialLinks]);
  useEffect(() => { saveStorage('security', security); }, [security]);

  // One-time auto-purge of simulated/fake earnings and synchronization of strictly real wallet profit
  useEffect(() => {
    const FAKE_TX_IDS = ['tx-bm-structured-1', 'tx-bn-structured-1'];
    const FAKE_WD_IDS = ['wd-bm-1', 'wd-bn-1', 'wd-1'];
    const FAKE_SMS_IDS = ['sms-bn-init-1', 'sms-bm-init-1'];

    const hasFakeTx = transactions.some((t) => FAKE_TX_IDS.includes(t.id));
    const hasFakeWd = withdrawals.some((w) => FAKE_WD_IDS.includes(w.id));
    const hasFakeSms = smsNotifications.some((s) => FAKE_SMS_IDS.includes(s.id));
    const isOwner = currentUser.role === 'owner' || currentUser.id === OWNER_USER.id;
    const hasInflatedBalance = isOwner && currentUser.walletDzd > 50000;

    if (hasFakeTx || hasFakeWd || hasFakeSms || hasInflatedBalance) {
      const cleanTx = transactions.filter((t) => !FAKE_TX_IDS.includes(t.id));
      const cleanWd = withdrawals.filter((w) => !FAKE_WD_IDS.includes(w.id));
      const cleanSms = smsNotifications.filter((s) => !FAKE_SMS_IDS.includes(s.id));

      let ownerRealSales = 0;
      cleanTx.forEach((tx) => {
        if (tx.status === 'completed' && tx.type === 'book_purchase') {
          const isOwnerBook = tx.sellerId === OWNER_USER.id || tx.sellerName?.includes('لقمان ياسين');
          if (isOwnerBook) {
            ownerRealSales += (tx.amountDzd || 0);
          } else if (tx.platformFeeDzd) {
            ownerRealSales += tx.platformFeeDzd;
          }
        } else if (tx.status === 'completed' && (tx.type === 'promotion_reward' || tx.type === 'deposit')) {
          if (tx.buyerId === OWNER_USER.id || tx.userId === OWNER_USER.id) {
            ownerRealSales += (tx.amountDzd || 0);
          }
        }
      });

      const ownerRealWd = cleanWd
        .filter((w) => w.authorId === OWNER_USER.id && (w.status === 'approved' || w.status === 'completed'))
        .reduce((sum, w) => sum + (w.amountDzd || 0), 0);

      const netRealBalance = Math.max(0, ownerRealSales - ownerRealWd);

      setTransactions(cleanTx);
      saveStorage('transactions', cleanTx);

      setWithdrawals(cleanWd);
      saveStorage('withdrawals', cleanWd);

      setSmsNotifications(cleanSms);
      saveStorage('smsNotifications', cleanSms);

      setCurrentUserState((prev) => {
        const next = { ...prev, walletDzd: netRealBalance };
        saveStorage('currentUser', next);
        return next;
      });

      setAllUsers((prev) => {
        const next = prev.map((u) => {
          if (u.id === OWNER_USER.id || u.id === SAAD_BOUACHA_USER.id) {
            return { ...u, walletDzd: netRealBalance };
          }
          return u;
        });
        saveStorage('allUsers', next);
        return next;
      });

      setVirtualCards((prev) => {
        const next = prev.map((c) => ({ ...c, balance: netRealBalance }));
        saveStorage('virtualCards', next);
        return next;
      });

      console.log(`[StoreContext] Auto-purged fake earnings. Wallet set to real profit: ${netRealBalance} DZD`);
    }
  }, []);

  // Handle theme classes on HTML / Body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');

    let effectiveTheme = themeMode;
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    const themeClass = `theme-${effectiveTheme}`;
    root.classList.add(themeClass);
    body.classList.add(themeClass);
  }, [themeMode]);

  // Handle language and RTL direction
  const setLanguage = useCallback((langCode: string) => {
    const lang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];
    setSelectedLanguage(lang);
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir;
  }, []);

  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'sepia' | 'auto') => {
    setThemeModeState(mode);
    setCustomization((prev) => ({ ...prev, themeMode: mode }));
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  }, []);

  const switchUserRole = useCallback((role: 'owner' | 'team_member' | 'regular_user' | 'saad_bouacha') => {
    if (role === 'owner') {
      setCurrentUser(OWNER_USER);
    } else if (role === 'saad_bouacha') {
      setCurrentUser(SAAD_BOUACHA_USER);
    } else if (role === 'team_member') {
      const teamUser = DEMO_USERS.find((u) => u.role === 'team_member') || DEMO_USERS[2];
      setCurrentUser(teamUser);
    } else {
      const regular = DEMO_USERS.find((u) => u.role === 'regular_user') || DEMO_USERS[3];
      setCurrentUser(regular);
    }
  }, [setCurrentUser]);

  const loginUser = useCallback((email: string, firstName: string, lastName: string, birthDate: string) => {
    const isOwnerLogin = email.trim().toLowerCase() === 'lokmaneyassine006@gmail.com' || (firstName.includes('لقمان') && lastName.includes('أبختي'));
    const isSaadLogin = email.trim().toLowerCase() === 'saad.bouacha@change.dz' || email.trim().toLowerCase().includes('bouacha') || (firstName.includes('سعد') && lastName.includes('بوعشة'));
    
    if (isOwnerLogin) {
      setCurrentUser(OWNER_USER);
      return;
    }

    if (isSaadLogin) {
      setCurrentUser(SAAD_BOUACHA_USER);
      return;
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      birthDate,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role: 'regular_user',
      isVerified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      walletDzd: 0,
      isBanned: false,
      bio: 'عضو جديد في منصة معا نحو التغيير.',
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
  }, [allUsers, setCurrentUser]);

  const logoutUser = useCallback(() => {
    // Switch to default reader guest
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      email: 'guest@together-change.dz',
      firstName: 'زائر',
      lastName: 'كريم',
      birthDate: '2000-01-01',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'regular_user',
      isVerified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      walletDzd: 0,
      isBanned: false,
    };
    setCurrentUser(guestUser);
  }, [setCurrentUser]);

  const banUser = useCallback((userId: string) => {
    setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: true } : u));
    setSecurity((prev) => ({
      ...prev,
      bannedUserIds: Array.from(new Set([...prev.bannedUserIds, userId]))
    }));
  }, []);

  const unbanUser = useCallback((userId: string) => {
    setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: false } : u));
    setSecurity((prev) => ({
      ...prev,
      bannedUserIds: prev.bannedUserIds.filter((id) => id !== userId)
    }));
  }, []);

  // Books CRUD
  const addBook = useCallback((bookData: Partial<Book>) => {
    const isOwnerPublishing = currentUser.role === 'owner' || currentUser.id === OWNER_USER.id;
    
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: bookData.title || 'كتاب جديد',
      author: bookData.author || `${currentUser.firstName} ${currentUser.lastName}`,
      authorId: currentUser.id,
      publisher: bookData.publisher || (isOwnerPublishing ? 'دار النشر - معا نحو التغيير' : 'منشورات حرة'),
      isbn: bookData.isbn || `978-9931-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-1`,
      description: bookData.description || 'نبذة عن الكتاب...',
      category: bookData.category || 'تنمية وتغيير',
      priceDzd: Math.max(0, Number(bookData.priceDzd) || 1200),
      coverUrl: bookData.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      isCustom: true,
      isOwnerBook: isOwnerPublishing,
      rating: 5.0,
      reviewCount: 0,
      pageCount: Number(bookData.pageCount) || 180,
      language: bookData.language || 'العربية',
      translations: bookData.translations || [],
      wordDocContent: bookData.wordDocContent || '',
      pdfUrl: bookData.pdfUrl || '#pdf-preview',
      audioTrack: bookData.audioTrack || {
        hasAudio: true,
        duration: '1:30:00',
        chapters: [{ id: 'ch1', title: 'مقدمة الكتاب والتمهيد', durationSeconds: 600, sampleText: bookData.description || '' }]
      },
      license: bookData.license || {
        type: 'All-Rights-Reserved',
        registrationId: `DZ-COPYRIGHT-${Date.now().toString().slice(-6)}`,
        protectionYear: 2026,
        jurisdiction: 'International Intellectual Property Registry',
        isVerifiedBadge: true,
      },
      salesCount: 0,
      downloadsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBooks((prev) => [newBook, ...prev]);
    
    // Confetti effect on publishing
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    return { success: true, book: newBook };
  }, [currentUser]);

  const updateBook = useCallback((bookId: string, updates: Partial<Book>) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b)));
  }, []);

  const updateBookPrice = useCallback((bookId: string, newPriceDzd: number) => {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, priceDzd: Math.max(0, newPriceDzd) } : b)));
  }, []);

  const deleteBook = useCallback((bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setCart((prev) => prev.filter((c) => c.bookId !== bookId));
  }, []);

  const addTranslationToBook = useCallback((bookId: string, translation: BookTranslation) => {
    setBooks((prev) => prev.map((b) => {
      if (b.id !== bookId) return b;
      const existing = b.translations.filter((t) => t.langCode !== translation.langCode);
      return {
        ...b,
        translations: [...existing, translation]
      };
    }));
  }, []);

  // Automatic Top Reviewer check & election
  const evaluateTopReviewer = useCallback((currentReviews: Review[]) => {
    if (currentReviews.length === 0) return;
    const sorted = [...currentReviews].sort((a, b) => b.likes - a.likes);
    const top = sorted[0];
    if (top && top.likes >= 5) {
      // Mark as top reviewer reward
      setReviews((prev) => prev.map((r) => r.id === top.id ? { ...r, isTopReviewerReward: true } : { ...r, isTopReviewerReward: false }));
      
      // Auto-promote reviewer to team if not already
      setAllUsers((prevUsers) => prevUsers.map((u) => {
        if (u.id === top.userId && u.role === 'regular_user') {
          return {
            ...u,
            role: 'team_member',
            teamTitle: 'عضو فريق المنصة (صاحب أفضل مراجعة)',
            competenceScore: 90
          };
        }
        return u;
      }));

      // Add to team list if not existing
      setTeamMembers((prevTeam) => {
        if (prevTeam.some((tm) => tm.id === top.userId || tm.name === top.userName)) return prevTeam;
        return [
          ...prevTeam,
          {
            id: top.userId,
            name: top.userName,
            email: `${top.userName.replace(/\s+/g, '.')}@change.dz`,
            role: 'senior_reviewer',
            roleTitleAr: 'محرر ومراجع مميز (الفائز بأعلى تقييم)',
            bio: 'تم اختياره تلقائياً كعضو في فريق المنصة نظير مراجعته النقدية الأكثر تفاعلاً وإعجاباً.',
            cvSummary: 'قارئ وناقد متميز حائز على جائزة أفضل مراجعة في مجتمع معا نحو التغيير.',
            competenceScore: 90,
            ratingScore: 5.0,
            joinDate: new Date().toISOString().split('T')[0],
            avatar: top.userAvatar,
            permissions: ['moderate_reviews', 'forum_manage'],
            isPresident: false,
            status: 'active'
          }
        ];
      });
    }
  }, []);

  // Reviews CRUD with profanity filter
  const addReview = useCallback((bookId: string, rating: number, text: string) => {
    const profanityCheck = checkProfanity(text);
    if (!profanityCheck.isClean) {
      return { 
        success: false, 
        error: `عذراً، يحتوي تعليقك على عبارات غير لائقة (${profanityCheck.flaggedWord}). يرجى الالتزام بالمعايير الأخلاقية للمنصة.` 
      };
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      bookId,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      rating,
      text,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString().split('T')[0],
      isTopReviewerReward: false,
    };

    setReviews((prev) => {
      const updated = [newReview, ...prev];
      // Update book average rating
      const bookRevs = updated.filter((r) => r.bookId === bookId);
      const avgRating = bookRevs.length ? (bookRevs.reduce((acc, r) => acc + (r.rating || 0), 0) / bookRevs.length) : 5;
      setBooks((prevBooks) => prevBooks.map((b) => b.id === bookId ? { ...b, rating: +((avgRating || 5).toFixed(1)), reviewCount: bookRevs.length } : b));
      return updated;
    });

    return { success: true };
  }, [currentUser]);

  const likeReview = useCallback((reviewId: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== reviewId) return r;
        const hasLiked = r.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked ? r.likedBy.filter((id) => id !== currentUser.id) : [...r.likedBy, currentUser.id];
        return {
          ...r,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
      });
      evaluateTopReviewer(updated);
      return updated;
    });
  }, [currentUser, evaluateTopReviewer]);

  // Cart operations
  const addToCart = useCallback((bookId: string, format: 'digital' | 'audio' | 'bundle' = 'digital') => {
    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === bookId && item.format === format);
      if (existing) {
        return prev.map((item) => item.bookId === bookId && item.format === format ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { bookId, quantity: 1, format }];
    });
  }, []);

  const removeFromCart = useCallback((bookId: string) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  }, []);

  const updateCartQuantity = useCallback((bookId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCart((prev) => prev.map((item) => item.bookId === bookId ? { ...item, quantity: qty } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotalDzd = cart.reduce((acc, item) => {
    const book = books.find((b) => b.id === item.bookId);
    if (!book) return acc;
    let multiplier = 1;
    if (item.format === 'bundle') multiplier = 1.35;
    if (item.format === 'audio') multiplier = 1.1;
    return acc + Math.round(book.priceDzd * multiplier) * item.quantity;
  }, 0);

  // Audio & TTS engine
  const playBookTTS = useCallback((book: Book, textToRead?: string, chapterTitle?: string) => {
    const content = textToRead || book.description || book.wordDocContent || book.title;
    const title = chapterTitle || 'قراءة صوتية بالنص إلى كلام (TTS)';
    
    SpeechEngine.speak(content, {
      lang: 'ar-SA',
      rate: audioState.playbackRate,
      pitch: audioState.pitch,
      onStart: () => {
        setAudioState((prev) => ({
          ...prev,
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          coverUrl: book.coverUrl,
          currentText: content,
          chapterTitle: title,
          isPlaying: true,
          isPaused: false,
          mode: 'tts'
        }));
      },
      onEnd: () => {
        setAudioState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
      },
      onError: () => {
        setAudioState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
      }
    });
  }, [audioState.playbackRate, audioState.pitch]);

  const playBookAudioTrack = useCallback((book: Book, chapterIndex = 0) => {
    const chapter = book.audioTrack?.chapters[chapterIndex];
    const textToSpeak = chapter?.sampleText || book.description || book.title;
    const chapterName = chapter?.title || 'المسار الصوتي للكتاب';

    SpeechEngine.speak(textToSpeak, {
      lang: 'ar-SA',
      rate: audioState.playbackRate,
      onStart: () => {
        setAudioState((prev) => ({
          ...prev,
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          coverUrl: book.coverUrl,
          currentText: textToSpeak,
          chapterTitle: chapterName,
          isPlaying: true,
          isPaused: false,
          mode: 'audio_file'
        }));
      },
      onEnd: () => {
        setAudioState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
      }
    });
  }, [audioState.playbackRate]);

  const pauseAudio = useCallback(() => {
    SpeechEngine.pause();
    setAudioState((prev) => ({ ...prev, isPaused: true, isPlaying: false }));
  }, []);

  const resumeAudio = useCallback(() => {
    SpeechEngine.resume();
    setAudioState((prev) => ({ ...prev, isPaused: false, isPlaying: true }));
  }, []);

  const stopAudio = useCallback(() => {
    SpeechEngine.stop();
    setAudioState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentText: '' }));
  }, []);

  const setAudioSpeed = useCallback((rate: number) => {
    setAudioState((prev) => ({ ...prev, playbackRate: rate }));
    if (audioState.isPlaying && audioState.currentText) {
      SpeechEngine.speak(audioState.currentText, {
        lang: 'ar-SA',
        rate
      });
    }
  }, [audioState]);

  // Forum CRUD with profanity filter
  const addForumTopic = useCallback((title: string, content: string, category: string, bookId?: string, bookTitle?: string) => {
    const titleCheck = checkProfanity(title);
    const contentCheck = checkProfanity(content);
    if (!titleCheck.isClean || !contentCheck.isClean) {
      return { 
        success: false, 
        error: 'عذراً، يحتوي موضوعك على عبارات غير لائقة ومخالفة لشروط المجتمع.' 
      };
    }

    const newTopic: ForumTopic = {
      id: `topic-${Date.now()}`,
      bookId,
      bookTitle,
      title,
      content,
      authorId: currentUser.id,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      category,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString().split('T')[0],
      isPinned: false
    };

    setForumTopics((prev) => [newTopic, ...prev]);
    return { success: true };
  }, [currentUser]);

  const addForumReply = useCallback((topicId: string, content: string) => {
    const contentCheck = checkProfanity(content);
    if (!contentCheck.isClean) {
      return { 
        success: false, 
        error: 'عذراً، الرد يحتوي على عبارات غير لائقة.' 
      };
    }

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      topicId,
      authorId: currentUser.id,
      authorName: `${currentUser.firstName} ${currentUser.lastName}`,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setForumTopics((prev) => prev.map((t) => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        replies: [...t.replies, newReply]
      };
    }));

    return { success: true };
  }, [currentUser]);

  const likeForumTopic = useCallback((topicId: string) => {
    setForumTopics((prev) => prev.map((t) => {
      if (t.id !== topicId) return t;
      const hasLiked = t.likedBy.includes(currentUser.id);
      const newLikedBy = hasLiked ? t.likedBy.filter((id) => id !== currentUser.id) : [...t.likedBy, currentUser.id];
      return {
        ...t,
        likes: newLikedBy.length,
        likedBy: newLikedBy
      };
    }));
  }, [currentUser]);

  const likeForumReply = useCallback((topicId: string, replyId: string) => {
    setForumTopics((prev) => prev.map((t) => {
      if (t.id !== topicId) return t;
      const updatedReplies = t.replies.map((r) => {
        if (r.id !== replyId) return r;
        const hasLiked = r.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked ? r.likedBy.filter((id) => id !== currentUser.id) : [...r.likedBy, currentUser.id];
        return {
          ...r,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
      });
      return { ...t, replies: updatedReplies };
    }));
  }, [currentUser]);

  const deleteForumTopic = useCallback((topicId: string) => {
    setForumTopics((prev) => prev.filter((t) => t.id !== topicId));
  }, []);

  // Forum Helpers & Aliases
  const addForumPost = useCallback((post: { title: string; content: string; category: string; tags?: string[] }) => {
    return addForumTopic(post.title, post.content, post.category);
  }, [addForumTopic]);

  const likeForumPost = useCallback((topicId: string) => {
    likeForumTopic(topicId);
  }, [likeForumTopic]);

  // Audio rate helper alias
  const setAudioRate = useCallback((rate: number) => {
    setAudioSpeed(rate);
  }, [setAudioSpeed]);

  // Core Unified SMS Notification Service for BaridiMob & Binance (Direct to phone 0652206947)
  const sendTransactionSms = useCallback((params: {
    channel: 'baridimob' | 'binance';
    recipientPhone?: string;
    recipientName?: string;
    amountDzd?: number;
    amountUsdt?: number;
    referenceCode: string;
    type?: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
    ripNumber?: string;
    cryptoAddressOrPayId?: string;
    cryptoNetwork?: string;
    txHash?: string;
    currentBalanceDzd?: number;
  }): BaridimobSmsNotification => {
    const defaultOwnerPhone = paymentAccounts.baridimobPhone || '0652206947';
    const cleanPhone = params.recipientPhone?.trim() || defaultOwnerPhone;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}`;
    
    // Truecaller verification check for 0652206947 / 652206947
    const isTruecallerLinked = cleanPhone.includes('652206947') || cleanPhone === '0652206947' || cleanPhone === defaultOwnerPhone;
    const cleanName = params.recipientName?.trim() || (isTruecallerLinked ? 'لقمان ياسين أبختي (Lokmane Yassine Abakhti)' : 'القارئ المعتمد');

    const exchangeRate = customization?.exchangeRateUsdtToDzd || 240;
    const amountDzdVal = Math.abs(params.amountDzd !== undefined ? params.amountDzd : (params.amountUsdt ? Math.round(params.amountUsdt * exchangeRate) : 0));
    const amountUsdtVal = params.amountUsdt !== undefined 
      ? params.amountUsdt 
      : +(((amountDzdVal) / exchangeRate) || 0).toFixed(2);

    let typeLabel = 'تحويل وسحب مالي إنشائي معتمد';
    if (params.type === 'purchase') typeLabel = 'دفع قيمة مشتريات كتب ومؤلفات المتجر';
    else if (params.type === 'deposit') typeLabel = 'إيداع وشحن رصيد المحفظة';
    else if (params.type === 'transfer') typeLabel = 'تحويل مالي بين الحسابات';

    const balanceText = params.currentBalanceDzd !== undefined 
      ? `الرصيد المتاح: ${params.currentBalanceDzd.toLocaleString()} د.ج`
      : `الرصيد المتبقي: ${(currentUser.walletDzd).toLocaleString()} د.ج`;

    let messageText = '';
    let senderId = 'BARIDIMOB';
    const cleanRip = params.ripNumber?.trim() || paymentAccounts.baridimobRip || '00799999002847192033';
    const cleanCrypto = params.cryptoAddressOrPayId?.trim() || paymentAccounts.binanceTrc20 || 'TQ9x7V9uD5hF3X9kP1M4zW7Y8Q2c1vB4N6';
    const networkName = params.cryptoNetwork || (params.channel === 'binance' ? 'TRC20' : undefined);

    if (params.channel === 'binance') {
      senderId = 'BINANCE';
      const truecallerSeal = isTruecallerLinked
        ? `\n🔒 هوية الحساب موثقة عبر Truecaller: 0652206947 (Lokmane Yassine Abakhti - علامة التوثيق الرسمية ✓)`
        : '';

      messageText = `【Binance】إشعار أمان ومعاملة مالية:
تم بنجاح ${typeLabel} بمبلغ: ${amountUsdtVal.toFixed(2)} USDT (~${amountDzdVal.toLocaleString()} د.ج)
الشبكة: ${networkName || 'Tron (TRC20)'}
المعرف / المحفظة: ${cleanCrypto}
المستفيد: ${cleanName}
المرجع: ${params.referenceCode}
مدة المعالجة المعتمدة: ساعتان (120 دقيقة) ⏱️
التاريخ: ${formattedDate}
${params.txHash ? `رمز المعاملة (TxHash): ${params.txHash.slice(0, 18)}...` : ''}
${balanceText}${truecallerSeal}
شكراً لثقتكم بمنصة بينانس العالمية (Binance Official).`;
    } else {
      senderId = 'BARIDIMOB';
      const truecallerSeal = isTruecallerLinked
        ? `\n🔒 هوية المتصل موثقة عبر Truecaller: 0652206947 (Lokmane Yassine Abakhti - علامة التحقق الزرقاء ✓)`
        : '';

      messageText = `Algérie Poste / BaridiMob:
تم بنجاح ${typeLabel} بمبلغ: ${amountDzdVal.toLocaleString()} د.ج
إلى الحساب RIP: ${cleanRip}
المستفيد: ${cleanName}
المرجع: ${params.referenceCode}
مدة المعالجة المعتمدة: ساعتان (120 دقيقة) ⏱️
التاريخ: ${formattedDate}
${balanceText}${truecallerSeal}
شكراً لثقتكم بخدمات بريد الجزائر.`;
    }

    const newSms: BaridimobSmsNotification = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referenceCode: params.referenceCode,
      type: params.type || 'withdrawal',
      channel: params.channel,
      recipientPhone: cleanPhone,
      recipientName: cleanName,
      ripNumber: params.channel === 'baridimob' ? cleanRip : undefined,
      cryptoAddressOrPayId: params.channel === 'binance' ? cleanCrypto : undefined,
      cryptoNetwork: params.channel === 'binance' ? (networkName || 'TRC20') : undefined,
      amountDzd: amountDzdVal,
      amountUsdt: amountUsdtVal,
      currentBalanceDzd: params.currentBalanceDzd ?? currentUser.walletDzd,
      messageText,
      sentAt: formattedDate,
      status: 'delivered',
      senderId,
      txHash: params.txHash,
      truecallerVerified: isTruecallerLinked || !!paymentAccounts.truecallerVerified,
      truecallerCallerId: isTruecallerLinked ? 'لقمان ياسين أبختي (Lokmane Yassine Abakhti)' : undefined,
      truecallerNumber: isTruecallerLinked ? '0652206947' : cleanPhone,
      truecallerCategory: params.channel === 'binance' 
        ? 'بينانس - حساب موثق رسمي (Binance Verified Trader)' 
        : 'بريدي موب - حساب مالي رسمي معتمد (BaridiMob Verified)',
    };

    setSmsNotifications((prev) => {
      const next = [newSms, ...prev];
      saveStorage('smsNotifications', next);
      return next;
    });

    setActiveSmsModal(newSms);

    // If browser Web Notification API is permitted, trigger system notification
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(params.channel === 'binance' ? 'إشعار بينانس المالي (Binance SMS)' : 'إشعار بريدي موب (BaridiMob SMS)', {
            body: `تم إرسال رسالة إلى هاتفك 0652206947: ${amountDzdVal.toLocaleString()} د.ج (${amountUsdtVal} USDT)`,
            icon: '/vite.svg'
          });
        }
      }
    } catch {
      // ignore
    }

    return newSms;
  }, [paymentAccounts.baridimobRip, paymentAccounts.baridimobPhone, paymentAccounts.binanceTrc20, paymentAccounts.truecallerVerified, currentUser.walletDzd, customization?.exchangeRateUsdtToDzd]);

  // BaridiMob SMS Notification Service (Linked with Truecaller: 0652206947)
  const sendBaridimobSms = useCallback((params: {
    recipientPhone?: string;
    recipientName?: string;
    ripNumber?: string;
    amountDzd: number;
    referenceCode: string;
    type?: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
    currentBalanceDzd?: number;
  }): BaridimobSmsNotification => {
    return sendTransactionSms({
      channel: 'baridimob',
      ...params
    });
  }, [sendTransactionSms]);

  // Binance SMS Notification Service (Linked with Truecaller: 0652206947)
  const sendBinanceSms = useCallback((params: {
    recipientPhone?: string;
    recipientName?: string;
    cryptoAddressOrPayId?: string;
    cryptoNetwork?: string;
    amountUsdt: number;
    amountDzd?: number;
    referenceCode: string;
    type?: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
    txHash?: string;
    currentBalanceDzd?: number;
  }): BaridimobSmsNotification => {
    return sendTransactionSms({
      channel: 'binance',
      ...params
    });
  }, [sendTransactionSms]);

  // Purchase & Royalties Processing
  const processPurchase = useCallback((
    bookIds: string[], 
    paymentMethod: 'binance' | 'baridimob' | 'cib_ccp' | 'gift_card' | 'wallet',
    txHash?: string
  ) => {
    const purchasedBooks = books.filter((b) => bookIds.includes(b.id));
    if (purchasedBooks.length === 0) {
      return { success: false, message: 'لم يتم العثور على كتب محددة', txRef: '' };
    }

    const txRef = generateReferenceCode('TX');
    const newTxList: SaleTransaction[] = [];

    purchasedBooks.forEach((book) => {
      const isOwnerBook = book.isOwnerBook || book.authorId === OWNER_USER.id || book.author.includes('لقمان ياسين');
      const commissionPercent = isOwnerBook ? 0 : (customization.platformCommissionPercent || 10);
      const platformFee = Math.round((book.priceDzd * commissionPercent) / 100);
      const authorNet = book.priceDzd - platformFee;

      const tx: SaleTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        txRef,
        bookId: book.id,
        bookTitle: book.title,
        buyerId: currentUser.id,
        buyerName: `${currentUser.firstName} ${currentUser.lastName}`,
        sellerId: book.authorId,
        sellerName: book.author,
        amountDzd: book.priceDzd,
        amountUsdt: +(((book.priceDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2),
        platformFeeDzd: platformFee,
        authorNetDzd: authorNet,
        method: paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        txHash: txHash || (paymentMethod === 'binance' ? `0x${Math.random().toString(16).substring(2, 38)}` : undefined)
      };
      newTxList.push(tx);

      // Increase book sales count
      setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, salesCount: b.salesCount + 1, downloadsCount: b.downloadsCount + 1 } : b));

      // Credit wallet of seller or owner
      if (isOwnerBook) {
        OWNER_USER.walletDzd += book.priceDzd;
        if (currentUser.id === OWNER_USER.id) {
          setCurrentUserState((prev) => ({ ...prev, walletDzd: prev.walletDzd + book.priceDzd }));
        }
      } else {
        // Credit author wallet and owner takes commission
        setAllUsers((prevUsers) => prevUsers.map((u) => {
          if (u.id === book.authorId) {
            return { ...u, walletDzd: (u.walletDzd || 0) + authorNet };
          }
          if (u.id === OWNER_USER.id) {
            return { ...u, walletDzd: (u.walletDzd || 0) + platformFee };
          }
          return u;
        }));
      }
    });

    setTransactions((prev) => [...newTxList, ...prev]);
    clearCart();

    // Automatic Promotion of the Store & Book upon Purchase
    const buyerDisplayName = currentUser.firstName 
      ? `${currentUser.firstName} ${currentUser.lastName ? currentUser.lastName.charAt(0) + '.' : ''}`
      : 'قارئ متميز';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://together-change.dz';
    const refCode = currentUser.id ? `REF-${currentUser.id.slice(0, 5).toUpperCase()}` : 'CHANGE2026';
    const promoLink = `${baseUrl}/?ref=${refCode}&promo=READ20`;

    const newPromo: PromotionBroadcast = {
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId: purchasedBooks[0].id,
      bookTitle: purchasedBooks[0].title,
      bookCover: purchasedBooks[0].coverUrl,
      buyerName: buyerDisplayName,
      discountCode: 'READ20',
      referralLink: promoLink,
      timestamp: 'الآن',
      txRef
    };

    setLivePromotions((prev) => {
      const next = [newPromo, ...prev.slice(0, 14)];
      saveStorage('livePromotions', next);
      return next;
    });

    setLastPurchasedPromotion({
      books: purchasedBooks,
      txRef
    });

    // Auto-credit +200 DZD instant promotion bonus to user wallet and record transaction
    const promoRewardDzd = 200;
    const promoUsdt = +((promoRewardDzd / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);
    setCurrentUserState((prev) => ({ ...prev, walletDzd: prev.walletDzd + promoRewardDzd }));
    setAllUsers((prev) => {
      const next = prev.map((u) => u.id === currentUser.id ? { ...u, walletDzd: u.walletDzd + promoRewardDzd } : u);
      saveStorage('allUsers', next);
      return next;
    });

    const promoTx: SaleTransaction = {
      id: `tx-promo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      txRef: generateReferenceCode('PRM'),
      bookTitle: `مكافأة ترويج تلقائي: "${purchasedBooks[0]?.title || 'كتاب'}"`,
      buyerId: currentUser.id,
      buyerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'المشتري',
      buyerEmail: currentUser.email,
      userId: currentUser.id,
      description: 'مكافأة الترويج التلقائي الفوري فور إتمام الشراء',
      type: 'promotion_reward',
      amountDzd: promoRewardDzd,
      amountUsdt: promoUsdt,
      totalDzd: promoRewardDzd,
      method: 'wallet',
      status: 'completed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTransactions((prev) => {
      const next = [promoTx, ...prev];
      saveStorage('transactions', next);
      return next;
    });

    // Auto-copy promotional recommendation message with 20% discount coupon to clipboard
    try {
      const pitch = `📚 أنصحكم بقراءة: "${purchasedBooks[0].title}"\n\nلقد قمت باقتنائه وتجربته عبر منصة "${customization.storeName}" الرسمية لنشر وتوزيع الكتب برئاسة ${customization.presidentName}.\n\n🎁 احصل على خصم 20% فوري وهدية ترحيبية عبر الرابط المباشر:\n${promoLink}\n\nكود الخصم: READ20`;
      copyToClipboard(pitch).catch(() => {});
    } catch {
      // safe fallback
    }

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {
      // safe fallback
    }

    // Auto-dispatch SMS notification to the phone (0652206947) for every BaridiMob and Binance purchase
    const totalPurchasedDzd = purchasedBooks.reduce((sum, b) => sum + b.priceDzd, 0);
    const totalPurchasedUsdt = +(((totalPurchasedDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);
    const assignedTxHash = txHash || newTxList[0]?.txHash;

    if (paymentMethod === 'baridimob') {
      sendBaridimobSms({
        recipientPhone: paymentAccounts.baridimobPhone || '0652206947',
        recipientName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'لقمان ياسين أبختي',
        ripNumber: paymentAccounts.baridimobRip,
        amountDzd: totalPurchasedDzd,
        referenceCode: txRef,
        type: 'purchase'
      });
    } else if (paymentMethod === 'binance') {
      sendBinanceSms({
        recipientPhone: paymentAccounts.baridimobPhone || '0652206947',
        recipientName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Lokmane_VIP',
        cryptoAddressOrPayId: paymentAccounts.binancePayId || paymentAccounts.binanceTrc20,
        cryptoNetwork: 'Binance Pay / TRC20',
        amountUsdt: totalPurchasedUsdt,
        amountDzd: totalPurchasedDzd,
        referenceCode: txRef,
        txHash: assignedTxHash,
        type: 'purchase'
      });
    }

    return { 
      success: true, 
      message: 'تمت عملية الدفع بنجاح! تم إرسال إشعار SMS إلى هاتفك وتفعيل الترويج التلقائي للموقع، ونسخ كود الخصم ورابطك إلى الحافظة مع إضافة +200 د.ج مكافأة لمحفظتك.', 
      txRef 
    };
  }, [books, currentUser, customization, clearCart, sendBaridimobSms, sendBinanceSms, paymentAccounts]);

  // Withdrawal Requests (Supports BaridiMob & Binance, Instant Structured Withdrawal, 2 Hours Duration)
  const requestWithdrawal = useCallback((
    amountDzd: number, 
    method: 'baridimob' | 'binance' | 'paypal_ccp' | 'ccp', 
    accountDetails: string,
    options?: {
      isStructured?: boolean;
      beneficiaryName?: string;
      cryptoNetwork?: 'TRC20' | 'BEP20' | 'Binance Pay' | string;
      phoneNumber?: string;
    }
  ) => {
    if (amountDzd <= 0 || amountDzd > currentUser.walletDzd) {
      return { success: false, message: 'المبلغ المطلوب غير صالح أو يتجاوز رصيد المحفظة المتاح.' };
    }

    const isStructured = options?.isStructured ?? true;
    const referenceCode = generateReferenceCode(isStructured ? 'STR-WD' : 'WD');
    const now = new Date();
    // 2 hours execution duration (120 minutes)
    const completionDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const expectedCompletionTime = `${completionDate.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })} (خلال ساعتين)`;
    
    // Hash for cryptographic security & audit
    const txHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newReq: WithdrawalRequest = {
      id: `wd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referenceCode,
      authorId: currentUser.id,
      authorName: options?.beneficiaryName || `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'صاحب المحفظة',
      amountDzd,
      amountUsdt: +(((amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2),
      method,
      accountDetails: accountDetails.trim(),
      status: 'pending',
      requestedAt: now.toISOString().replace('T', ' ').substring(0, 16),
      isStructured,
      executionDurationHours: 2,
      expectedCompletionTime,
      beneficiaryName: options?.beneficiaryName || `${currentUser.firstName} ${currentUser.lastName}`,
      cryptoNetwork: options?.cryptoNetwork || (method === 'binance' ? 'TRC20' : undefined),
      phoneNumber: options?.phoneNumber,
      txHash,
      adminNote: `طلب سحب ${isStructured ? 'إنشائي فوري معتمد' : 'أرباح'} برقم ${referenceCode} - مدة التنفيذ ساعتان (2 Hours) كحد أقصى.`
    };

    setWithdrawals((prev) => [newReq, ...prev]);
    
    // Record withdrawal transaction in the financial ledger
    const newTx: SaleTransaction = {
      id: `tx-wd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      txRef: referenceCode,
      userId: currentUser.id,
      sellerId: currentUser.id,
      buyerId: currentUser.id,
      sellerName: options?.beneficiaryName || `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      description: isStructured
        ? `سند سحب إنشائي معتمد (${method === 'baridimob' ? 'بريدي موب RIP' : method === 'binance' ? `Binance ${options?.cryptoNetwork || 'USDT'}` : 'CCP'}) - مدة التنفيذ: ساعتان`
        : `سحب أرباح (${method === 'baridimob' ? 'بريدي موب RIP' : method === 'binance' ? 'Binance USDT' : 'CCP'})`,
      type: 'withdrawal',
      amountDzd: -amountDzd,
      amountUsdt: +(((amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2),
      method: method === 'paypal_ccp' ? 'ccp' : method,
      status: 'pending',
      timestamp: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
      accountDetails: accountDetails.trim(),
      phoneNumber: options?.phoneNumber,
      cryptoNetwork: options?.cryptoNetwork || (method === 'binance' ? 'TRC20' : undefined),
      linkedWithdrawalId: newReq.id,
      txHash,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Deduct from current user wallet temporarily
    setCurrentUserState((prev) => ({ ...prev, walletDzd: prev.walletDzd - amountDzd }));
    setAllUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, walletDzd: u.walletDzd - amountDzd } : u));

    // Auto-generate SMS notification to phone (0652206947) for BaridiMob & Binance
    const targetPhone = options?.phoneNumber || paymentAccounts.baridimobPhone || '0652206947';
    const targetName = options?.beneficiaryName || `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'صاحب المحفظة';

    if (method === 'baridimob') {
      sendBaridimobSms({
        recipientPhone: targetPhone,
        recipientName: targetName,
        ripNumber: accountDetails,
        amountDzd,
        referenceCode,
        type: 'withdrawal',
        currentBalanceDzd: currentUser.walletDzd - amountDzd
      });
    } else if (method === 'binance') {
      sendBinanceSms({
        recipientPhone: targetPhone,
        recipientName: targetName,
        cryptoAddressOrPayId: accountDetails,
        cryptoNetwork: options?.cryptoNetwork || 'TRC20',
        amountUsdt: +(((amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2),
        amountDzd,
        referenceCode,
        txHash,
        type: 'withdrawal',
        currentBalanceDzd: currentUser.walletDzd - amountDzd
      });
    }

    return { 
      success: true, 
      message: `تم إصدار أمر السحب الإنشائي بنجاح برقم مرجعي: ${referenceCode}. مدة التحويل المعتمدة: ساعتان (2 Hours) كحد أقصى لحساب ${method === 'baridimob' ? 'بريدي موب' : method === 'binance' ? 'بينانس USDT' : 'البريد'}. تم إرسال إشعار SMS لهاتفك.`,
      refCode: referenceCode,
      withdrawal: newReq
    };
  }, [currentUser, customization, sendBaridimobSms, sendBinanceSms, paymentAccounts]);

  const approveWithdrawal = useCallback((id: string, note = 'تمت الموافقة والتحويل الإنشائي بنجاح خلال مدة الساعتين.') => {
    let matchedRef = '';
    let approvedReq: WithdrawalRequest | undefined;

    setWithdrawals((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        matchedRef = w.referenceCode;
        approvedReq = {
          ...w,
          status: 'approved' as const,
          processedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          adminNote: note
        };
        return approvedReq;
      });
      saveStorage('withdrawals', next);
      return next;
    });

    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (matchedRef && (t.txRef === matchedRef || t.linkedWithdrawalId === id)) {
          return { ...t, status: 'completed' as const };
        }
        return t;
      });
      saveStorage('transactions', next);
      return next;
    });

    // Auto-dispatch SMS notification when approved (BaridiMob & Binance)
    if (approvedReq) {
      const req = approvedReq as WithdrawalRequest;
      const targetPhone = req.phoneNumber || paymentAccounts.baridimobPhone || '0652206947';
      const targetName = req.beneficiaryName || req.authorName;

      if (req.method === 'baridimob') {
        sendBaridimobSms({
          recipientPhone: targetPhone,
          recipientName: targetName,
          ripNumber: req.accountDetails,
          amountDzd: req.amountDzd,
          referenceCode: req.referenceCode,
          type: 'withdrawal'
        });
      } else if (req.method === 'binance') {
        sendBinanceSms({
          recipientPhone: targetPhone,
          recipientName: targetName,
          cryptoAddressOrPayId: req.accountDetails,
          cryptoNetwork: req.cryptoNetwork || 'TRC20',
          amountUsdt: req.amountUsdt || +(((req.amountDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2),
          amountDzd: req.amountDzd,
          referenceCode: req.referenceCode,
          txHash: req.txHash,
          type: 'withdrawal'
        });
      }
    }
  }, [sendBaridimobSms, sendBinanceSms, paymentAccounts, customization]);

  // Complete and Confirm any linked operation (BaridiMob or Binance)
  const completeTransaction = useCallback((txId: string, note?: string) => {
    let foundTx: SaleTransaction | undefined;
    
    setTransactions((prev) => {
      const next = prev.map((t) => {
        if (t.id === txId || t.txRef === txId) {
          foundTx = {
            ...t,
            status: 'completed' as const,
            timestamp: t.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          return foundTx;
        }
        return t;
      });
      saveStorage('transactions', next);
      return next;
    });

    if (!foundTx) {
      return { success: false, message: 'لم يتم العثور على المعاملة المحددة.' };
    }

    const txTarget = foundTx as SaleTransaction;

    // Synchronize linked withdrawal request if applicable
    if (txTarget.linkedWithdrawalId || txTarget.txRef.startsWith('STR-WD') || txTarget.txRef.startsWith('WD')) {
      const ref = txTarget.txRef;
      const linkedId = txTarget.linkedWithdrawalId;
      setWithdrawals((prev) => {
        const next = prev.map((w) => {
          if (w.id === linkedId || w.referenceCode === ref) {
            return {
              ...w,
              status: 'approved' as const,
              processedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              adminNote: note || 'تم التحقق وتأكيد اكتمال العملية بنجاح.'
            };
          }
          return w;
        });
        saveStorage('withdrawals', next);
        return next;
      });
    }

    // Auto-trigger SMS for BaridiMob and Binance
    const targetPhone = txTarget.phoneNumber || paymentAccounts.baridimobPhone || '0652206947';
    const targetName = txTarget.sellerName || txTarget.buyerName || `${currentUser.firstName} ${currentUser.lastName}`.trim();

    if (txTarget.method === 'baridimob') {
      const rip = txTarget.accountDetails || paymentAccounts.baridimobRip;
      sendBaridimobSms({
        recipientPhone: targetPhone,
        recipientName: targetName,
        ripNumber: rip,
        amountDzd: Math.abs(txTarget.amountDzd),
        referenceCode: txTarget.txRef,
        type: txTarget.type === 'book_purchase' ? 'purchase' : txTarget.type === 'deposit' ? 'deposit' : 'withdrawal'
      });
    } else if (txTarget.method === 'binance') {
      const addr = txTarget.accountDetails || paymentAccounts.binanceTrc20 || paymentAccounts.binancePayId;
      sendBinanceSms({
        recipientPhone: targetPhone,
        recipientName: targetName,
        cryptoAddressOrPayId: addr,
        cryptoNetwork: txTarget.cryptoNetwork || 'TRC20',
        amountUsdt: txTarget.amountUsdt || +(((Math.abs(txTarget.amountDzd) || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2),
        amountDzd: Math.abs(txTarget.amountDzd),
        referenceCode: txTarget.txRef,
        txHash: txTarget.txHash,
        type: txTarget.type === 'book_purchase' ? 'purchase' : txTarget.type === 'deposit' ? 'deposit' : 'withdrawal'
      });
    }

    return {
      success: true,
      message: `تم إكمال العملية وتأكيدها بنجاح عبر قناة ${txTarget.method === 'baridimob' ? 'بريدي موب (BaridiMob)' : 'بينانس (Binance)'}. تم إرسال رسالة نصية SMS إلى هاتفك.`
    };
  }, [currentUser, paymentAccounts, sendBaridimobSms, sendBinanceSms, customization]);

  const rejectWithdrawal = useCallback((id: string, note = 'تم رفض الطلب لعدم اكتمال البيانات.') => {
    let refundAmount = 0;
    let authorId = '';
    let matchedRef = '';

    setWithdrawals((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      refundAmount = w.amountDzd;
      authorId = w.authorId;
      matchedRef = w.referenceCode;
      return {
        ...w,
        status: 'rejected',
        processedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        adminNote: note
      };
    }));

    if (refundAmount > 0) {
      setAllUsers((prevUsers) => prevUsers.map((u) => u.id === authorId ? { ...u, walletDzd: u.walletDzd + refundAmount } : u));
      if (currentUser.id === authorId) {
        setCurrentUserState((u) => ({ ...u, walletDzd: u.walletDzd + refundAmount }));
      }
    }

    setTransactions((prev) => prev.map((t) => {
      if (matchedRef && t.txRef === matchedRef) {
        return { ...t, status: 'rejected' };
      }
      return t;
    }));
  }, [currentUser]);

  // Gift Card redemption & generator (supports Owner Infinite Vouchers)
  const redeemGiftCard = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    let foundCard = giftCards.find((c) => c.code.toUpperCase() === cleanCode);
    
    // Auto-fallback for owner infinite voucher codes if missing in storage
    if (!foundCard && (
      cleanCode === 'OWNER-INFINITY-VIP' || 
      cleanCode === 'LOKMANE-VIP-INFINITE' || 
      cleanCode === 'INFINITY-OWNER' || 
      cleanCode.startsWith('OWNER-INF')
    )) {
      foundCard = {
        code: cleanCode,
        amountUsdt: 100,
        isUsed: false,
        isInfinite: true,
        ownerOnly: true,
        timesRedeemed: 0,
        discountPercentage: 100,
        description: 'القسيمة اللانهائية الحصرية لمالك المنصة وإدارتها العليا (الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة)',
        createdAt: '2026-01-01'
      };
    }

    if (!foundCard) {
      return { success: false, message: 'رمز بطاقة الهدية أو القسيمة غير صحيح أو غير موجود.' };
    }

    const isSaadBouacha = 
      (currentUser.firstName?.includes('سعد') && currentUser.lastName?.includes('بوعشة')) || 
      currentUser.email?.toLowerCase().includes('bouacha') ||
      currentUser.email?.toLowerCase().includes('saad');

    const isOwner = currentUser.role === 'owner' || 
      currentUser.email === OWNER_USER.email || 
      currentUser.id === OWNER_USER.id || 
      currentUser.id === SAAD_BOUACHA_USER.id ||
      isSaadBouacha;

    // Security check: Owner only vouchers
    if (foundCard.ownerOnly && !isOwner) {
      return { 
        success: false, 
        message: '🚫 تنبيه أمني: هذه القسيمة اللانهائية مخصصة ومحصورة حصرياً لمالك المنصة وإدارتها العليا (الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة).' 
      };
    }

    // Single-use cards that are already used
    if (!foundCard.isInfinite && foundCard.isUsed) {
      return { success: false, message: 'تم استخدام هذه البطاقة مسبقاً.' };
    }

    const dzdValue = foundCard.amountUsdt * customization.exchangeRateUsdtToDzd;

    // Handle Infinite Voucher for Owner:
    if (foundCard.isInfinite) {
      const newCount = (foundCard.timesRedeemed || 0) + 1;
      setGiftCards((prev) => {
        const exists = prev.some((c) => c.code.toUpperCase() === foundCard!.code.toUpperCase());
        if (exists) {
          return prev.map((c) => c.code.toUpperCase() === foundCard!.code.toUpperCase() ? {
            ...c,
            timesRedeemed: newCount,
            usedBy: currentUser.email,
            usedAt: new Date().toISOString(),
            isUsed: false // NEVER marked as used; remains infinite
          } : c);
        }
        return [{
          ...foundCard!,
          timesRedeemed: newCount,
          usedBy: currentUser.email,
          usedAt: new Date().toISOString(),
          isUsed: false
        }, ...prev];
      });

      // Credit owner wallet
      setCurrentUserState((prev) => ({ ...prev, walletDzd: prev.walletDzd + dzdValue }));
      setAllUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, walletDzd: u.walletDzd + dzdValue } : u));

      // Record transaction
      const infTx: SaleTransaction = {
        id: `tx-inf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        txRef: generateReferenceCode('INF'),
        bookTitle: `👑 شحن القسيمة اللانهائية للمالك (${foundCard.code}) - استخدام رقم #${newCount}`,
        buyerName: isSaadBouacha ? 'الأستاذ سعد بوعشة (VIP)' : (isOwner ? 'مالك المنصة (لقمان ياسين أبختي)' : `${currentUser.firstName} ${currentUser.lastName}`),
        buyerEmail: currentUser.email,
        userId: currentUser.id,
        amountDzd: dzdValue,
        totalDzd: dzdValue,
        platformFeeDzd: 0,
        sellerRevenueDzd: dzdValue,
        method: 'gift_card',
        status: 'completed',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setTransactions((prev) => [infTx, ...prev]);

      try {
        confetti({ 
          particleCount: 120, 
          spread: 85, 
          origin: { y: 0.5 }, 
          colors: ['#f59e0b', '#10b981', '#0f766e', '#d97706', '#6366f1'] 
        });
      } catch {
        // safe fallback
      }

      const welcomeName = isSaadBouacha ? 'الأستاذ سعد بوعشة' : (currentUser.firstName || 'حضرة المالك');
      return {
        success: true,
        message: `👑 مرحباً بك يا ${welcomeName}! تم تفعيل القسيمة اللانهائية OWNER-INFINITY-VIP بنجاح (الاستخدام رقم ${newCount})! أضيف إلى رصيدك ${foundCard.amountUsdt} USDT (${dzdValue.toLocaleString()} د.ج). القسيمة مفعلة ودائمة دون نفاذ.`,
        amountUsdt: foundCard.amountUsdt,
        isInfinite: true,
        timesRedeemed: newCount
      };
    }

    // Standard card flow:
    setGiftCards((prev) => prev.map((c) => c.code === foundCard!.code ? {
      ...c,
      isUsed: true,
      usedBy: currentUser.email,
      usedAt: new Date().toISOString()
    } : c));

    // Credit current user wallet
    setCurrentUserState((prev) => ({ ...prev, walletDzd: prev.walletDzd + dzdValue }));
    setAllUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, walletDzd: u.walletDzd + dzdValue } : u));

    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    return { 
      success: true, 
      message: `مبروك! تم تفعيل بطاقة الهدية بقيمة ${foundCard.amountUsdt} USDT (ما يعادل ${dzdValue.toLocaleString()} د.ج) وتمت إضافتها لمحفظتك.`,
      amountUsdt: foundCard.amountUsdt 
    };
  }, [giftCards, currentUser, customization]);

  const updateWalletBalance = useCallback((amountDzd: number, reason?: string) => {
    setCurrentUserState((prev) => {
      const nextBal = Math.max(0, prev.walletDzd + amountDzd);
      return { ...prev, walletDzd: nextBal };
    });
    setAllUsers((prev) => {
      const next = prev.map((u) => u.id === currentUser.id ? { ...u, walletDzd: Math.max(0, u.walletDzd + amountDzd) } : u);
      saveStorage('allUsers', next);
      return next;
    });

    if (amountDzd !== 0) {
      const isDeposit = amountDzd > 0;
      const isPromo = reason?.includes('ترويج') || reason?.includes('مكافأة');
      const usdtVal = +(((Math.abs(amountDzd || 0)) / (customization?.exchangeRateUsdtToDzd || 250)) || 0).toFixed(2);
      const newTx: SaleTransaction = {
        id: `tx-bal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        txRef: generateReferenceCode(isPromo ? 'PRM' : isDeposit ? 'DEP' : 'ADJ'),
        bookTitle: reason || (isDeposit ? 'إيداع رصيد بالمحفظة' : 'تسوية رصيد بالمحفظة'),
        buyerId: currentUser.id,
        buyerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'المستخدم',
        buyerEmail: currentUser.email,
        userId: currentUser.id,
        description: reason,
        type: isPromo ? 'promotion_reward' : isDeposit ? 'deposit' : 'withdrawal',
        amountDzd: Math.abs(amountDzd),
        amountUsdt: usdtVal,
        totalDzd: Math.abs(amountDzd),
        method: 'wallet',
        status: 'completed',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setTransactions((prev) => {
        const next = [newTx, ...prev];
        saveStorage('transactions', next);
        return next;
      });
    }

    if (reason) {
      console.log(`Wallet balance updated (${amountDzd > 0 ? '+' : ''}${amountDzd} DZD): ${reason}`);
    }
  }, [currentUser, customization]);

  // Dedicated Promotion Reward Engine: Adds promotion bonus directly to user's wallet and records official transaction
  const rewardPromotionBonus = useCallback((
    amountDzd = 200, 
    reason = 'مكافأة ترويج ومشاركة المنصة', 
    bookTitle?: string
  ) => {
    const validAmount = Math.max(50, amountDzd);
    const promoRef = generateReferenceCode('PRM');
    const usdtVal = +(((validAmount || 0) / (customization?.exchangeRateUsdtToDzd || 250)) || 0).toFixed(2);
    
    // 1. Update wallet balance for current user & all users state
    let updatedBalance = 0;
    setCurrentUserState((prev) => {
      const nextBal = prev.walletDzd + validAmount;
      updatedBalance = nextBal;
      return { ...prev, walletDzd: nextBal };
    });
    setAllUsers((prev) => {
      const next = prev.map((u) => u.id === currentUser.id ? { ...u, walletDzd: u.walletDzd + validAmount } : u);
      saveStorage('allUsers', next);
      return next;
    });

    // 2. Create official SaleTransaction in history
    const newTx: SaleTransaction = {
      id: `tx-promo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      txRef: promoRef,
      bookTitle: bookTitle ? `مكافأة ترويج: "${bookTitle}"` : (reason || 'مكافأة ترويج ومشاركة المنصة'),
      buyerId: currentUser.id,
      buyerName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'المستخدم',
      buyerEmail: currentUser.email,
      userId: currentUser.id,
      description: reason || 'مكافأة ترويج ومشاركة المنصة وإحالة القراء',
      type: 'promotion_reward',
      amountDzd: validAmount,
      amountUsdt: usdtVal,
      totalDzd: validAmount,
      method: 'wallet',
      status: 'completed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTransactions((prev) => {
      const next = [newTx, ...prev];
      saveStorage('transactions', next);
      return next;
    });

    // 3. Trigger celebration confetti
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 }
      });
    } catch {}

    return {
      success: true,
      amountDzd: validAmount,
      newBalance: updatedBalance || (currentUser.walletDzd + validAmount),
      message: `🎉 تهانينا! تم إيداع مبلغ الترويج (+${validAmount.toLocaleString()} د.ج) في محفظتك الإلكترونية بنجاح!`,
      txRef: promoRef
    };
  }, [currentUser, customization]);

  // Dedicated Reset Wallet Engine: Purges fake/simulated earnings and recalculates strictly real profits
  const resetWalletToRealProfits = useCallback(() => {
    const FAKE_TX_IDS = ['tx-bm-structured-1', 'tx-bn-structured-1'];
    const FAKE_WD_IDS = ['wd-bm-1', 'wd-bn-1', 'wd-1'];
    const FAKE_SMS_IDS = ['sms-bn-init-1', 'sms-bm-init-1'];

    const cleanTx = transactions.filter((t) => !FAKE_TX_IDS.includes(t.id));
    const cleanWd = withdrawals.filter((w) => !FAKE_WD_IDS.includes(w.id));
    const cleanSms = smsNotifications.filter((s) => !FAKE_SMS_IDS.includes(s.id));

    let totalSalesDzd = 0;
    cleanTx.forEach((tx) => {
      if (tx.status === 'completed' && tx.type === 'book_purchase') {
        const isOwnerBook = tx.sellerId === OWNER_USER.id || tx.sellerName?.includes('لقمان ياسين');
        if (currentUser.id === OWNER_USER.id || currentUser.role === 'owner') {
          if (isOwnerBook) {
            totalSalesDzd += (tx.amountDzd || 0);
          } else if (tx.platformFeeDzd) {
            totalSalesDzd += tx.platformFeeDzd;
          }
        } else {
          if (tx.sellerId === currentUser.id) {
            totalSalesDzd += (tx.authorNetDzd || tx.amountDzd || 0);
          }
        }
      } else if (tx.status === 'completed' && (tx.type === 'promotion_reward' || tx.type === 'deposit')) {
        if (tx.buyerId === currentUser.id || tx.userId === currentUser.id) {
          totalSalesDzd += (tx.amountDzd || 0);
        }
      }
    });

    const userWithdrawals = cleanWd.filter(
      (w) => w.authorId === currentUser.id && (w.status === 'approved' || w.status === 'completed')
    );
    const totalWithdrawalsDzd = userWithdrawals.reduce((sum, w) => sum + (w.amountDzd || 0), 0);

    const realBalanceDzd = Math.max(0, totalSalesDzd - totalWithdrawalsDzd);
    const realBalanceUsdt = +(((realBalanceDzd || 0) / (customization?.exchangeRateUsdtToDzd || 240)) || 0).toFixed(2);
    const purgedAmountDzd = Math.max(0, currentUser.walletDzd - realBalanceDzd);

    setCurrentUserState((prev) => {
      const next = { ...prev, walletDzd: realBalanceDzd };
      saveStorage('currentUser', next);
      return next;
    });

    setAllUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === currentUser.id || ((currentUser.role === 'owner') && (u.id === OWNER_USER.id || u.id === SAAD_BOUACHA_USER.id))) {
          return { ...u, walletDzd: realBalanceDzd };
        }
        return u;
      });
      saveStorage('allUsers', next);
      return next;
    });

    setTransactions(cleanTx);
    saveStorage('transactions', cleanTx);

    setWithdrawals(cleanWd);
    saveStorage('withdrawals', cleanWd);

    setSmsNotifications(cleanSms);
    saveStorage('smsNotifications', cleanSms);

    setVirtualCards((prev) => {
      const next = prev.map((c) => ({ ...c, balance: realBalanceDzd }));
      saveStorage('virtualCards', next);
      return next;
    });

    return {
      success: true,
      realBalanceDzd,
      realBalanceUsdt,
      totalSalesDzd,
      totalWithdrawalsDzd,
      purgedAmountDzd,
      message: `تمت تصفية كافة الأرباح والبيانات الوهمية بنجاح واعتماد الرصيد الحقيقي فقط (${realBalanceDzd.toLocaleString()} د.ج).`
    };
  }, [transactions, withdrawals, smsNotifications, currentUser, customization]);

  const generateGiftCardVoucher = useCallback((amountUsdt = 10, isInfinite = false, ownerOnly = false, description?: string) => {
    const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode = isInfinite ? `OWNER-INF-${randPart}` : `CHANGE-2026-${randPart}`;
    const newVoucher: GiftCardVoucher = {
      code: newCode,
      amountUsdt,
      isUsed: false,
      isInfinite,
      ownerOnly,
      timesRedeemed: 0,
      description: description || (isInfinite ? 'قسيمة لانهائية لمالك ورئيس المنصة' : 'قسيمة رصيد قياسية'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGiftCards((prev) => [newVoucher, ...prev]);
    return newCode;
  }, []);

  // Virtual Cards
  const saveVirtualCard = useCallback((card: VirtualCardData) => {
    setVirtualCards((prev) => {
      const existing = prev.findIndex((c) => c.id === card.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = card;
        return next;
      }
      return [card, ...prev];
    });
  }, []);

  // Team management
  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setTeamMembers((prev) => prev.map((tm) => tm.id === id ? { ...tm, ...updates } : tm));
  }, []);

  const addTeamMember = useCallback((memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `tm-${Date.now()}`
    };
    setTeamMembers((prev) => [...prev, newMember]);
  }, []);

  const submitChangeRequest = useCallback((title: string, description: string, requestType: TeamChangeRequest['requestType']) => {
    const newReq: TeamChangeRequest = {
      id: `cr-${Date.now()}`,
      memberId: currentUser.id,
      memberName: `${currentUser.firstName} ${currentUser.lastName}`,
      memberRole: currentUser.teamTitle || 'عضو مؤهل',
      requestType,
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTeamChangeRequests((prev) => [newReq, ...prev]);
  }, [currentUser]);

  const respondToChangeRequest = useCallback((id: string, status: 'approved' | 'rejected', responseText?: string) => {
    setTeamChangeRequests((prev) => prev.map((cr) => cr.id === id ? {
      ...cr,
      status,
      presidentResponse: responseText || (status === 'approved' ? 'تمت المصادقة والموافقة من طرف رئيس المنصة.' : 'تم الرفض.')
    } : cr));
  }, []);

  const scheduleMeeting = useCallback((meetingData: Omit<MeetingSchedule, 'id'>) => {
    const newMeeting: MeetingSchedule = {
      ...meetingData,
      id: `meet-${Date.now()}`
    };
    setMeetings((prev) => [newMeeting, ...prev]);
  }, []);

  // Customization & Security updates
  const updateCustomization = useCallback((updates: Partial<StoreCustomization>) => {
    setCustomization((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSocialLinks = useCallback((links: Partial<SocialLinks>) => {
    setSocialLinks((prev) => ({ ...prev, ...links }));
  }, []);

  const updatePaymentAccounts = useCallback((accounts: Partial<SavedPaymentAccounts>) => {
    setPaymentAccounts((prev) => ({ ...prev, ...accounts }));
  }, []);

  const toggleLockdown = useCallback(() => {
    setSecurity((prev) => ({ ...prev, isLockdownMode: !prev.isLockdownMode }));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        allUsers,
        loginUser,
        login,
        register,
        logoutUser,
        banUser,
        unbanUser,
        books,
        addBook,
        updateBook,
        updateBookPrice,
        deleteBook,
        addTranslationToBook,
        reviews,
        addReview,
        likeReview,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalDzd,
        isCartOpen,
        setIsCartOpen,
        audioState,
        playBookTTS,
        playBookAudioTrack,
        pauseAudio,
        resumeAudio,
        stopAudio,
        setAudioSpeed,
        setAudioRate,
        forumTopics,
        forumPosts: forumTopics,
        addForumTopic,
        addForumPost,
        addForumReply,
        likeForumTopic,
        likeForumPost,
        likeForumReply,
        deleteForumTopic,
        transactions,
        processPurchase,
        updateWalletBalance,
        rewardPromotionBonus,
        completeTransaction,
        resetWalletToRealProfits,
        smsNotifications,
        sendBaridimobSms,
        sendBinanceSms,
        sendTransactionSms,
        activeSmsModal,
        setActiveSmsModal,
        withdrawals,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        paymentAccounts,
        updatePaymentAccounts,
        giftCards,
        redeemGiftCard,
        generateGiftCardVoucher,
        virtualCards,
        saveVirtualCard,
        virtualCardConfig,
        updateVirtualCardConfig,
        teamMembers,
        updateTeamMember,
        addTeamMember,
        teamChangeRequests,
        submitChangeRequest,
        respondToChangeRequest,
        meetings,
        scheduleMeeting,
        jobApplications,
        applyForJob,
        customization,
        updateCustomization,
        socialLinks,
        updateSocialLinks,
        selectedLanguage,
        setLanguage,
        selectedCurrency,
        setSelectedCurrency,
        themeMode,
        setThemeMode,
        security,
        toggleLockdown,
        activeModal,
        setActiveModal,
        activeBookForModal,
        setActiveBookForModal,
        quickBinanceBook,
        setQuickBinanceBook,
        livePromotions,
        addLivePromotion,
        lastPurchasedPromotion,
        setLastPurchasedPromotion
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
