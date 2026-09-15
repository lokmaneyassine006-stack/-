import { Book, User, Review, ForumTopic, TeamMember, VirtualCardData, GiftCardVoucher, PublisherMessage, PublisherProfile } from '../types';

export const OWNER_USER: User = {
  id: 'user-lokmane-owner',
  email: 'lokmaneyassine006@gmail.com',
  firstName: 'لقمان ياسين',
  lastName: 'أبختي',
  birthDate: '1998-05-14',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  role: 'owner',
  teamTitle: 'مؤسس ورئيس مجلس إدارة منصة معا نحو التغيير',
  isVerified: true,
  joinedDate: '2024-01-01',
  walletDzd: 3600, // أرباح حقيقية 100% من مبيعات كتاب "معا نحو التغيير" (عمليتي شراء بـ 1800 د.ج)
  isBanned: false,
  bio: 'مؤلف وباحث ومؤسس منصة ومكتبة "معا نحو التغيير". شغوف بنشر المعرفة وبناء الإنسان وتطوير أدوات التعلم الرقمي والصوتي.',
  competenceScore: 100,
};

export const SAAD_BOUACHA_USER: User = {
  id: 'user-saad-bouacha',
  email: 'saad.bouacha@change.dz',
  firstName: 'سعد',
  lastName: 'بوعشة',
  birthDate: '1996-03-22',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  role: 'owner',
  teamTitle: 'شريك استراتيجي وعضو الإدارة العليا (VIP)',
  isVerified: true,
  joinedDate: '2024-01-01',
  walletDzd: 3600,
  isBanned: false,
  bio: 'شريك استراتيجي وعضو الإدارة العليا في منصة "معا نحو التغيير". معتمد رسمياً للاستفادة الكاملة من القسيمة اللانهائية OWNER-INFINITY-VIP.',
  competenceScore: 100,
};

