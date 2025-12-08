
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import NewsCard from '../components/NewsCard';
import AIChat from '../components/AIChat';
import { RefreshCw, Sparkles, Zap, BrainCircuit, TrendingUp, DollarSign, Rocket, Tag } from 'lucide-react';

const Latest: React.FC = () => {
    const { language, latestNews, refreshCategoryFeed, dailyTrends } = useApp();
    const t = TRANSLATIONS[language];
    const [isSyncing, setIsSyncing] = useState(false);

    // Take exactly top 12
    const topStories = latestNews.slice(0, 12);

    const handleManualSync = async () => {
        setIsSyncing(true);
        await refreshCategoryFeed();
        setIsSyncing(false);
    };

    const getTopicIcon = (category: string) => {
        switch (category) {
            case 'AI': return <BrainCircuit className="w-5 h-5 text-purple-500" />;
            case 'Finance': return <DollarSign className="w-5 h-5 text-green-500" />;
            case 'Business': return <TrendingUp className="w-5 h-5 text-blue-500" />;
            case 'Entrepreneurship': return <Rocket className="w-5 h-5 text-orange-500" />;
            default: return <Tag className="w-5 h-5 text-slate-500" />;
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn pb-20">
            <div className="flex-1 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-8 h-8 text-yellow-500 fill-current" />
                            {t.sections.latestTitle}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t.sections.topStoriesDesc}</p>
                    </div>
                    <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-nexus-50 dark:bg-nexus-900/30 text-nexus-600 dark:text-nexus-400 rounded-lg hover:bg-nexus-100 dark:hover:bg-nexus-900/50 transition-colors font-medium text-sm border border-nexus-200 dark:border-nexus-800"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Fetching Real-Time Data...' : 'Refresh Feed'}
                    </button>
                </div>

                {/* DAILY TREND ANALYSIS DASHBOARD */}
                {dailyTrends && (
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-indigo-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles className="w-40 h-40" /></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Daily Pulse
                                </span>
                                <span className="text-sm text-slate-500">{dailyTrends.date}</span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Executive Summary</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                                {dailyTrends.executiveSummary}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dailyTrends.topics.map((topic, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                                {getTopicIcon(topic.category)}
                                                {topic.category}
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${topic.sentiment === 'Positive' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                {topic.sentiment}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm text-nexus-600 dark:text-nexus-400 mb-1">{topic.topic}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{topic.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topStories.length === 0 ? (
                        <div className="col-span-3 text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                            <p className="text-slate-500">Fetching latest stories... Click refresh if empty.</p>
                        </div>
                    ) : (
                        topStories.map((item, index) => (
                            <div key={item.id} className="relative group">
                                {index < 3 && (
                                    <div className="absolute -top-2 -left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                                        #{index + 1}
                                    </div>
                                )}
                                <NewsCard item={item} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AIChat contextData={`Page: Latest News. Top headline: ${topStories[0]?.title}.`} />
        </div>
    );
};

export default Latest;
