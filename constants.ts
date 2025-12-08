
import { NewsItem, EventItem, PodcastItem, MarketMetric, PartnerItem, NewsletterItem, ResourceItem, IndustryData } from './types';

// ==========================================
// CENTRAL DATA SOURCE
// ==========================================

const getDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const RSS_CONFIG = {
  FEEDS: [
    { name: 'TechCrunch', url: 'https://rss.app/feeds/QuECLd94BZYymuXm.xml', region: 'Global', type: 'Tech' },
    { name: 'The Verge', url: 'https://rss.app/feeds/kbQFmIIkxmghARwP.xml', region: 'Global', type: 'Tech' },
    { name: 'Wired', url: 'https://rss.app/feeds/ryhuzL1yWfePPf8a.xml', region: 'Global', type: 'Tech' },
    { name: 'PitchBook', url: 'https://rss.app/feeds/tveGkbeoNHNBi5Nl.xml', region: 'Global', type: 'Investment' },
    { name: 'Crunchbase', url: 'https://rss.app/feeds/3GNKIqni3yaWtZ2g.xml', region: 'Global', type: 'Startup' },
    { name: 'VC LinkedIn', url: 'https://rss.app/feeds/Lx2DptjiB72xD02R.xml', region: 'Global', type: 'Investment' },
    { name: 'MENAbytes', url: 'https://rss.app/feeds/u2NLarkFLra75E5Q.xml', region: 'MENA', type: 'Startup' },
    { name: 'Daily Egypt', url: 'https://rss.app/feeds/M8240CPa4y6GPq1A.xml', region: 'Egypt', type: 'Business' },
    { name: 'Al Mal News', url: 'https://rss.app/feeds/HIhpZO6fuME1qzme.xml', region: 'Egypt', type: 'Business' },
    { name: 'Wamda', url: 'https://rss.app/feeds/tkwEU2EqOIvEnUz7.xml', region: 'MENA', type: 'Startup' }
  ],
  KEYWORDS: {
    TECH: ['hardware', "moore's law", 'robotaxi', 'ar/vr', 'aws', 'chips', 'silicon', 'meta glasses', 'waymo', 'gelsinger', 'apple', 'nvidia', 'tech', 'technology'],
    AI: ['ai agents', 'chatgpt', 'synthetic', 'meta ai', 'yoodli', 'llm', 'generative', 'openai', 'anthropic', 'intelligence', 'ai', 'artificial intelligence'],
    BUSINESS: ['netflix', 'deal', 'market analysis', 'energy storage', 'esim', 'warner', 'acquisition', 'merger', 'revenue', 'business', 'stock', 'economy'],
    ENTREPRENEUR: ['founder', 'refound', 'beeple', 'limitless', 'startup story', 'bootstrapping', 'entrepreneur'],
    FINTECH: ['fintech', 'valuation', 'series a', 'series b', 'seed', 'secondary sale', 'funding', 'payment', 'bank', 'invest'],
    INVESTMENT: ['valuation', 'capital', 'venture', 'equity', 'spacex', 'pitchbook', 'investor', '$', 'fund', 'raising']
  }
};