export const DEMO_USERS: User[] = [
  OWNER_USER,
  SAAD_BOUACHA_USER,
  {
    id: 'user-2',
    email: 'amine.ben@change.dz',
    firstName: 'أمين',
    lastName: 'بلمختار',
    birthDate: '1995-11-20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    role: 'team_member',
    teamTitle: 'رئيس تحرير ومراجع أدبي معتمد',
    isVerified: true,
    joinedDate: '2024-03-15',
    walletDzd: 0,
    isBanned: false,
    bio: 'ناقد أدبي ومترجم، مهتم بفلسفة التغيير والدراسات الإنسانية المعاصرة.',
    competenceScore: 94,
  },
  {
    id: 'user-3',
    email: 'sarah.k@change.dz',
    firstName: 'سارة',
    lastName: 'القاسمي',
    birthDate: '1997-08-10',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    role: 'team_member',
    teamTitle: 'مسؤولة العلاقات الثقافية وتدقيق الحقوق',
    isVerified: true,
    joinedDate: '2024-06-01',
    walletDzd: 0,
    isBanned: false,
    bio: 'باحثة في حقوق الملكية الفكرية وتطوير المحتوى المعرفي الرقمي.',
    competenceScore: 91,
  },
  {
    id: 'user-4',
    email: 'karim.reader@gmail.com',
    firstName: 'كريم',
    lastName: 'الجزائري',
    birthDate: '2001-02-14',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    role: 'regular_user',
    isVerified: true,
    joinedDate: '2025-01-10',
    walletDzd: 0,
    isBanned: false,
    bio: 'قارئ نهم ومحب للكتب الصوتية وعلوم التنمية والنهضة.',
  },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-owner-1',
    title: 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
    author: 'لقمان ياسين أبختي',
    authorId: 'user-lokmane-owner',
    publisher: 'دار النشر والتوزيع - معا نحو التغيير',
    isbn: '978-9931-8842-1-0',
    description: 'كتاب استراتيجي شامل يضع الركائز الأساسية للنهضة الفردية والمجتمعية، ويستعرض مسارات التغيير الإيجابي، والتحرر من قيود التردد إلى فضاءات الإنجاز الفعلي والريادة المعرفية.',
    category: 'تنمية وتغيير',
    priceDzd: 1800,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    isCustom: true,
    isOwnerBook: true,
    rating: 4.9,
    reviewCount: 38,
    pageCount: 320,
    language: 'العربية',
    translations: [
      {
        langCode: 'en',
        langName: 'English',
        title: 'Together Towards Change: Philosophy of Renaissance',
        description: 'A transformative manifesto exploring modern human development, purposeful leadership, and actionable personal breakthroughs.',
        sampleContent: 'Chapter 1: The Anatomy of Conscious Change. Every genuine revolution begins in the mind of the individual before transforming societal structures...'
      },
      {
        langCode: 'fr',
        langName: 'Français',
        title: 'Ensemble Vers Le Changement: Philosophie de la Renaissance',
        description: 'Un guide stratégique pour l’épanouissement personnel et la refondation de la pensée proactive.',
        sampleContent: 'Chapitre 1: L’Éveil de la conscience proactive. Le changement durable commence par la maîtrise de ses choix intérieurs...'
      }
    ],
    wordDocContent: `مقدمة الكتاب:\nإن التغيير ليس مجرد خيار ترفيهي أو شعار نردده، بل هو سنة كونية وقوة دافعة لكل من يسعى لصناعة فارق حقيقي في حياته وأمته. في هذا الكتاب نستعرض سوياً:\n1. معادلة الوعي الذاتي.\n2. التخلص من عقلية الضحية وبناء عقلية الصانع والمبادر.\n3. التخطيط المرن في عصر التحولات السريعة.\n4. تأسيس بيئة التغيير المجتمعي المستدام.`,
    pdfUrl: '#pdf-together-change',
    audioTrack: {
      hasAudio: true,
      duration: '4:15:00',
      chapters: [
        { id: 'ch1', title: 'الفصل الأول: شرارة البداية والوعي بالذات', durationSeconds: 1800, sampleText: 'إن أعظم خطوة يخطوها الإنسان في حياته هي تلك اللحظة التي يقرر فيها بوعي كامل أنه لن يقبل بأقل مما يستحقه من نمو وعطاء.' },
        { id: 'ch2', title: 'الفصل الثاني: كسر أنماط الخوف وإعادة بناء العادات', durationSeconds: 2400, sampleText: 'العادات هي المعمار الخفي لأقدارنا اليومية. من يملك عادة يملك مستقبلاً.' },
        { id: 'ch3', title: 'الفصل الثالث: القيادة من موقعك الحالي وصناعة الأثر', durationSeconds: 2100, sampleText: 'لا تنتظر منصباً حتى تكون قائداً؛ القيادة تبدأ بقيادة النفس قبل قيادة الآخرين.' },
      ]
    },
    license: {
      type: 'All-Rights-Reserved',
      registrationId: 'DZ-COPYRIGHT-2026-LYA-001',
      protectionYear: 2026,
      jurisdiction: 'OMPI / ONDA International Jurisdiction',
      isVerifiedBadge: true
    },
    salesCount: 142,
    downloadsCount: 890,
    stockCount: 4,
    lowStockThreshold: 10,
    createdAt: '2025-01-10',
  },
  {
    id: 'book-owner-2',
    title: 'أسرار القيادة والتحول الرقمي 2026',
    author: 'لقمان ياسين أبختي',
    authorId: 'user-lokmane-owner',
    publisher: 'منشورات الابتكار والتطوير',
    isbn: '978-9931-7729-4-3',
    description: 'دليل عملي لكيفية دمج أدوات الذكاء الاصطناعي، العملات الرقمية، والتجارة اللامركزية في بناء مؤسسات المستقبل ذات التأثير العالمي.',
    category: 'ذكاء اصطناعي وتقنية',
    priceDzd: 2400,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    isCustom: true,
    isOwnerBook: true,
    rating: 5.0,
    reviewCount: 29,
    pageCount: 280,
    language: 'العربية',
    translations: [
      {
        langCode: 'en',
        langName: 'English',
        title: 'Secrets of Leadership & Digital Transformation 2026',
        description: 'Mastering AI ecosystems, fintech, and modern digital leadership paradigms.',
        sampleContent: 'Modern leadership demands a symbiotic union between human empathy and automated algorithmic agility...'
      }
    ],
    wordDocContent: `التحول الرقمي لم يعد مجرد حوسبة للإجراءات، بل هو إعادة هندسة كاملة لطريقة التفكير والتواصل وإدارة القيمة. في هذا الكتاب نقدم خارطة طريق للمبتكرين والقادة الجدد.`,
    audioTrack: {
      hasAudio: true,
      duration: '3:45:00',
      chapters: [
        { id: 'ch1', title: 'مقدمة: الثورة التكنولوجية المعاصرة', durationSeconds: 1200, sampleText: 'في عالم يتغير فيه المشهد التقني كل بضعة أشهر، أصبحت القدرة على التعلم السريع وإعادة التموضع هي المهارة الأهم على الإطلاق.' },
      ]
    },
    license: {
      type: 'All-Rights-Reserved',
      registrationId: 'DZ-COPYRIGHT-2026-LYA-002',
      protectionYear: 2026,
      jurisdiction: 'WIPO International Registry',
      isVerifiedBadge: true
    },
    salesCount: 98,
    downloadsCount: 650,
    stockCount: 28,
    lowStockThreshold: 10,
    createdAt: '2025-02-01',
  },
  {
    id: 'book-3',
    title: 'قوة العادات والأنظمة الذكية',
    author: 'د. طارق السعدي',
    authorId: 'user-external-1',
    publisher: 'دار الحكمة للنشر',
    isbn: '978-9931-1022-8-9',
    description: 'كيف تبني عادات صغيرة تؤدي إلى نتائج غير عادية، وتتخلص من التسويف عبر إعادة برمجة المحفزات اليومية.',
    category: 'تنمية وتغيير',
    priceDzd: 1500,
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    isCustom: false,
    isOwnerBook: false,
    rating: 4.8,
    reviewCount: 24,
    pageCount: 260,
    language: 'العربية',
    translations: [],
    wordDocContent: `العادات هي الفائدة المركبة لتطوير الذات. مثلما تتضاعف الأموال عبر الفائدة المركبة، فإن تأثيرات عاداتك تتضاعف كلما كررتها.`,
    audioTrack: {
      hasAudio: true,
      duration: '2:50:00',
      chapters: [
        { id: 'ch1', title: 'قانون التكرار وتأثير الدوبامين', durationSeconds: 1500, sampleText: 'النجاح هو نتاج العادات اليومية لا التحولات التي تحدث مرة واحدة في العمر.' }
      ]
    },
    license: {
      type: 'CC-BY-SA',
      registrationId: 'LIC-2025-SAADI-99',
      protectionYear: 2025,
      jurisdiction: 'Creative Commons International',
      isVerifiedBadge: true
    },
    salesCount: 64,
    downloadsCount: 420,
    stockCount: 2,
    lowStockThreshold: 8,
    createdAt: '2025-01-20',
  },
  {
    id: 'book-4',
    title: 'فلسفة العقل والذكاء التوليدي',
    author: 'بروفيسور إلياس بلقاسم',
    authorId: 'user-external-2',
    publisher: 'المركز المغاربي للدراسات',
    isbn: '978-9931-5510-3-1',
    description: 'استكشاف فلسفي وتقني لطبيعة الوعي، الشبكات العصبية العميقة، والحدود الفاصلة بين الإدراك البشري والآلي.',
    category: 'فكر وفلسفة',
    priceDzd: 2100,
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd8?w=600&auto=format&fit=crop&q=80',
    isCustom: false,
    isOwnerBook: false,
    rating: 4.7,
    reviewCount: 19,
    pageCount: 390,
    language: 'العربية',
    translations: [],
    audioTrack: {
      hasAudio: true,
      duration: '5:10:00',
      chapters: [
        { id: 'ch1', title: 'مفهوم الوعي في عصر الخوارزميات', durationSeconds: 2000, sampleText: 'هل تستطيع الخوارزمية أن تشعر بالمعنى، أم أنها مجرد مرآة لمعانينا نحن؟' }
      ]
    },
    license: {
      type: 'Open-Access',
      registrationId: 'OA-INT-2025-081',
      protectionYear: 2025,
      jurisdiction: 'Open Access Heritage',
      isVerifiedBadge: true
    },
    salesCount: 45,
    downloadsCount: 310,
    stockCount: 0,
    lowStockThreshold: 5,
    createdAt: '2025-02-15',
  },
  {
    id: 'book-5',
    title: 'سيكولوجية اتخاذ القرار في الأزمات',
    author: 'د. مريم التلمساني',
    authorId: 'user-external-3',
    publisher: 'دار العلوم الإنسانية',
    isbn: '978-9931-4490-6-7',
    description: 'كيف يفكر العقل البشري تحت الضغط، وكيف نحيد الانحيازات المعرفية لنصل إلى قرارات واعية وشجاعة.',
    category: 'علم النفس',
    priceDzd: 1650,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    isCustom: false,
    isOwnerBook: false,
    rating: 4.9,
    reviewCount: 31,
    pageCount: 240,
    language: 'العربية',
    translations: [],
    audioTrack: {
      hasAudio: true,
      duration: '3:15:00',
      chapters: [
        { id: 'ch1', title: 'فخاخ التفكير السريع والقرارات المتسرعة', durationSeconds: 1600, sampleText: 'الانفعال عدو التحليل الهادئ. تعلم كيف تأخذ خطوة إلى الوراء لترى الصورة الكاملة.' }
      ]
    },
    license: {
      type: 'All-Rights-Reserved',
      registrationId: 'LIC-2025-TLM-12',
      protectionYear: 2025,
      jurisdiction: 'National Copyright Office',
      isVerifiedBadge: true
    },
    salesCount: 77,
    downloadsCount: 512,
    stockCount: 18,
    lowStockThreshold: 8,
    createdAt: '2025-01-28',
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    bookId: 'book-owner-1',
    userId: 'user-2',
    userName: 'أمين بلمختار',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    userRole: 'team_member',
    rating: 5,
    text: 'عمل استثنائي من الأستاذ لقمان ياسين أبختي. الكتاب يجمع بين العمق الفلسفي والتطبيق العملي الدقيق. وضع خطة متكاملة للنهوض بالوعي الفردي والمجتمعي.',
    likes: 42,
    likedBy: ['user-lokmane-owner', 'user-3', 'user-4'],
    createdAt: '2025-01-15',
    isTopReviewerReward: true,
  },
  {
    id: 'rev-2',
    bookId: 'book-owner-1',
    userId: 'user-3',
    userName: 'سارة القاسمي',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    userRole: 'team_member',
    rating: 5,
    text: 'النسخة الصوتية بجودة ممتازة والترجمة متقنة جداً! فخورة بأن أكون جزءاً من هذا المجتمع المعرفي الرائد.',
    likes: 27,
    likedBy: ['user-2', 'user-4'],
    createdAt: '2025-01-18',
  },
  {
    id: 'rev-3',
    bookId: 'book-owner-2',
    userId: 'user-4',
    userName: 'كريم الجزائري',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    userRole: 'regular_user',
    rating: 5,
    text: 'الدفع السريع عبر بينانس كان فورياً واستلمت الكتاب وقرأته مباشرة. المحتوى مذهل ويربط بين الذكاء الاصطناعي والتجارة المستقبلية باقتدار.',
    likes: 19,
    likedBy: ['user-2'],
    createdAt: '2025-02-05',
  }
];

