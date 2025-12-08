import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Mail, Globe, ExternalLink } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import AIChat from '../components/AIChat';

const Newsletters: React.FC = () => {
    const { language, regionFilter, setRegionFilter, newsletters } = useApp();
    const t = TRANSLATIONS[language];
    const [freqFilter, setFreqFilter] = useState('All');

    const filtered = newsletters.filter(n => {
        const regionMatch = regionFilter === 'All' || n.region === regionFilter || (regionFilter === 'Egypt' && n.region === 'Egypt');
        const freqMatch = freqFilter === 'All' || n.frequency === freqFilter;
        return regionMatch && freqMatch;
    });

    const regionOptions = [
        { label: 'All Regions', value: 'All' },
        { label: 'Global', value: 'Global' },
        { label: 'Egypt', value: 'Egypt' }
    ];

    const freqOptions = [
        { label: t.common.all, value: 'All' },
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' }
    ];

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                        {t.sections.newslettersTitle}
                    </h1>
                 </div>
             </div>

             <div className="flex gap-4">
                 <FilterBar activeValue={regionFilter} onSelect={(v) => setRegionFilter(v as any)} options={regionOptions} icon={<Globe className="w-4 h-4" />} />
                 <FilterBar activeValue={freqFilter} onSelect={setFreqFilter} options={freqOptions} />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filtered.map(item => (
                     <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col hover:border-nexus-300 dark:hover:border-nexus-500 transition-colors h-full">
                         <div className="flex items-center gap-4 mb-4">
                             <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                             <div>
                                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.title}</h3>
                                 <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{item.frequency} • {item.region}</span>
                             </div>
                         </div>
                         
                         <p className="text-slate-600 dark:text-slate-300 mb-6 flex-1">{item.description}</p>
                         
                         <div className="mt-auto">
                            <a href={item.subscribeLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2 border-2 border-nexus-600 text-nexus-600 dark:text-nexus-400 dark:border-nexus-400 rounded-lg hover:bg-nexus-600 hover:text-white dark:hover:bg-nexus-500 dark:hover:text-white transition-colors font-medium">
                                {t.common.subscribe}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                         </div>
                     </div>
                 ))}
             </div>
             <AIChat contextData="Page: Newsletters." />
        </div>
    );
};

export default Newsletters;