export const TRANSLATIONS = {
  en: {
    nav: {
      latest: 'Latest',
      startups: 'Startups',
      events: 'Events',
      podcasts: 'Podcasts',
      podcastAnalysis: 'Podcast Analysis',
      newsletters: 'Newsletters',
      market: 'Market Analysis',
      industry: 'Industry Analysis',
      partners: 'Partners',
      resources: 'Resources',
      aiAssistant: 'AI Assistant',
      saved: 'Saved Items',
      login: 'Login',
      logout: 'Logout',
      admin: 'Admin Panel'
    },
    common: {
      searchPlaceholder: 'Search...',
      readMore: 'Read Source',
      aiSummary: 'AI Summary',
      aiTranslate: 'Translate to Arabic',
      save: 'Save',
      saved: 'Saved',
      register: 'Register Now',
      listen: 'Listen Episode',
      subscribe: 'Subscribe',
      contact: 'Contact',
      marketInsights: 'AI Market Insights',
      chatTitle: 'Nexus AI Assistant',
      filter: 'Filter',
      apply: 'Apply',
      all: 'All',
      generateAudio: 'Generate Audio',
      playAudio: 'Play Summary'
    },
    sections: {
      latestTitle: 'Global & Egyptian Tech News',
      startupsTitle: 'Startup Ecosystem',
      eventsTitle: 'Tech Events Calendar',
      marketTitle: 'Financial & Market Data',
      podcastsTitle: 'Tech & Business Podcasts',
      newslettersTitle: 'Curated Newsletters',
      partnersTitle: 'Our Partners',
      resourcesTitle: 'Platform Resources & Sources',
      authTitle: 'Welcome to NexusMena',
      aiPageTitle: 'AI Knowledge Assistant',
      topStoriesDesc: 'Top 12 Most Important Stories.'
    }
  },
  ar: {
    nav: {
      latest: 'أحدث الأخبار',
      startups: 'الشركات الناشئة',
      events: 'الفعاليات',
      podcasts: 'بودكاست',
      podcastAnalysis: 'تحليل البودكاست',
      newsletters: 'النشرات البريدية',
      market: 'تحليل السوق',
      industry: 'تحليل القطاعات',
      partners: 'الشركاء',
      resources: 'المصادر',
      aiAssistant: 'المساعد الذكي',
      saved: 'المحفوظات',
      login: 'دخول',
      logout: 'خروج',
      admin: 'لوحة التحكم'
    },
    common: {
      searchPlaceholder: 'بحث...',
      readMore: 'اقرأ المصدر',
      aiSummary: 'ملخص ذكي',
      aiTranslate: 'ترجم للإنجليزية',
      save: 'حفظ',
      saved: 'محفوظ',
      register: 'سجل الآن',
      listen: 'استمع للحلقة',
      subscribe: 'اشترك',
      contact: 'تواصل',
      marketInsights: 'رؤى السوق الذكية',
      chatTitle: 'مساعد نيكسوس الذكي',
      filter: 'تصفية',
      apply: 'تطبيق',
      all: 'الكل',
      generateAudio: 'توليد صوت',
      playAudio: 'تشغيل الملخص'
    },
    sections: {
      latestTitle: 'أخبار التكنولوجيا العالمية والمصرية',
      startupsTitle: 'منظومة الشركات الناشئة',
      eventsTitle: 'تقويم الفعاليات التقنية',
      marketTitle: 'البيانات المالية والسوقية',
      podcastsTitle: 'بودكاست التكنولوجيا والأعمال',
      newslettersTitle: 'نشرات بريدية مختارة',
      partnersTitle: 'شركاؤنا',
      resourcesTitle: 'موارد ومنصات المنصة',
      authTitle: 'مرحباً بك في نيكسوس',
      aiPageTitle: 'المساعد المعرفي الذكي',
      topStoriesDesc: 'أهم 12 خبر وقصة اليوم.'
    }
  }
};

// RESOURCES
export const RESOURCES: ResourceItem[] = RSS_CONFIG.FEEDS.map((f, i) => ({
  id: `r_${i}`,
  name: f.name,
  url: f.url.replace('https://rss.app/feeds/', 'https://site.com/'),
  rssUrl: f.url,
  type: f.type === 'Startup' ? 'Startup' : 'News',
  description: `Official RSS Feed for ${f.name}`
}));

// Empty initial state
export const LATEST_NEWS: NewsItem[] = [];
export const STARTUP_NEWS: NewsItem[] = [];