export const INITIAL_FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'topic-1',
    bookId: 'book-owner-1',
    bookTitle: 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
    title: 'مناقشة الفصل الأول: كيف نبني وعياً حقيقياً يتجاوز الشعارات؟',
    content: 'في الفصل الأول طرح الكاتب لقمان ياسين معادلة صريحة مفادها أن التغيير لا يبدأ من الخارج بل من إعادة ترتيب الأولويات الداخلية والقيمية. ما هي أكثر الأفكار التي ألهمتكم في هذا الفصل؟',
    authorId: 'user-lokmane-owner',
    authorName: 'لقمان ياسين أبختي',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    authorRole: 'owner',
    category: 'تنمية وتغيير',
    likes: 38,
    likedBy: ['user-2', 'user-3', 'user-4'],
    createdAt: '2025-01-12',
    isPinned: true,
    replies: [
      {
        id: 'reply-1',
        topicId: 'topic-1',
        authorId: 'user-2',
        authorName: 'أمين بلمختار',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        authorRole: 'team_member',
        content: 'أهم فكرة بالنسبة لي هي الانتقال من دور "المتفرج" إلى دور "الصانع والمبادر". عندما ندرك أن مسؤولية التغيير تقع على عاتقنا نحن أولاً، تتغير كل النتائج.',
        likes: 14,
        likedBy: ['user-lokmane-owner', 'user-4'],
        createdAt: '2025-01-13'
      },
      {
        id: 'reply-2',
        topicId: 'topic-1',
        authorId: 'user-4',
        authorName: 'كريم الجزائري',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        authorRole: 'regular_user',
        content: 'التركيز على العادات الصغيرة اليومية وتأثيرها التراكمي كان مفتاحياً جداً في تجربتي الشخصية بعد قراءة الكتاب.',
        likes: 9,
        likedBy: ['user-2'],
        createdAt: '2025-01-14'
      }
    ]
  },
  {
    id: 'topic-2',
    title: 'تطوير صناعة الكتاب الصوتي باللغة العربية وآفاق الذكاء الاصطناعي',
    content: 'نناقش في هذه المساحة كيفية الاستفادة من تقنيات تحويل النص إلى كلام (TTS) وتوليد الأصوات الطبيعية لإثراء المكتبة الصوتية العربية وجعل الكتب متاحة للجميع.',
    authorId: 'user-3',
    authorName: 'سارة القاسمي',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    authorRole: 'team_member',
    category: 'التقنية والعلوم',
    likes: 21,
    likedBy: ['user-lokmane-owner', 'user-2'],
    createdAt: '2025-02-02',
    isPinned: false,
    replies: []
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'لقمان ياسين أبختي',
    email: 'lokmaneyassine006@gmail.com',
    role: 'president',
    roleTitleAr: 'صاحب المنصة ورئيس مجلس الإدارة',
    bio: 'القيادة العامة للمنصة، إقرار السياسات الكبرى، اعتماد التعيينات وحقوق النشر، والموافقة على طلبات التعديل والتصفية المالية.',
    cvSummary: 'مؤسس ريادي، كاتب وباحث في الاستراتيجيات الرقمية والنهضة المجتمعية، خبرة واسعة في إدارة المشاريع المعرفية والتقنية.',
    competenceScore: 100,
    ratingScore: 5.0,
    joinDate: '2024-01-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    permissions: ['all_permissions', 'president_veto', 'financial_clearance', 'user_management', 'system_lockdown'],
    isPresident: true,
    status: 'active'
  },
  {
    id: 'tm-saad',
    name: 'سعد بوعشة',
    email: 'saad.bouacha@change.dz',
    role: 'president',
    roleTitleAr: 'شريك استراتيجي وعضو الإدارة العليا (VIP)',
    bio: 'شريك استراتيجي في منصة معا نحو التغيير، الإشراف على الشراكات وتطوير المحتوى والمعتمد بصلاحيات القسيمة اللانهائية OWNER-INFINITY-VIP.',
    cvSummary: 'خبير استراتيجي في إدارة المشاريع الرقمية والريادة الفكرية، شريك تنفيذي معتمد للصلاحيات اللانهائية VIP.',
    competenceScore: 100,
    ratingScore: 5.0,
    joinDate: '2024-01-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    permissions: ['all_permissions', 'president_veto', 'financial_clearance', 'user_management'],
    isPresident: true,
    status: 'active'
  },
  {
    id: 'tm-2',
    name: 'أمين بلمختار',
    email: 'amine.ben@change.dz',
    role: 'chief_editor',
    roleTitleAr: 'رئيس التحرير والتدقيق اللغوي',
    bio: 'مسؤول مراجعة جودة الكتب المنشورة، تدقيق الترجمات، وتوجيه مسارات النشر الفكري والأدبي.',
    cvSummary: 'ماجستير في اللسانيات والترجمة، 8 سنوات خبرة في دور النشر العربية، محكم معتمد في جوائز أدبية.',
    competenceScore: 94,
    ratingScore: 4.9,
    joinDate: '2024-03-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    permissions: ['edit_books', 'publish_curated', 'moderate_reviews', 'forum_manage'],
    isPresident: false,
    status: 'active'
  },
  {
    id: 'tm-3',
    name: 'سارة القاسمي',
    email: 'sarah.k@change.dz',
    role: 'content_curator',
    roleTitleAr: 'مسؤولة الملكية الفكرية والعلاقات الثقافية',
    bio: 'إدارة رخص المشاع الإبداعي، التوثيق الدولي، والتنسيق مع المؤلفين والمترجمين في مختلف دول العالم.',
    cvSummary: 'تخصص في القانون الدولي وحقوق الملكية الفكرية الرقمية، خبيرة في اتفاقيات بيرن والويبو (WIPO).',
    competenceScore: 91,
    ratingScore: 4.8,
    joinDate: '2024-06-01',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    permissions: ['copyright_verify', 'author_outreach', 'license_audit'],
    isPresident: false,
    status: 'active'
  }
];

