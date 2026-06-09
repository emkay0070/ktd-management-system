import React, { useState, useEffect } from 'react';
import { Users, Circle, Zap, Clock } from 'lucide-react';

export default function LivePresence({ channelId, auth }) {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!channelId) return;

        const channel = window.Echo.join(`communication.channel.${channelId}`)
            .here((users) => {
                setOnlineUsers(users);
            })
            .joining((user) => {
                setOnlineUsers(prev => [...prev, user]);
            })
            .leaving((user) => {
                setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
            });

        return () => {
            window.Echo.leave(`communication.channel.${channelId}`);
        };
    }, [channelId]);

    return (
        <div className="panel border-white/5 bg-[#16161d] overflow-hidden">
            <div className="panel__header flex items-center justify-between border-b border-white/5 p-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                        <Users size={18} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-tight">Active Staff</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Real-time presence</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{onlineUsers.length} Online</span>
                </div>
            </div>
            
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {onlineUsers.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 italic text-xs">
                        Connecting to presence server...
                    </div>
                ) : (
                    onlineUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-burgundy-900/30 flex items-center justify-center text-burgundy-400 text-[10px] font-black border border-burgundy-500/20">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#16161d]"></div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white group-hover:text-burgundy-400 transition-colors">{user.name}</div>
                                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{user.role || 'Staff'}</div>
                                </div>
                            </div>
                            <div className="text-[9px] text-gray-700 font-black uppercase flex items-center gap-1">
                                <Clock size={10} /> Active
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5">
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] text-gray-500 font-black uppercase tracking-widest transition-all">
                    Broadcast Announcement
                </button>
            </div>
        </div>
    );
}