// Enhanced Events with more sources
// Enhanced Events with specific Egypt & Global focus (2025-2026)
export const EVENTS: EventItem[] = [
  // EGYPT / MENA EVENTS
  {
    id: 'e_eg_1',
    title: 'RiseUp Summit 2025',
    description: 'The largest entrepreneurship event in the Middle East at the Grand Egyptian Museum.',
    location: 'Giza, Egypt',
    startDate: getDate(30),
    endDate: getDate(32),
    registrationLink: 'https://riseupsummit.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'RiseUp',
    url: 'https://riseupsummit.com',
    imageUrl: 'https://picsum.photos/800/400?random=201',
    date: getDate(30),
    type: 'Conference'
  },
  {
    id: 'e_eg_2',
    title: 'Cairo ICT 2025',
    description: 'The leading technology expo in Africa and the Middle East, featuring "PAIX" (AI) and "Connecta".',
    location: 'EIEC, Cairo',
    startDate: getDate(120),
    endDate: getDate(123),
    registrationLink: 'https://cairoict.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'Cairo ICT',
    url: 'https://cairoict.com',
    imageUrl: 'https://picsum.photos/800/400?random=202',
    date: getDate(120),
    type: 'Conference'
  },
  {
    id: 'e_eg_3',
    title: 'Techne Summit Alexandria 2025',
    description: 'Investment & Entrepreneurship event on the Mediterranean, focusing on Proptech and Healthtech.',
    location: 'Bibliotheca Alexandrina',
    startDate: getDate(200),
    endDate: getDate(203),
    registrationLink: 'https://techne.me',
    isVirtual: false,
    region: 'Egypt',
    source: 'Techne',
    url: 'https://techne.me',
    imageUrl: 'https://picsum.photos/800/400?random=203',
    date: getDate(200),
    type: 'Conference'
  },
  {
    id: 'e_eg_4',
    title: 'Creative Industry Summit',
    description: 'Where business meets creativity. Focus on the creative economy and digital innovation.',
    location: 'Cairo, Egypt',
    startDate: getDate(90),
    endDate: getDate(92),
    registrationLink: 'https://creativeindmena.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'CreativeInd',
    url: 'https://creativeindmena.com',
    imageUrl: 'https://picsum.photos/800/400?random=204',
    date: getDate(90),
    type: 'Conference'
  },
  {
    id: 'e_eg_5',
    title: 'Digital Banking & Fintech Summit',
    description: 'Exploring the future of payments, open banking, and financial inclusion in Egypt.',
    location: 'Cairo, Egypt',
    startDate: getDate(45),
    endDate: getDate(46),
    registrationLink: 'https://fintech.gov.eg',
    isVirtual: false,
    region: 'Egypt',
    source: 'Fintech Egypt',
    url: 'https://fintech.gov.eg',
    imageUrl: 'https://picsum.photos/800/400?random=205',
    date: getDate(45),
    type: 'Conference'
  },
  {
    id: 'e_eg_6',
    title: 'Egypt Property & PropTech Show',
    description: 'Showcasing the latest in Real Estate technology and smart city solutions.',
    location: 'New Capital, Egypt',
    startDate: getDate(75),
    endDate: getDate(77),
    registrationLink: 'https://cityscapeegypt.com',
    isVirtual: false,
    region: 'Egypt',
    source: 'Cityscape',
    url: 'https://cityscapeegypt.com',
    imageUrl: 'https://picsum.photos/800/400?random=206',
    date: getDate(75),
    type: 'Exhibition'
  },

  // GLOBAL / MENA EVENTS
  {
    id: 'e_gl_1',
    title: 'LEAP 2026',
    description: 'The global tech event that is reshaping the world. Deep Tech, AI, and Future Energy focus.',
    location: 'Riyadh, KSA',
    startDate: getDate(60),
    endDate: getDate(63),
    registrationLink: 'https://onegiantleap.com',
    isVirtual: false,
    region: 'MENA',
    source: 'LEAP',
    url: 'https://onegiantleap.com',
    imageUrl: 'https://picsum.photos/800/400?random=207',
    date: getDate(60),
    type: 'Conference'
  },
  {
    id: 'e_gl_2',
    title: 'Web Summit Lisbon',
    description: 'Where the future goes to be born. The premier global tech conference for startups and investors.',
    location: 'Lisbon, Portugal',
    startDate: getDate(300),
    endDate: getDate(303),
    registrationLink: 'https://websummit.com',
    isVirtual: false,
    region: 'Global',
    source: 'Web Summit',
    url: 'https://websummit.com',
    imageUrl: 'https://picsum.photos/800/400?random=208',
    date: getDate(300),
    type: 'Conference'
  },
  {
    id: 'e_gl_3',
    title: 'Deep Tech Summit London',
    description: 'Focusing on AI, Biotech, Quantum Computing, and Advanced Materials.',
    location: 'London, UK',
    startDate: getDate(40),
    endDate: getDate(41),
    registrationLink: 'https://deeptechsummit.com',
    isVirtual: true,
    region: 'Global',
    source: 'Eventbrite',
    url: 'https://eventbrite.com',
    imageUrl: 'https://picsum.photos/800/400?random=209',
    date: getDate(40),
    type: 'Conference'
  },
  {
    id: 'e_gl_4',
    title: 'Y Combinator Demo Day',
    description: 'The world\'s most prestigious startup demo day. See the next unicorns pitch.',
    location: 'San Francisco (Virtual)',
    startDate: getDate(100),
    endDate: getDate(101),
    registrationLink: 'https://ycombinator.com',
    isVirtual: true,
    region: 'Global',
    source: 'Y Combinator',
    url: 'https://ycombinator.com',
    imageUrl: 'https://picsum.photos/800/400?random=210',
    date: getDate(100),
    type: 'Conference'
  },
  {
    id: 'e_gl_5',
    title: 'Global AI Summit',
    description: 'Leading the global conversation on Artificial Intelligence.',
    location: 'Riyadh, KSA',
    startDate: getDate(250),
    endDate: getDate(252),
    registrationLink: 'https://globalaisummit.org',
    isVirtual: true,
    region: 'MENA',
    source: 'SDAIA',
    url: 'https://globalaisummit.org',
    imageUrl: 'https://picsum.photos/800/400?random=211',
    date: getDate(250),
    type: 'Conference'
  }
];