export const INITIAL_VIRTUAL_CARDS: VirtualCardData[] = [
  {
    id: 'card-1',
    holderName: 'LOKMANE YASSINE ABAKHTI',
    cardNumber: '4260 •••• •••• 2026',
    expiry: '12/29',
    balance: 3600,
    currency: 'DZD',
    countryCode: 'DZ',
    countryName: 'الجزائر',
    cardType: 'vip',
    bgGradient: 'from-amber-600 via-amber-700 to-stone-900',
    logoText: 'معا نحو التغيير - VIP GLOBAL',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    globalChip: true,
    cvv: '884'
  },
  {
    id: 'card-saad',
    holderName: 'SAAD BOUACHA (سعد بوعشة)',
    cardNumber: '4260 •••• •••• 7788',
    expiry: '12/29',
    balance: 3600,
    currency: 'DZD',
    countryCode: 'DZ',
    countryName: 'الجزائر',
    cardType: 'vip',
    bgGradient: 'from-amber-600 via-amber-700 to-stone-900',
    logoText: 'معا نحو التغيير - VIP GLOBAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    globalChip: true,
    cvv: '778'
  }
];

export const INITIAL_GIFT_CARDS: GiftCardVoucher[] = [
  {
    code: 'OWNER-INFINITY-VIP',
    amountUsdt: 100,
    isUsed: false,
    isInfinite: true,
    ownerOnly: true,
    timesRedeemed: 0,
    discountPercentage: 100,
    description: 'القسيمة اللانهائية الحصرية لمالك المنصة وإدارتها العليا (الأستاذ لقمان ياسين أبختي والأستاذ سعد بوعشة) - شحن واستفادة لانهائية وخصم 100%',
    createdAt: '2026-01-01'
  },
  {
    code: 'LOKMANE-VIP-INFINITE',
    amountUsdt: 50,
    isUsed: false,
    isInfinite: true,
    ownerOnly: true,
    timesRedeemed: 0,
    discountPercentage: 100,
    description: 'قسيمة الشحن اللانهائي لمالك المنصة - استخدامات غير محدودة',
    createdAt: '2026-01-01'
  },
  {
    code: 'LOKMANE-VIP-GIFT10',
    amountUsdt: 10,
    isUsed: false,
    createdAt: '2025-02-10'
  },
  {
    code: 'ALGERIA-BOOK-10USD',
    amountUsdt: 10,
    isUsed: false,
    createdAt: '2025-02-20'
  }
];

