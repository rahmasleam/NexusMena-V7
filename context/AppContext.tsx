
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Language, Region, ChatMessage, NewsItem, EventItem, PodcastItem, NewsletterItem, MarketMetric, PartnerItem, ResourceItem, PodcastAnalysis, IndustryData, TrendAnalysis } from '../types';
import { EVENTS, PODCASTS, NEWSLETTERS, MARKET_DATA_INDICES, PARTNERS, RESOURCES, INDUSTRY_DATA } from '../constants';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { analyzeTrends } from '../services/geminiService';
import { fetchAndProcessFeeds } from '../utils/rssFetcher';

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  regionFilter: Region | 'All';
  setRegionFilter: (r: Region | 'All') => void;
  savedChats: { id: string; title: string; messages: ChatMessage[]; date: string }[];
  saveCurrentChat: (messages: ChatMessage[]) => void;
  savedAnalyses: PodcastAnalysis[];
  saveAnalysis: (analysis: PodcastAnalysis) => void;
  deleteAnalysis: (id: string) => void;
  addItem: (category: string, item: any) => void;
  updateItem: (category: string, item: any) => void;
  deleteItem: (id: string, category: string) => void;
  addResource: (item: ResourceItem) => void;
  getItemById: (id: string) => any | null;
  refreshCategoryFeed: (category?: 'latest' | 'startup') => Promise<void>;

  // Data State
  latestNews: NewsItem[];
  startupNews: NewsItem[];
  groupedStartups: Record<string, NewsItem[]>;
  events: EventItem[];
  podcasts: PodcastItem[];
  newsletters: NewsletterItem[];
  marketIndices: MarketMetric[];
  partners: PartnerItem[];
  resources: ResourceItem[];
  industryData: IndustryData;
  dailyTrends: TrendAnalysis | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // PERSISTENT STATE INITIALIZATION
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('nexus_language') as Language) || 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nexus_theme') as 'light' | 'dark') || 'light';
  });

  const [user, setUser] = useState<User | null>(null); // Real user state
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // MOCK USER PERSISTENCE
  const [mockUser, setMockUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('nexus_mock_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_favorites') || '[]'); } catch { return []; }
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('nexus_notifications') === 'true';
  });

  const [regionFilter, setRegionFilter] = useState<Region | 'All'>('All');

  const [savedChats, setSavedChats] = useState<{ id: string; title: string; messages: ChatMessage[]; date: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_saved_chats') || '[]'); } catch { return []; }
  });

  const [savedAnalyses, setSavedAnalyses] = useState<PodcastAnalysis[]>([]);

  // INITIAL LOAD WITH CACHE CHECK
  const [latestNews, setLatestNews] = useState<NewsItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_latest_news') || '[]'); } catch { return []; }
  });
  const [startupNews, setStartupNews] = useState<NewsItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_startup_news') || '[]'); } catch { return []; }
  });
  const [groupedStartups, setGroupedStartups] = useState<Record<string, NewsItem[]>>(() => {
    try { return JSON.parse(localStorage.getItem('nexus_grouped_startups') || '{}'); } catch { return {}; }
  });

  // Resources with Persistence
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const stored = localStorage.getItem('nexus_resources');
      return stored ? JSON.parse(stored) : RESOURCES;
    } catch { return RESOURCES; }
  });

  const [events, setEvents] = useState<EventItem[]>(EVENTS);

  // Podcasts with Persistence
  const [podcasts, setPodcasts] = useState<PodcastItem[]>(() => {
    try {
      const stored = localStorage.getItem('nexus_podcasts');
      return stored ? JSON.parse(stored) : PODCASTS;
    } catch { return PODCASTS; }
  });

  const [newsletters, setNewsletters] = useState<NewsletterItem[]>(NEWSLETTERS);
  const [marketIndices, setMarketIndices] = useState<MarketMetric[]>(MARKET_DATA_INDICES);
  const [partners, setPartners] = useState<PartnerItem[]>(PARTNERS);
  const [industryData, setIndustryData] = useState<IndustryData>(INDUSTRY_DATA);
  const [dailyTrends, setDailyTrends] = useState<TrendAnalysis | null>(null);

  // AUTO-REFRESH LOGIC
  useEffect(() => {
    const lastFetch = localStorage.getItem('nexus_last_fetch');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastFetch || (now - parseInt(lastFetch) > oneDay)) {
      refreshCategoryFeed();
    }
  }, []);

  // PERSISTENCE EFFECTS
  useEffect(() => localStorage.setItem('nexus_language', language), [language]);
  useEffect(() => localStorage.setItem('nexus_theme', theme), [theme]);
  useEffect(() => localStorage.setItem('nexus_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('nexus_notifications', String(notificationsEnabled)), [notificationsEnabled]);
  useEffect(() => localStorage.setItem('nexus_saved_chats', JSON.stringify(savedChats)), [savedChats]);

  // Theme Effect (Class Application)
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // ... (Firebase user logic remains the same)
        const u: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          favorites: favorites, // Use local favorites
          preferences: { notifications: notificationsEnabled, regions: ['Global'] },
          savedChats: savedChats,
          savedAnalyses: []
        };
        setUser(u);
        setIsAdmin(firebaseUser.email === 'admin@edafaa.com');
      } else {
        // Fallback to Mock User if no Firebase User
        if (mockUser) {
          setUser({
            ...mockUser,
            favorites: favorites, // Sync with local persistence
            savedChats: savedChats
          });
          setIsAdmin(mockUser.email === 'admin@edafaa.com');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [mockUser, favorites, savedChats, notificationsEnabled]); // Re-run if these change to keep User object updated

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  const toggleFavorite = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      // Mock Login Fallback
      if (email === 'admin@edafaa.com') {
        const adminUser: User = { id: 'admin-demo-bypass', name: 'Admin User', email: email, favorites: [], preferences: { notifications: true, regions: ['Global'] }, savedChats: [], savedAnalyses: [] };
        localStorage.setItem('nexus_mock_user', JSON.stringify(adminUser)); // Persist
        setMockUser(adminUser);
        return;
      }
      if (email === 'guest@nexus.demo') {
        const guestUser: User = { id: 'guest-demo-bypass', name: 'Guest User', email: email, favorites: [], preferences: { notifications: true, regions: ['Global'] }, savedChats: [], savedAnalyses: [] };
        localStorage.setItem('nexus_mock_user', JSON.stringify(guestUser)); // Persist
        setMockUser(guestUser);
        return;
      }
      throw error;
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) { await updateProfile(userCredential.user, { displayName: name }); }
  };

  const resetPassword = async (email: string) => { await sendPasswordResetEmail(auth, email); };

  const logout = async () => {
    try { await signOut(auth); } catch (e) { console.error("SignOut Error", e); }
    localStorage.removeItem('nexus_mock_user'); // Clear persist
    setMockUser(null);
    setUser(null);
    setFavorites([]);
    setIsAdmin(false);
    setSavedAnalyses([]);
  };

  const saveCurrentChat = (messages: ChatMessage[]) => {
    if (messages.length === 0) return;

    setSavedChats(prev => {
      // Logic: If the chat being saved matches the MOST RECENT saved chat (by content similarity or ID tracking), update it.
      // Since we don't have a persistent ID for the *active* session passed in, we can infer it or just update the top one if it's "fresh" (e.g. created today).
      // A better approach for this app's simple structure: 
      // If the user just loaded the latest chat, we are editing indices[0].

      const newTitle = `Chat ${new Date().toLocaleDateString()} - ${messages[0]?.content.substring(0, 20)}...`;
      const updatedChat = { id: Date.now().toString(), title: newTitle, messages: messages, date: new Date().toISOString() };

      // Simple heuristic: If the top chat matches the start of this conversation, update it.
      if (prev.length > 0 && prev[0].messages[0]?.content === messages[0]?.content) {
        const updated = [...prev];
        updated[0] = { ...updated[0], messages: messages, date: new Date().toISOString() }; // Update existing
        return updated;
      }

      return [updatedChat, ...prev]; // Create new
    });
  };

  const saveAnalysis = (analysis: PodcastAnalysis) => setSavedAnalyses(prev => [analysis, ...prev]);
  const deleteAnalysis = (id: string) => setSavedAnalyses(prev => prev.filter(a => a.id !== id));

  const addItem = (category: string, item: any) => {
    const newItem = { ...item, id: Date.now().toString() };
    switch (category) {
      case 'latest': setLatestNews(prev => { const updated = [newItem, ...prev]; localStorage.setItem('nexus_latest_news', JSON.stringify(updated)); return updated; }); break;
      case 'startup': setStartupNews(prev => { const updated = [newItem, ...prev]; localStorage.setItem('nexus_startup_news', JSON.stringify(updated)); return updated; }); break;
      // ... other cases
    }
  };

  const updateItem = (category: string, item: any) => { /* ... */ };

  const deleteItem = (id: string, category: string) => {
    if (category === 'resources') {
      setResources(prev => {
        const updated = prev.filter(i => i.id !== id);
        localStorage.setItem('nexus_resources', JSON.stringify(updated)); // Persist delete
        return updated;
      });
    }
    // ... handle other categories
  };

  const addResource = (item: ResourceItem) => {
    setResources(prev => {
      const updated = [item, ...prev];
      localStorage.setItem('nexus_resources', JSON.stringify(updated)); // Persist add
      return updated;
    });
  };

  const getItemById = (id: string) => {
    const allItems = [...latestNews, ...startupNews, ...events, ...podcasts, ...newsletters, ...partners, ...resources];
    return allItems.find(item => item.id === id) || null;
  };

  // REFRESH FEED - Passing Dynamic Resources to Fetcher
  const refreshCategoryFeed = async (category?: 'latest' | 'startup') => {
    console.log("Fetching Real-Time Feeds using dynamic resources...");

    try {
      // Pass the current state resources (which includes Admin added ones)
      const { latest, startups, podcasts: fetchedPodcasts } = await fetchAndProcessFeeds(resources);

      if (latest.length > 0) {
        setLatestNews(latest);
        localStorage.setItem('nexus_latest_news', JSON.stringify(latest));

        if (!dailyTrends && latest.length > 0) {
          const trends = await analyzeTrends(latest.slice(0, 10));
          if (trends) setDailyTrends(trends);
        }
      }

      setGroupedStartups(startups);
      localStorage.setItem('nexus_grouped_startups', JSON.stringify(startups));

      const flatStartups = Object.values(startups).flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setStartupNews(flatStartups);
      localStorage.setItem('nexus_startup_news', JSON.stringify(flatStartups));

      // Handle Podcasts - Merge with existing to avoid overwriting
      if (fetchedPodcasts.length > 0) {
        setPodcasts(prev => {
          const existingUrls = new Set(prev.map(p => p.url));
          const newUnique = fetchedPodcasts.filter(p => !existingUrls.has(p.url));
          const merged = [...newUnique, ...prev];
          localStorage.setItem('nexus_podcasts', JSON.stringify(merged));
          return merged;
        });
      }

      localStorage.setItem('nexus_last_fetch', Date.now().toString());
      console.log("Sync Complete.");

    } catch (e) {
      console.error("Sync Failed", e);
    }
  };

  return (
    <AppContext.Provider value={{
      user, isAdmin, loading, theme, toggleTheme, language, toggleLanguage,
      favorites, toggleFavorite, notificationsEnabled, toggleNotifications,
      login, signup, resetPassword, logout, regionFilter, setRegionFilter,
      savedChats, saveCurrentChat, savedAnalyses, saveAnalysis, deleteAnalysis,
      addItem, updateItem, deleteItem, addResource, getItemById, refreshCategoryFeed,
      latestNews, startupNews, groupedStartups, events, podcasts, newsletters, marketIndices, partners, resources, industryData, dailyTrends
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