export const PODCASTS: PodcastItem[] = [
  // 1. Business Made Easy
  {
    id: 'p_req_1',
    title: 'Business Made Easy',
    description: 'Strategies for easy business growth and simplified concepts for entrepreneurs. Hosted by Amy Porterfield.',
    duration: '40 min',
    region: 'Global',
    source: 'Spotify',
    url: 'https://open.spotify.com/show/3ULANVC0n6XfXDYqn9QY3Q',
    channelUrl: 'https://open.spotify.com/show/3ULANVC0n6XfXDYqn9QY3Q',
    spotifyUrl: 'https://open.spotify.com/show/3ULANVC0n6XfXDYqn9QY3Q',
    appleUrl: 'https://podcasts.apple.com/us/podcast/bme-podcast-business-made-easy/id1445501936',
    date: getDate(-1),
    imageUrl: 'https://picsum.photos/800/400?random=100',
    summaryPoints: ['Strategy', 'Marketing', 'Growth'],
    language: 'en',
    topic: 'Business',
    latestEpisodeTitle: 'How to Scale Your Business Without Burning Out',
    recentEpisodes: [
      { title: 'Email Marketing 101', date: getDate(-5), duration: '35 min', url: 'https://open.spotify.com/show/3ULANVC0n6XfXDYqn9QY3Q' },
      { title: 'Course Creation Secrets', date: getDate(-12), duration: '42 min', url: 'https://open.spotify.com/show/3ULANVC0n6XfXDYqn9QY3Q' }
    ]
  },
  // 2. 7aki Business
  {
    id: 'p_req_2',
    title: '7aki Business - حكي بيزنس',
    titleAr: 'حكي بيزنس',
    description: 'In-depth conversations with business leaders in the MENA region about challenges and opportunities.',
    duration: '50 min',
    region: 'MENA',
    source: 'YouTube',
    url: 'https://www.youtube.com/@7akiBusiness',
    channelUrl: 'https://www.youtube.com/@7akiBusiness',
    youtubeUrl: 'https://www.youtube.com/@7akiBusiness',
    spotifyUrl: 'https://open.spotify.com/show/3fdkR33kideFoyunaAtylt',
    anghamiUrl: 'https://play.anghami.com/podcast/1038691248',
    date: getDate(-2),
    imageUrl: 'https://picsum.photos/800/400?random=101',
    summaryPoints: ['MENA Market', 'Startup Stories', 'Scale-ups'],
    language: 'ar',
    topic: 'Entrepreneurship',
    latestEpisodeTitle: 'The Future of E-commerce in Saudi Arabia',
    recentEpisodes: [
      { title: 'Interview with Careem Co-founder', date: getDate(-7), duration: '55 min', url: 'https://www.youtube.com/watch?v=example1' },
      { title: 'Fintech Regulations in Egypt', date: getDate(-14), duration: '48 min', url: 'https://www.youtube.com/watch?v=example2' }
    ]
  },
  // 3. This Week in Startups
  {
    id: 'p_req_3',
    title: 'This Week in Startups',
    description: 'Jason Calacanis and Molly Wood cover the latest in tech, entrepreneurship, and VC news.',
    duration: '60 min',
    region: 'Global',
    source: 'YouTube',
    url: 'https://www.youtube.com/c/thisweekin',
    channelUrl: 'https://www.youtube.com/c/thisweekin',
    youtubeUrl: 'https://www.youtube.com/c/thisweekin',
    spotifyUrl: 'https://open.spotify.com/show/6ULQ0ewYf5zmsDgBchlkr9',
    date: getDate(0),
    imageUrl: 'https://picsum.photos/800/400?random=102',
    summaryPoints: ['Silicon Valley', 'Investment', 'Tech News', 'AI'],
    language: 'en',
    topic: 'Startup',
    latestEpisodeTitle: 'E1002: AI Regulation & The Next Big Thing',
    recentEpisodes: [
      { title: 'E1001: Interview with Sam Altman', date: getDate(-2), duration: '70 min', url: 'https://www.youtube.com/c/thisweekin' },
      { title: 'E1000: 10 Years of TWiS', date: getDate(-5), duration: '90 min', url: 'https://www.youtube.com/c/thisweekin' }
    ]
  },
  // 4. The Diary Of A CEO
  {
    id: 'p_req_4',
    title: 'The Diary Of A CEO',
    description: 'Unfiltered conversations with the most influential people in the world, hosted by Steven Bartlett.',
    duration: '75 min',
    region: 'Global',
    source: 'YouTube',
    url: 'https://www.youtube.com/@TheDiaryOfACEO',
    channelUrl: 'https://www.youtube.com/@TheDiaryOfACEO',
    youtubeUrl: 'https://www.youtube.com/@TheDiaryOfACEO',
    spotifyUrl: 'https://open.spotify.com/show/7iQXmUT7XGuZSzAMjoNWlX',
    date: getDate(-3),
    imageUrl: 'https://picsum.photos/800/400?random=103',
    summaryPoints: ['Leadership', 'Mental Health', 'Success', 'Business'],
    language: 'en',
    topic: 'Business',
    latestEpisodeTitle: 'How to Master Your Mind and Emotions',
    recentEpisodes: [
      { title: 'The Science of Sleep', date: getDate(-6), duration: '80 min', url: 'https://www.youtube.com/@TheDiaryOfACEO' },
      { title: 'Billionaire Mindset', date: getDate(-10), duration: '65 min', url: 'https://www.youtube.com/@TheDiaryOfACEO' }
    ]
  },
  // 5. Startup Sync Podcast
  {
    id: 'p_req_5',
    title: 'Startup Sync Podcast',
    description: 'Synchronizing you with the latest startup ecosystem pulses and founder stories.',
    duration: '35 min',
    region: 'Global',
    source: 'YouTube',
    url: 'https://www.youtube.com/@StartupSyncPodcast',
    channelUrl: 'https://www.youtube.com/@StartupSyncPodcast',
    youtubeUrl: 'https://www.youtube.com/@StartupSyncPodcast',
    date: getDate(-4),
    imageUrl: 'https://picsum.photos/800/400?random=104',
    summaryPoints: ['Ecosystem', 'Founders', 'Sync'],
    language: 'en',
    topic: 'Startup',
    latestEpisodeTitle: 'Navigating the Funding Winter',
    recentEpisodes: [
      { title: 'Bootstrapping 101', date: getDate(-8), duration: '30 min', url: 'https://www.youtube.com/@StartupSyncPodcast' }
    ]
  },
  // 6. The GaryVee Audio Experience
  {
    id: 'p_req_6',
    title: 'The GaryVee Audio Experience',
    description: 'Keynotes, interviews, and fireside chats from entrepreneur Gary Vaynerchuk.',
    duration: '30 min',
    region: 'Global',
    source: 'Spotify',
    url: 'https://open.spotify.com/show/6iedJ7xZQQsYIvuhfcsax0',
    channelUrl: 'https://open.spotify.com/show/6iedJ7xZQQsYIvuhfcsax0',
    spotifyUrl: 'https://open.spotify.com/show/6iedJ7xZQQsYIvuhfcsax0',
    date: getDate(-5),
    imageUrl: 'https://picsum.photos/800/400?random=105',
    summaryPoints: ['Marketing', 'Social Media', 'Hustle', 'Mindset'],
    language: 'en',
    topic: 'Entrepreneurship',
    latestEpisodeTitle: 'The Importance of Patience in Business',
    recentEpisodes: [
      { title: 'DailyVee 600', date: getDate(-2), duration: '15 min', url: 'https://open.spotify.com/show/6iedJ7xZQQsYIvuhfcsax0' }
    ]
  },
  // 7. Masters of Scale
  {
    id: 'p_req_7',
    title: 'Masters of Scale',
    description: 'Legendary Reid Hoffman tests his theories on how businesses scale.',
    duration: '45 min',
    region: 'Global',
    source: 'Spotify',
    url: 'https://open.spotify.com/show/7CZAY2rPWgJelEDjoLaDOv',
    channelUrl: 'https://open.spotify.com/show/7CZAY2rPWgJelEDjoLaDOv',
    spotifyUrl: 'https://open.spotify.com/show/7CZAY2rPWgJelEDjoLaDOv',
    date: getDate(-2),
    imageUrl: 'https://picsum.photos/800/400?random=106',
    summaryPoints: ['Scaling', 'Management', 'Strategy', 'VC'],
    language: 'en',
    topic: 'Business',
    latestEpisodeTitle: 'Airbnb\'s Brian Chesky on Design-Led Growth',
    recentEpisodes: [
      { title: 'Bill Gates on AI', date: getDate(-9), duration: '50 min', url: 'https://open.spotify.com/show/7CZAY2rPWgJelEDjoLaDOv' }
    ]
  },
  // 8. Startup Hustle (Highlights)
  {
    id: 'p_req_8',
    title: 'Startup Hustle',
    description: 'Real stories from real entrepreneurs building real businesses. Daily episodes.',
    duration: '25 min',
    region: 'Global',
    source: 'YouTube',
    url: 'https://www.youtube.com/playlist?list=PLeNNUmE-BlnE5GVCM_aZtWCLzCzHYA-ho',
    channelUrl: 'https://www.youtube.com/playlist?list=PLeNNUmE-BlnE5GVCM_aZtWCLzCzHYA-ho',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLeNNUmE-BlnE5GVCM_aZtWCLzCzHYA-ho',
    date: getDate(-6),
    imageUrl: 'https://picsum.photos/800/400?random=107',
    summaryPoints: ['Hustle', 'Real Stories', 'Tactics'],
    language: 'en',
    topic: 'Startup',
    latestEpisodeTitle: 'Bootstrapping vs Venture Capital',
    recentEpisodes: [
      { title: 'Hiring your first employee', date: getDate(-10), duration: '20 min', url: 'https://www.youtube.com/playlist?list=PLeNNUmE-BlnE5GVCM_aZtWCLzCzHYA-ho' }
    ]
  },
];