export const DEFAULT_PUBLISHER_PROFILES: Record<string, PublisherProfile> = {
  'دار النشر والتوزيع - معا نحو التغيير': {
    name: 'دار النشر والتوزيع - معا نحو التغيير',
    licenseNumber: 'DZ-PUB-2024-9981',
    country: 'الجزائر',
    city: 'الجزائر العاصمة',
    address: 'شارع ديدوش مراد / شارع العربي بن مهيدي، الجزائر الوسطى',
    officialEmail: 'publishing@together-change.com',
    officialPhone: '+213 652 20 69 47',
    whatsappNumber: '+213 652 20 69 47',
    contactPerson: 'أمين بلمختار',
    contactPersonRole: 'مدير النشر والعلاقات الثقافية والإعلامية',
    avgResponseHours: 2,
    publishingGenres: ['التنمية الذاتية', 'الفكر والنهضة', 'التحول الرقمي', 'الدراسات الإنسانية'],
    submissionOpen: true,
    aboutPublisher: 'الدار الرسمية التابعة لمنصة "معا نحو التغيير"، متخصصة في نشر وتوزيع المؤلفات الرائدة في الفكر والتطوير والعلوم الإنسانية، مع تقديم خدمات الترجمة العالمية والإنتاج الصوتي الرقمي.'
  },
  'منشورات الابتكار والتطوير': {
    name: 'منشورات الابتكار والتطوير',
    licenseNumber: 'DZ-PUB-2023-7412',
    country: 'الجزائر',
    city: 'وهران',
    address: 'حي العقيد لطفي، المجمع المعرفي، وهران',
    officialEmail: 'contact@innovation-dz.org',
    officialPhone: '+213 550 44 12 30',
    whatsappNumber: '+213 550 44 12 30',
    contactPerson: 'م. يونس بلحاج',
    contactPersonRole: 'مسؤول النشر التقني والريادي',
    avgResponseHours: 4,
    publishingGenres: ['الذكاء الاصطناعي', 'التكنولوجيا المالية', 'إدارة الابتكار'],
    submissionOpen: true,
    aboutPublisher: 'دار متخصصة في الكتب العلمية والتقنية وإصدارات عصر الرقمنة والذكاء الاصطناعي وبناء القدرات المستقبلية.'
  },
  'دار الحكمة للنشر': {
    name: 'دار الحكمة للنشر',
    licenseNumber: 'DZ-PUB-2021-3320',
    country: 'الجزائر',
    city: 'قسنطينة',
    address: 'المدينة الجديدة علي منجلي، مجمع النور، قسنطينة',
    officialEmail: 'info@dar-alhikma-dz.com',
    officialPhone: '+213 561 33 22 11',
    whatsappNumber: '+213 561 33 22 11',
    contactPerson: 'د. رشيد بن عبد الله',
    contactPersonRole: 'المشرف العام على النشر',
    avgResponseHours: 6,
    publishingGenres: ['علم النفس السلوكي', 'بناء العادات', 'التربية والتعليم'],
    submissionOpen: true,
    aboutPublisher: 'دار نشر عريقة تعنى بنشر كتب التربية وعلم النفس والتنمية المستدامة، مع شراكات توزيع في العالم العربي.'
  },
  'المركز المغاربي للدراسات': {
    name: 'المركز المغاربي للدراسات',
    licenseNumber: 'DZ-PUB-2022-5509',
    country: 'الجزائر',
    city: 'تلمسان',
    address: 'حي الفنون والثقافة، تلمسان',
    officialEmail: 'contact@maghreb-studies.dz',
    officialPhone: '+213 43 20 18 90',
    whatsappNumber: '+213 43 20 18 90',
    contactPerson: 'د. سامية زروقي',
    contactPersonRole: 'منسقة الاتصال والتبادل الأكاديمي',
    avgResponseHours: 12,
    publishingGenres: ['الفلسفة والمنطق', 'الدراسات الاستشرافية', 'العلوم الإنسانية'],
    submissionOpen: true,
    aboutPublisher: 'مركز أبحاث ونشر أكاديمي معني بالدراسات الفلسفية المعاصرة وتوثيق الفكر المغاربي والدولي.'
  },
  'دار العلوم الإنسانية': {
    name: 'دار العلوم الإنسانية',
    licenseNumber: 'DZ-PUB-2020-1845',
    country: 'الجزائر',
    city: 'سطيف',
    address: 'شارع 8 ماي 1945، مجمع الكتاب، سطيف',
    officialEmail: 'publications@humanities-dz.net',
    officialPhone: '+213 36 84 55 20',
    whatsappNumber: '+213 36 84 55 20',
    contactPerson: 'أ. مراد سلطاني',
    contactPersonRole: 'مدير شؤون المؤلفين والتوزيع',
    avgResponseHours: 8,
    publishingGenres: ['علم النفس', 'علم الاجتماع', 'إدارة الأزمات'],
    submissionOpen: true,
    aboutPublisher: 'دار نشر رائدة في نشر الأبحاث النفسية والاجتماعية وتوفير المراجع المتخصصة للجامعات والمراكز البحثية.'
  }
};

