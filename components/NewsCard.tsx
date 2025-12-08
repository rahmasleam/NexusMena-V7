import React, { useState } from 'react';
import { ExternalLink, Bookmark, Globe, Bot } from 'lucide-react';
import { NewsItem } from '../types';
import { useApp } from '../context/AppContext';
import { generateSummary, translateText } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const { language, favorites, toggleFavorite } = useApp();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const t = TRANSLATIONS[language];
  const isSaved = favorites.includes(item.id);
  const navigate = useNavigate();

  const handleSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSummarizing(true);
    const result = await generateSummary(`${item.title}\n${item.description}`, language);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedTitle) {
      setTranslatedTitle(null);
      return;
    }
    const result = await translateText(item.title, 'ar');
    setTranslatedTitle(result);
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  }

  const handleReadClick = () => {
    navigate(`/article/${item.id}`);
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      onClick={handleReadClick}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
        <span className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm`}>
          {item.category}
        </span>
        {item.region === 'Egypt' && (
          <span className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} px-2 py-1 bg-egypt-red text-white text-xs font-bold rounded-md shadow-sm`}>
            EGYPT
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-nexus-600 dark:text-nexus-400 uppercase tracking-wider">{item.source}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{item.date}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-nexus-600 dark:group-hover:text-nexus-400 transition-colors">
          {language === 'ar' && translatedTitle ? translatedTitle : (language === 'ar' && item.titleAr ? item.titleAr : item.title)}
        </h3>

        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-1">
          {item.description}
        </p>

        {summary && (
          <div className="mb-4 p-3 bg-nexus-50 dark:bg-nexus-900/30 rounded-lg text-sm text-nexus-900 dark:text-nexus-100 border border-nexus-100 dark:border-nexus-800">
            <div className="flex items-center gap-1 mb-1 font-semibold text-nexus-700 dark:text-nexus-300">
              <Bot className="w-4 h-4" /> AI Summary
            </div>
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={handleFavorite} className={`p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isSaved ? 'text-nexus-600 dark:text-nexus-400 fill-current' : 'text-slate-400 dark:text-slate-500'}`}>
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleSummary}
              disabled={isSummarizing}
              className={`p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors ${summary ? 'text-nexus-600 dark:text-nexus-400' : 'text-slate-400 dark:text-slate-500 hover:text-nexus-600'}`}
              title={t.common.aiSummary}
            >
              {isSummarizing ? <span className="animate-spin block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"></span> : <Bot className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleExternalLink}
            className="inline-flex items-center gap-1 text-sm font-medium text-nexus-600 dark:text-nexus-400 hover:text-nexus-700 dark:hover:text-nexus-300 transition-colors p-2"
          >
            {t.common.readMore}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;