export const NEWSLETTERS: NewsletterItem[] = [
  {
    id: 'nl_pt_1',
    title: 'Future PropTech',
    description: 'Weekly digest on the future of built world technology.',
    source: 'Future PropTech',
    url: 'https://futureproptech.com',
    date: getDate(0),
    region: 'Global',
    imageUrl: 'https://picsum.photos/800/400?random=501',
    frequency: 'Weekly',
    subscribeLink: 'https://futureproptech.com/subscribe'
  },
  {
    id: 'nl2',
    title: 'Enterprise Egypt',
    description: 'The essential morning read for business and finance in Egypt.',
    source: 'Enterprise',
    url: 'https://enterprise.press',
    date: getDate(0),
    region: 'Egypt',
    imageUrl: 'https://picsum.photos/800/400?random=29',
    frequency: 'Daily',
    subscribeLink: 'https://enterprise.press/subscribe'
  }
];

export const MARKET_DATA_INDICES: MarketMetric[] = [
  { name: 'EGX 30', value: 28500.45, change: 1.2, trend: 'up', currency: 'pts', type: 'Index' },
  { name: 'NASDAQ', value: 16340.20, change: 0.8, trend: 'up', currency: 'USD', type: 'Index' }
];

export const MARKET_DATA_CRYPTO: MarketMetric[] = [
  { name: 'Bitcoin', value: 64200.00, change: -1.5, trend: 'down', currency: 'USD', type: 'Crypto' }
];

