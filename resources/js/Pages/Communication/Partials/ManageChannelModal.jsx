import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import { useForm, router } from '@inertiajs/react';
import { X, UserPlus, Search, Check, Settings, Trash2, UserMinus } from 'lucide-react';
import axios from 'axios';

export default function ManageChannelModal({ show, onClose, channel, auth }) {
    if (!channel) return null;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState(false);

    // Check if current user is an admin of this channel
    const currentUserParticipant = channel.participants?.find(p => p.user_id === auth.user.id);
    const isAdmin = currentUserParticipant?.role === 'admin';
    const isGroupChannel = channel.type === 'group';

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await axios.get(route('communication.users.search', { q: query }));
            // Filter out users already in the channel
            const filtered = response.data.filter(u => 
                !channel.participants.find(p => p.user_id === u.id)
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddUser = async (user) => {
        setAdding(true);
        try {
            await axios.post(route('communication.channels.participants.store', channel.slug), {
                user_ids: [user.id]
            });
            
            // Refresh page to get updated participants
            router.reload({ only: ['channels'] });
            
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error("Failed to add user", error);
            alert("Failed to add user.");
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!confirm('Are you sure you want to remove this user from the channel?')) return;
        
        try {
            await axios.delete(route('communication.channels.participants.destroy', { channel: channel.slug, user: userId }));
            
            if (userId === auth.user.id) {
                // If leaving the channel
                onClose();
                window.location.href = route('communication.index');
            } else {
                // Refresh to update list
                router.reload({ only: ['channels'] });
            }
        } catch (error) {
            console.error("Failed to remove user", error);
            alert("Failed to remove user.");
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="bg-[#16161d] rounded-xl overflow-hidden border border-white/10 text-white">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="text-burgundy-500" />
                        Channel Details
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white font-bold text-2xl mb-3">
                            {channel.name?.substring(0, 1) || '#'}
                        </div>
                        <h3 className="text-lg font-bold">{channel.name || 'Direct Message'}</h3>
                        {channel.description && <p className="text-sm text-gray-400 mt-1">{channel.description}</p>}
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center justify-between">
                            <span>Members ({channel.participants?.length || 0})</span>
                        </h4>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {channel.participants?.map(participant => (
                                <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                            {participant.user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium flex items-center gap-2">
                                                {participant.user.name}
                                                {participant.role === 'admin' && (
                                                    <span className="text-[9px] bg-burgundy-500/20 text-burgundy-400 px-1.5 py-0.5 rounded font-black uppercase">Admin</span>
                                                )}
                                                {participant.user_id === auth.user.id && (
                                                    <span className="text-[9px] bg-gray-500/20 text-gray-400 px-1.5 py-0.5 rounded font-black uppercase">You</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {(isAdmin || participant.user_id === auth.user.id) && isGroupChannel && (
                                        <button 
                                            onClick={() => handleRemoveUser(participant.user_id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title={participant.user_id === auth.user.id ? "Leave Channel" : "Remove User"}
                                        >
                                            {participant.user_id === auth.user.id ? <Trash2 size={16} /> : <UserMinus size={16} />}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isAdmin && isGroupChannel && (
                        <div className="pt-4 border-t border-white/5">
                            <h4 className="text-sm font-bold text-gray-300 mb-3">Add Members</h4>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 p-3 text-white focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 text-sm"
                                    placeholder="Search users to add..."
                                />
                                {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-burgundy-500 border-t-transparent rounded-full animate-spin" />}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-[#0f0f15] border border-white/5 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                                    {searchResults.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                            <div>
                                                <div className="font-medium text-sm">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                            <button
                                                onClick={() => handleAddUser(user)}
                                                disabled={adding}
                                                className="px-3 py-1 bg-burgundy-600 hover:bg-burgundy-500 text-white text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