export const INITIAL_PUBLISHER_MESSAGES: PublisherMessage[] = [
  {
    id: 'pub-msg-1',
    bookId: 'book-owner-1',
    bookTitle: 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
    publisherName: 'دار النشر والتوزيع - معا نحو التغيير',
    senderId: 'user-4',
    senderName: 'كريم الجزائري',
    senderEmail: 'karim.reader@gmail.com',
    senderPhone: '0555123456',
    category: 'bulk_order',
    subject: 'طلب اقتناء دفعة ورقية مطبوعة للنادي الثقافي الطلابي (50 نسخة)',
    message: 'السلام عليكم ورحمة الله، نحن نادي القراءة الجامعي نود اقتناء 50 نسخة ورقية معتمدة من كتاب "معا نحو التغيير" لتوزيعها على الطلبة في ورشة العمل القادمة، نرجو إفادتنا بإمكانية الشحن إلى ولاية سطيف وتفاصيل الدفع.',
    createdAt: '2026-03-10T11:30:00Z',
    status: 'replied',
    publisherReply: {
      text: 'وعليكم السلام ورحمة الله أخي كريم، مرحباً بكم وبناديكم الثقافي. يسعد دار النشر توفير الدفعة بخصم تشجيعي 20% للطلبة مع إرسال إهداء موقع من المؤلف الأستاذ لقمان ياسين أبختي. لقد تم التواصل معكم هاتفياً لترتيب الشحن السريع.',
      repliedAt: '2026-03-10T13:45:00Z',
      responderName: 'أمين بلمختار',
      responderRole: 'مدير النشر والعلاقات الثقافية'
    }
  },
  {
    id: 'pub-msg-2',
    bookId: 'book-owner-1',
    bookTitle: 'معا نحو التغيير: فلسفة النهضة وبناء الإنسان المعاصر',
    publisherName: 'دار النشر والتوزيع - معا نحو التغيير',
    senderName: 'د. ليلى عماري',
    senderEmail: 'dr.leila.amari@univ-alger.dz',
    senderPhone: '0661987654',
    category: 'rights_inquiry',
    subject: 'استفسار حول الترخيص الأكاديمي لإدراج مقتطفات في مقرر جامعي',
    message: 'تحية طيبة للقائمين على الدار، نود إدراج الفصل الأول من الكتاب ضمن القراءات الإثرائية لمقياس مدخل إلى التغيير التنظيمي لطلبة الماستر، نلتمس موافقة الدار الرسمية وتزويدنا برقم الإيداع القانوني.',
    createdAt: '2026-03-12T09:15:00Z',
    status: 'replied',
    publisherReply: {
      text: 'مرحباً دكتورة ليلى، ترحب الدار بالاستخدام الأكاديمي والتعليمي لهذا العمل النهضوي. تم إرسال كتاب رسمي مختوم بالموافقة على بريدكم الإلكتروني مع تفاصيل الإيداع القانوني وحقوق الملكية الفكرية.',
      repliedAt: '2026-03-12T10:30:00Z',
      responderName: 'سارة القاسمي',
      responderRole: 'مسؤولة العلاقات الثقافية وتدقيق الحقوق'
    }
  },
  {
    id: 'pub-msg-3',
    bookId: 'book-owner-2',
    bookTitle: 'أسرار القيادة والتحول الرقمي 2026',
    publisherName: 'منشورات الابتكار والتطوير',
    senderName: 'طارق مزيان',
    senderEmail: 'tarek.tech@fintech-dz.com',
    senderPhone: '0770112233',
    category: 'press_interview',
    subject: 'دعوة لمشاركة الناشر والمؤلف في مؤتمر وهران للتكنولوجيا المالية',
    message: 'السلام عليكم، يسرنا توجيه دعوة رسمية لدار النشر والمؤلف لتقديم عرض حول مضامين كتاب التحول الرقمي ضمن جلسات ملتقى الجزائر الرقمية القادم.',
    createdAt: '2026-03-14T15:20:00Z',
    status: 'pending'
  }
];
