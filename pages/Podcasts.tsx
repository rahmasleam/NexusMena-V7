
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { PlayCircle, Mic, Search, Headphones, Globe, ExternalLink, Bot, Volume2, X, FileText, Clock, Youtube, Sparkles, ArrowRight, Music, Play, List, Video } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import AIChat from '../components/AIChat';
import { generateSummary, generateSpeech } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

const Podcasts: React.FC = () => {
    const { language, podcasts } = useApp();
    const t = TRANSLATIONS[language];
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [topicFilter, setTopicFilter] = useState('All');
    const [langFilter, setLangFilter] = useState('All');
    
    // Modal State
    const [selectedPodcast, setSelectedPodcast] = useState<any | null>(null);
    const [summaryMode, setSummaryMode] = useState<'text' | 'audio' | null>(null);
    const [generatedSummary, setGeneratedSummary] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    const getYoutubeId = (url: string | undefined): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredPodcasts = podcasts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTopic = topicFilter === 'All' || p.topic === topicFilter;
        const matchesLang = langFilter === 'All' || p.language === langFilter;
        
        return matchesSearch && matchesTopic && matchesLang;
    });

    // Organize by Platform
    const youtubePodcasts = filteredPodcasts.filter(p => p.youtubeUrl);
    const audioPodcasts = filteredPodcasts.filter(p => !p.youtubeUrl && (p.spotifyUrl || p.appleUrl));

    const topicOptions = [
        { label: t.common.all, value: 'All' },
        { label: 'Tech', value: 'Tech' },
        { label: 'AI', value: 'AI' },
        { label: 'Startups', value: 'Startup' },
        { label: 'Entrepreneurship', value: 'Entrepreneurship' },
        { label: 'Business', value: 'Business' }
    ];

    const langOptions = [
        { label: t.common.all, value: 'All' },
        { label: 'Arabic', value: 'ar' },
        { label: 'English', value: 'en' }
    ];

    const openSummaryModal = (podcast: any, playImmediately = false) => {
        setSelectedPodcast(podcast);
        setSummaryMode(null);
        setGeneratedSummary('');
        setIsPlayingVideo(playImmediately);
    };

    const handleGenerateSummary = async (mode: 'text' | 'audio') => {
        if (!selectedPodcast) return;
        setSummaryMode(mode);
        setIsGenerating(true);
        setGeneratedSummary('');

        const summary = await generateSummary(
            `Podcast Title: ${selectedPodcast.title}\nDescription: ${selectedPodcast.description}\nTopic: ${selectedPodcast.topic}`, 
            language
        );

        if (mode === 'text') {
            setGeneratedSummary(summary);
            setIsGenerating(false);
        } else {
            setGeneratedSummary("Generating Audio for: " + summary.substring(0, 50) + "...");
            const base64Audio = await generateSpeech(summary);
            
            if (base64Audio) {
                playAudio(base64Audio);
                setGeneratedSummary(summary);
            } else {
                setGeneratedSummary("Failed to generate audio.");
            }
            setIsGenerating(false);
        }
    };

    const playAudio = async (base64: string) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(ctx);
            
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const dataInt16 = new Int16Array(bytes.buffer);
            const frameCount = dataInt16.length;
            const buffer = ctx.createBuffer(1, frameCount, 24000); 
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();

        } catch (e) {
            console.error("Audio Playback Error", e);
            alert("Could not play audio. Ensure your browser supports AudioContext.");
        }
    };

    const stopAudio = () => {
        if (audioContext) {
            audioContext.close();
            setAudioContext(null);
        }
    };

    const closeModal = () => {
        stopAudio();
        setSelectedPodcast(null);
        setIsPlayingVideo(false);
    };

    return (
        <div className="space-y-10 relative pb-20 animate-fadeIn">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mic className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                        {t.sections.podcastsTitle}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Curated episodes from global and MENA tech leaders.</p>
                 </div>
                 
                 {/* Search Bar */}
                 <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder={t.common.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                 </div>
             </div>

            {/* Link to Deep Analysis Page */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">New: Deep Podcast Analyzer</h3>
                        <p className="text-indigo-100 text-sm opacity-90">Get AI-powered scores and metrics for any podcast link.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/podcast-analysis')}
                    className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    Try Tool <ArrowRight className="w-4 h-4" />
                </button>
            </div>

             <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                <FilterBar activeValue={topicFilter} onSelect={setTopicFilter} options={topicOptions} icon={<Headphones className="w-4 h-4" />} />
                <FilterBar activeValue={langFilter} onSelect={setLangFilter} options={langOptions} icon={<Globe className="w-4 h-4" />} />
             </div>

             {/* SECTION: WATCH ON YOUTUBE */}
             {youtubePodcasts.length > 0 && (
                 <div className="space-y-6">
                     <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Youtube className="w-6 h-6 text-red-600" /> Video Podcasts (YouTube)
                        </h2>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {youtubePodcasts.map(p => (
                             <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full group hover:border-nexus-300 dark:hover:border-nexus-600 transition-all">
                                 <div className="relative h-56 bg-black cursor-pointer group" onClick={() => openSummaryModal(p, true)}>
                                     <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                         <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                                         </div>
                                     </div>
                                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                         <div className="flex items-center gap-2 text-xs text-slate-200 mb-1">
                                             <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">LATEST</span>
                                             <span>{p.duration}</span>
                                             <span>• {p.date}</span>
                                         </div>
                                         <h3 className="text-white font-bold text-lg line-clamp-1 leading-tight">{p.latestEpisodeTitle || p.title}</h3>
                                     </div>
                                 </div>
                                 <div className="p-5 flex-1 flex flex-col">
                                     <div className="mb-3 flex-1">
                                         <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{p.title}</h4>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">{p.topic}</span>
                                         </div>
                                         <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.description}</p>
                                     </div>
                                     
                                     <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                         <button 
                                            onClick={() => openSummaryModal(p, true)}
                                            className="flex-1 py-2 bg-nexus-50 dark:bg-nexus-900/30 text-nexus-600 dark:text-nexus-400 rounded-lg hover:bg-nexus-100 dark:hover:bg-nexus-900/50 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                         >
                                             <PlayCircle className="w-4 h-4" /> Play Episode
                                         </button>
                                         <a 
                                            href={p.youtubeUrl || p.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                         >
                                             <ExternalLink className="w-4 h-4" /> Open Source
                                         </a>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

             {/* SECTION: LISTEN ON SPOTIFY / AUDIO */}
             {audioPodcasts.length > 0 && (
                 <div className="space-y-6 pt-6">
                     <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Headphones className="w-6 h-6 text-green-500" /> Audio Collections
                        </h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {audioPodcasts.map(p => (
                             <div key={p.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col h-full">
                                 <div className="flex items-start gap-4 mb-4">
                                     <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group relative cursor-pointer" onClick={() => openSummaryModal(p, false)}>
                                         <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                             <PlayCircle className="w-8 h-8 text-white" />
                                         </div>
                                     </div>
                                     <div className="flex-1">
                                         <div className="text-xs text-nexus-600 dark:text-nexus-400 font-bold mb-1 uppercase tracking-wide">{p.title}</div>
                                         <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1 text-sm hover:text-nexus-600 cursor-pointer" onClick={() => openSummaryModal(p, false)}>
                                             {p.latestEpisodeTitle || "Latest Episode"}
                                         </h3>
                                         <div className="text-xs text-slate-500">{p.date} • {p.duration}</div>
                                     </div>
                                 </div>
                                 
                                 <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 flex-1">
                                     {p.description}
                                 </p>
                                 
                                 <div className="grid grid-cols-2 gap-2 mt-auto">
                                     <button 
                                        onClick={() => openSummaryModal(p, false)}
                                        className="py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-nexus-50 hover:text-nexus-600 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 col-span-2"
                                     >
                                         <Bot className="w-3 h-3" /> View & Summarize
                                     </button>
                                     {p.spotifyUrl && (
                                         <a href={p.spotifyUrl} target="_blank" rel="noreferrer" className="py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                                             <Music className="w-3 h-3" /> Spotify
                                         </a>
                                     )}
                                     {p.appleUrl && (
                                         <a href={p.appleUrl} target="_blank" rel="noreferrer" className="py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                                             <Mic className="w-3 h-3" /> Apple
                                         </a>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

             {/* SECTION: CHANNELS DIRECTORY */}
             <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-700">
                 <div className="flex items-center gap-2 mb-4">
                    <List className="w-6 h-6 text-nexus-600 dark:text-nexus-400" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Channels Directory</h2>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                     {filteredPodcasts.map(p => (
                         <a 
                            key={p.id} 
                            href={p.channelUrl || p.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-nexus-400 dark:hover:border-nexus-500 hover:shadow-md transition-all group"
                         >
                             <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-slate-100 dark:border-slate-600 group-hover:border-nexus-300 transition-colors">
                                 <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                             </div>
                             <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-2 mb-1 group-hover:text-nexus-600 transition-colors">{p.title}</h4>
                             <div className="mt-auto pt-2">
                                 {p.youtubeUrl ? <Youtube className="w-4 h-4 text-red-600" /> : <Headphones className="w-4 h-4 text-slate-400" />}
                             </div>
                         </a>
                     ))}
                 </div>
             </div>

             <AIChat contextData={`Page: Podcasts. Listing ${filteredPodcasts.length} episodes.`} />

             {/* Smart Summary / Player Modal */}
             {selectedPodcast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                        <div className="p-4 bg-nexus-600 text-white flex justify-between items-center shrink-0">
                            <h3 className="font-bold flex items-center gap-2 truncate max-w-[80%]">
                                {isPlayingVideo ? <PlayCircle className="w-5 h-5"/> : <Bot className="w-5 h-5" />} 
                                {isPlayingVideo ? selectedPodcast.latestEpisodeTitle || selectedPodcast.title : 'Podcast Details'}
                            </h3>
                            <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="overflow-y-auto p-0">
                            {/* Video Player Section */}
                            {isPlayingVideo && getYoutubeId(selectedPodcast.youtubeUrl || selectedPodcast.url || selectedPodcast.audioUrl) ? (
                                <div className="aspect-video w-full bg-black">
                                     <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={`https://www.youtube.com/embed/${getYoutubeId(selectedPodcast.youtubeUrl || selectedPodcast.url || selectedPodcast.audioUrl)}?autoplay=1`} 
                                        title={selectedPodcast.title} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : isPlayingVideo && (
                                <div className="p-8 text-center">
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">This source cannot be embedded directly.</p>
                                    <div className="flex justify-center gap-4">
                                        {selectedPodcast.youtubeUrl && <a href={selectedPodcast.youtubeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"><Youtube className="w-4 h-4"/> Watch on YouTube</a>}
                                        {selectedPodcast.spotifyUrl && <a href={selectedPodcast.spotifyUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"><Music className="w-4 h-4"/> Listen on Spotify</a>}
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Recent Episodes List */}
                                {selectedPodcast.recentEpisodes && selectedPodcast.recentEpisodes.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
                                            <List className="w-4 h-4"/> Recent Episodes
                                        </h4>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            {selectedPodcast.recentEpisodes.map((ep: any, idx: number) => (
                                                <div key={idx} className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                    <div>
                                                        <div className="font-medium text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{ep.title}</div>
                                                        <div className="text-xs text-slate-500">{ep.date} • {ep.duration}</div>
                                                    </div>
                                                    <a href={ep.url} target="_blank" rel="noreferrer" className="text-nexus-600 hover:text-nexus-700 p-2">
                                                        <PlayCircle className="w-5 h-5" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Summary Points List */}
                                {selectedPodcast.summaryPoints && selectedPodcast.summaryPoints.length > 0 && (
                                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4"/> Key Topics
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedPodcast.summaryPoints.map((pt: string, idx: number) => (
                                                <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="text-nexus-600 font-bold">•</span>
                                                    {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* AI Generator Section */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Generate Deep Summary</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Use AI to analyze the content further:</p>

                                    {!summaryMode ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => handleGenerateSummary('text')}
                                                className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-nexus-500 dark:hover:border-nexus-500 hover:bg-nexus-50 dark:hover:bg-nexus-900/30 transition-all"
                                            >
                                                <FileText className="w-6 h-6 text-nexus-600 dark:text-nexus-400" />
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Read Analysis</span>
                                            </button>
                                            <button 
                                                onClick={() => handleGenerateSummary('audio')}
                                                className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-nexus-500 dark:hover:border-nexus-500 hover:bg-nexus-50 dark:hover:bg-nexus-900/30 transition-all"
                                            >
                                                <Volume2 className="w-6 h-6 text-nexus-600 dark:text-nexus-400" />
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Listen (Audio)</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {isGenerating ? (
                                                <div className="flex items-center justify-center py-8 text-nexus-600 dark:text-nexus-400 gap-2">
                                                    <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                                                    Generating...
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto">
                                                    {summaryMode === 'audio' && <div className="mb-2 text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1"><Volume2 className="w-3 h-3" /> Playing Audio...</div>}
                                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line text-sm">{generatedSummary}</p>
                                                </div>
                                            )}
                                            <button onClick={() => setSummaryMode(null)} className="text-sm text-slate-500 dark:text-slate-400 underline">Back to options</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default Podcasts;
