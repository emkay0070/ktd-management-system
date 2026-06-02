import React from 'react';
import { Star, Shield, Heart, CheckCircle2, ChevronRight, UserCircle, Calendar as CalendarIcon } from 'lucide-react';

const iconMap = {
    'Star': Star,
    'Shield': Shield,
    'Heart': Heart,
    'CheckCircle2': CheckCircle2,
    'UserCircle': UserCircle,
    'Calendar': CalendarIcon
};

export default function TimelineHistory({ events = [] }) {
    if (events.length === 0) {
        return (
            <div className="py-8 flex flex-col items-center justify-center text-center opacity-30">
                <div className="w-1 px-1 bg-white/5 h-12 mb-4"></div>
                <div className="text-xs">No timeline events recorded yet.</div>
            </div>
        );
    }

    return (
        <div className="py-6 px-4">
            <div className="relative border-l border-white/10 ml-4 space-y-8">
                {events.map((event, index) => {
                    const Icon = iconMap[event.icon] || Star;
                    const date = new Date(event.event_date);
                    
                    return (
                        <div key={event.id} className="relative pl-6 group">
                            <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-burgundy-900 border-2 border-burgundy-500 flex items-center justify-center text-burgundy-400 group-hover:scale-110 group-hover:bg-burgundy-500 group-hover:text-white transition-all">
                                <Icon size={14} />
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                    <time className="text-xs text-gray-500 font-mono">
                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </time>
                                </div>
                                {event.description && (
                                    <p className="text-sm text-gray-400">{event.description}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