export const MARKET_DATA_CURRENCY: MarketMetric[] = [
  { name: 'USD/EGP', value: 47.85, change: -0.1, trend: 'neutral', currency: 'EGP', type: 'Currency' }
];

export const PARTNERS: PartnerItem[] = [
  {
    id: 'pt1',
    name: 'ITIDA',
    logo: 'https://picsum.photos/200/200?random=20',
    website: 'https://itida.gov.eg',
    type: 'Egypt',
    description: 'Information Technology Industry Development Agency',
    contactEmail: 'info@itida.gov.eg',
    services: ['Grants', 'Training', 'Export Support']
  }
];

// COMPREHENSIVE INDUSTRY DATA
export const INDUSTRY_DATA: IndustryData = {
  sectors: [
    {
      name: 'Fintech',
      growth: 18.2, companies: 350, investment: 1200, color: '#10b981',
      source: 'CB Insights', url: 'https://www.cbinsights.com', lastUpdated: '2025-11-01',
      swot: {
        strengths: ['High mobile penetration in MENA', 'Supportive regulatory sandboxes'],
        weaknesses: ['Fragmented regulatory landscape across borders', 'Cash dominance in some regions'],
        opportunities: ['Unbanked population adoption', 'Embedded finance in retail'],
        threats: ['Cybersecurity attacks', 'Global big tech entry']
      },
      pestle: {
        political: 'Central Bank digitalization initiatives.',
        economic: 'Currency fluctuation driving crypto/stablecoin interest.',
        social: 'Youth demographic shifting to digital wallets.',
        technological: 'Open Banking API standardization.',
        legal: 'Data localization laws.',
        environmental: 'Green Fintech initiatives.'
      }
    },
    {
      name: 'AI & ML',
      growth: 24.5, companies: 120, investment: 850, color: '#6366f1',
      source: 'Gartner', url: 'https://www.gartner.com', lastUpdated: '2025-10-15',
      swot: {
        strengths: ['Strong engineering talent pool in Egypt', 'Government AI strategies (SDAIA)'],
        weaknesses: ['Lack of local high-performance compute infra', 'Data scarcity in Arabic'],
        opportunities: ['Arabic LLM development', 'AI in public sector efficiency'],
        threats: ['Brain drain to US/Europe', 'Ethical AI regulations']
      },
      pestle: {
        political: 'National AI Strategies (Egypt/KSA/UAE).',
        economic: 'Cost savings automation.',
        social: 'Job displacement concerns.',
        technological: 'GenAI breakthroughs.',
        legal: 'IP rights for AI generated content.',
        environmental: 'Energy consumption of data centers.'
      }
    },
    {
      name: 'Proptech',
      growth: 14.8, companies: 95, investment: 280, color: '#f59e0b',
      source: 'Magnitt', url: 'https://magnitt.com', lastUpdated: '2025-09-20',
      swot: {
        strengths: ['Booming real estate market in KSA/Egypt', 'Urbanization trends'],
        weaknesses: ['Slow adoption by traditional developers', 'Legacy systems'],
        opportunities: ['Smart cities (NEOM, NAC)', 'Fractional ownership models'],
        threats: ['Real estate market cooling', 'Interest rate hikes']
      },
      pestle: {
        political: 'Housing initiatives and mortgage support.',
        economic: 'Inflation impact on construction.',
        social: 'Demand for smart home living.',
        technological: 'IoT & Digital Twins.',
        legal: 'Property registration digitization.',
        environmental: 'Sustainable building regulations.'
      }
    },
    {
      name: 'Deep Tech',
      growth: 31.0, companies: 45, investment: 400, color: '#ec4899',
      source: 'Wamda', url: 'https://wamda.com', lastUpdated: '2025-11-10',
      swot: {
        strengths: ['University research partnerships (KAUST/AUC)', 'High barrier to entry (defensible)'],
        weaknesses: ['Long R&D cycles', 'Scarcity of specialized VC capital'],
        opportunities: ['Climate tech solutions', 'Biotech innovations'],
        threats: ['Scaling manufacturing', 'Global IP competition']
      },
      pestle: {
        political: 'R&D Grants and incentives.',
        economic: 'Long-term ROI profile.',
        social: 'Health & Climate awareness.',
        technological: 'Quantum & Biotech convergence.',
        legal: 'Patent protection frameworks.',
        environmental: 'Circular economy focus.'
      }
    }
  ],
  marketSizing: [
    { name: 'TAM', value: 50, color: '#e2e8f0', label: '$50B Global Potential', source: 'Statista', url: 'https://www.statista.com' },
    { name: 'SAM', value: 20, color: '#94a3b8', label: '$20B MENA Market', source: 'Statista', url: 'https://www.statista.com' },
    { name: 'SOM', value: 5, color: '#0ea5e9', label: '$5B Target Share', source: 'Statista', url: 'https://www.statista.com' },
  ],
  growthForecast: [
    { year: '2023', value: 1.2 },
    { year: '2024', value: 1.5 },
    { year: '2025', value: 2.1 },
    { year: '2026', value: 2.8 },
    { year: '2027', value: 3.9 },
  ],
  competitors: [
    { name: 'Fawry', share: 35, type: 'Leader', strength: 'Distribution', source: 'EGX', url: 'https://egx.com.eg' },
    { name: 'Paymob', share: 20, type: 'Challenger', strength: 'Tech Stack', source: 'Crunchbase', url: 'https://crunchbase.com' },
    { name: 'InstaPay', share: 15, type: 'Disruptor', strength: 'UX', source: 'CBE', url: 'https://cbe.org.eg' },
    { name: 'Others', share: 30, type: 'Fragmented', strength: 'Niche', source: 'Report', url: 'https://example.com' }
  ]
};
