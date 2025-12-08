import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Calendar, MapPin, Video, ExternalLink, Users, Globe } from 'lucide-react';
import AIChat from '../components/AIChat';
import FilterBar from '../components/FilterBar';

const Events: React.FC = () => {
  const { language, regionFilter, setRegionFilter, events } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const t = TRANSLATIONS[language];

  const filteredEvents = events.filter(item => {
    const regionMatch = regionFilter === 'All' || item.region === regionFilter || (regionFilter === 'Egypt' && item.region === 'MENA');
    const typeMatch = typeFilter === 'All' || item.type === typeFilter;
    return regionMatch && typeMatch;
  });

  const typeOptions = [
      { label: t.common.all, value: 'All' },
      { label: 'Conferences', value: 'Conference' },
      { label: 'Meetups', value: 'Meetup' },
      { label: 'Hackathons', value: 'Hackathon' },
      { label: 'Workshops', value: 'Workshop' }
  ];

  const regionOptions = [
      { label: 'All Regions', value: 'All' },
      { label: 'Global', value: 'Global' },
      { label: 'Egypt', value: 'Egypt' }
  ];

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-nexus-600 dark:text-nexus-400" />
                    {t.sections.eventsTitle}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Updated daily. Register for upcoming tech gatherings.</p>
             </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
             <FilterBar activeValue={regionFilter} onSelect={(v) => setRegionFilter(v as any)} options={regionOptions} icon={<Globe className="w-4 h-4" />} />
             <FilterBar activeValue={typeFilter} onSelect={setTypeFilter} options={typeOptions} icon={<Users className="w-4 h-4" />} />
        </div>

        <div className="space-y-4">
            {filteredEvents.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No events found.</p>
                 </div>
            ) : filteredEvents.map(event => (
                <div key={event.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all group">
                    {/* Date Box */}
                    <div className="md:w-32 bg-nexus-50 dark:bg-nexus-900/30 text-nexus-700 dark:text-nexus-300 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 group-hover:bg-nexus-600 group-hover:text-white transition-colors">
                        <span className="text-3xl font-bold">{new Date(event.startDate).getDate()}</span>
                        <span className="text-sm font-medium uppercase">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xs mt-1 opacity-75">{new Date(event.startDate).getFullYear()}</span>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{event.title}</h3>
                                <div className="flex gap-2">
                                     <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{event.type}</span>
                                     {event.region === 'Egypt' && <span className="bg-egypt-red text-white text-[10px] px-2 py-1 rounded font-bold self-center">EGYPT</span>}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    {event.isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                    <span>{event.location}</span>
                                </div>
                                <span>•</span>
                                <span>{event.startDate === event.endDate ? '1 Day' : `${new Date(event.endDate).getDate() - new Date(event.startDate).getDate()} Days`}</span>
                            </div>

                            <p className="mt-3 text-slate-600 dark:text-slate-300">{event.description}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <a href={event.registrationLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-700 transition-colors text-sm font-medium">
                                {t.common.register}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <AIChat contextData={`Page: Events. Listing ${filteredEvents.length} events.`} />
    </div>
  );
};

export default Events;