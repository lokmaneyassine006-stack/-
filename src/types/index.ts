export type UserRole = 'owner' | 'team_member' | 'regular_user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: string;
  role: UserRole;
  teamTitle?: string;
  isVerified: boolean;
  joinedDate: string;
  walletDzd: number;
  isBanned: boolean;
  bio?: string;
  competenceScore?: number;
}

export interface BookTranslation {
  langCode: string;
  langName: string;
  title: string;
  description: string;
  sampleContent: string;
}

export interface InternationalLicense {
  type: 'All-Rights-Reserved' | 'CC-BY-NC-ND' | 'CC-BY-SA' | 'Open-Access' | 'GNU-FDL';
  registrationId: string;
  protectionYear: number;
  jurisdiction: string;
  isVerifiedBadge: boolean;
}

export interface AudioChapter {
  id: string;
  title: string;
  durationSeconds: number;
  url?: string;
  sampleText?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  authorId: string;
  publisher: string;
  isbn: string;
  description: string;
  category: string;
  priceDzd: number;
  coverUrl: string;
  isCustom: boolean;
  isOwnerBook: boolean;
  rating: number;
  reviewCount: number;
  pageCount: number;
  language: string;
  translations: BookTranslation[];
  wordDocContent?: string;
  pdfUrl?: string;
  audioTrack?: {
    hasAudio: boolean;
    audioUrl?: string;
    format?: string;
    duration: string;
    chapters: AudioChapter[];
  };
  license: InternationalLicense;
  salesCount: number;
  downloadsCount: number;
  stockCount?: number;
  lowStockThreshold?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  rating: number;
  text: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  isTopReviewerReward?: boolean;
}

export interface CartItem {
  bookId: string;
  quantity: number;
  format: 'digital' | 'audio' | 'bundle';
}

export interface ForumReply {
  id: string;
  topicId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  bookId?: string;
  bookTitle?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  category: string;
  likes: number;
  likedBy: string[];
  replies: ForumReply[];
  createdAt: string;
  isPinned?: boolean;
}

export type ForumPost = ForumTopic;

export interface SaleTransaction {
  id: string;
  txRef: string;
  bookId?: string;
  bookTitle?: string;
  buyerId?: string;
  buyerName?: string;
  buyerEmail?: string;
  sellerId?: string;
  sellerName?: string;
  userId?: string;
  description?: string;
  type?: 'book_purchase' | 'deposit' | 'withdrawal' | 'gift_redeem' | 'commission_payout' | 'promotion_reward';
  amountDzd: number;
  amountUsdt?: number;
  totalDzd?: number;
  platformFeeDzd?: number;
  authorNetDzd?: number;
  sellerRevenueDzd?: number;
  method: 'binance' | 'baridimob' | 'cib_ccp' | 'gift_card' | 'wallet' | 'ccp';
  status: 'completed' | 'pending' | 'rejected';
  timestamp?: string;
  date?: string;
  txHash?: string;
  linkedWithdrawalId?: string;
  phoneNumber?: string;
  accountDetails?: string;
  cryptoNetwork?: string;
}

export interface BaridimobSmsNotification {
  id: string;
  referenceCode: string;
  type: 'withdrawal' | 'transfer' | 'deposit' | 'purchase';
  channel?: 'baridimob' | 'binance';
  recipientPhone: string;
  recipientName: string;
  ripNumber?: string;
  cryptoAddressOrPayId?: string;
  cryptoNetwork?: string;
  amountDzd: number;
  amountUsdt?: number;
  currentBalanceDzd?: number;
  messageText: string;
  sentAt: string;
  status: 'sent' | 'delivered';
  senderId: string; // 'BARIDIMOB' | 'BINANCE'
  txHash?: string;
  truecallerVerified?: boolean;
  truecallerCallerId?: string;
  truecallerNumber?: string;
  truecallerCategory?: string;
}

export interface WithdrawalRequest {
  id: string;
  referenceCode: string;
  authorId: string;
  authorName: string;
  amountDzd: number;
  amountUsdt: number;
  method: 'baridimob' | 'binance' | 'paypal_ccp' | 'ccp';
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  isStructured?: boolean;
  executionDurationHours?: number; // مدة السحب: ساعتان
  expectedCompletionTime?: string; // وقت إتمام التحويل المتوقع
  beneficiaryName?: string;
  cryptoNetwork?: 'TRC20' | 'BEP20' | 'Binance Pay' | string;
  phoneNumber?: string;
  txHash?: string;
}

export interface VirtualCardData {
  id: string;
  holderName: string;
  cardNumber: string;
  expiry: string;
  balance: number;
  currency: string;
  countryCode: string;
  countryName: string;
  cardType: 'membership' | 'gift' | 'vip';
  bgGradient: string;
  logoText: string;
  avatarUrl: string;
  globalChip: boolean;
  cvv: string;
}

export interface VirtualCardConfig {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  backgroundGradient: string;
  showChip: boolean;
  showQr: boolean;
  tier: 'VIP Founder' | 'Platinum Global' | 'Gold Reader' | 'Executive';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitleAr?: string;
  bio: string;
  cvSummary?: string;
  department?: string;
  competenceScore?: number;
  ratingScore?: number;
  joinDate?: string;
  joinedDate?: string;
  avatar: string;
  permissions?: string[];
  isPresident?: boolean;
  isTopReviewerReward?: boolean;
  status?: 'active' | 'on_leave' | 'candidate';
}

export interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  experienceYears: string;
  cvSummary: string;
  status: 'pending' | 'reviewed' | 'hired';
  appliedDate: string;
}

export interface TeamChangeRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  requestType: 'book_price_edit' | 'new_category' | 'feature_toggle' | 'promotion_request';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  presidentResponse?: string;
}

export interface MeetingSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes?: number;
  hostName: string;
  agenda?: string;
  meetUrl?: string;
  meetingLink?: string;
  attendeesCount?: number;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

export interface StoreCustomization {
  storeName: string;
  storeTagline?: string;
  storeSubtitle?: string;
  bannerNotice?: string;
  showBanner?: boolean;
  primaryColor?: string;
  themeMode?: 'light' | 'dark' | 'sepia' | 'auto';
  exchangeRateUsdtToDzd: number;
  platformCommissionPercent: number;
  presidentName: string;
  mandatoryOwnerBookPurchaseForPromotion?: boolean;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  twitterX: string;
  youtube: string;
  linkedin: string;
  telegram: string;
  whatsapp: string;
  github: string;
  personalSite: string;
}

export interface SavedPaymentAccounts {
  baridimobRip: string;
  baridimobHolder: string;
  baridimobPhone?: string;
  truecallerNumber?: string;
  truecallerVerified?: boolean;
  truecallerCallerIdName?: string;
  autoSendSmsOnTransactions?: boolean;
  binanceTrc20: string;
  binanceBep20: string;
  binanceErc20: string;
  binancePayId: string;
  paypalEmail: string;
  ccpAccount: string;
}

export interface GiftCardVoucher {
  code: string;
  amountUsdt: number;
  isUsed: boolean;
  isInfinite?: boolean;
  ownerOnly?: boolean;
  timesRedeemed?: number;
  description?: string;
  discountPercentage?: number;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface SecurityState {
  httpsActive: boolean;
  rateLimitPerMinute: number;
  xssSanitizerActive: boolean;
  dataIntegrityHash: string;
  isLockdownMode: boolean;
  bannedUserIds: string[];
  requestCountLastMinute: number;
}

export interface PromotionBroadcast {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  buyerName: string;
  discountCode: string;
  referralLink: string;
  timestamp: string;
  txRef?: string;
}

export interface PublisherMessage {
  id: string;
  bookId: string;
  bookTitle: string;
  publisherName: string;
  senderId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  category: 'rights_inquiry' | 'bulk_order' | 'manuscript_submission' | 'reader_question' | 'press_interview' | 'distribution';
  subject: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'replied';
  publisherReply?: {
    text: string;
    repliedAt: string;
    responderName: string;
    responderRole: string;
  };
}

export interface PublisherProfile {
  name: string;
  licenseNumber: string;
  country: string;
  city: string;
  address: string;
  officialEmail: string;
  officialPhone: string;
  whatsappNumber: string;
  contactPerson: string;
  contactPersonRole: string;
  avgResponseHours: number;
  publishingGenres: string[];
  submissionOpen: boolean;
  aboutPublisher: string;
}
